const windows = new Map();

export function rateLimit(request, name, limit, windowMs) {
  const forwarded = request.headers.get("x-forwarded-for");
  const client = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const key = `${name}:${client}`;
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.expiresAt <= now) {
    windows.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
