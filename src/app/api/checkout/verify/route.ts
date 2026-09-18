import { NextResponse } from "next/server";
import { getGateway } from "@/lib/payments";
import { getOrderStore } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  orderId?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  signature?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { orderId, providerOrderId, providerPaymentId, signature } = body;
  if (!orderId || !providerOrderId || !providerPaymentId) {
    return NextResponse.json(
      { error: "Missing payment verification fields" },
      { status: 400 },
    );
  }

  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Guard against tampering: the provider order id must match ours.
  if (order.providerOrderId && order.providerOrderId !== providerOrderId) {
    return NextResponse.json(
      { error: "Order/payment mismatch" },
      { status: 400 },
    );
  }

  const gateway = getGateway();
  const result = await gateway.verifyPayment({
    orderId,
    providerOrderId,
    providerPaymentId,
    signature,
  });

  const updated = await store.update(orderId, {
    status: result.verified ? "paid" : "failed",
    providerPaymentId,
  });

  if (!result.verified) {
    return NextResponse.json(
      { verified: false, reason: result.reason ?? "verification_failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    verified: true,
    order: {
      id: updated?.id,
      status: updated?.status,
      total: updated?.cart.total,
      currency: updated?.cart.currency,
    },
  });
}
