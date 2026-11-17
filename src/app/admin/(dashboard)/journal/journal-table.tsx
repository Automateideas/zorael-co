"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Newspaper, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteJournalPost, toggleJournalPublished } from "./actions";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  isPublished: boolean;
  sortOrder: number;
  publishedAt: string;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JournalTable({ posts }: { posts: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const flip = (id: string, next: boolean) =>
    startTransition(async () => {
      await toggleJournalPublished(id, next);
      router.refresh();
    });

  const remove = (id: string, title: string) =>
    startTransition(async () => {
      if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
      await deleteJournalPost(id);
      router.refresh();
    });

  if (posts.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border bg-white py-16 text-center">
        <Newspaper className="mx-auto size-8 text-charcoal/20" strokeWidth={1.25} />
        <p className="mt-3 text-sm text-charcoal/55">
          No posts yet. The site is showing the built-in stories until you add
          one.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-charcoal/45">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/journal/${p.id}`}
                  className="font-medium text-charcoal transition-colors hover:text-muted-gold"
                >
                  {p.title}
                </Link>
                <p className="mt-0.5 text-xs text-charcoal/45">/{p.slug}</p>
              </td>
              <td className="px-4 py-3 text-charcoal/70">{p.category || "—"}</td>
              <td className="px-4 py-3 text-xs text-charcoal/55">
                {fmt(p.publishedAt)}
              </td>
              <td className="px-4 py-3 text-charcoal/55">{p.sortOrder}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => flip(p.id, !p.isPublished)}
                  disabled={pending}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    p.isPublished
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  )}
                >
                  {p.isPublished ? "Published" : "Draft"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <a
                    href={`/journal/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${p.title}`}
                    className="flex size-7 items-center justify-center rounded-full border border-border text-charcoal/50 transition-colors hover:border-charcoal/40 hover:text-charcoal"
                  >
                    <ExternalLink className="size-3.5" strokeWidth={1.5} />
                  </a>
                  <Link
                    href={`/admin/journal/${p.id}`}
                    className="rounded-full border border-border px-3 py-1 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(p.id, p.title)}
                    disabled={pending}
                    aria-label={`Delete ${p.title}`}
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
