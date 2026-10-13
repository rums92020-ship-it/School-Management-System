import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  parseUuid,
  sessionTimezone,
  termManagerRoles,
  validDate,
} from "../../../lib/timetable";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const url = new URL(request.url);
    const termIdValue = url.searchParams.get("term_id");
    const classIdValue = url.searchParams.get("class_id");
    const date = url.searchParams.get("date");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const termId = termIdValue ? parseUuid(termIdValue) : null;
    const classId = classIdValue ? parseUuid(classIdValue) : null;
    if ((termIdValue && !termId) || (classIdValue && !classId) ||
        (date && !validDate(date)) || (startDate && !validDate(startDate)) ||
        (endDate && !validDate(endDate)) || (startDate && endDate && endDate < startDate) ||
        (date && (startDate || endDate))) {
      return jsonError("Provide valid term, class, or date filters; use either date or an ordered start_date/end_date range.", 400);
    }

    const values = [termId, classId, date, startDate, endDate, sessionTimezone];
    let scope = "";
    if (user.role === "teacher") {
      if (!user.teacher_id) scope = " AND FALSE";
      else {
        values.push(user.teacher_id);
        scope = ` AND EXISTS (
          SELECT 1 FROM class_teachers
          WHERE class_teachers.class_id = sessions.class_id
            AND class_teachers.teacher_id = $${values.length}
        )`;
      }
    } else if (user.role === "student") {
      if (!user.student_id) scope = " AND FALSE";
      else {
        values.push(user.student_id);
        scope = ` AND EXISTS (
          SELECT 1 FROM class_students
          WHERE class_students.class_id = sessions.class_id
            AND class_students.student_id = $${values.length}
        )`;
      }
    } else if (user.role === "guardian") {
      if (!user.id) scope = " AND FALSE";
      else {
        values.push(user.id);
        scope = ` AND EXISTS (
          SELECT 1 FROM class_students
          JOIN guardian_students ON guardian_students.student_id = class_students.student_id
          WHERE class_students.class_id = sessions.class_id
            AND guardian_students.guardian_user_id = $${values.length}
        )`;
      }
    } else if (["dept_head", "dept_deputy"].includes(user.role)) {
      if (!user.department) scope = " AND FALSE";
      else {
        values.push(user.department);
        scope = ` AND EXISTS (
          SELECT 1 FROM subjects AS scoped_subject
          WHERE scoped_subject.id = COALESCE(sessions.subject_id, slots.subject_id)
            AND scoped_subject.department = $${values.length}
        )`;
      }
    } else if (!termManagerRoles.includes(user.role)) {
      scope = " AND FALSE";
    }

    const result = await getPool().query(
      `SELECT sessions.id AS session_id, slots.id AS slot_id, sessions.term_id,
        sessions.class_id, classes.name AS class_name,
        sessions.session_date,
        ((sessions.session_date::text || ' ' || sessions.start_time::text)::timestamp
          AT TIME ZONE $6) AS starts_at,
        ((sessions.session_date::text || ' ' || sessions.end_time::text)::timestamp
          AT TIME ZONE $6) AS ends_at,
        COALESCE(sessions.subject_id, slots.subject_id) AS subject_id,
        subjects.name AS subject_name,
        COALESCE(sessions.teacher_id, slots.teacher_id) AS teacher_id,
        teachers.name AS teacher_name, COALESCE(sessions.room, slots.room) AS room,
        shifts.code AS shift_code, sessions.status,
        sessions.teacher_checkin_at, sessions.teacher_checkin_method,
        COALESCE(sessions.teacher_id, slots.teacher_id) AS session_teacher_id,
        sessions.substitute_teacher_id, sessions.needs_review
       FROM class_sessions AS sessions
       JOIN classes ON classes.id = sessions.class_id
       JOIN shifts ON shifts.id = classes.shift_id
       LEFT JOIN timetable_slots AS slots ON slots.id = sessions.slot_id
       LEFT JOIN subjects ON subjects.id = COALESCE(sessions.subject_id, slots.subject_id)
       LEFT JOIN teachers ON teachers.teacher_id = COALESCE(sessions.teacher_id, slots.teacher_id)
       WHERE ($1::uuid IS NULL OR sessions.term_id = $1)
         AND ($2::uuid IS NULL OR sessions.class_id = $2)
         AND ($3::date IS NULL OR sessions.session_date = $3)
         AND ($4::date IS NULL OR sessions.session_date >= $4)
         AND ($5::date IS NULL OR sessions.session_date <= $5)
         ${scope}
       ORDER BY sessions.session_date, sessions.start_time, classes.name`,
      values,
    );
    return NextResponse.json({ sessions: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load class sessions.");
  }
}
