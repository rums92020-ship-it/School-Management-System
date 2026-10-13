import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  authorizeClass,
  databaseUnavailableResponse,
  deleteFutureUnattendedSessionsForSlot,
  insertFutureSessionsForSlot,
  isNinetyMinutes,
  jsonError,
  leadershipRoles,
  parseUuid,
  sessionTimezone,
  termManagerRoles,
  validTime,
  validWeekday,
} from "../../../lib/timetable";

export const runtime = "nodejs";

const slotEditors = [...termManagerRoles];

function normalizeSlot(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const termId = parseUuid(body.term_id);
  const classId = parseUuid(body.class_id);
  const subjectId = parseUuid(body.subject_id);
  if (!termId || !classId || !subjectId || !validWeekday(body.weekday) ||
      !Number.isInteger(body.period_no) || body.period_no < 1 || body.period_no > 5 ||
      !validTime(body.start_time) || !validTime(body.end_time) ||
      !isNinetyMinutes(body.start_time, body.end_time) ||
      typeof body.teacher_id !== "string" || !body.teacher_id.trim() || body.teacher_id.length > 40 ||
      (body.room != null && (typeof body.room !== "string" || body.room.trim().length > 100))) return null;
  return {
    termId,
    classId,
    subjectId,
    weekday: body.weekday,
    periodNo: body.period_no,
    startTime: body.start_time,
    endTime: body.end_time,
    teacherId: body.teacher_id.trim(),
    room: body.room?.trim() || null,
  };
}

async function findSlotConflict(client, slot, term, excludeId = null) {
  const result = await client.query(
    `SELECT slots.id, slots.class_id, classes.name AS class_name,
       slots.teacher_id, slots.room
     FROM timetable_slots AS slots
     JOIN classes ON classes.id = slots.class_id
     WHERE slots.term_id = $1::uuid
       AND slots.day_of_week = $2
       AND slots.is_active = TRUE
       AND slots.valid_from <= $3
       AND COALESCE(slots.valid_to, $4::date) >= $4
       AND slots.start_time < $5::time
       AND slots.end_time > $6::time
       AND ($7::uuid IS NULL OR slots.id <> $7)
       AND (slots.class_id = $8::uuid OR slots.teacher_id = $9
         OR ($10::text IS NOT NULL AND slots.room = $10))
     ORDER BY slots.id
     LIMIT 1`,
    [slot.termId, slot.weekday, term.end_date, term.start_date, slot.endTime, slot.startTime,
      excludeId, slot.classId, slot.teacherId, slot.room],
  );
  return result.rows[0] || null;
}

async function validateSlot(client, slot, user, excludeId = null) {
  const termResult = await client.query(
    "SELECT id, academic_year, start_date, end_date FROM terms WHERE id = $1",
    [slot.termId],
  );
  const term = termResult.rows[0];
  if (!term) return { response: jsonError("Term not found.", 404) };

  const classResult = await client.query(
    `SELECT classes.id, classes.name, classes.shift_id, shifts.code AS shift_code,
       shifts.days_of_week
     FROM classes JOIN shifts ON shifts.id = classes.shift_id
     WHERE classes.id = $1 AND classes.is_active = TRUE`,
    [slot.classId],
  );
  const classRow = classResult.rows[0];
  if (!classRow) return { response: jsonError("Active class with a configured shift not found.", 404) };
  if (!(await authorizeClass(client, user, slot.classId))) {
    return { response: jsonError("You do not have permission to access this class.", 403) };
  }
  if (!classRow.days_of_week.includes(slot.weekday)) {
    return { response: jsonError("The selected weekday is not part of this class shift.", 400) };
  }

  const period = await client.query(
    `SELECT id FROM shift_periods
     WHERE shift_id = $1 AND period_no = $2
       AND start_time = $3::time AND end_time = $4::time`,
    [classRow.shift_id, slot.periodNo, slot.startTime, slot.endTime],
  );
  if (!period.rowCount) {
    return { response: jsonError("The selected time does not match a 90-minute period for this class shift.", 400) };
  }

  const subject = await client.query(
    "SELECT id FROM subjects WHERE id = $1 AND is_active = TRUE",
    [slot.subjectId],
  );
  if (!subject.rowCount) return { response: jsonError("Active subject not found.", 404) };
  const assignedTeacher = await client.query(
    "SELECT 1 FROM class_teachers WHERE class_id = $1 AND teacher_id = $2",
    [slot.classId, slot.teacherId],
  );
  if (!assignedTeacher.rowCount) {
    return { response: jsonError("The selected teacher is not assigned to this class.", 400) };
  }

  const conflict = await findSlotConflict(client, slot, term, excludeId);
  if (conflict) {
    let detail;
    if (conflict.class_id === slot.classId) detail = `class ${conflict.class_name} (${conflict.class_id})`;
    else if (conflict.teacher_id === slot.teacherId) detail = `teacher ${conflict.teacher_id}`;
    else detail = `room ${conflict.room}`;
    return {
      response: NextResponse.json({
        error: `Timetable conflict with ${detail}. កាលវិភាគប៉ះទង្គិចជាមួយ ${detail}។`,
        conflict,
      }, { status: 409 }),
    };
  }
  return { term, response: null };
}

