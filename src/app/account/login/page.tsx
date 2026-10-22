import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/** Only in-app paths are accepted, so `next` cannot bounce to another site. */
function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string; mode?: string }>;
}) {
  const { next, reason, mode } = await searchParams;
  const target = safeNext(next);

  const session = await getSession();
  if (session) redirect(target);

  return (
    <div className="container-zorael flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-3xl tracking-tight text-charcoal">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-charcoal/55">
            {reason === "checkout"
              ? "Please sign in or create an account to place your order."
              : "Sign in with your mobile number"}
          </p>
          {reason === "checkout" && (
            <p className="mt-2 text-xs text-charcoal/45">
              Your bag is saved — you&apos;ll come straight back to checkout.
            </p>
          )}
        </div>
        <LoginForm
          redirectTo={target}
          initialMode={mode === "signup" ? "signup" : "otp"}
        />
      </div>
    </div>
  );
}
