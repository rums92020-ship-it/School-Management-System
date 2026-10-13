import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../../../lib/auth";
import { getPool } from "../../../../../lib/db";
import { jsonError, parseUuid } from "../../../../../lib/timetable";

export const runtime = "nodejs";

export async function POST(_request, { params }) {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const { id } = await params;
    if (!parseUuid(id)) return jsonError("Invalid notification ID.", 400);
    const result = await getPool().query(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, NOW())
       WHERE id = $1 AND recipient_user_id = $2 AND channel = 'in_app'
       RETURNING id`,
      [id, user.id],
    );
    if (!result.rowCount) return jsonError("Notification not found.", 404);
    return NextResponse.json({ read: true });
  } catch {
    console.error("Could not mark notification as read.");
    return NextResponse.json({ error: "Could not mark notification as read." }, { status: 503 });
  }
}
