"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { journalPosts } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { JOURNAL_TAG } from "@/lib/journal";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Invalidate both the cached data and the statically-rendered journal pages. */
function revalidateJournal() {
  updateTag(JOURNAL_TAG);
  revalidatePath("/journal");
  revalidatePath("/journal/[slug]", "page");
}

export type JournalFormData = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  readingTime?: string;
  coverImage?: string;
  body?: string[];
  isPublished?: boolean;
  sortOrder?: number;
  /** ISO date string (yyyy-mm-dd) from the form. */
  publishedAt?: string;
};

export async function getJournalAdmin() {
  await requireAdmin();
  const rows = await getDb()
    .select()
    .from(journalPosts)
    .orderBy(desc(journalPosts.sortOrder), desc(journalPosts.publishedAt));

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    isPublished: p.isPublished,
    sortOrder: p.sortOrder,
    publishedAt: p.publishedAt.toISOString(),
  }));
}

export async function getJournalPostAdmin(id: string) {
  await requireAdmin();
  const [row] = await getDb()
    .select()
    .from(journalPosts)
    .where(eq(journalPosts.id, id))
    .limit(1);
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    readingTime: row.readingTime,
    coverImage: row.coverImage,
    body: row.body,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    // Date input wants yyyy-mm-dd.
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
  };
}

export async function saveJournalPost(data: JournalFormData) {
  await requireAdmin();
  const db = getDb();

  const title = data.title.trim();
  if (!title) throw new Error("A title is required.");

  const slug = slugify(data.slug || title);
  if (!slug) throw new Error("Could not build a URL from this title.");

  const id = data.id || `j-${slug}`;

  const [clash] = await db
    .select({ id: journalPosts.id })
    .from(journalPosts)
    .where(eq(journalPosts.slug, slug))
    .limit(1);
  if (clash && clash.id !== id) {
    throw new Error("Another post already uses this URL.");
  }

  const body = (data.body ?? []).map((p) => p.trim()).filter(Boolean);
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : undefined;

  const base = {
    slug,
    title,
    excerpt: data.excerpt?.trim() ?? "",
    category: data.category?.trim() ?? "",
    readingTime: data.readingTime?.trim() ?? "",
    coverImage: data.coverImage?.trim() ?? "",
    body,
    isPublished: data.isPublished ?? true,
    sortOrder: data.sortOrder ?? 0,
  };

  const [existing] = await db
    .select({ id: journalPosts.id })
    .from(journalPosts)
    .where(eq(journalPosts.id, id))
    .limit(1);

  if (existing) {
    await db
      .update(journalPosts)
      .set({
        ...base,
        ...(publishedAt ? { publishedAt } : {}),
        updatedAt: new Date(),
      })
      .where(eq(journalPosts.id, id));
  } else {
    await db
      .insert(journalPosts)
      .values({ id, ...base, publishedAt: publishedAt ?? new Date() });
  }

  revalidateJournal();
  return { id, slug };
}

export async function toggleJournalPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await getDb()
    .update(journalPosts)
    .set({ isPublished, updatedAt: new Date() })
    .where(eq(journalPosts.id, id));
  revalidateJournal();
}

export async function deleteJournalPost(id: string) {
  await requireAdmin();
  await getDb().delete(journalPosts).where(eq(journalPosts.id, id));
  revalidateJournal();
}
