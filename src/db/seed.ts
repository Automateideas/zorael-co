/**
 * Seed the catalog into Postgres from the code source of truth
 * (`src/lib/products.ts`). Run with:  npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "./client";
import { products as productsTable } from "./schema";
import { products } from "../lib/products";

async function main() {
  const db = getDb();
  console.log(`Seeding ${products.length} products…`);

  for (const p of products) {
    await db
      .insert(productsTable)
      .values({
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
      })
      .onConflictDoUpdate({
        target: productsTable.id,
        set: {
          name: p.name,
          price: p.price,
          images: p.images,
          isNew: p.isNew ?? false,
          isBestSeller: p.isBestSeller ?? false,
        },
      });
  }

  console.log("✓ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
