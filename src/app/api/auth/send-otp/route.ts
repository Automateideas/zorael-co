import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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
  // Read per-request: a module-scope read is captured once at load, which on
  // hosts that inject env at runtime can latch an undefined value.
  const API_KEY = process.env.TWO_FACTOR_API_KEY;
  // Blank/unset means "no template segment" — 2Factor then uses the account's
  // own default, which is the fallback when a named template is not delivering.
  const TEMPLATE = (process.env.TWO_FACTOR_TEMPLATE_NAME ?? "").trim();

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

  if (!API_KEY) {
    return NextResponse.json(
      { error: "OTP service is not configured." },
      { status: 500 },
    );
  }

  try {
    // Voice has no template segment — it reads the generated code aloud.
    const url =
      channel === "voice"
        ? `https://2factor.in/API/V1/${API_KEY}/VOICE/${phone}/AUTOGEN`
        : `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN${
            TEMPLATE ? `/${encodeURIComponent(TEMPLATE)}` : ""
          }`;
    const res = await fetch(url, { cache: "no-store" });
    const raw = await res.text();

    let data: { Status?: string; Details?: string };
    try {
      data = JSON.parse(raw);
    } catch {
      // A non-JSON body means the provider rejected the request outright.
      console.error("[2factor] non-JSON response", res.status, raw.slice(0, 300));
      return NextResponse.json(
        { error: "Could not send the code. Please try again." },
        { status: 502 },
      );
    }

    if (data.Status === "Success" && data.Details) {
      return NextResponse.json({ sessionId: data.Details, channel });
    }

    // Surface the provider's own reason in logs — this is what identifies
    // template/DLT/balance problems in production.
    console.error(
      "[2factor] send failed",
      JSON.stringify({
        channel,
        status: data.Status,
        details: data.Details,
        template: channel === "sms" ? TEMPLATE : undefined,
      }),
    );

    // 2Factor rejects repeats of the same request within 15 seconds.
    const detail = data.Details ?? "";
    if (/duplicate request/i.test(detail)) {
      return NextResponse.json(
        { error: "Please wait a few seconds before requesting another code." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: detail || "Failed to send OTP." },
      { status: 400 },
    );
  } catch (err) {
    console.error("[2factor] request error", err);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 },
    );
  }
}
