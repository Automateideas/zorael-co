import { randomUUID } from "node:crypto";
import type { PricedCart } from "../pricing";
import type { OrderStatusDb } from "@/db/schema";
import { DrizzleOrderStore } from "./drizzle-store";

export type OrderStatus = OrderStatusDb;

export type Order = {
  id: string;
  /** Supabase auth user id; undefined for guest orders. */
  userId?: string;
  status: OrderStatus;
  cart: PricedCart;
  method: string;
  customer: { name: string; email?: string; phone?: string };
  address?: Record<string, string>;
  providerOrderId?: string;
  providerPaymentId?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * OrderStore contract. The default implementation keeps orders in memory, which
 * is enough to run the full flow locally. Swap `getOrderStore()` for a
 * database-backed implementation (Prisma, Drizzle, Mongo, …) without touching
 * the API routes — they only depend on this interface.
 */
export interface OrderStore {
  create(input: Omit<Order, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: OrderStatus;
  }): Promise<Order>;
  get(id: string): Promise<Order | null>;
  findByProviderOrderId(providerOrderId: string): Promise<Order | null>;
  /** `actor` is recorded in the order event log (e.g. "webhook", "admin:<id>"). */
  update(
    id: string,
    patch: Partial<Order>,
    actor?: string,
  ): Promise<Order | null>;
}

class InMemoryOrderStore implements OrderStore {
  private orders = new Map<string, Order>();

  async create(input: Parameters<OrderStore["create"]>[0]): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = {
      id: `zc_${randomUUID().slice(0, 12)}`,
      userId: input.userId,
      status: input.status ?? "created",
      cart: input.cart,
      method: input.method,
      customer: input.customer,
      address: input.address,
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      provider: input.provider,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    return order;
  }

  async get(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findByProviderOrderId(providerOrderId: string): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (order.providerOrderId === providerOrderId) return order;
    }
    return null;
  }

  async update(id: string, patch: Partial<Order>): Promise<Order | null> {
    const existing = this.orders.get(id);
    if (!existing) return null;
    const updated: Order = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, updated);
    return updated;
  }
}

/**
 * Persist a single instance across dev hot-reloads by stashing it on
 * globalThis (Next.js recreates modules on reload).
 */
const globalForStore = globalThis as unknown as {
  __zoraelOrderStore?: OrderStore;
};

/**
 * Returns the Postgres/Drizzle store when DATABASE_URL is configured, otherwise
 * an in-memory store so local development and the mock gateway work with zero
 * setup. The two are interchangeable — they implement the same interface.
 */
export function getOrderStore(): OrderStore {
  if (!globalForStore.__zoraelOrderStore) {
    globalForStore.__zoraelOrderStore = process.env.DATABASE_URL
      ? new DrizzleOrderStore()
      : new InMemoryOrderStore();
  }
  return globalForStore.__zoraelOrderStore;
}
