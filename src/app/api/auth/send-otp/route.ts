import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Read per-request: a module-scope read is captured once at load, which on
  // hosts that inject env at runtime can latch an undefined value.
  const API_KEY = process.env.TWO_FACTOR_API_KEY;
  // Transactional 2Factor accounts deliver by SMS only when the final segment
  // is a DLT-approved template; without one the OTP can arrive as a voice call.
  const TEMPLATE = process.env.TWO_FACTOR_TEMPLATE_NAME || "OTP1";

  const { phone } = await request.json();

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
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
    const url = TEMPLATE
      ? `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN/${TEMPLATE}`
      : `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Status === "Success") {
      return NextResponse.json({ sessionId: data.Details });
    }

    return NextResponse.json(
      { error: data.Details || "Failed to send OTP." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 },
    );
  }
}
