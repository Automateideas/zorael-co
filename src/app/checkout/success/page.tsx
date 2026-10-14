"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const error = params.get("error");
  const { clearCart } = useStore();

  useEffect(() => {
    if (!error) {
      clearCart();
    }
  }, [error, clearCart]);

  if (error) {
    return (
      <div className="container-zorael flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
          Payment could not be completed
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/60">
          Something went wrong during the payment process. Please try again or
          contact us if the issue persists.
        </p>
        <Link
          href="/checkout"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Try Again
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-zorael flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-gold/20 text-muted-gold">
        <Check className="size-8" strokeWidth={1.5} />
      </span>
      <h1 className="mt-6 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
        Thank you for your order.
      </h1>
      {orderId && (
        <p className="mt-3 text-sm text-charcoal/70">
          Order reference{" "}
          <span className="font-medium text-charcoal">{orderId}</span>
        </p>
      )}
      <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal/60">
        Your payment has been processed successfully. A confirmation will be
        sent to your email with tracking details.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/account/orders"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-charcoal/20 px-7 text-sm font-medium text-charcoal transition-colors hover:bg-cream"
        >
          View Orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Continue Shopping
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
