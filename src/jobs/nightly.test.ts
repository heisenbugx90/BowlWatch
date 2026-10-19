import { readFileSync } from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { schema, type Db } from "@/db/client";
import { createTestDb } from "../../test/helpers/db";
import { runNightly } from "./nightly";

let db: Db;
let close: () => Promise<void>;
beforeEach(async () => {
  ({ db, close } = await createTestDb());
});
afterEach(async () => {
  await close();
});

const csv2026 = readFileSync(path.resolve("test/fixtures/ires/live_cvm_2026.csv"), "utf8");
const listing = readFileSync(path.resolve("test/fixtures/listing/recalls-market-withdrawals.live.animal-vet.sample.json"), "utf8");
const header = csv2026.split("\n")[0]!;

describe("runNightly (no network)", () => {
  it("pulls the iRES window and the live listing, records runs", async () => {
    let iresCalls = 0;
    const fetchImpl = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("accessdata.fda.gov")) return new Response(iresCalls++ === 0 ? csv2026 : header + "\n");
      return new Response(listing);
    }) as typeof fetch;
    const res = await runNightly(db, { now: new Date("2026-10-18T07:00:00Z"), skipMatch: true, fetch: { fetchImpl, backoffMs: 0 } });
    expect(res.errors).toEqual([]);
    expect(iresCalls).toBe(3); // 400 days in 200-day slices
    expect(res.ires!.rowsNew).toBe(174);
    expect(res.listing!.rowsNew).toBe(27);
    const runs = await db.select().from(schema.ingestRuns);
    expect(runs.map((r) => r.source).sort()).toEqual(["fda_ires", "fda_listing"]);
    expect(runs.every((r) => r.finishedAt)).toBe(true);

    const again = await runNightly(db, { now: new Date("2026-10-19T07:00:00Z"), skipMatch: true, fetch: { fetchImpl, backoffMs: 0 } });
    expect(again.ires!.rowsNew + again.listing!.rowsNew).toBe(0);
  });

  it("isolates stages: an iRES block is recorded and the listing still loads", async () => {
    const fetchImpl = (async (input: string | URL | Request) => {
      if (String(input).includes("accessdata.fda.gov"))
        return new Response(null, { status: 302, headers: { location: "https://www.accessdata.fda.gov/apology_objects/abuse-detection-apology.html" } });
      return new Response(listing);
    }) as typeof fetch;
    const res = await runNightly(db, { now: new Date("2026-10-18T07:00:00Z"), skipMatch: true, fetch: { fetchImpl, backoffMs: 0 } });
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors[0]!.message).toMatch(/abuse detection/);
    expect(res.listing!.rowsNew).toBe(27);
    const [run] = await db.select().from(schema.ingestRuns).where(sql`source = 'fda_ires'`);
    expect((run!.errors as unknown[]).length).toBeGreaterThan(0);
  });
});

describe("runNightly time budget", () => {
  it("runs the listing first and skips iRES slices once the budget is spent, recording both runs", async () => {
    let iresCalls = 0;
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).includes("accessdata.fda.gov")) {
        iresCalls++;
        // A hung FDA export: only the deadline-clipped timeout ends it.
        return new Promise<Response>((_r, reject) => init!.signal!.addEventListener("abort", () => reject(new Error("aborted"))));
      }
      return new Response(listing);
    }) as typeof fetch;
    const t0 = Date.now();
    const res = await runNightly(db, {
      now: new Date("2026-10-18T07:00:00Z"),
      skipMatch: true,
      budgetMs: 300,
      matchReserveMs: 0,
      fetch: { fetchImpl, backoffMs: 0 },
    });
    expect(Date.now() - t0).toBeLessThan(5_000);
    expect(res.listing!.rowsNew).toBe(27);
    expect(iresCalls).toBe(1); // later slices skipped, not attempted
    expect(res.errors.filter((e) => /skipped: nightly time budget/.test(e.message))).toHaveLength(2);
    const runs = await db.select().from(schema.ingestRuns);
    expect(runs.every((r) => r.finishedAt)).toBe(true);
  });
});
