import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(verifySessionToken(cookieStore.get(sessionCookieName)?.value));
}

export async function POST(request) {
  try {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return NextResponse.json({ error: "Study level name must be 1–80 characters." }, { status: 400 });
    await getPool().query("INSERT INTO study_levels (name) VALUES ($1)", [name]);
    return NextResponse.json({ name }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ error: "This study level already exists." }, { status: 409 });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    console.error("Could not save study level to PostgreSQL.", error);
    return NextResponse.json({ error: "Could not save study level." }, { status: 503 });
  }
}

export async function DELETE(request) {
  try {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const name = new URL(request.url).searchParams.get("name")?.trim();
    if (!name) return NextResponse.json({ error: "A study level name is required." }, { status: 400 });
    const result = await getPool().query("DELETE FROM study_levels WHERE name = $1", [name]);
    if (!result.rowCount) return NextResponse.json({ error: "Study level not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete study level from PostgreSQL.", error);
    return NextResponse.json({ error: "Could not delete study level." }, { status: 503 });
  }
}
