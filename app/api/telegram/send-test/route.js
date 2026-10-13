import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { sendTelegramMessage } from "../../../../lib/telegram";
import { jsonError } from "../../../../lib/timetable";

export const runtime = "nodejs";

const adminRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(request) {
  try {
    const { response } = await requireRole(adminRoles);
    if (response) return response;

    let body = {};
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const chatId = String(body?.chat_id || "").trim();
    if (!/^-?\d+$/.test(chatId)) {
      return jsonError("A valid Telegram chat_id is required.", 400);
    }

    const channel = await getPool().query(
      `SELECT user_id
       FROM notification_channels
       WHERE channel = 'telegram'
         AND is_active = TRUE
         AND chat_id = $1
       LIMIT 1`,
      [chatId],
    );
    const recipientUserId = channel.rows[0]?.user_id || null;
    const result = await sendTelegramMessage(chatId, "Telegram connection test from the school management system.");

    await getPool().query(
      `INSERT INTO notifications
        (event_type, recipient_user_id, body, payload, dedupe_key, channel, status, attempts, next_attempt_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, 'telegram', $6, 1, NOW())`,
      [
        "telegram_test",
        recipientUserId,
        "Telegram connection test from the school management system.",
        JSON.stringify({ chat_id: chatId, ok: result.ok }),
        `telegram_test:${chatId}:${Date.now()}`,
        result.ok ? "sent" : "failed",
      ],
    );

    if (!result.ok) {
      return jsonError("The Telegram bot could not send the test message.", 502);
    }
    return NextResponse.json({ ok: true, status: "sent", chat_id: chatId });
  } catch (error) {
    console.error("Could not send Telegram test message.", error);
    return jsonError("Could not send Telegram test message.", 503);
  }
}
