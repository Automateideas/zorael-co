import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load local env for CLI commands (generate / migrate / studio / seed).
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use a DIRECT connection (raw Postgres :5432) for migrations, not the
    // pooler — poolers in transaction mode don't support DDL/session state well.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
