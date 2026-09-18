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
        eyebrow="Fine Jewellery"
        title="Pieces that tell your story."
        copy="Warm gold, freshwater pearls and considered detail. Our jewellery is designed to be layered, kept, and passed on — quiet luxury for the everyday and the occasion alike."
        ctaLabel="Explore Jewellery"
        ctaHref="/shop?category=jewelry"
        image={img(PHOTO.necklaceGold, 1000, 1250)}
        alt="Gold necklace close-up"
      />
      <FeatureSplit
        eyebrow="Hand Bags"
        title="Luxury in your hands."
        copy="Structured leather, precise hardware, and forms that follow the body. Each bag is cut to a clean, quiet line — made to carry the day and last for years."
        ctaLabel="Explore Hand Bags"
        ctaHref="/shop?category=hand-bags"
        image={img(PHOTO.handbagHero, 1000, 1250)}
        alt="Structured leather handbag"
        reverse
      />
      <BrandStory />
      <TrustBar />
    </>
  );
}
