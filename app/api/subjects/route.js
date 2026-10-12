import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  managementRoles,
  parsePositiveId,
} from "../../../lib/timetable";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const result = ["dept_head", "dept_deputy"].includes(user.role) && user.department
      ? await getPool().query(
        "SELECT subject_id, name, department, is_active FROM subjects WHERE department = $1 OR department IS NULL ORDER BY name",
        [user.department],
      )
      : await getPool().query("SELECT subject_id, name, department, is_active FROM subjects ORDER BY name");
    return NextResponse.json({ subjects: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load subjects.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(managementRoles);
    if (response) return response;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120 ||
        (body.department !== undefined && body.department !== null &&
          (typeof body.department !== "string" || body.department.length > 100))) {
      return jsonError("Provide a valid subject name and optional department.", 400);
    }
    const result = await getPool().query(
      "INSERT INTO subjects (name, department) VALUES ($1, $2) RETURNING subject_id, name, department, is_active",
      [body.name.trim(), body.department?.trim() || null],
    );
    return NextResponse.json({ subject: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("That subject already exists.", 409);
    return databaseUnavailableResponse(error, "Could not create subject.");
  }
}

export async function PATCH(request) {
  try {
    const { response } = await requireRole(managementRoles);
    if (response) return response;
    const body = await request.json();
    const id = parsePositiveId(body?.subject_id);
    if (!id || typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120 ||
        (body.department !== undefined && body.department !== null &&
          (typeof body.department !== "string" || body.department.length > 100)) ||
        (body.is_active !== undefined && typeof body.is_active !== "boolean")) {
      return jsonError("Provide a valid subject ID, name, department, and status.", 400);
    }
    const result = await getPool().query(
      `UPDATE subjects SET name = $1, department = $2,
        is_active = COALESCE($3, is_active)
       WHERE subject_id = $4
       RETURNING subject_id, name, department, is_active`,
      [body.name.trim(), body.department?.trim() || null, body.is_active ?? null, id],
    );
    if (!result.rowCount) return jsonError("Subject not found.", 404);
    return NextResponse.json({ subject: result.rows[0] });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("That subject already exists.", 409);
    return databaseUnavailableResponse(error, "Could not update subject.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(["director", "deputy_director"]);
    if (response) return response;
    const id = parsePositiveId(new URL(request.url).searchParams.get("id"));
    if (!id) return jsonError("Provide a valid subject ID.", 400);
    const result = await getPool().query("DELETE FROM subjects WHERE subject_id = $1 RETURNING subject_id", [id]);
    if (!result.rowCount) return jsonError("Subject not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "23503") return jsonError("This subject is used by timetable slots and cannot be deleted.", 409);
    return databaseUnavailableResponse(error, "Could not delete subject.");
  }
}
