import { cn, formatPrice } from "@/lib/utils";

/**
 * Selling price with the original struck through beside it.
 *
 * Deliberately quieter than the usual marketplace treatment: no red badge,
 * no shouting percentage. The original sits in muted charcoal with a thin
 * rule through it, and the saving is a small gold note — discount read as
 * restraint rather than a sale sticker.
 */
export function Price({
  price,
  compareAt,
  currency = "INR",
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  // A compare-at at or below the price is not a discount — ignore it rather
  // than render a negative saving.
  const discounted = typeof compareAt === "number" && compareAt > price;
  const percent = discounted
    ? Math.round(((compareAt! - price) / compareAt!) * 100)
    : 0;

  const scale = {
    sm: { now: "text-sm", was: "text-xs", off: "text-[0.65rem]" },
    md: { now: "text-base", was: "text-sm", off: "text-xs" },
    lg: { now: "text-2xl", was: "text-base", off: "text-xs" },
  }[size];

  if (!discounted) {
    return (
      <span className={cn(scale.now, "text-charcoal", className)}>
        {formatPrice(price, currency)}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn(scale.now, "text-charcoal")}>
        {formatPrice(price, currency)}
      </span>
      <s className={cn(scale.was, "text-charcoal/40 decoration-charcoal/30")}>
        {formatPrice(compareAt!, currency)}
      </s>
      {percent > 0 && (
        <span
          className={cn(
            scale.off,
            "font-medium uppercase tracking-[0.12em] text-muted-gold",
          )}
        >
          {percent}% off
        </span>
      )}
    </span>
  );
}
