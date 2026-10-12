import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "./auth";

export const managementRoles = ["director", "deputy_director", "office_head", "office_deputy"];
export const termManagerRoles = [...managementRoles, "office_staff"];
export const leadershipRoles = ["director", "deputy_director"];
export const sessionTimezone = "Asia/Phnom_Penh";

export async function requireSignedIn() {
  return getAuthenticatedUser();
}

export function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export function parsePositiveId(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
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
  if (managementRoles.includes(user.role)) return true;
  if (user.role === "teacher" && user.teacher_id) {
    const result = await client.query(
      "SELECT 1 FROM class_teachers WHERE class_id = $1 AND teacher_id = $2",
      [classId, user.teacher_id],
    );
    return result.rowCount > 0;
  }
  if (user.role === "student" && user.student_id) {
    const result = await client.query(
      "SELECT 1 FROM class_students WHERE class_id = $1 AND student_id = $2",
      [classId, user.student_id],
    );
    return result.rowCount > 0;
  }
  if (user.role === "guardian" && user.id) {
    const result = await client.query(
      `SELECT 1
       FROM class_students
       JOIN guardian_students ON guardian_students.student_id = class_students.student_id
       WHERE class_students.class_id = $1 AND guardian_students.guardian_user_id = $2
       LIMIT 1`,
      [classId, user.id],
    );
    return result.rowCount > 0;
  }
  if ((user.role === "dept_head" || user.role === "dept_deputy") && user.department) {
    const result = await client.query(
      `SELECT 1
       FROM timetable_slots
       JOIN subjects ON subjects.subject_id = timetable_slots.subject_id
       WHERE timetable_slots.class_id = $1 AND subjects.department = $2
       LIMIT 1`,
      [classId, user.department],
    );
    return result.rowCount > 0;
  }
  return false;
}

export async function authorizeSession(client, user, sessionId) {
  const sessionResult = await client.query(
    "SELECT session_id, class_id, term_id, session_date, starts_at, ends_at FROM class_sessions WHERE session_id = $1",
    [sessionId],
  );
  const session = sessionResult.rows[0];
  if (!session) return { session: null, allowed: false };
  return { session, allowed: await authorizeClass(client, user, session.class_id) };
}

export async function insertFutureSessionsForSlot(client, slotId) {
  const result = await client.query(
    `INSERT INTO class_sessions
      (slot_id, term_id, class_id, session_date, starts_at, ends_at)
     SELECT slot.slot_id, slot.term_id, slot.class_id, dates.session_date,
       ((dates.session_date::text || ' ' || slot.start_time::text)::timestamp
         AT TIME ZONE $2),
       ((dates.session_date::text || ' ' || slot.end_time::text)::timestamp
         AT TIME ZONE $2)
     FROM timetable_slots AS slot
     JOIN terms AS term ON term.id = slot.term_id
     CROSS JOIN LATERAL generate_series(
       GREATEST(slot.valid_from, term.start_date, CURRENT_DATE)::timestamp,
       LEAST(slot.valid_to, term.end_date)::timestamp,
       INTERVAL '1 day'
     ) AS dates(session_date)
     WHERE slot.slot_id = $1
       AND EXTRACT(ISODOW FROM dates.session_date)::int = slot.weekday
       AND NOT EXISTS (
         SELECT 1 FROM holidays
         WHERE holiday_date = dates.session_date::date
           AND (academic_year IS NULL OR academic_year = term.academic_year)
       )
     ON CONFLICT (slot_id, session_date) DO NOTHING
     RETURNING session_id`,
    [slotId, sessionTimezone],
  );
  return result.rowCount;
}

export async function replaceFutureUnattendedSessionsForSlot(client, slotId) {
  await client.query(
    `DELETE FROM class_sessions AS session
     WHERE session.slot_id = $1
       AND session.session_date >= CURRENT_DATE
       AND NOT EXISTS (
         SELECT 1 FROM session_attendance
         WHERE session_attendance.session_id = session.session_id
       )`,
    [slotId],
  );
  return insertFutureSessionsForSlot(client, slotId);
}
