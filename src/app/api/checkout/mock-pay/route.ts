import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { paymentConfig } from "@/lib/payments";
import { MockGateway } from "@/lib/payments/mock-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * MOCK ONLY — stands in for the provider's client SDK callback. Given the
 * provider order id, it returns a payment id + valid signature, exactly as a
 * real gateway hands to the browser after the customer pays. Disabled unless
 * PAYMENT_PROVIDER=mock, so it can never be abused against a real provider.
 */
export async function POST(request: Request) {
  if (paymentConfig.provider !== "mock") {
    return NextResponse.json(
      { error: "Mock payment is only available with PAYMENT_PROVIDER=mock" },
      { status: 403 },
    );
  }

  let body: { providerOrderId?: string };
  try {
    body = (await request.json()) as { providerOrderId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const providerOrderId = body.providerOrderId;
  if (!providerOrderId) {
    return NextResponse.json(
      { error: "Missing providerOrderId" },
      { status: 400 },
    );
  }

  const providerPaymentId = `mock_pay_${randomUUID().slice(0, 12)}`;
  const signature = MockGateway.mockPaymentSignature(
    providerOrderId,
    providerPaymentId,
  );

  return NextResponse.json({ providerPaymentId, signature });
}
