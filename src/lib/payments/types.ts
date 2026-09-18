/**
 * ZORAEL & CO. — payment gateway contract
 * ---------------------------------------
 * Every provider (mock, generic HTTP, Razorpay, Stripe, …) implements this one
 * interface. The rest of the app only ever talks to `PaymentGateway`, so
 * switching providers is a config change — set PAYMENT_PROVIDER (and the
 * relevant URL / keys) in the environment; no application code changes.
 */

/** Money is always stored in the smallest currency unit (paise for INR). */
export type Money = {
  /** Integer amount in the smallest unit, e.g. 1250000 = ₹12,500.00. */
  amount: number;
  currency: string; // ISO 4217, e.g. "INR"
};

export type CreateOrderInput = {
  /** Our internal order id — passed to the provider as a reference. */
  orderId: string;
  amount: Money;
  /** Chosen method hint: upi | card | netbanking | cod. */
  method: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  /** Arbitrary metadata echoed back by the provider where supported. */
  notes?: Record<string, string>;
};

export type CreateOrderResult = {
  /** The provider's own order/intent id (what the client SDK needs). */
  providerOrderId: string;
  amount: Money;
  /** Non-secret public key the browser SDK needs (e.g. Razorpay key_id). */
  publicKey?: string;
  /** Provider name, so the client knows which SDK/flow to run. */
  provider: string;
  /** Optional hosted-checkout URL for redirect-style providers. */
  redirectUrl?: string;
};

export type VerifyPaymentInput = {
  orderId: string;
  providerOrderId: string;
  /** The payment id returned by the provider after the customer pays. */
  providerPaymentId: string;
  /** Signature / token used to prove the callback is authentic. */
  signature?: string;
};

export type VerifyPaymentResult = {
  verified: boolean;
  providerPaymentId: string;
  reason?: string;
};

export type WebhookResult = {
  received: boolean;
  event?: string;
  orderId?: string;
  providerPaymentId?: string;
  status?: "paid" | "failed" | "pending";
};

export interface PaymentGateway {
  readonly name: string;
  /** Create a payment order with the provider. */
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  /** Verify a completed payment (signature / status check). */
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  /** Parse & verify an incoming provider webhook. */
  handleWebhook(rawBody: string, headers: Headers): Promise<WebhookResult>;
}
