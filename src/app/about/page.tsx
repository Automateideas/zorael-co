import type { Metadata } from "next";
import { Gem, HandHeart, Leaf, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Media } from "@/components/media";
import { PillLink } from "@/components/pill-link";
import { Monogram } from "@/components/layout/logo";
import { img, PHOTO } from "@/lib/images";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The house of ZORAEL & CO. — craftsmanship, elegance and the art of timeless style.",
};

const values = [
  {
    Icon: Gem,
    title: "Premium Quality",
    copy: "Only finest materials, chosen with intent and finished by hand.",
  },
  {
    Icon: Sparkles,
    title: "Curated Collections",
    copy: "Considered edits, made in limited quantities and meant to be kept.",
  },
  {
    Icon: Leaf,
    title: "Responsible Craft",
    copy: "Small runs, low waste, and a respect for the makers behind each piece.",
  },
  {
    Icon: HandHeart,
    title: "Made to Last",
    copy: "Design that outlives the season — quiet luxury, worn for years.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-cream">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[16/6]">
          <Media
            src={img(PHOTO.aboutInterior, 1800, 900)}
            alt="The Zorael atelier"
            priority
            sizes="100vw"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-charcoal/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory">
            <Monogram className="text-4xl" />
            <h1 className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              The House of Zorael
            </h1>
            <p className="mt-4 max-w-md text-sm text-ivory/85 sm:text-base">
              Luxury Fashion House
            </p>
          </div>
        </div>
      </section>

      <div className="container-zorael py-8 lg:py-12">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        />

        {/* Statement */}
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <p className="eyebrow mb-4">Our Philosophy</p>
          <p className="font-serif text-2xl leading-relaxed tracking-tight text-charcoal sm:text-3xl">
            At Zorael &amp; Co., we believe in more than just fashion — we
            believe in craftsmanship, elegance and the art of timeless style.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-charcoal/65">
            Our collections are designed for the modern individual who values
            authenticity, luxury and self-expression. Each piece begins on
            paper, is refined against the body, and is finished by hand in small
            runs — nothing rushed to a calendar it does not deserve.
          </p>
        </div>

        {/* Split story */}
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Media
              src={img(PHOTO.brandStory, 1000, 1250)}
              alt="Craftsmanship at Zorael"
              sizes="(max-width:1024px) 100vw, 50vw"
              className="h-full w-full"
            />
          </div>
          <div>
            <p className="eyebrow mb-4">Craftsmanship</p>
            <h2 className="font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
              Made by hand, meant to last.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-charcoal/65">
              From the first sketch to the final stitch, our makers work in
              small ateliers, finishing seams by hand and pressing each garment
              to sit exactly as intended. We choose materials for how they age,
              not only how they look on the first day.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
              The result is quiet: a piece that simply fits, and keeps fitting.
              That, to us, is the mark of true luxury.
            </p>
            <div className="mt-8">
              <PillLink href="/shop" variant="primary" withArrow>
                Explore the Collections
              </PillLink>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ Icon, title, copy }) => (
            <div key={title}>
              <span className="flex size-11 items-center justify-center rounded-full border border-muted-gold/40 text-muted-gold">
                <Icon className="size-5" strokeWidth={1.4} />
              </span>
              <h3 className="mt-4 text-sm font-medium text-charcoal">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">
                {copy}
              </p>
            </div>
          ))}
        </div>

        {/* Support */}
        <div
          id="support"
          className="mt-20 scroll-mt-28 rounded-lg bg-cream px-6 py-12 text-center sm:px-12"
        >
          <p className="eyebrow mb-3">Customer Support</p>
          <h2 className="font-serif text-3xl tracking-tight text-charcoal">
            We&apos;re here to help.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/65">
            Questions on sizing, shipping, or a piece you&apos;ve set your heart
            on? Our client care team would be glad to assist.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <PillLink href="/journal" variant="secondary">
              Read the Journal
            </PillLink>
            <PillLink href="/shop" variant="primary">
              Start Shopping
            </PillLink>
          </div>
        </div>
      </div>
    </div>
  );
}
