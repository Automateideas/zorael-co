"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

type Step = "phone" | "otp" | "new-password";
type Mode = "otp" | "password";

export function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [mode, setMode] = useState<Mode>("otp");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }

      setSessionId(data.sessionId);
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async () => {
    setError("");
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
        setError(data.error || "Sign-in failed.");
        return;
      }

      await refresh();
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async () => {
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          sessionId,
          otp: otp.join(""),
          password: newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not set your password.");
        return;
      }

      await refresh();
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    // Forgot-password flow: the OTP is verified server-side together with the
    // new password, so just move to the password step.
    if (resetting) {
      setError("");
      setStep("new-password");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, sessionId, otp: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        return;
      }

      await refresh();
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      verifyOtp();
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setPassword("");
    setResetting(false);
    setStep("phone");
  };

  return (
    <div className="mt-8">
      {step === "phone" && (
        <div
          role="tablist"
          aria-label="Sign-in method"
          className="mb-6 flex gap-2"
        >
          {(["otp", "password"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`h-9 flex-1 rounded-full text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-charcoal text-ivory"
                  : "border border-border text-charcoal/60 hover:border-charcoal/40"
              }`}
            >
              {m === "otp" ? "OTP" : "Password"}
            </button>
          ))}
        </div>
      )}

      {step === "phone" ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Mobile Number
            </label>
            <div className="flex">
              <span className="flex h-12 items-center rounded-l-lg border border-r-0 border-border bg-cream px-3 text-sm text-charcoal/60">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (mode === "otp" ? sendOtp() : signInWithPassword())
                }
                placeholder="Enter your mobile number"
                className="h-12 flex-1 rounded-r-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {mode === "password" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && signInWithPassword()}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            onClick={mode === "otp" ? sendOtp : signInWithPassword}
            disabled={
              loading ||
              phone.length !== 10 ||
              (mode === "password" && !password)
            }
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : mode === "otp" ? (
              <>
                Continue
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {mode === "otp" ? (
            <p className="text-center text-[0.7rem] leading-relaxed text-charcoal/40">
              We&apos;ll send a 6-digit verification code to this number.
            </p>
          ) : (
            <button
              onClick={() => {
                setResetting(true);
                sendOtp();
              }}
              disabled={loading || phone.length !== 10}
              className="mx-auto block text-[0.7rem] text-charcoal/50 underline underline-offset-2 transition-colors hover:text-charcoal disabled:opacity-40"
            >
              Forgot password?
            </button>
          )}
        </div>
      ) : step === "new-password" ? (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-charcoal/70">Choose a new password</p>
            <p className="mt-1 text-xs text-charcoal/45">
              For +91 {phone.slice(0, 2)}••••{phone.slice(-4)}
            </p>
          </div>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitNewPassword()}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
            autoFocus
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={submitNewPassword}
            disabled={loading || newPassword.length < 8}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              "Save & Sign In"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <p className="text-sm text-charcoal/70">
              Enter the code sent to
            </p>
            <p className="mt-1 text-sm font-medium text-charcoal">
              +91 {phone.slice(0, 2)}••••{phone.slice(-4)}
            </p>
            <button
              onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
              className="mt-1 text-xs text-charcoal/40 underline underline-offset-2 transition-colors hover:text-charcoal"
            >
              Change number
            </button>
          </div>

          {/* OTP Inputs */}
          <div className="flex items-center justify-center gap-3">
            {otp.map((digit, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text").replace(/\D/g, "");
                    if (text.length > 1) {
                      e.preventDefault();
                      handleOtpChange(i, text);
                    }
                  }}
                  className={`h-14 w-11 rounded-lg border bg-white text-center font-serif text-xl text-charcoal transition-all focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal/10 ${
                    digit ? "border-charcoal/30" : "border-border"
                  }`}
                />
                {i === 2 && (
                  <span className="text-lg text-charcoal/15">—</span>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-center text-xs text-red-600">{error}</p>
          )}

          <button
            onClick={verifyOtp}
            disabled={loading || otp.join("").length !== 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : resetting ? (
              "Verify & Continue"
            ) : (
              "Verify & Sign In"
            )}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-xs text-charcoal/35">
                Resend code in <span className="tabular-nums text-charcoal/60">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="text-xs font-medium text-charcoal underline underline-offset-2 transition-colors hover:text-black"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
