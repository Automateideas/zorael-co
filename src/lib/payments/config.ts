/**
 * Payment configuration — read once from the environment.
 * Everything here is server-only. Never import this into a Client Component.
 */

export type ProviderName = "mock" | "http" | "razorpay" | "stripe";

export const paymentConfig = {
  /** Which gateway to use. Defaults to the safe local "mock". */
  provider: (process.env.PAYMENT_PROVIDER ?? "mock") as ProviderName,

  /**
   * Generic HTTP provider — point this at ANY REST payment service that
   * follows the small contract in `http-gateway.ts`. This is the "just
   * replace the URL" path.
   */
  http: {
    baseUrl: process.env.PAYMENT_API_URL ?? "",
    apiKey: process.env.PAYMENT_API_KEY ?? "",
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET ?? "",
  },

  /** Razorpay (INR / UPI / cards) — a ready-to-enable concrete example. */
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
    apiBase: "https://api.razorpay.com/v1",
  },

  /** Stripe placeholder (kept minimal — extend when needed). */
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  },

  /** Store settings used for server-side pricing. */
  store: {
    currency: "INR",
    /** Flat shipping fee (in major units) below the free-shipping threshold. */
    shippingFee: 500,
    freeShippingThreshold: 15000,
  },
} as const;
