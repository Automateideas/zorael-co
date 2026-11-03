/**
 * Admin-editable imagery for fixed page sections.
 *
 * Each slot falls back to the built-in artwork when the admin has not set
 * anything, so the homepage and about page never render blank — and the site
 * keeps working if the database is unreachable.
 */
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb, hasDatabase } from "@/db/client";
import { siteImages } from "@/db/schema";
import { img, PHOTO } from "./images";

export const SITE_IMAGES_TAG = "site-images";

/** Every editable slot, with its default artwork and intended shape. */
export const IMAGE_SLOTS = {
  hero: {
    label: "Hero Carousel",
    hint: "Wide, cinematic shots. Add as many as you like — they rotate in order.",
    multiple: true,
    defaults: [
      img(PHOTO.heroModel, 1800, 1000),
      img(PHOTO.editorialSaree, 1800, 1000),
      img(PHOTO.necklaceGold, 1800, 1000),
      img(PHOTO.handbagHero, 1800, 1000),
    ],
  },
  "category-women": {
    label: "Category Card — Women",
    hint: "Tall portrait crops. Add more than one and the card becomes a slideshow.",
    multiple: true,
    defaults: [img(PHOTO.ivoryDress, 800, 900)],
  },
  "category-accessories": {
    label: "Category Card — Accessories",
    hint: "Tall portrait crops. Add more than one and the card becomes a slideshow.",
    multiple: true,
    defaults: [img(PHOTO.necklaceGold, 800, 900)],
  },
  "category-brand-collection": {
    label: "Category Card — Brand Collection",
    hint: "Tall portrait crops. Add more than one and the card becomes a slideshow.",
    multiple: true,
    defaults: [img(PHOTO.handbagHero, 800, 900)],
  },
  "editorial-banner": {
    label: "Editorial Banner",
    hint: "Wide banner across the homepage.",
    multiple: false,
    defaults: [img(PHOTO.editorialWoman, 1800, 900)],
  },
  "new-arrivals": {
    label: "New Arrivals Panel",
    hint: "Portrait image beside the new arrivals grid.",
    multiple: false,
    defaults: [img(PHOTO.jewelleryFlat, 700, 900)],
  },
  "about-hero": {
    label: "About — Hero",
    hint: "Wide banner at the top of the About page.",
    multiple: false,
    defaults: [img(PHOTO.aboutInterior, 1800, 900)],
  },
  "about-story": {
    label: "About — Brand Story",
    hint: "Portrait image beside the story text.",
    multiple: false,
    defaults: [img(PHOTO.brandStory, 1000, 1250)],
  },
} as const;

export type SlotKey = keyof typeof IMAGE_SLOTS;

export const SLOT_KEYS = Object.keys(IMAGE_SLOTS) as SlotKey[];

async function readSiteImages(): Promise<Record<SlotKey, string[]>> {
  const result = {} as Record<SlotKey, string[]>;
  for (const key of SLOT_KEYS) {
    result[key] = [...IMAGE_SLOTS[key].defaults];
  }

  if (!hasDatabase()) return result;

  try {
    const rows = await getDb().select().from(siteImages);
    for (const row of rows) {
      const key = row.slot as SlotKey;
      if (key in result && row.images.length > 0) {
        result[key] = row.images;
      }
    }
  } catch {
    // Keep the defaults rather than failing the page render.
  }

  return result;
}

/** All slots with their current values, defaults filled in. */
export const getSiteImages = unstable_cache(
  readSiteImages,
  ["site-images", "all"],
  { tags: [SITE_IMAGES_TAG], revalidate: 300 },
);

/** One slot's images, defaults applied. */
export async function getSlotImages(slot: SlotKey): Promise<string[]> {
  if (!hasDatabase()) return [...IMAGE_SLOTS[slot].defaults];
  try {
    const [row] = await getDb()
      .select()
      .from(siteImages)
      .where(eq(siteImages.slot, slot))
      .limit(1);
    if (row && row.images.length > 0) return row.images;
  } catch {
    /* fall through to defaults */
  }
  return [...IMAGE_SLOTS[slot].defaults];
}
