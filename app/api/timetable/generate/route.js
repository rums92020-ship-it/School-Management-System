import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  parsePositiveId,
  sessionTimezone,
  termManagerRoles,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

const generationQuery = `
  WITH candidates AS (
    SELECT slots.slot_id, slots.term_id, slots.class_id, slots.start_time,
      slots.end_time, dates.session_date
    FROM timetable_slots AS slots
    JOIN terms ON terms.id = slots.term_id
    JOIN classes ON classes.class_id = slots.class_id
    CROSS JOIN LATERAL generate_series(
      GREATEST(slots.valid_from, terms.start_date)::timestamp,
      LEAST(slots.valid_to, terms.end_date)::timestamp,
      INTERVAL '1 day'
    ) AS dates(session_date)
    WHERE slots.term_id = $1
      AND classes.is_active = TRUE
      AND ($2::bigint IS NULL OR slots.class_id = $2)
      AND EXTRACT(ISODOW FROM dates.session_date)::int = slots.weekday
  ),
  eligible AS (
    SELECT candidates.*,
      ((candidates.session_date::text || ' ' || candidates.start_time::text)::timestamp
        AT TIME ZONE $3) AS starts_at,
      ((candidates.session_date::text || ' ' || candidates.end_time::text)::timestamp
        AT TIME ZONE $3) AS ends_at
    FROM candidates
    WHERE NOT EXISTS (
      SELECT 1 FROM holidays
      WHERE holidays.holiday_date = candidates.session_date::date
        AND (holidays.academic_year IS NULL OR holidays.academic_year = (
          SELECT academic_year FROM terms WHERE id = $1
        ))
    )
  ),
  annotated AS (
    SELECT eligible.*,
      EXISTS (
        SELECT 1 FROM class_sessions
        WHERE class_sessions.slot_id = eligible.slot_id
          AND class_sessions.session_date = eligible.session_date::date
      ) AS already_exists
    FROM eligible
  )
`;

export async function POST(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const body = await request.json();
    const termId = parsePositiveId(String(body?.term_id ?? ""));
    const classId = body?.class_id === undefined || body.class_id === null || body.class_id === ""
      ? null
      : parsePositiveId(String(body.class_id));
    if (!termId || (body.class_id !== undefined && body.class_id !== null && body.class_id !== "" && !classId) ||
        (body.dry_run !== undefined && typeof body.dry_run !== "boolean")) {
      return jsonError("Provide a valid term_id, optional class_id, and boolean dry_run.", 400);
    }

    const pool = getPool();
    const term = await pool.query("SELECT id FROM terms WHERE id = $1", [termId]);
    if (!term.rowCount) return jsonError("Term not found.", 404);
    if (classId) {
      const classResult = await pool.query(
        "SELECT class_id FROM classes WHERE class_id = $1 AND is_active = TRUE AND shift_id IS NOT NULL",
        [classId],
      );
      if (!classResult.rowCount) return jsonError("Active class with a configured shift not found.", 404);
    }

    const params = [termId, classId, sessionTimezone];
    const preview = await pool.query(
      `${generationQuery}
       SELECT COUNT(*)::int AS eligible,
         COUNT(*) FILTER (WHERE already_exists)::int AS existing,
         COUNT(*) FILTER (WHERE NOT already_exists)::int AS to_create,
         (SELECT COUNT(*)::int FROM candidates
          WHERE EXISTS (
            SELECT 1 FROM holidays
            WHERE holidays.holiday_date = candidates.session_date::date
              AND (holidays.academic_year IS NULL OR holidays.academic_year =
                (SELECT academic_year FROM terms WHERE id = $1))
          )) AS holiday_skipped
       FROM annotated`,
      params,
    );
    const counts = preview.rows[0];
    if (body.dry_run) {
      return NextResponse.json({
        dry_run: true,
        created: 0,
        skipped: counts.existing + counts.holiday_skipped,
        preview: counts,
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const created = await client.query(
        `${generationQuery}
         INSERT INTO class_sessions
           (slot_id, term_id, class_id, session_date, starts_at, ends_at)
         SELECT slot_id, term_id, class_id, session_date::date, starts_at, ends_at
         FROM annotated
         ON CONFLICT (slot_id, session_date) DO NOTHING
         RETURNING session_id`,
        params,
      );
      await client.query("COMMIT");
      return NextResponse.json({
        dry_run: false,
        created: created.rowCount,
        skipped: counts.existing + counts.holiday_skipped,
        preview: counts,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not generate class sessions.");
  }
}
