import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "../../../lib/auth";
import { getPool } from "../../../lib/db";

export const runtime = "nodejs";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(verifySessionToken(cookieStore.get(sessionCookieName)?.value));
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(request) {
  try {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const date = new URL(request.url).searchParams.get("date");
    if (!isValidDate(date)) return NextResponse.json({ error: "A valid date in YYYY-MM-DD format is required." }, { status: 400 });
    const result = await getPool().query(
      "SELECT student_id AS id, status FROM attendance_records WHERE attendance_date = $1",
      [date],
    );
    return NextResponse.json({ records: result.rows });
  } catch (error) {
    console.error("Could not load attendance records from PostgreSQL.", error);
    return NextResponse.json({ error: "Could not load attendance records." }, { status: 503 });
  }
}

export async function PUT(request) {
  try {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    if (!isValidDate(body.date) || !Array.isArray(body.records) || body.records.length > 1000) {
      return NextResponse.json({ error: "Provide a valid attendance date and up to 1000 records." }, { status: 400 });
    }
    for (const record of body.records) {
      if (!record || typeof record.studentId !== "string" || !record.studentId.trim() ||
          !["Present", "Absent", "Late"].includes(record.status)) {
        return NextResponse.json({ error: "Each attendance record needs a student ID and a valid status." }, { status: 400 });
      }
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const record of body.records) {
        await client.query(
          `INSERT INTO attendance_records (attendance_date, student_id, status)
           VALUES ($1, $2, $3)
           ON CONFLICT (attendance_date, student_id) DO UPDATE SET status = EXCLUDED.status`,
          [body.date, record.studentId.trim(), record.status],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23503") return NextResponse.json({ error: "Attendance references a student that does not exist." }, { status: 400 });
      throw error;
    } finally {
      client.release();
    }
    return NextResponse.json({ saved: body.records.length });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    console.error("Could not save attendance records to PostgreSQL.", error);
    return NextResponse.json({ error: "Could not save attendance records." }, { status: 503 });
  }
}
