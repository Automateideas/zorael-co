import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Drizzle client (postgres.js driver).
 *
 * Serverless note (Vercel): every function instance opens its own connections,
 * so we keep `max` small and set `prepare: false` — required when connecting
 * through a transaction-mode pooler like PgBouncer (which Vercel + a VPS
 * Postgres should use). Point DATABASE_URL at the POOLER port (e.g. 6432), and
 * DIRECT_URL at the raw Postgres (5432) for migrations.
 */

type DbClient = ReturnType<typeof createClient>;

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure it to use the Postgres/Drizzle order store.",
    );
  }
  const sql = postgres(url, {
    // Never 1. A single shared connection means one abandoned query — a
    // cancelled request, a browser navigating away mid-render — blocks every
    // later read until the server restarts: Postgres keeps running the
    // orphaned statement to its statement_timeout, and postgres.js delivers
    // that stale error to whichever query reuses the connection next.
    max: Number(process.env.DB_POOL_MAX ?? 5),
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    // Recycle connections so one left in a bad state cannot persist for the
    // lifetime of a long-running dev server or serverless instance.
    max_lifetime: 60 * 30,
    ssl: process.env.DB_SSL === "disable" ? false : "require",
  });
  return drizzle(sql, { schema });
}

// Reuse across hot-reloads / warm serverless invocations.
const globalForDb = globalThis as unknown as { __zoraelDb?: DbClient };

export function getDb(): DbClient {
  if (!globalForDb.__zoraelDb) {
    globalForDb.__zoraelDb = createClient();
  }
  return globalForDb.__zoraelDb;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
