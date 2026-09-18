import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/lib/types";
import { Media } from "@/components/media";

export function CollectionCard({
  collection,
  priority = false,
}: {
  collection: Collection;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden rounded-lg bg-cream"
    >
      <div className="relative aspect-[4/5]">
        <Media
          src={collection.heroImage}
          alt={collection.name}
          label={collection.name}
          priority={priority}
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/15 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
        <h3 className="font-serif text-2xl tracking-tight">{collection.name}</h3>
        <p className="mt-1.5 max-w-xs text-sm text-ivory/80">
          {collection.tagline}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-ivory/90">
          Explore Collection
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </span>
      </div>
    </Link>
  );
}
