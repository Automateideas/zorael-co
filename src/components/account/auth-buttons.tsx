"use client";

import { useState } from "react";
import { AuthModal } from "./auth-modal";

/** Sign In / Sign Up triggers for the signed-out Account panel. */
export function AuthButtons() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const show = (next: "signin" | "signup") => {
    setMode(next);
    setOpen(true);
  };

  return (
    <>
      <div className="mt-6 space-y-2.5">
        <button
          type="button"
          onClick={() => show("signin")}
          className="flex h-11 w-full items-center justify-center rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => show("signup")}
          className="flex h-11 w-full items-center justify-center rounded-full border border-charcoal/20 text-sm font-medium text-charcoal transition-colors hover:bg-cream"
        >
          Create Account
        </button>
      </div>

      {/* Mounted only while open, so each visit starts from a clean form. */}
      {open && (
        <AuthModal
          open
          initialMode={mode}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
