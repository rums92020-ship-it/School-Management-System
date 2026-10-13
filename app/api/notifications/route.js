import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const result = await getPool().query(
      `SELECT id, event_type, body, payload, status, created_at, read_at
       FROM notifications
       WHERE recipient_user_id = $1 AND channel = 'in_app'
       ORDER BY created_at DESC
       LIMIT 50`,
      [user.id],
    );
    const unread = result.rows.filter(row => !row.read_at).length;
    return NextResponse.json({ notifications: result.rows, unread });
  } catch {
    console.error("Could not load notifications.");
    return NextResponse.json({ error: "Could not load notifications." }, { status: 503 });
  }
}
