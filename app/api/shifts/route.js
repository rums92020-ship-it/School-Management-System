import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../lib/auth";
import { getPool } from "../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  leadershipRoles,
  parseUuid,
} from "../../../lib/timetable";

export const runtime = "nodejs";

function validShiftWindow(start, end) {
  return typeof start === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(start) &&
    typeof end === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(end) &&
    end > start;
}

export async function GET() {
  try {
    const { response } = await requireRole(roles);
    if (response) return response;
    const result = await getPool().query(
      `SELECT shifts.id, shifts.code,
        COALESCE(shifts.name_en, shifts.name_km) AS name,
        shifts.name_en, shifts.name_km, shifts.days_of_week,
        shifts.start_time, shifts.end_time, shifts.is_active,
        COALESCE(
          json_agg(json_build_object(
            'id', shift_periods.id,
            'weekday', shift_days.weekday,
            'period_no', shift_periods.period_no,
            'start_time', shift_periods.start_time,
            'end_time', shift_periods.end_time
          ) ORDER BY shift_days.weekday, shift_periods.period_no)
          FILTER (WHERE shift_periods.id IS NOT NULL),
          '[]'::json
        ) AS periods
       FROM shifts
       LEFT JOIN shift_periods ON shift_periods.shift_id = shifts.id
       LEFT JOIN LATERAL unnest(shifts.days_of_week) AS shift_days(weekday) ON TRUE
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
        typeof body.name_en !== "string" || !body.name_en.trim() || body.name_en.trim().length > 100 ||
        typeof body.name_km !== "string" || !body.name_km.trim() || body.name_km.trim().length > 100 ||
        !Array.isArray(body.days_of_week) || body.days_of_week.length < 1 ||
        body.days_of_week.some(day => !Number.isInteger(day) || day < 1 || day > 7) ||
        !validShiftWindow(body.start_time, body.end_time)) {
      return jsonError("Provide a valid shift code and name.", 400);
    }
    const result = await getPool().query(
      `INSERT INTO shifts
        (code, name_km, name_en, days_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, code, name_km, name_en, days_of_week, start_time, end_time`,
      [body.code, body.name_km.trim(), body.name_en.trim(), [...new Set(body.days_of_week)], body.start_time, body.end_time],
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
        !parseUuid(body.id) ||
        typeof body.name_en !== "string" || !body.name_en.trim() || body.name_en.trim().length > 100 ||
        typeof body.name_km !== "string" || !body.name_km.trim() || body.name_km.trim().length > 100) {
      return jsonError("Provide a valid shift ID and name.", 400);
    }
    const result = await getPool().query(
      "UPDATE shifts SET name_km = $1, name_en = $2 WHERE id = $3 RETURNING id, code, name_km, name_en",
      [body.name_km.trim(), body.name_en.trim(), body.id],
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
    const id = parseUuid(new URL(request.url).searchParams.get("id"));
    if (!id) return jsonError("Provide a valid shift ID.", 400);
    const result = await getPool().query("DELETE FROM shifts WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) return jsonError("Shift not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "23503") return jsonError("This shift is assigned to one or more classes and cannot be deleted.", 409);
    return databaseUnavailableResponse(error, "Could not delete shift.");
  }

}
