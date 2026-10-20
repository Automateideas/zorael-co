import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  findOrCreateProfile,
  setProfilePassword,
} from "@/lib/auth";
import { hashPassword, validatePassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Forgot-password: proves ownership of the number with a 2Factor OTP, then
 * sets a new password. The OTP is verified here rather than trusting any
 * client-side claim that it already passed.
 */
export async function POST(request: Request) {
  const API_KEY = process.env.TWO_FACTOR_API_KEY;

  const { phone, sessionId, otp, password } = (await request.json()) as {
    phone?: string;
    sessionId?: string;
    otp?: string;
    password?: string;
  };

  if (!phone || !sessionId || !otp) {
    return NextResponse.json(
      { error: "Phone, session ID and OTP are required." },
      { status: 400 },
    );
  }

  const invalid = validatePassword(password);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
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
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }

  const profile = await findOrCreateProfile(phone);
  await setProfilePassword(profile.id, await hashPassword(password!));

  // The OTP already proved ownership, so sign them straight in.
  const token = await createSessionToken(profile.id, phone);
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
