"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm({ dark = true }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div
        className={`flex items-center gap-3 text-sm ${dark ? "text-ivory/80" : "text-charcoal"}`}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-gold">
          <Check className="size-4" strokeWidth={2} />
        </span>
        Thank you — you&apos;re on the list.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className={`flex items-center gap-2 rounded-full border px-2 py-2 pl-5 ${
        dark ? "border-white/20 bg-white/5" : "border-border bg-white"
      }`}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className={`w-full bg-transparent text-sm focus:outline-none ${
          dark
            ? "text-ivory placeholder:text-ivory/40"
            : "text-charcoal placeholder:text-charcoal/40"
        }`}
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-black transition-colors hover:bg-muted-gold"
      >
        <ArrowRight className="size-4" strokeWidth={1.75} />
      </button>
    </form>
  );
}
