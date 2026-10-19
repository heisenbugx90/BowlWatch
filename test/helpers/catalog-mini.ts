import path from "node:path";
import { loadCatalog } from "@/catalog/load";
import { snapshotFromCatalog } from "@/catalog/snapshot";
import { buildCatalogIndex, type CatalogIndex } from "@/match/matcher";

/** Test-only catalog covering the brands in fda_cvm_pet_recalls_40.json (independent of data/). */
export const MINI_CATALOG_DIR = path.resolve(__dirname, "../fixtures/catalog-mini");
export const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

export async function miniIndex(): Promise<CatalogIndex> {
  const res = await loadCatalog(MINI_CATALOG_DIR);
  if (!res.ok) throw new Error(res.errors.join("\n"));
  return buildCatalogIndex(snapshotFromCatalog(res.catalog));
}
