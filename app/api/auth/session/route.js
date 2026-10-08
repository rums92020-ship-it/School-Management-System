import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.json({ user: { ...session, name: session.username, role: "School Administrator" } });
  } catch (error) {
    console.error("Could not verify administrator session.", error);
    return NextResponse.json({ error: "Authentication is not configured. Check the server environment." }, { status: 503 });
  }
}
