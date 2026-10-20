import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createSessionToken,
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/admin/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const key = `admin-login:${clientIp(request)}`;
  const limit = rateLimit(key, MAX_ATTEMPTS, WINDOW_MS);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const body = (await request.json()) as { mobile?: string; password?: string };

  if (!body.mobile || !body.password) {
    return NextResponse.json(
      { error: "Mobile and password are required." },
      { status: 400 },
    );
  }

  let ok = false;
  try {
    ok = await verifyCredentials(body.mobile, body.password);
  } catch {
    // Credentials not configured — do not leak the reason to the client.
    return NextResponse.json(
      { error: "Admin sign-in is not configured." },
      { status: 500 },
    );
  }

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  resetRateLimit(key);

  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
