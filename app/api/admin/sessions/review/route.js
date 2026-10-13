import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/auth";
import { getPool } from "../../../../../lib/db";

export const runtime = "nodejs";
const officeRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function GET() {
  try {
    const { response } = await requireRole(officeRoles);
    if (response) return response;
    const result = await getPool().query(
      `SELECT sessions.id AS session_id, sessions.session_date, sessions.start_time,
        sessions.end_time, sessions.room, sessions.substitute_teacher_id,
        classes.name AS class_name, subjects.name AS subject_name,
        COALESCE(sessions.teacher_id, slots.teacher_id) AS teacher_id,
        teachers.name AS teacher_name
       FROM class_sessions AS sessions
       JOIN classes ON classes.id = sessions.class_id
       LEFT JOIN timetable_slots AS slots ON slots.id = sessions.slot_id
       LEFT JOIN subjects ON subjects.id = COALESCE(sessions.subject_id, slots.subject_id)
       LEFT JOIN teachers ON teachers.teacher_id = COALESCE(sessions.teacher_id, slots.teacher_id)
       WHERE sessions.needs_review = TRUE AND sessions.status NOT IN ('closed', 'cancelled')
       ORDER BY sessions.session_date DESC, sessions.start_time
       LIMIT 100`,
    );
    return NextResponse.json({ sessions: result.rows });
  } catch {
    console.error("Could not load sessions needing review.");
    return NextResponse.json({ error: "Could not load sessions needing review." }, { status: 503 });
  }
}
