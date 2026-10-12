import { createHash, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { APP_TIMEZONE } from "./app-constants";
import { getPool } from "./db";

const telegramTimeoutMs = 5000;
const retryDelaysMs = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000, 12 * 60 * 60_000];

export async function enqueue(client, { event_type, recipients, body, payload = {}, dedupe_key }) {
  const recipientIds = [...new Set((recipients || []).filter(id => typeof id === "string" && id))];
  if (!event_type || !body || !dedupe_key || recipientIds.length === 0) return 0;
  let inserted = 0;
  for (const recipientId of recipientIds) {
    const inApp = await client.query(
      `INSERT INTO notifications
        (event_type, recipient_user_id, body, payload, dedupe_key, channel, status, attempts, next_attempt_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, 'in_app', 'sent', 0, NOW())
       ON CONFLICT (dedupe_key, recipient_user_id, channel) DO NOTHING`,
      [event_type, recipientId, body, JSON.stringify(payload), dedupe_key],
    );
    inserted += inApp.rowCount;
  }
  const telegram = await client.query(
    `INSERT INTO notifications
      (event_type, recipient_user_id, body, payload, dedupe_key, channel, status, attempts, next_attempt_at)
     SELECT $1, channels.user_id, $2, $3::jsonb, $4, 'telegram', 'pending', 0, NOW()
     FROM notification_channels AS channels
     WHERE channels.user_id = ANY($5::uuid[])
       AND channels.channel = 'telegram'
       AND channels.is_active = TRUE
       AND channels.chat_id IS NOT NULL
     ON CONFLICT (dedupe_key, recipient_user_id, channel) DO NOTHING`,
    [event_type, body, JSON.stringify(payload), dedupe_key, recipientIds],
  );
  return inserted + telegram.rowCount;
}

export function scheduleNotificationDelivery() {
  after(async () => {
    try {
      await deliverPendingNotifications(10);
    } catch {
      console.error("Post-response notification delivery attempt failed.");
    }
  });
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("telegram_not_configured");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(telegramTimeoutMs),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (response.ok && result.ok) return { ok: true };
  return {
    ok: false,
    code: result.error_code || response.status,
    retryAfter: Number(result.parameters?.retry_after) || null,
  };
}

function retryAt(attempt, retryAfter) {
  const delay = retryAfter
    ? Math.min(Math.max(retryAfter, 1), 24 * 60 * 60) * 1000
    : retryDelaysMs[Math.min(attempt - 1, retryDelaysMs.length - 1)];
  return new Date(Date.now() + delay);
}

export async function deliverPendingNotifications(batchSize = 50) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const pending = await client.query(
      `SELECT notifications.id, notifications.recipient_user_id, notifications.body,
        notifications.attempts, notifications.channel, channels.chat_id
       FROM notifications
       LEFT JOIN notification_channels AS channels
         ON channels.user_id = notifications.recipient_user_id
        AND channels.channel = 'telegram'
        AND channels.is_active = TRUE
       WHERE notifications.channel = 'telegram'
         AND notifications.status = 'pending'
         AND notifications.next_attempt_at <= NOW()
       ORDER BY notifications.next_attempt_at, notifications.id
       LIMIT $1
       FOR UPDATE OF notifications SKIP LOCKED`,
      [Math.min(Math.max(batchSize, 1), 50)],
    );
    for (const notification of pending.rows) {
      const attempt = notification.attempts + 1;
      if (!notification.chat_id) {
        await client.query(
          `UPDATE notifications SET status = 'failed', attempts = $2
           WHERE id = $1`,
          [notification.id, attempt],
        );
        continue;
      }
      let result;
      try {
        result = await sendTelegramMessage(notification.chat_id, notification.body);
      } catch {
        result = { ok: false, code: 0, retryAfter: null };
      }
      if (result.ok) {
        await client.query(
          `UPDATE notifications SET status = 'sent', attempts = $2
           WHERE id = $1`,
          [notification.id, attempt],
        );
        continue;
      }
      if (result.code === 403) {
        await client.query(
          `UPDATE notification_channels SET is_active = FALSE
           WHERE user_id = $1 AND channel = 'telegram' AND chat_id = $2`,
          [notification.recipient_user_id, notification.chat_id],
        );
      }
      if (attempt >= 5 || result.code === 403) {
        await client.query(
          `UPDATE notifications SET status = 'failed', attempts = $2
           WHERE id = $1`,
          [notification.id, attempt],
        );
      } else {
        await client.query(
          `UPDATE notifications
           SET attempts = $2, next_attempt_at = $3
           WHERE id = $1`,
          [notification.id, attempt, retryAt(attempt, result.retryAfter)],
        );
      }
    }
    await client.query("COMMIT");
    return pending.rowCount;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function hashLinkToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function constantTimeEqual(left, right) {
  const leftHash = createHash("sha256").update(String(left || "")).digest();
  const rightHash = createHash("sha256").update(String(right || "")).digest();
  return leftHash.length === rightHash.length && timingSafeEqual(leftHash, rightHash);
}

export function localTime(value) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function localDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function guardianMessage({ status, student, className, subject, time, start, end, date }) {
  if (status === "absent") {
    return `❌ ${student} អវត្តមានថ្នាក់ ${className} មុខវិជ្ជា ${subject} ម៉ោង ${start}-${end} ថ្ងៃទី ${date}។ សូមទាក់ទងការិយាល័យបើមានសំណួរ។`;
  }
  const prefix = status === "late" ? "⚠️" : "✅";
  const verb = status === "late" ? "មកយឺត" : "បានមកដល់";
  return `${prefix} ${student} ${verb}ថ្នាក់ ${className} មុខវិជ្ជា ${subject} ម៉ោង ${time}។`;
}

export function correctionMessage({ student, className, date, status }) {
  const statusKm = { present: "មានវត្តមាន", late: "មកយឺត", excused: "មានច្បាប់" }[status] || "បានកែប្រែ";
  return `ℹ️ កែតម្រូវ: ស្ថានភាពរបស់ ${student} នៅថ្នាក់ ${className} ថ្ងៃទី ${date} ត្រូវបានកែជា ${statusKm}។`;
}
