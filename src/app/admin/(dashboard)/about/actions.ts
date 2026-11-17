"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { siteContent } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import {
  ABOUT_CONTENT_KEY,
  SITE_CONTENT_TAG,
  mergeAboutContent,
  type AboutContent,
} from "@/lib/site-content";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

/** Current About content, read straight from the DB (no cache) + defaults. */
export async function getAboutAdmin(): Promise<AboutContent> {
  await requireAdmin();
  const [row] = await getDb()
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, ABOUT_CONTENT_KEY))
    .limit(1);
  return mergeAboutContent(row?.value as Partial<AboutContent> | undefined);
}

export async function saveAboutContent(content: AboutContent) {
  await requireAdmin();
  // Normalize through the merge so stray fields are dropped and the four value
  // cards are always present.
  const clean = mergeAboutContent(content);

  const db = getDb();
  const [existing] = await db
    .select({ key: siteContent.key })
    .from(siteContent)
    .where(eq(siteContent.key, ABOUT_CONTENT_KEY))
    .limit(1);

  if (existing) {
    await db
      .update(siteContent)
      .set({ value: clean, updatedAt: new Date() })
      .where(eq(siteContent.key, ABOUT_CONTENT_KEY));
  } else {
    await db.insert(siteContent).values({ key: ABOUT_CONTENT_KEY, value: clean });
  }

  updateTag(SITE_CONTENT_TAG);
  revalidatePath("/about");
}
