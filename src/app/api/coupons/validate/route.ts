import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";
import { priceCart, type CartLineInput } from "@/lib/pricing";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Previews a coupon for the checkout UI. The authoritative discount is still
 * recomputed when the order is created — this only drives the summary.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    code?: string;
    items?: CartLineInput[];
    phone?: string;
  };

  const items = Array.isArray(body.items) ? body.items : [];
  if (!body.code || items.length === 0) {
    return NextResponse.json(
      { ok: false, reason: "Add items to your bag first." },
      { status: 400 },
    );
  }

  // Price from the trusted catalog, never from client-supplied amounts.
  const cart = await priceCart(items);
  const session = await getSession();

  const result = await validateCoupon(body.code, cart.subtotal, {
    userId: session?.userId,
    phone: body.phone?.trim() || undefined,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  return NextResponse.json({
    ok: true,
    code: result.code,
    discount: result.discount,
    label: result.label,
    total: Math.max(0, cart.subtotal + cart.shipping - result.discount),
  });
}
