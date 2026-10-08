"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories, products, productVariants } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  uploadProductImage,
  deleteImage,
} from "@/lib/supabase/storage";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type ProductFormData = {
  id?: string;
  name: string;
  slug?: string;
  category: string;
  subcategory?: string;
  collection?: string;
  price: number;
  currency?: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  details?: string[];
  care?: string[];
  shipping?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isPublished?: boolean;
  existingImages?: string[];
};

export async function saveProduct(data: ProductFormData) {
  await requireAdmin();
  const db = getDb();

  const id = data.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = data.slug || slugify(data.name);
  const now = new Date();

  const row = {
    id,
    slug,
    name: data.name,
    category: data.category,
    subcategory: data.subcategory || null,
    collection: data.collection || null,
    price: data.price,
    currency: data.currency || "INR",
    description: data.description || "",
    sizes: data.sizes?.length ? data.sizes : null,
    colors: data.colors?.length ? data.colors : null,
    materials: data.materials?.length ? data.materials : null,
    details: data.details?.length ? data.details : null,
    care: data.care?.length ? data.care : null,
    shipping: data.shipping?.length ? data.shipping : null,
    isNew: data.isNew ?? false,
    isBestSeller: data.isBestSeller ?? false,
    isPublished: data.isPublished ?? true,
    images: data.existingImages ?? [],
    updatedAt: now,
  };

  if (data.id) {
    await db.update(products).set(row).where(eq(products.id, data.id));
  } else {
    await db.insert(products).values({ ...row, createdAt: now });
  }

  updateTag(CATALOG_TAG);
  return { id, slug };
}

