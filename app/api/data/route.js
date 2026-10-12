import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(request) {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (response) return response;

    const date = new URL(request.url).searchParams.get("date");
    if (date && !isValidDate(date)) {
      return NextResponse.json({ error: "Date must use YYYY-MM-DD." }, { status: 400 });
    }

    const values = [];
    let studentFilter = "";
    let teacherFilter = "";
    let attendanceFilter = "";
    let canViewTeachers = false;
    let canViewLevels = false;

    if (["director", "deputy_director", "office_head", "office_deputy", "office_staff"].includes(user.role)) {
      canViewTeachers = true;
      canViewLevels = ["director", "deputy_director", "office_head", "office_deputy"].includes(user.role);
    } else if (["dept_head", "dept_deputy"].includes(user.role)) {
      if (!user.department) return NextResponse.json({ error: "Department access is not configured for this account." }, { status: 403 });
      values.push(user.department);
      studentFilter = "WHERE major = $1";
      teacherFilter = "WHERE subject = $1";
      attendanceFilter = "JOIN students scoped_student ON scoped_student.student_id = attendance_records.student_id WHERE scoped_student.major = $1";
    } else if (user.role === "teacher") {
      if (!user.teacher_id) return NextResponse.json({ error: "Teacher access is not linked to a teacher record." }, { status: 403 });
      values.push(user.teacher_id);
      studentFilter = "WHERE class_name IN (SELECT class_name FROM teachers WHERE teacher_id = $1)";
      teacherFilter = "WHERE teacher_id = $1";
      attendanceFilter = "JOIN students scoped_student ON scoped_student.student_id = attendance_records.student_id WHERE scoped_student.class_name IN (SELECT class_name FROM teachers WHERE teacher_id = $1)";
      canViewTeachers = true;
    } else if (user.role === "student") {
      if (!user.student_id) return NextResponse.json({ error: "Student access is not linked to a student record." }, { status: 403 });
      values.push(user.student_id);
      studentFilter = "WHERE student_id = $1";
      attendanceFilter = "WHERE student_id = $1";
    } else if (user.role === "guardian") {
      if (!user.id) return NextResponse.json({ error: "Guardian access is not configured." }, { status: 403 });
      values.push(user.id);
      studentFilter = "WHERE student_id IN (SELECT student_id FROM guardian_students WHERE guardian_user_id = $1)";
      attendanceFilter = "WHERE student_id IN (SELECT student_id FROM guardian_students WHERE guardian_user_id = $1)";
    }

    const pool = getPool();
    const [studentResult, teacherResult, levelResult, attendanceResult] = await Promise.all([
      pool.query(`SELECT student_id AS id, name_english AS "nameEnglish", name_khmer AS "nameKhmer",
        gender, class_name AS "className", major, study_shift AS "studyShift",
        student_group AS "studentGroup", grade, date_of_birth AS "dateOfBirth",
        place_of_birth AS "placeOfBirth", personal_number AS "personalNumber",
        parent_number AS "parentNumber", parent_number AS phone, status
        FROM students ${studentFilter} ORDER BY created_at DESC, student_id`, values),
      canViewTeachers
        ? pool.query(`SELECT teacher_id AS id, name_khmer AS "nameKhmer",
            CASE WHEN name_khmer IS NULL AND name_english IS NULL THEN name ELSE name_english END AS "nameEnglish",
            subject, class_name AS "className", phone, status
            FROM teachers ${teacherFilter} ORDER BY created_at DESC, teacher_id`, values)
        : Promise.resolve({ rows: [] }),
      canViewLevels
        ? pool.query("SELECT name FROM study_levels ORDER BY name")
        : Promise.resolve({ rows: [] }),
      pool.query(`SELECT COUNT(*)::int AS recorded,
        COUNT(*) FILTER (WHERE attendance_records.status = 'Present')::int AS present
        FROM attendance_records ${attendanceFilter}
        ${attendanceFilter ? "AND" : "WHERE"} attendance_records.attendance_date = COALESCE($${values.length + 1}::date, CURRENT_DATE)`,
      [...values, date]),
    ]);

    return NextResponse.json({
      students: studentResult.rows.map(student => ({ ...student, name: student.nameEnglish || student.nameKhmer })),
      teachers: teacherResult.rows,
      studyLevels: levelResult.rows.map(row => row.name),
      attendanceToday: attendanceResult.rows[0],
    });
  } catch (error) {
    console.error("Could not load school records from PostgreSQL.", error);
    return NextResponse.json({ error: "Could not load school data." }, { status: 503 });
  }
}
