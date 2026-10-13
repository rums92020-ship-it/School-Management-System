import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { rateLimit } from "../../../../lib/rate-limit";
import { hashLinkToken } from "../../../../lib/notifications";
import { jsonError, parseUuid } from "../../../../lib/timetable";

export const runtime = "nodejs";

const linkManagers = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(request) {
  if (!rateLimit(request, "telegram-link", 5, 60_000)) {
    return jsonError("Too many link requests. Try again shortly.", 429);
  }
  try {
    const { user, response } = await requireRole(["guardian", ...linkManagers]);
    if (response) return response;
    let body = {};
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }
    let guardianId = user.id;
    if (user.role !== "guardian") {
      guardianId = parseUuid(body?.guardian_user_id);
      if (!guardianId) return jsonError("A valid guardian_user_id is required.", 400);
    }
    if (user.role === "guardian" && body?.guardian_user_id) {
      return jsonError("Guardians may create a link only for their own account.", 403);
    }
    const username = process.env.TELEGRAM_BOT_USERNAME;
    if (!username || !/^[A-Za-z0-9_]{5,32}$/.test(username)) {
      return jsonError("Telegram linking is not configured.", 503);
    }
    const pool = getPool();
    const guardian = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'guardian' AND is_active = TRUE",
      [guardianId],
    );
    if (!guardian.rowCount) return jsonError("Guardian account not found.", 404);

    const token = randomBytes(32).toString("base64url");
    await pool.query(
      `INSERT INTO channel_link_tokens
        (guardian_user_id, token_hash, created_by, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 minutes')`,
      [guardianId, hashLinkToken(token), user.id],
    );
    return NextResponse.json({
      url: `https://t.me/${username}?start=${token}`,
      expires_in_seconds: 1800,
    }, { status: 201 });
  } catch {
    console.error("Could not create Telegram link.");
    return jsonError("Could not create Telegram link.", 503);
  }
}

export async function DELETE(request) {
  if (!rateLimit(request, "telegram-unlink", 10, 60_000)) {
    return jsonError("Too many requests. Try again shortly.", 429);
  }
  try {
    const { user, response } = await requireRole(["guardian"]);
    if (response) return response;
    const result = await getPool().query(
      `UPDATE notification_channels
       SET is_active = FALSE
       WHERE user_id = $1 AND channel = 'telegram' AND is_active = TRUE`,
      [user.id],
    );
    return NextResponse.json({ disconnected: result.rowCount > 0 });
  } catch {
    console.error("Could not disconnect Telegram channel.");
    return jsonError("Could not disconnect Telegram channel.", 503);
  }
}
