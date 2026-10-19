/**
 * Database access.
 *
 * - DATABASE_URL set   -> Neon Postgres over WebSockets (@neondatabase/serverless Pool).
 *                         The Pool driver supports interactive transactions, which the
 *                         seeder and the store need (the neon-http driver does not).
 * - DATABASE_URL unset -> PGlite. In-memory by default; set PGLITE_DIR (e.g. ./.pglite)
 *                         to persist between CLI runs.
 *
 * Both drivers expose the same Drizzle Postgres API; code should depend on `Db` only.
 */
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export { schema };
export type Schema = typeof schema;
export type Db = PgDatabase<PgQueryResultHKT, Schema>;

interface DbHandle {
  db: Db;
  kind: "neon" | "pglite";
  migrate: () => Promise<void>;
  close: () => Promise<void>;
}

/**
 * Committed SQL migrations. Resolved from the working directory (npm scripts,
 * vitest and `next` all run from the repo root), not import.meta.url, so it
 * also works inside the Next.js server bundle.
 */
export const MIGRATIONS_DIR = path.resolve(process.cwd(), "drizzle");

let cached: Promise<DbHandle> | null = null;

/** drizzle/ uses UNIQUE NULLS NOT DISTINCT (recall_matches_uq, review_items_uq), new in Postgres 15. */
export const MIN_SERVER_VERSION_NUM = 150000;

/** Throws a clear error when server_version_num is below MIN_SERVER_VERSION_NUM. */
export function assertServerVersionNum(versionNum: number): void {
  if (!Number.isFinite(versionNum) || versionNum < MIN_SERVER_VERSION_NUM)
    throw new Error(
      `Postgres ${versionNum} is too old: migrations need Postgres 15+ (UNIQUE NULLS NOT DISTINCT). Use a PG 15+ Neon branch.`,
    );
}

async function assertServerVersion(db: Db): Promise<void> {
  const { sql } = await import("drizzle-orm");
  const res = (await db.execute(sql`select current_setting('server_version_num')::int as v`)) as unknown;
  const rows = Array.isArray(res) ? res : (res as { rows?: unknown[] }).rows;
  assertServerVersionNum(Number((rows?.[0] as { v?: number | string } | undefined)?.v));
}

async function openNeon(url: string): Promise<DbHandle> {
  const { Pool } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-serverless");
  const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
  const pool = new Pool({ connectionString: url });
  const db = drizzle({ client: pool, schema });
  return {
    db: db as unknown as Db,
    kind: "neon",
    migrate: async () => {
      await assertServerVersion(db as unknown as Db);
      await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
    },
    close: () => pool.end(),
  };
}

/** Open a PGlite database. `dataDir` undefined = in-memory. Exported for tests. */
export async function openPglite(dataDir?: string): Promise<DbHandle> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = dataDir ? new PGlite(dataDir) : new PGlite();
  const db = drizzle({ client, schema });
  return {
    db: db as unknown as Db,
    kind: "pglite",
    migrate: async () => {
      await assertServerVersion(db as unknown as Db);
      await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
    },
    close: () => client.close(),
  };
}

function open(): Promise<DbHandle> {
  const url = process.env.DATABASE_URL;
  if (url) return openNeon(url);
  return openPglite(process.env.PGLITE_DIR || undefined);
}

/** Process-wide handle (one Pool / one PGlite instance). */
export function getDbHandle(): Promise<DbHandle> {
  cached ??= open();
  return cached;
}

export async function getDb(): Promise<Db> {
  return (await getDbHandle()).db;
}

/** Apply pending migrations from drizzle/ to whichever database getDb() uses. */
export async function migrateDb(): Promise<void> {
  await (await getDbHandle()).migrate();
}

export async function closeDb(): Promise<void> {
  if (!cached) return;
  const handle = await cached;
  cached = null;
  await handle.close();
}

/** Approximate on-disk size of the current database, for ingest_runs.db_size_bytes. */
export async function dbSizeBytes(db: Db): Promise<number | null> {
  const { sql } = await import("drizzle-orm");
  try {
    const res = (await db.execute(sql`select pg_database_size(current_database())::bigint as size`)) as unknown;
    const rows = Array.isArray(res) ? res : (res as { rows?: unknown[] }).rows;
    const first = rows?.[0] as { size?: string | number } | undefined;
    return first?.size == null ? null : Number(first.size);
  } catch {
    return null;
  }
}
