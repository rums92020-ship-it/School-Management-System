import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { jsonError } from "../../../../lib/timetable";

export const runtime = "nodejs";

const adminRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function GET() {
  try {
    const { response } = await requireRole(adminRoles);
    if (response) return response;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const username = process.env.TELEGRAM_BOT_USERNAME || null;
    const result = await getPool().query(
      `SELECT COUNT(*)::int AS linked_chats
       FROM notification_channels
       WHERE channel = 'telegram'
         AND is_active = TRUE
         AND chat_id IS NOT NULL`,
    );

    return NextResponse.json({
      configured: Boolean(token && username && process.env.TELEGRAM_WEBHOOK_SECRET),
      backend_connected: Boolean(token),
      bot_username: username,
      linked_chats: Number(result.rows[0]?.linked_chats || 0),
    });
  } catch (error) {
    console.error("Could not load Telegram status.", error);
    return jsonError("Could not load Telegram status.", 503);
  }
}
