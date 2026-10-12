import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  leadershipRoles,
} from "../../../lib/timetable";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { response } = await requireRole(roles);
    if (response) return response;
    const result = await getPool().query(
      `SELECT shifts.id, shifts.code, shifts.name,
        COALESCE(
          json_agg(json_build_object(
            'id', shift_periods.id,
            'weekday', shift_periods.weekday,
            'period_no', shift_periods.period_no,
            'start_time', shift_periods.start_time,
            'end_time', shift_periods.end_time
          ) ORDER BY shift_periods.weekday, shift_periods.period_no)
          FILTER (WHERE shift_periods.id IS NOT NULL),
          '[]'::json
        ) AS periods
       FROM shifts
       LEFT JOIN shift_periods ON shift_periods.shift_id = shifts.id
       GROUP BY shifts.id
       ORDER BY shifts.id`,
    );
    return NextResponse.json({ shifts: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load shifts.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        typeof body.code !== "string" || !/^[a-z][a-z0-9_]{1,39}$/.test(body.code) ||
        typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100) {
      return jsonError("Provide a valid shift code and name.", 400);
    }
    const result = await getPool().query(
      "INSERT INTO shifts (code, name) VALUES ($1, $2) RETURNING id, code, name",
      [body.code, body.name.trim()],
    );
    return NextResponse.json({ shift: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("A shift with this code already exists.", 409);
    return databaseUnavailableResponse(error, "Could not create shift.");
  }
}

export async function PATCH(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        !Number.isSafeInteger(body.id) || body.id < 1 ||
        typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100) {
      return jsonError("Provide a valid shift ID and name.", 400);
    }
    const result = await getPool().query(
      "UPDATE shifts SET name = $1 WHERE id = $2 RETURNING id, code, name",
      [body.name.trim(), body.id],
    );
    if (!result.rowCount) return jsonError("Shift not found.", 404);
    return NextResponse.json({ shift: result.rows[0] });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not update shift.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return jsonError("Provide a valid shift ID.", 400);
    const result = await getPool().query("DELETE FROM shifts WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) return jsonError("Shift not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "23503") return jsonError("This shift is assigned to one or more classes and cannot be deleted.", 409);
    return databaseUnavailableResponse(error, "Could not delete shift.");
  }
}
