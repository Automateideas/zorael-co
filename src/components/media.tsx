"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MediaProps = {
  src: string;
  alt: string;
  /** Caption shown on the fallback placeholder (defaults to alt). */
  label?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /**
   * `contain` shows the whole image inside the box — never cropped, which is
   * what product photography needs. `cover` fills the box and trims the
   * overflow; use it only for decorative/editorial banners.
   */
  fit?: "contain" | "cover";
};

/**
 * Image wrapper that renders the (remote) source and quietly degrades to an
 * on-brand placeholder if the source fails to load — so the layout is never
 * broken while real photography is swapped in via `src/lib/images.ts`.
 */
export function Media({
  src,
  alt,
  label,
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  className,
  imgClassName,
  fit = "contain",
}: MediaProps) {
  // Tracking which src failed (rather than a boolean) means a new src clears
  // the failure on its own — one transient error cannot pin the placeholder
  // for the life of the component.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // An empty src makes next/image throw and re-request the page; show the
  // placeholder instead of handing it a URL it cannot resolve.
  const showPlaceholder = !src || failedSrc === src;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-cream text-muted-gold",
        className,
      )}
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-cream to-ivory p-4 text-center">
          <span className="font-logo text-lg tracking-tight text-charcoal/40">
            ZORAEL & CO.
          </span>
          <span className="max-w-[80%] text-[0.7rem] uppercase tracking-[0.18em] text-muted-gold/70">
            {label ?? alt}
          </span>
        </div>
      ) : fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(fit === "cover" ? "object-cover" : "object-contain", imgClassName)}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 1000}
          sizes={sizes}
          priority={priority}
          className={cn("h-auto w-full", fit === "cover" ? "object-cover" : "object-contain", imgClassName)}
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}
