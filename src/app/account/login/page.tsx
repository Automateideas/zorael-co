import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/account");

  return (
    <div className="container-zorael flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-3xl tracking-tight text-charcoal">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-charcoal/55">
            Sign in with your mobile number
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
