import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GET } from "../app/api/cron/nightly/route";
import { buildIresExportUrl, classificationYearRanges, iresRowKey } from "@/ingest/fda-ires";
import { windowSlices } from "@/jobs/nightly";

describe("cron route auth", () => {
  it("rejects requests without the bearer secret", async () => {
    process.env.CRON_SECRET = "s3cret";
    const res = await GET(new Request("http://x/api/cron/nightly", { headers: { authorization: "Bearer wrong" } }));
    expect(res.status).toBe(401);
    const none = await GET(new Request("http://x/api/cron/nightly"));
    expect(none.status).toBe(401);
  });
  it("rejects everything when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(new Request("http://x/api/cron/nightly", { headers: { authorization: "Bearer " } }));
    expect(res.status).toBe(401);
  });
});

describe("iRES helpers", () => {
  it("builds the CVM export URL with MM/DD/YYYY bounds", () => {
    const u = new URL(buildIresExportUrl({ from: "2019-01-01", to: "2019-12-31" }));
    expect(u.searchParams.get("action")).toBe("export.getExportCSVResult");
    const criteria = JSON.parse(u.searchParams.get("criteria")!) as Record<string, unknown>[];
    expect(criteria).toContainEqual({ centercd: ["CVM"] });
    expect(criteria).toContainEqual({ centerclassificationdtfrom: "01/01/2019" });
    expect(criteria).toContainEqual({ centerclassificationdtto: "12/31/2019" });
  });
  it("year ranges and row keys", () => {
    expect(classificationYearRanges(2016, 2017)).toEqual([
      { from: "2016-01-01", to: "2016-12-31" },
      { from: "2017-01-01", to: "2017-12-31" },
    ]);
    expect(iresRowKey("82018", "V-0015-2020", "x", null)).toBe("82018:V-0015-2020");
    expect(iresRowKey("1", null, "x", "y")).toMatch(/^1:h:[0-9a-f]{16}$/);
    expect(iresRowKey("1", null, "x", "y")).toBe(iresRowKey("1", null, "x", "y"));
  });
  it("nightly window covers >= 365 days in contiguous slices", () => {
    const s = windowSlices(new Date("2026-10-18T07:00:00Z"), 400);
    expect(s[0]!.from).toBe("2025-09-13");
    expect(s.at(-1)!.to).toBe("2026-10-18");
    for (let i = 1; i < s.length; i++) {
      const prevEnd = new Date(`${s[i - 1]!.to}T00:00:00Z`).getTime();
      expect(new Date(`${s[i]!.from}T00:00:00Z`).getTime() - prevEnd).toBe(86_400_000);
    }
  });
});

describe("data/ hygiene", () => {
  it("never mentions the fictional mockup brands", async () => {
    const root = path.resolve("data");
    const files: string[] = [];
    const walk = async (d: string) => {
      for (const e of await readdir(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) await walk(p);
        else files.push(p);
      }
    };
    await walk(root);
    for (const f of files) expect(await readFile(f, "utf8"), f).not.toMatch(/harrow\s*(&|and)\s*finch|kettle\s*creek|ridgeline/i);
  });
});
