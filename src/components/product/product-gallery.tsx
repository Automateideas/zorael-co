"use client";

import { useState } from "react";
import { Media } from "@/components/media";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const gallery = images.length ? images : [""];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex gap-3 lg:flex-col">
          {gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md border transition-colors lg:w-20",
                i === active
                  ? "border-charcoal"
                  : "border-border hover:border-charcoal/40",
              )}
            >
              <Media
                src={src}
                alt=""
                label={name}
                sizes="80px"
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-lg">
        <Media
          src={gallery[active]}
          alt={name}
          label={name}
          priority
          sizes="(max-width:1024px) 100vw, 45vw"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