export async function uploadProductImages(
  productId: string,
  formData: FormData,
) {
  await requireAdmin();
  const db = getDb();

  const files = formData.getAll("files") as File[];
  const urls: string[] = [];

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "webp";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const url = await uploadProductImage(productId, filename, bytes, file.type);
    urls.push(url);
  }

  if (urls.length > 0) {
    await db
      .update(products)
      .set({
        images: sql`COALESCE(${products.images}, '[]'::jsonb) || ${JSON.stringify(urls)}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  }

  updateTag(CATALOG_TAG);
  return urls;
}

export async function removeProductImage(productId: string, imageUrl: string) {
  await requireAdmin();
  const db = getDb();

  const [row] = await db
    .select({ images: products.images })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!row) return;

  const updated = (row.images ?? []).filter((img) => img !== imageUrl);
  await db
    .update(products)
    .set({ images: updated, updatedAt: new Date() })
    .where(eq(products.id, productId));

  // Delete from storage — extract path from URL
  try {
    const pathMatch = imageUrl.match(/product-images\/(.+)$/);
    if (pathMatch) {
      await deleteImage(pathMatch[1]);
    }
  } catch {
    // Storage delete may fail if file doesn't exist — non-critical
  }

  updateTag(CATALOG_TAG);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const db = getDb();

  await db.delete(productVariants).where(eq(productVariants.productId, productId));
  await db.delete(products).where(eq(products.id, productId));

  updateTag(CATALOG_TAG);
}

export async function togglePublished(productId: string, published: boolean) {
  await requireAdmin();
  const db = getDb();

  await db
    .update(products)
    .set({ isPublished: published, updatedAt: new Date() })
    .where(eq(products.id, productId));

  updateTag(CATALOG_TAG);
}

export type VariantData = {
  size?: string;
  color?: string;
  stock: number;
};

export async function saveVariants(productId: string, variants: VariantData[]) {
  await requireAdmin();
  const db = getDb();

  // Remove old variants then insert new ones
  await db.delete(productVariants).where(eq(productVariants.productId, productId));

  if (variants.length > 0) {
    await db.insert(productVariants).values(
      variants.map((v, i) => ({
        productId,
        sku: `${productId}-${v.size || "os"}-${v.color || "def"}-${i}`,
        size: v.size || null,
        color: v.color || null,
        stock: v.stock,
      })),
    );
  }

  updateTag(CATALOG_TAG);
}

export async function getProductWithVariants(productId: string) {
  await requireAdmin();
  const db = getDb();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return { product, variants };
}

export async function updateProductStock(
  productId: string,
  variantId: number,
  newStock: number,
) {
  await requireAdmin();
  const db = getDb();
  await db
    .update(productVariants)
    .set({ stock: Math.max(0, newStock) })
    .where(eq(productVariants.id, variantId));
  updateTag(CATALOG_TAG);
}

export async function getAdminStats() {
  await requireAdmin();
  const db = getDb();

  const allProducts = await db
    .select({
      id: products.id,
      isPublished: products.isPublished,
    })
    .from(products);

  const stockRows = await db
    .select({
      productId: productVariants.productId,
      totalStock: sql<number>`COALESCE(SUM(${productVariants.stock}), 0)`,
    })
    .from(productVariants)
    .groupBy(productVariants.productId);

  const stockMap = new Map(stockRows.map((r) => [r.productId, Number(r.totalStock)]));

  const total = allProducts.length;
  const published = allProducts.filter((p) => p.isPublished).length;
  const drafts = total - published;
  const totalStock = stockRows.reduce((sum, r) => sum + Number(r.totalStock), 0);
  const outOfStock = allProducts.filter((p) => (stockMap.get(p.id) ?? 0) === 0).length;
  const lowStock = allProducts.filter((p) => {
    const s = stockMap.get(p.id) ?? 0;
    return s > 0 && s <= 10;
  }).length;

  return { total, published, drafts, totalStock, outOfStock, lowStock };
}

export async function getAllProductsAdmin() {
  await requireAdmin();
  const db = getDb();

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      category: products.category,
      price: products.price,
      images: products.images,
      isPublished: products.isPublished,
      isNew: products.isNew,
      isBestSeller: products.isBestSeller,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .orderBy(products.updatedAt);

  // Get total stock per product
  const stockRows = await db
    .select({
      productId: productVariants.productId,
      totalStock: sql<number>`COALESCE(SUM(${productVariants.stock}), 0)`,
    })
    .from(productVariants)
    .groupBy(productVariants.productId);

  const stockMap = new Map(stockRows.map((r) => [r.productId, Number(r.totalStock)]));

  return rows.map((r) => ({
    ...r,
    totalStock: stockMap.get(r.id) ?? 0,
  }));
}

// ── Categories ──────────────────────────────────────────────

export type CategoryFormData = {
  slug: string;
  label: string;
  blurb?: string;
  sortOrder?: number;
  subcategories?: string[];
  isPublished?: boolean;
  isNew?: boolean;
};

export async function getAllCategoriesAdmin() {
  await requireAdmin();
  const db = getDb();

  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder);

  const productCounts = await db
    .select({
      category: products.category,
      count: sql<number>`COUNT(*)`,
    })
    .from(products)
    .groupBy(products.category);

  const countMap = new Map(productCounts.map((r) => [r.category, Number(r.count)]));

  return rows.map((r) => ({
    ...r,
    productCount: countMap.get(r.slug) ?? 0,
  }));
}

export async function saveCategory(data: CategoryFormData) {
  await requireAdmin();
  const db = getDb();

  const row = {
    slug: data.slug,
    label: data.label,
    blurb: data.blurb || "",
    sortOrder: data.sortOrder ?? 0,
    subcategories: data.subcategories ?? [],
    isPublished: data.isPublished ?? true,
  };

  if (data.isNew) {
    await db.insert(categories).values({ ...row, createdAt: new Date() });
  } else {
    await db.update(categories).set(row).where(eq(categories.slug, data.slug));
  }

  updateTag(CATALOG_TAG);
}

export async function deleteCategory(slug: string) {
  await requireAdmin();
  const db = getDb();

  const productCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(products)
    .where(eq(products.category, slug));

  if (Number(productCount[0]?.count) > 0) {
    throw new Error("Cannot delete a category that has products. Reassign or delete the products first.");
  }

  await db.delete(categories).where(eq(categories.slug, slug));
  updateTag(CATALOG_TAG);
}

export async function toggleCategoryPublished(slug: string, published: boolean) {
  await requireAdmin();
  const db = getDb();
  await db.update(categories).set({ isPublished: published }).where(eq(categories.slug, slug));
  updateTag(CATALOG_TAG);
}
