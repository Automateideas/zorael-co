import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Serves /robots.txt.
 *
 * Everything listed under `disallow` is either private (admin, account),
 * transactional (bag, checkout) or has no standalone value in search results
 * (the API, the PWA offline shell). Crawling them wastes budget and, for the
 * account pages, puts URLs in the index that only ever return a redirect.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/bag",
          "/checkout",
          "/api/",
          "/offline",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
