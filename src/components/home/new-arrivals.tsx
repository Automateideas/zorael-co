import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { Media } from "@/components/media";
import { getNewArrivals } from "@/lib/products";
import { img, PHOTO } from "@/lib/images";

export function NewArrivals() {
  const products = getNewArrivals(6);

  return (
    <section className="container-zorael py-14 lg:py-20">
      <SectionHeading
        title="New Arrivals"
        description="Fresh styles. Timeless elegance."
        viewAllHref="/shop"
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Product row */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i < 3}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 30vw, 20vw"
            />
          ))}
        </div>

        {/* Jewellery feature card */}
        <aside className="relative overflow-hidden rounded-lg bg-charcoal text-ivory">
          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full">
            <Media
              src={img(PHOTO.jewelleryFlat, 700, 900)}
              alt="Jewellery collection"
              sizes="(max-width:1024px) 100vw, 340px"
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-7">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-gold">
              The Finest Details
            </p>
            <h3 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
              Jewellery
              <br />
              Collection
            </h3>
            <p className="mt-3 max-w-xs text-sm text-ivory/75">
              Exquisite pieces for every occasion.
            </p>
            <Link
              href="/shop?category=jewelry"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-medium text-black transition-colors hover:bg-muted-gold"
            >
              Explore Collection
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
