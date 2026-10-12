import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  managementRoles,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { response } = await requireRole([
      "director", "deputy_director", "office_head", "office_deputy", "office_staff",
      "dept_head", "dept_deputy", "teacher", "student", "guardian",
    ]);
    if (response) return response;
    const classId = Number(new URL(request.url).searchParams.get("class_id"));
    if (!Number.isSafeInteger(classId) || classId < 1) return jsonError("Provide a valid class ID.", 400);
    const result = await getPool().query(
      `SELECT teachers.teacher_id, teachers.name, teachers.name_khmer,
        teachers.name_english, teachers.subject
       FROM class_teachers
       JOIN teachers ON teachers.teacher_id = class_teachers.teacher_id
       WHERE class_teachers.class_id = $1
       ORDER BY teachers.teacher_id`,
      [classId],
    );
    return NextResponse.json({ teachers: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load class teachers.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(managementRoles);
    if (response) return response;
    const body = await request.json();
    if (!body || !Number.isSafeInteger(body.class_id) || body.class_id < 1 ||
        typeof body.teacher_id !== "string" || !body.teacher_id.trim() || body.teacher_id.length > 40) {
      return jsonError("Provide a valid class ID and teacher ID.", 400);
    }
    await getPool().query(
      "INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2)",
      [body.class_id, body.teacher_id.trim()],
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("That teacher is already assigned to this class.", 409);
    if (error.code === "23503") return jsonError("The class or teacher does not exist.", 404);
    return databaseUnavailableResponse(error, "Could not assign class teacher.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(managementRoles);
    if (response) return response;
    const url = new URL(request.url);
    const classId = Number(url.searchParams.get("class_id"));
    const teacherId = url.searchParams.get("teacher_id");
    if (!Number.isSafeInteger(classId) || classId < 1 || !teacherId || teacherId.length > 40) {
      return jsonError("Provide a valid class ID and teacher ID.", 400);
    }
    const result = await getPool().query(
      "DELETE FROM class_teachers WHERE class_id = $1 AND teacher_id = $2 RETURNING class_id",
      [classId, teacherId],
    );
    if (!result.rowCount) return jsonError("Class-teacher assignment not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "23503") return jsonError("This teacher is still referenced by a timetable slot.", 409);
    return databaseUnavailableResponse(error, "Could not remove class teacher.");
  }
}
