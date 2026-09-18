import type { Product } from "./types";
import { img, PHOTO } from "./images";

const INR = "INR";

export const products: Product[] = [
  {
    id: "p-ivory-grace",
    slug: "ivory-grace-dress",
    name: "Ivory Grace Dress",
    category: "clothes",
    subcategory: "Dresses",
    collection: "the-everyday-luxe",
    price: 12500,
    currency: INR,
    images: [
      img(PHOTO.ivoryDress, 900, 1125),
      img(PHOTO.sereneDress, 900, 1125),
      img(PHOTO.editorialWoman, 900, 1125),
    ],
    description:
      "A modern silhouette, crafted in premium fabric with delicate detailing and a timeless elegance. Cut to move quietly and worn with ease.",
    rating: 4.8,
    reviews: 124,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory", "Champagne", "Sand", "Charcoal"],
    materials: ["Premium silk blend", "Hand-finished seams"],
    details: [
      "Relaxed A-line silhouette",
      "Concealed side zip",
      "Fully lined bodice",
      "Made in limited quantities",
    ],
    care: ["Dry clean only", "Cool iron on reverse", "Store on a padded hanger"],
    shipping: ["Complimentary worldwide shipping", "Delivered in 3–6 business days"],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p-regal-bloom",
    slug: "regal-bloom-lehenga",
    name: "Regal Bloom Lehenga",
    category: "clothes",
    subcategory: "Lehengas",
    collection: "the-bridal-edit",
    price: 28000,
    currency: INR,
    images: [img(PHOTO.lehenga, 900, 1125), img(PHOTO.saffronSet, 900, 1125)],
    description:
      "A ceremonial lehenga with hand-worked florals across a deep, painterly ground. Structured yet fluid, made for occasions that matter.",
    rating: 4.9,
    reviews: 68,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ruby", "Emerald", "Midnight"],
    materials: ["Raw silk", "Zardozi hand embroidery"],
    details: ["Three-piece set", "Hand-embroidered bodice", "Canfan lining"],
    care: ["Dry clean only", "Store flat, away from light"],
    shipping: ["Complimentary worldwide shipping", "Made to order — allow 2 weeks"],
    isNew: true,
  },
  {
    id: "p-saffron-set",
    slug: "saffron-embroidered-set",
    name: "Saffron Embroidered Set",
    category: "clothes",
    subcategory: "Co-ords",
    collection: "the-signature-edit",
    price: 22500,
    currency: INR,
    images: [img(PHOTO.saffronSet, 900, 1125), img(PHOTO.lehenga, 900, 1125)],
    description:
      "A warm saffron co-ord with fine tonal embroidery. Effortless from day to evening, tailored for a considered wardrobe.",
    rating: 4.7,
    reviews: 51,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Saffron", "Ivory"],
    materials: ["Cotton silk", "Tonal thread work"],
    details: ["Two-piece set", "Relaxed fit", "Breathable weave"],
    isNew: true,
  },
  {
    id: "p-aurelia-saree",
    slug: "the-aurelia-saree",
    name: "The Aurelia Saree",
    category: "clothes",
    subcategory: "Sarees",
    collection: "the-signature-edit",
    price: 24500,
    currency: INR,
    images: [img(PHOTO.aureliaSaree, 900, 1125), img(PHOTO.editorialSaree, 900, 1125)],
    description:
      "A fluid drape in a soft, luminous weave with a finely detailed border. Quiet luxury, worn close.",
    rating: 4.8,
    reviews: 42,
    colors: ["Champagne", "Rose", "Pearl"],
    materials: ["Organza", "Woven border"],
    details: ["Includes unstitched blouse piece", "5.5m drape"],
    isNew: true,
  },
  {
    id: "p-noir-saree",
    slug: "noir-draped-saree",
    name: "Noir Draped Saree",
    category: "clothes",
    subcategory: "Sarees",
    collection: "the-signature-edit",
    price: 21000,
    currency: INR,
    images: [img(PHOTO.noirSaree, 900, 1125), img(PHOTO.aureliaSaree, 900, 1125)],
    description:
      "A deep, architectural drape for evening. Restrained, confident, and endlessly re-wearable.",
    rating: 4.9,
    reviews: 37,
    colors: ["Noir", "Charcoal"],
    materials: ["Silk georgette"],
    details: ["Pre-draped option available", "Includes blouse piece"],
    isBestSeller: true,
  },
  {
    id: "p-blush-organza",
    slug: "blush-organza-set",
    name: "Blush Organza Set",
    category: "clothes",
    subcategory: "Co-ords",
    collection: "the-everyday-luxe",
    price: 18500,
    currency: INR,
    images: [img(PHOTO.blushSet, 900, 1125), img(PHOTO.sereneDress, 900, 1125)],
    description:
      "A weightless organza set in the softest blush. Light on the shoulder, quietly luminous.",
    rating: 4.6,
    reviews: 29,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blush", "Ivory"],
    materials: ["Organza", "Cotton lining"],
    isNew: true,
  },
  {
    id: "p-serene-dress",
    slug: "the-serene-dress",
    name: "The Serene Dress",
    category: "clothes",
    subcategory: "Dresses",
    collection: "the-everyday-luxe",
    price: 12800,
    currency: INR,
    images: [img(PHOTO.sereneDress, 900, 1125), img(PHOTO.ivoryDress, 900, 1125)],
    description:
      "An easy, elongating dress for unhurried days. Soft structure, clean lines, considered detail.",
    rating: 4.7,
    reviews: 33,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory", "Sage", "Clay"],
    materials: ["Linen blend"],
  },
  {
    id: "p-velvet-kurta",
    slug: "the-velvet-kurta-set",
    name: "The Velvet Kurta Set",
    category: "clothes",
    subcategory: "Co-ords",
    collection: "the-bridal-edit",
    price: 16500,
    currency: INR,
    images: [img(PHOTO.velvetKurta, 900, 1125), img(PHOTO.saffronSet, 900, 1125)],
    description:
      "A deep velvet kurta set with a whisper of shine. Made for cooler evenings and warm rooms.",
    rating: 4.8,
    reviews: 24,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Wine", "Forest", "Noir"],
    materials: ["Cotton velvet"],
    isBestSeller: true,
  },

  // ── Jewellery ───────────────────────────────────────────────
  {
    id: "p-serpent-choker",
    slug: "golden-serpent-choker",
    name: "Golden Serpent Choker",
    category: "jewelry",
    subcategory: "Necklaces",
    collection: "the-signature-edit",
    price: 9800,
    currency: INR,
    images: [img(PHOTO.serpentChoker, 900, 900), img(PHOTO.necklaceGold, 900, 900)],
    description:
      "A sculptural choker that sits close to the throat. Weighted, warm, and quietly commanding.",
    rating: 4.9,
    reviews: 88,
    materials: ["18k gold vermeil", "Hand-polished finish"],
    details: ["Adjustable clasp", "Nickel-free", "Presented in a Zorael box"],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p-pearl-earrings",
    slug: "blossom-pearl-earrings",
    name: "Blossom Pearl Earrings",
    category: "jewelry",
    subcategory: "Earrings",
    collection: "the-everyday-luxe",
    price: 5600,
    currency: INR,
    images: [img(PHOTO.pearlEarrings, 900, 900), img(PHOTO.jewelleryFlat, 900, 900)],
    description:
      "Freshwater pearls set in a delicate floral mount. Soft light, everyday ease.",
    rating: 4.8,
    reviews: 64,
    materials: ["Freshwater pearl", "Gold vermeil"],
    details: ["Butterfly backs", "For pierced ears"],
    isNew: true,
  },
  {
    id: "p-aurelia-necklace",
    slug: "the-aurelia-necklace",
    name: "The Aurelia Necklace",
    category: "jewelry",
    subcategory: "Necklaces",
    collection: "the-bridal-edit",
    price: 26500,
    currency: INR,
    images: [img(PHOTO.aureliaNecklace, 900, 900), img(PHOTO.necklaceGold, 900, 900)],
    description:
      "A layered statement necklace for ceremony and occasion. Intricate, balanced, unmistakably fine.",
    rating: 5.0,
    reviews: 41,
    materials: ["Gold vermeil", "Cubic zirconia", "Glass pearls"],
    details: ["Multi-strand", "Lobster clasp with extender"],
    isBestSeller: true,
  },
  {
    id: "p-crystal-ring",
    slug: "pink-wing-crystal-ring",
    name: "Pink Wing Crystal Ring",
    category: "jewelry",
    subcategory: "Rings",
    collection: "the-everyday-luxe",
    price: 6500,
    currency: INR,
    images: [img(PHOTO.crystalRing, 900, 900), img(PHOTO.jewelleryFlat, 900, 900)],
    description:
      "A winged crystal ring with a soft rose glow. Small, deliberate, and quietly joyful.",
    rating: 4.7,
    reviews: 30,
    sizes: ["6", "7", "8"],
    materials: ["Gold vermeil", "Rose crystal"],
    isNew: true,
  },
  {
    id: "p-tennis-bracelet",
    slug: "blush-glow-tennis-bracelet",
    name: "Blush Glow Tennis Bracelet",
    category: "jewelry",
    subcategory: "Bracelets",
    collection: "the-signature-edit",
    price: 8500,
    currency: INR,
    images: [img(PHOTO.tennisBracelet, 900, 900), img(PHOTO.jewelleryFlat, 900, 900)],
    description:
      "A continuous line of blush stones for a soft, luminous wrist. Elegant on its own or layered.",
    rating: 4.8,
    reviews: 52,
    materials: ["Gold vermeil", "Cubic zirconia"],
    details: ["Box clasp with safety catch"],
    isBestSeller: true,
  },

  // ── Hand bags ───────────────────────────────────────────────
  {
    id: "p-lumina-tote",
    slug: "the-lumina-tote",
    name: "The Lumina Tote",
    category: "hand-bags",
    subcategory: "Tote Bags",
    collection: "the-everyday-luxe",
    price: 24500,
    currency: INR,
    images: [img(PHOTO.luminaTote, 900, 900), img(PHOTO.handbagHero, 900, 900)],
    description:
      "A structured tote in supple grained leather. Room for the day, cut with a clean, quiet line.",
    rating: 4.9,
    reviews: 76,
    colors: ["Sand", "Black", "Taupe"],
    materials: ["Full-grain leather", "Suede lining"],
    details: ["Fits a 13\" laptop", "Interior zip pocket", "Protective feet"],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p-valora-bag",
    slug: "the-valora-bag",
    name: "The Valora Bag",
    category: "hand-bags",
    subcategory: "Top Handle Bags",
    collection: "the-signature-edit",
    price: 28000,
    currency: INR,
    images: [img(PHOTO.valoraBag, 900, 900), img(PHOTO.luminaTote, 900, 900)],
    description:
      "A top-handle bag with a precise, architectural form. Structured hardware, understated shine.",
    rating: 4.8,
    reviews: 58,
    colors: ["Black", "Cognac"],
    materials: ["Box calf leather", "Gold-tone hardware"],
    details: ["Detachable strap", "Twist-lock closure"],
    isNew: true,
  },
  {
    id: "p-eclipse-bag",
    slug: "the-eclipse-bag",
    name: "The Eclipse Bag",
    category: "hand-bags",
    subcategory: "Shoulder Bags",
    collection: "the-signature-edit",
    price: 30000,
    currency: INR,
    images: [img(PHOTO.eclipseBag, 900, 900), img(PHOTO.valoraBag, 900, 900)],
    description:
      "A curved shoulder bag that follows the body. Quietly dramatic, endlessly versatile.",
    rating: 4.9,
    reviews: 44,
    colors: ["Burgundy", "Black"],
    materials: ["Nappa leather"],
    details: ["Magnetic flap", "Slim shoulder strap"],
    isBestSeller: true,
  },
  {
    id: "p-noura-tote",
    slug: "the-noura-tote",
    name: "The Noura Tote",
    category: "hand-bags",
    subcategory: "Tote Bags",
    collection: "the-everyday-luxe",
    price: 22500,
    currency: INR,
    images: [img(PHOTO.nouraTote, 900, 900), img(PHOTO.handbagHero, 900, 900)],
    description:
      "A softly slouched tote in a warm neutral. Unlined, lightweight, made to be lived in.",
    rating: 4.7,
    reviews: 39,
    colors: ["Ivory", "Sand"],
    materials: ["Pebbled leather"],
    isNew: true,
  },
];

// ── Selectors ────────────────────────────────────────────────
export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(
  category: Product["category"],
  subcategory: string,
): Product[] {
  if (subcategory === "All") return getProductsByCategory(category);
  return products.filter(
    (p) => p.category === category && p.subcategory === subcategory,
  );
}

export function getNewArrivals(limit?: number): Product[] {
  const list = products.filter((p) => p.isNew);
  return limit ? list.slice(0, limit) : list;
}

export function getBestSellers(limit?: number): Product[] {
  const list = products.filter((p) => p.isBestSeller);
  return limit ? list.slice(0, limit) : list;
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}
