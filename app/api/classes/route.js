import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  leadershipRoles,
  managementRoles,
  parsePositiveId,
} from "../../../lib/timetable";

export const runtime = "nodejs";

const classEditors = [...managementRoles];
const activeRoles = [...roles];

export async function GET() {
  try {
    const { user, response } = await requireRole(activeRoles);
    if (response) return response;
    const pool = getPool();
    let result;
    if (user.role === "teacher" && user.teacher_id) {
      result = await pool.query(
        `SELECT classes.class_id, classes.name, classes.study_level, classes.academic_year,
          classes.shift_id, shifts.code AS shift_code, classes.is_active
         FROM classes JOIN shifts ON shifts.id = classes.shift_id
         JOIN class_teachers ON class_teachers.class_id = classes.class_id
         WHERE class_teachers.teacher_id = $1
         ORDER BY classes.academic_year DESC, classes.name`,
        [user.teacher_id],
      );
    } else if (user.role === "student" && user.student_id) {
      result = await pool.query(
        `SELECT classes.class_id, classes.name, classes.study_level, classes.academic_year,
          classes.shift_id, shifts.code AS shift_code, classes.is_active
         FROM classes JOIN shifts ON shifts.id = classes.shift_id
         JOIN class_students ON class_students.class_id = classes.class_id
         WHERE class_students.student_id = $1
         ORDER BY classes.academic_year DESC, classes.name`,
        [user.student_id],
      );
    } else if (user.role === "guardian" && user.id) {
      result = await pool.query(
        `SELECT DISTINCT classes.class_id, classes.name, classes.study_level, classes.academic_year,
          classes.shift_id, shifts.code AS shift_code, classes.is_active
         FROM classes JOIN shifts ON shifts.id = classes.shift_id
         JOIN class_students ON class_students.class_id = classes.class_id
         JOIN guardian_students ON guardian_students.student_id = class_students.student_id
         WHERE guardian_students.guardian_user_id = $1
         ORDER BY classes.academic_year DESC, classes.name`,
        [user.id],
      );
    } else if ((user.role === "dept_head" || user.role === "dept_deputy") && user.department) {
      result = await pool.query(
        `SELECT DISTINCT classes.class_id, classes.name, classes.study_level, classes.academic_year,
          classes.shift_id, shifts.code AS shift_code, classes.is_active
         FROM classes JOIN shifts ON shifts.id = classes.shift_id
         JOIN timetable_slots ON timetable_slots.class_id = classes.class_id
         JOIN subjects ON subjects.subject_id = timetable_slots.subject_id
         WHERE subjects.department = $1
         ORDER BY classes.academic_year DESC, classes.name`,
        [user.department],
      );
    } else if (["teacher", "student", "guardian", "dept_head", "dept_deputy"].includes(user.role)) {
      result = { rows: [] };
    } else {
      result = await pool.query(
        `SELECT classes.class_id, classes.name, classes.study_level, classes.academic_year,
          classes.shift_id, shifts.code AS shift_code, classes.is_active
         FROM classes JOIN shifts ON shifts.id = classes.shift_id
         ORDER BY classes.academic_year DESC, classes.name`,
      );
    }
    return NextResponse.json({ classes: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load classes.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(classEditors);
    if (response) return response;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100 ||
        typeof body.academic_year !== "string" || !body.academic_year.trim() || body.academic_year.trim().length > 30 ||
        !Number.isSafeInteger(body.shift_id) || body.shift_id < 1 ||
        (body.study_level !== undefined && body.study_level !== null &&
          (typeof body.study_level !== "string" || body.study_level.length > 80))) {
      return jsonError("Class name, academic year, and shift are required; study level must be valid.", 400);
    }
    const result = await getPool().query(
      `INSERT INTO classes (name, study_level, academic_year, shift_id)
       VALUES ($1, $2, $3, $4)
       RETURNING class_id, name, study_level, academic_year, shift_id, is_active`,
      [body.name.trim(), body.study_level?.trim() || null, body.academic_year.trim(), body.shift_id],
    );
    return NextResponse.json({ class: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("A class with that name already exists in this academic year.", 409);
    if (error.code === "23503") return jsonError("The selected shift or study level does not exist.", 400);
    return databaseUnavailableResponse(error, "Could not create class.");
  }
}

export async function PATCH(request) {
  try {
    const { response } = await requireRole(classEditors);
    if (response) return response;
    const body = await request.json();
    const id = parsePositiveId(body?.class_id);
    if (!id || typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100 ||
        typeof body.academic_year !== "string" || !body.academic_year.trim() || body.academic_year.trim().length > 30 ||
        !Number.isSafeInteger(body.shift_id) || body.shift_id < 1 ||
        (body.study_level !== undefined && body.study_level !== null &&
          (typeof body.study_level !== "string" || body.study_level.length > 80)) ||
        (body.is_active !== undefined && typeof body.is_active !== "boolean")) {
      return jsonError("Provide a valid class ID, name, academic year, shift, and optional study level/status.", 400);
    }
    const result = await getPool().query(
      `UPDATE classes
       SET name = $1, study_level = $2, academic_year = $3, shift_id = $4,
           is_active = COALESCE($5, is_active)
       WHERE class_id = $6
       RETURNING class_id, name, study_level, academic_year, shift_id, is_active`,
      [body.name.trim(), body.study_level?.trim() || null, body.academic_year.trim(), body.shift_id, body.is_active ?? null, id],
    );
    if (!result.rowCount) return jsonError("Class not found.", 404);
    return NextResponse.json({ class: result.rows[0] });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("A class with that name already exists in this academic year.", 409);
    if (error.code === "23503") return jsonError("The selected shift or study level does not exist.", 400);
    return databaseUnavailableResponse(error, "Could not update class.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const id = parsePositiveId(new URL(request.url).searchParams.get("id"));
    if (!id) return jsonError("Provide a valid class ID.", 400);
    const result = await getPool().query("DELETE FROM classes WHERE class_id = $1 RETURNING class_id", [id]);
    if (!result.rowCount) return jsonError("Class not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "23503") return jsonError("This class has timetable or session records and cannot be deleted.", 409);
    return databaseUnavailableResponse(error, "Could not delete class.");
  }
}
