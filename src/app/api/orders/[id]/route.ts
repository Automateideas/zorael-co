import { NextResponse } from "next/server";
import { getOrderStore } from "@/lib/orders/store";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Order ids are only ~44 bits of randomness and were accepted here with no
  // session at all, so anyone holding or guessing one could read a customer's
  // items and totals. Identity comes from the cookie, never from the URL.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const order = await getOrderStore().get(id);
  // Same 404 either way, so this cannot be used to probe which ids exist.
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Return a safe view (no internal provider secrets).
  return NextResponse.json({
    id: order.id,
    status: order.status,
    method: order.method,
    provider: order.provider,
    total: order.cart.total,
    currency: order.cart.currency,
    lines: order.cart.lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      lineTotal: l.lineTotal,
    })),
    createdAt: order.createdAt,
  });
}
