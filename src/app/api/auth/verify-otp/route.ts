import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  findOrCreateProfile,
} from "@/lib/auth";

const API_KEY = process.env.TWO_FACTOR_API_KEY;

export async function POST(request: Request) {
  const { phone, sessionId, otp } = await request.json();

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
