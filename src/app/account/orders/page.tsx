import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false },
};

export default async function OrdersPage() {
  const session = await getSession();

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

      {session ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
            <Package className="size-7" strokeWidth={1.25} />
          </span>
          <p className="mt-5 font-serif text-lg tracking-tight text-charcoal">
            No orders yet
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-charcoal/55">
            When you place an order, it will appear here so you can track and review it.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
          >
            Start Shopping
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
            <Package className="size-7" strokeWidth={1.25} />
          </span>
          <p className="mt-5 font-serif text-lg tracking-tight text-charcoal">
            Please sign in to view your orders
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-charcoal/55">
            Sign in with your mobile number to track orders, view order history and manage returns.
          </p>
          <Link
            href="/account/login"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
          >
            Sign In
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      )}
    </div>
  );
}
