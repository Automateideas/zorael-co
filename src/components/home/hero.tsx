"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/media";
import { img, PHOTO } from "@/lib/images";

const slides = [
  {
    eyebrow: "Luxury Fashion House",
    title: ["Crafted for", "the Extraordinary."],
    copy: "Timeless pieces. Modern elegance. For every version of you.",
    cta: { label: "Explore New Arrivals", href: "/shop" },
    image: img(PHOTO.heroModel, 1800, 1000),
    alt: "Model in an ivory embroidered gown",
  },
  {
    eyebrow: "The Signature Edit",
    title: ["Timeless", "Elegance."],
    copy: "Modern silhouettes. Enduring grace. Made to be kept.",
    cta: { label: "Shop the Edit", href: "/collections/the-signature-edit" },
    image: img(PHOTO.editorialSaree, 1800, 1000),
    alt: "Editorial saree campaign",
  },
  {
    eyebrow: "Fine Jewellery",
    title: ["Pieces that", "tell your story."],
    copy: "Warm gold, considered detail, quietly commanding.",
    cta: { label: "Discover Jewellery", href: "/shop?category=jewelry" },
    image: img(PHOTO.necklaceGold, 1800, 1000),
    alt: "Gold necklace close-up",
  },
  {
    eyebrow: "The House of Zorael",
    title: ["Luxury in", "every detail."],
    copy: "From atelier to wardrobe — nothing left to chance.",
    cta: { label: "Our Story", href: "/about" },
    image: img(PHOTO.handbagHero, 1800, 1000),
    alt: "Luxury handbag campaign",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <section className="relative isolate overflow-hidden bg-cream">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[16/7]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Media
              src={slide.image}
              alt={slide.alt}
              priority={i === 0}
              sizes="100vw"
              className="h-full w-full"
            />
            {/* Legibility scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0">
          <div className="container-zorael flex h-full flex-col justify-center">
            <div className="max-w-xl text-ivory">
              <p
                key={`e-${index}`}
                className="animate-fade-up text-[0.7rem] font-medium uppercase tracking-[0.24em] text-ivory/85"
              >
                {slides[index].eyebrow}
              </p>
              <h1
                key={`t-${index}`}
                className="animate-fade-up mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                {slides[index].title[0]}
                <br />
                {slides[index].title[1]}
              </h1>
              <p
                key={`c-${index}`}
                className="animate-fade-up mt-5 max-w-md text-sm leading-relaxed text-ivory/85 sm:text-base"
              >
                {slides[index].copy}
              </p>
              <Link
                href={slides[index].cta.href}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-ivory/70 px-7 text-sm font-medium text-ivory transition-colors hover:bg-ivory hover:text-charcoal"
              >
                {slides[index].cta.label}
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Controls */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/50 text-ivory transition-colors hover:bg-ivory hover:text-charcoal sm:flex lg:left-6"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/50 text-ivory transition-colors hover:bg-ivory hover:text-charcoal sm:flex lg:right-6"
        >
          <ChevronRight className="size-5" strokeWidth={1.5} />
        </button>

        {/* Counter + dots */}
        <div className="absolute bottom-5 left-0 right-0">
          <div className="container-zorael flex items-center justify-between">
            <span className="text-xs tracking-widest text-ivory/80">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? "w-7 bg-ivory" : "w-3 bg-ivory/45"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
