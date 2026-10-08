import { NextResponse } from "next/server";
import { createSessionToken, getAdminCredentials, sessionCookieName, sessionCookieOptions, verifyAdminCredentials } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    getAdminCredentials();
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const response = NextResponse.json({ user: { username, name: username, role: "School Administrator" } });
    response.cookies.set(sessionCookieName, createSessionToken(username), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Could not authenticate administrator.", error);
    return NextResponse.json({ error: "Authentication is not configured. Check the server environment." }, { status: 503 });
  }
}
