"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { Media } from "@/components/media";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({
  product,
  priority = false,
  sizes,
  outOfStock = false,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  /** When true, shows an "Out of Stock" badge over the image. */
  outOfStock?: boolean;
}) {
  const images = product.images.length ? product.images : [""];
  const count = images.length;
  const [index, setIndex] = useState(0);

  const step = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    setIndex((i) => Math.max(0, Math.min(i + dir, count - 1)));
  };

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md">
        <Media
          key={index}
          src={images[index]}
          alt={product.name}
          label={product.name}
          priority={priority && index === 0}
          sizes={sizes ?? "(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Click target — kept out of the button stack so controls stay valid. */}
        <Link
          href={`/shop/${product.slug}`}
          aria-label={product.name}
          className="absolute inset-0"
        />

        {count > 1 && (
          <>
            {index > 0 && (
              <button
                type="button"
                onClick={(e) => step(e, -1)}
                aria-label="Previous image"
                className={arrowClass("left-2")}
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </button>
            )}
            {index < count - 1 && (
              <button
                type="button"
                onClick={(e) => step(e, 1)}
                aria-label="Next image"
                className={arrowClass("right-2")}
              >
                <ChevronRight className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </>
        )}

        <div className="absolute right-2.5 top-2.5 z-10">
          <WishlistButton productId={product.id} size="sm" />
        </div>
        {outOfStock ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-charcoal/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ivory">
            Out of Stock
          </span>
        ) : product.isNew ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-charcoal">
            New
          </span>
        ) : null}
        {outOfStock && <div className="pointer-events-none absolute inset-0 bg-ivory/30" />}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm text-charcoal transition-colors group-hover:text-muted-gold">
            <Link href={`/shop/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm text-charcoal/70">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}

/** Hidden until hover on pointer devices; always visible on touch. */
function arrowClass(side: string) {
  return cn(
    "absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center",
    "rounded-full bg-ivory/90 text-charcoal transition-opacity duration-300 hover:bg-ivory",
    "sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
    side,
  );
}
