import { Media } from "@/components/media";
import { PillLink } from "@/components/pill-link";
import { cn } from "@/lib/utils";

export function FeatureSplit({
  eyebrow,
  title,
  copy,
  ctaLabel,
  ctaHref,
  image,
  alt,
  reverse = false,
  ratio = "portrait",
}: {
  eyebrow?: string;
  title: string;
  copy: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  alt: string;
  reverse?: boolean;
  ratio?: "portrait" | "landscape";
}) {
  return (
    <section className="container-zorael py-14 lg:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg",
            ratio === "portrait" ? "aspect-[4/5]" : "aspect-[4/3]",
            reverse && "lg:order-2",
          )}
        >
          <Media
            src={image}
            alt={alt}
            sizes="(max-width:1024px) 100vw, 50vw"
            className="h-full w-full"
          />
        </div>
        <div className={cn(reverse && "lg:order-1")}>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/65 sm:text-base">
            {copy}
          </p>
          <div className="mt-8">
            <PillLink href={ctaHref} variant="primary" withArrow>
              {ctaLabel}
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
