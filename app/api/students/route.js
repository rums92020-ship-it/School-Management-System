import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

const fields = [
  ["id", "student_id", 40, true],
  ["nameEnglish", "name_english", 70, false],
  ["nameKhmer", "name_khmer", 70, false],
  ["gender", "gender", 30, true],
  ["className", "class_name", 100, true],
  ["major", "major", 150, false],
  ["studyShift", "study_shift", 100, false],
  ["studentGroup", "student_group", 50, false],
  ["grade", "grade", 5, false],
  ["dateOfBirth", "date_of_birth", 10, false],
  ["placeOfBirth", "place_of_birth", 100, false],
  ["personalNumber", "personal_number", 40, false],
  ["parentNumber", "parent_number", 24, false],
  ["status", "status", 20, false],
];

function normalizeStudent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Each student must be a JSON object.");
  }
  const student = {};
  for (const [key, , maxLength, required] of fields) {
    const raw = value[key] ?? (key === "nameEnglish" ? value.name : key === "parentNumber" ? value.phone : "");
    if (typeof raw !== "string") throw new Error(`Student field "${key}" must be text.`);
    const normalized = raw.trim();
    if (required && !normalized) throw new Error(`Student field "${key}" is required.`);
    if (normalized.length > maxLength) throw new Error(`Student field "${key}" exceeds ${maxLength} characters.`);
    student[key] = normalized;
  }
  if (!student.nameEnglish && !student.nameKhmer) {
    throw new Error("Each student must have an English or Khmer name.");
  }
  student.status ||= "Active";
  if (student.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(student.dateOfBirth)) {
    throw new Error("Student dateOfBirth must use YYYY-MM-DD.");
  }
  return student;
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const students = Array.isArray(body.students) ? body.students : [body];
    if (!students.length || students.length > 1000) {
      return NextResponse.json({ error: "Submit between 1 and 1000 students per request." }, { status: 400 });
    }
    const normalized = students.map(normalizeStudent);
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      for (const student of normalized) {
        const values = fields.map(([key]) => student[key] || null);
        await client.query(
          `INSERT INTO students (${fields.map(([, column]) => column).join(", ")})
           VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})`,
          values,
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        if (error.constraint === "students_pkey") {
          return NextResponse.json({
            code: "STUDENT_ID_CONFLICT",
            error: "The generated student ID is already in use. Refreshing the student list may resolve this; please try again.",
          }, { status: 409 });
        }
        if (error.constraint === "students_personal_number_key") {
          return NextResponse.json({
            code: "PERSONAL_NUMBER_CONFLICT",
            error: "That personal number is already assigned to another student. Check the number or enter the correct one.",
          }, { status: 409 });
        }
        return NextResponse.json({ error: "A student record conflicts with an existing unique value." }, { status: 409 });
      }
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({ saved: normalized.length }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error.message.startsWith("Student ") || error.message.startsWith("Each student")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Could not save student records to PostgreSQL.", error);
    return NextResponse.json({ error: "Could not save student records." }, { status: 503 });
  }
}
