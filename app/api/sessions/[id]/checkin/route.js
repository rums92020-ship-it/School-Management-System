import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/auth";
import { getPool } from "../../../../../lib/db";
import { rateLimit } from "../../../../../lib/rate-limit";
import { jsonError, sessionTimezone } from "../../../../../lib/timetable";
import { enqueueTeacherArrival } from "../../../../../lib/session-events";
import { scheduleNotificationDelivery } from "../../../../../lib/notifications";
import { writeAttendanceAudit } from "../../../../../lib/session-notifications";

export const runtime = "nodejs";

const officeRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(request, { params }) {
  if (!rateLimit(request, "session-checkin", 10, 60_000)) {
    return jsonError("Too many check-in attempts. Try again shortly.", 429);
  }
  try {
    const { user, response } = await requireRole(["teacher", ...officeRoles]);
    if (response) return response;
    const { id: sessionId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(sessionId || "")) return jsonError("Invalid session ID.", 400);
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }
    const isOffice = officeRoles.includes(user.role);
    const note = typeof body?.note === "string" ? body.note.trim() : "";
    if (isOffice && (!note || note.length > 500)) {
      return jsonError("A check-in note of up to 500 characters is required.", 400);
    }
    if (!isOffice && (typeof body?.room_qr_token !== "string" || body.room_qr_token.length > 512)) {
      return jsonError("A valid room QR token is required.", 400);
    }

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT sessions.id, sessions.status, sessions.room,
          sessions.teacher_checkin_at, sessions.teacher_late_alerted_at,
          sessions.substitute_teacher_id,
          COALESCE(sessions.teacher_id, slots.teacher_id) AS teacher_id,
          NOW() >= ((sessions.session_date::text || ' ' || sessions.start_time::text)::timestamp
            AT TIME ZONE $2) - INTERVAL '15 minutes'
            AND NOW() <= ((sessions.session_date::text || ' ' || sessions.end_time::text)::timestamp
            AT TIME ZONE $2) AS within_window
         FROM class_sessions AS sessions
         LEFT JOIN timetable_slots AS slots ON slots.id = sessions.slot_id
         WHERE sessions.id = $1
         FOR UPDATE OF sessions`,
        [sessionId, sessionTimezone],
      );
      const session = result.rows[0];
      if (!session) {
        await client.query("ROLLBACK");
        return jsonError("Session not found.", 404);
      }
      if (session.status === "cancelled") {
        await client.query("ROLLBACK");
        return jsonError("A cancelled session cannot be checked in.", 409);
      }
      if (!session.within_window) {
        await client.query("ROLLBACK");
        return jsonError("Check-in is allowed from 15 minutes before the session until its end.", 409);
      }
      if (session.teacher_checkin_at) {
        await client.query("COMMIT");
        return NextResponse.json({ already: true });
      }
      if (!isOffice) {
        if (!user.teacher_id ||
            (user.teacher_id !== session.teacher_id &&
             user.teacher_id !== session.substitute_teacher_id)) {
          await client.query("ROLLBACK");
          return jsonError("You are not assigned to this session.", 403);
        }
        if (!session.room) {
          await client.query("ROLLBACK");
          return jsonError("This session has no room QR; ask the office to check you in.", 409);
        }
        const room = await client.query(
          "SELECT 1 FROM rooms WHERE name = $1 AND qr_token = $2",
          [session.room, body.room_qr_token],
        );
        if (!room.rowCount) {
          await client.query("ROLLBACK");
          return jsonError("This QR code does not match the session room.", 403);
        }
      }

      const checked = await client.query(
        `UPDATE class_sessions
         SET teacher_checkin_at = NOW(), teacher_checkin_method = $2
         WHERE id = $1
         RETURNING teacher_checkin_at`,
        [sessionId, isOffice ? "office" : "room_qr"],
      );
      await writeAttendanceAudit(client, {
        sessionId,
        changeSource: isOffice ? "office" : "room_qr",
        changedBy: user.id,
      });
      if (session.teacher_late_alerted_at) {
        await enqueueTeacherArrival(client, sessionId, checked.rows[0].teacher_checkin_at);
      }
      await client.query("COMMIT");
      scheduleNotificationDelivery();
      return NextResponse.json({ already: false, method: isOffice ? "office" : "room_qr" }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch {
    console.error("Could not record session check-in.");
    return jsonError("Could not record session check-in.", 503);
  }
}
