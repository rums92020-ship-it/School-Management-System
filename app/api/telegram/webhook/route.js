import { NextResponse } from "next/server";
import { getPool } from "../../../../lib/db";
import { rateLimit } from "../../../../lib/rate-limit";
import { constantTimeEqual, hashLinkToken } from "../../../../lib/notifications";
import { jsonError } from "../../../../lib/timetable";

export const runtime = "nodejs";

async function reply(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    console.error("Telegram webhook reply failed.");
  }
}

export async function POST(request) {
  if (!rateLimit(request, "telegram-webhook", 60, 60_000)) {
    return jsonError("Too many requests.", 429);
  }
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const supplied = request.headers.get("x-telegram-bot-api-secret-token") || "";
  if (!expected || !constantTimeEqual(supplied, expected)) {
    return jsonError("Unauthorized.", 401);
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return jsonError("Invalid JSON request body.", 400);
  }
  const message = update?.message;
  const text = typeof message?.text === "string" ? message.text.trim() : "";
  const chatId = message?.chat?.id;
  if ((typeof chatId !== "string" && typeof chatId !== "number") || !Number.isFinite(Number(chatId))) {
    return NextResponse.json({ ok: true });
  }

  if (text === "/stop") {
    try {
      await getPool().query(
        `UPDATE notification_channels
         SET is_active = FALSE
         WHERE channel = 'telegram' AND chat_id = $1`,
        [String(chatId)],
      );
      await reply(chatId, "ការជូនដំណឹងតាម Telegram ត្រូវបានបិទ។");
    } catch {
      console.error("Could not disconnect Telegram channel.");
      return jsonError("Could not process Telegram update.", 503);
    }
    return NextResponse.json({ ok: true });
  }

  const start = text.match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{43,})$/);
  if (!start) return NextResponse.json({ ok: true });

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const link = await client.query(
      `SELECT id, guardian_user_id
       FROM channel_link_tokens
       WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL
       FOR UPDATE`,
      [hashLinkToken(start[1])],
    );
    if (!link.rowCount) {
      await client.query("ROLLBACK");
      await reply(chatId, "តំណភ្ជាប់មិនត្រឹមត្រូវ ឬផុតកំណត់។ សូមស្នើតំណថ្មី។");
      return NextResponse.json({ ok: true });
    }
    await client.query(
      `INSERT INTO notification_channels (user_id, channel, chat_id, is_active)
       VALUES ($1, 'telegram', $2, TRUE)
       ON CONFLICT (user_id, channel)
       DO UPDATE SET chat_id = EXCLUDED.chat_id, is_active = TRUE`,
      [link.rows[0].guardian_user_id, String(chatId)],
    );
    await client.query(
      "UPDATE channel_link_tokens SET used_at = NOW() WHERE id = $1",
      [link.rows[0].id],
    );
    await client.query("COMMIT");
    await reply(chatId, "ការជូនដំណឹងតាម Telegram ត្រូវបានបើក។");
    return NextResponse.json({ ok: true });
  } catch {
    await client.query("ROLLBACK");
    console.error("Could not link Telegram channel.");
    return jsonError("Could not process Telegram update.", 503);
  } finally {
    client.release();
  }
}
