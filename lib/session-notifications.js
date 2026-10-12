import { APP_TIMEZONE } from "./app-constants";
import { enqueue, guardianMessage, localDate, localTime } from "./notifications";

export async function getSessionContext(client, sessionId) {
  const result = await client.query(
    `SELECT sessions.id, sessions.class_id, sessions.session_date,
      sessions.start_time, sessions.end_time, classes.name AS class_name,
      subjects.name AS subject_name, subjects.department, sessions.room,
      COALESCE(sessions.teacher_id, slots.teacher_id) AS teacher_id,
      teachers.name AS teacher_name,
      ((sessions.session_date::text || ' ' || sessions.start_time::text)::timestamp
        AT TIME ZONE $2) AS starts_at,
      ((sessions.session_date::text || ' ' || sessions.end_time::text)::timestamp
        AT TIME ZONE $2) AS ends_at
     FROM class_sessions AS sessions
     JOIN classes ON classes.id = sessions.class_id
     LEFT JOIN timetable_slots AS slots ON slots.id = sessions.slot_id
     LEFT JOIN subjects ON subjects.id = COALESCE(sessions.subject_id, slots.subject_id)
     LEFT JOIN teachers ON teachers.teacher_id = COALESCE(sessions.teacher_id, slots.teacher_id)
     WHERE sessions.id = $1`,
    [sessionId, APP_TIMEZONE],
  );
  return result.rows[0] || null;
}

export async function getGuardianRecipients(client, studentId, preference) {
  const column = preference === "notify_absent" ? "notify_absent" : "notify_scan";
  const result = await client.query(
    `SELECT DISTINCT guardian_students.guardian_user_id AS user_id
     FROM guardian_students
     JOIN notification_channels
       ON notification_channels.user_id = guardian_students.guardian_user_id
      AND notification_channels.channel = 'telegram'
      AND notification_channels.is_active = TRUE
      AND notification_channels.chat_id IS NOT NULL
     WHERE guardian_students.student_id = $1
       AND guardian_students.${column} = TRUE`,
    [studentId],
  );
  return result.rows.map(row => row.user_id);
}

export async function enqueueStudentScan(client, sessionId, studentId, status) {
  const session = await getSessionContext(client, sessionId);
  if (!session) return;
  const studentResult = await client.query(
    "SELECT COALESCE(name_khmer, name_english) AS name FROM students WHERE student_id = $1",
    [studentId],
  );
  const recipients = await getGuardianRecipients(client, studentId, "notify_scan");
  const timestamp = new Date();
  const message = guardianMessage({
    status,
    student: studentResult.rows[0]?.name || "",
    className: session.class_name,
    subject: session.subject_name || "",
    time: localTime(timestamp),
  });
  await enqueue(client, {
    event_type: "student_scanned",
    recipients,
    body: message,
    payload: { session_id: sessionId, student_id: studentId, status },
    dedupe_key: `scan:${sessionId}:${studentId}:${status}`,
  });
}

export async function enqueueAbsentNotices(client, sessionId) {
  const session = await getSessionContext(client, sessionId);
  if (!session) return;
  const absent = await client.query(
    `SELECT attendance.student_id,
      COALESCE(students.name_khmer, students.name_english) AS student_name
     FROM session_attendance AS attendance
     JOIN students ON students.student_id = attendance.student_id
     WHERE attendance.session_id = $1 AND attendance.status = 'absent'`,
    [sessionId],
  );
  for (const student of absent.rows) {
    const recipients = await getGuardianRecipients(client, student.student_id, "notify_absent");
    await enqueue(client, {
      event_type: "student_absent",
      recipients,
      body: guardianMessage({
        status: "absent",
        student: student.student_name || "",
        className: session.class_name,
        subject: session.subject_name || "",
        start: session.start_time.slice(0, 5),
        end: session.end_time.slice(0, 5),
        date: localDate(`${session.session_date}T12:00:00+07:00`),
      }),
      payload: { session_id: sessionId, student_id: student.student_id },
      dedupe_key: `absent:${sessionId}:${student.student_id}`,
    });
  }
  await client.query(
    "UPDATE class_sessions SET absent_notified_at = NOW() WHERE id = $1",
    [sessionId],
  );
  return absent.rowCount;
}

export async function enqueueAbsenceCorrection(client, sessionId, studentId, status) {
  const session = await getSessionContext(client, sessionId);
  if (!session) return;
  const student = await client.query(
    "SELECT COALESCE(name_khmer, name_english) AS name FROM students WHERE student_id = $1",
    [studentId],
  );
  const recipients = await getGuardianRecipients(client, studentId, "notify_absent");
  const date = localDate(`${session.session_date}T12:00:00+07:00`);
  await enqueue(client, {
    event_type: "student_absent_correction",
    recipients,
    body: `ℹ️ កែតម្រូវ: ស្ថានភាពរបស់ ${student.rows[0]?.name || ""} នៅថ្នាក់ ${session.class_name} ថ្ងៃទី ${date} ត្រូវបានកែជា ${{ present: "មានវត្តមាន", late: "មកយឺត", excused: "មានច្បាប់" }[status] || "បានកែប្រែ"}។`,
    payload: { session_id: sessionId, student_id: studentId, status },
    dedupe_key: `absent_fix:${sessionId}:${studentId}:${status}`,
  });
}

export async function writeAttendanceAudit(
  client,
  { sessionId, studentId = null, oldStatus = null, newStatus = null, changeSource, changedBy },
) {
  await client.query(
    `INSERT INTO attendance_audit
      (session_id, student_id, old_status, new_status, change_source, changed_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [sessionId, studentId, oldStatus, newStatus, changeSource, changedBy],
  );
}
