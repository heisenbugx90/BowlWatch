/**
 * Integration test against the REAL catalog in data/ (the matcher unit tests use
 * test/fixtures/catalog-mini). Seeds data/ into PGlite, reads the catalog back the
 * way production does (loadSnapshotFromDb), scores the 40 annotated fixtures, and
 * runs ingestion -> matchAll end to end on one year of real iRES rows.
 *
 * Thresholds are floors, not targets: raise them as curation improves, and look at
 * `npm run report:validation` for the per-fixture list.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadCatalog, type Catalog } from "@/catalog/load";
import { seedCatalog } from "@/catalog/seed";
import { loadSnapshotFromDb, snapshotFromCatalog } from "@/catalog/snapshot";
import type { Db } from "@/db/client";
import { recallEvents, recallMatches, reviewItems } from "@/db/schema";
import { iresRowsToEvents, parseIresCsv } from "@/ingest/fda-ires";
import { upsertEvents } from "@/ingest/store";
import { evaluateClassification, evaluateFixtures, loadFixtureFiles, type FixtureRow } from "@/match/evaluate";
import { buildCatalogIndex } from "@/match/matcher";
import { matchAll } from "@/match/run";
import { createTestDb } from "./helpers/db";

const ROOT = path.resolve(__dirname, "..");
const FIXTURES = path.join(ROOT, "test/fixtures");

describe("real catalog (data/) in PGlite", () => {
  let db: Db;
  let close: () => Promise<void>;
  let catalog: Catalog;

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const res = await loadCatalog(path.join(ROOT, "data"));
    if (!res.ok) throw new Error(`data/ does not validate:\n${res.errors.join("\n")}`);
    catalog = res.catalog;
    await seedCatalog(db, catalog);
  }, 60_000);
  afterAll(async () => close?.());

  it("reads back from the database exactly what the YAML says", async () => {
    const fromDb = await loadSnapshotFromDb(db);
    const fromYaml = snapshotFromCatalog(catalog);
    const key = (a: { entityType: string; entityId: string; normalized: string; kind: string }) =>
      `${a.entityType}|${a.entityId}|${a.normalized}|${a.kind}`;
    expect(fromDb.brands.length).toBe(fromYaml.brands.length);
    expect(fromDb.lines.length).toBe(fromYaml.lines.length);
    expect(new Set(fromDb.aliases.map(key))).toEqual(new Set(fromYaml.aliases.map(key)));
  });

  it("scores the 40 annotated fixtures", async () => {
    const index = buildCatalogIndex(await loadSnapshotFromDb(db));
    const fixtures = JSON.parse(
      await readFile(path.join(FIXTURES, "fda_cvm_pet_recalls_40.json"), "utf8"),
    ) as FixtureRow[];
    const s = evaluateFixtures(fixtures, index);
    const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
    console.log(
      `real catalog: ${s.passed}/${s.results.length} fixtures pass; ` +
        `brand P ${pct(s.brand.precision)} R ${pct(s.brand.recall)}; line P ${pct(s.line.precision)} R ${pct(s.line.recall)}`,
    );
    // Known miss: V-0104-2021 "Meridian" (bare word is too generic to be an alias).
    expect(s.passed).toBeGreaterThanOrEqual(39);
    expect(s.brand.precision).toBeGreaterThanOrEqual(0.99);
    expect(s.brand.recall).toBeGreaterThanOrEqual(0.97);
    expect(s.line.precision).toBeGreaterThanOrEqual(0.97);
    expect(s.line.recall).toBeGreaterThanOrEqual(0.97);
  });

  it("classifies the 2016-2026 CVM exports (judge-corrected ground truth)", async () => {
    const files = await loadFixtureFiles(FIXTURES);
    const petIds = new Set(files.window.map((r) => r["Event ID"] ?? ""));
    const c = evaluateClassification(files.csvRows, petIds, buildCatalogIndex(await loadSnapshotFromDb(db)));
    expect(c.yes.recall).toBeGreaterThanOrEqual(0.99);
    expect(c.yes.precision).toBeGreaterThanOrEqual(0.97);
  });

  it("ingests a year of real iRES rows and matches them idempotently", async () => {
    const csv = await readFile(path.join(FIXTURES, "ires/live_cvm_2021.csv"), "utf8");
    const events = iresRowsToEvents(parseIresCsv(csv));
    await upsertEvents(db, events, { now: new Date("2026-10-18T07:00:00Z") });

    const first = await matchAll(db);
    expect(first.matchesWritten).toBeGreaterThan(0);

    // Midwestern Pet Foods, V-0104-2021: one row names ten brands.
    const [ev] = await db.select().from(recallEvents).where(eq(recallEvents.sourceEventId, "87625"));
    expect(ev?.petFood).toBe("yes");
    const brands = new Set(
      (await db.select().from(recallMatches).where(eq(recallMatches.eventId, ev!.id))).map((m) => m.brandId),
    );
    for (const b of ["canine-x", "earthborn-holistic", "sportmix", "pro-pac", "sportstrail"]) expect(brands).toContain(b);

    // Every match points at a brand/line that exists in the seeded catalog.
    const brandIds = new Set(catalog.brands.map((b) => b.id));
    const lineIds = new Set(catalog.brands.flatMap((b) => b.lines.map((l) => `${b.id}/${l.id}`)));
    for (const m of await db.select().from(recallMatches)) {
      expect(brandIds.has(m.brandId)).toBe(true);
      if (m.lineId) expect(lineIds.has(m.lineId)).toBe(true);
    }

    // Non-pet events (drugs, feed) produce no matches.
    const notPet = await db.select({ id: recallEvents.id }).from(recallEvents).where(eq(recallEvents.petFood, "no"));
    if (notPet.length) {
      const stray = await db
        .select()
        .from(recallMatches)
        .where(inArray(recallMatches.eventId, notPet.map((e) => e.id)));
      expect(stray).toEqual([]);
    }

    const reviewBefore = (await db.select().from(reviewItems)).length;
    const second = await matchAll(db);
    expect(second.matchesWritten).toBe(0);
    expect(second.lotRulesWritten).toBe(0);
    expect(second.reviewItemsOpened).toBe(0);
    expect((await db.select().from(reviewItems)).length).toBe(reviewBefore);
  }, 120_000);
});
