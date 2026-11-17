/**
 * Admin-editable text for fixed pages. Mirrors `site-images.ts`, but for copy:
 * each page's fields fall back to the built-in content below, so the page never
 * renders blank and keeps working if the database is unreachable.
 */
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb, hasDatabase } from "@/db/client";
import { siteContent } from "@/db/schema";

export const SITE_CONTENT_TAG = "site-content";

export type AboutValue = { title: string; copy: string };

export type AboutContent = {
  heroTitle: string;
  heroSubtitle: string;
  philosophyEyebrow: string;
  philosophyStatement: string;
  philosophyBody: string;
  craftEyebrow: string;
  craftHeading: string;
  craftBody1: string;
  craftBody2: string;
  craftCtaLabel: string;
  craftCtaHref: string;
  /** Exactly four cards — the icons are fixed in code, by position. */
  values: AboutValue[];
  supportEyebrow: string;
  supportHeading: string;
  supportBody: string;
};

export const ABOUT_DEFAULTS: AboutContent = {
  heroTitle: "The House of Zorael",
  heroSubtitle: "Luxury Fashion House",
  philosophyEyebrow: "Our Philosophy",
  philosophyStatement:
    "At Zorael & Co., we believe in more than just fashion — we believe in craftsmanship, elegance and the art of timeless style.",
  philosophyBody:
    "Our collections are designed for the modern individual who values authenticity, luxury and self-expression. Each piece begins on paper, is refined against the body, and is finished by hand in small runs — nothing rushed to a calendar it does not deserve.",
  craftEyebrow: "Craftsmanship",
  craftHeading: "Made by hand, meant to last.",
  craftBody1:
    "From the first sketch to the final stitch, our makers work in small ateliers, finishing seams by hand and pressing each garment to sit exactly as intended. We choose materials for how they age, not only how they look on the first day.",
  craftBody2:
    "The result is quiet: a piece that simply fits, and keeps fitting. That, to us, is the mark of true luxury.",
  craftCtaLabel: "Explore the Collections",
  craftCtaHref: "/shop",
  values: [
    {
      title: "Premium Quality",
      copy: "Only finest materials, chosen with intent and finished by hand.",
    },
    {
      title: "Curated Collections",
      copy: "Considered edits, made in limited quantities and meant to be kept.",
    },
    {
      title: "Responsible Craft",
      copy: "Small runs, low waste, and a respect for the makers behind each piece.",
    },
    {
      title: "Made to Last",
      copy: "Design that outlives the season — quiet luxury, worn for years.",
    },
  ],
  supportEyebrow: "Customer Support",
  supportHeading: "We're here to help.",
  supportBody:
    "Questions on sizing, shipping, or a piece you've set your heart on? Our client care team would be glad to assist.",
};

const ABOUT_KEY = "about";

/** Merge a stored value over the defaults, keeping exactly four value cards. */
export function mergeAboutContent(
  stored: Partial<AboutContent> | null | undefined,
): AboutContent {
  const merged = { ...ABOUT_DEFAULTS, ...(stored ?? {}) };
  const values =
    Array.isArray(stored?.values) && stored.values.length > 0
      ? stored.values
      : ABOUT_DEFAULTS.values;
  // Always render four cards so the fixed icons line up.
  merged.values = ABOUT_DEFAULTS.values.map((d, i) => ({
    title: values[i]?.title?.trim() || d.title,
    copy: values[i]?.copy?.trim() || d.copy,
  }));
  return merged;
}

async function readAbout(): Promise<AboutContent> {
  if (!hasDatabase()) return ABOUT_DEFAULTS;
  try {
    const [row] = await getDb()
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, ABOUT_KEY))
      .limit(1);
    return mergeAboutContent(row?.value as Partial<AboutContent> | undefined);
  } catch {
    return ABOUT_DEFAULTS;
  }
}

export const getAboutContent = unstable_cache(readAbout, ["site-content", "about"], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 300,
});

export const ABOUT_CONTENT_KEY = ABOUT_KEY;
