import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowRight, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { getMyOrders } from "./actions";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false },
};

// Always read fresh: a customer arriving straight from checkout must see the
// order they just placed, never a cached empty list.
export const dynamic = "force-dynamic";

/** Customer-facing wording for the internal order statuses. */
const STATUS: Record<string, { label: string; className: string }> = {
  created: { label: "Awaiting Payment", className: "bg-gray-100 text-gray-600" },
  pending: { label: "Confirmed", className: "bg-amber-50 text-amber-700" },
  paid: { label: "Payment Received", className: "bg-blue-50 text-blue-700" },
  failed: { label: "Payment Failed", className: "bg-red-50 text-red-600" },
  confirmed: { label: "Confirmed", className: "bg-indigo-50 text-indigo-700" },
  packed: { label: "Packed", className: "bg-violet-50 text-violet-700" },
  shipped: { label: "Shipped", className: "bg-sky-50 text-sky-700" },
  delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
  returned: { label: "Returned", className: "bg-orange-50 text-orange-600" },
  refunded: { label: "Refunded", className: "bg-rose-50 text-rose-600" },
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function OrdersPage() {
  const session = await getSession();
  const orders = session ? await getMyOrders() : [];

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "My Orders" },
        ]}
      />

      <h1 className="mt-6 font-serif text-2xl tracking-tight text-charcoal">
        My Orders
      </h1>

      {!session ? (
        <EmptyState
          title="Please sign in to view your orders"
          body="Sign in with your mobile number to track orders, view order history and manage returns."
          href="/account/login?next=/account/orders"
          cta="Sign In"
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="When you place an order, it will appear here so you can track and review it."
          href="/shop"
          cta="Start Shopping"
        />
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = STATUS[order.status] ?? {
              label: order.status,
              className: "bg-gray-100 text-gray-600",
            };

            return (
              <article
                key={order.id}
                className="rounded-lg border border-border bg-white"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {order.id}
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal/45">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </header>

                <ul className="divide-y divide-border">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="text-sm text-charcoal transition-colors hover:text-muted-gold"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-charcoal/50">
                          Qty {item.quantity}
                          {item.size && ` · ${item.size}`}
                          {item.color && ` · ${item.color}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm text-charcoal">
                        {formatPrice(item.lineTotal, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>

                <footer className="space-y-1.5 border-t border-border px-5 py-3.5 text-sm">
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>
                        Discount{order.couponCode && ` (${order.couponCode})`}
                      </span>
                      <span>−{formatPrice(order.discount, order.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-charcoal/60">
                    <span>Delivery</span>
                    <span>
                      {order.shipping === 0
                        ? "Free"
                        : formatPrice(order.shipping, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-charcoal">
                    <span>Total</span>
                    <span>{formatPrice(order.total, order.currency)}</span>
                  </div>

                  {order.trackingNumber && (
                    <p className="mt-2 flex items-center gap-2 border-t border-border pt-2.5 text-xs text-charcoal/65">
                      <Truck className="size-4 text-muted-gold" strokeWidth={1.5} />
                      {order.trackingCarrier} — {order.trackingNumber}
                    </p>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
        <Package className="size-7" strokeWidth={1.25} />
      </span>
      <p className="mt-5 font-serif text-lg tracking-tight text-charcoal">
        {title}
      </p>
      <p className="mt-1.5 max-w-xs text-sm text-charcoal/55">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
      >
        {cta}
        <ArrowRight className="size-4" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
