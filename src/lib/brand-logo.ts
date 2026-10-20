import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Natural dimensions of public/logo.png. */
const LOGO_W = 1200;
const LOGO_H = 896;

/**
 * The logo artwork is landscape with wide white margins, so on a square icon
 * canvas it is scaled past the edges to crop that margin — this keeps the
 * monogram at a usable size while leaving it well inside the maskable safe
 * zone (the central 80%).
 */
const SCALE = 1.5;

let cached: string | null = null;

/** Inlined as a data URI because Satori cannot read from the filesystem. */
export function logoDataUri(): string {
  if (cached) return cached;
  const file = readFileSync(join(process.cwd(), "public", "logo.png"));
  cached = `data:image/png;base64,${file.toString("base64")}`;
  return cached;
}

/** Width/height to render the logo at on a square canvas of `dim` pixels. */
export function logoBox(dim: number) {
  const width = Math.round(dim * SCALE);
  return { width, height: Math.round((width * LOGO_H) / LOGO_W) };
}

/** Matches the logo's own baked-in background, so no seam shows. */
export const LOGO_BACKGROUND = "#FFFFFF";
