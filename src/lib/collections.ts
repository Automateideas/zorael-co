import type { Collection } from "./types";
import { img, PHOTO } from "./images";

export const collections: Collection[] = [
  {
    id: "c-bridal",
    slug: "the-bridal-edit",
    name: "The Bridal Edit",
    tagline: "Timeless traditions, modern grace.",
    description:
      "Ceremonial pieces for the moments that matter — hand-worked, considered, and made to be kept.",
    heroImage: img(PHOTO.lehenga, 1400, 1000),
    products: ["p-regal-bloom", "p-velvet-kurta", "p-aurelia-necklace"],
  },
  {
    id: "c-everyday",
    slug: "the-everyday-luxe",
    name: "The Everyday Luxe",
    tagline: "Effortless looks, elevated.",
    description:
      "Quiet, wearable luxury for unhurried days. Soft fabrics, clean lines, and pieces that layer with ease.",
    heroImage: img(PHOTO.editorialWoman, 1400, 1000),
    products: [
      "p-ivory-grace",
      "p-serene-dress",
      "p-blush-organza",
      "p-pearl-earrings",
      "p-crystal-ring",
      "p-noura-tote",
    ],
  },
  {
    id: "c-signature",
    slug: "the-signature-edit",
    name: "The Signature Edit",
    tagline: "Iconic pieces. Forever.",
    description:
      "The defining Zorael pieces — the sarees, the choker, the top-handle bag. Made once, worn always.",
    heroImage: img(PHOTO.aureliaSaree, 1400, 1000),
    products: [
      "p-aurelia-saree",
      "p-noir-saree",
      "p-serpent-choker",
      "p-tennis-bracelet",
      "p-valora-bag",
      "p-eclipse-bag",
    ],
  },
  {
    id: "c-resort",
    slug: "the-resort-edit",
    name: "The Resort Edit",
    tagline: "Sun, style, sophistication.",
    description:
      "Light, luminous pieces for warm escapes — organza, linen, and easy gold.",
    heroImage: img(PHOTO.blushSet, 1400, 1000),
    products: ["p-blush-organza", "p-saffron-set", "p-lumina-tote"],
  },
];

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}
