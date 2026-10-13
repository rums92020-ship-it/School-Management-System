import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "./auth";
import { APP_TIMEZONE, STUDENT_LATE_GRACE_MINUTES } from "./app-constants";

export const managementRoles = ["director", "deputy_director", "office_head", "office_deputy"];
export const termManagerRoles = [...managementRoles, "office_staff"];
export const leadershipRoles = ["director", "deputy_director"];
export const sessionTimezone = APP_TIMEZONE;
export const attendanceGraceMinutes = STUDENT_LATE_GRACE_MINUTES;

export async function requireSignedIn() {
  return getAuthenticatedUser();
}

export function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export function parseUuid(value) {
  if (typeof value !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return null;
  }
  return value;
}

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validTime(value) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  const seconds = Number(value.slice(6) || 0);
  return Number.isFinite(seconds) && hours >= 0 && minutes >= 0;
}

export function isNinetyMinutes(start, end) {
  const minutes = value => {
    const [hours, rest] = value.split(":");
    const [minute, second = "0"] = rest.split(":");
    return Number(hours) * 60 + Number(minute) + Number(second) / 60;
  };
  return minutes(end) - minutes(start) === 90;
}

export function validWeekday(value) {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

export function isDatabaseSchemaUnavailable(error) {
  return error?.code === "42P01" || error?.code === "42703" || error?.code === "42883";
}

export function databaseUnavailableResponse(error, context) {
  if (isDatabaseSchemaUnavailable(error)) {
    console.error(`${context}: timetable schema is not available.`);
    return jsonError("Timetable database schema is not available. Apply the approved timetable SQL first.", 503);
  }
  console.error(context, error);
  return jsonError("The timetable request could not be completed.", 503);
}

export async function authorizeClass(client, user, classId) {
  if ([...managementRoles, "office_staff"].includes(user.role)) return true;
  if (user.role === "teacher" && user.teacher_id) {
    const result = await client.query(
      "SELECT 1 FROM class_teachers WHERE class_id = $1::uuid AND teacher_id = $2",
      [classId, user.teacher_id],
    );
    return result.rowCount > 0;
  }
  if (user.role === "student" && user.student_id) {
    const result = await client.query(
      "SELECT 1 FROM class_students WHERE class_id = $1::uuid AND student_id = $2",
      [classId, user.student_id],
    );
    return result.rowCount > 0;
  }
  if (user.role === "guardian" && user.id) {
    const result = await client.query(
      `SELECT 1
       FROM class_students
       JOIN guardian_students ON guardian_students.student_id = class_students.student_id
       WHERE class_students.class_id = $1::uuid AND guardian_students.guardian_user_id = $2
       LIMIT 1`,
      [classId, user.id],
    );
    return result.rowCount > 0;
  }
  if ((user.role === "dept_head" || user.role === "dept_deputy") && user.department) {
    const result = await client.query(
      `SELECT 1
       FROM timetable_slots
       JOIN subjects ON subjects.id = timetable_slots.subject_id
       WHERE timetable_slots.class_id = $1::uuid AND subjects.department = $2
       LIMIT 1`,
      [classId, user.department],
    );
    return result.rowCount > 0;
  }
  return false;
}

export async function authorizeSession(client, user, sessionId) {
  const sessionResult = await client.query(
    `SELECT class_sessions.id AS session_id, class_sessions.class_id, class_sessions.term_id,
      class_sessions.session_date,
      ((class_sessions.session_date::text || ' ' || class_sessions.start_time::text)::timestamp
        AT TIME ZONE $2) AS starts_at,
      ((class_sessions.session_date::text || ' ' || class_sessions.end_time::text)::timestamp
        AT TIME ZONE $2) AS ends_at,
      classes.name AS class_name, subjects.name AS subject_name,
      subjects.department,
      class_sessions.status, class_sessions.room,
      COALESCE(class_sessions.teacher_id, timetable_slots.teacher_id) AS teacher_id,
      class_sessions.substitute_teacher_id,
      class_sessions.teacher_checkin_at, class_sessions.teacher_checkin_method,
      class_sessions.needs_review
     FROM class_sessions
     JOIN classes ON classes.id = class_sessions.class_id
     LEFT JOIN timetable_slots ON timetable_slots.id = class_sessions.slot_id
     LEFT JOIN subjects ON subjects.id = COALESCE(class_sessions.subject_id, timetable_slots.subject_id)
     WHERE class_sessions.id = $1::uuid`,
    [sessionId, sessionTimezone],
  );
  const session = sessionResult.rows[0];
  if (!session) return { session: null, allowed: false };
  if (user.role === "dept_head" || user.role === "dept_deputy") {
    return {
      session,
      allowed: Boolean(user.department && session.department === user.department),
    };
  }
  return { session, allowed: await authorizeClass(client, user, session.class_id) };
}

export async function insertFutureSessionsForSlot(client, slotId) {
  const result = await client.query(
    `INSERT INTO class_sessions
      (slot_id, term_id, class_id, subject_id, teacher_id, session_date,
       start_time, end_time, room, status)
     SELECT slot.id, slot.term_id, slot.class_id, slot.subject_id, slot.teacher_id,
       dates.session_date::date, slot.start_time, slot.end_time, slot.room, 'scheduled'
     FROM timetable_slots AS slot
     JOIN terms AS term ON term.id = slot.term_id
     JOIN classes ON classes.id = slot.class_id
     JOIN shifts ON shifts.id = classes.shift_id
     CROSS JOIN LATERAL generate_series(
       GREATEST(slot.valid_from, term.start_date, (NOW() AT TIME ZONE $2)::date)::timestamp,
       LEAST(COALESCE(slot.valid_to, term.end_date), term.end_date)::timestamp,
       INTERVAL '1 day'
     ) AS dates(session_date)
     WHERE slot.id = $1::uuid AND slot.is_active = TRUE AND classes.is_active = TRUE
       AND EXTRACT(ISODOW FROM dates.session_date)::smallint = ANY(shifts.days_of_week)
       AND ((dates.session_date::text || ' ' || slot.start_time::text)::timestamp
         AT TIME ZONE $2) > NOW()
       AND NOT EXISTS (
         SELECT 1 FROM holidays
         WHERE holiday_date = dates.session_date::date
           AND (holidays.academic_year IS NULL OR holidays.academic_year = term.academic_year)
       )
     ON CONFLICT (slot_id, session_date) DO NOTHING
     RETURNING id`,
    [slotId, sessionTimezone],
  );
  return result.rowCount;
}

export async function deleteFutureUnattendedSessionsForSlot(client, slotId) {
  return client.query(
    `DELETE FROM class_sessions AS session
     WHERE session.slot_id = $1::uuid
       AND ((session.session_date::text || ' ' || session.start_time::text)::timestamp
         AT TIME ZONE $2) > NOW()
       AND NOT EXISTS (
         SELECT 1 FROM session_attendance
         WHERE session_attendance.session_id = session.id
       )`,
    [slotId, sessionTimezone],
  );
}

export async function replaceFutureUnattendedSessionsForSlot(client, slotId) {
  await deleteFutureUnattendedSessionsForSlot(client, slotId);
  return insertFutureSessionsForSlot(client, slotId);
}
