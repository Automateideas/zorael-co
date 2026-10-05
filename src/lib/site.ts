import type { Category } from "./types";

export const SITE = {
  name: "ZORAEL & CO.",
  shortName: "ZORAEL",
  tagline: "Luxury Fashion House",
  motto: "Crafted for the Extraordinary.",
  description:
    "ZORAEL & CO. — a premium international luxury fashion house. Timeless clothing, fine jewellery and considered hand bags, designed with restraint and made to last.",
  freeShippingNote: "Free Shipping on Orders Above ₹ 15,000",
  announcement: "Timeless Pieces. Modern Elegance.",
  url: "https://zorael.co",
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
    label: "Clothes",
    value: "clothes",
    href: "/shop?category=clothes",
    blurb: "Elegant. Timeless. You.",
  },
  {
    label: "Jewellery",
    value: "jewelry",
    href: "/shop?category=jewelry",
    blurb: "Pieces that tell your story.",
  },
  {
    label: "Hand Bags",
    value: "hand-bags",
    href: "/shop?category=hand-bags",
    blurb: "Luxury in your hands.",
  },
];

/** The filter pills shown on /shop. */
export const shopFilters = [
  { label: "All", value: "all" },
  { label: "Clothes", value: "clothes" },
  { label: "Jewellery", value: "jewelry" },
  { label: "Hand Bags", value: "hand-bags" },
  { label: "Collections", value: "collections" },
] as const;

/** Subcategory filter pills per category. */
export const subcategories: Record<string, string[]> = {
  clothes: ["All", "Dresses", "Sarees", "Lehengas", "Co-ords"],
  jewelry: ["All", "Necklaces", "Earrings", "Rings", "Bracelets"],
  "hand-bags": ["All", "Shoulder Bags", "Tote Bags", "Top Handle Bags"],
};

export const categoryMeta: Record<string, { title: string; blurb: string }> = {
  clothes: { title: "Clothes", blurb: "Elegant. Timeless. You." },
  jewelry: { title: "Jewellery", blurb: "Pieces that tell your story." },
  "hand-bags": { title: "Hand Bags", blurb: "Luxury in your hands." },
};

export const popularSearches = [
  "Lehenga",
  "Saree",
  "Kurta Set",
  "Handbags",
  "Necklace",
  "Rings",
];
