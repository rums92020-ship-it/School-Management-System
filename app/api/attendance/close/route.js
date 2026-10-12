import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  authorizeSession,
  databaseUnavailableResponse,
  jsonError,
  managementRoles,
  parseUuid,
  sessionTimezone,
} from "../../../../lib/timetable";
import { scheduleNotificationDelivery } from "../../../../lib/notifications";
import { enqueueAbsentNotices, writeAttendanceAudit } from "../../../../lib/session-notifications";

export const runtime = "nodejs";

const closerRoles = [...managementRoles, "office_staff", "dept_head", "dept_deputy", "teacher"];

export async function POST(request) {
  try {
    const { user, response } = await requireRole(closerRoles);
    if (response) return response;
    const body = await request.json();
    const sessionId = parseUuid(body?.session_id);
    if (!sessionId) return jsonError("Provide a valid session_id.", 400);

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
        return jsonError("You do not have permission to close attendance for this class.", 403);
      }

      await client.query("SELECT id FROM class_sessions WHERE id = $1 FOR UPDATE", [sessionId]);
      const ended = await client.query(
        `SELECT NOW() >= ((session_date::text || ' ' || end_time::text)::timestamp
          AT TIME ZONE $2) AS has_ended, status
         FROM class_sessions WHERE id = $1`,
        [sessionId, sessionTimezone],
      );
      if (ended.rows[0].status === "cancelled") {
        await client.query("ROLLBACK");
        return jsonError("A cancelled session cannot be closed for attendance.", 409);
      }
      if (!ended.rows[0].has_ended) {
        await client.query("ROLLBACK");
        return jsonError("A session can be closed only after its scheduled end.", 409);
      }

      const inserted = await client.query(
        `INSERT INTO session_attendance
          (session_id, student_id, status, source, recorded_by)
         SELECT $1, class_students.student_id, 'absent', 'auto', $2
         FROM class_sessions
         JOIN class_students ON class_students.class_id = class_sessions.class_id
         WHERE class_sessions.id = $1
         ON CONFLICT (session_id, student_id) DO NOTHING
         RETURNING student_id`,
        [sessionId, user.id],
      );
      for (const record of inserted.rows) {
        await writeAttendanceAudit(client, {
          sessionId,
          studentId: record.student_id,
          newStatus: "absent",
          changeSource: "close",
          changedBy: user.id,
        });
      }
      await client.query(
        "UPDATE class_sessions SET status = 'closed' WHERE id = $1",
        [sessionId],
      );
      await enqueueAbsentNotices(client, sessionId);
      const total = await client.query(
        "SELECT COUNT(*)::int AS count FROM class_students WHERE class_id = $1",
        [session.class_id],
      );
      await client.query("COMMIT");
      scheduleNotificationDelivery();
      return NextResponse.json({
        closed: true,
        marked_absent: inserted.rowCount,
        roster_size: total.rows[0].count,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not close session attendance.");
  }
}
