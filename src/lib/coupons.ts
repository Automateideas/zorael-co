/**
 * Coupon validation. Server-only — the client may suggest a code, but the
 * discount is always recomputed here before an order or payment is created.
 */
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/client";
import { coupons, orders } from "@/db/schema";

export type CouponCheck =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; reason: string };

/** Order states that mean the customer has genuinely bought before. */
const SUCCESSFUL_STATUSES = [
  "paid",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
] as const;

/**
 * A customer counts as new when no previous order of theirs reached a
 * successful state. Matched on account id when signed in, otherwise phone,
 * since guest checkout has no user id.
 */
export async function isNewCustomer(identity: {
  userId?: string;
  phone?: string;
}): Promise<boolean> {
  if (!identity.userId && !identity.phone) return true;

  const db = getDb();
  const conditions = [];
  if (identity.userId) conditions.push(eq(orders.userId, identity.userId));
  if (identity.phone) {
    conditions.push(sql`${orders.customer}->>'phone' = ${identity.phone}`);
  }

  const [previous] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        or(...conditions),
        inArray(orders.status, [...SUCCESSFUL_STATUSES]),
      ),
    )
    .limit(1);

  return !previous;
}

/** Rounds to whole rupees so the stored total always matches what is charged. */
function computeDiscount(
  type: "percent" | "fixed",
  value: number,
  subtotal: number,
  maxDiscount: number | null,
): number {
  const raw = type === "percent" ? (subtotal * value) / 100 : value;
  const capped = maxDiscount != null ? Math.min(raw, maxDiscount) : raw;
  // Never discount more than the order is worth.
  return Math.max(0, Math.min(Math.round(capped), subtotal));
}

/**
 * Validates a code against the live rules and returns the discount in major
 * units. Every failure returns a customer-safe reason.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  identity: { userId?: string; phone?: string } = {},
): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a coupon code." };
  if (!hasDatabase()) {
    return { ok: false, reason: "Coupons are unavailable right now." };
  }

  const db = getDb();
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);

  if (!coupon) return { ok: false, reason: "This coupon code is not valid." };
  if (!coupon.isActive) {
    return { ok: false, reason: "This coupon is no longer available." };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, reason: "This coupon is not active yet." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, reason: "This coupon has expired." };
  }
  if (
    coupon.maxRedemptions != null &&
    coupon.redeemed >= coupon.maxRedemptions
  ) {
    return { ok: false, reason: "This coupon has been fully redeemed." };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `Spend ₹${coupon.minSubtotal.toLocaleString("en-IN")} or more to use this coupon.`,
    };
  }
  if (coupon.newCustomersOnly && !(await isNewCustomer(identity))) {
    return { ok: false, reason: "This coupon is for first-time orders only." };
  }

  const discount = computeDiscount(
    coupon.type,
    coupon.value,
    subtotal,
    coupon.maxDiscount,
  );
  if (discount <= 0) {
    return { ok: false, reason: "This coupon does not apply to your bag." };
  }

  return {
    ok: true,
    code: coupon.code,
    discount,
    label:
      coupon.type === "percent"
        ? `${coupon.value}% off`
        : `₹${coupon.value.toLocaleString("en-IN")} off`,
  };
}

/** Called once an order is actually created, never on a preview check. */
export async function recordRedemption(code: string) {
  const db = getDb();
  await db
    .update(coupons)
    .set({ redeemed: sql`${coupons.redeemed} + 1` })
    .where(eq(coupons.code, code));
}
