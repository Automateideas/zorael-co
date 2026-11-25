import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isOtpConfigured, sendOtp } from "@/lib/two-factor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SMS and voice are separate 2Factor products with separate endpoints and
 * balances, so they are tracked and rate-limited independently — one being
 * unavailable must never disable the other.
 */
type Channel = "sms" | "voice";

/** Accepts 9599523940, +91 9599523940, 919599523940 etc. */
function normalisePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    phone?: unknown;
    channel?: unknown;
  };
  const phone = normalisePhone(body.phone);
  const channel: Channel = body.channel === "voice" ? "voice" : "sms";

  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 },
    );
  }

  // Per-number cap stops OTP spamming a stranger; per-IP cap stops a single
  // client cycling through many numbers.
  const perPhone = rateLimit(`otp-send:${channel}:${phone}`, 3, 10 * 60 * 1000);
  if (!perPhone.allowed) {
    return NextResponse.json(
      {
        error: `Too many codes requested. Try again in ${Math.ceil(perPhone.retryAfter / 60)} minute(s).`,
      },
      { status: 429, headers: { "retry-after": String(perPhone.retryAfter) } },
    );
  }
  const perIp = rateLimit(`otp-send-ip:${clientIp(request)}`, 15, 60 * 60 * 1000);
  if (!perIp.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "retry-after": String(perIp.retryAfter) } },
    );
  }

  if (!isOtpConfigured()) {
    return NextResponse.json(
      { error: "OTP service is not configured." },
      { status: 500 },
    );
  }

  const result = await sendOtp(phone, channel);
  if (result.ok) {
    return NextResponse.json({ sessionId: result.sessionId, channel });
  }
  if (result.duplicate) {
    return NextResponse.json({ error: result.error }, { status: 429 });
  }
  return NextResponse.json(
    { error: result.error },
    { status: result.notConfigured ? 500 : 400 },
  );
}
