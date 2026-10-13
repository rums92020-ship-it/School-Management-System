export async function sendTelegramMessage(chatId, text, timeoutMs = 5000) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, code: "telegram_not_configured", retryAfter: null };
  }
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: String(chatId), text }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (response.ok && result.ok) {
    return { ok: true, result };
  }
  return {
    ok: false,
    code: result.error_code || response.status,
    retryAfter: Number(result.parameters?.retry_after) || null,
    details: result.description || null,
  };
}

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME && process.env.TELEGRAM_WEBHOOK_SECRET);
}
