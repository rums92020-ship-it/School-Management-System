import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookieName = "school_management_session";
const sessionDurationSeconds = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("APP_SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function getAdminCredentials() {
  const username = process.env.APP_ADMIN_USERNAME;
  const password = process.env.APP_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("APP_ADMIN_USERNAME and APP_ADMIN_PASSWORD must be configured.");
  }
  return { username, password };
}

export function verifyAdminCredentials(username, password) {
  const admin = getAdminCredentials();
  return safeEqual(username, admin.username) && safeEqual(password, admin.password);
}

export function createSessionToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Math.floor(Date.now() / 1000) + sessionDurationSeconds,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || token.length > 2048) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof session.username !== "string" || !Number.isInteger(session.expiresAt) || session.expiresAt <= Date.now() / 1000) {
      return null;
    }
    return { username: session.username };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDurationSeconds,
  };
}
