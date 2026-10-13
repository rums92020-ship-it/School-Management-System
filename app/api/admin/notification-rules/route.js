import { NextResponse } from "next/server";
import { requireRole, roles } from "../../../../lib/auth";
import { getPool } from "../../../../lib/db";
import { jsonError } from "../../../../lib/timetable";

export const runtime = "nodejs";
const managers = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];
const eventTypes = new Set([
  "teacher_late",
  "teacher_late_2",
  "teacher_arrived",
  "student_scanned",
  "student_absent",
  "student_absent_correction",
  "session_unresolved",
]);

export async function GET() {
  try {
    const { response } = await requireRole(managers);
    if (response) return response;
    const result = await getPool().query(
      `SELECT event_type, role, is_enabled
       FROM notification_rules
       ORDER BY event_type, role`,
    );
    return NextResponse.json({ rules: result.rows, roles });
  } catch {
    console.error("Could not load notification rules.");
    return NextResponse.json({ error: "Could not load notification rules." }, { status: 503 });
  }
}

export async function PUT(request) {
  try {
    const { user, response } = await requireRole(managers);
    if (response) return response;
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }
    if (!Array.isArray(body?.rules) || body.rules.length > 100) {
      return jsonError("Provide up to 100 notification rules.", 400);
    }
    for (const rule of body.rules) {
      if (!eventTypes.has(rule?.event_type) || !roles.includes(rule?.role) ||
          typeof rule.is_enabled !== "boolean") {
        return jsonError("Each rule needs a supported event, role, and boolean enabled value.", 400);
      }
    }
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      for (const rule of body.rules) {
        await client.query(
          `INSERT INTO notification_rules (event_type, role, is_enabled)
           VALUES ($1, $2, $3)
           ON CONFLICT (event_type, role)
           DO UPDATE SET is_enabled = EXCLUDED.is_enabled`,
          [rule.event_type, rule.role, rule.is_enabled],
        );
      }
      await client.query("COMMIT");
      return NextResponse.json({ saved: body.rules.length, changed_by: user.id });
    } catch {
      await client.query("ROLLBACK");
      console.error("Could not save notification rules.");
      return NextResponse.json({ error: "Could not save notification rules." }, { status: 503 });
    } finally {
      client.release();
    }
  } catch {
    console.error("Could not save notification rules.");
    return NextResponse.json({ error: "Could not save notification rules." }, { status: 503 });
  }
}
