import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAuthenticatedUser,
  hashPassword,
  sessionCookieName,
  sessionCookieOptions,
  verifyAdminCredentials,
  verifyPassword,
} from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (response) return response;

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        typeof body.currentPassword !== "string" || typeof body.newPassword !== "string" ||
        body.currentPassword.length > 1024 || body.newPassword.length < 12 || body.newPassword.length > 1024) {
      return NextResponse.json({
        error: "Provide your current password and a new password of at least 12 characters.",
      }, { status: 400 });
    }

    const pool = getPool();
    let session;
    if (user.bootstrap) {
      if (!verifyAdminCredentials(user.username, body.currentPassword)) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      const passwordHash = await hashPassword(body.newPassword);
      const saved = await pool.query(
        `INSERT INTO users (username, password_hash, full_name, role)
         VALUES ($1, $2, $3, 'director')
         RETURNING id, username`,
        [user.username, passwordHash, user.name],
      );
      session = {
        username: saved.rows[0].username,
        userId: saved.rows[0].id,
        role: "director",
      };
    } else {
      const account = await pool.query(
        "SELECT password_hash FROM users WHERE id = $1 AND is_active = TRUE",
        [user.id],
      );
      if (!account.rows[0] || !await verifyPassword(body.currentPassword, account.rows[0].password_hash)) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      const passwordHash = await hashPassword(body.newPassword);
      const update = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2 AND is_active = TRUE",
        [passwordHash, user.id],
      );
      if (!update.rowCount) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      session = { username: user.username, userId: user.id, role: user.role };
    }

    const result = NextResponse.json({ ok: true });
    result.cookies.set(sessionCookieName, createSessionToken(session), sessionCookieOptions());
    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    if (error.code === "23505") {
      return NextResponse.json({ error: "The bootstrap administrator account conflicts with an existing username." }, { status: 409 });
    }
    console.error("Could not change account password.", error);
    return NextResponse.json({ error: "Could not change password." }, { status: 503 });
  }
}
