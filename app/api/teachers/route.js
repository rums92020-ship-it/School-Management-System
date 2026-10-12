import { NextResponse } from "next/server";
import { requireRole } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

function normalizeTeacher(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Teacher details must be a JSON object.");
  }

  const teacher = {};
  for (const [key, maxLength, required] of [
    ["id", 40, true],
    ["nameKhmer", 140, false],
    ["nameEnglish", 140, false],
    ["subject", 120, true],
    ["className", 100, true],
    ["phone", 24, false],
  ]) {
    const raw = value[key] ?? "";
    if (typeof raw !== "string") throw new Error(`Teacher field "${key}" must be text.`);
    const normalized = raw.trim();
    if (required && !normalized) throw new Error(`Teacher field "${key}" is required.`);
    if (normalized.length > maxLength) {
      throw new Error(`Teacher field "${key}" exceeds ${maxLength} characters.`);
    }
    teacher[key] = normalized;
  }
  if (!teacher.nameKhmer && !teacher.nameEnglish) {
    throw new Error("Enter the teacher's Khmer name, English name, or both.");
  }
  return teacher;
}

export async function POST(request) {
  try {
    const { response } = await requireRole([
      "director",
      "deputy_director",
      "office_head",
      "office_deputy",
    ]);
    if (response) return response;

    const teacher = normalizeTeacher(await request.json());
    await getPool().query(
      `INSERT INTO teachers (teacher_id, name, name_khmer, name_english, subject, class_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        teacher.id,
        teacher.nameEnglish || teacher.nameKhmer,
        teacher.nameKhmer || null,
        teacher.nameEnglish || null,
        teacher.subject,
        teacher.className,
        teacher.phone || null,
      ],
    );
    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error.message?.startsWith("Teacher ") || error.message?.startsWith("Enter the teacher")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === "23505" && error.constraint === "teachers_pkey") {
      return NextResponse.json({
        code: "TEACHER_ID_CONFLICT",
        error: "The generated teacher ID is already in use. Please try again.",
      }, { status: 409 });
    }
    console.error("Could not save teacher record to PostgreSQL.", error);
    return NextResponse.json({ error: "Could not save teacher record." }, { status: 503 });
  }
}
