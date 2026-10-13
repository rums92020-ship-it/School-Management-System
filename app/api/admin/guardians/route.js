import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";

export const runtime = "nodejs";
const officeRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function GET() {
  try {
    const { response } = await requireRole(officeRoles);
    if (response) return response;
    const result = await getPool().query(
      `SELECT id, full_name
       FROM users
       WHERE role = 'guardian' AND is_active = TRUE
       ORDER BY full_name`,
    );
    return NextResponse.json({ guardians: result.rows });
  } catch {
    console.error("Could not load guardian accounts.");
    return NextResponse.json({ error: "Could not load guardian accounts." }, { status: 503 });
  }
}
