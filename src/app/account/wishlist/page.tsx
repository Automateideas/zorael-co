"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { products } from "@/lib/products";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "All", value: "all" },
  { label: "Clothes", value: "clothes" },
  { label: "Jewellery", value: "jewelry" },
  { label: "Hand Bags", value: "hand-bags" },
];

export default function WishlistPage() {
  const { wishlist, ready } = useStore();
  const [tab, setTab] = useState("all");

  const saved = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [wishlist],
  );
  const filtered = useMemo(
    () => (tab === "all" ? saved : saved.filter((p) => p.category === tab)),
    [saved, tab],
  );

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Wishlist" },
        ]}
      />

      <div className="mt-6 flex items-end justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-charcoal lg:text-4xl">
          Wishlist{" "}
          {ready && (
            <span className="text-charcoal/40">
              ({String(saved.length).padStart(2, "0")})
            </span>
          )}
        </h1>
      </div>

      {ready && saved.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-xs font-medium tracking-wide transition-colors",
                tab === t.value
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-border text-charcoal/70 hover:border-charcoal/40 hover:text-charcoal",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10">
        {!ready ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-md bg-cream"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
              <Heart className="size-7" strokeWidth={1.25} />
            </span>
            <h2 className="mt-6 font-serif text-2xl tracking-tight text-charcoal">
              {saved.length === 0
                ? "Your wishlist is empty"
                : "Nothing saved here yet"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-charcoal/60">
              Tap the heart on any piece to save it for later.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-11 items-center rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
            >
              Discover Pieces
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
