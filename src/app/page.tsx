import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { FeatureSplit } from "@/components/home/feature-split";
import { BrandStory } from "@/components/home/brand-story";
import { TrustBar } from "@/components/home/trust-bar";
import { img, PHOTO } from "@/lib/images";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <NewArrivals />
      <EditorialBanner />
      <FeatureSplit
        eyebrow="Accessories"
        title="The finishing touch."
        copy="Warm gold, freshwater pearls, structured leather and considered detail. Our accessories are designed to be layered, carried and kept — quiet luxury for the everyday and the occasion alike."
        ctaLabel="Explore Accessories"
        ctaHref="/shop?category=accessories"
        image={img(PHOTO.necklaceGold, 1000, 1250)}
        alt="Gold necklace close-up"
      />
      <FeatureSplit
        eyebrow="Brand Collection"
        title="Curated edits for every story."
        copy="Signature pieces and seasonal edits, brought together with intention. Each collection is a considered chapter — designed to be discovered, worn and returned to."
        ctaLabel="Explore Collections"
        ctaHref="/shop?category=brand-collection"
        image={img(PHOTO.handbagHero, 1000, 1250)}
        alt="Curated brand collection"
        reverse
      />
      <BrandStory />
      <TrustBar />
    </>
  );
}
