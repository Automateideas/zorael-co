"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { siteImages } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import {
  IMAGE_SLOTS,
  SITE_IMAGES_TAG,
  SLOT_KEYS,
  type SlotKey,
} from "@/lib/site-images";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

/** Rejects anything that is not a known slot, so arbitrary rows cannot be written. */
function assertSlot(slot: string): asserts slot is SlotKey {
  if (!SLOT_KEYS.includes(slot as SlotKey)) {
    throw new Error("Unknown image slot.");
  }
}

export async function getAppearance() {
  await requireAdmin();
  const db = getDb();
  const rows = await db.select().from(siteImages);

  return SLOT_KEYS.map((slot) => {
    const row = rows.find((r) => r.slot === slot);
    const config = IMAGE_SLOTS[slot];
    return {
      slot,
      label: config.label,
      hint: config.hint,
      multiple: config.multiple as boolean,
      images: row?.images ?? [],
      defaults: [...config.defaults],
      usingDefaults: !row || row.images.length === 0,
    };
  });
}

export async function saveSlotImages(slot: string, images: string[]) {
  await requireAdmin();
  assertSlot(slot);

  const clean = [...new Set(images.filter(Boolean))];
  // Single-image slots must never store more than one.
  const next = IMAGE_SLOTS[slot].multiple ? clean : clean.slice(0, 1);

  const db = getDb();
  const [existing] = await db
    .select({ slot: siteImages.slot })
    .from(siteImages)
    .where(eq(siteImages.slot, slot))
    .limit(1);

  if (existing) {
    await db
      .update(siteImages)
      .set({ images: next, updatedAt: new Date() })
      .where(eq(siteImages.slot, slot));
  } else {
    await db.insert(siteImages).values({ slot, images: next });
  }

  updateTag(SITE_IMAGES_TAG);
  revalidatePath("/");
  revalidatePath("/about");
  return next;
}

/** Clears the slot so the built-in artwork is used again. */
export async function resetSlot(slot: string) {
  await requireAdmin();
  assertSlot(slot);

  const db = getDb();
  await db.delete(siteImages).where(eq(siteImages.slot, slot));

  updateTag(SITE_IMAGES_TAG);
  revalidatePath("/");
  revalidatePath("/about");
}
