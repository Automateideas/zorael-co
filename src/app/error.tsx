"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Monogram } from "@/components/layout/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-zorael flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Monogram className="text-5xl" />
      <p className="eyebrow mt-8">Something went wrong</p>
      <h1 className="mt-3 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
        A moment, please.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/60">
        We ran into an unexpected issue. Please try again — or return home while
        we set things right.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-charcoal/70 px-7 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
