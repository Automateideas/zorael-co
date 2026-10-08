import { NextResponse } from "next/server";
import { getGateway } from "@/lib/payments";
import { getOrderStore } from "@/lib/orders/store";
import { decrementStock } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Provider webhook endpoint. Configure this URL in your gateway dashboard, e.g.
 *   https://your-domain.com/api/webhooks/payment
 * The gateway implementation verifies the signature before we trust anything.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const gateway = getGateway();

  const result = await gateway.handleWebhook(rawBody, request.headers);
  if (!result.received) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  if (result.orderId && result.status) {
    const store = getOrderStore();
    // Webhooks may reference either our order id or the provider's.
    const order =
      (await store.get(result.orderId)) ??
      (await store.findByProviderOrderId(result.orderId));
    if (order) {
      const previousStatus = order.status;
      const status =
        result.status === "paid"
          ? "paid"
          : result.status === "failed"
            ? "failed"
            : "pending";
      await store.update(order.id, {
        status,
        providerPaymentId: result.providerPaymentId ?? order.providerPaymentId,
      }, "webhook");

      // Decrement stock when an order transitions to "paid" for the first time.
      // COD orders already decremented at placement; online payments decrement here.
      if (
        status === "paid" &&
        previousStatus !== "paid" &&
        order.method !== "cod"
      ) {
        await decrementStock(
          order.cart.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            size: l.size,
            color: l.color,
          })),
        );
      }
    }
  }

  // Always 200 quickly so the provider does not retry a handled event.
  return NextResponse.json({ received: true });
}
