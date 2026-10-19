/**
 * Persist ingested events. OWNER: ingestion agent.
 *
 * - Upsert on (source, source_event_id) and on recall_products.row_key, so status,
 *   termination date and classification changes are picked up on every re-pull.
 *   Stored row_key = `${source}:${input.rowKey}` (globally unique across sources).
 * - Set last_seen_at = now on every pull; first_seen_at only on insert.
 * - Never touch pet_food on update (classification belongs to the matcher), except
 *   reset it to 'unreviewed' when the event's product rows changed.
 * - One ingest_runs row per run, with db_size_bytes from dbSizeBytes().
 */
import { and, eq, inArray } from "drizzle-orm";
import { dbSizeBytes, schema, type Db } from "../db/client";
import type { EventInput, IngestError, ProductInput, UpsertStats } from "../types";

const { recallEvents, recallProducts, ingestRuns } = schema;

/** Events per transaction: keeps transactions short on Neon while avoiding one round trip per commit. */
const CHUNK = 50;

const storedRowKey = (source: string, rowKey: string) => `${source}:${rowKey}`;

type EventRow = typeof recallEvents.$inferSelect;
type ProductRow = typeof recallProducts.$inferSelect;

function eventValues(e: EventInput) {
  return {
    firm: e.firm,
    noticeUrl: e.noticeUrl,
    enforcementReportUrl: e.enforcementReportUrl,
    initiatedOn: e.initiatedOn,
    classifiedOn: e.classifiedOn,
    reportDate: e.reportDate,
    terminatedOn: e.terminatedOn,
    status: e.status,
    classification: e.classification,
    reason: e.reason,
    lastModified: e.lastModified,
  };
}

/** Fields whose change counts as an update (raw and last_seen_at are refreshed regardless). */
const EVENT_FIELDS = [
  "firm",
  "noticeUrl",
  "enforcementReportUrl",
  "initiatedOn",
  "classifiedOn",
  "reportDate",
  "terminatedOn",
  "status",
  "classification",
  "reason",
  "lastModified",
] as const;

function eventChanged(prev: EventRow, next: ReturnType<typeof eventValues>): boolean {
  return EVENT_FIELDS.some((k) => (prev[k] ?? null) !== (next[k] ?? null));
}

function productValues(p: ProductInput) {
  return {
    recallNumber: p.recallNumber,
    productDescription: p.productDescription,
    codeInfo: p.codeInfo,
    moreCodeInfo: p.moreCodeInfo,
    upcs: [...new Set(p.upcs)].sort(),
  };
}

function productChanged(prev: ProductRow, next: ReturnType<typeof productValues>): boolean {
  return (
    prev.recallNumber !== next.recallNumber ||
    prev.productDescription !== next.productDescription ||
    prev.codeInfo !== next.codeInfo ||
    prev.moreCodeInfo !== next.moreCodeInfo ||
    [...prev.upcs].sort().join(",") !== next.upcs.join(",")
  );
}

