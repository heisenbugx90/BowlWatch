import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractUpcs,
  fetchIresRows,
  IRES_ROW_CAP,
  iresDateToIso,
  iresRowsToEvents,
  parseIresCsv,
} from "./fda-ires";

const fixture = (year: number) => readFileSync(path.resolve(`test/fixtures/ires/live_cvm_${year}.csv`), "utf8");

const HEADER =
  "Product Type,Recently Updated Record,Last Modified Date,Event ID,Status,Recalling Firm,Recall Number,Classification,Product Description,Product Quantity,Reason for Recall,Recall Initiation Date,Center Classification Date,Termination Date,Report Date,Code Info";
const line = (cells: string[]) => cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");

describe("parseIresCsv on real exports", () => {
  it("parses every fixture year by header name", () => {
    for (let y = 2016; y <= 2026; y++) {
      const rows = parseIresCsv(fixture(y));
      expect(rows.length, String(y)).toBeGreaterThan(50);
      expect(rows.length, String(y)).toBeLessThan(IRES_ROW_CAP);
      expect(new Set(rows.map((r) => r.rowKey)).size, String(y)).toBe(rows.length);
      for (const r of rows) {
        expect(r.eventId).toMatch(/^\d+$/);
        expect(JSON.stringify(r)).not.toContain("\u00BF");
      }
    }
  });

  it("maps a known 2019 row (Hill's vitamin D)", () => {
    const rows = parseIresCsv(fixture(2019));
    expect(rows).toHaveLength(482);
    const r = rows.find((x) => x.rowKey === "82018:V-0015-2020")!;
    expect(r.recallingFirm).toBe("Hill's Pet Nutrition Inc");
    expect(r.classification).toBe("Class I");
    expect(r.initiatedOn).toBe("2019-01-30");
    expect(r.classifiedOn).toBe("2019-10-05");
    expect(r.terminatedOn).toBe("2021-12-21");
    expect(r.productQuantity).toBeNull(); // "N/A"
    expect(r.codeInfo).toContain("SKU 3389: 092020T28");
    expect(r.raw["Event ID"]).toBe("82018");
  });

  it("joins the repeated More Code Info columns (2022) and hashes N/A recall numbers", () => {
    const rows = parseIresCsv(fixture(2022));
    const more = rows.find((r) => r.rowKey === "90404:V-0177-2022")!;
    expect(more.moreCodeInfo!.length).toBeGreaterThan(1000);
    expect(Object.keys(more.raw).filter((k) => k.startsWith("More Code Info"))).toHaveLength(7);
    const na = rows.filter((r) => r.recallNumber === null);
    expect(na.length).toBeGreaterThan(0);
    for (const r of na) expect(r.rowKey).toMatch(new RegExp(`^${r.eventId}:h:[0-9a-f]{16}$`));
  });
});

describe("parseIresCsv edge cases", () => {
  it("handles BOM, quoted newlines, U+00BF, tabbed values, missing optional columns", () => {
    const csv =
      "\uFEFF" +
      HEADER +
      "\r\n" +
      line([
        "Veterinary", "No", "03/04/2024", "123", "Ongoing", "Acme Pet\u00BFs LLC", "N/A", "Class II",
        "Acme\u00BF Chicken Dog Food, 5 lb bag,\nUPC 0 12345 67890 5", "N/A", "Salmonella", "02/30/2024",
        "03/01/2024", "", "03/06/2024", "Lot 1234\nLot 5678 <b>x</b>",
      ]) +
      "\r\n\r\n";
    const [r, ...rest] = parseIresCsv(csv);
    expect(rest).toHaveLength(0);
    expect(r!.eventId).toBe("123");
    expect(r!.recallingFirm).toBe("Acme Pets LLC");
    expect(r!.productDescription).toBe("Acme Chicken Dog Food, 5 lb bag, UPC 0 12345 67890 5");
    expect(r!.codeInfo).toBe("Lot 1234\nLot 5678 x");
    expect(r!.moreCodeInfo).toBeNull();
    expect(r!.recallNumber).toBeNull();
    expect(r!.rowKey).toMatch(/^123:h:/);
    expect(r!.initiatedOn).toBeNull(); // Feb 30 is not a date
    expect(r!.terminatedOn).toBeNull();
    expect(r!.lastModified).toBe("2024-03-04");
  });

  it("rejects HTML and non-iRES CSV", () => {
    expect(() => parseIresCsv("<!DOCTYPE html><html>Sorry</html>")).toThrow(/HTML/);
    expect(() => parseIresCsv("a,b\n1,2")).toThrow(/missing column/);
    expect(parseIresCsv("")).toEqual([]);
    expect(parseIresCsv(HEADER + "\n")).toEqual([]);
  });

  it("converts dates", () => {
    expect(iresDateToIso("1/2/2020")).toBe("2020-01-02");
    expect(iresDateToIso("2020-01-02")).toBe("2020-01-02");
    expect(iresDateToIso("N/A")).toBeNull();
    expect(iresDateToIso("13/01/2020")).toBeNull();
  });
});

