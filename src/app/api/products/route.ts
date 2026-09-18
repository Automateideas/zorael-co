import { NextResponse } from "next/server";
import {
  products,
  getProductsByCategory,
  searchProducts,
} from "@/lib/products";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 *   ?category=clothes|jewelry|hand-bags
 *   ?q=<search term>
 * Read-only catalog endpoint backing the storefront.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  let list: Product[] = products;
  if (q) {
    list = searchProducts(q);
  } else if (
    category === "clothes" ||
    category === "jewelry" ||
    category === "hand-bags"
  ) {
    list = getProductsByCategory(category);
  }

  return NextResponse.json({
    count: list.length,
    products: list.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      currency: p.currency,
      image: p.images[0],
      isNew: p.isNew ?? false,
    })),
  });
}
