/**
 * Matcher accuracy on the 40 hand-annotated FDA CVM rows, with the test-only
 * catalog in test/fixtures/catalog-mini (independent of data/).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { FIXTURES_DIR as FIXTURES, miniIndex } from "../../test/helpers/catalog-mini";
import {
  evaluateClassification,
  evaluateFixtures,
  evaluateLots,
  loadFixtureFiles,
  type FixtureSummary,
} from "./evaluate";
import type { CatalogIndex } from "./matcher";

let index: CatalogIndex;
let files: Awaited<ReturnType<typeof loadFixtureFiles>>;
let summary: FixtureSummary;

beforeAll(async () => {
  index = await miniIndex();
  files = await loadFixtureFiles(FIXTURES);
  summary = evaluateFixtures(files.fixtures, index);
  const lines = summary.results.map(
    (r) =>
      `${r.pass ? "PASS" : "FAIL"} ${r.recallNumber.padEnd(12)} ${r.eventId.padEnd(6)} ${r.matches
        .map((m) => `${m.lineId ?? m.brandId}${m.needsReview ? "?" : ""}`)
        .join(", ")}${r.failures.length ? `  <- ${r.failures.join("; ")}` : ""}`,
  );
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  console.log(
    [
      `fixtures: ${summary.passed}/${summary.results.length} pass`,
      `brand precision ${pct(summary.brand.precision)} recall ${pct(summary.brand.recall)} (tp ${summary.brand.tp}, fp ${summary.brand.fp}, fn ${summary.brand.fn})`,
      `line  precision ${pct(summary.line.precision)} recall ${pct(summary.line.recall)} (tp ${summary.line.tp}, fp ${summary.line.fp}, fn ${summary.line.fn})`,
      ...lines,
    ].join("\n"),
  );
});

describe("40 annotated fixtures (catalog-mini)", () => {
  it("every fixture passes", () => {
    const failed = summary.results.filter((r) => !r.pass).map((r) => `${r.recallNumber}: ${r.failures.join("; ")}`);
    expect(failed).toEqual([]);
  });

  it("brand and line precision/recall", () => {
    expect(summary.brand.precision).toBe(1);
    expect(summary.brand.recall).toBe(1);
    expect(summary.line.precision).toBe(1);
    expect(summary.line.recall).toBe(1);
  });

  it("brand-from-firm-only matches are flagged and never line level", () => {
    for (const r of summary.results)
      for (const m of r.matches) if (m.needsReview) expect(m.level).toBe("brand");
    const weak = summary.results.filter((r) => r.matches.some((m) => m.needsReview)).map((r) => r.recallNumber);
    // Raaw Energy and G & C Raw are named only by the recalling firm.
    expect(weak).toEqual(expect.arrayContaining(["V-0142-2026", "V-0049-2019"]));
  });

  it("co-packer firms never imply a brand", () => {
    const simmons = summary.results.filter((r) => r.eventId === "76403");
    expect(simmons.length).toBeGreaterThan(0);
    for (const r of simmons) expect(r.matches.every((m) => !m.needsReview)).toBe(true);
  });
});

describe("historical exports", () => {
  it("classifies every event in the 552-row pet-food window as pet food", () => {
    const petIds = new Set(files.window.map((r) => r["Event ID"] ?? ""));
    const c = evaluateClassification(
      files.window,
      petIds,
      index,
    );
    console.log(`552-row window: ${c.events} events, recall ${(c.yes.recall * 100).toFixed(1)}%\n${c.falseNegatives.join("\n")}`);
    expect(c.yes.recall).toBeGreaterThanOrEqual(0.97);
  });

  it("classification precision/recall over raw CVM exports (2016-10 onward)", () => {
    const petIds = new Set(files.window.map((r) => r["Event ID"] ?? ""));
    const c = evaluateClassification(files.csvRows, petIds, index);
    console.log(
      [
        `CVM exports: ${c.events} events (${c.positives} pet food), precision ${(c.yes.precision * 100).toFixed(1)}%, recall ${(c.yes.recall * 100).toFixed(1)}%, unreviewed ${c.unreviewed}`,
        "false positives:",
        ...c.falsePositives,
        "false negatives:",
        ...c.falseNegatives,
      ].join("\n"),
    );
    // The ground truth includes 18 judge-confirmed events whose brands exist only in data/
    // (Elm, Abound, Ollie, ...); test/real-catalog.test.ts holds the strict floor.
    expect(c.yes.recall).toBeGreaterThanOrEqual(0.88);
    expect(c.yes.precision).toBeGreaterThanOrEqual(0.9);
  });

  it("lot parsing yields a clean rule for most pet-food rows", () => {
    const s = evaluateLots(files.window);
    console.log(`lot rules: ${JSON.stringify(s)}`);
    expect(s.withRules / s.rows).toBeGreaterThan(0.99);
    expect(s.withCleanRule / s.rows).toBeGreaterThan(0.75);
  });
});
