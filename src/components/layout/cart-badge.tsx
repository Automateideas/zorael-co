"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

export function CartBadge({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { cartCount, ready } = useStore();

  return (
    <Link
      href="/bag"
      aria-label={`Bag${ready && cartCount ? `, ${cartCount} items` : ""}`}
      className={cn(
        "group relative inline-flex items-center gap-2 text-charcoal transition-colors hover:text-muted-gold",
        className,
      )}
    >
      <span className="relative">
        <ShoppingBag className="size-5" strokeWidth={1.5} />
        {ready && cartCount > 0 && (
          <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-charcoal text-[0.6rem] font-medium text-white">
            {cartCount}
          </span>
        )}
      </span>
      {showLabel && <span className="text-sm">Bag</span>}
    </Link>
  );
}
