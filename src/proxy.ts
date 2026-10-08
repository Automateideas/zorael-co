import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // No-op until Supabase is configured, so the site still runs without it.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const response = await updateSession(request);
  if (response) {
    response.headers.set("x-pathname", pathname);
  }
  return response;
}

export const config = {
  matcher: [
    // Skip static assets, PWA files and payment webhooks.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons|icon|apple-icon|api/webhooks|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
