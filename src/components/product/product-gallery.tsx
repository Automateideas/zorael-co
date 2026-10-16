"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/media";
import { cn } from "@/lib/utils";

/** Arrows stay hidden until hover/focus on pointer devices; always shown on touch. */
function arrowClass(side: string) {
  return cn(
    "absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center",
    "rounded-full bg-ivory/90 text-charcoal transition-opacity duration-300 hover:bg-ivory",
    "sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
    side,
  );
}

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const gallery = images.length ? images : [""];
  const count = gallery.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: "smooth",
    });
  }, []);

  // Keep `active` in sync with native swipe / scroll position.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setActive(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollTo(active - 1);
    }
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`View image ${i + 1} of ${count}`}
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

      {/* Carousel */}
      <div
        className="group relative flex-1 overflow-hidden rounded-lg"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
      >
        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {gallery.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] w-full shrink-0 snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${i + 1} of ${count}`}
            >
              <Media
                src={src}
                alt={i === 0 ? name : ""}
                label={name}
                priority={i === 0}
                sizes="(max-width:1024px) 100vw, 45vw"
                className="h-full w-full"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            {/* Arrows */}
            {active > 0 && (
              <button
                type="button"
                onClick={() => scrollTo(active - 1)}
                aria-label="Previous image"
                className={arrowClass("left-3")}
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
            )}
            {active < count - 1 && (
              <button
                type="button"
                onClick={() => scrollTo(active + 1)}
                aria-label="Next image"
                className={arrowClass("right-3")}
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