describe("extractUpcs", () => {
  it("finds labelled UPCs in their common shapes, as 10-digit cores", () => {
    expect(extractUpcs("UPC 0 13423 33051 7) and 16 oz (UPC 0 13423 33021 0) bags")).toEqual(["1342333051", "1342333021"]);
    expect(extractUpcs("UPC: 7910005430 on flat case and 7910052543 on cans; Distributed")).toEqual(["7910005430", "7910052543"]);
    expect(extractUpcs("UPC 8-40243-10017-0")).toEqual(["4024310017"]);
    expect(extractUpcs("UPC 38100 19190) and 20lb")).toEqual(["3810019190"]);
    expect(extractUpcs("UPC 8 50025 54628 7 4 oz (113g)")).toEqual(["5002554628"]);
  });
  it("ignores unlabelled numbers, lot numbers and short codes", () => {
    expect(extractUpcs("Lot 1000016385 Best By 4/30/2024")).toEqual([]);
    expect(extractUpcs("UPC 94308 00214 Lot: 1000016385")).toEqual(["9430800214"]);
    expect(extractUpcs("UPC Code:  20109")).toEqual([]);
    expect(extractUpcs(null)).toEqual([]);
  });
});

describe("iresRowsToEvents", () => {
  it("groups rows by event with event-level fields", () => {
    const events = iresRowsToEvents(parseIresCsv(fixture(2019)));
    expect(events).toHaveLength(88);
    const ev = events.find((e) => e.sourceEventId === "82018")!;
    expect(ev.source).toBe("fda_ires");
    expect(ev.products.length).toBeGreaterThan(1);
    expect(ev.firm).toBe("Hill's Pet Nutrition Inc");
    expect(ev.initiatedOn).toBe("2019-01-30");
    expect(ev.enforcementReportUrl).toContain("accessdata.fda.gov");
    const total = events.reduce((n, e) => n + e.products.length, 0);
    expect(total).toBe(482);
  });

  it("takes the most severe classification and only terminates when every row is terminated", () => {
    const csv = [
      HEADER,
      line(["Veterinary", "No", "01/01/2024", "9", "Terminated", "F", "V-1-2024", "Class II", "A", "", "r", "01/01/2024", "01/02/2024", "02/01/2024", "01/03/2024", "c1"]),
      line(["Veterinary", "No", "01/05/2024", "9", "Ongoing", "F", "V-2-2024", "Class I", "B", "", "r", "01/01/2024", "01/02/2024", "", "01/03/2024", "c2"]),
    ].join("\n");
    const [ev] = iresRowsToEvents(parseIresCsv(csv));
    expect(ev!.classification).toBe("Class I");
    expect(ev!.status).toBe("Ongoing");
    expect(ev!.terminatedOn).toBeNull();
    expect(ev!.lastModified).toBe("2024-01-05");
  });
});

describe("fetchIresRows", () => {
  it("halves the range when an export hits the row cap", async () => {
    const rowsFor = (n: number, prefix: string) =>
      [HEADER, ...Array.from({ length: n }, (_, i) => line(["Veterinary", "No", "", `${prefix}${i}`, "Ongoing", "F", `V-${prefix}${i}`, "Class II", "x", "", "", "", "", "", "", ""]))].join("\n");
    const seen: string[] = [];
    const fetchImpl = (async (input: string | URL | Request) => {
      const criteria = JSON.parse(new URL(String(input)).searchParams.get("criteria")!) as Record<string, string>[];
      const from = criteria.find((c) => "centerclassificationdtfrom" in c)!.centerclassificationdtfrom!;
      const to = criteria.find((c) => "centerclassificationdtto" in c)!.centerclassificationdtto!;
      seen.push(`${from}-${to}`);
      return new Response(from === "01/01/2024" && to === "12/31/2024" ? rowsFor(IRES_ROW_CAP, "a") : rowsFor(10, from.slice(0, 2)));
    }) as typeof fetch;
    const rows = await fetchIresRows({ from: "2024-01-01", to: "2024-12-31" }, { fetchImpl, backoffMs: 0 });
    expect(seen).toEqual(["01/01/2024-12/31/2024", "01/01/2024-07/01/2024", "07/02/2024-12/31/2024"]);
    expect(rows).toHaveLength(20);
  });
});
