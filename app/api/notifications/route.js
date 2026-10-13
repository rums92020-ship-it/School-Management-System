import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const pool = getPool();
    const [result, count] = await Promise.all([
      pool.query(
        `SELECT id, event_type, body, payload, status, created_at, read_at
         FROM notifications
         WHERE recipient_user_id = $1 AND channel = 'in_app'
         ORDER BY created_at DESC
         LIMIT 50`,
        [user.id],
      ),
      pool.query(
        `SELECT COUNT(*)::int AS unread
         FROM notifications
         WHERE recipient_user_id = $1 AND channel = 'in_app' AND read_at IS NULL`,
        [user.id],
      ),
    ]);
    return NextResponse.json({ notifications: result.rows, unread: count.rows[0].unread });
  } catch {
    console.error("Could not load notifications.");
    return NextResponse.json({ error: "Could not load notifications." }, { status: 503 });
  }
}
