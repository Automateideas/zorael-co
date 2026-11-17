"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Images, Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePicker } from "../storage/image-picker";
import { saveJournalPost, type JournalFormData } from "./actions";

type Existing = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  coverImage: string;
  body: string[];
  isPublished: boolean;
  sortOrder: number;
  publishedAt: string; // yyyy-mm-dd
};

const today = () => new Date().toISOString().slice(0, 10);

export function JournalEditor({ post }: { post?: Existing }) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [readingTime, setReadingTime] = useState(post?.readingTime ?? "");
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ?? today());
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [bodyText, setBodyText] = useState((post?.body ?? []).join("\n\n"));
  const [sortOrder, setSortOrder] = useState(post?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? true);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    startSaving(async () => {
      try {
        const body = bodyText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        const data: JournalFormData = {
          id: post?.id,
          slug,
          title,
          excerpt,
          category,
          readingTime,
          coverImage,
          body,
          isPublished,
          sortOrder,
          publishedAt,
        };
        await saveJournalPost(data);
        router.push("/admin/journal");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  };

  return (
    <div>
      <Link
        href="/admin/journal"
        className="inline-flex items-center gap-1.5 text-xs text-charcoal/50 transition-colors hover:text-charcoal"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        All Posts
      </Link>

      <h1 className="mt-2 font-serif text-2xl tracking-tight text-charcoal">
        {post ? "Edit Post" : "New Post"}
      </h1>

      <div className="mt-6 space-y-6">
        {/* Details */}
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
            Details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Title *" className="sm:col-span-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Art of Quiet Luxury"
                className={input}
              />
            </Field>
            <Field label="URL slug">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Leave blank to use the title"
                className={input}
              />
            </Field>
            <Field label="Category">
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Philosophy"
                className={input}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={input}
              />
            </Field>
            <Field label="Reading time">
              <input
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                placeholder="5 min read"
                className={input}
              />
            </Field>
            <Field label="Excerpt" className="sm:col-span-2">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A one-line summary shown on the Journal index."
                className={cn(input, "h-auto py-2.5")}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={input}
              />
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="size-4 accent-charcoal"
                />
                Published
              </label>
            </div>
          </div>
        </section>

        {/* Cover image */}
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
            Cover Image
          </h2>
          <div className="mt-4 flex items-start gap-3">
            {coverImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt=""
                  className="h-28 w-44 rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  aria-label="Remove cover image"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-charcoal/85 text-ivory transition-colors hover:bg-red-600"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex h-28 w-44 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-charcoal/40 transition-colors hover:border-charcoal/40 hover:text-charcoal/60"
              >
                <Images className="size-5" strokeWidth={1.5} />
                <span className="text-[10px]">Choose</span>
              </button>
            )}
          </div>
        </section>

        {/* Body */}
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
            Body
          </h2>
          <p className="mt-1 text-xs text-charcoal/45">
            Separate paragraphs with a blank line.
          </p>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={14}
            placeholder={"First paragraph…\n\nSecond paragraph…"}
            className={cn(input, "mt-4 h-auto py-3 leading-relaxed")}
          />
        </section>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/journal"
            className="flex h-11 items-center rounded-full border border-border px-6 text-sm text-charcoal transition-colors hover:border-charcoal/40"
          >
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <>
                <Save className="size-4" strokeWidth={1.5} />
                Save Post
              </>
            )}
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ImagePicker
          alreadyAdded={coverImage ? [coverImage] : []}
          single
          onClose={() => setPickerOpen(false)}
          onConfirm={(urls) => {
            if (urls[0]) setCoverImage(urls[0]);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

const input =
  "h-11 w-full rounded-lg border border-border bg-ivory px-3.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs text-charcoal/50">{label}</span>
      {children}
    </label>
  );
}
