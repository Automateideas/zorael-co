import { NextResponse } from "next/server";
import { getSession, setProfilePassword } from "@/lib/auth";
import { hashPassword, validatePassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sets or changes the password for the currently signed-in customer. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { password } = (await request.json()) as { password?: string };

  const invalid = validatePassword(password);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  await setProfilePassword(session.userId, await hashPassword(password!));

  return NextResponse.json({ success: true });
}
