"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteCollection, toggleCollectionPublished } from "./actions";

type Row = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  sortOrder: number;
  isPublished: boolean;
  productCount: number;
};

export function CollectionTable({ collections }: { collections: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const flip = (id: string, next: boolean) =>
    startTransition(async () => {
      await toggleCollectionPublished(id, next);
      router.refresh();
    });

  const remove = (id: string, name: string) =>
    startTransition(async () => {
      if (!confirm(`Delete "${name}"? Products are not deleted.`)) return;
      await deleteCollection(id);
      router.refresh();
    });

  if (collections.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border bg-white py-16 text-center">
        <Layers className="mx-auto size-8 text-charcoal/20" strokeWidth={1.25} />
        <p className="mt-3 text-sm text-charcoal/55">No collections yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-charcoal/45">
          <tr>
            <th className="px-4 py-3 font-medium">Collection</th>
            <th className="px-4 py-3 font-medium">URL</th>
            <th className="px-4 py-3 font-medium">Products</th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {collections.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/collections/${c.id}`}
                  className="font-medium text-charcoal transition-colors hover:text-muted-gold"
                >
                  {c.name}
                </Link>
                {c.tagline && (
                  <p className="mt-0.5 text-xs text-charcoal/45">{c.tagline}</p>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-charcoal/55">/{c.slug}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "text-charcoal/70",
                    c.productCount === 0 && "text-amber-600",
                  )}
                >
                  {c.productCount}
                </span>
              </td>
              <td className="px-4 py-3 text-charcoal/55">{c.sortOrder}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => flip(c.id, !c.isPublished)}
                  disabled={pending}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    c.isPublished
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  )}
                >
                  {c.isPublished ? "Published" : "Draft"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/collections/${c.id}`}
                    className="rounded-full border border-border px-3 py-1 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(c.id, c.name)}
                    disabled={pending}
                    aria-label={`Delete ${c.name}`}
                    className="flex size-7 items-center justify-center rounded-full border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
