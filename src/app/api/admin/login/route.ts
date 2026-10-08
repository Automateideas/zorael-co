import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createSessionToken,
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { mobile?: string; password?: string };

  if (!body.mobile || !body.password) {
    return NextResponse.json(
      { error: "Mobile and password are required." },
      { status: 400 },
    );
  }

  if (!verifyCredentials(body.mobile, body.password)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
