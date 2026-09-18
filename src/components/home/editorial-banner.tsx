import { Media } from "@/components/media";
import { PillLink } from "@/components/pill-link";
import { img, PHOTO } from "@/lib/images";

export function EditorialBanner() {
  return (
    <section className="relative isolate my-6 overflow-hidden">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[16/6]">
        <Media
          src={img(PHOTO.editorialWoman, 1800, 900)}
          alt="Zorael editorial campaign"
          sizes="100vw"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-charcoal/45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-ivory/80">
            The House of Zorael
          </p>
          <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            More than just fashion.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/85 sm:text-base">
            A feeling — considered, quiet, and made to last. Discover the pieces
            that define a wardrobe.
          </p>
          <div className="mt-8">
            <PillLink
              href="/collections"
              variant="secondary"
              className="border-ivory/70 text-ivory hover:bg-ivory hover:text-charcoal"
              withArrow
            >
              View Collections
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
