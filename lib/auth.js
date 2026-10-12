import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPool } from "./db";

export const sessionCookieName = "school_management_session";
export const roles = [
  "director",
  "deputy_director",
  "office_head",
  "office_deputy",
  "office_staff",
  "dept_head",
  "dept_deputy",
  "teacher",
  "student",
  "guardian",
];
export const roleLabels = {
  director: "នាយកវិទ្យាស្ថាន",
  deputy_director: "នាយករងវិទ្យាស្ថាន",
  office_head: "ប្រធានការិយាល័យ",
  office_deputy: "អនុប្រធានការិយាល័យ",
  office_staff: "មន្ត្រីការិយាល័យ",
  dept_head: "ប្រធានដេប៉ាតឺម៉ង់",
  dept_deputy: "អនុប្រធានដេប៉ាតឺម៉ង់",
  teacher: "គ្រូបង្រៀន",
  student: "សិស្ស/និស្សិត",
  guardian: "អាណាព្យាបាល",
};

const sessionDurationSeconds = 60 * 60 * 12;
const scrypt = promisify(scryptCallback);

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

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString("base64url")}`;
}

export async function verifyPassword(password, passwordHash) {
  if (typeof passwordHash !== "string") return false;
  const [algorithm, salt, encodedKey, extra] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedKey || extra) return false;
  const expected = Buffer.from(encodedKey, "base64url");
  const actual = Buffer.from(await scrypt(password, salt, expected.length));
  return expected.length > 0 && safeEqual(actual, expected);
}

export function createSessionToken({ username, userId = null, role = "director", bootstrap = false }) {
  const payload = Buffer.from(JSON.stringify({
    username,
    userId,
    role,
    bootstrap,
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
    if (
      typeof session.username !== "string" ||
      !Number.isInteger(session.expiresAt) ||
      session.expiresAt <= Date.now() / 1000 ||
      !roles.includes(session.role) ||
      typeof session.bootstrap !== "boolean" ||
      (session.bootstrap ? session.userId !== null : typeof session.userId !== "string")
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    return { user: null, response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }

  if (session.bootstrap) {
    const admin = getAdminCredentials();
    if (!safeEqual(session.username, admin.username)) {
      return { user: null, response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
    }
    return {
      user: {
        id: null,
        username: session.username,
        name: session.username,
        role: "director",
        department: null,
        student_id: null,
        teacher_id: null,
        bootstrap: true,
      },
      response: null,
    };
  }

  const result = await getPool().query(
    `SELECT id, username, full_name AS name, role, department,
      student_id, teacher_id
     FROM users
     WHERE id = $1 AND is_active = TRUE`,
    [session.userId],
  );
  const account = result.rows[0];
  if (!account) {
    return { user: null, response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  return { user: { ...account, bootstrap: false }, response: null };
}

export async function requireRole(allowedRoles) {
  const result = await getAuthenticatedUser();
  if (result.response) return result;
  if (!allowedRoles.includes(result.user.role)) {
    return { user: null, response: NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 }) };
  }
  return result;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: sessionDurationSeconds,
  };
}
