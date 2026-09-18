"use client";

import { Heart } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  className,
  size = "md",
}: {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isWishlisted, toggleWishlist, ready } = useStore();
  const active = ready && isWishlisted(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white",
        size === "md" ? "size-9" : "size-8",
        className,
      )}
    >
      <Heart
        className={cn(size === "md" ? "size-4" : "size-3.5")}
        strokeWidth={1.5}
        fill={active ? "currentColor" : "none"}
        color={active ? "#9F8650" : "currentColor"}
      />
    </button>
  );
}
