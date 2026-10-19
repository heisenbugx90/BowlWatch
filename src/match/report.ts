/**
 * Validation report for build step 2: run the matcher against the historical
 * fixtures (test/fixtures/fda_cvm_pet_recalls_40.json expectations, the 552-row
 * window, raw iRES CSVs) and report precision/recall of pet-food classification,
 * brand and line matches, and lot-rule parse rates. OWNER: matcher agent.
 *
 * Uses the real catalog in data/ (unlike the tests, which use
 * test/fixtures/catalog-mini), so the numbers show how far curation has come.
 */
import { DEFAULT_DATA_DIR, loadCatalog } from "../catalog/load";
import { snapshotFromCatalog } from "../catalog/snapshot";
import {
  DEFAULT_FIXTURES_DIR,
  evaluateClassification,
  evaluateFixtures,
  evaluateLots,
  loadFixtureFiles,
  PET_EVENT_OVERRIDES,
} from "./evaluate";
import { buildCatalogIndex } from "./matcher";

export interface ValidationReport {
  generatedAt: string;
  text: string; // human-readable summary printed by `npm run report:validation`
  metrics: Record<string, number>;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
/** Fixture text is untrusted: strip control characters before printing to a terminal. */
const safe = (s: string) => s.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ");

export async function buildValidationReport(
  opts: { fixturesDir?: string; dataDir?: string } = {},
): Promise<ValidationReport> {
  const loaded = await loadCatalog(opts.dataDir ?? DEFAULT_DATA_DIR);
  if (!loaded.ok) throw new Error(`catalog has errors (run npm run validate:data):\n${loaded.errors.join("\n")}`);
  const index = buildCatalogIndex(snapshotFromCatalog(loaded.catalog));
  const { fixtures, window, csvRows } = await loadFixtureFiles(opts.fixturesDir ?? DEFAULT_FIXTURES_DIR);

  const fx = evaluateFixtures(fixtures, index);
  const petIds = new Set(window.map((r) => r["Event ID"] ?? ""));
  const cls = evaluateClassification(csvRows, petIds, index);
  const lots = evaluateLots(window);

  const metrics: Record<string, number> = {
    catalogBrands: loaded.catalog.brands.length,
    fixturesPassed: fx.passed,
    fixturesTotal: fx.results.length,
    brandPrecision: fx.brand.precision,
    brandRecall: fx.brand.recall,
    linePrecision: fx.line.precision,
    lineRecall: fx.line.recall,
    petFoodPrecision: cls.yes.precision,
    petFoodRecall: cls.yes.recall,
    eventsEvaluated: cls.events,
    eventsUnreviewed: cls.unreviewed,
    lotRowsWithRules: lots.withRules / lots.rows,
    lotRowsWithCleanRule: lots.withCleanRule / lots.rows,
    lotRowsNeedingReview: lots.withReviewRule / lots.rows,
  };

  const lines = [
    `BowlWatch matcher validation (${new Date().toISOString()})`,
    `catalog: ${loaded.catalog.brands.length} brands, ${loaded.catalog.aliases.length} aliases`,
    "",
    `40 annotated fixtures: ${fx.passed}/${fx.results.length} pass`,
    `  brand precision ${pct(fx.brand.precision)}  recall ${pct(fx.brand.recall)}  (tp ${fx.brand.tp}, fp ${fx.brand.fp}, fn ${fx.brand.fn})`,
    `  line  precision ${pct(fx.line.precision)}  recall ${pct(fx.line.recall)}  (tp ${fx.line.tp}, fp ${fx.line.fp}, fn ${fx.line.fn})`,
    ...fx.results.map(
      (r) =>
        `  ${r.pass ? "PASS" : "FAIL"} ${r.recallNumber.padEnd(12)} ${r.matches
          .map((m) => `${m.lineId ?? m.brandId}${m.needsReview ? "?" : ""}`)
          .join(", ")}${r.failures.length ? `  <- ${safe(r.failures.join("; "))}` : ""}`,
    ),
    "",
    `pet-food classification, CVM exports initiated 2016-10 onward: ${cls.events} events, ${cls.positives} pet food`,
    `  precision ${pct(cls.yes.precision)}  recall ${pct(cls.yes.recall)}  unreviewed ${cls.unreviewed}`,
    `  (ground truth: pet_food_rows_window.json plus ${Object.keys(PET_EVENT_OVERRIDES).length} documented corrections in src/match/evaluate.ts)`,
    ...(cls.falsePositives.length ? ["  false positives:", ...cls.falsePositives.map((x) => `    ${safe(x)}`)] : []),
    ...(cls.falseNegatives.length ? ["  false negatives:", ...cls.falseNegatives.map((x) => `    ${safe(x)}`)] : []),
    "",
    `lot rules over ${lots.rows} pet-food rows: ${pct(lots.withRules / lots.rows)} have rules, ${pct(
      lots.withCleanRule / lots.rows,
    )} have a clean (Stop-capable) rule, ${pct(lots.withReviewRule / lots.rows)} have a rule needing review`,
  ];

  return { generatedAt: new Date().toISOString(), text: lines.join("\n"), metrics };
}
