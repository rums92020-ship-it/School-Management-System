import { cookies } from "next/headers";
import { sessionCookieName, verifySessionToken } from "./auth";

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(verifySessionToken(cookieStore.get(sessionCookieName)?.value));
}

export function unauthorizedResponse() {
  return Response.json({ error: "Authentication required." }, { status: 401 });
}

export function invalidJsonResponse() {
  return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
}

export function databaseErrorResponse(error, message) {
  console.error(message, error);
  return Response.json({ error: "The database request could not be completed." }, { status: 503 });
}

export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
