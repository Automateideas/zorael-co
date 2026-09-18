"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { Media } from "@/components/media";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPrice } from "@/lib/utils";

export default function BagPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, ready } =
    useStore();

  if (!ready) {
    return (
      <div className="container-zorael py-12">
        <div className="h-8 w-40 animate-pulse rounded bg-cream" />
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-cream" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-zorael flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
          <ShoppingBag className="size-7" strokeWidth={1.25} />
        </span>
        <h1 className="mt-6 font-serif text-3xl tracking-tight text-charcoal">
          Your bag is empty
        </h1>
        <p className="mt-3 max-w-sm text-sm text-charcoal/60">
          Once you add pieces you love, they&apos;ll appear here.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Continue Shopping
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  const shippingNote =
    subtotal >= 15000 ? "Complimentary" : formatPrice(500);
  const total = subtotal + (subtotal >= 15000 ? 0 : 500);

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />

      <div className="mt-6 flex items-end justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-charcoal lg:text-4xl">
          Your Bag{" "}
          <span className="text-charcoal/40">({items.length})</span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-charcoal/50 transition-colors hover:text-charcoal"
        >
          Clear All
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <Link
                href={`/shop/${item.slug}`}
                className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md sm:w-24"
              >
                <Media
                  src={item.image}
                  alt={item.name}
                  label={item.name}
                  sizes="96px"
                  className="h-full w-full"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link
                      href={`/shop/${item.slug}`}
                      className="text-sm font-medium text-charcoal transition-colors hover:text-muted-gold"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-charcoal/55">
                      {[item.size && `Size ${item.size}`, item.color]
                        .filter(Boolean)
                        .join("  ·  ")}
                    </p>
                  </div>
                  <p className="text-sm text-charcoal">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="flex size-8 items-center justify-center text-charcoal transition-colors hover:text-muted-gold"
                    >
                      <Minus className="size-3.5" strokeWidth={1.5} />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                      className="flex size-8 items-center justify-center text-charcoal transition-colors hover:text-muted-gold"
                    >
                      <Plus className="size-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex items-center gap-1.5 text-xs text-charcoal/50 transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="font-serif text-xl tracking-tight text-charcoal">
              Order Summary
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <dt>Subtotal</dt>
                <dd className="text-charcoal">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <dt>Shipping</dt>
                <dd className="text-charcoal">{shippingNote}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base font-medium text-charcoal">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </div>
            </dl>

            {subtotal < 15000 && (
              <p className="mt-4 rounded-md bg-cream px-3 py-2 text-xs text-charcoal/65">
                Add {formatPrice(15000 - subtotal)} more for complimentary
                shipping.
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black"
            >
              Proceed to Checkout
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/shop"
              className="mt-3 flex h-11 items-center justify-center text-sm text-charcoal/70 transition-colors hover:text-charcoal"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
