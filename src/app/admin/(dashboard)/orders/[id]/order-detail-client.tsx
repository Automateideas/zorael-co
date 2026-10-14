"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Truck,
  Check,
  Package,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import type { OrderStatusDb } from "@/db/schema";
import { updateOrderStatus, updateTracking } from "../actions";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  status: OrderStatusDb;
  customer: { name: string; email?: string; phone?: string };
  address: Record<string, string> | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  method: string;
  couponCode: string | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Item = {
  id: number;
  name: string;
  slug: string;
  unitPrice: number;
  quantity: number;
  size: string | null;
  color: string | null;
  lineTotal: number;
};

type Event = {
  id: number;
  type: string;
  detail: Record<string, unknown> | null;
  actor: string | null;
  createdAt: Date;
};

const STATUS_CONFIG: Record<OrderStatusDb, { label: string; color: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  created: { label: "Created", color: "bg-gray-100 text-gray-600", icon: Clock },
  pending: { label: "Pending Payment", color: "bg-amber-50 text-amber-700", icon: Clock },
  paid: { label: "Paid", color: "bg-blue-50 text-blue-700", icon: Check },
  failed: { label: "Payment Failed", color: "bg-red-50 text-red-600", icon: XCircle },
  confirmed: { label: "Confirmed", color: "bg-indigo-50 text-indigo-700", icon: Check },
  packed: { label: "Packed", color: "bg-violet-50 text-violet-700", icon: Package },
  shipped: { label: "Shipped", color: "bg-sky-50 text-sky-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700", icon: Check },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: XCircle },
  returned: { label: "Returned", color: "bg-orange-50 text-orange-600", icon: RotateCcw },
  refunded: { label: "Refunded", color: "bg-rose-50 text-rose-600", icon: RotateCcw },
};

