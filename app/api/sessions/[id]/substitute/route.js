import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/auth";
import { getPool } from "../../../../../lib/db";
import { rateLimit } from "../../../../../lib/rate-limit";
import { jsonError, parseUuid } from "../../../../../lib/timetable";
import { writeAttendanceAudit } from "../../../../../lib/session-notifications";

export const runtime = "nodejs";
const officeRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(request, { params }) {
  if (!rateLimit(request, "session-substitute", 20, 60_000)) {
    return jsonError("Too many requests. Try again shortly.", 429);
  }
  try {
    const { user, response } = await requireRole(officeRoles);
    if (response) return response;
    const { id: sessionId } = await params;
    if (!parseUuid(sessionId)) return jsonError("Invalid session ID.", 400);
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }
    const substituteId = typeof body?.substitute_teacher_id === "string"
      ? body.substitute_teacher_id.trim()
      : "";
    if (!substituteId || substituteId.length > 40) {
      return jsonError("A valid substitute teacher ID is required.", 400);
    }
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const session = await client.query(
        "SELECT id, status FROM class_sessions WHERE id = $1 FOR UPDATE",
        [sessionId],
      );
      if (!session.rowCount) {
        await client.query("ROLLBACK");
        return jsonError("Session not found.", 404);
      }
      if (session.rows[0].status === "cancelled" || session.rows[0].status === "closed") {
        await client.query("ROLLBACK");
        return jsonError("A closed or cancelled session cannot be assigned a substitute.", 409);
      }
      const teacher = await client.query(
        "SELECT 1 FROM teachers WHERE teacher_id = $1 AND status = 'Active'",
        [substituteId],
      );
      if (!teacher.rowCount) {
        await client.query("ROLLBACK");
        return jsonError("The substitute teacher was not found or is inactive.", 404);
      }
      await client.query(
        `UPDATE class_sessions
         SET substitute_teacher_id = $2, needs_review = FALSE
         WHERE id = $1`,
        [sessionId, substituteId],
      );
      await writeAttendanceAudit(client, {
        sessionId,
        changeSource: "substitute",
        changedBy: user.id,
      });
      await client.query("COMMIT");
      return NextResponse.json({ assigned: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch {
    console.error("Could not assign session substitute.");
    return jsonError("Could not assign session substitute.", 503);
  }
}
