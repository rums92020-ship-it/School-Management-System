import { NextResponse } from "next/server";
import { getAuthenticatedUser, roleLabels } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (response) return response;
    return NextResponse.json({
      user: { ...user, roleLabel: roleLabels[user.role] },
    });
  } catch (error) {
    console.error("Could not verify the user session.", error);
    return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
  }
}
