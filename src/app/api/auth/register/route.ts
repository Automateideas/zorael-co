import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { profiles } from "@/db/schema";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  findProfileByPhone,
} from "@/lib/auth";
import { hashPassword, validatePassword } from "@/lib/password";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { isOtpConfigured, verifyOtp } from "@/lib/two-factor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalisePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

/**
 * Step two of sign-up: verify the OTP, then create the account. The OTP is
 * checked against 2Factor here rather than trusting the client's claim that
 * an earlier step succeeded.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    fullName?: string;
    email?: string;
    phone?: unknown;
    password?: string;
    sessionId?: string;
    otp?: string;
  };

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = normalisePhone(body.phone);
  const { sessionId, otp, password } = body;

  if (!fullName || !email || !phone || !sessionId || !otp) {
    return NextResponse.json({ error: "Missing details." }, { status: 400 });
  }
  const badPassword = validatePassword(password);
  if (badPassword) {
    return NextResponse.json({ error: badPassword }, { status: 400 });
  }
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Sign-up is unavailable right now." },
      { status: 503 },
    );
  }
  if (!isOtpConfigured()) {
    return NextResponse.json(
      { error: "OTP service is not configured." },
      { status: 500 },
    );
  }

  const attempts = rateLimit(`register-verify:${sessionId}`, 5, 10 * 60 * 1000);
  if (!attempts.allowed) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please start again." },
      { status: 429 },
    );
  }

  const verification = await verifyOtp(sessionId, otp);
  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.notConfigured ? verification.error : "Invalid or expired code." },
      { status: verification.notConfigured ? 500 : 400 },
    );
  }

  resetRateLimit(`register-verify:${sessionId}`);

  const db = getDb();
  const passwordHash = await hashPassword(password!);
  const now = new Date();

  // A profile may already exist from a previous OTP-only sign-in; the verified
  // OTP proves this caller owns the number, so completing it is safe.
  const existing = await findProfileByPhone(phone);
  let userId: string;

  if (existing) {
    if (existing.passwordHash) {
      return NextResponse.json(
        { error: "An account with this mobile number already exists. Please sign in." },
        { status: 409 },
      );
    }
    userId = existing.id;
    await db
      .update(profiles)
      .set({
        fullName: existing.fullName ?? fullName,
        email: existing.email ?? email,
        passwordHash,
        phoneVerified: true,
        updatedAt: now,
      })
      .where(eq(profiles.id, userId));
  } else {
    userId = uuid();
    await db.insert(profiles).values({
      id: userId,
      fullName,
      email,
      phone,
      phoneVerified: true,
      passwordHash,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    });
  }

  const token = await createSessionToken(userId, phone);
  const response = NextResponse.json({
    success: true,
    user: { id: userId, phone, fullName },
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
