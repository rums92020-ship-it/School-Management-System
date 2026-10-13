import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "../../../../../../lib/auth";
import { getPool } from "../../../../../../lib/db";
import { jsonError, parseUuid } from "../../../../../../lib/timetable";

export const runtime = "nodejs";
const printRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];

export async function POST(_request, { params }) {
  try {
    const { response } = await requireRole(printRoles);
    if (response) return response;
    const { id } = await params;
    if (!parseUuid(id)) return jsonError("Invalid room ID.", 400);
    const token = randomBytes(32).toString("base64url");
    const result = await getPool().query(
      "UPDATE rooms SET qr_token = $2 WHERE id = $1 RETURNING id, name, qr_token",
      [id, token],
    );
    if (!result.rowCount) return jsonError("Room not found.", 404);
    return NextResponse.json({ room: result.rows[0] });
  } catch {
    console.error("Could not regenerate room QR.");
    return NextResponse.json({ error: "Could not regenerate room QR." }, { status: 503 });
  }
}
