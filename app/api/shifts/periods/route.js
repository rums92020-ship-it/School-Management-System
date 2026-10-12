import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  isNinetyMinutes,
  leadershipRoles,
  parsePositiveId,
  validTime,
  validWeekday,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

function validPeriod(body) {
  return body && typeof body === "object" && !Array.isArray(body) &&
    Number.isSafeInteger(body.shift_id) && body.shift_id > 0 &&
    validWeekday(body.weekday) &&
    Number.isInteger(body.period_no) && body.period_no >= 1 && body.period_no <= 5 &&
    validTime(body.start_time) && validTime(body.end_time) &&
    isNinetyMinutes(body.start_time, body.end_time);
}

export async function GET(request) {
  try {
    const { response } = await requireRole(roles);
    if (response) return response;
    const shiftIdValue = new URL(request.url).searchParams.get("shift_id");
    const shiftId = shiftIdValue ? parsePositiveId(shiftIdValue) : null;
    if (shiftIdValue && !shiftId) return jsonError("Provide a valid shift ID.", 400);
    const result = await getPool().query(
      `SELECT shift_periods.id, shift_id, shifts.code AS shift_code,
        weekday, period_no, start_time, end_time
       FROM shift_periods JOIN shifts ON shifts.id = shift_periods.shift_id
       WHERE ($1::bigint IS NULL OR shift_id = $1)
       ORDER BY shift_id, weekday, period_no`,
      [shiftId],
    );
    return NextResponse.json({ periods: result.rows });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not load shift periods.");
  }
}

export async function POST(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const body = await request.json();
    if (!validPeriod(body)) return jsonError("Shift periods must specify a valid weekday, period, and exactly 90-minute times.", 400);
    const result = await getPool().query(
      `INSERT INTO shift_periods (shift_id, weekday, period_no, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, shift_id, weekday, period_no, start_time, end_time`,
      [body.shift_id, body.weekday, body.period_no, body.start_time, body.end_time],
    );
    return NextResponse.json({ period: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("That shift already has a period with this weekday and number.", 409);
    if (error.code === "23503") return jsonError("Shift not found.", 404);
    return databaseUnavailableResponse(error, "Could not create shift period.");
  }
}

export async function PATCH(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const body = await request.json();
    const id = parsePositiveId(body?.id);
    if (!id || !validPeriod(body)) return jsonError("Provide a valid period ID and an exactly 90-minute period.", 400);
    const result = await getPool().query(
      `UPDATE shift_periods
       SET shift_id = $1, weekday = $2, period_no = $3, start_time = $4, end_time = $5
       WHERE id = $6
       RETURNING id, shift_id, weekday, period_no, start_time, end_time`,
      [body.shift_id, body.weekday, body.period_no, body.start_time, body.end_time, id],
    );
    if (!result.rowCount) return jsonError("Shift period not found.", 404);
    return NextResponse.json({ period: result.rows[0] });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    if (error.code === "23505") return jsonError("That shift already has a period with this weekday and number.", 409);
    if (error.code === "23503") return jsonError("Shift not found.", 404);
    return databaseUnavailableResponse(error, "Could not update shift period.");
  }
}

export async function DELETE(request) {
  try {
    const { response } = await requireRole(leadershipRoles);
    if (response) return response;
    const id = parsePositiveId(new URL(request.url).searchParams.get("id"));
    if (!id) return jsonError("Provide a valid shift period ID.", 400);
    const result = await getPool().query(
      `DELETE FROM shift_periods AS period
       WHERE period.id = $1
         AND NOT EXISTS (
           SELECT 1
           FROM classes
           JOIN timetable_slots ON timetable_slots.class_id = classes.class_id
           WHERE classes.shift_id = period.shift_id
             AND timetable_slots.weekday = period.weekday
             AND timetable_slots.period_no = period.period_no
         )
       RETURNING period.id`,
      [id],
    );
    if (!result.rowCount) return jsonError("Period not found or used by a timetable slot.", 409);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseUnavailableResponse(error, "Could not delete shift period.");
  }
}
