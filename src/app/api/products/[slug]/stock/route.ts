import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog";
import { getProductStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/:slug/stock
 *
 * Returns variant-level stock for a product. The client uses this to show
 * "Out of Stock" / "Only X left" per size×colour combination.
 *
 * Response shape:
 * {
 *   productId: string,
 *   variants: [{ size, color, stock, inStock, lowStock }]
 * }
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const variants = await getProductStock(product.id);

  return NextResponse.json({
    productId: product.id,
    variants: variants.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock,
      inStock: v.inStock,
      lowStock: v.lowStock,
    })),
  });
}
