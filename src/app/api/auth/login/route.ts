import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  findProfileByPhone,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { hasDatabase } from "@/db/client";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Same message for every failure so this cannot be used to enumerate accounts. */
const INVALID = "Incorrect mobile number or password.";

export async function POST(request: Request) {
  const { phone, password } = (await request.json()) as {
    phone?: string;
    password?: string;
  };

  // /api/admin/login has always capped attempts; this one did not, leaving
  // customer passwords open to unlimited online guessing.
  const limitKey = `customer-login:${clientIp(request)}`;
  const limit = rateLimit(limitKey, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  if (!phone || !password) {
    return NextResponse.json(
      { error: "Mobile number and password are required." },
      { status: 400 },
    );
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Sign-in is unavailable right now." },
      { status: 503 },
    );
  }

  const profile = await findProfileByPhone(phone);
  if (!profile || !(await verifyPassword(password, profile.passwordHash))) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  resetRateLimit(limitKey);

  const token = await createSessionToken(profile.id, phone);
  const response = NextResponse.json({
    success: true,
    user: {
      id: profile.id,
      phone: profile.phone,
      fullName: profile.fullName,
    },
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
