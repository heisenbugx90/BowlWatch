/** npm run seed — load data/ and replace the catalog tables (transactional). */
import { loadCatalog } from "../src/catalog/load";
import { seedCatalog } from "../src/catalog/seed";
import { openMigrated, runCli } from "./_cli";

runCli(async () => {
  const res = await loadCatalog();
  if (!res.ok) {
    for (const e of res.errors) console.error(`  - ${e}`);
    return 1;
  }
  const db = await openMigrated();
  const stats = await seedCatalog(db, res.catalog);
  console.log("seeded:", stats);
  if (stats.orphanMatches) console.warn(`warning: ${stats.orphanMatches} recall_matches point at brands/lines no longer in data/`);
});
