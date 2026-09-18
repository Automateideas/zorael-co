import { createHmac, timingSafeEqual } from "node:crypto";
import { paymentConfig } from "./config";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentGateway,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from "./types";

/**
 * GenericHttpGateway — the "just replace the URL" provider.
 *
 * Point PAYMENT_API_URL at any REST payment service that speaks this small
 * contract, set PAYMENT_API_KEY, and set PAYMENT_PROVIDER=http. No code change.
 *
 * Expected endpoints (relative to PAYMENT_API_URL):
 *   POST /orders   { orderId, amount, currency, method, customer, notes }
 *                  → { providerOrderId, publicKey?, redirectUrl? }
 *   POST /verify   { orderId, providerOrderId, providerPaymentId, signature }
 *                  → { verified: boolean, reason? }
 *   Webhook: HMAC-SHA256 of the raw body in the `x-signature` header,
 *            signed with PAYMENT_WEBHOOK_SECRET.
 */
export class GenericHttpGateway implements PaymentGateway {
  readonly name = "http";
  private base: string;
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    const cfg = paymentConfig.http;
    if (!cfg.baseUrl) {
      throw new Error(
        "PAYMENT_API_URL is not set. Set it (and PAYMENT_API_KEY) or use PAYMENT_PROVIDER=mock.",
      );
    }
    this.base = cfg.baseUrl.replace(/\/$/, "");
    this.apiKey = cfg.apiKey;
    this.webhookSecret = cfg.webhookSecret;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Payment provider ${path} failed: ${res.status}`);
    }
    return (await res.json()) as T;
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const data = await this.post<{
      providerOrderId: string;
      publicKey?: string;
      redirectUrl?: string;
    }>("/orders", {
      orderId: input.orderId,
      amount: input.amount.amount,
      currency: input.amount.currency,
      method: input.method,
      customer: input.customer,
      notes: input.notes,
    });
    return {
      providerOrderId: data.providerOrderId,
      amount: input.amount,
      publicKey: data.publicKey,
      redirectUrl: data.redirectUrl,
      provider: this.name,
    };
  }

  async verifyPayment(
    input: VerifyPaymentInput,
  ): Promise<VerifyPaymentResult> {
    const data = await this.post<{ verified: boolean; reason?: string }>(
      "/verify",
      input,
    );
    return {
      verified: Boolean(data.verified),
      providerPaymentId: input.providerPaymentId,
      reason: data.reason,
    };
  }

  async handleWebhook(rawBody: string, headers: Headers): Promise<WebhookResult> {
    const signature = headers.get("x-signature") ?? "";
    if (this.webhookSecret) {
      const expected = createHmac("sha256", this.webhookSecret)
        .update(rawBody)
        .digest("hex");
      if (!safeEqual(expected, signature)) {
        return { received: false };
      }
    }
    try {
      const body = JSON.parse(rawBody) as {
        event?: string;
        orderId?: string;
        providerPaymentId?: string;
        status?: "paid" | "failed" | "pending";
      };
      return {
        received: true,
        event: body.event,
        orderId: body.orderId,
        providerPaymentId: body.providerPaymentId,
        status: body.status,
      };
    } catch {
      return { received: false };
    }
  }
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
