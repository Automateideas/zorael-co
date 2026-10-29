/**
 * Downscales an image in the browser before upload.
 *
 * Phone and camera originals run to several megabytes, which makes uploads
 * slow or fails them outright against the size cap, and leaves the image
 * optimiser resizing a huge source on every first request. Shrinking here
 * costs nothing visually — the storefront never renders above ~1200px.
 */

/** Longest edge kept, in pixels. Comfortably above any rendered size. */
const MAX_EDGE = 2000;
/** Files smaller than this are already web-sized; leave them alone. */
const SKIP_BELOW_BYTES = 400 * 1024;
const QUALITY = 0.85;

function canResize(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    return createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/**
 * Returns a resized copy, or the original when resizing is unnecessary or
 * unsupported. Never throws — a failed resize falls back to the original so
 * the upload still goes through.
 */
export async function resizeImage(file: File): Promise<File> {
  if (!canResize(file) || file.size < SKIP_BELOW_BYTES) return file;

  try {
    const source = await loadBitmap(file);
    const { width, height } = source as { width: number; height: number };
    const longest = Math.max(width, height);
    if (longest <= MAX_EDGE && file.size < 1_500_000) return file;

    const scale = Math.min(1, MAX_EDGE / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source as CanvasImageSource, 0, 0, canvas.width, canvas.height);
    if ("close" in source) source.close();

    // PNGs may carry transparency, so they stay PNG-compatible via WebP.
    const type = file.type === "image/png" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const ext = type === "image/webp" ? "webp" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
    return new File([blob], name, { type, lastModified: Date.now() });
  } catch {
    return file;
  }
}
