"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Lock, LogIn, AlertCircle } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = (await res.json()) as { error: string };
      setError(data.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-2xl tracking-tight text-charcoal">
            ZORAEL & CO.
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-charcoal/50">
            Admin Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs text-charcoal/60">
              <Smartphone className="size-3.5" strokeWidth={1.5} />
              Mobile Number
            </span>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              required
              autoFocus
              className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs text-charcoal/60">
              <Lock className="size-3.5" strokeWidth={1.5} />
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
            />
          </label>

          {error && (
            <p className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="size-3.5 shrink-0" strokeWidth={1.5} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Signing in…"
            ) : (
              <>
                <LogIn className="size-4" strokeWidth={1.5} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
