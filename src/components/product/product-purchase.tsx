"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

type VariantInfo = {
  size: string | null;
  color: string | null;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
};

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
  const [variants, setVariants] = useState<VariantInfo[]>([]);
  const [stockLoaded, setStockLoaded] = useState(false);

  const wished = ready && isWishlisted(product.id);

  // Fetch stock data once on mount
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${product.slug}/stock`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { variants: VariantInfo[] } | null) => {
        if (data?.variants) {
          setVariants(data.variants);
          setStockLoaded(true);
        }
      })
      .catch(() => {
        /* offline or failed — show buttons without stock info */
      });
    return () => controller.abort();
  }, [product.slug]);

  // Find stock for the currently selected variant
  const selectedVariant = variants.find(
    (v) =>
      (v.size ?? null) === (size ?? null) &&
      (v.color ?? null) === (color ?? null),
  );

  const outOfStock = stockLoaded && selectedVariant && !selectedVariant.inStock;
  const lowStock = stockLoaded && selectedVariant?.lowStock;
  const maxQty = selectedVariant
    ? Math.min(selectedVariant.stock, 10)
    : 10;

  // Helper: check if a specific size is out of stock across all colours
  const isSizeOutOfStock = (s: string) => {
    if (!stockLoaded) return false;
    const matching = variants.filter((v) => v.size === s);
    return matching.length > 0 && matching.every((v) => !v.inStock);
  };

  // Helper: check if a specific colour is out of stock across all sizes
  const isColorOutOfStock = (c: string) => {
    if (!stockLoaded) return false;
    const matching = variants.filter((v) => v.color === c);
    return matching.length > 0 && matching.every((v) => !v.inStock);
  };

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, { color, size, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      {/* Stock status */}
      {outOfStock && (
        <p className="mt-5 text-sm font-medium text-red-700" role="status">
          Out of Stock
        </p>
      )}
      {lowStock && !outOfStock && (
        <p className="mt-5 text-sm text-charcoal/70" role="status">
          Only {selectedVariant!.stock} left — order soon
        </p>
      )}

      {/* Colours */}
      {product.colors && product.colors.length > 0 && (
        <div className="mt-7">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal/70">
            Colour{color ? ` — ${color}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.colors.map((c) => {
              const oos = isColorOutOfStock(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`${c}${oos ? " (out of stock)" : ""}`}
                  aria-pressed={color === c}
                  className={cn(
                    "relative size-8 rounded-full border transition-all",
                    color === c
                      ? "border-charcoal ring-1 ring-charcoal ring-offset-2 ring-offset-background"
                      : "border-border",
                    oos && "opacity-40",
                  )}
                  style={{ backgroundColor: colorSwatch[c] ?? "#D8CFBF" }}
                >
                  {oos && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="block h-px w-6 rotate-45 bg-charcoal/60" />
                    </span>
                  )}
                </button>
              );
            })}
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
            {product.sizes.map((s) => {
              const oos = isSizeOutOfStock(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !oos && setSize(s)}
                  aria-pressed={size === s}
                  disabled={oos}
                  className={cn(
                    "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors",
                    size === s && !oos
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-border text-charcoal hover:border-charcoal/50",
                    oos &&
                      "cursor-not-allowed border-border/50 text-charcoal/30 line-through hover:border-border/50",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity + Add */}
      <div className="mt-8 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={!!outOfStock}
            aria-label="Decrease quantity"
            className="flex size-11 items-center justify-center text-charcoal transition-colors hover:text-muted-gold disabled:opacity-40"
          >
            <Minus className="size-4" strokeWidth={1.5} />
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={!!outOfStock || qty >= maxQty}
            aria-label="Increase quantity"
            className="flex size-11 items-center justify-center text-charcoal transition-colors hover:text-muted-gold disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!!outOfStock}
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors",
            outOfStock
              ? "cursor-not-allowed bg-charcoal/30 text-ivory/60"
              : "bg-charcoal text-ivory hover:bg-black",
          )}
        >
          {outOfStock ? (
            "Out of Stock"
          ) : added ? (
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

      {!outOfStock && (
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
      )}
    </div>
  );
}
