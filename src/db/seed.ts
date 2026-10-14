/**
 * Seed the catalog into Postgres from the code source of truth
 * (`src/lib/products.ts`, `src/lib/collections.ts`). Safe to re-run: existing
 * rows are updated in place and variant stock is never overwritten.
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { getDb } from "./client";
import {
  categories as categoriesTable,
  collectionProducts,
  collections as collectionsTable,
  productVariants,
  products as productsTable,
} from "./schema";
import { products } from "../lib/products";
import { collections } from "../lib/collections";

const DEFAULT_STOCK = 25;

const skuPart = (v: string) =>
  v.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 6);

const DEFAULT_CATEGORIES = [
  { slug: "women", label: "Women", blurb: "Elegant. Timeless. You.", sortOrder: 0, subcategories: ["Shop All", "CO-Ords Set", "Lehenga Set", "Sarees", "Suit Sets", "Capes & Jackets", "Dresses & Jumpsuit Sets", "Skirt & Trouser Set", "Dhoti Set", "Gowns"] },
  { slug: "men", label: "Men", blurb: "Coming Soon", sortOrder: 1, subcategories: ["Shop All", "Kurta Set", "Bandhgala Sets", "Shirts & T-Shirts", "Jackets"], isPublished: false },
  { slug: "kids", label: "Kids", blurb: "Coming Soon", sortOrder: 2, subcategories: ["Shop All", "Girl's Dresses", "Party Dresses", "Ethnic Wear"], isPublished: false },
  { slug: "accessories", label: "Accessories", blurb: "The finishing touch.", sortOrder: 3, subcategories: ["Shop All Accessories", "Bags", "Jewellery"] },
  { slug: "brand-collection", label: "Brand Collection", blurb: "Curated edits for every story.", sortOrder: 4, subcategories: ["The Signature Edit", "The Indian Edit", "The Occasion Edit"] },
];

async function main() {
  const db = getDb();

  console.log("Seeding categories…");
  for (const cat of DEFAULT_CATEGORIES) {
    await db
      .insert(categoriesTable)
      .values(cat)
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: { label: cat.label, blurb: cat.blurb, sortOrder: cat.sortOrder, subcategories: cat.subcategories },
      });
  }

  console.log(`Seeding ${products.length} products…`);

  for (const p of products) {
    const values = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      collection: p.collection,
      price: p.price,
      currency: p.currency,
      description: p.description,
      rating: p.rating,
      reviews: p.reviews,
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      materials: p.materials,
      details: p.details,
      care: p.care,
      shipping: p.shipping,
      isNew: p.isNew ?? false,
      isBestSeller: p.isBestSeller ?? false,
    };
    const { id: _id, ...updatable } = values;
    void _id;
    await db
      .insert(productsTable)
      .values(values)
      .onConflictDoUpdate({
        target: productsTable.id,
        set: { ...updatable, updatedAt: new Date() },
      });

    // One variant per size × colour (or a single default variant).
    const sizes = p.sizes?.length ? p.sizes : [null];
    const colors = p.colors?.length ? p.colors : [null];
    const variants = sizes.flatMap((size) =>
      colors.map((color) => ({
        productId: p.id,
        sku: [p.id.replace(/^p-/, "").toUpperCase(), size && skuPart(size), color && skuPart(color)]
          .filter(Boolean)
          .join("-"),
        size,
        color,
        stock: DEFAULT_STOCK,
      })),
    );
    await db
      .insert(productVariants)
      .values(variants)
      .onConflictDoNothing({ target: productVariants.sku });
  }

  console.log(`Seeding ${collections.length} collections…`);
  for (const [i, c] of collections.entries()) {
    const values = {
      id: c.id,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      heroImage: c.heroImage,
      sortOrder: i,
    };
    const { id: _id, ...updatable } = values;
    void _id;
    await db
      .insert(collectionsTable)
      .values(values)
      .onConflictDoUpdate({ target: collectionsTable.id, set: updatable });

    await db
      .insert(collectionProducts)
      .values(
        c.products.map((productId, order) => ({
          collectionId: c.id,
          productId,
          sortOrder: order,
        })),
      )
      .onConflictDoNothing();
  }

  console.log("✓ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
