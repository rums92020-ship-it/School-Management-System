import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  parsePositiveId,
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
    const termId = termIdValue ? parsePositiveId(termIdValue) : null;
    const classId = classIdValue ? parsePositiveId(classIdValue) : null;
    if ((termIdValue && !termId) || (classIdValue && !classId) ||
        (date && !validDate(date)) || (startDate && !validDate(startDate)) ||
        (endDate && !validDate(endDate)) || (startDate && endDate && endDate < startDate) ||
        (date && (startDate || endDate))) {
      return jsonError("Provide valid term, class, or date filters; use either date or an ordered start_date/end_date range.", 400);
    }

    const values = [termId, classId, date, startDate, endDate];
    let scope = "";
    if (user.role === "teacher") {
      if (!user.teacher_id) scope = " AND FALSE";
      else {
        values.push(user.teacher_id);
        scope = ` AND EXISTS (SELECT 1 FROM class_teachers
          WHERE class_teachers.class_id = sessions.class_id
            AND class_teachers.teacher_id = $${values.length})`;
      }
    } else if (user.role === "student") {
      if (!user.student_id) scope = " AND FALSE";
      else {
        values.push(user.student_id);
        scope = ` AND EXISTS (SELECT 1 FROM class_students
          WHERE class_students.class_id = sessions.class_id
            AND class_students.student_id = $${values.length})`;
      }
    } else if (user.role === "guardian") {
      if (!user.id) scope = " AND FALSE";
      else {
        values.push(user.id);
        scope = ` AND EXISTS (SELECT 1 FROM class_students
          JOIN guardian_students ON guardian_students.student_id = class_students.student_id
          WHERE class_students.class_id = sessions.class_id
            AND guardian_students.guardian_user_id = $${values.length})`;
      }
    } else if (["dept_head", "dept_deputy"].includes(user.role)) {
      if (!user.department) scope = " AND FALSE";
      else {
        values.push(user.department);
        scope = ` AND EXISTS (SELECT 1 FROM timetable_slots
          JOIN subjects ON subjects.subject_id = timetable_slots.subject_id
          WHERE timetable_slots.slot_id = sessions.slot_id
            AND subjects.department = $${values.length})`;
      }
    } else if (!termManagerRoles.includes(user.role)) {
      scope = " AND FALSE";
    }

    const result = await getPool().query(
      `SELECT sessions.session_id, sessions.slot_id, sessions.term_id,
        sessions.class_id, classes.name AS class_name,
        sessions.session_date, sessions.starts_at, sessions.ends_at,
        subjects.subject_id, subjects.name AS subject_name,
        slots.teacher_id, teachers.name AS teacher_name, slots.room,
        shifts.code AS shift_code
       FROM class_sessions AS sessions
       JOIN classes ON classes.class_id = sessions.class_id
       JOIN shifts ON shifts.id = classes.shift_id
       JOIN timetable_slots AS slots ON slots.slot_id = sessions.slot_id
       JOIN subjects ON subjects.subject_id = slots.subject_id
       JOIN teachers ON teachers.teacher_id = slots.teacher_id
       WHERE ($1::bigint IS NULL OR sessions.term_id = $1)
         AND ($2::bigint IS NULL OR sessions.class_id = $2)
         AND ($3::date IS NULL OR sessions.session_date = $3)
         AND ($4::date IS NULL OR sessions.session_date >= $4)
         AND ($5::date IS NULL OR sessions.session_date <= $5)
         ${scope}
       ORDER BY sessions.session_date, sessions.starts_at, classes.name`,
      values,
    );
    return NextResponse.json({ sessions: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load class sessions.");
  }
}
