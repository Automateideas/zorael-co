import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Media } from "@/components/media";
import { img, PHOTO } from "@/lib/images";

const cards = [
  {
    title: "Clothes",
    blurb: "Elegant. Timeless. You.",
    href: "/shop?category=clothes",
    image: img(PHOTO.ivoryDress, 800, 900),
    alt: "Ivory embroidered dress",
  },
  {
    title: "Jewellery",
    blurb: "Pieces that tell your story.",
    href: "/shop?category=jewelry",
    image: img(PHOTO.necklaceGold, 800, 900),
    alt: "Fine gold necklace",
  },
  {
    title: "Hand Bags",
    blurb: "Luxury in your hands.",
    href: "/shop?category=hand-bags",
    image: img(PHOTO.handbagHero, 800, 900),
    alt: "Structured leather handbag",
  },
];

export function FeaturedCategories() {
  return (
    <section className="container-zorael py-14 lg:py-20">
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="group relative overflow-hidden rounded-lg bg-cream"
          >
            <div className="relative aspect-[5/4] w-full sm:aspect-[4/3]">
              <Media
                src={card.image}
                alt={card.alt}
                sizes="(max-width:768px) 100vw, 33vw"
                className="h-full w-full"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
              <h3 className="font-serif text-2xl tracking-tight">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-ivory/85">{card.blurb}</p>
              <div className="mt-4 flex items-center gap-4">
                <Link
                  href={card.href}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ivory px-4 text-xs font-medium text-charcoal transition-colors hover:bg-white"
                >
                  Shop Now
                  <ArrowRight className="size-3.5" strokeWidth={1.75} />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1.5 text-xs text-ivory/90 transition-colors hover:text-ivory"
                >
                  Collection
                  <ArrowRight className="size-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