/** Same (source, sourceEventId) twice in one batch: merge products, last event fields win. */
function dedupe(events: EventInput[]): EventInput[] {
  const map = new Map<string, EventInput>();
  for (const e of events) {
    const key = `${e.source}\u0000${e.sourceEventId}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...e, products: [...e.products] });
      continue;
    }
    const products = new Map(prev.products.map((p) => [p.rowKey, p]));
    for (const p of e.products) products.set(p.rowKey, p);
    map.set(key, { ...e, products: [...products.values()] });
  }
  for (const e of map.values()) e.products = [...new Map(e.products.map((p) => [p.rowKey, p])).values()];
  return [...map.values()];
}

async function upsertOne(tx: Db, e: EventInput, now: Date): Promise<UpsertStats> {
  const stats: UpsertStats = { rowsRead: e.products.length, rowsNew: 0, rowsUpdated: 0 };
  const values = eventValues(e);
  const [existing] = await tx
    .select()
    .from(recallEvents)
    .where(and(eq(recallEvents.source, e.source), eq(recallEvents.sourceEventId, e.sourceEventId)))
    .limit(1);

  if (!existing) {
    const [ins] = await tx
      .insert(recallEvents)
      .values({ source: e.source, sourceEventId: e.sourceEventId, ...values, raw: e.raw ?? {}, firstSeenAt: now, lastSeenAt: now })
      .returning({ id: recallEvents.id });
    if (e.products.length)
      await tx.insert(recallProducts).values(
        e.products.map((p) => ({ eventId: ins!.id, rowKey: storedRowKey(e.source, p.rowKey), ...productValues(p), raw: p.raw ?? {} })),
      );
    stats.rowsNew = e.products.length;
    return stats;
  }

  const evChanged = eventChanged(existing, values);
  const keys = e.products.map((p) => storedRowKey(e.source, p.rowKey));
  const prevProducts = keys.length
    ? await tx.select().from(recallProducts).where(inArray(recallProducts.rowKey, keys))
    : [];
  const prevByKey = new Map(prevProducts.map((p) => [p.rowKey, p]));
  let productsChanged = false;

  for (const p of e.products) {
    const key = storedRowKey(e.source, p.rowKey);
    const next = productValues(p);
    const prev = prevByKey.get(key);
    if (!prev) {
      await tx.insert(recallProducts).values({ eventId: existing.id, rowKey: key, ...next, raw: p.raw ?? {} });
      stats.rowsNew++;
      productsChanged = true;
    } else if (prev.eventId !== existing.id || productChanged(prev, next)) {
      await tx.update(recallProducts).set({ eventId: existing.id, ...next, raw: p.raw ?? {} }).where(eq(recallProducts.id, prev.id));
      stats.rowsUpdated++;
      productsChanged = true;
    } else {
      await tx.update(recallProducts).set({ raw: p.raw ?? {} }).where(eq(recallProducts.id, prev.id));
      if (evChanged) stats.rowsUpdated++;
    }
  }

  await tx
    .update(recallEvents)
    .set({
      ...values,
      raw: e.raw ?? {},
      lastSeenAt: now,
      // Classification belongs to the matcher; only reset it when what it classified changed.
      ...(productsChanged ? { petFood: "unreviewed" as const } : {}),
    })
    .where(eq(recallEvents.id, existing.id));
  return stats;
}

/**
 * Idempotent upsert of events and their product rows. Ingesting the same data twice
 * yields rowsNew = rowsUpdated = 0 the second time. Products that disappear from a
 * source are kept (history), never deleted here.
 */
export async function upsertEvents(db: Db, events: EventInput[], opts: { now?: Date } = {}): Promise<UpsertStats> {
  const now = opts.now ?? new Date();
  const total: UpsertStats = { rowsRead: 0, rowsNew: 0, rowsUpdated: 0 };
  const list = dedupe(events);
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    await db.transaction(async (tx) => {
      for (const e of chunk) {
        const s = await upsertOne(tx as unknown as Db, e, now);
        total.rowsRead += s.rowsRead;
        total.rowsNew += s.rowsNew;
        total.rowsUpdated += s.rowsUpdated;
      }
    });
  }
  return total;
}

export async function startIngestRun(db: Db, source: string): Promise<number> {
  const [row] = await db.insert(ingestRuns).values({ source }).returning({ id: ingestRuns.id });
  return row!.id;
}

export async function finishIngestRun(
  db: Db,
  runId: number,
  stats: UpsertStats,
  errors: IngestError[],
): Promise<void> {
  await db
    .update(ingestRuns)
    .set({
      finishedAt: new Date(),
      rowsRead: stats.rowsRead,
      rowsNew: stats.rowsNew,
      rowsUpdated: stats.rowsUpdated,
      errors,
      dbSizeBytes: await dbSizeBytes(db),
    })
    .where(eq(ingestRuns.id, runId));
}
