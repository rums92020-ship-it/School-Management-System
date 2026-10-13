import { NextResponse } from "next/server";
import { requireRole } from "../../../../../lib/auth";
import { getPool } from "../../../../../lib/db";

export const runtime = "nodejs";
const printRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function GET() {
  try {
    const { response } = await requireRole(printRoles);
    if (response) return response;
    const result = await getPool().query(
      "SELECT id, name, qr_token FROM rooms ORDER BY name",
    );
    return NextResponse.json({ rooms: result.rows });
  } catch {
    console.error("Could not load room QR cards.");
    return NextResponse.json({ error: "Could not load room QR cards." }, { status: 503 });
  }
}
