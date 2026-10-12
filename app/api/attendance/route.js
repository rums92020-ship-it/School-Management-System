import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

const managers = ["director", "deputy_director"];
const viewAll = [...managers, "office_head", "office_deputy", "office_staff"];
const attendanceEditors = [...managers, "dept_head", "dept_deputy", "teacher"];

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function forbidden(message = "You do not have permission to access these attendance records.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function GET(request) {
  try {
    const { user, response } = await requireRole(roles);
    if (response) return response;
    const date = new URL(request.url).searchParams.get("date");
    if (!isValidDate(date)) return badRequest("A valid date in YYYY-MM-DD format is required.");

    const pool = getPool();
    let result;
    if (viewAll.includes(user.role)) {
      result = await pool.query(
        "SELECT student_id AS id, status FROM attendance_records WHERE attendance_date = $1",
        [date],
      );
    } else if (user.role === "dept_head" || user.role === "dept_deputy") {
      if (!user.department) return forbidden("Department access is not configured for this account.");
      result = await pool.query(
        `SELECT attendance.student_id AS id, attendance.status
         FROM attendance_records attendance
         JOIN students ON students.student_id = attendance.student_id
         WHERE attendance.attendance_date = $1 AND students.major = $2`,
        [date, user.department],
      );
    } else if (user.role === "teacher") {
      if (!user.teacher_id) return forbidden("Teacher access is not linked to a teacher record.");
      result = await pool.query(
        `SELECT attendance.student_id AS id, attendance.status
         FROM attendance_records attendance
         JOIN students ON students.student_id = attendance.student_id
         WHERE attendance.attendance_date = $1
           AND students.class_name IN (
             SELECT class_name FROM teachers WHERE teacher_id = $2
           )`,
        [date, user.teacher_id],
      );
    } else if (user.role === "student") {
      if (!user.student_id) return forbidden("Student access is not linked to a student record.");
      result = await pool.query(
        `SELECT student_id AS id, status FROM attendance_records
         WHERE attendance_date = $1 AND student_id = $2`,
        [date, user.student_id],
      );
    } else {
      if (!user.id) return forbidden("Guardian access is not configured.");
      result = await pool.query(
        `SELECT attendance.student_id AS id, attendance.status
         FROM attendance_records attendance
         JOIN guardian_students ON guardian_students.student_id = attendance.student_id
         WHERE attendance.attendance_date = $1 AND guardian_students.guardian_user_id = $2`,
        [date, user.id],
      );
    }
    return NextResponse.json({ records: result.rows });
  } catch (error) {
    console.error("Could not load attendance records from PostgreSQL.", error);
    return NextResponse.json({ error: "Could not load attendance records." }, { status: 503 });
  }
}

export async function PUT() {
  try {
    const { response } = await requireRole(attendanceEditors);
    if (response) return response;
    return NextResponse.json(
      { error: "Daily attendance writes are disabled. Record attendance for a class session instead." },
      { status: 409 },
    );
  } catch (error) {
    console.error("Could not save attendance records to PostgreSQL.", error);
    return NextResponse.json({ error: "Could not save attendance records." }, { status: 503 });
  }
}
