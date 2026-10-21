"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { coupons } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

export type CouponFormData = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  maxRedemptions?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  newCustomersOnly: boolean;
  isActive: boolean;
};

export async function getCoupons() {
  await requireAdmin();
  const db = getDb();
  return db.select().from(coupons).orderBy(coupons.code);
}

export async function saveCoupon(data: CouponFormData) {
  await requireAdmin();
  const db = getDb();

  const code = data.code.trim().toUpperCase();
  if (!code) throw new Error("Enter a coupon code.");
  if (data.type === "percent" && (data.value <= 0 || data.value > 100)) {
    throw new Error("Percentage must be between 1 and 100.");
  }
  if (data.value <= 0) throw new Error("Enter a discount value above zero.");

  const row = {
    code,
    type: data.type,
    value: Math.round(data.value),
    minSubtotal: Math.max(0, Math.round(data.minSubtotal || 0)),
    maxDiscount: data.maxDiscount ? Math.round(data.maxDiscount) : null,
    maxRedemptions: data.maxRedemptions ? Math.round(data.maxRedemptions) : null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    newCustomersOnly: data.newCustomersOnly,
    isActive: data.isActive,
  };

  const [existing] = await db
    .select({ code: coupons.code })
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);

  if (existing) {
    // `redeemed` is deliberately left alone so edits never reset usage.
    await db.update(coupons).set(row).where(eq(coupons.code, code));
  } else {
    await db.insert(coupons).values(row);
  }

  return { code };
}

/** The on/off switch the admin uses — no redeploy needed. */
export async function toggleCoupon(code: string, isActive: boolean) {
  await requireAdmin();
  const db = getDb();
  await db.update(coupons).set({ isActive }).where(eq(coupons.code, code));
}

export async function deleteCoupon(code: string) {
  await requireAdmin();
  const db = getDb();
  await db.delete(coupons).where(eq(coupons.code, code));
}
