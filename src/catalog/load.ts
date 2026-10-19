/**
 * Load, validate and cross-check the normalization table in data/.
 * Reports every error it finds (not just the first), with file paths.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import { normalizeText, normalizeUpc } from "../lib/normalize";
import type { AliasEntityType, AliasKind } from "../types";
import {
  brandFile,
  manufacturersFile,
  parentFile,
  type AliasEntry,
  type BrandFile,
  type ManufacturerEntry,
  type ParentFile,
} from "./schema";

export interface AliasRow {
  entityType: AliasEntityType;
  /** parent id, brand id, "<brand>/<line>" or manufacturer id */
  entityId: string;
  alias: string;
  normalized: string;
  kind: AliasKind;
  /** Brand the alias resolves to (null for parents and manufacturers). */
  brandId: string | null;
}

export interface Catalog {
  parents: ParentFile[];
  brands: BrandFile[];
  manufacturers: ManufacturerEntry[];
  /** Every alias including implicit ones (entity names). */
  aliases: AliasRow[];
}

export type LoadResult = { ok: true; catalog: Catalog } | { ok: false; errors: string[] };

/** Names that must never appear in data/ (fictional brands used in design mockups). */
const FORBIDDEN_NAMES = ["harrow and finch", "kettle creek", "ridgeline pet foods", "ridgeline"];

export const DEFAULT_DATA_DIR = path.resolve(process.cwd(), "data");

export const lineDbId = (brandId: string, lineId: string) => `${brandId}/${lineId}`;

function aliasOf(entry: AliasEntry, defaultKind: AliasKind): { text: string; kind: AliasKind } {
  return typeof entry === "string" ? { text: entry, kind: defaultKind } : entry;
}

async function listYaml(dir: string): Promise<string[]> {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith(".yaml")).sort().map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

function zodErrors(file: string, err: z.ZodError): string[] {
  return err.issues.map((i) => `${file}: ${i.path.join(".") || "(root)"}: ${i.message}`);
}

async function readYaml(file: string, errors: string[]): Promise<unknown> {
  try {
    return parseYaml(await readFile(file, "utf8"), { prettyErrors: true });
  } catch (e) {
    errors.push(`${file}: YAML parse error: ${(e as Error).message}`);
    return undefined;
  }
}

