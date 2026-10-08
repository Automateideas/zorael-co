import { NextResponse } from "next/server";
import { getGateway } from "@/lib/payments";
import { priceCart, type CartLineInput } from "@/lib/pricing";
import { getOrderStore } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  items?: CartLineInput[];
  method?: string;
  customer?: { name?: string; email?: string; phone?: string };
  address?: Record<string, string>;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const method = body.method ?? "upi";
  const customer = {
    name: body.customer?.name?.trim() || "Guest",
    email: body.customer?.email?.trim() || undefined,
    phone: body.customer?.phone?.trim() || undefined,
  };

  // Trusted, server-side pricing.
  const cart = await priceCart(items);
  if (cart.lines.length === 0 || cart.total <= 0) {
    return NextResponse.json(
      { error: "No valid items in cart" },
      { status: 400 },
    );
  }

  const store = getOrderStore();

  // Cash on delivery: no gateway call — order goes straight to pending.
  if (method === "cod") {
    const order = await store.create({
      cart,
      method,
      customer,
      address: body.address,
      provider: "cod",
      status: "pending",
    });
    return NextResponse.json({
      orderId: order.id,
      cod: true,
      amount: cart.totalMinor,
      currency: cart.currency,
      cart: { subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total },
    });
  }

  // Create the order record first so we can reference it with the gateway.
  const order = await store.create({
    cart,
    method,
    customer,
    address: body.address,
    status: "created",
  });

  try {
    const gateway = getGateway();
    const result = await gateway.createOrder({
      orderId: order.id,
      amount: { amount: cart.totalMinor, currency: cart.currency },
      method,
      customer,
      notes: { orderId: order.id },
    });

    await store.update(order.id, {
      providerOrderId: result.providerOrderId,
      provider: result.provider,
    });

    return NextResponse.json({
      orderId: order.id,
      providerOrderId: result.providerOrderId,
      provider: result.provider,
      publicKey: result.publicKey,
      redirectUrl: result.redirectUrl,
      amount: cart.totalMinor,
      currency: cart.currency,
      cart: { subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total },
    });
  } catch (err) {
    await store.update(order.id, { status: "failed" });
    const message =
      err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
