import {
  APP_TIMEZONE,
  AUTO_CLOSE_MINUTES,
  TEACHER_LATE2_MINUTES,
  TEACHER_LATE_MINUTES,
} from "./app-constants";
import { enqueue, localTime } from "./notifications";
import {
  enqueueAbsentNotices,
  getSessionContext,
  writeAttendanceAudit,
} from "./session-notifications";

async function getRuleRecipients(client, eventType, departmentScoped = null) {
  const result = await client.query(
    `SELECT DISTINCT users.id
     FROM users
     JOIN notification_rules
       ON notification_rules.role = users.role
      AND notification_rules.event_type = $1
      AND notification_rules.is_enabled = TRUE
     WHERE users.is_active = TRUE
       AND ($2::text IS NULL OR users.role NOT IN ('dept_head', 'dept_deputy')
         OR users.department = $2)`,
    [eventType, departmentScoped],
  );
  return result.rows.map(row => row.id);
}

export async function enqueueTeacherArrival(client, sessionId, checkedInAt) {
  const session = await getSessionContext(client, sessionId);
  if (!session) return;
  const recipients = await getRuleRecipients(client, "teacher_late", session.department);
  const minutesLate = Math.max(0, Math.floor((new Date(checkedInAt) - new Date(session.starts_at)) / 60_000));
  await enqueue(client, {
    event_type: "teacher_arrived",
    recipients,
    body: `ℹ️ គ្រូ ${session.teacher_name || ""} បានចូលរៀនម៉ោង ${localTime(checkedInAt)} (យឺត ${minutesLate} នាទី) ថ្នាក់ ${session.class_name}។`,
    payload: { session_id: sessionId },
    dedupe_key: `teacher_arrived:${sessionId}`,
  });
}

async function queueTeacherAlert(client, sessionId, eventType, alertNumber) {
  const session = await getSessionContext(client, sessionId);
  if (!session) return;
  const recipients = await getRuleRecipients(client, eventType, session.department);
  const start = session.start_time.slice(0, 5);
  const end = session.end_time.slice(0, 5);
  const message = alertNumber === 1
    ? `⚠️ គ្រូ ${session.teacher_name || ""} មិនទាន់ចូលរៀនក្រោយ ១៥ នាទី: ថ្នាក់ ${session.class_name}, ${session.subject_name || ""}, បន្ទប់ ${session.room || ""}, ម៉ោង ${start}-${end}។`
    : `🚨 ជូនដំណឹងលើកទី ២: គ្រូ ${session.teacher_name || ""} នៅមិនទាន់ចូលរៀនក្រោយ ៣០ នាទី: ថ្នាក់ ${session.class_name}, ${session.subject_name || ""}, បន្ទប់ ${session.room || ""}, ម៉ោង ${start}-${end}។`;
  await enqueue(client, {
    event_type: eventType,
    recipients,
    body: message,
    payload: { session_id: sessionId },
    dedupe_key: `teacher_late:${alertNumber}:${sessionId}`,
  });
}

export async function detectTeacherLateAlerts(client) {
  const alerts = [
    {
      eventType: "teacher_late",
      column: "teacher_late_alerted_at",
      minutes: TEACHER_LATE_MINUTES,
      number: 1,
    },
    {
      eventType: "teacher_late_2",
      column: "teacher_late_alert2_at",
      minutes: TEACHER_LATE2_MINUTES,
      number: 2,
    },
  ];
  let count = 0;
  for (const alert of alerts) {
    const due = await client.query(
      `SELECT sessions.id
       FROM class_sessions AS sessions
       WHERE sessions.session_date = (NOW() AT TIME ZONE $1)::date
         AND sessions.status NOT IN ('cancelled', 'closed')
         AND sessions.teacher_checkin_at IS NULL
         AND sessions.substitute_teacher_id IS NULL
         AND sessions.${alert.column} IS NULL
         AND NOW() >= ((sessions.session_date::text || ' ' || sessions.start_time::text)::timestamp
           AT TIME ZONE $1) + ($2::int * INTERVAL '1 minute')
         AND NOW() < ((sessions.session_date::text || ' ' || sessions.end_time::text)::timestamp
           AT TIME ZONE $1)
         AND NOT EXISTS (
           SELECT 1 FROM holidays
           WHERE holidays.holiday_date = sessions.session_date
             AND (holidays.academic_year IS NULL OR holidays.academic_year =
               (SELECT terms.academic_year FROM terms WHERE terms.id = sessions.term_id))
         )
       ORDER BY sessions.start_time, sessions.id
       LIMIT 50
       FOR UPDATE OF sessions SKIP LOCKED`,
      [APP_TIMEZONE, alert.minutes],
    );
    for (const row of due.rows) {
      await queueTeacherAlert(client, row.id, alert.eventType, alert.number);
      await client.query(
        `UPDATE class_sessions SET ${alert.column} = NOW() WHERE id = $1`,
        [row.id],
      );
      count += 1;
    }
  }
  return count;
}

