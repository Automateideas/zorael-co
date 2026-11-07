"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Truck } from "lucide-react";
import { resolveCourier } from "@/lib/couriers";
import { cn } from "@/lib/utils";

/**
 * Shows a shipment's courier and AWB with a one-tap copy button, plus a link to
 * the courier's tracking page.
 *
 * The courier wants the AWB pasted into its own form, so the flow is copy here,
 * open there — which is why the number is copyable rather than the link
 * carrying it.
 */
export function OrderTracking({
  carrier,
  awb,
}: {
  carrier: string | null;
  awb: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const courier = resolveCourier(carrier);

  const copy = async () => {
    try {
      // Absent over plain http and in some in-app browsers, and it can reject
      // even where it exists, so the number stays selectable either way.
      await navigator.clipboard.writeText(awb);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div className="mt-2 border-t border-border pt-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-charcoal/65">
        <span className="flex items-center gap-2">
          <Truck className="size-4 text-muted-gold" strokeWidth={1.5} />
          {courier?.label ?? carrier ?? "Shipment"}
        </span>

        <span className="flex items-center gap-1.5">
          <span className="text-charcoal/40">AWB</span>
          {/* Selectable so the number is still usable if the copy button cannot
              reach the clipboard. */}
          <span className="select-all font-mono text-charcoal">{awb}</span>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy AWB number ${awb}`}
            className={cn(
              "flex size-6 items-center justify-center rounded-full border transition-colors",
              state === "copied"
                ? "border-emerald-600/40 text-emerald-700"
                : "border-border text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal",
            )}
          >
            {state === "copied" ? (
              <Check className="size-3" strokeWidth={2} />
            ) : (
              <Copy className="size-3" strokeWidth={1.5} />
            )}
          </button>
        </span>

        {courier && (
          <a
            href={courier.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-gold underline-offset-2 transition-colors hover:text-charcoal hover:underline"
          >
            Track on {courier.label}
            <ExternalLink className="size-3" strokeWidth={1.5} />
          </a>
        )}
      </div>

      {/* Announced to screen readers; also the only place the paste hint lives,
          so it does not clutter the row until it is useful. */}
      <p role="status" aria-live="polite" className="mt-1.5 text-[0.68rem] text-charcoal/45">
        {state === "copied"
          ? "AWB copied — paste it on the courier's tracking page."
          : state === "failed"
            ? "Could not copy automatically. Select the number above to copy it."
            : courier
              ? "Copy the AWB, then open the tracking page and paste it."
              : "\u00A0"}
      </p>
    </div>
  );
}
