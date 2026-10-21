import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  findOrCreateProfile,
} from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const API_KEY = process.env.TWO_FACTOR_API_KEY;

  const { phone, sessionId, otp } = await request.json();

  // A 6-digit code is trivially brute-forced without a cap on attempts.
  if (typeof sessionId === "string" && sessionId) {
    const attempts = rateLimit(`otp-verify:${sessionId}`, 5, 10 * 60 * 1000);
    if (!attempts.allowed) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Request a new code." },
        {
          status: 429,
          headers: { "retry-after": String(attempts.retryAfter) },
        },
      );
    }
  }

  if (!phone || !sessionId || !otp) {
    return NextResponse.json(
      { error: "Phone, session ID and OTP are required." },
      { status: 400 },
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "OTP service is not configured." },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`,
    );
    const data = await res.json();

    if (data.Status !== "Success" || data.Details !== "OTP Matched") {
      return NextResponse.json(
        { error: "Invalid or expired OTP." },
        { status: 400 },
      );
    }

    resetRateLimit(`otp-verify:${sessionId}`);

    const profile = await findOrCreateProfile(phone);
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
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
