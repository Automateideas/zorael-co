"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { saveCategory, type CategoryFormData } from "../actions";

type CategoryRow = {
  slug: string;
  label: string;
  blurb: string;
  sortOrder: number;
  subcategories: string[];
  isPublished: boolean;
};

export function CategoryEditor({ category }: { category?: CategoryRow }) {
  const router = useRouter();
  const isNew = !category;

  const [label, setLabel] = useState(category?.label ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [blurb, setBlurb] = useState(category?.blurb ?? "");
  const [sortOrder, setSortOrder] = useState(
    category?.sortOrder?.toString() ?? "0",
  );
  const [subcategories, setSubcategories] = useState<string[]>(
    category?.subcategories ?? [],
  );
  const [isPublished, setIsPublished] = useState(category?.isPublished ?? true);
  const [newSub, setNewSub] = useState("");

  const [saving, setSaving] = useState(false);

  const slugify = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (isNew) setSlug(slugify(val));
  };

  const addSubcategory = () => {
    const trimmed = newSub.trim();
    if (trimmed && !subcategories.includes(trimmed)) {
      setSubcategories([...subcategories, trimmed]);
    }
    setNewSub("");
  };

  const removeSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter((s) => s !== sub));
  };

  const handleSave = async () => {
    if (!label.trim() || !slug.trim()) return;
    setSaving(true);

    const data: CategoryFormData = {
      slug,
      label: label.trim(),
      blurb: blurb.trim(),
      sortOrder: parseInt(sortOrder) || 0,
      subcategories: subcategories.length > 0 ? ["All", ...subcategories.filter((s) => s !== "All")] : [],
      isPublished,
      isNew,
    };

    await saveCategory(data);
    router.push("/admin/categories");
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="rounded-md p-1.5 text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
        >
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-charcoal">
          {isNew ? "New Category" : `Edit: ${category.label}`}
        </h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Basic info */}
        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-charcoal/50">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">
                Label
              </label>
              <input
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Clothes"
                className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. clothes"
                disabled={!isNew}
                className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none disabled:bg-cream/50 disabled:text-charcoal/40"
              />
              {!isNew && (
                <p className="mt-1 text-xs text-charcoal/40">
                  Slug cannot be changed after creation.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">
                Blurb
              </label>
              <input
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="Short description for the shop page"
                className="h-9 w-full rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal/70">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-9 w-24 rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-charcoal/50">
            Subcategories
          </h2>
          <p className="mb-3 text-xs text-charcoal/40">
            Subcategories appear as filter pills on the shop page. &quot;All&quot; is added automatically.
          </p>

          {subcategories.filter((s) => s !== "All").length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {subcategories
                .filter((s) => s !== "All")
                .map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-xs text-charcoal"
                  >
                    {sub}
                    <button
                      onClick={() => removeSubcategory(sub)}
                      className="rounded-full p-0.5 transition-colors hover:bg-charcoal/10"
                    >
                      <X className="size-3" strokeWidth={2} />
                    </button>
                  </span>
                ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubcategory())}
              placeholder="Add subcategory…"
              className="h-9 flex-1 rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none"
            />
            <button
              onClick={addSubcategory}
              disabled={!newSub.trim()}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-white px-3 text-sm text-charcoal/60 transition-colors hover:bg-cream hover:text-charcoal disabled:opacity-40"
            >
              <Plus className="size-4" strokeWidth={1.5} />
              Add
            </button>
          </div>
        </div>

        {/* Published */}
        <div className="rounded-lg border border-border bg-white p-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-border accent-charcoal"
            />
            <div>
              <span className="text-sm text-charcoal">Published</span>
              <p className="text-xs text-charcoal/40">
                Unpublished categories are hidden from the storefront.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !label.trim() || !slug.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-charcoal px-6 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Save className="size-4" strokeWidth={1.5} />
            )}
            {saving ? "Saving…" : "Save Category"}
          </button>
          <Link
            href="/admin/categories"
            className="inline-flex h-10 items-center rounded-full border border-border bg-white px-6 text-sm text-charcoal/60 transition-colors hover:bg-cream hover:text-charcoal"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
