/**
 * Server-side catalog access. Reads from Postgres when DATABASE_URL is set and
 * falls back to the static data in `products.ts` otherwise (or if the database
 * is unreachable), so the storefront never goes blank.
 *
 * Server-only: never import this from a Client Component — fetch
 * `/api/products` instead.
 */
import { cache } from "react";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { products as productsTable, type ProductRow } from "@/db/schema";
import * as staticCatalog from "./products";
import type { Product } from "./types";

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Product["category"],
    subcategory: row.subcategory ?? undefined,
    collection: row.collection ?? undefined,
    price: row.price,
    currency: row.currency,
    images: row.images,
    description: row.description,
    rating: row.rating ?? undefined,
    reviews: row.reviews ?? undefined,
    sizes: row.sizes ?? undefined,
    colors: row.colors ?? undefined,
    materials: row.materials ?? undefined,
    details: row.details ?? undefined,
    care: row.care ?? undefined,
    shipping: row.shipping ?? undefined,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
  };
}

/** Runs a DB query, or the static fallback when there is no (working) DB. */
async function withFallback<T>(
  query: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (!hasDatabase()) return fallback();
  try {
    return await query();
  } catch (err) {
    console.error("[catalog] database read failed, using static data:", err);
    return fallback();
  }
}

const published = eq(productsTable.isPublished, true);

export const getAllProducts = cache(async (): Promise<Product[]> =>
  withFallback(
    async () => {
      const rows = await getDb()
        .select()
        .from(productsTable)
        .where(published)
        .orderBy(asc(productsTable.createdAt), asc(productsTable.id));
      return rows.map(toProduct);
    },
    () => staticCatalog.products,
  ),
);

export const getProduct = cache(
  async (slug: string): Promise<Product | undefined> =>
    withFallback(
      async () => {
        const [row] = await getDb()
          .select()
          .from(productsTable)
          .where(and(published, eq(productsTable.slug, slug)))
          .limit(1);
        return row ? toProduct(row) : undefined;
      },
      () => staticCatalog.getProduct(slug),
    ),
);

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return withFallback(
    async () => {
      const rows = await getDb()
        .select()
        .from(productsTable)
        .where(and(published, inArray(productsTable.id, ids)));
      return rows.map(toProduct);
    },
    () => staticCatalog.products.filter((p) => ids.includes(p.id)),
  );
}

export async function getProductsByCategory(
  category: Product["category"],
): Promise<Product[]> {
  return withFallback(
    async () => {
      const rows = await getDb()
        .select()
        .from(productsTable)
        .where(and(published, eq(productsTable.category, category)))
        .orderBy(asc(productsTable.createdAt), asc(productsTable.id));
      return rows.map(toProduct);
    },
    () => staticCatalog.getProductsByCategory(category),
  );
}

export async function getProductsBySubcategory(
  category: Product["category"],
  subcategory: string,
): Promise<Product[]> {
  if (subcategory === "All") return getProductsByCategory(category);
  return withFallback(
    async () => {
      const rows = await getDb()
        .select()
        .from(productsTable)
        .where(
          and(
            published,
            eq(productsTable.category, category),
            eq(productsTable.subcategory, subcategory),
          ),
        )
        .orderBy(asc(productsTable.createdAt), asc(productsTable.id));
      return rows.map(toProduct);
    },
    () => staticCatalog.getProductsBySubcategory(category, subcategory),
  );
}

export async function getNewArrivals(limit?: number): Promise<Product[]> {
  return withFallback(
    async () => {
      const q = getDb()
        .select()
        .from(productsTable)
        .where(and(published, eq(productsTable.isNew, true)))
        .orderBy(desc(productsTable.createdAt), asc(productsTable.id));
      const rows = limit ? await q.limit(limit) : await q;
      return rows.map(toProduct);
    },
    () => staticCatalog.getNewArrivals(limit),
  );
}

export async function getBestSellers(limit?: number): Promise<Product[]> {
  return withFallback(
    async () => {
      const q = getDb()
        .select()
        .from(productsTable)
        .where(and(published, eq(productsTable.isBestSeller, true)))
        .orderBy(asc(productsTable.createdAt), asc(productsTable.id));
      const rows = limit ? await q.limit(limit) : await q;
      return rows.map(toProduct);
    },
    () => staticCatalog.getBestSellers(limit),
  );
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const sameCategory = await getProductsByCategory(product.category);
  return sameCategory.filter((p) => p.id !== product.id).slice(0, limit);
}

/** Escape LIKE wildcards so user input is matched literally. */
const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  return withFallback(
    async () => {
      const term = likeTerm(q);
      const rows = await getDb()
        .select()
        .from(productsTable)
        .where(
          and(
            published,
            or(
              ilike(productsTable.name, term),
              ilike(productsTable.subcategory, term),
              ilike(productsTable.category, term),
              ilike(productsTable.description, term),
            ),
          ),
        )
        .limit(60);
      return rows.map(toProduct);
    },
    () => staticCatalog.searchProducts(q),
  );
}
