import { createHmac, randomUUID } from "node:crypto";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentGateway,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from "./types";

/**
 * MockGateway — the default provider.
 *
 * Simulates a real gateway end-to-end with zero external services and no real
 * money: it mints a provider order id, and "verifies" a payment by recomputing
 * the same HMAC signature the client is given. This lets the entire checkout
 * flow work locally and in CI. Swap PAYMENT_PROVIDER to a real provider when
 * you're ready — the app code does not change.
 */
const MOCK_SECRET = "zorael_mock_secret";

function sign(...parts: string[]): string {
  return createHmac("sha256", MOCK_SECRET).update(parts.join("|")).digest("hex");
}

export class MockGateway implements PaymentGateway {
  readonly name = "mock";

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const providerOrderId = `mock_order_${randomUUID().slice(0, 12)}`;
    return {
      providerOrderId,
      amount: input.amount,
      publicKey: "mock_public_key",
      provider: this.name,
    };
  }

  async verifyPayment(
    input: VerifyPaymentInput,
  ): Promise<VerifyPaymentResult> {
    const expected = sign(input.providerOrderId, input.providerPaymentId);
    const verified = expected === input.signature;
    return {
      verified,
      providerPaymentId: input.providerPaymentId,
      reason: verified ? undefined : "signature_mismatch",
    };
  }

  async handleWebhook(rawBody: string): Promise<WebhookResult> {
    try {
      const body = JSON.parse(rawBody) as {
        orderId?: string;
        providerPaymentId?: string;
        status?: "paid" | "failed" | "pending";
      };
      return {
        received: true,
        event: "mock.payment",
        orderId: body.orderId,
        providerPaymentId: body.providerPaymentId,
        status: body.status ?? "paid",
      };
    } catch {
      return { received: false };
    }
  }

  /** Helper the client uses to simulate a successful payment (mock only). */
  static mockPaymentSignature(
    providerOrderId: string,
    providerPaymentId: string,
  ): string {
    return sign(providerOrderId, providerPaymentId);
  }
}
