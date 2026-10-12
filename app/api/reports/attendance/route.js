import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  parseUuid,
  termManagerRoles,
  validDate,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

const dimensions = {
  session: ["sessions.id", "sessions.id", "sessions.session_date::text"],
  class: ["classes.id", "classes.id", "classes.name"],
  shift: ["shifts.id", "shifts.id", "shifts.code"],
  subject: ["COALESCE(sessions.subject_id, slots.subject_id)", "COALESCE(sessions.subject_id, slots.subject_id)", "subjects.name"],
  teacher: ["COALESCE(sessions.teacher_id, slots.teacher_id)", "COALESCE(sessions.teacher_id, slots.teacher_id)", "teachers.name"],
};
const filterNames = ["term_id", "shift_id", "class_id", "subject_id", "session_id"];

export async function GET(request) {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const url = new URL(request.url);
    const groupBy = url.searchParams.get("group_by") || "session";
    if (!Object.hasOwn(dimensions, groupBy)) {
      return jsonError("group_by must be one of session, class, shift, subject, or teacher.", 400);
    }
    const filters = {};
    for (const name of filterNames) {
      const raw = url.searchParams.get(name);
      if (raw !== null) {
        filters[name] = parseUuid(raw);
        if (!filters[name]) return jsonError(`${name} must be a valid UUID.`, 400);
      }
    }
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    if ((startDate && !validDate(startDate)) || (endDate && !validDate(endDate)) ||
        (startDate && endDate && endDate < startDate)) {
      return jsonError("Provide valid start_date and end_date values (YYYY-MM-DD), with end_date not before start_date.", 400);
    }

    const values = [];
    const conditions = [];
    const addFilter = (condition, value) => {
      values.push(value);
      conditions.push(condition.replace("?", `$${values.length}`));
    };
    if (filters.term_id) addFilter("sessions.term_id = ?::uuid", filters.term_id);
    if (filters.shift_id) addFilter("classes.shift_id = ?::uuid", filters.shift_id);
    if (filters.class_id) addFilter("sessions.class_id = ?::uuid", filters.class_id);
    if (filters.subject_id) addFilter("COALESCE(sessions.subject_id, slots.subject_id) = ?::uuid", filters.subject_id);
    if (filters.session_id) addFilter("sessions.id = ?::uuid", filters.session_id);
    if (startDate) addFilter("sessions.session_date >= ?::date", startDate);
    if (endDate) addFilter("sessions.session_date <= ?::date", endDate);

    if (user.role === "teacher") {
      if (!user.teacher_id) return jsonError("Teacher account is not linked to a teacher record.", 403);
      values.push(user.teacher_id);
      conditions.push(`EXISTS (SELECT 1 FROM class_teachers
        WHERE class_teachers.class_id = sessions.class_id
          AND class_teachers.teacher_id = $${values.length})`);
      if (groupBy === "teacher") {
        conditions.push(`COALESCE(sessions.teacher_id, slots.teacher_id) = $${values.length}`);
      }
    } else if (user.role === "student") {
      if (!user.student_id) return jsonError("Student account is not linked to a student record.", 403);
      values.push(user.student_id);
      conditions.push(`class_students.student_id = $${values.length}`);
    } else if (user.role === "guardian") {
      if (!user.id) return jsonError("Guardian account is not configured.", 403);
      values.push(user.id);
      conditions.push(`EXISTS (SELECT 1 FROM guardian_students
        WHERE guardian_students.guardian_user_id = $${values.length}
          AND guardian_students.student_id = class_students.student_id)`);
    } else if (user.role === "dept_head" || user.role === "dept_deputy") {
      if (!user.department) return jsonError("Department access is not configured for this account.", 403);
      values.push(user.department);
      conditions.push(`subjects.department = $${values.length}`);
    } else if (!termManagerRoles.includes(user.role)) {
      return jsonError("You do not have permission to view attendance reports.", 403);
    }

    const [groupId, groupKey, groupName] = dimensions[groupBy];
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await getPool().query(
      `SELECT ${groupId} AS group_id, ${groupKey} AS group_key, ${groupName} AS group_name,
        COUNT(DISTINCT sessions.id)::int AS sessions,
        COUNT(*) FILTER (WHERE session_attendance.status = 'present')::int AS present,
        COUNT(*) FILTER (WHERE session_attendance.status = 'absent')::int AS absent,
        COUNT(*) FILTER (WHERE session_attendance.status = 'late')::int AS late,
        COUNT(*) FILTER (WHERE session_attendance.status = 'excused')::int AS excused,
        COUNT(class_students.student_id)::int AS roster_records,
        COALESCE(ROUND(100.0 * COUNT(*) FILTER (
          WHERE session_attendance.status IN ('present', 'late')
        ) / NULLIF(COUNT(class_students.student_id), 0), 2), 0) AS attendance_percentage
       FROM class_sessions AS sessions
       LEFT JOIN timetable_slots AS slots ON slots.id = sessions.slot_id
       JOIN classes ON classes.id = sessions.class_id
       JOIN shifts ON shifts.id = classes.shift_id
       LEFT JOIN subjects ON subjects.id = COALESCE(sessions.subject_id, slots.subject_id)
       LEFT JOIN teachers ON teachers.teacher_id = COALESCE(sessions.teacher_id, slots.teacher_id)
       JOIN class_students ON class_students.class_id = sessions.class_id
       LEFT JOIN session_attendance
         ON session_attendance.session_id = sessions.id
        AND session_attendance.student_id = class_students.student_id
       ${where}
       GROUP BY ${groupId}, ${groupKey}, ${groupName}
       ORDER BY group_name`,
      values,
    );
    return NextResponse.json({ group_by: groupBy, reports: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load attendance reports.");
  }
}
