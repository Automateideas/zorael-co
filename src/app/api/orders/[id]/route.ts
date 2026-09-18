import { NextResponse } from "next/server";
import { getOrderStore } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrderStore().get(id);
  if (!order) {
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
