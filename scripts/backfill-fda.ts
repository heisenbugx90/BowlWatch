/**
 * Historical load for the validation set.
 *
 * npm run backfill:fda                                   iRES CVM by classification year 2016..this year,
 *                                                        plus the static (2017-2021) and live listing JSON
 * npm run backfill:fda -- --from 2019 --to 2019          only those classification years
 * npm run backfill:fda -- --file test/fixtures/ires/live_cvm_2019.csv [--file ...]   local CSVs (offline)
 * npm run backfill:fda -- --no-listing                   skip the listing JSON
 * npm run backfill:fda -- --min-initiated 2016-10-01     keep only events initiated on/after this date
 *                                                        (default 2016-10-01; "none" keeps everything)
 * npm run backfill:fda -- --skip-match                   do not run the matcher afterwards
 *
 * Set PGLITE_DIR=./.pglite to keep the data between runs (or DATABASE_URL for Neon).
 */
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { classificationYearRanges, fetchIresRows, iresRowsToEvents, parseIresCsv } from "../src/ingest/fda-ires";
import { fetchListing, LISTING_ARCHIVE_URL, LISTING_LIVE_URL, listingItemsToEvents, parseListing } from "../src/ingest/fda-listing";
import { finishIngestRun, startIngestRun, upsertEvents } from "../src/ingest/store";
import { matchAll } from "../src/match/run";
import type { EventInput, IngestError, IresRow, UpsertStats } from "../src/types";
import { openMigrated, runCli } from "./_cli";

/** Pause between iRES exports so a backfill does not look like a burst to FDA's abuse detection. */
const PAUSE_MS = 3_000;
const pause = () => new Promise((r) => setTimeout(r, PAUSE_MS));

runCli(async () => {
  const thisYear = new Date().getUTCFullYear();
  const { values } = parseArgs({
    options: {
      from: { type: "string" },
      to: { type: "string" },
      file: { type: "string", multiple: true },
      "no-listing": { type: "boolean", default: false },
      "min-initiated": { type: "string", default: "2016-10-01" },
      "skip-match": { type: "boolean", default: false },
    },
  });
  const minInitiated = values["min-initiated"] === "none" ? null : values["min-initiated"];
  if (minInitiated && !/^\d{4}-\d{2}-\d{2}$/.test(minInitiated)) throw new Error("--min-initiated must be YYYY-MM-DD or none");

  const db = await openMigrated();
  const errors: IngestError[] = [];
  const zero = (): UpsertStats => ({ rowsRead: 0, rowsNew: 0, rowsUpdated: 0 });
  const add = (a: UpsertStats, b: UpsertStats) => {
    a.rowsRead += b.rowsRead;
    a.rowsNew += b.rowsNew;
    a.rowsUpdated += b.rowsUpdated;
  };
  /** Events initiated before the cutoff are out of the validation window; events with no date are kept. */
  const keep = (e: EventInput) => !minInitiated || !e.initiatedOn || e.initiatedOn >= minInitiated;

  // ---- iRES
  const ires = zero();
  let eventsKept = 0;
  let eventsDropped = 0;
  const runId = await startIngestRun(db, "fda_ires");
  const sources: { label: string; load: () => Promise<IresRow[]> }[] = values.file?.length
    ? values.file.map((f) => ({ label: f, load: async () => parseIresCsv(await readFile(f, "utf8")) }))
    : classificationYearRanges(Number(values.from ?? 2016), Number(values.to ?? values.from ?? thisYear)).map((r) => ({
        label: `classified ${r.from}..${r.to}`,
        load: () => fetchIresRows(r),
      }));
  for (const [i, s] of sources.entries()) {
    if (i > 0 && !values.file?.length) await pause();
    try {
      const rows = await s.load();
      const events = iresRowsToEvents(rows);
      const kept = events.filter(keep);
      eventsKept += kept.length;
      eventsDropped += events.length - kept.length;
      const st = await upsertEvents(db, kept);
      add(ires, st);
      console.log(`${s.label}: ${rows.length} rows, ${events.length} events, ${kept.length} kept; new ${st.rowsNew}, updated ${st.rowsUpdated}`);
    } catch (e) {
      errors.push({ at: new Date().toISOString(), stage: "backfill", message: (e as Error).message, context: { source: s.label } });
      console.error(`${s.label}: ${(e as Error).message}`);
    }
  }
  await finishIngestRun(db, runId, ires, errors);

  // ---- listing (static archive + live)
  const listing = zero();
  if (!values["no-listing"] && !values.file?.length) {
    const listingErrors: IngestError[] = [];
    const listingRun = await startIngestRun(db, "fda_listing");
    for (const url of [LISTING_ARCHIVE_URL, LISTING_LIVE_URL]) {
      try {
        const items = parseListing(await fetchListing(url));
        const st = await upsertEvents(db, listingItemsToEvents(items));
        add(listing, st);
        console.log(`listing ${url}: ${items.length} Animal & Veterinary items; new ${st.rowsNew}, updated ${st.rowsUpdated}`);
      } catch (e) {
        listingErrors.push({ at: new Date().toISOString(), stage: "backfill_listing", message: (e as Error).message, context: { url } });
        console.error(`listing ${url}: ${(e as Error).message}`);
      }
    }
    await finishIngestRun(db, listingRun, listing, listingErrors);
    errors.push(...listingErrors);
  }

  console.log("ires:", { ...ires, eventsKept, eventsDropped, minInitiated });
  console.log("listing:", listing);
  if (!values["skip-match"]) {
    try {
      console.log("match:", await matchAll(db));
    } catch (e) {
      errors.push({ at: new Date().toISOString(), stage: "match", message: (e as Error).message });
      console.error(`match: ${(e as Error).message}`);
    }
  }
  return errors.length ? 1 : 0;
});
