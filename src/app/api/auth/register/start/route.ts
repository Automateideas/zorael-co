import { NextResponse } from "next/server";
import { findProfileByPhone } from "@/lib/auth";
import { validatePassword } from "@/lib/password";
import { hasDatabase } from "@/db/client";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isOtpConfigured, sendOtp } from "@/lib/two-factor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalisePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

/**
 * Step one of sign-up: validate the details and send an OTP to the mobile.
 * No account is created here — the number must be proven first, otherwise
 * anyone could register against someone else's mobile and capture the
 * account that person later signs into by OTP.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    fullName?: string;
    email?: string;
    phone?: unknown;
    password?: string;
  };

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = normalisePhone(body.phone);

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 },
    );
  }
  const badPassword = validatePassword(body.password);
  if (badPassword) {
    return NextResponse.json({ error: badPassword }, { status: 400 });
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Sign-up is unavailable right now." },
      { status: 503 },
    );
  }

  const existing = await findProfileByPhone(phone);
  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "An account with this mobile number already exists. Please sign in." },
      { status: 409 },
    );
  }

  const limit = rateLimit(`register:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  if (!isOtpConfigured()) {
    return NextResponse.json(
      { error: "OTP service is not configured." },
      { status: 500 },
    );
  }

  const result = await sendOtp(phone, "sms");
  if (result.ok) {
    return NextResponse.json({ sessionId: result.sessionId });
  }
  return NextResponse.json(
    { error: result.detail || "Could not send the verification code." },
    { status: result.notConfigured ? 500 : 400 },
  );
}
