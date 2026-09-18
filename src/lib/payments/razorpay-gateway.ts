import { createHmac } from "node:crypto";
import { paymentConfig } from "./config";
import { safeEqual } from "./http-gateway";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PaymentGateway,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from "./types";

/**
 * RazorpayGateway — a ready-to-enable concrete example (INR / UPI / cards),
 * which matches the payment methods in the designs (UPI · Card · Net Banking).
 *
 * Enable by setting in the environment:
 *   PAYMENT_PROVIDER=razorpay
 *   RAZORPAY_KEY_ID=rzp_live_xxx        (or rzp_test_xxx)
 *   RAZORPAY_KEY_SECRET=xxxxxxxx
 *   RAZORPAY_WEBHOOK_SECRET=xxxxxxxx    (from the Razorpay dashboard)
 *
 * No application code changes are required — the factory picks this up.
 * Uses only the built-in fetch + node:crypto; no SDK dependency on the server.
 */
export class RazorpayGateway implements PaymentGateway {
  readonly name = "razorpay";
  private cfg = paymentConfig.razorpay;

  constructor() {
    if (!this.cfg.keyId || !this.cfg.keySecret) {
      throw new Error(
        "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Configure them or use PAYMENT_PROVIDER=mock.",
      );
    }
  }

  private authHeader(): string {
    const token = Buffer.from(
      `${this.cfg.keyId}:${this.cfg.keySecret}`,
    ).toString("base64");
    return `Basic ${token}`;
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const res = await fetch(`${this.cfg.apiBase}/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: this.authHeader(),
      },
      body: JSON.stringify({
        amount: input.amount.amount, // already in paise
        currency: input.amount.currency,
        receipt: input.orderId,
        notes: input.notes,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Razorpay create order failed: ${res.status}`);
    }
    const data = (await res.json()) as { id: string };
    return {
      providerOrderId: data.id,
      amount: input.amount,
      publicKey: this.cfg.keyId,
      provider: this.name,
    };
  }

  async verifyPayment(
    input: VerifyPaymentInput,
  ): Promise<VerifyPaymentResult> {
    // Razorpay signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const expected = createHmac("sha256", this.cfg.keySecret)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest("hex");
    const verified = safeEqual(expected, input.signature ?? "");
    return {
      verified,
      providerPaymentId: input.providerPaymentId,
      reason: verified ? undefined : "signature_mismatch",
    };
  }

  async handleWebhook(rawBody: string, headers: Headers): Promise<WebhookResult> {
    const signature = headers.get("x-razorpay-signature") ?? "";
    const expected = createHmac("sha256", this.cfg.webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (!this.cfg.webhookSecret || !safeEqual(expected, signature)) {
      return { received: false };
    }
    try {
      const body = JSON.parse(rawBody) as {
        event?: string;
        payload?: {
          payment?: {
            entity?: { id?: string; order_id?: string; status?: string };
          };
        };
      };
      const payment = body.payload?.payment?.entity;
      const status =
        body.event === "payment.captured"
          ? "paid"
          : body.event === "payment.failed"
            ? "failed"
            : "pending";
      return {
        received: true,
        event: body.event,
        orderId: payment?.order_id,
        providerPaymentId: payment?.id,
        status,
      };
    } catch {
      return { received: false };
    }
  }
}
