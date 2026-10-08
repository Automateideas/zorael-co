/**
 * Inventory management — stock queries, validation, and atomic decrement.
 *
 * Server-only. All stock operations go through this module so business rules
 * (low-stock thresholds, max-per-order limits) live in one place.
 */
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { productVariants } from "@/db/schema";

export const LOW_STOCK_THRESHOLD = 5;
export const MAX_QTY_PER_LINE = 10;

export type VariantStock = {
  variantId: number;
  productId: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  inStock: boolean;
  lowStock: boolean;
};

/**
 * Get stock for every variant of a product.
 */
export async function getProductStock(
  productId: string,
): Promise<VariantStock[]> {
  if (!hasDatabase()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return rows.map((r) => ({
    variantId: r.id,
    productId: r.productId,
    sku: r.sku,
    size: r.size,
    color: r.color,
    stock: r.stock,
    inStock: r.stock > 0,
    lowStock: r.stock > 0 && r.stock <= LOW_STOCK_THRESHOLD,
  }));
}

/**
 * Find the variant that matches a product + size + color.
 * Returns null when no variant exists or no database is configured.
 */
export async function findVariant(
  productId: string,
  size: string | null | undefined,
  color: string | null | undefined,
): Promise<VariantStock | null> {
  if (!hasDatabase()) return null;
  const db = getDb();

  const conditions = [eq(productVariants.productId, productId)];
  if (size) {
    conditions.push(eq(productVariants.size, size));
  } else {
    conditions.push(sql`${productVariants.size} IS NULL`);
  }
  if (color) {
    conditions.push(eq(productVariants.color, color));
  } else {
    conditions.push(sql`${productVariants.color} IS NULL`);
  }

  const [row] = await db
    .select()
    .from(productVariants)
    .where(and(...conditions))
    .limit(1);

  if (!row) return null;

  return {
    variantId: row.id,
    productId: row.productId,
    sku: row.sku,
    size: row.size,
    color: row.color,
    stock: row.stock,
    inStock: row.stock > 0,
    lowStock: row.stock > 0 && row.stock <= LOW_STOCK_THRESHOLD,
  };
}

/**
 * Check whether a product is completely out of stock (all variants).
 */
export async function isProductOutOfStock(
  productId: string,
): Promise<boolean> {
  if (!hasDatabase()) return false; // Assume in-stock when no DB
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${productVariants.stock}), 0)` })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  return (row?.total ?? 0) <= 0;
}

export type StockValidationResult = {
  valid: boolean;
  errors: StockError[];
};

export type StockError = {
  productId: string;
  size?: string;
  color?: string;
  requested: number;
  available: number;
  reason: "out_of_stock" | "insufficient_stock" | "variant_not_found" | "exceeds_limit";
};

/**
 * Validate that every line in a cart can be fulfilled.
 * Does NOT decrement stock — call `decrementStock` after payment succeeds.
 */
export async function validateStock(
  lines: {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }[],
): Promise<StockValidationResult> {
  if (!hasDatabase()) return { valid: true, errors: [] };

  const errors: StockError[] = [];

  for (const line of lines) {
    if (line.quantity > MAX_QTY_PER_LINE) {
      errors.push({
        productId: line.productId,
        size: line.size,
        color: line.color,
        requested: line.quantity,
        available: MAX_QTY_PER_LINE,
        reason: "exceeds_limit",
      });
      continue;
    }

    const variant = await findVariant(
      line.productId,
      line.size ?? null,
      line.color ?? null,
    );

    if (!variant) {
      errors.push({
        productId: line.productId,
        size: line.size,
        color: line.color,
        requested: line.quantity,
        available: 0,
        reason: "variant_not_found",
      });
      continue;
    }

    if (variant.stock <= 0) {
      errors.push({
        productId: line.productId,
        size: line.size,
        color: line.color,
        requested: line.quantity,
        available: 0,
        reason: "out_of_stock",
      });
    } else if (variant.stock < line.quantity) {
      errors.push({
        productId: line.productId,
        size: line.size,
        color: line.color,
        requested: line.quantity,
        available: variant.stock,
        reason: "insufficient_stock",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Atomically decrement stock for each line item. Uses `stock > 0` guards
 * so we never go negative. Returns false if any line couldn't be fulfilled
 * (race condition — someone else bought the last one).
 *
 * Call this ONLY after payment is confirmed (webhook or verified redirect).
 */
export async function decrementStock(
  lines: {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }[],
): Promise<{ success: boolean; failedLines: typeof lines }> {
  if (!hasDatabase()) return { success: true, failedLines: [] };

  const db = getDb();
  const failedLines: typeof lines = [];

  await db.transaction(async (tx) => {
    for (const line of lines) {
      const conditions = [
        eq(productVariants.productId, line.productId),
        gt(productVariants.stock, 0),
      ];
      if (line.size) {
        conditions.push(eq(productVariants.size, line.size));
      } else {
        conditions.push(sql`${productVariants.size} IS NULL`);
      }
      if (line.color) {
        conditions.push(eq(productVariants.color, line.color));
      } else {
        conditions.push(sql`${productVariants.color} IS NULL`);
      }

      // Decrement one at a time, `quantity` times, each guarded by stock > 0.
      // For small order quantities (≤10) this is simple and safe.
      let decremented = 0;
      for (let i = 0; i < line.quantity; i++) {
        const result = await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - 1` })
          .where(and(...conditions));

        // Drizzle returns the rows affected count differently per driver.
        // With postgres.js the result has a `count` or `rowCount` property.
        const affected =
          (result as unknown as { rowCount?: number }).rowCount ??
          (result as unknown as { count?: number }).count ??
          1;
        if (affected > 0) {
          decremented++;
        } else {
          break;
        }
      }

      if (decremented < line.quantity) {
        failedLines.push(line);
      }
    }
  });

  return { success: failedLines.length === 0, failedLines };
}

/**
 * Restore stock (e.g. after a cancelled or refunded order).
 */
export async function restoreStock(
  lines: {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }[],
): Promise<void> {
  if (!hasDatabase()) return;
  const db = getDb();

  for (const line of lines) {
    const conditions = [eq(productVariants.productId, line.productId)];
    if (line.size) {
      conditions.push(eq(productVariants.size, line.size));
    } else {
      conditions.push(sql`${productVariants.size} IS NULL`);
    }
    if (line.color) {
      conditions.push(eq(productVariants.color, line.color));
    } else {
      conditions.push(sql`${productVariants.color} IS NULL`);
    }

    await db
      .update(productVariants)
      .set({ stock: sql`${productVariants.stock} + ${line.quantity}` })
      .where(and(...conditions));
  }
}
