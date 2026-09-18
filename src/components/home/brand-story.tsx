import { PillLink } from "@/components/pill-link";
import { Monogram } from "@/components/layout/logo";

export function BrandStory() {
  return (
    <section className="bg-cream">
      <div className="container-zorael flex flex-col items-center py-20 text-center lg:py-28">
        <Monogram className="text-4xl" />
        <p className="eyebrow mt-8">Our Philosophy</p>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-snug tracking-tight text-charcoal sm:text-4xl lg:text-[2.75rem]">
          At Zorael &amp; Co., we believe in more than just fashion — we believe
          in craftsmanship, elegance and the art of timeless style.
        </h2>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-charcoal/65 sm:text-base">
          Our collections are designed for the modern individual who values
          authenticity, luxury and self-expression. Made in considered
          quantities, finished by hand, and meant to be kept.
        </p>
        <div className="mt-9">
          <PillLink href="/about" variant="primary" withArrow>
            Discover Our Story
          </PillLink>
        </div>
      </div>
    </section>
  );
}
