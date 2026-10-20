"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save your password.");
        return;
      }

      setPassword("");
      setConfirm("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 max-w-md space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
          {hasPassword ? "New Password" : "Password"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className="h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          className="h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={loading || !password || !confirm}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40 sm:w-auto sm:px-10"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
        ) : saved ? (
          <>
            <Check className="size-4" strokeWidth={1.5} />
            Saved
          </>
        ) : hasPassword ? (
          "Update Password"
        ) : (
          "Set Password"
        )}
      </button>
    </div>
  );
}
