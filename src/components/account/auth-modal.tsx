"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

type Mode = "signin" | "signup";

/**
 * Sign in / sign up in a dialog, so the customer keeps their place on the
 * page. Sign-in reuses /api/auth/login; sign-up verifies the mobile by OTP
 * before the account is created.
 */
export function AuthModal({
  open,
  initialMode = "signin",
  onClose,
}: {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
}) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Escape closes, matching the rest of the site's dialogs.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setAwaitingOtp(false);
    setOtp("");
  };

  const finish = async () => {
    await refresh();
    onClose();
    // Server components (orders, account) re-read the new session.
    router.refresh();
  };

  const signIn = async () => {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      await finish();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startSignUp = async () => {
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start sign-up.");
        return;
      }
      setSessionId(data.sessionId);
      setAwaitingOtp(true);
      setNotice(`We sent a 6-digit code to +91 ${phone}.`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeSignUp = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, sessionId, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create your account.");
        return;
      }
      await finish();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signin" ? "Sign in" : "Create account"}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-sm overflow-auto rounded-t-2xl border border-border bg-white sm:rounded-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-serif text-lg tracking-tight text-charcoal">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-cream hover:text-charcoal"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {!awaitingOtp && (
          <div className="flex gap-2 px-5 pt-4">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "h-9 flex-1 rounded-full text-xs font-medium transition-colors",
                  mode === m
                    ? "bg-charcoal text-ivory"
                    : "border border-border text-charcoal/60 hover:border-charcoal/40",
                )}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4 p-5">
          {awaitingOtp ? (
            <>
              <p className="text-sm text-charcoal/70">
                Enter the code sent to +91 {phone} to finish creating your
                account.
              </p>
              <Field label="Verification Code">
                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyDown={(e) => e.key === "Enter" && completeSignUp()}
                  inputMode="numeric"
                  placeholder="6-digit code"
                  autoFocus
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                onClick={() => {
                  setAwaitingOtp(false);
                  setOtp("");
                  setNotice(null);
                }}
                className="text-xs text-charcoal/50 underline underline-offset-2 hover:text-charcoal"
              >
                Change details
              </button>
            </>
          ) : mode === "signup" ? (
            <>
              <Field label="Full Name">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
              <Field label="Mobile Number">
                <PhoneInput value={phone} onChange={setPhone} />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </Field>
              <Field label="Confirm Password">
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startSignUp()}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Mobile Number">
                <PhoneInput value={phone} onChange={setPhone} />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && signIn()}
                  autoComplete="current-password"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {notice && (
            <p className="rounded-md bg-cream px-3 py-2 text-xs text-charcoal/70">
              {notice}
            </p>
          )}
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={
              awaitingOtp
                ? completeSignUp
                : mode === "signin"
                  ? signIn
                  : startSignUp
            }
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : awaitingOtp ? (
              "Verify & Create Account"
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          {!awaitingOtp && (
            <p className="text-center text-xs text-charcoal/50">
              {mode === "signin" ? (
                <>
                  New to ZORAEL &amp; CO.?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="underline underline-offset-2 hover:text-charcoal"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="underline underline-offset-2 hover:text-charcoal"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-md border border-border bg-white px-3.5 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-muted-gold focus:outline-none";

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex">
      <span className="flex h-11 items-center rounded-l-md border border-r-0 border-border bg-cream px-3 text-sm text-charcoal/60">
        +91
      </span>
      <input
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        autoComplete="tel"
        className="h-11 flex-1 rounded-r-md border border-border bg-white px-3.5 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-muted-gold focus:outline-none"
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
        {label}
      </span>
      {children}
    </label>
  );
}
