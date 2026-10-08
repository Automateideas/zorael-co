import { getProductsByIds } from "./catalog";
import { paymentConfig } from "./payments/config";

export type CartLineInput = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

export type PricedLine = {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  color?: string;
  lineTotal: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  /** Total in the smallest unit (paise) for gateways. */
  totalMinor: number;
};

/**
 * Recompute the cart from the trusted server-side catalog. Client-supplied
 * prices are ignored — only product ids and quantities are trusted. This is the
 * single source of truth for what a customer is charged.
 */
export async function priceCart(items: CartLineInput[]): Promise<PricedCart> {
  const { currency, shippingFee, freeShippingThreshold } = paymentConfig.store;

  const catalog = await getProductsByIds([
    ...new Set(items.map((i) => i.productId)),
  ]);

  const lines: PricedLine[] = [];
  for (const item of items) {
    const product = catalog.find((p) => p.id === item.productId);
    if (!product) continue;
    const quantity = Math.max(1, Math.min(99, Math.floor(item.quantity) || 1));
    const lineTotal = product.price * quantity;
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity,
      size: item.size,
      color: item.color,
      lineTotal,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping =
    subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  return {
    lines,
    subtotal,
    shipping,
    total,
    currency,
    totalMinor: Math.round(total * 100),
  };
}
