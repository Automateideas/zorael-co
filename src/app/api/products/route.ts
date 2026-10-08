import { NextResponse } from "next/server";
import {
  getAllProducts,
  getProductsByCategory,
  getProductsByIds,
  searchProducts,
} from "@/lib/catalog";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 *   ?category=clothes|jewelry|hand-bags
 *   ?q=<search term>
 *   ?ids=<comma-separated product ids>
 * Read-only catalog endpoint backing the storefront.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const ids = searchParams.get("ids");

  let list: Product[];
  if (q) {
    list = await searchProducts(q.slice(0, 100));
  } else if (ids) {
    list = await getProductsByIds(ids.split(",").filter(Boolean).slice(0, 100));
  } else if (
    category === "clothes" ||
    category === "jewelry" ||
    category === "hand-bags"
  ) {
    list = await getProductsByCategory(category);
  } else {
    list = await getAllProducts();
  }

  return NextResponse.json({
    count: list.length,
    products: list,
  });
}
