"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Images, Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePicker } from "../storage/image-picker";
import { saveCollection, type CollectionFormData } from "./actions";

type ProductOption = {
  id: string;
  name: string;
  category: string;
  image: string;
  isPublished: boolean;
};

type Existing = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  sortOrder: number;
  isPublished: boolean;
  productIds: string[];
};

export function CollectionEditor({
  collection,
  productOptions,
}: {
  collection?: Existing;
  productOptions: ProductOption[];
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();

  const [name, setName] = useState(collection?.name ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [tagline, setTagline] = useState(collection?.tagline ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [heroImage, setHeroImage] = useState(collection?.heroImage ?? "");
  const [sortOrder, setSortOrder] = useState(collection?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState(collection?.isPublished ?? true);
  const [selected, setSelected] = useState<string[]>(collection?.productIds ?? []);

  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleProduct = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const visible = productOptions.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const save = () => {
    setError(null);
    startSaving(async () => {
      try {
        const data: CollectionFormData = {
          id: collection?.id,
          slug,
          name,
          tagline,
          description,
          heroImage,
          sortOrder,
          isPublished,
          productIds: selected,
        };
        await saveCollection(data);
        router.push("/admin/collections");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  };

  return (
    <div>
      <Link
        href="/admin/collections"
        className="inline-flex items-center gap-1.5 text-xs text-charcoal/50 transition-colors hover:text-charcoal"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        All Collections
      </Link>

      <h1 className="mt-2 font-serif text-2xl tracking-tight text-charcoal">
        {collection ? "Edit Collection" : "New Collection"}
      </h1>

      <div className="mt-6 space-y-6">
        {/* Details */}
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
            Details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Bridal Edit"
                className={input}
              />
            </Field>
            <Field label="URL slug">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Leave blank to use the name"
                className={input}
              />
            </Field>
            <Field label="Tagline" className="sm:col-span-2">
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="For the moments that matter"
                className={input}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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

        {/* Hero image */}
        <section className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
            Hero Image
          </h2>
          <div className="mt-4 flex items-start gap-3">
            {heroImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt=""
                  className="size-28 rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setHeroImage("")}
                  aria-label="Remove hero image"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-charcoal/85 text-ivory transition-colors hover:bg-red-600"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex size-28 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-charcoal/40 transition-colors hover:border-charcoal/40 hover:text-charcoal/60"
              >
                <Images className="size-5" strokeWidth={1.5} />
                <span className="text-[10px]">Choose</span>
              </button>
            )}
          </div>
        </section>

        {/* Products */}
        <section className="rounded-lg border border-border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
              Products
            </h2>
            <span className="text-xs text-charcoal/50">
              {selected.length} selected
            </span>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className={cn(input, "mt-4")}
          />

          {visible.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal/50">No products match.</p>
          ) : (
            <div className="mt-4 grid max-h-96 gap-2 overflow-auto sm:grid-cols-2">
              {visible.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                      on
                        ? "border-charcoal bg-cream"
                        : "border-border hover:border-charcoal/30",
                    )}
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded bg-cream">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-charcoal">
                        {p.name}
                      </span>
                      <span className="block text-xs text-charcoal/45">
                        {p.category}
                        {!p.isPublished && " · draft"}
                      </span>
                    </span>
                    {on && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-charcoal text-ivory">
                        <Check className="size-3" strokeWidth={2} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/collections"
            className="flex h-11 items-center rounded-full border border-border px-6 text-sm text-charcoal transition-colors hover:border-charcoal/40"
          >
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <>
                <Save className="size-4" strokeWidth={1.5} />
                Save Collection
              </>
            )}
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ImagePicker
          alreadyAdded={heroImage ? [heroImage] : []}
          onClose={() => setPickerOpen(false)}
          onConfirm={(urls) => {
            if (urls[0]) setHeroImage(urls[0]);
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
