import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  authorizeSession,
  attendanceGraceMinutes,
  databaseUnavailableResponse,
  jsonError,
  managementRoles,
  parsePositiveId,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

const scannerRoles = [...managementRoles, "dept_head", "dept_deputy", "teacher"];

function readStudentId(body) {
  if (typeof body.student_id === "string") return body.student_id.trim();
  if (typeof body.qr_payload !== "string" || body.qr_payload.length > 4096) return "";
  try {
    const payload = JSON.parse(body.qr_payload);
    return payload?.type === "attendance" && typeof payload.id === "string"
      ? payload.id.trim()
      : "";
  } catch {
    return "";
  }
}

export async function POST(request) {
  try {
    const { user, response } = await requireRole(scannerRoles);
    if (response) return response;
    const body = await request.json();
    const sessionId = parsePositiveId(String(body?.session_id ?? ""));
    const studentId = body && typeof body === "object" ? readStudentId(body) : "";
    if (!sessionId || !studentId || studentId.length > 40) {
      return jsonError("Provide a valid session_id and student QR payload.", 400);
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
        return jsonError("You do not have permission to scan attendance for this class.", 403);
      }
      const enrolled = await client.query(
        `SELECT 1 FROM class_students
         WHERE class_id = $1 AND student_id = $2`,
        [session.class_id, studentId],
      );
      if (!enrolled.rowCount) {
        await client.query("ROLLBACK");
        return jsonError("This student is not enrolled in the session class.", 400);
      }

      const existing = await client.query(
        "SELECT status FROM session_attendance WHERE session_id = $1 AND student_id = $2",
        [sessionId, studentId],
      );
      if (existing.rowCount) {
        await client.query("COMMIT");
        return NextResponse.json({ already: true, status: existing.rows[0].status });
      }

      const timing = await client.query(
        `SELECT NOW() >= starts_at - INTERVAL '15 minutes'
           AND NOW() <= ends_at AS within_window,
        NOW() <= starts_at + ($2::int * INTERVAL '1 minute') AS present_on_time
         FROM class_sessions WHERE session_id = $1`,
        [sessionId, attendanceGraceMinutes],
      );
      if (!timing.rows[0].within_window) {
        await client.query("ROLLBACK");
        return jsonError("Scanning is allowed only from 15 minutes before the session until it ends.", 409);
      }

      const status = timing.rows[0].present_on_time ? "present" : "late";
      const result = await client.query(
        `INSERT INTO session_attendance
          (session_id, student_id, status, source, scanned_at, recorded_by)
         VALUES ($1, $2, $3, 'qr', NOW(), $4)
         ON CONFLICT (session_id, student_id) DO NOTHING
         RETURNING status`,
        [sessionId, studentId, status, user.id],
      );
      if (!result.rowCount) {
        const saved = await client.query(
          "SELECT status FROM session_attendance WHERE session_id = $1 AND student_id = $2",
          [sessionId, studentId],
        );
        await client.query("COMMIT");
        return NextResponse.json({ already: true, status: saved.rows[0]?.status });
      }
      await client.query("COMMIT");
      return NextResponse.json({ already: false, status }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not record QR attendance.");
  }
}
