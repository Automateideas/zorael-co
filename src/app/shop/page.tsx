import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FilterPills } from "@/components/shop/filter-pills";
import { ProductGrid } from "@/components/product/product-grid";
import { CollectionCard } from "@/components/collections/collection-card";
import { Media } from "@/components/media";
import { getAllProducts, getProductsBySubcategory } from "@/lib/catalog";
import { collections } from "@/lib/collections";
import {
  shopFilters,
  shopCategories,
  subcategories,
  categoryMeta,
} from "@/lib/site";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop clothing, fine jewellery and hand bags from ZORAEL & CO. — considered pieces, made to last.",
};

type SearchParams = Promise<{ category?: string; sub?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category = "all", sub = "All" } = await searchParams;

  const isCategory =
    category === "clothes" ||
    category === "jewelry" ||
    category === "hand-bags";
  const isCollections = category === "collections";

  const meta = isCategory ? categoryMeta[category] : null;
  const subs = isCategory ? subcategories[category] : null;

  const all = await getAllProducts();
  const byCategory = (c: Product["category"]) =>
    all.filter((p) => p.category === c);
  const list: Product[] = isCategory
    ? await getProductsBySubcategory(category as Product["category"], sub)
    : all;

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: isCategory || isCollections ? "/shop" : undefined },
          ...(meta ? [{ label: meta.title }] : []),
          ...(isCollections ? [{ label: "Collections" }] : []),
        ]}
      />

      {/* Heading */}
      <header className="mt-6 max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight text-charcoal lg:text-5xl">
          {meta ? meta.title : isCollections ? "Collections" : "Shop"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
          {meta
            ? meta.blurb
            : isCollections
              ? "Curated for every chapter of your story."
              : "Timeless pieces across clothing, jewellery and hand bags — explore the full house."}
        </p>
      </header>

      {/* Category filter pills */}
      <div className="mt-8">
        <FilterPills
          options={shopFilters}
          active={category}
          param="category"
          basePath="/shop"
        />
      </div>

      {/* Subcategory pills (within a category) */}
      {subs && (
        <div className="mt-4">
          <FilterPills
            options={subs.map((s) => ({ label: s, value: s }))}
            active={sub}
            param="sub"
            basePath="/shop"
            extraParams={{ category }}
          />
        </div>
      )}

      {/* Hub: category showcase cards when viewing "All" */}
      {!isCategory && !isCollections && (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {shopCategories.map((card) => {
            const inCategory = byCategory(card.value as Product["category"]);
            const count = inCategory.length;
            return (
              <Link
                key={card.value}
                href={card.href}
                className="group relative overflow-hidden rounded-lg bg-cream"
              >
                <div className="relative aspect-[16/10]">
                  <Media
                    src={inCategory[0]?.images[0] ?? ""}
                    alt={card.label}
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-ivory">
                  <div>
                    <h2 className="font-serif text-xl">{card.label}</h2>
                    <p className="text-xs text-ivory/75">{card.blurb}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-ivory/85">
                    {count} pieces
                    <ArrowRight className="size-3.5" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="mt-10">
        {isCollections ? (
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        ) : list.length > 0 ? (
          <>
            <p className="mb-5 text-xs text-charcoal/50">
              {list.length} {list.length === 1 ? "piece" : "pieces"}
            </p>
            <ProductGrid products={list} priorityCount={4} />
          </>
        ) : (
          <div className="rounded-lg border border-border bg-white py-20 text-center">
            <p className="font-serif text-2xl text-charcoal">
              Nothing here just yet.
            </p>
            <p className="mt-2 text-sm text-charcoal/60">
              Try another filter or explore the full shop.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-charcoal px-6 text-sm text-ivory transition-colors hover:bg-black"
            >
              View all pieces
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
