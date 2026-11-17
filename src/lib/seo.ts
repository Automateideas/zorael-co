import { SITE } from "./site";
import type { Product } from "./types";

const base = SITE.url.replace(/\/+$/, "");

/** Resolve a site-relative path (or pass through an already-absolute URL). */
export function abs(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Strip any HTML and collapse whitespace for use in plain-text schema fields. */
function plain(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: base,
    logo: abs("/logo.png"),
    description: SITE.description,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; url?: string };

export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: abs(it.url) } : {}),
    })),
  };
}

/**
 * Product + Offer. Deliberately omits `aggregateRating`/`review`: the catalog's
 * star ratings are seeded demo values, and marking fabricated reviews up as
 * rich-result data violates Google's policy. Add it back only when the ratings
 * come from genuine, on-page customer reviews.
 */
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: plain(product.description || product.name),
    image: product.images.map(abs),
    sku: product.id,
    ...(product.subcategory ? { category: product.subcategory } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: abs(`/shop/${product.slug}`),
      priceCurrency: product.currency,
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

type ArticleLike = {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  date: string;
};

export function articleSchema(post: ArticleLike) {
  const published = new Date(post.date).toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: abs(post.coverImage),
    datePublished: published,
    dateModified: published,
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: abs("/logo.png") },
    },
    mainEntityOfPage: abs(`/journal/${post.slug}`),
  };
}
