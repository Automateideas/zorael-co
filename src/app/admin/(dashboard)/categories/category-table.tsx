"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteCategory, toggleCategoryPublished } from "../actions";

type AdminCategory = {
  slug: string;
  label: string;
  blurb: string;
  sortOrder: number;
  subcategories: string[];
  isPublished: boolean;
  productCount: number;
};

export function CategoryTable({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (slug: string, label: string) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeleting(slug);
    setError(null);
    try {
      await deleteCategory(slug);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category");
    }
    setDeleting(null);
  };

  const handleToggle = async (slug: string, current: boolean) => {
    await toggleCategoryPublished(slug, !current);
    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <div className="mt-16 text-center">
        <p className="text-sm text-charcoal/50">No categories yet.</p>
        <Link
          href="/admin/categories/new"
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          Add your first category
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="text-xs text-charcoal/40">
        {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40">
                Category
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40 sm:table-cell">
                Slug
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40">
                Products
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40 sm:table-cell">
                Subcategories
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40 sm:table-cell">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-charcoal/40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {categories.map((cat) => (
              <tr
                key={cat.slug}
                className={cn(
                  "group transition-colors hover:bg-cream/40",
                  deleting === cat.slug && "pointer-events-none opacity-40",
                )}
              >
                <td className="px-3 py-3 text-charcoal/20">
                  <GripVertical className="size-4" strokeWidth={1.5} />
                </td>

                <td className="px-4 py-3">
                  <Link
                    href={`/admin/categories/${cat.slug}`}
                    className="font-medium text-charcoal group-hover:underline"
                  >
                    {cat.label}
                  </Link>
                  <p className="mt-0.5 text-xs text-charcoal/40">{cat.blurb}</p>
                </td>

                <td className="hidden px-4 py-3 sm:table-cell">
                  <code className="rounded bg-cream px-2 py-0.5 text-xs text-charcoal/60">
                    {cat.slug}
                  </code>
                </td>

                <td className="px-4 py-3 tabular-nums text-charcoal/70">
                  {cat.productCount}
                </td>

                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-xs text-charcoal/50">
                    {cat.subcategories.length > 0
                      ? cat.subcategories.filter((s) => s !== "All").join(", ")
                      : "—"}
                  </span>
                </td>

                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs",
                      cat.isPublished
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-charcoal/5 text-charcoal/40",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        cat.isPublished ? "bg-emerald-500" : "bg-charcoal/25",
                      )}
                    />
                    {cat.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/categories/${cat.slug}`}
                      className="rounded-md p-2 text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
                      title="Edit"
                    >
                      <Pencil className="size-4" strokeWidth={1.5} />
                    </Link>
                    <button
                      onClick={() => handleToggle(cat.slug, cat.isPublished)}
                      className="rounded-md p-2 text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
                      title={cat.isPublished ? "Unpublish" : "Publish"}
                    >
                      {cat.isPublished ? (
                        <EyeOff className="size-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="size-4" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.slug, cat.label)}
                      disabled={deleting === cat.slug}
                      className="rounded-md p-2 text-charcoal/40 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
