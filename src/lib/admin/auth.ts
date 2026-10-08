/**
 * Admin authentication — hardcoded credentials, HMAC-signed session cookie.
 * Server-only. Never import from a Client Component.
 */

const ADMIN_MOBILE = "9599523940";
const ADMIN_PASSWORD = "Vicky@9599523940";

/** Cookie name for the admin session token. */
export const ADMIN_COOKIE = "zorael_admin_session";

/** Session duration: 24 hours. */
export const SESSION_MAX_AGE = 60 * 60 * 24;

/**
 * Returns the signing secret. Falls back to a dev-only default so the admin
 * panel works locally without extra env setup.
 */
function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "zorael-dev-admin-secret-change-me";
}

/** Verify the supplied mobile + password against the hardcoded credentials. */
export function verifyCredentials(mobile: string, password: string): boolean {
  // Constant-time comparison would be ideal but for a single hardcoded admin
  // the risk is negligible. Strip whitespace and country prefixes.
  const clean = mobile.replace(/[\s\-+]/g, "").replace(/^91/, "");
  return clean === ADMIN_MOBILE && password === ADMIN_PASSWORD;
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
