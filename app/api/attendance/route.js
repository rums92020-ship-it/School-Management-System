import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

const managers = ["director", "deputy_director"];
const viewAll = [...managers, "office_head", "office_deputy", "office_staff"];
const attendanceEditors = [...managers, "dept_head", "dept_deputy", "teacher"];
const validStatuses = ["Present", "Absent", "Late"];

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

export async function PUT(request) {
  try {
    const { user, response } = await requireRole(attendanceEditors);
    if (response) return response;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        !isValidDate(body.date) || !Array.isArray(body.records) || body.records.length > 1000) {
      return badRequest("Provide a valid attendance date and up to 1000 records.");
    }

    const seenStudentIds = new Set();
    for (const record of body.records) {
      if (!record || typeof record.studentId !== "string" || !record.studentId.trim() ||
          record.studentId.length > 40 || !validStatuses.includes(record.status)) {
        return badRequest("Each attendance record needs a student ID and a valid status.");
      }
      if (seenStudentIds.has(record.studentId.trim())) {
        return badRequest("A student can appear only once in an attendance request.");
      }
      seenStudentIds.add(record.studentId.trim());
    }

    const studentIds = [...seenStudentIds];
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (studentIds.length) {
        const existing = await client.query(
          "SELECT student_id FROM students WHERE student_id = ANY($1::varchar[])",
          [studentIds],
        );
        const existingIds = new Set(existing.rows.map(row => row.student_id));
        if (studentIds.some(id => !existingIds.has(id))) {
          await client.query("ROLLBACK");
          return badRequest("Attendance references a student that does not exist.");
        }

        let scoped;
        if (user.role === "teacher") {
          if (!user.teacher_id) {
            await client.query("ROLLBACK");
            return forbidden("Teacher access is not linked to a teacher record.");
          }
          const teacher = await client.query(
            "SELECT class_name FROM teachers WHERE teacher_id = $1",
            [user.teacher_id],
          );
          if (!teacher.rows.length) {
            await client.query("ROLLBACK");
            return forbidden("Teacher access is not linked to a teacher record.");
          }
          scoped = await client.query(
            `SELECT student_id FROM students
             WHERE student_id = ANY($1::varchar[])
               AND class_name = ANY($2::varchar[])`,
            [studentIds, teacher.rows.map(row => row.class_name)],
          );
        } else if (user.role === "dept_head" || user.role === "dept_deputy") {
          if (!user.department) {
            await client.query("ROLLBACK");
            return forbidden("Department access is not configured for this account.");
          }
          scoped = await client.query(
            `SELECT student_id FROM students
             WHERE student_id = ANY($1::varchar[]) AND major = $2`,
            [studentIds, user.department],
          );
        } else {
          scoped = { rows: studentIds.map(student_id => ({ student_id })) };
        }

        const scopedIds = new Set(scoped.rows.map(row => row.student_id));
        if (studentIds.some(id => !scopedIds.has(id))) {
          await client.query("ROLLBACK");
          return forbidden();
        }

        for (const record of body.records) {
          await client.query(
            `INSERT INTO attendance_records (attendance_date, student_id, status)
             VALUES ($1, $2, $3)
             ON CONFLICT (attendance_date, student_id)
             DO UPDATE SET status = EXCLUDED.status`,
            [body.date, record.studentId.trim(), record.status],
          );
        }
      }
      await client.query("COMMIT");
      return NextResponse.json({ saved: body.records.length });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23503") return badRequest("Attendance references a student that does not exist.");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON request body.");
    console.error("Could not save attendance records to PostgreSQL.", error);
    return NextResponse.json({ error: "Could not save attendance records." }, { status: 503 });
  }
}
