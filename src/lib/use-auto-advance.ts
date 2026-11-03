import { useCallback, useEffect, useState } from "react";

/**
 * Index state for a carousel that advances on its own.
 *
 * Honours `prefers-reduced-motion` (the house rule for every animation) and
 * pauses while the viewer is hovering, focused inside, or on another tab —
 * rotating a slide out from under someone who is reading it is the fastest way
 * to make a carousel feel cheap.
 *
 * Any manual navigation restarts the timer, so a slide the viewer chose is
 * never cut short.
 */
export function useAutoAdvance({
  count,
  delayMs = 6000,
  paused = false,
}: {
  count: number;
  delayMs?: number;
  paused?: boolean;
}) {
  const [index, setIndex] = useState(0);
  // Bumped on manual navigation purely to restart the interval below.
  const [nudge, setNudge] = useState(0);

  // A shrinking gallery must not strand the index past the last slide —
  // derived rather than corrected in an effect, so there is no extra render.
  const safeIndex = index < count ? index : 0;

  const go = useCallback(
    (dir: number) => {
      if (count < 1) return;
      setIndex((i) => (i + dir + count) % count);
      setNudge((t) => t + 1);
    },
    [count],
  );

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setNudge((t) => t + 1);
  }, []);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const id = setInterval(() => {
      // A background tab would otherwise queue up a burst of advances.
      if (document.hidden) return;
      setIndex((i) => (i + 1) % count);
    }, delayMs);

    return () => clearInterval(id);
  }, [count, delayMs, paused, nudge]);

  return { index: safeIndex, go, goTo };
}
