/**
 * One-time setup: create the `product-images` bucket in Supabase Storage.
 *
 *   npx tsx src/db/setup-storage.ts
 *
 * Requires SUPABASE_SECRET_KEY in .env.local.
 * Idempotent — safe to re-run.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { ensureBucket } from "../lib/supabase/storage";

async function main() {
  console.log("Ensuring product-images bucket exists…");
  await ensureBucket();
  console.log("✓ Bucket ready.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to set up storage:", err);
  process.exit(1);
});
