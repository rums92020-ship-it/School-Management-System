import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import {
  databaseUnavailableResponse,
  jsonError,
  parseUuid,
  termManagerRoles,
} from "../../../../lib/timetable";

export const runtime = "nodejs";

const generationQuery = `
  WITH dated_slots AS (
    SELECT slots.id AS slot_id, slots.term_id, terms.academic_year, slots.class_id,
      slots.subject_id, slots.teacher_id, slots.start_time, slots.end_time,
      slots.room, dates.session_date
    FROM timetable_slots AS slots
    JOIN terms ON terms.id = slots.term_id
    JOIN classes ON classes.id = slots.class_id
    CROSS JOIN LATERAL generate_series(
      GREATEST(slots.valid_from, terms.start_date)::timestamp,
      LEAST(COALESCE(slots.valid_to, terms.end_date), terms.end_date)::timestamp,
      INTERVAL '1 day'
    ) AS dates(session_date)
    WHERE slots.term_id = $1::uuid
      AND slots.is_active = TRUE
      AND classes.is_active = TRUE
      AND ($2::uuid IS NULL OR slots.class_id = $2)
      AND EXTRACT(ISODOW FROM dates.session_date)::int = slots.day_of_week
  ),
  candidates AS (
    SELECT dated_slots.*
    FROM dated_slots
    WHERE NOT EXISTS (
        SELECT 1 FROM holidays
        WHERE holidays.holiday_date = dated_slots.session_date::date
          AND (holidays.academic_year IS NULL OR holidays.academic_year = dated_slots.academic_year)
      )
  ),
  annotated AS (
    SELECT candidates.*,
      EXISTS (
        SELECT 1 FROM class_sessions
        WHERE class_sessions.slot_id = candidates.slot_id
          AND class_sessions.session_date = candidates.session_date::date
      ) AS already_exists
    FROM candidates
  )
`;

export async function POST(request) {
  try {
    const { response } = await requireRole(termManagerRoles);
    if (response) return response;
    const body = await request.json();
    const termId = parseUuid(body?.term_id);
    const classId = body?.class_id == null || body.class_id === "" ? null : parseUuid(body.class_id);
    if (!termId || (body.class_id != null && body.class_id !== "" && !classId) ||
        (body.dry_run !== undefined && typeof body.dry_run !== "boolean")) {
      return jsonError("Provide a valid term_id, optional class_id, and boolean dry_run.", 400);
    }

    const pool = getPool();
    const term = await pool.query("SELECT id FROM terms WHERE id = $1", [termId]);
    if (!term.rowCount) return jsonError("Term not found.", 404);
    if (classId) {
      const classResult = await pool.query(
        "SELECT id FROM classes WHERE id = $1 AND is_active = TRUE AND shift_id IS NOT NULL",
        [classId],
      );
      if (!classResult.rowCount) return jsonError("Active class with a configured shift not found.", 404);
    }

    const params = [termId, classId];
    const preview = await pool.query(
      `${generationQuery}
       SELECT COUNT(*)::int AS eligible,
         COUNT(*) FILTER (WHERE already_exists)::int AS existing,
         COUNT(*) FILTER (WHERE NOT already_exists)::int AS to_create,
         (SELECT COUNT(*)::int FROM dated_slots
          WHERE EXISTS (
            SELECT 1 FROM holidays
            WHERE holidays.holiday_date = dated_slots.session_date::date
              AND (holidays.academic_year IS NULL OR holidays.academic_year = dated_slots.academic_year)
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

    const created = await pool.query(
      `${generationQuery}
       INSERT INTO class_sessions
         (slot_id, term_id, class_id, subject_id, teacher_id, session_date,
          start_time, end_time, room, status)
       SELECT slot_id, term_id, class_id, subject_id, teacher_id,
         session_date::date, start_time, end_time, room, 'scheduled'
       FROM annotated
       ON CONFLICT (slot_id, session_date) DO NOTHING
       RETURNING id`,
      params,
    );
    return NextResponse.json({
      dry_run: false,
      created: created.rowCount,
      skipped: counts.existing + counts.holiday_skipped,
      preview: counts,
    });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("Invalid JSON request body.", 400);
    return databaseUnavailableResponse(error, "Could not generate class sessions.");
  }
}
