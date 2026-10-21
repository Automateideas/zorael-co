import type { Category } from "./types";

export const SITE = {
  name: "ZORAEL & CO.",
  shortName: "ZORAEL & CO.",
  tagline: "Luxury Fashion House",
  motto: "Crafted for the Extraordinary.",
  description:
    "ZORAEL & CO. — a premium international luxury fashion house. Timeless clothing, fine jewellery and considered hand bags, designed with restraint and made to last.",
  freeShippingNote: "Complimentary Delivery on Every Order",
  announcement: "Timeless Pieces. Modern Elegance.",
  url: "https://zoraelandco.com",
} as const;

/** Desktop primary navigation. */
export const desktopNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Journal", href: "/journal" },
  // { label: "Collections", href: "/collections" },
  { label: "About Us", href: "/about" },
] as const;

/** Mobile bottom navigation — Home / Shop / Search / Bag / Account (matches mockups). */
export const mobileBottomNav = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Shop", href: "/shop", icon: "shop" },
  { label: "Search", href: "/search", icon: "search" },
  { label: "Bag", href: "/bag", icon: "bag" },
  { label: "Account", href: "/account", icon: "account" },
] as const;

/** Full menu shown in the mobile slide-over. */
export const mobileMenu = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Journal", href: "/journal" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Account", href: "/account" },
  { label: "About Us", href: "/about" },
  { label: "Customer Support", href: "/about#support" },
] as const;

export type ShopCategory = {
  label: string;
  value: Category;
  href: string;
  blurb: string;
};

export const shopCategories: ShopCategory[] = [
  {
    label: "Women",
    value: "women",
    href: "/shop?category=women",
    blurb: "Elegant. Timeless. You.",
  },
  {
    label: "Accessories",
    value: "accessories",
    href: "/shop?category=accessories",
    blurb: "The finishing touch.",
  },
  {
    label: "Brand Collection",
    value: "brand-collection",
    href: "/shop?category=brand-collection",
    blurb: "Curated edits for every story.",
  },
];

/** The filter pills shown on /shop (static fallback — overridden by DB categories). */
export const shopFilters = [
  { label: "All", value: "all" },
  { label: "Women", value: "women" },
  { label: "Accessories", value: "accessories" },
  { label: "Brand Collection", value: "brand-collection" },
  { label: "Collections", value: "collections" },
] as const;

/** Subcategory filter pills per category (static fallback). */
export const subcategories: Record<string, string[]> = {
  women: [
    "Shop All",
    "CO-Ords Set",
    "Lehenga Set",
    "Sarees",
    "Suit Sets",
    "Capes & Jackets",
    "Dresses & Jumpsuit Sets",
    "Skirt & Trouser Set",
    "Dhoti Set",
    "Gowns",
  ],
  accessories: ["Shop All Accessories", "Bags", "Jewellery"],
  "brand-collection": [
    "The Signature Edit",
    "The Indian Edit",
    "The Occasion Edit",
  ],
};

export const categoryMeta: Record<string, { title: string; blurb: string }> = {
  women: { title: "Women", blurb: "Elegant. Timeless. You." },
  accessories: { title: "Accessories", blurb: "The finishing touch." },
  "brand-collection": {
    title: "Brand Collection",
    blurb: "Curated edits for every story.",
  },
};

export const popularSearches = [
  "Lehenga",
  "Saree",
  "Kurta Set",
  "Handbags",
  "Necklace",
  "Rings",
];
