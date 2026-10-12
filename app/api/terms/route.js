import { NextResponse } from "next/server";
import { requireRole } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  parsePositiveId,
  termManagerRoles,
  validDate,
} from "../../../lib/timetable";

export const runtime = "nodejs";

function normalizeTerm(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { academic_year: academicYear, term_no: termNo, name, start_date: startDate, end_date: endDate } = body;
  if (typeof academicYear !== "string" || !academicYear.trim() || academicYear.trim().length > 30 ||
      !Number.isInteger(termNo) || termNo < 1 || termNo > 20 ||
      typeof name !== "string" || !name.trim() || name.trim().length > 100 ||
      !validDate(startDate) || !validDate(endDate) || endDate <= startDate) return null;
  return { academicYear: academicYear.trim(), termNo, name: name.trim(), startDate, endDate };
}

async function overlaps(pool, term, excludeId = null) {
  const result = await pool.query(
    `SELECT id FROM terms
     WHERE academic_year = $1
       AND start_date < $3::date
       AND end_date > $2::date
       AND ($4::bigint IS NULL OR id <> $4)
     LIMIT 1`,
    [term.academicYear, term.startDate, term.endDate, excludeId],
  );
  return result.rowCount > 0;
}

export async function GET() {
  try {
    const { response } = await requireRole([
      "director", "deputy_director", "office_head", "office_deputy", "office_staff",
      "dept_head", "dept_deputy", "teacher", "student", "guardian",
    ]);
    if (response) return response;
    const result = await getPool().query(
      `SELECT id, academic_year, term_no, name, start_date, end_date, is_current
       FROM terms ORDER BY academic_year DESC, term_no`,
    );
    return NextResponse.json({ terms: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load terms.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const term = normalizeTerm(await request.json());
    if (!term) return jsonError("Provide a name, academic year, term number, and valid start/end dates (end after start).", 400);
    const pool = getPool();
    if (await overlaps(pool, term)) return jsonError("The term overlaps another term in this academic year.", 409);
    const result = await pool.query(
      `INSERT INTO terms (academic_year, term_no, name, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, academic_year, term_no, name, start_date, end_date, is_current`,
      [term.academicYear, term.termNo, term.name, term.startDate, term.endDate],
    );
    return NextResponse.json({ term: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("A term with this academic year and term number already exists.", 409);
    return databaseUnavailableResponse(error, "Could not create term.");
  }
}

export async function PATCH(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const body = await request.json();
    const id = parsePositiveId(body?.id);
    if (!id) return jsonError("Provide a valid term ID.", 400);
    if (body.action === "set-current") {
      const client = await getPool().connect();
      try {
        await client.query("BEGIN");
        const exists = await client.query("SELECT id FROM terms WHERE id = $1 FOR UPDATE", [id]);
        if (!exists.rowCount) {
          await client.query("ROLLBACK");
          return jsonError("Term not found.", 404);
        }
        await client.query("UPDATE terms SET is_current = FALSE WHERE is_current = TRUE");
        await client.query("UPDATE terms SET is_current = TRUE WHERE id = $1", [id]);
        await client.query("COMMIT");
        return NextResponse.json({ ok: true, current_term_id: id });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
    const term = normalizeTerm(body);
    if (!term) return jsonError("Provide a name, academic year, term number, and valid start/end dates (end after start).", 400);
    const pool = getPool();
    const exists = await pool.query("SELECT id FROM terms WHERE id = $1", [id]);
    if (!exists.rowCount) return jsonError("Term not found.", 404);
    if (await overlaps(pool, term, id)) return jsonError("The term overlaps another term in this academic year.", 409);
    const result = await pool.query(
      `UPDATE terms
       SET academic_year = $1, term_no = $2, name = $3, start_date = $4, end_date = $5
       WHERE id = $6
       RETURNING id, academic_year, term_no, name, start_date, end_date, is_current`,
      [term.academicYear, term.termNo, term.name, term.startDate, term.endDate, id],
    );
    return NextResponse.json({ term: result.rows[0] });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("A term with this academic year and term number already exists.", 409);
    if (error.code === "23503") return jsonError("This term is linked to timetable or session records and cannot be changed or removed.", 409);
    return databaseUnavailableResponse(error, "Could not update term.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const id = parsePositiveId(new URL(request.url).searchParams.get("id"));
    if (!id) return jsonError("Provide a valid term ID.", 400);
    const result = await getPool().query("DELETE FROM terms WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) return jsonError("Term not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "23503") return jsonError("This term is linked to timetable or session records and cannot be deleted.", 409);
    return databaseUnavailableResponse(error, "Could not delete term.");
  }
}
