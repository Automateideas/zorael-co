"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/client";
import { addresses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type AddressFormData = {
  id?: number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

export async function getAddresses() {
  const session = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.userId))
    .orderBy(addresses.createdAt);
}

export async function saveAddress(data: AddressFormData) {
  const session = await requireUser();
  const db = getDb();

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, session.userId));
  }

  if (data.id) {
    await db
      .update(addresses)
      .set({
        label: data.label || null,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        isDefault: data.isDefault,
      })
      .where(
        and(eq(addresses.id, data.id), eq(addresses.userId, session.userId)),
      );
  } else {
    await db.insert(addresses).values({
      userId: session.userId,
      label: data.label || null,
      fullName: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      isDefault: data.isDefault,
    });
  }

  revalidatePath("/account/addresses");
}

export async function deleteAddress(id: number) {
  const session = await requireUser();
  const db = getDb();
  await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.userId)));
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: number) {
  const session = await requireUser();
  const db = getDb();
  await db
    .update(addresses)
    .set({ isDefault: false })
    .where(eq(addresses.userId, session.userId));
  await db
    .update(addresses)
    .set({ isDefault: true })
    .where(and(eq(addresses.id, id), eq(addresses.userId, session.userId)));
  revalidatePath("/account/addresses");
}
