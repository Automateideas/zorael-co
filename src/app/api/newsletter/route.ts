import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/db/client";
import { newsletterSubscribers } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** POST /api/newsletter  { email, source? } — idempotent subscribe. */
export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const source =
    typeof body.source === "string" ? body.source.slice(0, 40) : undefined;

  if (!hasDatabase()) {
    // Local dev without a database: accept but don't persist.
    return NextResponse.json({ subscribed: true, persisted: false });
  }

  try {
    await getDb()
      .insert(newsletterSubscribers)
      .values({ email, source })
      .onConflictDoNothing({ target: newsletterSubscribers.email });
    return NextResponse.json({ subscribed: true });
  } catch (err) {
    console.error("[newsletter] insert failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
