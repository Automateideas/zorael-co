"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  deleteImages,
  listFilesRecursive,
  listFolder,
  urlToPath,
  type StorageFile,
  type StorageFolder,
} from "@/lib/supabase/storage";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

export type BrowseResult = {
  prefix: string;
  folders: StorageFolder[];
  files: StorageFile[];
};

export async function browseStorage(prefix = ""): Promise<BrowseResult> {
  await requireAdmin();
  const { folders, files } = await listFolder(prefix);
  return { prefix, folders, files };
}

export type ImageUsage = {
  /** Storage path of the image that is in use. */
  path: string;
  products: { id: string; name: string }[];
};

/**
 * Which of these storage paths are referenced by a product. Product rows store
 * full public URLs, so each is converted back to a path for comparison.
 */
export async function getImageUsage(paths: string[]): Promise<ImageUsage[]> {
  await requireAdmin();
  if (paths.length === 0) return [];

  const db = getDb();
  const rows = await db
    .select({ id: products.id, name: products.name, images: products.images })
    .from(products);

  const wanted = new Set(paths);
  const byPath = new Map<string, { id: string; name: string }[]>();

  for (const row of rows) {
    for (const url of row.images ?? []) {
      const path = urlToPath(url);
      if (!path || !wanted.has(path)) continue;
      const list = byPath.get(path) ?? [];
      if (!list.some((p) => p.id === row.id)) {
        list.push({ id: row.id, name: row.name });
      }
      byPath.set(path, list);
    }
  }

  return [...byPath.entries()].map(([path, products]) => ({ path, products }));
}

/** Expands folders to the files inside them, so callers see the real blast radius. */
export async function resolveTargets(
  filePaths: string[],
  folderPaths: string[],
): Promise<string[]> {
  await requireAdmin();
  const all = [...filePaths];
  for (const folder of folderPaths) {
    all.push(...(await listFilesRecursive(folder)));
  }
  return [...new Set(all)];
}

export type DeleteResult = {
  deleted: number;
  /** Populated when `force` was false and something was still in use. */
  blocked: ImageUsage[];
};

/**
 * Deletes files and/or whole folders. Refuses by default when any target is
 * still attached to a product; `force` deletes anyway and detaches the URLs so
 * the catalog is never left pointing at missing images.
 */
export async function deleteStorageItems(
  filePaths: string[],
  folderPaths: string[],
  force = false,
): Promise<DeleteResult> {
  await requireAdmin();

  const targets = await resolveTargets(filePaths, folderPaths);
  if (targets.length === 0) return { deleted: 0, blocked: [] };

  const usage = await getImageUsage(targets);
  if (usage.length > 0 && !force) {
    return { deleted: 0, blocked: usage };
  }

  if (usage.length > 0) {
    await detachFromProducts(targets);
  }

  const deleted = await deleteImages(targets);
  updateTag(CATALOG_TAG);
  return { deleted, blocked: [] };
}

/** Strips deleted images out of every product that referenced them. */
async function detachFromProducts(paths: string[]) {
  const db = getDb();
  const doomed = new Set(paths);

  const rows = await db
    .select({ id: products.id, images: products.images })
    .from(products);

  for (const row of rows) {
    const kept = (row.images ?? []).filter((url) => {
      const path = urlToPath(url);
      return !path || !doomed.has(path);
    });
    if (kept.length !== (row.images ?? []).length) {
      await db
        .update(products)
        .set({ images: kept, updatedAt: new Date() })
        .where(eq(products.id, row.id));
    }
  }
}

/** Attaches already-uploaded images to a product, skipping duplicates. */
export async function attachExistingImages(productId: string, urls: string[]) {
  await requireAdmin();
  if (urls.length === 0) return [];

  const db = getDb();
  const [row] = await db
    .select({ images: products.images })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!row) throw new Error("Product not found.");

  const existing = row.images ?? [];
  const merged = [...existing, ...urls.filter((u) => !existing.includes(u))];

  await db
    .update(products)
    .set({ images: merged, updatedAt: new Date() })
    .where(eq(products.id, productId));

  updateTag(CATALOG_TAG);
  return merged;
}

/** Totals for the storage page header. */
export async function getStorageStats() {
  await requireAdmin();
  const files = await listFilesRecursive("");
  const db = getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);
  return { totalFiles: files.length, productCount: count };
}
