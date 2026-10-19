/**
 * Replace the catalog tables with the contents of data/ in one transaction.
 * Recall tables are untouched. recall_matches keep their brand/line ids; any that
 * no longer exist in the catalog are reported as orphans.
 */
import { sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { aliases, brandManufacturers, brands, manufacturers, parents, productLines } from "../db/schema";
import { lineDbId, type Catalog } from "./load";
import { lineUpcs } from "./snapshot";

export interface SeedStats {
  parents: number;
  brands: number;
  lines: number;
  manufacturers: number;
  aliases: number;
  /** recall_matches rows whose brand_id / line_id is not in the new catalog. */
  orphanMatches: number;
}

const CHUNK = 500;
function chunks<T>(rows: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK) out.push(rows.slice(i, i + CHUNK));
  return out;
}

export async function seedCatalog(db: Db, catalog: Catalog): Promise<SeedStats> {
  const lineRows = catalog.brands.flatMap((b) =>
    b.lines.map((l) => ({
      id: lineDbId(b.id, l.id),
      brandId: b.id,
      name: l.name,
      species: l.species,
      formats: l.formats,
      discontinued: l.discontinued ?? false,
      upcs: lineUpcs(l.upcs),
    })),
  );

  return db.transaction(async (tx) => {
    await tx.delete(aliases);
    await tx.delete(brandManufacturers);
    await tx.delete(productLines);
    await tx.delete(brands);
    await tx.delete(manufacturers);
    await tx.delete(parents);

    if (catalog.parents.length)
      await tx.insert(parents).values(catalog.parents.map((p) => ({ id: p.id, name: p.name, sources: p.sources })));
    if (catalog.manufacturers.length)
      await tx
        .insert(manufacturers)
        .values(catalog.manufacturers.map((m) => ({ id: m.id, name: m.name, sources: m.sources })));
    if (catalog.brands.length)
      await tx.insert(brands).values(
        catalog.brands.map((b) => ({
          id: b.id,
          name: b.name,
          parentId: b.parent,
          markets: b.markets,
          sources: b.sources,
          upcPrefixes: b.upc_prefixes,
        })),
      );
    for (const part of chunks(lineRows)) await tx.insert(productLines).values(part);
    const bm = catalog.brands.flatMap((b) => b.manufacturers.map((m) => ({ brandId: b.id, manufacturerId: m })));
    if (bm.length) await tx.insert(brandManufacturers).values(bm);
    for (const part of chunks(catalog.aliases))
      await tx.insert(aliases).values(
        part.map((a) => ({
          entityType: a.entityType,
          entityId: a.entityId,
          alias: a.alias,
          normalized: a.normalized,
          kind: a.kind,
        })),
      );

    const orphan = (await tx.execute(sql`
      select count(*)::int as n from recall_matches m
      where not exists (select 1 from brands b where b.id = m.brand_id)
         or (m.line_id is not null and not exists (select 1 from product_lines l where l.id = m.line_id))
    `)) as unknown as { rows: { n: number }[] };

    return {
      parents: catalog.parents.length,
      brands: catalog.brands.length,
      lines: lineRows.length,
      manufacturers: catalog.manufacturers.length,
      aliases: catalog.aliases.length,
      orphanMatches: orphan.rows[0]?.n ?? 0,
    };
  });
}
