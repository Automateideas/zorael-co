/**
 * Client-side checkout orchestration. Talks only to our own API routes, then
 * runs the correct payment flow for whichever provider the server reports.
 * No secrets ever reach the browser.
 */

import type { CartLineInput } from "./pricing";

export type CheckoutRequest = {
  items: CartLineInput[];
  method: string;
  customer: { name: string; email?: string; phone?: string };
  address?: Record<string, string>;
};

export type CheckoutResult =
  | { status: "paid"; orderId: string }
  | { status: "pending"; orderId: string } // e.g. Cash on Delivery
  | { status: "redirect"; url: string }
  | { status: "failed"; error: string };

type CreateOrderResponse = {
  orderId: string;
  cod?: boolean;
  providerOrderId?: string;
  provider?: string;
  publicKey?: string;
  redirectUrl?: string;
  amount?: number;
  currency?: string;
  error?: string;
};

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export async function startCheckout(
  req: CheckoutRequest,
): Promise<CheckoutResult> {
  let order: CreateOrderResponse;
  try {
    order = await postJSON<CreateOrderResponse>("/api/checkout", req);
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Checkout failed",
    };
  }

  // Cash on delivery — nothing more to pay now.
  if (order.cod) {
    return { status: "pending", orderId: order.orderId };
  }

  // Hosted / redirect-style providers.
  if (order.redirectUrl) {
    return { status: "redirect", url: order.redirectUrl };
  }

  try {
    if (order.provider === "razorpay") {
      return await payWithRazorpay(order);
    }
    // Default: mock provider.
    return await payWithMock(order);
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Payment failed",
    };
  }
}

async function payWithMock(
  order: CreateOrderResponse,
): Promise<CheckoutResult> {
  const { providerPaymentId, signature } = await postJSON<{
    providerPaymentId: string;
    signature: string;
  }>("/api/checkout/mock-pay", { providerOrderId: order.providerOrderId });

  await postJSON("/api/checkout/verify", {
    orderId: order.orderId,
    providerOrderId: order.providerOrderId,
    providerPaymentId,
    signature,
  });
  return { status: "paid", orderId: order.orderId };
}

// ── Razorpay client flow (used when PAYMENT_PROVIDER=razorpay) ─────────────
type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

async function payWithRazorpay(
  order: CreateOrderResponse,
): Promise<CheckoutResult> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay unavailable");

  return new Promise<CheckoutResult>((resolve) => {
    const rzp = new window.Razorpay!({
      key: order.publicKey,
      order_id: order.providerOrderId,
      amount: order.amount,
      currency: order.currency,
      name: "ZORAEL & CO.",
      description: "Order payment",
      handler: async (response: RazorpaySuccess) => {
        try {
          await postJSON("/api/checkout/verify", {
            orderId: order.orderId,
            providerOrderId: response.razorpay_order_id,
            providerPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          resolve({ status: "paid", orderId: order.orderId });
        } catch (err) {
          resolve({
            status: "failed",
            error: err instanceof Error ? err.message : "Verification failed",
          });
        }
      },
      modal: {
        ondismiss: () =>
          resolve({ status: "failed", error: "Payment cancelled" }),
      },
    });
    rzp.open();
  });
}
