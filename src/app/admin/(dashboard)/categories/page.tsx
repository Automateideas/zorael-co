import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllCategoriesAdmin } from "../actions";
import { CategoryTable } from "./category-table";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-charcoal">
            Categories
          </h1>
          <p className="mt-1 text-sm text-charcoal/50">
            Manage product categories for your store.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          New Category
        </Link>
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}
