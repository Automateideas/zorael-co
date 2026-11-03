/**
 * Resolves a colour name typed in the admin panel to a swatch colour.
 *
 * The admin field is free text, so the storefront cannot rely on a short
 * curated list — a client typing "Red" or "Rani Pink" would otherwise get the
 * neutral fallback and every circle would look identical. Resolution order:
 *
 *   1. a hex the client typed directly ("#D81B60")
 *   2. the house palette, so brand names keep their exact tone
 *   3. common colour names, including the Indian names this catalogue uses
 *   4. "multicolour" and friends, drawn as a soft spectrum rather than a lie
 *
 * Anything still unresolved is reported as `known: false` so the caller can
 * show the colour's name instead of a misleading circle.
 */

export type Swatch = {
  /** A CSS `background` value — may be a gradient, so never assign to `backgroundColor`. */
  background: string;
  known: boolean;
};

const NEUTRAL = "#D8CFBF";

/** House palette — these keep their exact brand tone. */
const BRAND: Record<string, string> = {
  ivory: "#F5F1E8",
  champagne: "#E6D5A8",
  sand: "#D8C7A5",
  charcoal: "#171613",
  ruby: "#8B1E3F",
  emerald: "#0F5132",
  midnight: "#1A2238",
  saffron: "#E1A140",
  rose: "#D9A5A0",
  pearl: "#F1ECE2",
  noir: "#0D0D0B",
  blush: "#E8CFC7",
  sage: "#B7BFA6",
  clay: "#B08968",
  wine: "#6E1423",
  forest: "#2C3B2D",
  taupe: "#D8CFBF",
  cognac: "#9A5B34",
  burgundy: "#5C1A2B",
};

/** Everyday names, including the Indian ones this catalogue actually uses. */
const COMMON: Record<string, string> = {
  // Reds / pinks
  red: "#C1121F",
  "rani pink": "#D81B60",
  rani: "#D81B60",
  pink: "#E8799F",
  "hot pink": "#E0457B",
  "baby pink": "#F2C1D1",
  magenta: "#B5179E",
  fuchsia: "#C2298A",
  maroon: "#6A1B23",
  crimson: "#9E1B32",
  rust: "#A64521",
  coral: "#E57357",
  peach: "#F0B49A",
  salmon: "#E9967A",
  // Oranges / yellows
  orange: "#D97A28",
  mustard: "#C9992B",
  yellow: "#E3C04A",
  gold: "#B79A5A",
  bronze: "#8C6A3F",
  copper: "#9C5F33",
  beige: "#E3D7C3",
  cream: "#EDE6D8",
  nude: "#E2C9B0",
  camel: "#C19A6B",
  tan: "#C4A484",
  brown: "#6F4E37",
  chocolate: "#4A2C20",
  coffee: "#4B3621",
  // Greens
  green: "#2E6B41",
  "bottle green": "#174029",
  olive: "#6B6B3A",
  mint: "#A8D5BA",
  teal: "#1F6F6F",
  turquoise: "#3AAFA9",
  // Blues / purples
  blue: "#23528C",
  navy: "#1B2A4A",
  "royal blue": "#2A4D9B",
  "sky blue": "#8FBEDC",
  powder: "#C3D7E6",
  indigo: "#38457A",
  purple: "#5B3A8C",
  violet: "#6E4B9E",
  lavender: "#C3B2D9",
  lilac: "#C9B6DB",
  mauve: "#A58AA0",
  plum: "#6C3A52",
  // Neutrals
  white: "#FFFDF8",
  "off white": "#F6F2E9",
  black: "#0D0D0B",
  grey: "#8A8782",
  gray: "#8A8782",
  silver: "#BFC1C2",
  "light grey": "#C8C6C1",
  "dark grey": "#4A4845",
  stone: "#B9B2A6",
};

/** Names that describe a print rather than a single colour. */
const MULTI = new Set([
  "multicolour",
  "multicolor",
  "multi",
  "multi colour",
  "multi color",
  "printed",
  "print",
  "floral",
  "assorted",
  "mixed",
]);

/** A soft spectrum — honest about being several colours, still restrained. */
const MULTI_BACKGROUND =
  "conic-gradient(from 210deg, #C1121F, #E1A140, #C9992B, #2E6B41, #23528C, #5B3A8C, #D81B60, #C1121F)";

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveSwatch(raw: string): Swatch {
  const key = normalize(raw);
  if (!key) return { background: NEUTRAL, known: false };

  if (HEX.test(key)) {
    return { background: key.startsWith("#") ? key : `#${key}`, known: true };
  }

  if (MULTI.has(key)) return { background: MULTI_BACKGROUND, known: true };

  const hit = BRAND[key] ?? COMMON[key];
  if (hit) return { background: hit, known: true };

  // "Ruby Red", "Deep Navy", "Rani Pink Silk" — match on any known word so a
  // descriptive name still resolves rather than falling through to neutral.
  const words = key.split(" ");
  for (let i = words.length; i > 0; i--) {
    for (let start = 0; start + i <= words.length; start++) {
      const phrase = words.slice(start, start + i).join(" ");
      const found = BRAND[phrase] ?? COMMON[phrase];
      if (found) return { background: found, known: true };
      if (MULTI.has(phrase)) return { background: MULTI_BACKGROUND, known: true };
    }
  }

  return { background: NEUTRAL, known: false };
}

/** Case/space-insensitive comparison for variant option matching. */
export function sameOption(a?: string | null, b?: string | null): boolean {
  if (a == null || b == null) return a == null && b == null;
  return normalize(a) === normalize(b);
}
