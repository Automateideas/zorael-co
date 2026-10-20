import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getProfile, getSession } from "@/lib/auth";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = {
  title: "Password",
  robots: { index: false },
};

export default async function SecurityPage() {
  const session = await getSession();
  const profile = session ? await getProfile() : null;

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Password" },
        ]}
      />

      <h1 className="mt-6 font-serif text-2xl tracking-tight text-charcoal">
        Password
      </h1>

      {session ? (
        <>
          <p className="mt-1.5 max-w-md text-sm text-charcoal/55">
            {profile?.passwordHash
              ? "Change the password you use to sign in with your mobile number."
              : "Set a password to sign in with your mobile number instead of waiting for an OTP."}
          </p>
          <PasswordForm hasPassword={Boolean(profile?.passwordHash)} />
        </>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
            <Lock className="size-7" strokeWidth={1.25} />
          </span>
          <p className="mt-5 font-serif text-lg tracking-tight text-charcoal">
            Please sign in to manage your password
          </p>
          <Link
            href="/account/login"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
          >
            Sign In
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      )}
    </div>
  );
}
