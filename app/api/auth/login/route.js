import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminCredentials,
  hashPassword,
  roleLabels,
  sessionCookieName,
  sessionCookieOptions,
  verifyAdminCredentials,
  verifyPassword,
} from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
    }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || username.length > 120 || !password || password.length > 1024) {
      return NextResponse.json({ error: "Enter a valid username and password." }, { status: 400 });
    }

    const accountResult = await getPool().query(
      `SELECT id, username, password_hash, full_name AS name, role, is_active
       FROM users WHERE username = $1`,
      [username],
    );
    const account = accountResult.rows[0];
    let session;
    let user;
    if (account) {
      if (!account.is_active || !await verifyPassword(password, account.password_hash)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
      }
      session = { username: account.username, userId: account.id, role: account.role };
      user = { id: account.id, username: account.username, name: account.name, role: account.role };
    } else if (verifyAdminCredentials(username, password)) {
      session = { username, role: "director", bootstrap: true };
      user = { id: null, username, name: username, role: "director" };
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const response = NextResponse.json({
      user: { ...user, roleLabel: roleLabels[user.role] },
    });
    response.cookies.set(sessionCookieName, createSessionToken(session), sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    console.error("Could not authenticate administrator.", error);
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
}
