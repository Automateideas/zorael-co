import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Category } from "@/lib/types";

/**
 * Catalog. The storefront currently reads products from `src/lib/products.ts`
 * (its source of truth); this table lets you move the catalog into the database
 * when you're ready. Seed it from the code catalog with `npm run db:seed`.
 */
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").$type<Category>().notNull(),
  subcategory: text("subcategory"),
  collection: text("collection"),
  price: integer("price").notNull(), // major units (₹)
  currency: text("currency").notNull().default("INR"),
  description: text("description").notNull().default(""),
  rating: real("rating"),
  reviews: integer("reviews"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>(),
  colors: jsonb("colors").$type<string[]>(),
  materials: jsonb("materials").$type<string[]>(),
  details: jsonb("details").$type<string[]>(),
  care: jsonb("care").$type<string[]>(),
  shipping: jsonb("shipping").$type<string[]>(),
  isNew: boolean("is_new").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OrderStatusDb = "created" | "pending" | "paid" | "failed";

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  status: text("status").$type<OrderStatusDb>().notNull().default("created"),
  method: text("method").notNull(),
  provider: text("provider"),
  providerOrderId: text("provider_order_id"),
  providerPaymentId: text("provider_payment_id"),
  customer: jsonb("customer")
    .$type<{ name: string; email?: string; phone?: string }>()
    .notNull(),
  address: jsonb("address").$type<Record<string, string>>(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  currency: text("currency").notNull().default("INR"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size"),
  color: text("color"),
  lineTotal: integer("line_total").notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
