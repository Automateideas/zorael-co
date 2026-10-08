"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { deleteProduct, togglePublished, updateProductStock } from "../actions";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  isPublished: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  totalStock: number;
};

export function ProductTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = products.filter((p) => {
    const matchesText =
      !filter ||
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.category.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesText && matchesCategory;
  });

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await deleteProduct(id);
    router.refresh();
    setDeleting(null);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await togglePublished(id, !current);
    router.refresh();
  };

  if (products.length === 0) {
    return (
      <div className="mt-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream">
          <ShoppingBag className="size-7 text-charcoal/30" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm text-charcoal/50">No products yet.</p>
        <Link
          href="/admin/products/new"
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-black"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30"
            strokeWidth={1.5}
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search products…"
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none sm:w-64"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                categoryFilter === cat
                  ? "bg-charcoal text-ivory"
                  : "bg-white text-charcoal/60 hover:bg-cream hover:text-charcoal",
              )}
            >
              {cat === "all" ? "All" : cat.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="mt-4 text-xs text-charcoal/40">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        {filter || categoryFilter !== "all" ? " matching" : ""}
      </p>

      {/* Table */}
      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40">
                Product
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40 md:table-cell">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40">
                Price
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal/40">
                Stock
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
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  "group transition-colors hover:bg-cream/40",
                  deleting === p.id && "pointer-events-none opacity-40",
                )}
              >
                {/* Product name + image */}
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-3"
                  >
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="size-11 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-lg bg-cream text-charcoal/20">
                        <ImageIcon />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-charcoal group-hover:underline">
                        {p.name}
                      </span>
                      <div className="mt-0.5 flex gap-1.5">
                        {p.isNew && (
                          <span className="rounded bg-blue-50 px-1.5 py-px text-[10px] text-blue-600">
                            New
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="rounded bg-amber-50 px-1.5 py-px text-[10px] text-amber-600">
                            Best Seller
                          </span>
                        )}
                        <span className="text-[10px] capitalize text-charcoal/40 md:hidden">
                          {p.category.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </td>

                {/* Category */}
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs capitalize text-charcoal/60">
                    {p.category.replace("-", " ")}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3 tabular-nums text-charcoal">
                  {formatPrice(p.price)}
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 tabular-nums",
                      p.totalStock === 0 && "font-medium text-red-600",
                      p.totalStock > 0 &&
                        p.totalStock <= 10 &&
                        "text-amber-600",
                      p.totalStock > 10 && "text-charcoal/70",
                    )}
                  >
                    {p.totalStock === 0 ? "Out of stock" : p.totalStock}
                  </span>
                </td>

                {/* Status */}
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs",
                      p.isPublished
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-charcoal/5 text-charcoal/40",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        p.isPublished ? "bg-emerald-500" : "bg-charcoal/25",
                      )}
                    />
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="rounded-md p-2 text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
                      title="Edit"
                    >
                      <Pencil className="size-4" strokeWidth={1.5} />
                    </Link>
                    <button
                      onClick={() => handleToggle(p.id, p.isPublished)}
                      className="rounded-md p-2 text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
                      title={p.isPublished ? "Unpublish" : "Publish"}
                    >
                      {p.isPublished ? (
                        <EyeOff className="size-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="size-4" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deleting === p.id}
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

function ImageIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 21h18a1.5 1.5 0 0 0 1.5-1.5V4.5A1.5 1.5 0 0 0 21 3H3a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 3 21Z"
      />
    </svg>
  );
}

function ShoppingBag({
  className,
  strokeWidth,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}