function scopedSlotFilter(user, values) {
  if (["director", "deputy_director", "office_head", "office_deputy", "office_staff"].includes(user.role)) return "";
  if (user.role === "teacher") {
    if (!user.teacher_id) return " AND FALSE";
    values.push(user.teacher_id);
    return ` AND timetable_slots.class_id IN
      (SELECT class_id FROM class_teachers WHERE teacher_id = $${values.length})`;
  }
  if (user.role === "student") {
    if (!user.student_id) return " AND FALSE";
    values.push(user.student_id);
    return ` AND timetable_slots.class_id IN
      (SELECT class_id FROM class_students WHERE student_id = $${values.length})`;
  }
  if (user.role === "guardian") {
    if (!user.id) return " AND FALSE";
    values.push(user.id);
    return ` AND timetable_slots.class_id IN (
      SELECT class_students.class_id FROM class_students
      JOIN guardian_students ON guardian_students.student_id = class_students.student_id
      WHERE guardian_students.guardian_user_id = $${values.length}
    )`;
  }
  if ((user.role === "dept_head" || user.role === "dept_deputy") && user.department) {
    values.push(user.department);
    return ` AND timetable_slots.subject_id IN
      (SELECT id FROM subjects WHERE department = $${values.length})`;
  }
  return " AND FALSE";
}

