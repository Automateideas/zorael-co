/**
 * Server-side catalog access. Reads from Postgres when DATABASE_URL is set and
 * falls back to the static data in `products.ts` / `collections.ts` otherwise
 * (or if the database is unreachable), so the storefront never goes blank.
 *
 * DB reads go through the Next data cache (tag: CATALOG_TAG, 5 min). After any
 * admin edit call `revalidateTag(CATALOG_TAG)`.
 *
 * Server-only: never import this from a Client Component — fetch
 * `/api/products` instead.
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import {
  categories as categoriesTable,
  collectionProducts,
  collections as collectionsTable,
  products as productsTable,
  type CategoryRow,
  type ProductRow,
} from "@/db/schema";
import * as staticCollections from "./collections";
import * as staticCatalog from "./products";
import type { Collection, Product } from "./types";

export const CATALOG_TAG = "catalog";
const REVALIDATE_SECONDS = 300;

/**
 * Wraps a DB query in the Next data cache. Errors are NOT swallowed here, so a
 * failed read is never cached — the caller's fallback handles it.
 */
function cached<A extends unknown[], R>(
  name: string,
  fn: (...args: A) => Promise<R>,
) {
  return unstable_cache(fn, ["catalog", name], {
    tags: [CATALOG_TAG],
    revalidate: REVALIDATE_SECONDS,
  });
}

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
const byOrder = [asc(productsTable.createdAt), asc(productsTable.id)] as const;

// ── Products ─────────────────────────────────────────────────

const queryAllProducts = cached("all", async () => {
  const rows = await getDb()
    .select()
    .from(productsTable)
    .where(published)
    .orderBy(...byOrder);
  return rows.map(toProduct);
});

export const getAllProducts = cache(
  async (): Promise<Product[]> =>
    withFallback(queryAllProducts, () => staticCatalog.products),
);

const queryProduct = cached("by-slug", async (slug: string) => {
  const [row] = await getDb()
    .select()
    .from(productsTable)
    .where(and(published, eq(productsTable.slug, slug)))
    .limit(1);
  return row ? toProduct(row) : null;
});

export const getProduct = cache(
  async (slug: string): Promise<Product | undefined> =>
    withFallback(
      async () => (await queryProduct(slug)) ?? undefined,
      () => staticCatalog.getProduct(slug),
    ),
);

const queryProductsByIds = cached("by-ids", async (ids: string[]) => {
  const rows = await getDb()
    .select()
    .from(productsTable)
    .where(and(published, inArray(productsTable.id, ids)));
  return rows.map(toProduct);
});

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const sorted = [...new Set(ids)].sort(); // stable cache key
  return withFallback(
    () => queryProductsByIds(sorted),
    () => staticCatalog.products.filter((p) => ids.includes(p.id)),
  );
}

const queryByCategory = cached(
  "by-category",
  async (category: Product["category"]) => {
    const rows = await getDb()
      .select()
      .from(productsTable)
      .where(and(published, eq(productsTable.category, category)))
      .orderBy(...byOrder);
    return rows.map(toProduct);
  },
);

export async function getProductsByCategory(
  category: Product["category"],
): Promise<Product[]> {
  return withFallback(
    () => queryByCategory(category),
    () => staticCatalog.getProductsByCategory(category),
  );
}

const querySubcategory = cached(
  "by-subcategory",
  async (category: Product["category"], subcategory: string) => {
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
      .orderBy(...byOrder);
    return rows.map(toProduct);
  },
);

export async function getProductsBySubcategory(
  category: string,
  subcategory: string,
): Promise<Product[]> {
  if (subcategory === "All") return getProductsByCategory(category);
  return withFallback(
    () => querySubcategory(category, subcategory),
    () => staticCatalog.getProductsBySubcategory(category, subcategory),
  );
}

const queryNewArrivals = cached("new", async (limit: number) => {
  const rows = await getDb()
    .select()
    .from(productsTable)
    .where(and(published, eq(productsTable.isNew, true)))
    .orderBy(desc(productsTable.createdAt), asc(productsTable.id))
    .limit(limit);
  return rows.map(toProduct);
});

export async function getNewArrivals(limit = 100): Promise<Product[]> {
  return withFallback(
    () => queryNewArrivals(limit),
    () => staticCatalog.getNewArrivals(limit),
  );
}

const queryBestSellers = cached("best", async (limit: number) => {
  const rows = await getDb()
    .select()
    .from(productsTable)
    .where(and(published, eq(productsTable.isBestSeller, true)))
    .orderBy(...byOrder)
    .limit(limit);
  return rows.map(toProduct);
});

export async function getBestSellers(limit = 100): Promise<Product[]> {
  return withFallback(
    () => queryBestSellers(limit),
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

/** Not cached: queries are user-driven and unbounded. */
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

// ── Categories ──────────────────────────────────────────────

export type CategoryInfo = {
  slug: string;
  label: string;
  blurb: string;
  subcategories: string[];
};

const STATIC_CATEGORIES: CategoryInfo[] = [
  { slug: "clothes", label: "Clothes", blurb: "Elegant. Timeless. You.", subcategories: ["All", "Dresses", "Sarees", "Lehengas", "Co-ords"] },
  { slug: "jewelry", label: "Jewellery", blurb: "Pieces that tell your story.", subcategories: ["All", "Necklaces", "Earrings", "Rings", "Bracelets"] },
  { slug: "hand-bags", label: "Hand Bags", blurb: "Luxury in your hands.", subcategories: ["All", "Shoulder Bags", "Tote Bags", "Top Handle Bags"] },
];

const queryCategories = cached("categories-list", async (): Promise<CategoryInfo[]> => {
  const rows = await getDb()
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isPublished, true))
    .orderBy(asc(categoriesTable.sortOrder));
  return rows.map((r) => ({
    slug: r.slug,
    label: r.label,
    blurb: r.blurb,
    subcategories: r.subcategories.length > 0 ? r.subcategories : [],
  }));
});

export const getCategories = cache(
  async (): Promise<CategoryInfo[]> =>
    withFallback(queryCategories, () => STATIC_CATEGORIES),
);

// ── Collections ──────────────────────────────────────────────

const queryCollections = cached(
  "collections",
  async (): Promise<Collection[]> => {
    const db = getDb();
    const [cols, links] = await Promise.all([
      db
        .select()
        .from(collectionsTable)
        .where(eq(collectionsTable.isPublished, true))
        .orderBy(asc(collectionsTable.sortOrder)),
      db
        .select()
        .from(collectionProducts)
        .orderBy(asc(collectionProducts.sortOrder)),
    ]);
    return cols.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      heroImage: c.heroImage,
      products: links
        .filter((l) => l.collectionId === c.id)
        .map((l) => l.productId),
    }));
  },
);

export const getCollections = cache(
  async (): Promise<Collection[]> =>
    withFallback(queryCollections, () => staticCollections.collections),
);

export async function getCollection(
  slug: string,
): Promise<Collection | undefined> {
  return (await getCollections()).find((c) => c.slug === slug);
}
