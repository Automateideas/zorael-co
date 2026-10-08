import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, orderItems, type OrderRow, type OrderItemRow } from "@/db/schema";
import type { PricedCart } from "../pricing";
import type { Order, OrderStore } from "./store";

function toOrder(row: OrderRow, items: OrderItemRow[]): Order {
  const cart: PricedCart = {
    lines: items.map((it) => ({
      productId: it.productId,
      slug: it.slug,
      name: it.name,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      size: it.size ?? undefined,
      color: it.color ?? undefined,
      lineTotal: it.lineTotal,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    currency: row.currency,
    totalMinor: Math.round(row.total * 100),
  };
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    status: row.status,
    cart,
    method: row.method,
    customer: row.customer,
    address: row.address ?? undefined,
    providerOrderId: row.providerOrderId ?? undefined,
    providerPaymentId: row.providerPaymentId ?? undefined,
    provider: row.provider ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Postgres-backed order store (Drizzle). Implements the same OrderStore
 * interface as the in-memory version, so the API routes never change.
 */
export class DrizzleOrderStore implements OrderStore {
  async create(
    input: Parameters<OrderStore["create"]>[0],
  ): Promise<Order> {
    const db = getDb();
    const id = `zc_${randomUUID().slice(0, 12)}`;
    const { cart } = input;

    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id,
        userId: input.userId,
        status: input.status ?? "created",
        method: input.method,
        provider: input.provider,
        providerOrderId: input.providerOrderId,
        providerPaymentId: input.providerPaymentId,
        customer: input.customer,
        address: input.address,
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        total: cart.total,
        currency: cart.currency,
      });
      if (cart.lines.length > 0) {
        await tx.insert(orderItems).values(
          cart.lines.map((l) => ({
            orderId: id,
            productId: l.productId,
            slug: l.slug,
            name: l.name,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            size: l.size,
            color: l.color,
            lineTotal: l.lineTotal,
          })),
        );
      }
    });

    const created = await this.get(id);
    if (!created) throw new Error("Failed to create order");
    return created;
  }

  async get(id: string): Promise<Order | null> {
    const db = getDb();
    const row = await db.query.orders.findFirst({ where: eq(orders.id, id) });
    if (!row) return null;
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    return toOrder(row, items);
  }

  async findByProviderOrderId(
    providerOrderId: string,
  ): Promise<Order | null> {
    const db = getDb();
    const row = await db.query.orders.findFirst({
      where: eq(orders.providerOrderId, providerOrderId),
    });
    if (!row) return null;
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, row.id));
    return toOrder(row, items);
  }

  async update(id: string, patch: Partial<Order>): Promise<Order | null> {
    const db = getDb();
    const set: Partial<typeof orders.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (patch.status !== undefined) set.status = patch.status;
    if (patch.provider !== undefined) set.provider = patch.provider;
    if (patch.providerOrderId !== undefined)
      set.providerOrderId = patch.providerOrderId;
    if (patch.providerPaymentId !== undefined)
      set.providerPaymentId = patch.providerPaymentId;

    await db.update(orders).set(set).where(eq(orders.id, id));
    return this.get(id);
  }
}
