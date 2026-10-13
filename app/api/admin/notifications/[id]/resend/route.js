import { NextResponse } from "next/server";
import { requireRole } from "../../../../../../lib/auth";
import { getPool } from "../../../../../../lib/db";
import { scheduleNotificationDelivery } from "../../../../../../lib/notifications";
import { jsonError, parseUuid } from "../../../../../../lib/timetable";

export const runtime = "nodejs";
const adminRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(_request, { params }) {
  try {
    const { response } = await requireRole(adminRoles);
    if (response) return response;
    const { id } = await params;
    if (!parseUuid(id)) return jsonError("Invalid notification ID.", 400);
    const result = await getPool().query(
      `UPDATE notifications
       SET status = 'pending', attempts = 0, next_attempt_at = NOW()
       WHERE id = $1 AND channel = 'telegram' AND status = 'failed'
       RETURNING id`,
      [id],
    );
    if (!result.rowCount) return jsonError("Failed notification not found.", 404);
    scheduleNotificationDelivery();
    return NextResponse.json({ queued: true });
  } catch {
    console.error("Could not resend notification.");
    return NextResponse.json({ error: "Could not resend notification." }, { status: 503 });
  }
}
