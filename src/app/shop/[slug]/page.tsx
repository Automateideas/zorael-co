import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDown, Star, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/section-heading";
import {
  getAllProducts,
  getProduct,
  getRelatedProducts,
} from "@/lib/catalog";
import { categoryMeta } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const catMeta = categoryMeta[product.category];

  const sections = [
    { title: "Product Details", items: product.details },
    { title: "Materials", items: product.materials },
    { title: "Shipping & Returns", items: product.shipping },
    { title: "Care Instructions", items: product.care },
  ].filter((s) => s.items && s.items.length > 0);

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          {
            label: catMeta?.title ?? "Shop",
            href: `/shop?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="lg:py-2">
          <p className="eyebrow">{product.subcategory ?? catMeta?.title}</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-charcoal lg:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 text-2xl text-charcoal">
            {formatPrice(product.price, product.currency)}
          </p>

          {product.rating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4"
                    strokeWidth={1}
                    fill={i < Math.round(product.rating!) ? "#B79A5A" : "none"}
                    color="#B79A5A"
                  />
                ))}
              </div>
              <span className="text-sm text-charcoal/60">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          )}

          <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/70">
            {product.description}
          </p>

          <ProductPurchase product={product} />

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-cream px-4 py-3 text-xs text-charcoal/70">
            <Truck className="size-4 text-muted-gold" strokeWidth={1.5} />
            Complimentary shipping on orders above ₹ 15,000
          </div>

          {/* Accordions (native <details>) */}
          <div className="mt-8 divide-y divide-border border-y border-border">
            {sections.map((section) => (
              <details key={section.title} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-medium text-charcoal">
                  {section.title}
                  <ChevronDown
                    className="size-4 text-charcoal/50 transition-transform group-open:rotate-180"
                    strokeWidth={1.5}
                  />
                </summary>
                <ul className="pb-4 pl-0 text-sm text-charcoal/65">
                  {section.items!.map((item) => (
                    <li key={item} className="mb-1.5 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            title="You May Also Like"
            viewAllHref={`/shop?category=${product.category}`}
          />
          <div className="mt-8">
            <ProductGrid products={related} columns="compact" />
          </div>
        </section>
      )}
    </div>
  );
}
