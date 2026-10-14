"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import type { OrderStatusDb } from "@/db/schema";
import { cn } from "@/lib/utils";

type OrderSummary = {
  id: string;
  status: OrderStatusDb;
  customer: { name: string; email?: string; phone?: string };
  total: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
};

const STATUS_CONFIG: Record<
  OrderStatusDb,
  { label: string; color: string }
> = {
  created: { label: "Created", color: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700" },
  paid: { label: "Paid", color: "bg-blue-50 text-blue-700" },
  failed: { label: "Failed", color: "bg-red-50 text-red-600" },
  confirmed: { label: "Confirmed", color: "bg-indigo-50 text-indigo-700" },
  packed: { label: "Packed", color: "bg-violet-50 text-violet-700" },
  shipped: { label: "Shipped", color: "bg-sky-50 text-sky-700" },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
  returned: { label: "Returned", color: "bg-orange-50 text-orange-600" },
  refunded: { label: "Refunded", color: "bg-rose-50 text-rose-600" },
};

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Action Required", value: "action" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
] as const;

const ACTION_STATUSES: OrderStatusDb[] = ["pending", "paid", "confirmed", "packed"];

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderTable({ orders }: { orders: OrderSummary[] }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    if (tab === "action" && !ACTION_STATUSES.includes(o.status)) return false;
    if (tab === "shipped" && o.status !== "shipped") return false;
    if (tab === "delivered" && o.status !== "delivered") return false;
    if (tab === "cancelled" && !["cancelled", "returned", "refunded"].includes(o.status)) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone?.includes(q) ||
        o.customer.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTab(f.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              tab === f.value
                ? "bg-charcoal text-ivory"
                : "bg-cream text-charcoal/60 hover:text-charcoal",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name, phone..."
          className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-white py-16 text-center">
          <p className="text-sm text-charcoal/50">
            {orders.length === 0
              ? "No orders yet. Orders will appear here when customers place them."
              : "No orders match your filter."}
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
          {/* Header */}
          <div className="hidden border-b border-border bg-cream/50 px-5 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-charcoal/40 sm:grid sm:grid-cols-[1fr_140px_100px_100px_80px_32px]">
            <span>Customer</span>
            <span>Order ID</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span className="text-right">Items</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((o) => {
            const sc = STATUS_CONFIG[o.status];
            return (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex flex-col gap-2 border-b border-border px-5 py-4 transition-colors last:border-0 hover:bg-cream/30 sm:grid sm:grid-cols-[1fr_140px_100px_100px_80px_32px] sm:items-center sm:gap-0"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    {o.customer.name}
                  </p>
                  <p className="text-xs text-charcoal/45">
                    {o.customer.phone || o.customer.email || "—"} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <p className="font-mono text-xs text-charcoal/60">
                  {o.id.length > 14 ? `${o.id.slice(0, 14)}…` : o.id}
                </p>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium ${sc.color}`}
                  >
                    {sc.label}
                  </span>
                </div>
                <p className="text-right text-sm font-medium text-charcoal">
                  {formatPrice(o.total, o.currency)}
                </p>
                <p className="text-right text-xs text-charcoal/50">
                  {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                </p>
                <ChevronRight
                  className="hidden size-4 text-charcoal/20 sm:block"
                  strokeWidth={1.5}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