export async function loadCatalog(dataDir: string = DEFAULT_DATA_DIR): Promise<LoadResult> {
  const errors: string[] = [];
  const rel = (f: string) => path.relative(process.cwd(), f) || f;

  const parents: ParentFile[] = [];
  for (const file of await listYaml(path.join(dataDir, "parents"))) {
    const raw = await readYaml(file, errors);
    if (raw === undefined) continue;
    const res = parentFile.safeParse(raw);
    if (!res.success) errors.push(...zodErrors(rel(file), res.error));
    else if (path.basename(file, ".yaml") !== res.data.id)
      errors.push(`${rel(file)}: id '${res.data.id}' must match the file name`);
    else parents.push(res.data);
  }

  const brands: BrandFile[] = [];
  const brandFileOf = new Map<string, string>();
  for (const file of await listYaml(path.join(dataDir, "brands"))) {
    const raw = await readYaml(file, errors);
    if (raw === undefined) continue;
    const res = brandFile.safeParse(raw);
    if (!res.success) errors.push(...zodErrors(rel(file), res.error));
    else if (path.basename(file, ".yaml") !== res.data.id)
      errors.push(`${rel(file)}: id '${res.data.id}' must match the file name`);
    else {
      brands.push(res.data);
      brandFileOf.set(res.data.id, rel(file));
    }
  }

  let manufacturers: ManufacturerEntry[] = [];
  const mfile = path.join(dataDir, "manufacturers.yaml");
  const mraw = await readYaml(mfile, errors);
  if (mraw !== undefined) {
    const res = manufacturersFile.safeParse(mraw ?? {});
    if (!res.success) errors.push(...zodErrors(rel(mfile), res.error));
    else manufacturers = res.data.manufacturers;
  }

  // ---- cross-checks
  const parentIds = new Set(parents.map((p) => p.id));
  const parentOf = new Map(brands.map((b) => [b.id, b.parent]));
  const mfrIds = new Set<string>();
  for (const m of manufacturers) {
    if (mfrIds.has(m.id)) errors.push(`${rel(mfile)}: duplicate manufacturer id '${m.id}'`);
    mfrIds.add(m.id);
  }

  const aliases: AliasRow[] = [];
  const push = (row: Omit<AliasRow, "normalized">, where: string) => {
    const normalized = normalizeText(row.alias);
    if (!normalized) {
      errors.push(`${where}: alias '${row.alias}' normalizes to an empty string`);
      return;
    }
    aliases.push({ ...row, normalized });
  };

  for (const p of parents) {
    const where = `data/parents/${p.id}.yaml`;
    push({ entityType: "parent", entityId: p.id, alias: p.name, kind: "name", brandId: null }, where);
    for (const a of p.aliases) {
      const { text, kind } = aliasOf(a, "firm");
      push({ entityType: "parent", entityId: p.id, alias: text, kind, brandId: null }, where);
    }
  }

  const upcLine = new Map<string, string>();
  for (const b of brands) {
    const where = brandFileOf.get(b.id) ?? b.id;
    if (!parentIds.has(b.parent)) errors.push(`${where}: parent '${b.parent}' has no data/parents/${b.parent}.yaml`);
    for (const m of b.manufacturers)
      if (!mfrIds.has(m)) errors.push(`${where}: manufacturer '${m}' is not in data/manufacturers.yaml`);

    push({ entityType: "brand", entityId: b.id, alias: b.name, kind: "name", brandId: b.id }, where);
    for (const a of b.aliases) {
      const { text, kind } = aliasOf(a, "name");
      if (kind === "firm") errors.push(`${where}: put firm names under firm_names, not aliases ('${text}')`);
      push({ entityType: "brand", entityId: b.id, alias: text, kind, brandId: b.id }, where);
    }
    for (const f of b.firm_names) push({ entityType: "brand", entityId: b.id, alias: f, kind: "firm", brandId: b.id }, where);

    const lineIds = new Set<string>();
    for (const l of b.lines) {
      for (const u of l.upcs) {
        const core = normalizeUpc(u);
        if (!core) errors.push(`${where}: line '${l.id}' UPC '${u}' is not a UPC`);
        else {
          const other = upcLine.get(core);
          if (other && other !== lineDbId(b.id, l.id)) errors.push(`${where}: UPC '${u}' is on both '${other}' and '${lineDbId(b.id, l.id)}'`);
          upcLine.set(core, lineDbId(b.id, l.id));
        }
      }
      if (lineIds.has(l.id)) errors.push(`${where}: duplicate line id '${l.id}'`);
      lineIds.add(l.id);
      const id = lineDbId(b.id, l.id);
      push({ entityType: "line", entityId: id, alias: l.name, kind: "name", brandId: b.id }, where);
      for (const a of l.aliases) {
        const { text, kind } = aliasOf(a, "name");
        if (kind === "firm" || kind === "dba")
          errors.push(`${where}: line '${l.id}' alias '${text}' cannot be kind '${kind}' (use name, label or short)`);
        push({ entityType: "line", entityId: id, alias: text, kind, brandId: b.id }, where);
      }
    }
  }

  for (const m of manufacturers) {
    push({ entityType: "manufacturer", entityId: m.id, alias: m.name, kind: "name", brandId: null }, rel(mfile));
    for (const f of m.firm_names)
      push({ entityType: "manufacturer", entityId: m.id, alias: f, kind: "firm", brandId: null }, rel(mfile));
  }

  // Duplicate ids across files (file name == id makes this mostly impossible, but cheap to check).
  for (const [label, ids] of [
    ["parent", parents.map((p) => p.id)],
    ["brand", brands.map((b) => b.id)],
  ] as const) {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`duplicate ${label} id '${id}'`);
      seen.add(id);
    }
  }

  // Standalone brand identifiers (brand name/dba/label aliases, line label aliases)
  // must be unique across brands: they decide which brand a notice is about.
  const standalone = new Map<string, string>();
  // Context-only line names must be unique within their brand.
  const lineNames = new Map<string, string>();
  // Firm names may repeat across brands only under the same parent.
  const firms = new Map<string, string>();
  for (const a of aliases) {
    if (FORBIDDEN_NAMES.some((f) => a.normalized === f || a.normalized.startsWith(`${f} `)))
      errors.push(`${a.entityType} '${a.entityId}': '${a.alias}' is a fictional mockup brand and must not be in data/`);
    if (!a.brandId) continue;
    // Short aliases only count with a corroborating recalling firm, so two brands may share one.
    if (a.kind === "short") continue;
    const isStandalone =
      (a.entityType === "brand" && a.kind !== "firm") || (a.entityType === "line" && a.kind === "label");
    if (isStandalone) {
      const other = standalone.get(a.normalized);
      if (other && other !== a.brandId)
        errors.push(`alias '${a.alias}' (normalized '${a.normalized}') identifies both '${other}' and '${a.brandId}'`);
      standalone.set(a.normalized, a.brandId);
    } else if (a.entityType === "line") {
      const key = `${a.brandId}\u0000${a.normalized}`;
      const other = lineNames.get(key);
      if (other && other !== a.entityId)
        errors.push(`line alias '${a.alias}' is used by both '${other}' and '${a.entityId}'`);
      lineNames.set(key, a.entityId);
    } else if (a.kind === "firm") {
      const other = firms.get(a.normalized);
      if (other && other !== a.brandId && parentOf.get(other) !== parentOf.get(a.brandId))
        errors.push(
          `firm name '${a.alias}' is on '${other}' and '${a.brandId}' under different parents; if it is a co-packer, move it to data/manufacturers.yaml`,
        );
      firms.set(a.normalized, a.brandId);
    }
  }

  // Dedupe identical (entity, normalized, kind) rows, e.g. an alias equal to the name.
  const seenRow = new Set<string>();
  const deduped = aliases.filter((a) => {
    const k = `${a.entityType}\u0000${a.entityId}\u0000${a.normalized}\u0000${a.kind}`;
    if (seenRow.has(k)) return false;
    seenRow.add(k);
    return true;
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, catalog: { parents, brands, manufacturers, aliases: deduped } };
}
