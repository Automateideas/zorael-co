import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { Media } from "@/components/media";
import { collections, getCollection } from "@/lib/collections";
import { getProductsByIds } from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Not found" };
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const found = await getProductsByIds(collection.products);
  // Keep the curated order from the collection definition.
  const items = collection.products
    .map((id) => found.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-cream">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[16/6]">
          <Media
            src={collection.heroImage}
            alt={collection.name}
            priority
            sizes="100vw"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-charcoal/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-zorael text-ivory">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-ivory/80">
                Collection
              </p>
              <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {collection.name}
              </h1>
              <p className="mt-4 max-w-md text-sm text-ivory/85 sm:text-base">
                {collection.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-zorael py-8 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: collection.name },
          ]}
        />

        {/* Statement */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="font-serif text-2xl leading-relaxed tracking-tight text-charcoal sm:text-3xl">
            {collection.description}
          </p>
        </div>

        {/* Products */}
        <div className="mt-14">
          <ProductGrid products={items} priorityCount={4} />
        </div>
      </div>
    </div>
  );
}
