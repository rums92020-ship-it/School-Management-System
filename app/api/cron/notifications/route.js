import { NextResponse } from "next/server";
import { getPool } from "../../../../lib/db";
import { jsonError } from "../../../../lib/timetable";
import { constantTimeEqual, deliverPendingNotifications } from "../../../../lib/notifications";
import {
  autoCloseHeldSessions,
  detectTeacherLateAlerts,
  detectUnresolvedSessions,
} from "../../../../lib/session-events";

export const runtime = "nodejs";

async function runCron(request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!expected || !constantTimeEqual(supplied, expected)) {
    return jsonError("Unauthorized.", 401);
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const lateAlerts = await detectTeacherLateAlerts(client);
    const unresolved = await detectUnresolvedSessions(client);
    const closed = await autoCloseHeldSessions(client);
    await client.query("COMMIT");
    const delivered = await deliverPendingNotifications(50);
    return NextResponse.json({ late_alerts: lateAlerts, unresolved, closed, delivered });
  } catch {
    await client.query("ROLLBACK");
    console.error("Notification cron execution failed.");
    return jsonError("Could not process scheduled notifications.", 503);
  } finally {
    client.release();
  }
}

export async function GET(request) {
  return runCron(request);
}

export async function POST(request) {
  return runCron(request);
}
