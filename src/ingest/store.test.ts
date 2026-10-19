import { readFileSync } from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { schema, type Db } from "@/db/client";
import { createTestDb } from "../../test/helpers/db";
import { iresRowsToEvents, parseIresCsv } from "./fda-ires";
import { listingItemsToEvents, parseListing } from "./fda-listing";
import { finishIngestRun, startIngestRun, upsertEvents } from "./store";
import type { EventInput } from "../types";

const { recallEvents, recallProducts, ingestRuns } = schema;

let db: Db;
let close: () => Promise<void>;
beforeEach(async () => {
  ({ db, close } = await createTestDb());
});
afterEach(async () => {
  await close();
});

const events2019 = () =>
  iresRowsToEvents(parseIresCsv(readFileSync(path.resolve("test/fixtures/ires/live_cvm_2019.csv"), "utf8")));
const count = async (t: typeof recallEvents | typeof recallProducts) =>
  Number((await db.select({ n: sql<number>`count(*)` }).from(t))[0]!.n);

describe("upsertEvents", () => {
  it("is idempotent: ingesting twice creates no duplicates", async () => {
    const first = await upsertEvents(db, events2019(), { now: new Date("2026-01-01T00:00:00Z") });
    expect(first).toEqual({ rowsRead: 482, rowsNew: 482, rowsUpdated: 0 });
    const second = await upsertEvents(db, events2019(), { now: new Date("2026-01-02T00:00:00Z") });
    expect(second).toEqual({ rowsRead: 482, rowsNew: 0, rowsUpdated: 0 });
    expect(await count(recallEvents)).toBe(88);
    expect(await count(recallProducts)).toBe(482);
    const [ev] = await db.select().from(recallEvents).where(eq(recallEvents.sourceEventId, "82018"));
    expect(ev!.firstSeenAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(ev!.lastSeenAt.toISOString()).toBe("2026-01-02T00:00:00.000Z");
    const [p] = await db.select().from(recallProducts).where(eq(recallProducts.rowKey, "fda_ires:82018:V-0015-2020"));
    expect(p!.eventId).toBe(ev!.id);
  });

  it("picks up status / termination changes and keeps pet_food unless products change", async () => {
    const base: EventInput = {
      source: "fda_ires",
      sourceEventId: "777",
      firm: "Acme",
      noticeUrl: null,
      enforcementReportUrl: null,
      initiatedOn: "2024-01-01",
      classifiedOn: "2024-02-01",
      reportDate: "2024-02-07",
      terminatedOn: null,
      status: "Ongoing",
      classification: "Class II",
      reason: "Salmonella",
      lastModified: "2024-02-01",
      raw: {},
      products: [
        { rowKey: "777:V-1-2024", recallNumber: "V-1-2024", productDescription: "Acme Dog Food", codeInfo: "Lot 1", moreCodeInfo: null, upcs: [], raw: {} },
      ],
    };
    await upsertEvents(db, [base]);
    await db.update(recallEvents).set({ petFood: "yes" });

    const terminated = { ...base, status: "Terminated", terminatedOn: "2025-03-01", lastModified: "2025-03-01" };
    expect(await upsertEvents(db, [terminated])).toEqual({ rowsRead: 1, rowsNew: 0, rowsUpdated: 1 });
    let [ev] = await db.select().from(recallEvents);
    expect(ev!.status).toBe("Terminated");
    expect(ev!.terminatedOn).toBe("2025-03-01");
    expect(ev!.petFood).toBe("yes");

    const moreLots = {
      ...terminated,
      products: [{ ...base.products[0]!, codeInfo: "Lot 1, Lot 2" }, { ...base.products[0]!, rowKey: "777:V-2-2024", recallNumber: "V-2-2024" }],
    };
    expect(await upsertEvents(db, [moreLots])).toEqual({ rowsRead: 2, rowsNew: 1, rowsUpdated: 1 });
    [ev] = await db.select().from(recallEvents);
    expect(ev!.petFood).toBe("unreviewed");
    expect(await count(recallProducts)).toBe(2);
  });

  it("stores listing events alongside iRES events and merges duplicates within a batch", async () => {
    const items = parseListing(
      JSON.parse(readFileSync(path.resolve("test/fixtures/listing/recalls-market-withdrawals.live.animal-vet.sample.json"), "utf8")),
    );
    const evs = listingItemsToEvents(items);
    const st = await upsertEvents(db, [...evs, evs[0]!]);
    expect(st.rowsNew).toBe(items.length);
    const again = await upsertEvents(db, evs);
    expect(again.rowsNew + again.rowsUpdated).toBe(0);
    const rows = await db.select().from(recallEvents).where(eq(recallEvents.source, "fda_listing"));
    expect(rows).toHaveLength(items.length);
    expect(rows.every((r) => r.noticeUrl?.startsWith("https://www.fda.gov/"))).toBe(true);
  });
});

describe("ingest runs", () => {
  it("records counts, errors and database size", async () => {
    const id = await startIngestRun(db, "fda_ires");
    await finishIngestRun(db, id, { rowsRead: 3, rowsNew: 2, rowsUpdated: 1 }, [{ at: "t", stage: "fda_ires", message: "boom" }]);
    const [run] = await db.select().from(ingestRuns).where(eq(ingestRuns.id, id));
    expect(run!.finishedAt).toBeInstanceOf(Date);
    expect(run!.rowsNew).toBe(2);
    expect(run!.errors).toEqual([{ at: "t", stage: "fda_ires", message: "boom" }]);
    expect(run!.dbSizeBytes === null || run!.dbSizeBytes > 0).toBe(true);
  });
});
