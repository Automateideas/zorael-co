import type { Metadata } from "next";
import { Gem, HandHeart, Leaf, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Media } from "@/components/media";
import { PillLink } from "@/components/pill-link";
import { Monogram } from "@/components/layout/logo";
import { getSiteImages } from "@/lib/site-images";
import { getAboutContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The house of ZORAEL & CO. — craftsmanship, elegance and the art of timeless style.",
};

/** Icons are fixed by position; the four value cards' text is admin-editable. */
const valueIcons = [Gem, Sparkles, Leaf, HandHeart];

export default async function AboutPage() {
  const [siteImages, content] = await Promise.all([
    getSiteImages(),
    getAboutContent(),
  ]);
  const values = content.values.map((v, i) => ({
    ...v,
    Icon: valueIcons[i] ?? Gem,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-cream">
        <div className="relative aspect-4/5 w-full sm:aspect-[16/9] lg:aspect-[16/6]">
          <Media
            src={siteImages["about-hero"][0]}
            alt="The Zorael atelier"
            priority
            sizes="100vw"
            className="h-full w-full" fit="cover"
          />
          <div className="absolute inset-0 bg-charcoal/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory">
            <Monogram className="text-4xl" />
            <h1 className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="mt-4 max-w-md text-sm text-ivory/85 sm:text-base">
              {content.heroSubtitle}
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
          <p className="eyebrow mb-4">{content.philosophyEyebrow}</p>
          <p className="font-serif text-2xl leading-relaxed tracking-tight text-charcoal sm:text-3xl">
            {content.philosophyStatement}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-charcoal/65">
            {content.philosophyBody}
          </p>
        </div>

        {/* Split story */}
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Media
              src={siteImages["about-story"][0]}
              alt="Craftsmanship at Zorael"
              sizes="(max-width:1024px) 100vw, 50vw"
              className="h-full w-full" fit="cover"
            />
          </div>
          <div>
            <p className="eyebrow mb-4">{content.craftEyebrow}</p>
            <h2 className="font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
              {content.craftHeading}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-charcoal/65">
              {content.craftBody1}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
              {content.craftBody2}
            </p>
            <div className="mt-8">
              <PillLink href={content.craftCtaHref} variant="primary" withArrow>
                {content.craftCtaLabel}
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
          <p className="eyebrow mb-3">{content.supportEyebrow}</p>
          <h2 className="font-serif text-3xl tracking-tight text-charcoal">
            {content.supportHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/65">
            {content.supportBody}
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
