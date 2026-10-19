/** npm run validate:data — Zod-validate and cross-check data/**.yaml. No database needed. */
import { loadCatalog } from "../src/catalog/load";
import { runCli } from "./_cli";

runCli(async () => {
  const res = await loadCatalog(process.argv[2]);
  if (!res.ok) {
    console.error(`data/ has ${res.errors.length} error(s):`);
    for (const e of res.errors) console.error(`  - ${e}`);
    return 1;
  }
  const { parents, brands, manufacturers, aliases } = res.catalog;
  const lines = brands.reduce((n, b) => n + b.lines.length, 0);
  console.log(
    `data/ OK: ${parents.length} parents, ${brands.length} brands, ${lines} lines, ${manufacturers.length} manufacturers, ${aliases.length} aliases`,
  );
});
