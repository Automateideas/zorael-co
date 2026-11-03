"use client";

import { useState } from "react";
import { Media } from "@/components/media";
import { useAutoAdvance } from "@/lib/use-auto-advance";

/**
 * Crossfades through a set of images on its own.
 *
 * A single image renders as a plain `Media` with no client state and no dots,
 * so a card the admin has not made into a gallery stays exactly as it was.
 */
export function ImageRotator({
  images,
  alt,
  sizes,
  priority = false,
  delayMs = 5000,
  imgClassName,
}: {
  images: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
  delayMs?: number;
  imgClassName?: string;
}) {
  const [paused, setPaused] = useState(false);
  const { index, goTo } = useAutoAdvance({
    count: images.length,
    delayMs,
    paused,
  });

  if (images.length <= 1) {
    return (
      <Media
        src={images[0] ?? ""}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className="h-full w-full"
        imgClassName={imgClassName}
        fit="cover"
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Media
            src={src}
            alt={i === index ? alt : ""}
            sizes={sizes}
            priority={priority && i === 0}
            className="h-full w-full"
            imgClassName={imgClassName}
            fit="cover"
          />
        </div>
      ))}

      {/* Sits above the card's scrim but below its links. */}
      <div className="absolute inset-x-0 top-3 z-10 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show image ${i + 1} of ${images.length}`}
            aria-current={i === index}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-5 bg-ivory/90" : "w-2 bg-ivory/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
