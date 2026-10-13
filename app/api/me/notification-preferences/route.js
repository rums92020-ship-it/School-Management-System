import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { jsonError } from "../../../../lib/timetable";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, response } = await requireRole(["guardian"]);
    if (response) return response;
    const [students, channel] = await Promise.all([
      getPool().query(
        `SELECT guardian_students.student_id, guardian_students.notify_scan,
          guardian_students.notify_absent, COALESCE(students.name_khmer, students.name_english) AS name
         FROM guardian_students
         JOIN students ON students.student_id = guardian_students.student_id
         WHERE guardian_students.guardian_user_id = $1
         ORDER BY students.student_id`,
        [user.id],
      ),
      getPool().query(
        `SELECT is_active FROM notification_channels
         WHERE user_id = $1 AND channel = 'telegram'
         LIMIT 1`,
        [user.id],
      ),
    ]);
    return NextResponse.json({
      students: students.rows,
      telegram_connected: Boolean(channel.rows[0]?.is_active),
    });
  } catch {
    console.error("Could not load guardian notification preferences.");
    return NextResponse.json({ error: "Could not load notification preferences." }, { status: 503 });
  }
}

export async function PATCH(request) {
  try {
    const { user, response } = await requireRole(["guardian"]);
    if (response) return response;
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }
    if (typeof body?.student_id !== "string" ||
        (!Object.hasOwn(body, "notify_scan") && !Object.hasOwn(body, "notify_absent")) ||
        (Object.hasOwn(body, "notify_scan") && typeof body.notify_scan !== "boolean") ||
        (Object.hasOwn(body, "notify_absent") && typeof body.notify_absent !== "boolean")) {
      return jsonError("Provide a linked student ID and boolean notification preferences.", 400);
    }
    const result = await getPool().query(
      `UPDATE guardian_students
       SET notify_scan = COALESCE($3::boolean, notify_scan),
           notify_absent = COALESCE($4::boolean, notify_absent)
       WHERE guardian_user_id = $1 AND student_id = $2
       RETURNING student_id, notify_scan, notify_absent`,
      [
        user.id,
        body.student_id.trim(),
        Object.hasOwn(body, "notify_scan") ? body.notify_scan : null,
        Object.hasOwn(body, "notify_absent") ? body.notify_absent : null,
      ],
    );
    if (!result.rowCount) return jsonError("Linked student not found.", 404);
    return NextResponse.json({ preferences: result.rows[0] });
  } catch {
    console.error("Could not update guardian notification preferences.");
    return NextResponse.json({ error: "Could not update notification preferences." }, { status: 503 });
  }
}
