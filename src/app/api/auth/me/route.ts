import { NextResponse } from "next/server";
import { getProfile, getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const profile = await getProfile();
  return NextResponse.json({
    user: profile
      ? {
          id: profile.id,
          phone: profile.phone,
          fullName: profile.fullName,
          email: profile.email,
        }
      : { id: session.userId, phone: session.phone },
  });
}
