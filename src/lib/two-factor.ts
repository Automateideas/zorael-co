/**
 * 2Factor.in OTP — single source of truth.
 * ----------------------------------------
 * Change the endpoint, the DLT template, or the channels HERE and every auth
 * route (send-otp, verify-otp, register, reset-password) picks it up. Nothing
 * else hard-codes the 2Factor URL.
 *
 * Latest endpoints:
 *   Send (SMS):   https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE}/AUTOGEN/{TEMPLATE}
 *   Send (VOICE): https://2factor.in/API/V1/{API_KEY}/VOICE/{PHONE}/AUTOGEN
 *   Verify:       https://2factor.in/API/V1/{API_KEY}/SMS/VERIFY/{SESSION_ID}/{OTP}
 */

/** Base API URL — change here if 2Factor ever moves it. */
export const BASE_URL = "https://2factor.in/API/V1";

/**
 * DLT-approved template name for the SMS OTP. Defaults to "ZORAEL" (the current
 * approved template). Override with the TWO_FACTOR_TEMPLATE_NAME env var if the
 * template is ever renamed — set it to "ZORAEL" or leave it unset to use this.
 */
export const TEMPLATE_NAME = (
  process.env.TWO_FACTOR_TEMPLATE_NAME || "ZORAEL"
).trim();

export type OtpChannel = "sms" | "voice";

export type SendOtpResult =
  | { ok: true; sessionId: string }
  | {
      ok: false;
      error: string;
      detail?: string;
      duplicate?: boolean;
      notConfigured?: boolean;
    };

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: string; notConfigured?: boolean };

/**
 * Read the API key per-call: a module-scope read is captured once at load,
 * which on hosts that inject env at runtime can latch an undefined value.
 */
function apiKey(): string | null {
  const key = process.env.TWO_FACTOR_API_KEY?.trim();
  return key || null;
}

/** True when the OTP service has an API key configured. */
export function isOtpConfigured(): boolean {
  return apiKey() !== null;
}

/**
 * Send an OTP to a phone number. 2Factor auto-generates the code and returns a
 * session id used later to verify it.
 */
export async function sendOtp(
  phone: string,
  channel: OtpChannel = "sms",
): Promise<SendOtpResult> {
  const key = apiKey();
  if (!key) {
    return {
      ok: false,
      error: "OTP service is not configured.",
      notConfigured: true,
    };
  }

  // Voice reads the generated code aloud and takes no template segment.
  const url =
    channel === "voice"
      ? `${BASE_URL}/${key}/VOICE/${phone}/AUTOGEN`
      : `${BASE_URL}/${key}/SMS/${phone}/AUTOGEN${
          TEMPLATE_NAME ? `/${encodeURIComponent(TEMPLATE_NAME)}` : ""
        }`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const raw = await res.text();

    let data: { Status?: string; Details?: string };
    try {
      data = JSON.parse(raw);
    } catch {
      // A non-JSON body means the provider rejected the request outright.
      console.error("[2factor] non-JSON response", res.status, raw.slice(0, 300));
      return { ok: false, error: "Could not send the code. Please try again." };
    }

    if (data.Status === "Success" && data.Details) {
      return { ok: true, sessionId: data.Details };
    }

    // Surface the provider's own reason in logs — this is what identifies
    // template/DLT/balance problems in production.
    console.error(
      "[2factor] send failed",
      JSON.stringify({
        channel,
        status: data.Status,
        details: data.Details,
        template: channel === "sms" ? TEMPLATE_NAME : undefined,
      }),
    );

    const detail = data.Details ?? "";
    // 2Factor rejects repeats of the same request within ~15 seconds.
    if (/duplicate request/i.test(detail)) {
      return {
        ok: false,
        error: "Please wait a few seconds before requesting another code.",
        duplicate: true,
        detail,
      };
    }
    return { ok: false, error: detail || "Failed to send OTP.", detail };
  } catch (err) {
    console.error("[2factor] request error", err);
    return { ok: false, error: "Failed to send OTP. Please try again." };
  }
}

/** Verify an OTP against the session id returned by {@link sendOtp}. */
export async function verifyOtp(
  sessionId: string,
  otp: string,
): Promise<VerifyOtpResult> {
  const key = apiKey();
  if (!key) {
    return {
      ok: false,
      error: "OTP service is not configured.",
      notConfigured: true,
    };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/${key}/SMS/VERIFY/${encodeURIComponent(
        sessionId,
      )}/${encodeURIComponent(otp)}`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as { Status?: string; Details?: string };
    if (data.Status === "Success" && data.Details === "OTP Matched") {
      return { ok: true };
    }
    return { ok: false, error: "Invalid or expired OTP." };
  } catch {
    return { ok: false, error: "Verification failed. Please try again." };
  }
}