export async function GET(request) {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const url = new URL(request.url);
    const termRaw = url.searchParams.get("term_id");
    const classRaw = url.searchParams.get("class_id");
    const termId = termRaw ? parseUuid(termRaw) : null;
    const classId = classRaw ? parseUuid(classRaw) : null;
    if ((termRaw && !termId) || (classRaw && !classId)) {
      return jsonError("Term and class IDs must be valid UUIDs.", 400);
    }
    const values = [termId, classId];
    const scope = scopedSlotFilter(user, values);
    const result = await getPool().query(
      `SELECT timetable_slots.id AS slot_id, timetable_slots.term_id,
        timetable_slots.class_id, classes.name AS class_name,
        classes.shift_id, shifts.code AS shift_code,
        timetable_slots.day_of_week AS weekday, shift_periods.period_no,
        timetable_slots.start_time, timetable_slots.end_time,
        timetable_slots.subject_id, subjects.name AS subject_name,
        timetable_slots.teacher_id, teachers.name AS teacher_name,
        timetable_slots.room, timetable_slots.valid_from, timetable_slots.valid_to
       FROM timetable_slots
       JOIN classes ON classes.id = timetable_slots.class_id
       JOIN shifts ON shifts.id = classes.shift_id
       JOIN subjects ON subjects.id = timetable_slots.subject_id
       JOIN teachers ON teachers.teacher_id = timetable_slots.teacher_id
       LEFT JOIN shift_periods ON shift_periods.shift_id = classes.shift_id
         AND shift_periods.start_time = timetable_slots.start_time
         AND shift_periods.end_time = timetable_slots.end_time
       WHERE ($1::uuid IS NULL OR timetable_slots.term_id = $1)
         AND ($2::uuid IS NULL OR timetable_slots.class_id = $2)
         AND timetable_slots.is_active = TRUE
         ${scope}
       ORDER BY timetable_slots.day_of_week, timetable_slots.start_time, classes.name`,
      values,
    );
    return NextResponse.json({ slots: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load timetable slots.");
  }
}

export async function POST(request) {
  try {
    const { user, response } = await requireRole(slotEditors);
    if (response) return response;
    const slot = normalizeSlot(await request.json());
    if (!slot) return jsonError("Provide a valid term, class, weekday, period, subject, teacher, and 90-minute start/end time.", 400);
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const { term, response: validationResponse } = await validateSlot(client, slot, user);
      if (validationResponse) {
        await client.query("ROLLBACK");
        return validationResponse;
      }
      const result = await client.query(
        `INSERT INTO timetable_slots
          (term_id, class_id, day_of_week, start_time, end_time,
           subject_id, teacher_id, room, valid_from, valid_to, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
         RETURNING id AS slot_id, term_id, class_id, day_of_week AS weekday,
           start_time, end_time, subject_id, teacher_id, room, valid_from, valid_to`,
        [slot.termId, slot.classId, slot.weekday, slot.startTime, slot.endTime,
          slot.subjectId, slot.teacherId, slot.room, term.start_date, term.end_date],
      );
      await insertFutureSessionsForSlot(client, result.rows[0].slot_id);
      await client.query("COMMIT");
      return NextResponse.json({ slot: result.rows[0] }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") return jsonError("A matching timetable slot already exists.", 409);
      if (error.code === "23503") return jsonError("A selected class, term, subject, or teacher assignment no longer exists.", 409);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not create timetable slot.");
  }
}

export async function PATCH(request) {
  try {
    const { user, response } = await requireRole(slotEditors);
    if (response) return response;
    const body = await request.json();
    const slotId = parseUuid(body?.slot_id);
    const slot = normalizeSlot(body);
    if (!slotId || !slot) return jsonError("Provide a valid slot ID and timetable slot values.", 400);
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query(
        "SELECT id FROM timetable_slots WHERE id = $1 FOR UPDATE",
        [slotId],
      );
      if (!existing.rowCount) {
        await client.query("ROLLBACK");
        return jsonError("Timetable slot not found.", 404);
      }
      const protectedSession = await client.query(
        `SELECT 1 FROM class_sessions AS session
         WHERE session.slot_id = $1
           AND (session.session_date < (NOW() AT TIME ZONE $2)::date
             OR EXISTS (
               SELECT 1 FROM session_attendance
               WHERE session_attendance.session_id = session.id
             ))
         LIMIT 1`,
        [slotId, sessionTimezone],
      );
      const old = await client.query("SELECT class_id, term_id FROM timetable_slots WHERE id = $1", [slotId]);
      if (protectedSession.rowCount &&
          (old.rows[0].term_id !== slot.termId || old.rows[0].class_id !== slot.classId)) {
        await client.query("ROLLBACK");
        return jsonError("A slot with past or attended sessions cannot be moved to another class or term.", 409);
      }
      const { term, response: validationResponse } = await validateSlot(client, slot, user, slotId);
      if (validationResponse) {
        await client.query("ROLLBACK");
        return validationResponse;
      }
      await deleteFutureUnattendedSessionsForSlot(client, slotId);
      const result = await client.query(
        `UPDATE timetable_slots
         SET term_id = $1, class_id = $2, day_of_week = $3,
           start_time = $4, end_time = $5, subject_id = $6, teacher_id = $7,
           room = $8, valid_from = $9, valid_to = $10, is_active = TRUE
         WHERE id = $11
         RETURNING id AS slot_id, term_id, class_id, day_of_week AS weekday,
           start_time, end_time, subject_id, teacher_id, room, valid_from, valid_to`,
        [slot.termId, slot.classId, slot.weekday, slot.startTime, slot.endTime,
          slot.subjectId, slot.teacherId, slot.room, term.start_date, term.end_date, slotId],
      );
      await insertFutureSessionsForSlot(client, slotId);
      await client.query("COMMIT");
      return NextResponse.json({ slot: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") return jsonError("A matching timetable slot already exists.", 409);
      if (error.code === "23503") return jsonError("A selected class, term, subject, or teacher assignment no longer exists.", 409);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not update timetable slot.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const id = parseUuid(new URL(request.url).searchParams.get("slot_id"));
    if (!id) return jsonError("Provide a valid timetable slot ID.", 400);
    const result = await getPool().query(
      `UPDATE timetable_slots SET is_active = FALSE
       WHERE id = $1
         AND NOT EXISTS (
           SELECT 1 FROM class_sessions
           JOIN session_attendance ON session_attendance.session_id = class_sessions.id
           WHERE class_sessions.slot_id = timetable_slots.id
         )
       RETURNING id`,
      [id],
    );
    if (!result.rowCount) {
      const exists = await getPool().query("SELECT 1 FROM timetable_slots WHERE id = $1", [id]);
      return exists.rowCount
        ? jsonError("A slot with recorded attendance cannot be deactivated.", 409)
        : jsonError("Timetable slot not found.", 404);
    }
    await deleteFutureUnattendedSessionsForSlot(getPool(), id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not deactivate timetable slot.");
  }
}