const STATUS_FLOW: Partial<Record<OrderStatusDb, OrderStatusDb[]>> = {
  created: ["pending", "confirmed", "cancelled"],
  pending: ["paid", "failed", "cancelled"],
  paid: ["confirmed", "cancelled"],
  failed: ["pending", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned", "refunded"],
  returned: ["refunded"],
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailClient({
  order,
  items,
  events,
}: {
  order: Order;
  items: Item[];
  events: Event[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusNote, setStatusNote] = useState("");
  const [carrier, setCarrier] = useState(order.trackingCarrier ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [trackingSaved, setTrackingSaved] = useState(false);

  const sc = STATUS_CONFIG[order.status];
  const StatusIcon = sc.icon;
  const nextStatuses = STATUS_FLOW[order.status] ?? [];

  const handleStatusChange = (newStatus: OrderStatusDb) => {
    startTransition(async () => {
      await updateOrderStatus(order.id, newStatus, statusNote || undefined);
      setStatusNote("");
      router.refresh();
    });
  };

  const handleSaveTracking = () => {
    startTransition(async () => {
      await updateTracking(order.id, carrier, tracking);
      setTrackingSaved(true);
      setTimeout(() => setTrackingSaved(false), 2000);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal/50 transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            All Orders
          </Link>
          <h1 className="mt-2 font-serif text-2xl tracking-tight text-charcoal">
            Order {order.id}
          </h1>
          <p className="mt-0.5 text-xs text-charcoal/45">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${sc.color}`}>
            <StatusIcon className="size-3.5" strokeWidth={1.5} />
            {sc.label}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-lg border border-border bg-white">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
                Items ({items.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      {item.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-charcoal/50">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">
                      {formatPrice(item.lineTotal, order.currency)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-charcoal/40">
                        {formatPrice(item.unitPrice, order.currency)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-3 text-sm">
              <div className="flex justify-between text-charcoal/60">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              {order.discount > 0 && (
                <div className="mt-1 flex justify-between text-emerald-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>−{formatPrice(order.discount, order.currency)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-charcoal/60">
                <span>Shipping</span>
                <span>
                  {order.shipping === 0
                    ? "Free"
                    : formatPrice(order.shipping, order.currency)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-charcoal">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          {/* Status change */}
          {nextStatuses.length > 0 && (
            <section className="rounded-lg border border-border bg-white p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
                Update Status
              </h2>
              <div className="mt-4">
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {nextStatuses.map((s) => {
                    const config = STATUS_CONFIG[s];
                    const isCancel = s === "cancelled" || s === "refunded";
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={pending}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors disabled:opacity-40",
                          isCancel
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "bg-charcoal text-ivory hover:bg-black",
                        )}
                      >
                        {pending ? (
                          <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                        ) : (
                          <>
                            Mark as {config.label}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Tracking */}
          {(order.status === "shipped" || order.status === "packed") && (
            <section className="rounded-lg border border-border bg-white p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
                Tracking Information
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-charcoal/50">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. Delhivery, Blue Dart"
                    className="h-10 w-full rounded-lg border border-border bg-ivory px-4 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-charcoal/50">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="AWB / Tracking ID"
                    className="h-10 w-full rounded-lg border border-border bg-ivory px-4 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveTracking}
                disabled={pending}
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-5 text-xs font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
              >
                {trackingSaved ? (
                  <>
                    <Check className="size-3.5" strokeWidth={1.5} />
                    Saved
                  </>
                ) : pending ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  "Save Tracking"
                )}
              </button>
            </section>
          )}

          {/* Timeline */}
          {events.length > 0 && (
            <section className="rounded-lg border border-border bg-white p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
                Activity Timeline
              </h2>
              <div className="mt-4 space-y-4">
                {events.map((ev) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="size-2 rounded-full bg-charcoal/20" />
                      <div className="flex-1 border-l border-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-charcoal">
                        {ev.type === "status_change" && ev.detail
                          ? `Status changed from ${STATUS_CONFIG[ev.detail.from as OrderStatusDb]?.label ?? ev.detail.from} to ${STATUS_CONFIG[ev.detail.to as OrderStatusDb]?.label ?? ev.detail.to}`
                          : ev.type === "tracking_added"
                            ? `Tracking added: ${(ev.detail as Record<string, string>)?.carrier} — ${(ev.detail as Record<string, string>)?.trackingNumber}`
                            : ev.type}
                      </p>
                      {ev.detail && typeof ev.detail === "object" && "note" in ev.detail && (
                        <p className="mt-0.5 text-xs text-charcoal/50 italic">
                          &ldquo;{String(ev.detail.note)}&rdquo;
                        </p>
                      )}
                      <p className="mt-1 text-xs text-charcoal/35">
                        {formatDateTime(ev.createdAt)}
                        {ev.actor && ` · ${ev.actor}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
              Customer
            </h2>
            <div className="mt-3">
              <p className="text-sm font-medium text-charcoal">
                {order.customer.name}
              </p>
              {order.customer.phone && (
                <p className="mt-0.5 text-xs text-charcoal/55">
                  +91 {order.customer.phone}
                </p>
              )}
              {order.customer.email && (
                <p className="text-xs text-charcoal/55">
                  {order.customer.email}
                </p>
              )}
            </div>
          </section>

          {/* Shipping address */}
          {order.address && (
            <section className="rounded-lg border border-border bg-white p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
                Shipping Address
              </h2>
              <div className="mt-3 text-sm text-charcoal/70">
                {order.address.fullName && (
                  <p className="font-medium text-charcoal">{order.address.fullName}</p>
                )}
                {order.address.line1 && <p>{order.address.line1}</p>}
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {[order.address.city, order.address.state, order.address.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.address.phone && (
                  <p className="mt-1 text-xs text-charcoal/50">
                    +91 {order.address.phone}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Payment */}
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal/50">
              Payment
            </h2>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Method</span>
                <span className="font-medium text-charcoal capitalize">{order.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Total</span>
                <span className="font-medium text-charcoal">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
