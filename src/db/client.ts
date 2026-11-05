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
    // Measured against this project's own Supabase instance (3 runs each at 50
    // concurrent, medians) on the uncached DB routes — the stock API, category
    // and subcategory filters:
    //
    //     max=5   51 rps   p95 2652ms
    //     max=15  85 rps   p95 1034ms
    //     max=20  91 rps   p95  797ms
    //
    // The knee is at 15: raising it from 5 cuts p95 by 2.6x, and going past 15
    // buys little. Never 1 — a single shared connection means one abandoned
    // query (a cancelled request, a browser navigating away mid-render) blocks
    // every later read until the server restarts, because Postgres keeps
    // running the orphaned statement to its statement_timeout and postgres.js
    // hands that stale error to whichever query reuses the connection next.
    //
    // Safe on the free tier: max_connections is 60 with 3 reserved, and ~13 are
    // already held by Supabase's own services. DATABASE_URL points at the
    // transaction-mode pooler (6543), which multiplexes rather than mapping
    // 1:1 to backends, so 15 leaves room for a second instance even if someone
    // later points this at the direct port.
    max: Number(process.env.DB_POOL_MAX ?? 15),
    prepare: false,
    // 20s was costing every visitor after a quiet gap a full reconnect: a cold
    // connection including the TLS handshake to ap-northeast-1 measures ~1810ms
    // against ~310ms warm, and it reproduced on every 25s and 35s idle. That
    // penalty is worst at low traffic, which is exactly a new brand's launch
    // condition. Connections are opened lazily, so a quiet site holds one or
    // two of these, not `max`. `max_lifetime` below still recycles every
    // connection within 30 minutes, so nothing lives indefinitely.
    //
    // Gaps longer than this still pay the reconnect — closing that last bit
    // needs a cached stock endpoint or a keep-alive ping, not a bigger number.
    idle_timeout: Number(process.env.DB_IDLE_TIMEOUT ?? 300),
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
