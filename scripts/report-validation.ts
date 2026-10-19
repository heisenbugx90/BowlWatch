/**
 * npm run report:validation — historical validation report (CLAUDE.md build step 2).
 *
 * Writes docs/validation/report.md and docs/validation/events.json from the
 * database that `npm run seed` + `npm run backfill:fda` filled (set PGLITE_DIR or
 * DATABASE_URL to point at it), and prints the stats block. The offline
 * annotated-fixture summary (test/fixtures, real data/ catalog) is included too.
 *
 * npm run report:validation                           DB report + fixture summary
 * npm run report:validation -- --fixtures-only        only the fixture summary, no DB
 * npm run report:validation -- --min-initiated 2016-10-01 --out docs/validation
 * npm run report:validation -- --rematch              run matchAll before reporting
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { buildDbValidationReport, DEFAULT_MIN_INITIATED, renderMarkdown, statsLines } from "../src/match/db-report";
import { buildValidationReport } from "../src/match/report";
import { matchAll } from "../src/match/run";
import { openMigrated, runCli } from "./_cli";

runCli(async () => {
  const { values } = parseArgs({
    options: {
      "fixtures-only": { type: "boolean", default: false },
      "min-initiated": { type: "string", default: DEFAULT_MIN_INITIATED },
      out: { type: "string", default: "docs/validation" },
      rematch: { type: "boolean", default: false },
    },
  });
  const fixtures = await buildValidationReport();
  if (values["fixtures-only"]) {
    console.log(fixtures.text);
    return;
  }
  if (!process.env.PGLITE_DIR && !process.env.DATABASE_URL)
    throw new Error("set PGLITE_DIR (or DATABASE_URL) to the backfilled database, or pass --fixtures-only");
  const minInitiated = values["min-initiated"];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(minInitiated)) throw new Error("--min-initiated must be YYYY-MM-DD");

  const db = await openMigrated();
  if (values.rematch) console.log("match:", await matchAll(db));
  const report = await buildDbValidationReport(db, { minInitiated });
  if (!report.events.length) throw new Error("no events in the window: run `npm run backfill:fda` into this database first");

  const outDir = path.resolve(values.out);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "report.md"), renderMarkdown(report, fixtures.text));
  await writeFile(
    path.join(outDir, "events.json"),
    `${JSON.stringify({ generatedAt: report.generatedAt, stats: report.stats, fixtureMetrics: fixtures.metrics, events: report.events }, null, 2)}\n`,
  );
  console.log(statsLines(report.stats).join("\n"));
  console.log(`\nwrote ${path.join(values.out, "report.md")} and ${path.join(values.out, "events.json")}`);
});