export async function detectUnresolvedSessions(client) {
  const due = await client.query(
    `SELECT sessions.id
     FROM class_sessions AS sessions
     WHERE sessions.status NOT IN ('cancelled', 'closed')
       AND sessions.teacher_checkin_at IS NULL
       AND sessions.substitute_teacher_id IS NULL
       AND sessions.needs_review = FALSE
       AND NOW() >= ((sessions.session_date::text || ' ' || sessions.end_time::text)::timestamp
         AT TIME ZONE $1) + ($2::int * INTERVAL '1 minute')
     ORDER BY sessions.session_date, sessions.start_time, sessions.id
     LIMIT 50
     FOR UPDATE OF sessions SKIP LOCKED`,
    [APP_TIMEZONE, AUTO_CLOSE_MINUTES],
  );
  for (const row of due.rows) {
    await client.query(
      "UPDATE class_sessions SET needs_review = TRUE WHERE id = $1",
      [row.id],
    );
    const session = await getSessionContext(client, row.id);
    const recipients = await getRuleRecipients(client, "session_unresolved");
    await enqueue(client, {
      event_type: "session_unresolved",
      recipients,
      body: `⚠️ មិនមានគ្រូចូលរៀនថ្នាក់ ${session?.class_name || ""} មុខវិជ្ជា ${session?.subject_name || ""} ម៉ោង ${session?.start_time?.slice(0, 5) || ""}-${session?.end_time?.slice(0, 5) || ""}។ សូមកំណត់គ្រូជំនួស ឬលុបចោល session។`,
      payload: { session_id: row.id },
      dedupe_key: `unresolved:${row.id}`,
    });
  }
  return due.rowCount;
}

export async function autoCloseHeldSessions(client) {
  const due = await client.query(
    `SELECT sessions.id, sessions.class_id
     FROM class_sessions AS sessions
     WHERE sessions.status NOT IN ('closed', 'cancelled')
       AND (sessions.teacher_checkin_at IS NOT NULL OR sessions.substitute_teacher_id IS NOT NULL)
       AND NOW() >= ((sessions.session_date::text || ' ' || sessions.end_time::text)::timestamp
         AT TIME ZONE $1) + ($2::int * INTERVAL '1 minute')
     ORDER BY sessions.session_date, sessions.start_time, sessions.id
     LIMIT 50
     FOR UPDATE OF sessions SKIP LOCKED`,
    [APP_TIMEZONE, AUTO_CLOSE_MINUTES],
  );
  for (const session of due.rows) {
    const inserted = await client.query(
      `INSERT INTO session_attendance
        (session_id, student_id, status, source, recorded_by)
       SELECT $1, class_students.student_id, 'absent', 'auto', NULL
       FROM class_students
       WHERE class_students.class_id = $2
       ON CONFLICT (session_id, student_id) DO NOTHING
       RETURNING student_id`,
      [session.id, session.class_id],
    );
    for (const absent of inserted.rows) {
      await writeAttendanceAudit(client, {
        sessionId: session.id,
        studentId: absent.student_id,
        newStatus: "absent",
        changeSource: "close",
        changedBy: null,
      });
    }
    await client.query("UPDATE class_sessions SET status = 'closed' WHERE id = $1", [session.id]);
    await enqueueAbsentNotices(client, session.id);
  }
  return due.rowCount;
}
