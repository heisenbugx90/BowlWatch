import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listingItemsToEvents, parseListing } from "./fda-listing";

const load = (kind: "live" | "static") =>
  JSON.parse(readFileSync(path.resolve(`test/fixtures/listing/recalls-market-withdrawals.${kind}.animal-vet.sample.json`), "utf8")) as unknown;

describe("parseListing", () => {
  it("parses the live and static samples", () => {
    const live = parseListing(load("live"));
    const stat = parseListing(load("static"));
    expect(live).toHaveLength(27);
    expect(stat).toHaveLength(15);
    const fi = live[0]!;
    expect(fi.brandName).toBe("FI");
    expect(fi.date).toBe("2026-09-08");
    expect(fi.productType).toBe("Animal & Veterinary");
    expect(fi.noticeUrl).toBe(`https://www.fda.gov${fi.path}`);
    for (const it of [...live, ...stat]) {
      expect(it.brandName).not.toMatch(/[<>]/);
      expect(it.noticeUrl).toMatch(/^https:\/\/www\.fda\.gov\/[^/]/);
    }
    expect(stat[0]!.brandName).toBe("Triumph, Evolve, Nature Farms, Elm and others");
  });

  it("filters out non-animal items, bad shapes and unsafe paths", () => {
    const base = {
      field_change_date_2: "01/02/2025",
      field_brand_name: '<a href="/x">Brand<script>alert(1)</script></a>',
      field_product_description: "Dog food",
      field_recall_reason_description: "Salmonella",
      field_company_name: "Co",
      field_regulated_product_field: "Animal &amp; Veterinary",
    };
    const items = parseListing([
      { ...base, path: "/safety/recalls/ok" },
      { ...base, path: "/safety/recalls/ok" }, // duplicate
      { ...base, path: "//evil.example/x" },
      { ...base, path: "https://evil.example/x" },
      { ...base, path: "javascript:alert(1)" },
      { ...base, path: "/safety/recalls/human", field_regulated_product_field: "Food &amp; Beverages" },
      { path: 42 },
      null,
      "junk",
    ]);
    expect(items.map((i) => i.path)).toEqual(["/safety/recalls/ok"]);
    expect(items[0]!.brandName).toBe("Brand");
    expect(parseListing({ data: [{ ...base, path: "/a" }] })).toHaveLength(1);
    expect(parseListing("nope")).toEqual([]);
  });
});

describe("listingItemsToEvents", () => {
  it("makes one fda_listing event per item keyed by path", () => {
    const items = parseListing(load("live"));
    const events = listingItemsToEvents(items);
    expect(events).toHaveLength(items.length);
    const e = events[0]!;
    expect(e.source).toBe("fda_listing");
    expect(e.sourceEventId).toBe(items[0]!.path);
    expect(e.noticeUrl).toBe(items[0]!.noticeUrl);
    expect(e.products).toHaveLength(1);
    expect(e.products[0]!.rowKey).toBe(items[0]!.path);
    expect(e.products[0]!.productDescription).toBe("FI Supplements");
  });
});
