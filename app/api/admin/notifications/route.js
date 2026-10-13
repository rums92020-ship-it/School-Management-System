import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { jsonError } from "../../../../lib/timetable";

export const runtime = "nodejs";
const adminRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];
const validStatuses = new Set(["pending", "sent", "failed", "skipped"]);
const validChannels = new Set(["telegram", "in_app"]);

export async function GET(request) {
  try {
    const { response } = await requireRole(adminRoles);
    if (response) return response;
    const search = new URL(request.url).searchParams;
    const status = search.get("status");
    const channel = search.get("channel");
    const eventType = search.get("event_type");
    const from = search.get("from");
    const to = search.get("to");
    if ((status && !validStatuses.has(status)) ||
        (channel && !validChannels.has(channel)) ||
        (eventType && !/^[a-z_]{1,50}$/.test(eventType)) ||
        (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) ||
        (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) ||
        (from && to && from > to)) {
      return jsonError("Invalid notification filters.", 400);
    }
    const values = [];
    const filters = [];
    for (const [value, expression] of [
      [status, "notifications.status = $"],
      [channel, "notifications.channel = $"],
      [eventType, "notifications.event_type = $"],
      [from, "notifications.created_at >= $::date"],
      [to, "notifications.created_at < ($::date + INTERVAL '1 day')"],
    ]) {
      if (value) {
        values.push(value);
        filters.push(expression.replace("$", `$${values.length}`));
      }
    }
    values.push(100);
    const result = await getPool().query(
      `SELECT notifications.id, notifications.event_type, notifications.recipient_user_id,
        notifications.body, notifications.payload, notifications.status,
        notifications.attempts, notifications.next_attempt_at, notifications.channel,
        notifications.created_at, notifications.read_at
       FROM notifications
       ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
       ORDER BY notifications.created_at DESC
       LIMIT $${values.length}`,
      values,
    );
    return NextResponse.json({ notifications: result.rows });
  } catch {
    console.error("Could not load administrative notifications.");
    return NextResponse.json({ error: "Could not load notifications." }, { status: 503 });
  }
}
