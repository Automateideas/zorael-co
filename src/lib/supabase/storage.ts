/**
 * Supabase Storage helpers — product image uploads and public URLs.
 *
 * Bucket: `product-images` (public, so URLs are accessible without auth).
 * Server-only — never import from a Client Component.
 *
 * Image paths follow: `products/{productId}/{filename}`
 * Hero/editorial paths: `editorial/{filename}`
 */
import { createClient as createServiceClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

let serviceClient: ReturnType<typeof createServiceClient> | null = null;

/**
 * Returns a Supabase client with the service role key — bypasses RLS.
 * Used only for storage operations (uploads, bucket management).
 */
function getServiceClient() {
  if (serviceClient) return serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for storage operations.",
    );
  }
  serviceClient = createServiceClient(url, key);
  return serviceClient;
}

/**
 * Ensure the product-images bucket exists (idempotent).
 * Call once at startup or in a setup script.
 */
export async function ensureBucket() {
  const supabase = getServiceClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
  }
}

/**
 * Upload an image to Supabase Storage.
 * @returns The public URL of the uploaded image.
 */
export async function uploadProductImage(
  productId: string,
  filename: string,
  file: Buffer | Uint8Array,
  contentType = "image/webp",
): Promise<string> {
  const supabase = getServiceClient();
  const path = `products/${productId}/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: true,
    cacheControl: "public, max-age=31536000, immutable",
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return getPublicUrl(path);
}

/**
 * Upload an editorial/hero image.
 */
export async function uploadEditorialImage(
  filename: string,
  file: Buffer | Uint8Array,
  contentType = "image/webp",
): Promise<string> {
  const supabase = getServiceClient();
  const path = `editorial/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: true,
    cacheControl: "public, max-age=31536000, immutable",
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return getPublicUrl(path);
}

/**
 * Get the public URL for a storage path. Works without auth because the
 * bucket is public.
 */
export function getPublicUrl(path: string): string {
  const supabase = getServiceClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete an image from storage.
 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * List all images for a product.
 */
export async function listProductImages(
  productId: string,
): Promise<{ name: string; url: string }[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`products/${productId}`);
  if (error) throw new Error(`List failed: ${error.message}`);
  return (data ?? []).map((f) => ({
    name: f.name,
    url: getPublicUrl(`products/${productId}/${f.name}`),
  }));
}
