/**
 * Customer authentication — phone OTP via 2Factor.in with HMAC-signed session cookies.
 * Server-only: never import from a Client Component.
 */
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { profiles } from "@/db/schema";

export const SESSION_COOKIE = "zorael_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * The dev fallback is a constant in this repo, so anyone could forge a
 * customer session with it — refuse to run on it in production.
 */
function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SESSION_SECRET must be set in production — the dev fallback is public.",
    );
  }
  return "zorael-dev-session-secret-change-me";
}

async function hmacSign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(payload);
  return expected === signature;
}

export async function createSessionToken(userId: string, phone: string): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = JSON.stringify({ userId, phone, exp });
  const sig = await hmacSign(payload);
  return btoa(payload) + "." + sig;
}

export async function verifySessionToken(
  token: string,
): Promise<{ userId: string; phone: string } | null> {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  try {
    const payload = atob(token.slice(0, dot));
    const sig = token.slice(dot + 1);
    if (!(await hmacVerify(payload, sig))) return null;
    const data = JSON.parse(payload);
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    return { userId: data.userId, phone: data.phone };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ userId: string; phone: string } | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  if (!hasDatabase()) return null;

  const db = getDb();
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.userId))
    .limit(1);

  return row ?? null;
}

export async function findProfileByPhone(phone: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.phone, phone))
    .limit(1);
  return row ?? null;
}

export async function setProfilePassword(userId: string, passwordHash: string) {
  const db = getDb();
  await db
    .update(profiles)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(profiles.id, userId));
}

export async function findOrCreateProfile(phone: string) {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.phone, phone))
    .limit(1);

  if (existing) return existing;

  const id = uuid();
  const now = new Date();
  await db.insert(profiles).values({
    id,
    phone,
    phoneVerified: true,
    role: "customer",
    createdAt: now,
    updatedAt: now,
  });

  const [created] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  return created!;
}
