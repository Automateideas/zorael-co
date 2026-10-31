"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { collections, collectionProducts, products } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

/** Same rule as products — a hand-typed slug must still be URL-safe. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type CollectionFormData = {
  id?: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  heroImage?: string;
  sortOrder?: number;
  isPublished?: boolean;
  /** Product ids in display order. */
  productIds?: string[];
};

export async function getCollectionsAdmin() {
  await requireAdmin();
  const db = getDb();

  const rows = await db
    .select()
    .from(collections)
    .orderBy(asc(collections.sortOrder), asc(collections.name));

  const links = await db.select().from(collectionProducts);

  return rows.map((c) => ({
    ...c,
    productCount: links.filter((l) => l.collectionId === c.id).length,
  }));
}

export async function getCollectionAdmin(id: string) {
  await requireAdmin();
  const db = getDb();

  const [row] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);
  if (!row) return null;

  const links = await db
    .select()
    .from(collectionProducts)
    .where(eq(collectionProducts.collectionId, id))
    .orderBy(asc(collectionProducts.sortOrder));

  return { ...row, productIds: links.map((l) => l.productId) };
}

/** Every product, so the editor can offer a picker. */
export async function getProductOptions() {
  await requireAdmin();
  const db = getDb();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      images: products.images,
      isPublished: products.isPublished,
    })
    .from(products)
    .orderBy(asc(products.name));

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    image: p.images?.[0] ?? "",
    isPublished: p.isPublished,
  }));
}

export async function saveCollection(data: CollectionFormData) {
  await requireAdmin();
  const db = getDb();

  const name = data.name.trim();
  if (!name) throw new Error("Enter a collection name.");

  const slug = slugify(data.slug || name);
  if (!slug) throw new Error("Could not build a URL from this name.");

  const id = data.id || `c-${slug}`;

  // A different collection already owning this slug would break its URL.
  const [clash] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);
  if (clash && clash.id !== id) {
    throw new Error("Another collection already uses this URL.");
  }

  const row = {
    slug,
    name,
    tagline: data.tagline?.trim() ?? "",
    description: data.description?.trim() ?? "",
    heroImage: data.heroImage?.trim() ?? "",
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
  };

  const [existing] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  if (existing) {
    await db.update(collections).set(row).where(eq(collections.id, id));
  } else {
    await db.insert(collections).values({ id, ...row });
  }

  if (data.productIds) {
    await setCollectionProductsInternal(id, data.productIds);
  }

  updateTag(CATALOG_TAG);
  return { id, slug };
}

/**
 * Replaces the collection's product list, preserving the given order.
 * Rewritten wholesale rather than diffed — the list is small and this keeps
 * `sortOrder` consistent.
 */
async function setCollectionProductsInternal(
  collectionId: string,
  productIds: string[],
) {
  const db = getDb();
  await db
    .delete(collectionProducts)
    .where(eq(collectionProducts.collectionId, collectionId));

  const unique = [...new Set(productIds)].filter(Boolean);
  if (unique.length === 0) return;

  // Ignore ids that no longer exist, so a stale picker cannot break the save.
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, unique));
  const valid = new Set(existing.map((p) => p.id));

  const rows = unique
    .filter((id) => valid.has(id))
    .map((productId, i) => ({ collectionId, productId, sortOrder: i }));

  if (rows.length > 0) await db.insert(collectionProducts).values(rows);
}

export async function setCollectionProducts(
  collectionId: string,
  productIds: string[],
) {
  await requireAdmin();
  await setCollectionProductsInternal(collectionId, productIds);
  updateTag(CATALOG_TAG);
}

export async function toggleCollectionPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  const db = getDb();
  await db.update(collections).set({ isPublished }).where(eq(collections.id, id));
  updateTag(CATALOG_TAG);
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  const db = getDb();
  // collection_products rows cascade on delete.
  await db.delete(collections).where(eq(collections.id, id));
  updateTag(CATALOG_TAG);
}
