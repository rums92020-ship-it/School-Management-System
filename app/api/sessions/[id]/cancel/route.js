import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/auth";
import { getPool } from "../../../../../lib/db";
import { rateLimit } from "../../../../../lib/rate-limit";
import { jsonError, parseUuid } from "../../../../../lib/timetable";
import { writeAttendanceAudit } from "../../../../../lib/session-notifications";

export const runtime = "nodejs";
const officeRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(request, { params }) {
  if (!rateLimit(request, "session-cancel", 20, 60_000)) {
    return jsonError("Too many requests. Try again shortly.", 429);
  }
  try {
    const { user, response } = await requireRole(officeRoles);
    if (response) return response;
    const { id: sessionId } = await params;
    if (!parseUuid(sessionId)) return jsonError("Invalid session ID.", 400);
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
      await client.query(
        `UPDATE class_sessions
         SET status = 'cancelled', needs_review = FALSE
         WHERE id = $1`,
        [sessionId],
      );
      await writeAttendanceAudit(client, {
        sessionId,
        changeSource: "cancel",
        changedBy: user.id,
      });
      await client.query("COMMIT");
      return NextResponse.json({ cancelled: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch {
    console.error("Could not cancel class session.");
    return jsonError("Could not cancel class session.", 503);
  }
}
