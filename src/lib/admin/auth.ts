/**
 * Admin authentication — env-configured credentials, HMAC-signed session cookie.
 * Server-only. Never import from a Client Component.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { verifyPassword } from "@/lib/password";

/** Compares via digests so the check is constant time and length-independent. */
function constantTimeEquals(a: string, b: string): boolean {
  const da = createHash("sha256").update(a.normalize("NFKC")).digest();
  const db = createHash("sha256").update(b.normalize("NFKC")).digest();
  return timingSafeEqual(da, db);
}

/** Cookie name for the admin session token. */
export const ADMIN_COOKIE = "zorael_admin_session";

/** Session duration: 24 hours. */
export const SESSION_MAX_AGE = 60 * 60 * 24;

/**
 * Returns the signing secret. The dev fallback is a constant in this repo, so
 * anyone could forge an admin cookie with it — refuse to run on it in
 * production rather than accept forged sessions.
 */
function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set in production — the dev fallback is public.",
    );
  }
  return "zorael-dev-admin-secret-change-me";
}

/**
 * Verify the supplied mobile + password against the configured admin.
 *
 * Password comes from either ADMIN_PASSWORD (plain) or ADMIN_PASSWORD_HASH
 * (scrypt, via `npm run admin:set-password`); the hash wins when both are set.
 * Both are compared in constant time. The mobile number is not a secret, so a
 * plain comparison is fine for it.
 */
export async function verifyCredentials(
  mobile: string,
  password: string,
): Promise<boolean> {
  const expectedMobile = process.env.ADMIN_MOBILE;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  const expectedPlain = process.env.ADMIN_PASSWORD;

  if (!expectedMobile || (!expectedHash && !expectedPlain)) {
    throw new Error(
      "Set ADMIN_MOBILE plus either ADMIN_PASSWORD or ADMIN_PASSWORD_HASH.",
    );
  }

  const checkPassword = () =>
    expectedHash
      ? verifyPassword(password, expectedHash)
      : Promise.resolve(constantTimeEquals(password, expectedPlain!));

  // Strip whitespace, separators and a leading country code.
  const clean = mobile.replace(/[\s\-+]/g, "").replace(/^91/, "");
  if (clean !== expectedMobile) {
    // Still check, so a wrong mobile is not measurably faster than a wrong
    // password.
    await checkPassword();
    return false;
  }

  return checkPassword();
}

/**
 * Create a signed session token (HMAC-SHA256).
 * Format: `<payload-base64>.<signature-hex>`
 */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  const sigHex = Buffer.from(sig).toString("hex");
  return `${payloadB64}.${sigHex}`;
}

/**
 * Verify a session token. Returns true if valid and not expired.
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, sigHex] = token.split(".");
    if (!payloadB64 || !sigHex) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(sigHex, "hex"),
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return false;

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString(),
    ) as { role: string; exp: number };
    if (payload.role !== "admin") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}
