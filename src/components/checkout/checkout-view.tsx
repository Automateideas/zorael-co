"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Landmark,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { Media } from "@/components/media";
import { cn, formatPrice } from "@/lib/utils";
import { startCheckout } from "@/lib/checkout-client";

const steps = ["Address", "Payment", "Review"] as const;

const paymentMethods = [
  { id: "upi", label: "UPI (PhonePe / GPay / Paytm)", Icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", Icon: CreditCard },
  { id: "netbanking", label: "Net Banking", Icon: Landmark },
  { id: "cod", label: "Cash on Delivery", Icon: Wallet },
] as const;

export function CheckoutView() {
  const { items, subtotal, ready, clearCart } = useStore();
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState<string>("upi");
  const [placed, setPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [codPending, setCodPending] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shipping = subtotal >= 15000 ? 0 : 500;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError(null);
    const result = await startCheckout({
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
      })),
      method: payment,
      customer: { name: address.name, phone: address.phone },
      address,
    });

    if (result.status === "redirect") {
      window.location.href = result.url;
      return;
    }
    if (result.status === "paid" || result.status === "pending") {
      setConfirmedOrderId(result.orderId);
      setCodPending(result.status === "pending");
      clearCart();
      setPlaced(true);
    } else {
      setError(result.error);
    }
    setProcessing(false);
  };

  if (!ready) {
    return (
      <div className="container-zorael py-12">
        <div className="h-8 w-40 animate-pulse rounded bg-cream" />
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container-zorael flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-gold/20 text-muted-gold">
          <Check className="size-8" strokeWidth={1.5} />
        </span>
        <h1 className="mt-6 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
          Thank you for your order.
        </h1>
        {confirmedOrderId && (
          <p className="mt-3 text-sm text-charcoal/70">
            Order reference{" "}
            <span className="font-medium text-charcoal">
              {confirmedOrderId}
            </span>
          </p>
        )}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal/60">
          {codPending
            ? "Your order is confirmed and will be paid on delivery. A confirmation would normally be sent to your email with tracking details."
            : "Your payment was processed through the configured gateway (currently the built-in test gateway — no real charge). A confirmation would normally be sent to your email with tracking details."}
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

  if (items.length === 0) {
    return (
      <div className="container-zorael flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-serif text-3xl tracking-tight text-charcoal">
          Your bag is empty
        </h1>
        <p className="mt-3 text-sm text-charcoal/60">
          Add a few pieces before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-zorael py-8 lg:py-12">
      <h1 className="font-serif text-3xl tracking-tight text-charcoal lg:text-4xl">
        Checkout
      </h1>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-3">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-3 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  i <= step
                    ? "bg-charcoal text-ivory"
                    : "border border-border text-charcoal/40",
                )}
              >
                {i < step ? <Check className="size-3.5" strokeWidth={2} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  i <= step ? "text-charcoal" : "text-charcoal/40",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className="hidden h-px flex-1 bg-border sm:block" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Step 1: Address */}
          {step === 0 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-charcoal/70">
                Shipping Address
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={address.name}
                  onChange={(v) => setAddress((a) => ({ ...a, name: v }))}
                  className="sm:col-span-2"
                />
                <Field
                  label="Phone"
                  value={address.phone}
                  onChange={(v) => setAddress((a) => ({ ...a, phone: v }))}
                />
                <Field
                  label="Pincode"
                  value={address.pincode}
                  onChange={(v) => setAddress((a) => ({ ...a, pincode: v }))}
                />
                <Field
                  label="Address"
                  value={address.line1}
                  onChange={(v) => setAddress((a) => ({ ...a, line1: v }))}
                  className="sm:col-span-2"
                />
                <Field
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress((a) => ({ ...a, city: v }))}
                />
                <Field
                  label="State"
                  value={address.state}
                  onChange={(v) => setAddress((a) => ({ ...a, state: v }))}
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black sm:w-auto sm:px-10"
              >
                Continue to Payment
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </button>
            </section>
          )}

          {/* Step 2: Payment */}
          {step === 1 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-charcoal/70">
                Payment Method
              </h2>
              <div className="mt-4 space-y-3">
                {paymentMethods.map(({ id, label, Icon }) => (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 transition-colors",
                      payment === id
                        ? "border-charcoal bg-cream"
                        : "border-border hover:border-charcoal/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={payment === id}
                      onChange={() => setPayment(id)}
                      className="size-4 accent-charcoal"
                    />
                    <Icon className="size-5 text-muted-gold" strokeWidth={1.5} />
                    <span className="text-sm text-charcoal">{label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs text-charcoal/50">
                Payment is processed securely by the configured gateway. The
                store currently runs the built-in test gateway, so no real charge
                is made.
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="h-12 rounded-full border border-border px-6 text-sm text-charcoal transition-colors hover:border-charcoal/50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black sm:flex-none sm:px-10"
                >
                  Review Order
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-charcoal/70">
                Review Your Order
              </h2>
              <div className="mt-4 space-y-4 rounded-lg border border-border bg-white p-5 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-charcoal/45">
                    Delivering to
                  </p>
                  <p className="mt-1 text-charcoal">
                    {address.name || "—"}
                    {address.line1 && `, ${address.line1}`}
                    {address.city && `, ${address.city}`}
                    {address.state && `, ${address.state}`}
                    {address.pincode && ` — ${address.pincode}`}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs uppercase tracking-wide text-charcoal/45">
                    Payment
                  </p>
                  <p className="mt-1 text-charcoal">
                    {paymentMethods.find((m) => m.id === payment)?.label}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 rounded-full border border-border px-6 text-sm text-charcoal transition-colors hover:border-charcoal/50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing
                    ? "Processing…"
                    : payment === "cod"
                      ? `Place Order · ${formatPrice(total)}`
                      : `Pay ${formatPrice(total)}`}
                </button>
              </div>
              {error && (
                <p className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </section>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="font-serif text-lg tracking-tight text-charcoal">
              Order Summary
            </h2>
            <ul className="mt-5 space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-md">
                    <Media
                      src={item.image}
                      alt={item.name}
                      label={item.name}
                      sizes="56px"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex flex-1 flex-col text-xs">
                    <span className="text-charcoal">{item.name}</span>
                    <span className="text-charcoal/50">
                      Qty {item.quantity}
                      {item.size && ` · ${item.size}`}
                    </span>
                    <span className="mt-auto text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <dt>Subtotal</dt>
                <dd className="text-charcoal">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <dt>Shipping</dt>
                <dd className="text-charcoal">
                  {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-medium text-charcoal">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-center gap-2 text-xs text-charcoal/55">
              <Truck className="size-4 text-muted-gold" strokeWidth={1.5} />
              Delivered in 3–6 business days
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs text-charcoal/60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-md border border-border bg-white px-3.5 text-sm text-charcoal transition-colors focus:border-muted-gold focus:outline-none"
      />
    </label>
  );
}
