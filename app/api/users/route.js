import { NextResponse } from "next/server";
import { getAdminCredentials, hashPassword, requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

const managers = ["director", "deputy_director"];

function invalid(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function validText(value, maxLength, required = false) {
  return typeof value === "string" &&
    value.trim().length <= maxLength &&
    (!required || value.trim().length > 0);
}

export async function GET() {
  try {
    const { response } = await requireRole(managers);
    if (response) return response;

    const pool = getPool();
    const [users, students] = await Promise.all([
      pool.query(
        `SELECT users.id, users.username, users.full_name AS "fullName", users.role,
          users.department, users.student_id AS "studentId",
          users.teacher_id AS "teacherId", users.is_active AS "isActive",
          users.created_at AS "createdAt",
          ARRAY(
            SELECT guardian_students.student_id
            FROM guardian_students
            WHERE guardian_students.guardian_user_id = users.id
            ORDER BY guardian_students.student_id
          ) AS "guardianStudentIds"
         FROM users ORDER BY users.created_at DESC, users.username`,
      ),
      pool.query(
        `SELECT student_id AS id,
          COALESCE(name_english, name_khmer) AS name,
          class_name AS "className"
         FROM students ORDER BY student_id`,
      ),
    ]);
    return NextResponse.json({ users: users.rows, students: students.rows });
  } catch (error) {
    console.error("Could not load user management data.", error);
    return NextResponse.json({ error: "Could not load user management data." }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(managers);
    if (response) return response;

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        !validText(body.username, 120, true) ||
        !/^[A-Za-z0-9._-]+$/.test(body.username.trim()) ||
        !validText(body.fullName, 160, true) ||
        !roles.includes(body.role) ||
        typeof body.password !== "string" || body.password.length < 12 || body.password.length > 1024) {
      return invalid("Provide a valid username, full name, role, and password of at least 12 characters.");
    }
    if (body.username.trim() === getAdminCredentials().username) {
      return invalid("This username is reserved for the environment bootstrap administrator.");
    }
    if (body.department !== undefined && body.department !== null && !validText(body.department, 120)) {
      return invalid("Department must be text of at most 120 characters.");
    }
    if (body.studentId !== undefined && body.studentId !== null && !validText(body.studentId, 40)) {
      return invalid("Student ID must be text of at most 40 characters.");
    }
    if (body.teacherId !== undefined && body.teacherId !== null && !validText(body.teacherId, 40)) {
      return invalid("Teacher ID must be text of at most 40 characters.");
    }
    const guardianStudentIds = body.guardianStudentIds ?? [];
    if (!Array.isArray(guardianStudentIds) || guardianStudentIds.length > 1000 ||
        guardianStudentIds.some(id => typeof id !== "string" || !id.trim() || id.length > 40)) {
      return invalid("Guardian student links must be a list of valid student IDs.");
    }

    const roleNeedsDepartment = ["dept_head", "dept_deputy"].includes(body.role);
    const roleNeedsStudent = body.role === "student";
    const roleNeedsTeacher = body.role === "teacher";
    if ((roleNeedsDepartment && !body.department?.trim()) ||
        (roleNeedsStudent && !body.studentId?.trim()) ||
        (roleNeedsTeacher && !body.teacherId?.trim()) ||
        (body.role === "guardian" && guardianStudentIds.length === 0)) {
      return invalid("This role requires a department, linked student, linked teacher, or at least one guardian student as appropriate.");
    }
    if (body.role !== "student" && body.studentId ||
        body.role !== "teacher" && body.teacherId ||
        !roleNeedsDepartment && body.department) {
      return invalid("Department, student, and teacher links must match the selected role.");
    }

    const pool = getPool();
    const passwordHash = await hashPassword(body.password);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const created = await client.query(
        `INSERT INTO users
          (username, password_hash, full_name, role, department, student_id, teacher_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, username, full_name AS "fullName", role`,
        [
          body.username.trim(),
          passwordHash,
          body.fullName.trim(),
          body.role,
          roleNeedsDepartment ? body.department.trim() : null,
          roleNeedsStudent ? body.studentId.trim() : null,
          roleNeedsTeacher ? body.teacherId.trim() : null,
        ],
      );
      if (body.role === "guardian") {
        for (const studentId of [...new Set(guardianStudentIds.map(id => id.trim()))]) {
          await client.query(
            "INSERT INTO guardian_students (guardian_user_id, student_id) VALUES ($1, $2)",
            [created.rows[0].id, studentId],
          );
        }
      }
      await client.query("COMMIT");
      return NextResponse.json({ user: created.rows[0] }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") return NextResponse.json({ error: "That username is already in use." }, { status: 409 });
      if (error.code === "23503") return invalid("The selected student or teacher record does not exist.");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return invalid("Invalid JSON request body.");
    console.error("Could not create user.", error);
    return NextResponse.json({ error: "Could not create user." }, { status: 503 });
  }
}

export async function PATCH(request) {
  try {
    const { user: actor, response } = await requireRole(managers);
    if (response) return response;

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        typeof body.userId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.userId)) {
      return invalid("Provide a valid user ID.");
    }
    if (body.action === "deactivate") {
      if (actor.id === body.userId) return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 403 });
      const result = await getPool().query(
        "UPDATE users SET is_active = FALSE WHERE id = $1 AND is_active = TRUE",
        [body.userId],
      );
      if (!result.rowCount) return NextResponse.json({ error: "Active user not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "reset-password") {
      if (typeof body.password !== "string" || body.password.length < 12 || body.password.length > 1024) {
        return invalid("The new password must be at least 12 characters.");
      }
      const passwordHash = await hashPassword(body.password);
      const result = await getPool().query(
        "UPDATE users SET password_hash = $1 WHERE id = $2 AND is_active = TRUE",
        [passwordHash, body.userId],
      );
      if (!result.rowCount) return NextResponse.json({ error: "Active user not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    return invalid("Unsupported user management action.");
  } catch (error) {
    if (error instanceof SyntaxError) return invalid("Invalid JSON request body.");
    console.error("Could not update user.", error);
    return NextResponse.json({ error: "Could not update user." }, { status: 503 });
  }
}
