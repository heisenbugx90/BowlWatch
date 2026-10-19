/**
 * The catalog as the matcher sees it. Built either from YAML (tests, CLI) or from
 * the database (production cron, where data/ is not on disk), so both paths feed
 * buildCatalogIndex() the exact same shape.
 */
import type { Db } from "../db/client";
import { aliases, brandManufacturers, brands, productLines } from "../db/schema";
import { normalizeUpc } from "../lib/normalize";
import type { AliasEntityType, AliasKind, Format, Species } from "../types";
import { lineDbId, type Catalog } from "./load";

export interface SnapshotBrand {
  id: string;
  name: string;
  parentId: string;
  manufacturerIds: string[];
  /** GS1 company prefixes (with number-system digit), see data/README.md. */
  upcPrefixes?: string[];
}

export interface SnapshotLine {
  id: string; // "<brand>/<line>"
  brandId: string;
  name: string;
  species: Species[];
  formats: Format[];
  discontinued: boolean;
  /** Normalized UPCs (see normalizeUpc) of the line's known products. */
  upcs?: string[];
}

export interface SnapshotAlias {
  entityType: AliasEntityType;
  entityId: string;
  alias: string;
  normalized: string;
  kind: AliasKind;
}

export interface CatalogSnapshot {
  brands: SnapshotBrand[];
  lines: SnapshotLine[];
  aliases: SnapshotAlias[];
}

export function snapshotFromCatalog(catalog: Catalog): CatalogSnapshot {
  return {
    brands: catalog.brands.map((b) => ({
      id: b.id,
      name: b.name,
      parentId: b.parent,
      manufacturerIds: [...b.manufacturers],
      upcPrefixes: [...b.upc_prefixes],
    })),
    lines: catalog.brands.flatMap((b) =>
      b.lines.map((l) => ({
        id: lineDbId(b.id, l.id),
        brandId: b.id,
        name: l.name,
        species: [...l.species],
        formats: [...l.formats],
        discontinued: l.discontinued ?? false,
        upcs: lineUpcs(l.upcs),
      })),
    ),
    aliases: catalog.aliases.map(({ entityType, entityId, alias, normalized, kind }) => ({
      entityType,
      entityId,
      alias,
      normalized,
      kind,
    })),
  };
}

export async function loadSnapshotFromDb(db: Db): Promise<CatalogSnapshot> {
  const [b, bm, l, a] = await Promise.all([
    db.select().from(brands),
    db.select().from(brandManufacturers),
    db.select().from(productLines),
    db.select().from(aliases),
  ]);
  const mfr = new Map<string, string[]>();
  for (const row of bm) mfr.set(row.brandId, [...(mfr.get(row.brandId) ?? []), row.manufacturerId]);
  return {
    brands: b.map((r) => ({
      id: r.id,
      name: r.name,
      parentId: r.parentId,
      manufacturerIds: mfr.get(r.id) ?? [],
      upcPrefixes: r.upcPrefixes ?? [],
    })),
    lines: l.map((r) => ({
      id: r.id,
      brandId: r.brandId,
      name: r.name,
      species: r.species as Species[],
      formats: r.formats as Format[],
      discontinued: r.discontinued,
      upcs: r.upcs ?? [],
    })),
    aliases: a.map((r) => ({
      entityType: r.entityType,
      entityId: r.entityId,
      alias: r.alias,
      normalized: r.normalized,
      kind: r.kind,
    })),
  };
}

/** Normalized, de-duplicated line UPCs (data/ stores them as printed). */
export function lineUpcs(printed: readonly string[] | undefined): string[] {
  return [...new Set((printed ?? []).map((u) => normalizeUpc(u)).filter((u): u is string => !!u))];
}
