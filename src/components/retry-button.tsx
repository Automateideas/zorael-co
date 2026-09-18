"use client";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-11 items-center justify-center rounded-full bg-charcoal px-8 text-sm font-medium text-ivory transition-colors hover:bg-black"
    >
      Try Again
    </button>
  );
}
