/**
 * npm run ingest:fda [-- --skip-ires] [-- --skip-listing] [-- --skip-match]
 * The same job the Vercel Cron route runs.
 */
import { parseArgs } from "node:util";
import { runNightly } from "../src/jobs/nightly";
import { safeJson } from "../src/lib/terminal";
import { openMigrated, runCli } from "./_cli";

runCli(async () => {
  const { values } = parseArgs({
    options: {
      "skip-ires": { type: "boolean", default: false },
      "skip-listing": { type: "boolean", default: false },
      "skip-match": { type: "boolean", default: false },
    },
  });
  const db = await openMigrated();
  const result = await runNightly(db, {
    skipIres: values["skip-ires"],
    skipListing: values["skip-listing"],
    skipMatch: values["skip-match"],
  });
  console.log(safeJson(result)); // error messages can carry server-supplied text (e.g. redirect URLs)
  return result.errors.length ? 1 : 0;
});
