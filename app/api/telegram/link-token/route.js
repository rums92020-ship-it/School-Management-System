import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { hashLinkToken } from "../../../../lib/notifications";
import { jsonError, parseUuid } from "../../../../lib/timetable";

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

    const guardianId = parseUuid(body?.guardian_user_id);
    if (!guardianId) {
      return jsonError("A valid guardian_user_id is required.", 400);
    }

    const username = process.env.TELEGRAM_BOT_USERNAME;
    if (!username || !/^[A-Za-z0-9_]{5,32}$/.test(username)) {
      return jsonError("Telegram bot is not configured.", 503);
    }

    const guardian = await getPool().query(
      "SELECT id FROM users WHERE id = $1 AND role = 'guardian' AND is_active = TRUE",
      [guardianId],
    );
    if (!guardian.rowCount) {
      return jsonError("Guardian account not found.", 404);
    }

    const token = randomBytes(24).toString("base64url");
    await getPool().query(
      `INSERT INTO channel_link_tokens
        (guardian_user_id, token_hash, created_by, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 minutes')`,
      [guardianId, hashLinkToken(token), guardianId],
    );

    return NextResponse.json({
      token,
      url: `https://t.me/${username}?start=${token}`,
      expires_in_seconds: 1800,
    }, { status: 201 });
  } catch (error) {
    console.error("Could not create Telegram link token.", error);
    return jsonError("Could not create Telegram link token.", 503);
  }
}
