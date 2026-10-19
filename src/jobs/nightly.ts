/**
 * The nightly job. Called by the Vercel Cron route and by `npm run ingest:fda`.
 *
 * 1. Listing: pull the live recalls listing (early warning + notice links). Runs
 *    first because it is small and is the stage that warns early.
 * 2. iRES: re-pull CVM records classified in the last IRES_WINDOW_DAYS days
 *    (in <= 200-day slices, split further if an export hits the 1000-row cap).
 * 3. matchAll() (also links listing items to iRES events).
 * Each stage is isolated: a failure is recorded in ingest_runs.errors and the
 * remaining stages still run.
 *
 * With `budgetMs` (the cron route sets it from maxDuration), fetches get a shared
 * deadline that leaves MATCH_RESERVE_MS for matching: once it passes, remaining
 * iRES slices are skipped and recorded as errors, so the function returns and
 * records its runs instead of being killed by the platform mid-fetch.
 */
import type { Db } from "../db/client";
import { buildIresExportUrl, fetchIresRows, iresRowsToEvents } from "../ingest/fda-ires";
import { fetchListing, LISTING_LIVE_URL, listingItemsToEvents, parseListing } from "../ingest/fda-listing";
import { finishIngestRun, startIngestRun, upsertEvents } from "../ingest/store";
import { matchAll } from "../match/run";
import type { FetchOptions } from "../ingest/http";
import type { DateRange, IngestError, NightlyResult, UpsertStats } from "../types";

/** Classification lag: median 42 days, max seen 811. 400 days covers all but outliers; backfill covers the rest. */
export const IRES_WINDOW_DAYS = 400;
/** Time kept back from the fetch stages for matchAll and bookkeeping. */
export const MATCH_RESERVE_MS = 60_000;

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Split [now - days, now] into consecutive slices of at most `sliceDays`. */
export function windowSlices(now: Date, days: number, sliceDays = 200): DateRange[] {
  const out: DateRange[] = [];
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let from = new Date(end.getTime() - days * 86_400_000);
  while (from <= end) {
    const to = new Date(Math.min(end.getTime(), from.getTime() + (sliceDays - 1) * 86_400_000));
    out.push({ from: isoDay(from), to: isoDay(to) });
    from = new Date(to.getTime() + 86_400_000);
  }
  return out;
}

const ZERO: UpsertStats = { rowsRead: 0, rowsNew: 0, rowsUpdated: 0 };
const add = (a: UpsertStats, b: UpsertStats): UpsertStats => ({
  rowsRead: a.rowsRead + b.rowsRead,
  rowsNew: a.rowsNew + b.rowsNew,
  rowsUpdated: a.rowsUpdated + b.rowsUpdated,
});

function toError(stage: string, e: unknown, context?: Record<string, unknown>): IngestError {
  return { at: new Date().toISOString(), stage, message: e instanceof Error ? e.message : String(e), context };
}

export interface NightlyOptions {
  now?: Date;
  skipIres?: boolean;
  skipListing?: boolean;
  skipMatch?: boolean;
  /** Passed to every fetch (tests inject fetchImpl here). */
  fetch?: FetchOptions;
  /** Wall-clock budget for the whole run in ms. Unset = no limit (CLI). */
  budgetMs?: number;
  /** Override MATCH_RESERVE_MS (tests). */
  matchReserveMs?: number;
}

export async function runNightly(db: Db, opts: NightlyOptions = {}): Promise<NightlyResult> {
  const now = opts.now ?? new Date();
  const startedAt = new Date().toISOString();
  const errors: IngestError[] = [];
  let ires: UpsertStats | null = null;
  let listing: UpsertStats | null = null;
  let matched = 0;
  let reviewItemsOpened = 0;
  const fetchDeadline =
    opts.budgetMs === undefined ? undefined : Date.now() + opts.budgetMs - (opts.matchReserveMs ?? MATCH_RESERVE_MS);
  const fetchOpts: FetchOptions = { ...opts.fetch, ...(fetchDeadline === undefined ? {} : { deadline: fetchDeadline }) };

  if (!opts.skipListing) {
    const runErrors: IngestError[] = [];
    let stats = ZERO;
    let runId: number | null = null;
    try {
      runId = await startIngestRun(db, "fda_listing");
      const items = parseListing(await fetchListing(LISTING_LIVE_URL, fetchOpts));
      stats = await upsertEvents(db, listingItemsToEvents(items), { now });
      listing = stats;
    } catch (e) {
      runErrors.push(toError("fda_listing", e, { url: LISTING_LIVE_URL }));
    } finally {
      if (runId !== null)
        await finishIngestRun(db, runId, stats, runErrors).catch((e) => runErrors.push(toError("fda_listing", e)));
      errors.push(...runErrors);
    }
  }

  if (!opts.skipIres) {
    const runErrors: IngestError[] = [];
    let stats = ZERO;
    let runId: number | null = null;
    try {
      runId = await startIngestRun(db, "fda_ires");
      for (const range of windowSlices(now, IRES_WINDOW_DAYS)) {
        if (fetchDeadline !== undefined && Date.now() >= fetchDeadline) {
          runErrors.push(toError("fda_ires", new Error("skipped: nightly time budget exhausted"), { range }));
          continue;
        }
        try {
          const rows = await fetchIresRows(range, fetchOpts); // splits the range itself if it hits the 1000-row cap
          stats = add(stats, await upsertEvents(db, iresRowsToEvents(rows), { now }));
        } catch (e) {
          runErrors.push(toError("fda_ires", e, { range, url: buildIresExportUrl(range) }));
        }
      }
      ires = stats;
    } catch (e) {
      runErrors.push(toError("fda_ires", e));
    } finally {
      if (runId !== null) await finishIngestRun(db, runId, stats, runErrors).catch((e) => runErrors.push(toError("fda_ires", e)));
      errors.push(...runErrors);
    }
  }

  if (!opts.skipMatch) {
    try {
      const m = await matchAll(db);
      matched = m.matchesWritten;
      reviewItemsOpened = m.reviewItemsOpened;
    } catch (e) {
      errors.push(toError("match", e));
    }
  }

  return { startedAt, finishedAt: new Date().toISOString(), ires, listing, matched, reviewItemsOpened, errors };
}
