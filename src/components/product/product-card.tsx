import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
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
  return (
    <article className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md">
          <Media
            src={product.images[0]}
            alt={product.name}
            label={product.name}
            priority={priority}
            sizes={sizes ?? "(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"}
            className="h-full w-full"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Second image cross-fade on hover (desktop) */}
          {product.images[1] && (
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-sm:hidden">
              <Media
                src={product.images[1]}
                alt=""
                label={product.name}
                sizes="(max-width:1024px) 33vw, 20vw"
                className="h-full w-full"
              />
            </div>
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
          {outOfStock && (
            <div className="absolute inset-0 bg-ivory/30" />
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm text-charcoal transition-colors group-hover:text-muted-gold">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-charcoal/70">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
