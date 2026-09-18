import { paymentConfig } from "./config";
import { MockGateway } from "./mock-gateway";
import { GenericHttpGateway } from "./http-gateway";
import { RazorpayGateway } from "./razorpay-gateway";
import type { PaymentGateway } from "./types";

let cached: PaymentGateway | null = null;

/**
 * Returns the configured payment gateway (singleton). Switch providers with the
 * PAYMENT_PROVIDER env var — no application code changes required.
 */
export function getGateway(): PaymentGateway {
  if (cached) return cached;

  switch (paymentConfig.provider) {
    case "razorpay":
      cached = new RazorpayGateway();
      break;
    case "http":
      cached = new GenericHttpGateway();
      break;
    case "stripe":
      throw new Error(
        "Stripe provider is scaffolded in config but not implemented yet. " +
          "Add a StripeGateway following the PaymentGateway interface, or use PAYMENT_PROVIDER=mock/razorpay/http.",
      );
    case "mock":
    default:
      cached = new MockGateway();
      break;
  }
  return cached;
}

export { paymentConfig } from "./config";
export type * from "./types";
