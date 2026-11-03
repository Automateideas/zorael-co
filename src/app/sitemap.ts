import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllProducts, getCollections } from "@/lib/catalog";
import { journalPosts } from "@/lib/journal";

/** Half a day — the catalog changes through the admin panel, not on deploy. */
export const revalidate = 43200;

const base = SITE.url.replace(/\/+$/, "");

/**
 * Serves /sitemap.xml.
 *
 * Only public, indexable, canonical URLs belong here. Notably absent:
 *  - /bag, /checkout, /account, /admin — private or transactional, and
 *    disallowed in robots.ts, so listing them would contradict it.
 *  - /shop?category=… — same path with a query string. Without canonical tags
 *    on those views, submitting them invites duplicate-content signals.
 *  - /search — infinite URL space.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // A database read here must never take the whole sitemap down with it —
  // a 500 on /sitemap.xml is worse for crawling than a short sitemap.
  const [products, collections] = await Promise.all([
    getAllProducts().catch((err) => {
      console.error("[sitemap] products unavailable:", err);
      return [];
    }),
    getCollections().catch((err) => {
      console.error("[sitemap] collections unavailable:", err);
      return [];
    }),
  ]);

  return [
    ...staticRoutes,
    // Products carry no updatedAt, so lastModified is omitted rather than
    // stamped with "now" on every crawl — a false freshness signal is worse
    // than none at all.
    ...products.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...journalPosts.map((post) => ({
      url: `${base}/journal/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
