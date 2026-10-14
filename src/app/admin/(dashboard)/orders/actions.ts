"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, orderItems, orderEvents } from "@/db/schema";
import type { OrderStatusDb } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

export async function getAllOrdersAdmin() {
  await requireAdmin();
  const db = getDb();

  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const itemCounts = await db
    .select({
      orderId: orderItems.orderId,
      count: sql<number>`COUNT(*)`,
    })
    .from(orderItems)
    .groupBy(orderItems.orderId);

  const countMap = new Map(itemCounts.map((r) => [r.orderId, Number(r.count)]));

  return rows.map((r) => ({
    ...r,
    itemCount: countMap.get(r.id) ?? 0,
  }));
}

export async function getOrderDetail(orderId: string) {
  await requireAdmin();
  const db = getDb();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const events = await db
    .select()
    .from(orderEvents)
    .where(eq(orderEvents.orderId, orderId))
    .orderBy(desc(orderEvents.createdAt));

  return { order, items, events };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatusDb,
  note?: string,
) {
  await requireAdmin();
  const db = getDb();

  const [current] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!current) throw new Error("Order not found");

  await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await db.insert(orderEvents).values({
    orderId,
    type: "status_change",
    detail: {
      from: current.status,
      to: newStatus,
      ...(note ? { note } : {}),
    },
    actor: "admin",
  });
}

export async function updateTracking(
  orderId: string,
  carrier: string,
  trackingNumber: string,
) {
  await requireAdmin();
  const db = getDb();

  await db
    .update(orders)
    .set({
      trackingCarrier: carrier || null,
      trackingNumber: trackingNumber || null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  if (trackingNumber) {
    await db.insert(orderEvents).values({
      orderId,
      type: "tracking_added",
      detail: { carrier, trackingNumber },
      actor: "admin",
    });
  }
}

export async function getOrderStats() {
  await requireAdmin();
  const db = getDb();

  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .groupBy(orders.status);

  const totalOrders = rows.reduce((s, r) => s + Number(r.count), 0);
  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
  const pending = rows.find((r) => r.status === "pending")?.count ?? 0;
  const confirmed = rows.find((r) => r.status === "confirmed")?.count ?? 0;
  const packed = rows.find((r) => r.status === "packed")?.count ?? 0;
  const shipped = rows.find((r) => r.status === "shipped")?.count ?? 0;

  return {
    totalOrders,
    totalRevenue,
    actionRequired: Number(pending) + Number(confirmed) + Number(packed),
    shipped: Number(shipped),
  };
}
