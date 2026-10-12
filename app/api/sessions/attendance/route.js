import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  authorizeSession,
  databaseUnavailableResponse,
  jsonError,
  managementRoles,
  parsePositiveId,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const sessionId = parsePositiveId(new URL(request.url).searchParams.get("session_id"));
    if (!sessionId) return jsonError("Provide a valid session_id.", 400);

    const client = await getPool().connect();
    try {
      const { session, allowed } = await authorizeSession(client, user, sessionId);
      if (!session) return jsonError("Class session not found.", 404);
      if (!allowed) return jsonError("You do not have permission to view this class session.", 403);

      const values = [sessionId];
      let studentFilter = "";
      if (user.role === "student") {
        if (!user.student_id) return jsonError("Student account is not linked to a student record.", 403);
        values.push(user.student_id);
        studentFilter = ` AND students.student_id = $${values.length}`;
      } else if (user.role === "guardian") {
        if (!user.id) return jsonError("Guardian account is not configured.", 403);
        values.push(user.id);
        studentFilter = ` AND EXISTS (
          SELECT 1 FROM guardian_students
          WHERE guardian_students.guardian_user_id = $${values.length}
            AND guardian_students.student_id = students.student_id
        )`;
      }

      const result = await client.query(
        `SELECT students.student_id, students.name_english, students.name_khmer,
          session_attendance.status, session_attendance.source,
          session_attendance.scanned_at
         FROM class_sessions
         JOIN class_students ON class_students.class_id = class_sessions.class_id
         JOIN students ON students.student_id = class_students.student_id
         LEFT JOIN session_attendance
           ON session_attendance.session_id = class_sessions.session_id
          AND session_attendance.student_id = students.student_id
         WHERE class_sessions.session_id = $1 ${studentFilter}
         ORDER BY students.student_id`,
        values,
      );
      return NextResponse.json({ session, roster: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load session attendance.");
  }
}

export async function POST(request) {
  try {
    const { user, response } = await requireRole([
      ...managementRoles, "office_staff", "dept_head", "dept_deputy", "teacher",
    ]);
    if (response) return response;
    const body = await request.json();
    const sessionId = parsePositiveId(String(body?.session_id ?? ""));
    if (!sessionId || !Array.isArray(body.records) || body.records.length > 1000) {
      return jsonError("Provide a valid session_id and up to 1000 attendance records.", 400);
    }
    const validStatuses = new Set(["present", "absent", "late", "excused"]);
    const seen = new Set();
    for (const record of body.records) {
      if (!record || typeof record.student_id !== "string" ||
          !record.student_id.trim() || record.student_id.trim().length > 40 ||
          !validStatuses.has(record.status)) {
        return jsonError("Each record needs a student ID and a valid attendance status.", 400);
      }
      const studentId = record.student_id.trim();
      if (seen.has(studentId)) return jsonError("A student may appear only once per session.", 400);
      seen.add(studentId);
    }

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const { session, allowed } = await authorizeSession(client, user, sessionId);
      if (!session) {
        await client.query("ROLLBACK");
        return jsonError("Class session not found.", 404);
      }
      if (!allowed) {
        await client.query("ROLLBACK");
        return jsonError("You do not have permission to record attendance for this session.", 403);
      }
      await client.query(
        "SELECT session_id FROM class_sessions WHERE session_id = $1 FOR UPDATE",
        [sessionId],
      );
      const enrolled = await client.query(
        "SELECT student_id FROM class_students WHERE class_id = $1 AND student_id = ANY($2::varchar[])",
        [session.class_id, [...seen]],
      );
      const enrolledIds = new Set(enrolled.rows.map(row => row.student_id));
      if ([...seen].some(studentId => !enrolledIds.has(studentId))) {
        await client.query("ROLLBACK");
        return jsonError("Every attendance student must be enrolled in this class.", 400);
      }
      for (const record of body.records) {
        await client.query(
          `INSERT INTO session_attendance
            (session_id, student_id, status, source, recorded_by, updated_at)
           VALUES ($1, $2, $3, 'manual', $4, NOW())
           ON CONFLICT (session_id, student_id)
           DO UPDATE SET status = EXCLUDED.status, source = 'manual',
             recorded_by = EXCLUDED.recorded_by, updated_at = NOW()`,
          [sessionId, record.student_id.trim(), record.status, user.id],
        );
      }
      await client.query("COMMIT");
      return NextResponse.json({ saved: body.records.length });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not save session attendance.");
  }
}
