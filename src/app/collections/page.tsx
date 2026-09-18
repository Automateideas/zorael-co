import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CollectionCard } from "@/components/collections/collection-card";
import { collections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated editorial collections from ZORAEL & CO. — for every chapter of your story.",
};

export default function CollectionsPage() {
  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Collections" }]}
      />
      <header className="mt-6 max-w-2xl">
        <p className="eyebrow mb-3">The Edits</p>
        <h1 className="font-serif text-4xl tracking-tight text-charcoal lg:text-5xl">
          Collections
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
          Curated for every chapter of your story — considered groupings of the
          pieces we return to, season after season.
        </p>
      </header>

      <div className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c, i) => (
          <CollectionCard key={c.id} collection={c} priority={i < 3} />
        ))}
      </div>
    </div>
  );
}
