import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const pool = getPool();
    const date = new URL(request.url).searchParams.get("date");
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Date must use YYYY-MM-DD." }, { status: 400 });
    }
    const [studentResult, teacherResult, levelResult, attendanceResult] = await Promise.all([
      pool.query(`SELECT student_id AS id, name_english AS "nameEnglish", name_khmer AS "nameKhmer",
        gender, class_name AS "className", major, study_shift AS "studyShift",
        student_group AS "studentGroup", grade, date_of_birth AS "dateOfBirth",
        place_of_birth AS "placeOfBirth", personal_number AS "personalNumber",
        parent_number AS "parentNumber", parent_number AS phone, status
        FROM students ORDER BY created_at DESC, student_id`),
      pool.query(`SELECT teacher_id AS id, name, subject, class_name AS "className", phone, status
        FROM teachers ORDER BY created_at DESC, teacher_id`),
      pool.query("SELECT name FROM study_levels ORDER BY name"),
      pool.query(`SELECT COUNT(*)::int AS recorded,
        COUNT(*) FILTER (WHERE status = 'Present')::int AS present
        FROM attendance_records WHERE attendance_date = COALESCE($1::date, CURRENT_DATE)`, [date]),
    ]);

    return NextResponse.json({
      students: studentResult.rows.map((student) => ({ ...student, name: student.nameEnglish || student.nameKhmer })),
      teachers: teacherResult.rows,
      studyLevels: levelResult.rows.map((row) => row.name),
      attendanceToday: attendanceResult.rows[0],
    });
  } catch (error) {
    console.error("Could not load school records from PostgreSQL.", error);
    return NextResponse.json({ error: "Could not load school data. Check the database connection and schema." }, { status: 503 });
  }
}
