"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

const colorSwatch: Record<string, string> = {
  Ivory: "#F5F1E8",
  Champagne: "#E6D5A8",
  Sand: "#D8C7A5",
  Charcoal: "#171613",
  Ruby: "#8B1E3F",
  Emerald: "#0F5132",
  Midnight: "#1A2238",
  Saffron: "#E1A140",
  Rose: "#D9A5A0",
  Pearl: "#F1ECE2",
  Noir: "#0D0D0B",
  Blush: "#E8CFC7",
  Sage: "#B7BFA6",
  Clay: "#B08968",
  Wine: "#6E1423",
  Forest: "#2C3B2D",
  Black: "#0D0D0B",
  Taupe: "#D8CFBF",
  Cognac: "#9A5B34",
  Burgundy: "#5C1A2B",
};

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted, ready } = useStore();
  const router = useRouter();

  const [color, setColor] = useState(product.colors?.[0]);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const wished = ready && isWishlisted(product.id);

  const handleAdd = () => {
    addItem(product, { color, size, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      {/* Colours */}
      {product.colors && product.colors.length > 0 && (
        <div className="mt-7">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal/70">
            Colour{color ? ` — ${color}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                aria-pressed={color === c}
                className={cn(
                  "size-8 rounded-full border transition-all",
                  color === c
                    ? "border-charcoal ring-1 ring-charcoal ring-offset-2 ring-offset-background"
                    : "border-border",
                )}
                style={{ backgroundColor: colorSwatch[c] ?? "#D8CFBF" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal/70">
            Size
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors",
                  size === s
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-border text-charcoal hover:border-charcoal/50",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + Add */}
      <div className="mt-8 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex size-11 items-center justify-center text-charcoal transition-colors hover:text-muted-gold"
          >
            <Minus className="size-4" strokeWidth={1.5} />
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex size-11 items-center justify-center text-charcoal transition-colors hover:text-muted-gold"
          >
            <Plus className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          {added ? (
            <>
              <Check className="size-4" strokeWidth={2} /> Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" strokeWidth={1.5} /> Add to Bag
            </>
          )}
        </button>
      </div>

      {/* Wishlist */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={wished}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-charcoal transition-colors hover:border-charcoal/50"
      >
        <Heart
          className="size-4"
          strokeWidth={1.5}
          fill={wished ? "currentColor" : "none"}
          color={wished ? "#9F8650" : "currentColor"}
        />
        {wished ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>

      <button
        type="button"
        onClick={() => {
          addItem(product, { color, size, quantity: qty });
          router.push("/checkout");
        }}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-muted-gold text-sm font-medium text-muted-gold transition-colors hover:bg-muted-gold hover:text-white"
      >
        Buy It Now
      </button>
    </div>
  );
}
