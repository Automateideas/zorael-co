import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";
import type { Category } from "@/lib/types";

/**
 * Row Level Security: every table has RLS enabled. The app reads/writes through
 * the server-side Drizzle connection (postgres role, bypasses RLS). The
 * policies below only govern direct access with the public Supabase key: the
 * catalog is world-readable, personal data is readable/writable by its owner
 * only, and everything else (coupons, events, subscribers…) is denied.
 */
const publicRead = (table: string) =>
  pgPolicy(`${table}_public_read`, {
    for: "select",
    to: [anonRole, authenticatedRole],
    using: sql`true`,
  });

const ownRows = (table: string) =>
  pgPolicy(`${table}_owner_all`, {
    for: "all",
    to: authenticatedRole,
    using: sql`user_id = (select auth.uid())`,
    withCheck: sql`user_id = (select auth.uid())`,
  });

const ts = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull().defaultNow();

/**
 * Catalog. The storefront reads products from here (via `src/lib/catalog.ts`),
 * falling back to the static `src/lib/products.ts` data when no database is
 * configured. Seed with `npm run db:seed`.
 */
export const products = pgTable(
  "products",
  {
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
    /** Unpublished products are hidden from the storefront. */
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: ts("created_at"),
    updatedAt: ts("updated_at"),
  },
  (t) => [index("products_category_idx").on(t.category), publicRead("products")],
).enableRLS();

/** Purchasable SKUs (size × colour), each with its own stock level. */
export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    size: text("size"),
    color: text("color"),
    stock: integer("stock").notNull().default(0),
  },
  (t) => [
    index("product_variants_product_idx").on(t.productId),
    publicRead("product_variants"),
  ],
).enableRLS();

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    heroImage: text("hero_image").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
  },
  () => [publicRead("collections")],
).enableRLS();

export const collectionProducts = pgTable(
  "collection_products",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.collectionId, t.productId] }),
    publicRead("collection_products"),
  ],
).enableRLS();

/**
 * One row per signed-in user. `id` is the Supabase `auth.users.id`.
 * `role` drives admin access (enforced server-side in Phase 6).
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    fullName: text("full_name"),
    email: text("email"),
    phone: text("phone"),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    role: text("role")
      .$type<"customer" | "staff" | "admin">()
      .notNull()
      .default("customer"),
    createdAt: ts("created_at"),
    updatedAt: ts("updated_at"),
  },
  () => [
    pgPolicy("profiles_owner_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`id = (select auth.uid())`,
    }),
  ],
).enableRLS();

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    label: text("label"),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("IN"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: ts("created_at"),
  },
  (t) => [index("addresses_user_idx").on(t.userId), ownRows("addresses")],
).enableRLS();

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    userId: uuid("user_id").notNull(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: ts("created_at"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.productId] }),
    ownRows("wishlist_items"),
  ],
).enableRLS();

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source"),
  createdAt: ts("created_at"),
}).enableRLS();

export const coupons = pgTable("coupons", {
  code: text("code").primaryKey(),
  type: text("type").$type<"percent" | "fixed">().notNull(),
  /** Percent (1–100) or fixed amount in major units. */
  value: integer("value").notNull(),
  minSubtotal: integer("min_subtotal").notNull().default(0),
  maxRedemptions: integer("max_redemptions"),
  redeemed: integer("redeemed").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
}).enableRLS();

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    isApproved: boolean("is_approved").notNull().default(false),
    createdAt: ts("created_at"),
  },
  (t) => [
    index("reviews_product_idx").on(t.productId),
    pgPolicy("reviews_public_read", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`is_approved`,
    }),
  ],
).enableRLS();

export type OrderStatusDb =
  | "created"
  | "pending"
  | "paid"
  | "failed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    /** Supabase auth user; null for guest checkout. */
    userId: uuid("user_id"),
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
    couponCode: text("coupon_code"),
    discount: integer("discount").notNull().default(0),
    trackingCarrier: text("tracking_carrier"),
    trackingNumber: text("tracking_number"),
    createdAt: ts("created_at"),
    updatedAt: ts("updated_at"),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_provider_order_idx").on(t.providerOrderId),
    pgPolicy("orders_owner_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`user_id = (select auth.uid())`,
    }),
  ],
).enableRLS();

export const orderItems = pgTable(
  "order_items",
  {
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
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
).enableRLS();

/** Append-only history of status changes, payments and admin actions. */
export const orderEvents = pgTable(
  "order_events",
  {
    id: serial("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    actor: text("actor"),
    createdAt: ts("created_at"),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
).enableRLS();

export type ProductRow = typeof products.$inferSelect;
export type VariantRow = typeof productVariants.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
