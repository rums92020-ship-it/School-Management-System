import { NextResponse } from "next/server";
import { requireRole } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

const managers = ["director", "deputy_director", "office_head", "office_deputy"];

export async function POST(request) {
  try {
    const { response } = await requireRole(managers);
    if (response) return response;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid study level request body." }, { status: 400 });
    }
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

export async function DELETE() {
  try {
    const { response } = await requireRole(managers);
    if (response) return response;
    return NextResponse.json({ error: "Deleting study levels is not permitted." }, { status: 403 });
  } catch (error) {
    console.error("Could not delete study level from PostgreSQL.", error);
    return NextResponse.json({ error: "Could not delete study level." }, { status: 503 });
  }
}
