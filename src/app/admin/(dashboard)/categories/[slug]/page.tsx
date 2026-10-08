import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories } from "@/db/schema";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { CategoryEditor } from "../category-editor";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }

  const { slug } = await params;

  const db = getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!row) redirect("/admin/categories");

  return (
    <CategoryEditor
      category={{
        slug: row.slug,
        label: row.label,
        blurb: row.blurb,
        sortOrder: row.sortOrder,
        subcategories: row.subcategories,
        isPublished: row.isPublished,
      }}
    />
  );
}
