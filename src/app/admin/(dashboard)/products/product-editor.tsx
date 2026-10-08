"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Upload,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  saveProduct,
  uploadProductImages,
  removeProductImage,
  saveVariants,
  type ProductFormData,
  type VariantData,
} from "../actions";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  collection: string | null;
  price: number;
  currency: string;
  description: string;
  images: string[];
  sizes: string[] | null;
  colors: string[] | null;
  materials: string[] | null;
  details: string[] | null;
  care: string[] | null;
  shipping: string[] | null;
  isNew: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
};

type VariantRow = {
  id: number;
  productId: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
};

type CategoryOption = { value: string; label: string };

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: "clothes", label: "Clothes" },
  { value: "jewelry", label: "Jewelry" },
  { value: "hand-bags", label: "Hand Bags" },
];

export function ProductEditor({
  product,
  variants: existingVariants,
  categories,
}: {
  product?: ProductRow;
  variants?: VariantRow[];
  categories?: CategoryOption[];
}) {
  const CATEGORIES = categories ?? DEFAULT_CATEGORIES;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? "clothes");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [collection, setCollection] = useState(product?.collection ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") ?? "");
  const [colors, setColors] = useState(product?.colors?.join(", ") ?? "");
  const [materials, setMaterials] = useState(product?.materials?.join(", ") ?? "");
  const [detailsStr, setDetailsStr] = useState(product?.details?.join("\n") ?? "");
  const [careStr, setCareStr] = useState(product?.care?.join("\n") ?? "");
  const [shippingStr, setShippingStr] = useState(product?.shipping?.join("\n") ?? "");
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? true);

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<VariantData[]>(
    existingVariants?.map((v) => ({
      size: v.size ?? undefined,
      color: v.color ?? undefined,
      stock: v.stock,
    })) ?? [],
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitList = (s: string) =>
    s
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const splitLines = (s: string) =>
    s
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Enter a valid price.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data: ProductFormData = {
        id: product?.id,
        name: name.trim(),
        slug: slug.trim() || undefined,
        category,
        subcategory: subcategory.trim() || undefined,
        collection: collection.trim() || undefined,
        price: Number(price),
        description: description.trim() || undefined,
        sizes: splitList(sizes),
        colors: splitList(colors),
        materials: splitList(materials),
        details: splitLines(detailsStr),
        care: splitLines(careStr),
        shipping: splitLines(shippingStr),
        isNew,
        isBestSeller,
        isPublished,
        existingImages: images,
      };

      const result = await saveProduct(data);

      if (variants.length > 0) {
        await saveVariants(result.id, variants);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !product?.id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }
      const urls = await uploadProductImages(product.id, fd);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  const handleRemoveImage = async (url: string) => {
    if (!product?.id) {
      setImages((prev) => prev.filter((u) => u !== url));
      return;
    }
    await removeProductImage(product.id, url);
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: undefined, color: undefined, stock: 25 }]);
  };

  const updateVariant = (i: number, field: keyof VariantData, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, j) => (j === i ? { ...v, [field]: value } : v)),
    );
  };

  const removeVariant = (i: number) => {
    setVariants((prev) => prev.filter((_, j) => j !== i));
  };

  return (
    <div className="mt-6 max-w-3xl space-y-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal/50 transition-colors hover:text-charcoal"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        Back to Products
      </Link>

      {/* Basic info */}
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
          Basic Information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Product Name"
            value={name}
            onChange={setName}
            required
            className="sm:col-span-2"
          />
          <Field label="Slug" value={slug} onChange={setSlug} placeholder="auto-generated from name" />
          <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <Field label="Subcategory" value={subcategory} onChange={setSubcategory} placeholder="e.g. Dresses, Rings" />
          <Field label="Collection" value={collection} onChange={setCollection} placeholder="Optional" />
          <Field
            label="Price (INR)"
            value={price}
            onChange={setPrice}
            type="number"
            required
          />
        </div>
      </section>

      {/* Description */}
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
          Description
        </h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-3 w-full rounded-md border border-border bg-ivory px-3.5 py-2.5 text-sm text-charcoal transition-colors focus:border-charcoal focus:outline-none"
        />
      </section>

      {/* Images */}
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
          Images
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="group relative">
              <img
                src={url}
                alt=""
                className="size-24 rounded-md object-cover"
              />
              <button
                onClick={() => handleRemoveImage(url)}
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-charcoal text-ivory opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" strokeWidth={2} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !product?.id}
            className={cn(
              "flex size-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-charcoal/40 transition-colors hover:border-charcoal/40 hover:text-charcoal/60",
              !product?.id && "cursor-not-allowed opacity-50",
            )}
            title={product?.id ? "Upload images" : "Save product first to upload images"}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
            ) : (
              <>
                <Upload className="size-5" strokeWidth={1.5} />
                <span className="text-[10px]">Upload</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
        {!product?.id && (
          <p className="mt-2 text-xs text-charcoal/40">
            Save the product first, then you can upload images.
          </p>
        )}
      </section>

      {/* Attributes */}
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
          Attributes
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Sizes (comma-separated)"
            value={sizes}
            onChange={setSizes}
            placeholder="XS, S, M, L, XL"
          />
          <Field
            label="Colors (comma-separated)"
            value={colors}
            onChange={setColors}
            placeholder="Noir, Ivory, Burgundy"
          />
          <Field
            label="Materials (comma-separated)"
            value={materials}
            onChange={setMaterials}
            placeholder="100% Silk, Lining: Cupro"
          />
        </div>
      </section>

      {/* Details / Care / Shipping */}
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
          Details, Care & Shipping
        </h2>
        <div className="mt-4 space-y-4">
          <TextareaField
            label="Details (one per line)"
            value={detailsStr}
            onChange={setDetailsStr}
            rows={3}
          />
          <TextareaField
            label="Care instructions (one per line)"
            value={careStr}
            onChange={setCareStr}
            rows={3}
          />
          <TextareaField
            label="Shipping info (one per line)"
            value={shippingStr}
            onChange={setShippingStr}
            rows={2}
          />
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
              Variants & Stock
            </h2>
            {variants.length > 0 && (
              <p className="mt-1 text-xs text-charcoal/40">
                Total stock:{" "}
                <span className="font-medium text-charcoal">
                  {variants.reduce((sum, v) => sum + v.stock, 0)}
                </span>
                {" "}across {variants.length} variant
                {variants.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            {sizes.trim() && colors.trim() && variants.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  const sizeList = splitList(sizes);
                  const colorList = splitList(colors);
                  const generated: VariantData[] = [];
                  for (const s of sizeList) {
                    for (const c of colorList) {
                      generated.push({ size: s, color: c, stock: 25 });
                    }
                  }
                  setVariants(generated);
                }}
                className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-charcoal/60 transition-colors hover:bg-cream hover:text-charcoal"
              >
                Auto-generate
              </button>
            )}
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 rounded-md bg-cream px-2.5 py-1 text-xs text-charcoal/70 transition-colors hover:bg-charcoal hover:text-ivory"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
              Add Row
            </button>
          </div>
        </div>

        {variants.length === 0 ? (
          <p className="mt-4 rounded-md bg-cream/60 px-4 py-3 text-xs text-charcoal/50">
            No variants yet. Add rows manually or fill in sizes and colors above
            then click &ldquo;Auto-generate&rdquo; to create all combinations.
          </p>
        ) : (
          <div className="mt-4">
            {/* Column headers */}
            <div className="mb-2 flex items-center gap-3 px-1 text-[10px] uppercase tracking-wide text-charcoal/35">
              <span className="w-28">Size</span>
              <span className="w-32">Color</span>
              <span className="w-24">Qty</span>
              <span className="w-8" />
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md bg-ivory/50 p-1.5"
                >
                  <input
                    value={v.size ?? ""}
                    onChange={(e) => updateVariant(i, "size", e.target.value)}
                    placeholder="e.g. M"
                    className="h-9 w-28 rounded-md border border-border bg-white px-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
                  />
                  <input
                    value={v.color ?? ""}
                    onChange={(e) => updateVariant(i, "color", e.target.value)}
                    placeholder="e.g. Noir"
                    className="h-9 w-32 rounded-md border border-border bg-white px-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none"
                  />
                  <div className="flex h-9 w-24 items-center overflow-hidden rounded-md border border-border bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateVariant(i, "stock", Math.max(0, v.stock - 1))
                      }
                      className="flex h-full w-8 items-center justify-center text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
                    >
                      <Minus className="size-3" strokeWidth={2} />
                    </button>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(
                          i,
                          "stock",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min={0}
                      className="h-full w-full border-x border-border bg-white px-1 text-center text-sm tabular-nums text-charcoal focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateVariant(i, "stock", v.stock + 1)}
                      className="flex h-full w-8 items-center justify-center text-charcoal/40 transition-colors hover:bg-cream hover:text-charcoal"
                    >
                      <Plus className="size-3" strokeWidth={2} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="rounded-md p-1.5 text-charcoal/30 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Flags */}
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal/60">
          Flags
        </h2>
        <div className="mt-4 space-y-3">
          <Checkbox label="Published" checked={isPublished} onChange={setIsPublished} />
          <Checkbox label="New Arrival" checked={isNew} onChange={setIsNew} />
          <Checkbox label="Best Seller" checked={isBestSeller} onChange={setIsBestSeller} />
        </div>
      </section>

      {/* Error + Save */}
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex h-11 items-center gap-2 rounded-full bg-charcoal px-8 text-sm font-medium text-ivory transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" strokeWidth={1.5} />
              {product ? "Update Product" : "Create Product"}
            </>
          )}
        </button>
        <Link
          href="/admin/products"
          className="flex h-11 items-center rounded-full border border-border px-6 text-sm text-charcoal transition-colors hover:border-charcoal/40"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs text-charcoal/60">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 h-10 w-full rounded-md border border-border bg-ivory px-3 text-sm text-charcoal transition-colors focus:border-charcoal focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs text-charcoal/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-border bg-ivory px-3 text-sm text-charcoal transition-colors focus:border-charcoal focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-charcoal/60">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-sm text-charcoal transition-colors focus:border-charcoal focus:outline-none"
      />
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-charcoal">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-border accent-charcoal"
      />
      {label}
    </label>
  );
}
