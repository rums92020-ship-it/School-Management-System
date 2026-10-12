import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  authorizeClass,
  databaseUnavailableResponse,
  jsonError,
  parseUuid,
  termManagerRoles,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, response } = await requireRole([
      "director", "deputy_director", "office_head", "office_deputy", "office_staff",
      "dept_head", "dept_deputy", "teacher", "student", "guardian",
    ]);
    if (response) return response;
    const classId = parseUuid(new URL(request.url).searchParams.get("class_id"));
    if (!classId) return jsonError("Provide a valid class ID.", 400);
    const client = await getPool().connect();
    try {
      if (!await authorizeClass(client, user, classId)) {
        return jsonError("You do not have permission to view this class.", 403);
      }
      const values = [classId];
      let scope = "";
      if (user.role === "student") {
        values.push(user.student_id);
        scope = ` AND students.student_id = $${values.length}`;
      } else if (user.role === "guardian") {
        values.push(user.id);
        scope = ` AND EXISTS (
          SELECT 1 FROM guardian_students
          WHERE guardian_students.guardian_user_id = $${values.length}
            AND guardian_students.student_id = students.student_id
        )`;
      } else if (["dept_head", "dept_deputy"].includes(user.role)) {
        values.push(user.department);
        scope = ` AND students.major = $${values.length}`;
      } else if (user.role === "teacher" && !user.teacher_id) {
        return jsonError("Teacher account is not linked to a teacher record.", 403);
      }
      const result = await client.query(
        `SELECT students.student_id, students.name_english, students.name_khmer,
          students.class_name
         FROM class_students
         JOIN students ON students.student_id = class_students.student_id
         WHERE class_students.class_id = $1::uuid ${scope}
         ORDER BY students.student_id`,
        values,
      );
      return NextResponse.json({ students: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load class enrollment.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const body = await request.json();
    if (!body || !parseUuid(body.class_id) ||
        typeof body.student_id !== "string" || !body.student_id.trim() || body.student_id.length > 40) {
      return jsonError("Provide a valid class ID and student ID.", 400);
    }
    await getPool().query(
      "INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)",
      [body.class_id, body.student_id.trim()],
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("This student is already enrolled in this class.", 409);
    if (error.code === "23503") return jsonError("The class or student does not exist.", 404);
    return databaseUnavailableResponse(error, "Could not enroll student.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const url = new URL(request.url);
    const classId = parseUuid(url.searchParams.get("class_id"));
    const studentId = url.searchParams.get("student_id");
    if (!classId || !studentId || studentId.length > 40) {
      return jsonError("Provide a valid class ID and student ID.", 400);
    }
    const result = await getPool().query(
      "DELETE FROM class_students WHERE class_id = $1 AND student_id = $2 RETURNING class_id",
      [classId, studentId],
    );
    if (!result.rowCount) return jsonError("Class enrollment not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not remove student enrollment.");
  }
}
