"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { getSession } from "@/lib/auth";

export type MyOrderItem = {
  id: number;
  name: string;
  slug: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  size: string | null;
  color: string | null;
};

export type MyOrder = {
  id: string;
  status: string;
  method: string;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string | null;
  total: number;
  currency: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  items: MyOrderItem[];
};

/**
 * Orders belonging to the signed-in customer, newest first.
 *
 * Scoped by the session's user id — never by anything the client supplies —
 * so one customer can never read another's history.
 */
export async function getMyOrders(): Promise<MyOrder[]> {
  const session = await getSession();
  if (!session || !hasDatabase()) return [];

  const db = getDb();

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.userId))
    .orderBy(desc(orders.createdAt));

  if (rows.length === 0) return [];

  // One query for every line, rather than one per order.
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id),
      ),
    );

  const byOrder = new Map<string, MyOrderItem[]>();
  for (const item of items) {
    const list = byOrder.get(item.orderId) ?? [];
    list.push({
      id: item.id,
      name: item.name,
      slug: item.slug,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      size: item.size,
      color: item.color,
    });
    byOrder.set(item.orderId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    method: row.method,
    subtotal: row.subtotal,
    shipping: row.shipping,
    discount: row.discount,
    couponCode: row.couponCode,
    total: row.total,
    currency: row.currency,
    trackingCarrier: row.trackingCarrier,
    trackingNumber: row.trackingNumber,
    createdAt: row.createdAt,
    items: byOrder.get(row.id) ?? [],
  }));
}
