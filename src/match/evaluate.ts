/**
 * Matcher evaluation against the historical FDA fixtures. OWNER: matcher agent.
 * Used by the tests (with test/fixtures/catalog-mini) and by `npm run
 * report:validation` (with the real data/ catalog). Node-only (reads files); never
 * imported by the cron route.
 *
 * Scoring is catalog-agnostic: a matched brand is correct when one of its aliases
 * (or an alias of a matched line) equals, or is a leading phrase of, a brand name
 * written in the fixture's `expected.brands`. A matched line is correct when one of
 * its aliases appears as a phrase in `expected.product_line` or equals an expected
 * brand string (e.g. "Sportmix Wholesomes").
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { normalizeText } from "../lib/normalize";
import type { LotRule, PetFoodFlag } from "../types";
import { classifyEvent } from "./classify";
import { extractUpcs, parseLotRules } from "./lots";
import { matchProductDetailed, type CatalogIndex, type ProductMatch } from "./matcher";

export interface FixtureRow {
  raw: Record<string, string>;
  expected: {
    brands: string[];
    product_line: string | null;
    upcs: string[] | string;
    lots: string[] | string;
    best_by: string[] | string;
    negative?: boolean;
    notes?: string;
  };
}

export interface FixtureResult {
  recallNumber: string;
  eventId: string;
  pass: boolean;
  failures: string[];
  petFood: PetFoodFlag;
  brands: { tp: number; fp: number; fn: number };
  lines: { tp: number; fp: number; fn: number };
  matches: ProductMatch[];
  rules: LotRule[];
}

export interface Prf {
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
}

const prf = (tp: number, fp: number, fn: number): Prf => ({
  tp,
  fp,
  fn,
  precision: tp + fp ? tp / (tp + fp) : 1,
  recall: tp + fn ? tp / (tp + fn) : 1,
});

/** Join every "More Code Info" column (the header repeats in some years). */
export function moreCodeInfoOf(raw: Record<string, string>): string | null {
  const parts = Object.entries(raw)
    .filter(([k, v]) => /^More Code Info/i.test(k) && v && v !== "N/A")
    .map(([, v]) => v);
  return parts.length ? parts.join("\n") : null;
}

const flat = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

function aliasesFor(index: CatalogIndex, m: ProductMatch): string[] {
  return index.snapshot.aliases
    .filter(
      (a) =>
        (a.entityType === "brand" && a.entityId === m.brandId && a.kind !== "firm") ||
        (a.entityType === "line" && m.lineId !== null && a.entityId === m.lineId),
    )
    .map((a) => a.normalized);
}

const phraseIn = (needle: string, hay: string) => !!needle && ` ${hay} `.includes(` ${needle} `);

function brandExplains(index: CatalogIndex, m: ProductMatch, expected: string): boolean {
  const e = normalizeText(expected);
  return aliasesFor(index, m).some((a) => a === e || e.startsWith(`${a} `) || a.startsWith(`${e} `));
}

function lineCorrect(index: CatalogIndex, m: ProductMatch, fx: FixtureRow): boolean {
  if (!m.lineId) return false;
  const lineAliases = index.snapshot.aliases
    .filter((a) => a.entityType === "line" && a.entityId === m.lineId)
    .map((a) => a.normalized);
  const pl = normalizeText(fx.expected.product_line);
  return lineAliases.some((a) => phraseIn(a, pl) || fx.expected.brands.some((b) => normalizeText(b) === a));
}

function isoPoints(spec: string[] | string): { from: string; to: string }[] {
  const out: { from: string; to: string }[] = [];
  const items = Array.isArray(spec) ? spec : [spec];
  for (const it of items) {
    const range = /(\d{4}-\d{2}(?:-\d{2})?)\.\.(\d{4}-\d{2}(?:-\d{2})?)/.exec(it);
    if (range) out.push({ from: range[1]!, to: range[2]! });
    else {
      const one = /^(\d{4}-\d{2}(?:-\d{2})?)/.exec(it);
      if (one) out.push({ from: one[1]!, to: one[1]! });
    }
  }
  return out;
}

function dateCovered(rules: LotRule[], from: string, to: string): boolean {
  const lo = from.length === 7 ? `${from}-01` : from;
  const hi = to.length === 7 ? `${to}-01` : to;
  return rules.some((r) => {
    // code rules may carry a best-by window as a conjunction ("codes beginning with AH ... and expiration dates between ...")
    if (r.kind === "all_lots") return false;
    if (!r.dateFrom && !r.dateTo) return false;
    const a = r.dateFrom ?? "0000-01-01";
    const b = r.dateTo ?? (r.kind === "best_by_date" ? a : "9999-12-31");
    return a <= lo && hi <= b;
  });
}

/**
 * Corrections to the hand annotations, each checked against the full product text.
 * Keyed by recall number.
 */
export const EXPECTED_OVERRIDES: Record<string, { addBrands?: string[]; why: string }> = {
  "V-0026-2024": {
    addBrands: ["H-E-B Texas Pets", "Retriever", "Hill Country Fare", "Lone Star", "Member's Mark", "Star Pro", "Economax", "Feline Medley"],
    why: "The annotation lists only the first two brands; the full row also names H-E-B Texas Pets, Retriever, Hill Country Fare, Lone Star, Member's Mark, Star Pro, Economax and Feline Medley.",
  },
};

/**
 * Corrections to the event-level ground truth (pet_food_rows_window.json), each
 * checked by reading the product text. true = dog/cat food, false = not.
 */
export const PET_EVENT_OVERRIDES: Record<string, { pet: boolean; why: string }> = {
  "82087": { pet: false, why: "DSM vitamin premix, an ingredient sold to manufacturers, not a consumer product" },
  "84354": { pet: false, why: "HomeoPet K9 WRM Clear, a homeopathic wormer" },
  "98309": { pet: false, why: "Curaseb chlorhexidine antiseptic pads" },
  "91877": { pet: false, why: "Omega-3 soft gels (supplement in dosage form)" },
  "91393": { pet: false, why: "Wegmans cat grass (a plant kit, not food)" },
  "95771": { pet: false, why: "Douxo Calm Serum (Ceva), a topical product" },
  "96498": { pet: false, why: "Douxo Calm Serum (Ceva), a topical product" },
  // Dog/cat food or treats that the window file missed (it was built with a keyword filter):
  "76151": { pet: true, why: "9Lives Meaty Pate (cat food)" },
  "76453": { pet: true, why: "Blue Buffalo Homestyle Recipe canned dog food" },
  "77476": { pet: true, why: "Loving Pets Barksters dog treats" },
  "79151": { pet: true, why: "Raws for Paws ground turkey food for pets" },
  "79829": { pet: true, why: "K9 Natural freeze-dried dog food" },
  "81735": { pet: true, why: "9Lives Protein Plus (cat food)" },
  "83570": { pet: true, why: "Chef Toby pig ears (dog chews)" },
  "84423": { pet: true, why: "Special Kitty pate (cat food)" },
  "87420": { pet: true, why: "Visionary Keto Pet Foods (dog food)" },
  "88269": { pet: true, why: "Purina Pro Plan Complete Essentials (cat food)" },
  "88479": { pet: true, why: "Simply Nourish dog treats made by Wet Noses" },
  "88480": { pet: true, why: "Pup-Peroni dog treats" },
  "88774": { pet: true, why: "Wet Noses Chicken Cacciatore recipe for dogs" },
  "90470": { pet: true, why: "Freshpet Select dog food" },
  "91965": { pet: true, why: "Good 'n' Fun dog chews" },
  "92330": { pet: true, why: "Ark Naturals dental chew for dogs" },
  "97743": { pet: true, why: "Nature's Own bully bites pet chews" },
  "99206": { pet: true, why: "Steve's Real Food freeze-dried (in the 40 annotated fixtures)" },
  "99362": { pet: true, why: "Pedigree canned dog food (in the 40 annotated fixtures)" },
  "76781": { pet: true, why: "Barnsdale Farms / HoundsTooth / Mac's Choice pig ears (dog chews)" },
  "83404": { pet: true, why: "pig ears (dog chews)" },
  "83589": { pet: true, why: "pig ears (dog chews)" },
  "83998": { pet: true, why: "pig ears sold at Hollywood Feed (dog chews)" },
  "86616": { pet: true, why: "Stella & Chewy's Raw Blend kibble (dog food)" },
  "86625": { pet: true, why: "Dr. Siegel's S.A.F.E. Petfood ground beef (raw pet food)" },
  "86854": { pet: true, why: "bully sticks (dog chews)" },
  "94732": { pet: true, why: "Best Bully Sticks green tripe (dog food)" },
  "96610": { pet: true, why: "Supercan bully sticks and pig ear slivers (dog chews)" },
  "75402": { pet: true, why: "Cesar Classics (dog food)" },
  "79330": { pet: true, why: "Vital Essentials freeze-dried nibblets (dog food)" },
  "80152": { pet: true, why: "Castor & Pollux Good Buddy patties (dog treats, Merrick plant)" },
  "82527": { pet: true, why: "Smalls Diamond Dust chicken liver powder (cat food topper)" },
  "88355": { pet: true, why: "Wild Harvest chicken & brown rice 14 lb (dog food, Sunshine Mills)" },
  "89067": { pet: true, why: "Member's Mark beef sticks (CVM-regulated dog treats sold by Walmart)" },
  "95964": { pet: true, why: "Open Farm freeze-dried raw (pet food)" },
  // 2026-10-18 judge findings (docs/validation/judge-disputes.md): dog/cat food the research file marked non-pet
  "76466": { pet: true, why: "Against the Grain Pulled Beef canned dog food (pentobarbital recall with Evanger's)" },
  "77118": { pet: true, why: "Cocolicious canned dog food; reason says 'canned dog foods'" },
  "78945": { pet: true, why: "JustFoodForDogs daily diets; 'fish' is an ingredient" },
  "81526": { pet: true, why: "Elm Chicken and Chickpea Recipe dog food" },
  "81726": { pet: true, why: "Kroger Abound dog food" },
  "81739": { pet: true, why: "Omaha Steaks beef bone dog chews" },
  "85245": { pet: true, why: "IcelandicPlus whole capelin fish treats for dogs and cats" },
  "85961": { pet: true, why: "Natural Balance Ultra Premium canned cat food (Smucker)" },
  "86475": { pet: true, why: "Billy + Margot dog food" },
  "92718": { pet: true, why: "What The Raw dried sardines for raw pet food" },
  "93131": { pet: true, why: "Hollywood Feed Carolina Made jerky dog treats; 'Feed' is the brand" },
  "95835": { pet: true, why: "Gaines Family Farmstead chicken chips dog treats" },
  "98006": { pet: true, why: "Ollie Gently Baked dog food" },
  "98774": { pet: true, why: "Breeder's Edge / Shelter's Choice puppy milk replacer (complete nutrition)" },
  "98983": { pet: true, why: "My Pet Carnivore / The Butcher's Hound raw pet food; goat is the protein" },
  "99258": { pet: true, why: "Breeder's Edge goat milk formula for puppies and kittens" },
  // second judge round (docs/validation/judge-disputes.md): supplements, ingredients and a drug are not dog/cat food
  "78807": { pet: false, why: "MediGel FBZ, a fenbendazole (dewormer) gel; reason: sub-potent assay" },
  "92716": { pet: false, why: "Ozona Organics liquid probiotics for dogs, cats, swine, equine (a supplement)" },
  "96442": { pet: false, why: "ZP (Zesty Paws) probiotic / multivitamin / hip & joint soft chews (supplements)" },
  "83326": { pet: false, why: "inedible turkey by-product meal, an ingredient sold to feed makers" },
  "99287": { pet: true, why: "Doggone Raw dog food" },
  "99743": { pet: true, why: "Breeder's Edge / Shelter's Choice kitten milk replacer" },
};

/** Score one fixture row as a single-row event. */
export function evaluateFixture(fx: FixtureRow, index: CatalogIndex): FixtureResult {
  const raw = fx.raw;
  const description = raw["Product Description"] ?? "";
  const codeInfo = raw["Code Info"] ?? null;
  const moreCodeInfo = moreCodeInfoOf(raw);
  const firm = raw["Recalling Firm"] ?? null;
  const failures: string[] = [];

  const cls = classifyEvent({ firm, products: [{ productDescription: description, codeInfo }] }, index);
  const res = matchProductDetailed({ description, codeInfo, moreCodeInfo, firm }, index);
  const matches = res.matches;
  const rules = parseLotRules(description, codeInfo, moreCodeInfo);

  const negative = !!fx.expected.negative;
  if (negative && cls.petFood === "yes") failures.push(`classified as pet food (${cls.reasons.join("; ")})`);
  if (!negative && cls.petFood !== "yes") failures.push(`pet food = ${cls.petFood} (${cls.reasons.join("; ")})`);

  // brands
  const override = EXPECTED_OVERRIDES[raw["Recall Number"] ?? ""];
  const expectedBrands = negative ? [] : [...fx.expected.brands, ...(override?.addBrands ?? [])];
  const brandIds = [...new Set(matches.map((m) => m.brandId))];
  let bfp = 0;
  for (const id of brandIds) {
    const ms = matches.filter((m) => m.brandId === id);
    if (!expectedBrands.some((e) => ms.some((m) => brandExplains(index, m, e)))) {
      bfp++;
      failures.push(`unexpected brand ${id}`);
    }
  }
  let bfn = 0;
  for (const e of expectedBrands)
    if (!matches.some((m) => brandExplains(index, m, e))) {
      bfn++;
      failures.push(`missed brand "${e}"`);
    }
  // count TP per expected brand string so that one catalog brand covering two strings scores fairly
  const brandTp = expectedBrands.length - bfn;

  // lines
  const pl = fx.expected.product_line;
  // A brand named only by the recalling firm is never matched at line level (by design).
  const lineExpected =
    !negative && !!pl && !/^many lines/i.test(pl) && expectedBrands.length > 0 && matches.some((m) => !m.needsReview);
  const lineMatches = matches.filter((m) => m.lineId);
  let ltp = 0;
  let lfp = 0;
  for (const m of lineMatches) {
    if (lineCorrect(index, m, fx)) ltp++;
    else if (!/^many lines/i.test(pl ?? "")) {
      lfp++;
      failures.push(`unexpected line ${m.lineId}`);
    }
  }
  let lfn = 0;
  if (lineExpected && ltp === 0) {
    lfn = 1;
    failures.push(`missed line "${pl}"`);
  }

  // lots
  if (Array.isArray(fx.expected.lots) && !negative) {
    const have = new Set(
      rules.flatMap((r) => [r.value, r.valueTo]).filter((v): v is string => !!v).map(flat),
    );
    for (const lot of fx.expected.lots) if (!have.has(flat(lot))) failures.push(`missed lot ${lot}`);
  }
  if (!negative)
    for (const { from, to } of isoPoints(fx.expected.best_by))
      if (!dateCovered(rules, from, to)) failures.push(`missed best-by ${from === to ? from : `${from}..${to}`}`);

  // UPCs
  if (Array.isArray(fx.expected.upcs)) {
    const got = new Set([...extractUpcs(description), ...extractUpcs(codeInfo)]);
    for (const u of fx.expected.upcs) {
      const digits = u.replace(/\(.*\)/, "").replace(/\D/g, "");
      if (digits.length < 10) continue;
      const core =
        digits.length === 10 ? digits : digits.length === 11 ? null : digits.length === 12 ? digits.slice(1, 11) : null;
      if (core && !got.has(core)) failures.push(`missed UPC ${u}`);
    }
  }

  return {
    recallNumber: raw["Recall Number"] ?? "",
    eventId: raw["Event ID"] ?? "",
    pass: failures.length === 0,
    failures,
    petFood: cls.petFood,
    brands: { tp: brandTp, fp: bfp, fn: bfn },
    lines: { tp: ltp, fp: lfp, fn: lfn },
    matches,
    rules,
  };
}

export interface FixtureSummary {
  results: FixtureResult[];
  passed: number;
  brand: Prf;
  line: Prf;
}

export function evaluateFixtures(fixtures: FixtureRow[], index: CatalogIndex): FixtureSummary {
  const results = fixtures.map((f) => evaluateFixture(f, index));
  const sum = (k: "brands" | "lines", f: "tp" | "fp" | "fn") => results.reduce((a, r) => a + r[k][f], 0);
  return {
    results,
    passed: results.filter((r) => r.pass).length,
    brand: prf(sum("brands", "tp"), sum("brands", "fp"), sum("brands", "fn")),
    line: prf(sum("lines", "tp"), sum("lines", "fp"), sum("lines", "fn")),
  };
}

// ---------------------------------------------------------------- classification over raw exports

export type CsvRow = Record<string, string>;

/** Parse an iRES CSV export by header name; repeated "More Code Info" headers are joined. */
export function parseCsvRows(text: string): CsvRow[] {
  const parsed = Papa.parse<string[]>(text.replace(/^﻿/, ""), { skipEmptyLines: true });
  const [header, ...rows] = parsed.data;
  if (!header) return [];
  return rows.map((cells) => {
    const row: CsvRow = {};
    header.forEach((h, i) => {
      const key = h.trim();
      const v = cells[i] ?? "";
      if (key === "More Code Info") row[key] = row[key] ? `${row[key]}\n${v}` : v;
      else row[key] = v;
    });
    return row;
  });
}

const mdyToIso = (s: string | undefined) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((s ?? "").trim());
  return m ? `${m[3]}-${m[1]}-${m[2]}` : null;
};

export interface ClassificationEval {
  events: number;
  positives: number;
  negatives: number;
  yes: Prf;
  unreviewed: number;
  falseNegatives: string[];
  falsePositives: string[];
}

/**
 * Event-level classification over the raw CVM exports. Ground truth: events in
 * pet_food_rows_window.json are pet food; other events initiated on or after
 * 2016-10-01 are not (the research excluded drugs, devices and feed by hand).
 */
export function evaluateClassification(csvRows: CsvRow[], petEventIds: Set<string>, index: CatalogIndex): ClassificationEval {
  const byEvent = new Map<string, CsvRow[]>();
  for (const r of csvRows) {
    const init = mdyToIso(r["Recall Initiation Date"]);
    if (!init || init < "2016-10-01") continue;
    const id = r["Event ID"] ?? "";
    byEvent.set(id, [...(byEvent.get(id) ?? []), r]);
  }
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let unreviewed = 0;
  let positives = 0;
  const falseNegatives: string[] = [];
  const falsePositives: string[] = [];
  for (const [id, rows] of byEvent) {
    const truth = PET_EVENT_OVERRIDES[id]?.pet ?? petEventIds.has(id);
    if (truth) positives++;
    const c = classifyEvent(
      {
        firm: rows[0]?.["Recalling Firm"] ?? null,
        reason: rows[0]?.["Reason for Recall"] ?? null,
        products: rows.map((r) => ({ productDescription: r["Product Description"] ?? "", codeInfo: r["Code Info"] ?? null })),
      },
      index,
    );
    if (c.petFood === "unreviewed") unreviewed++;
    const label = `${id} ${c.petFood} ${(rows[0]?.["Recalling Firm"] ?? "").slice(0, 40)} | ${(rows[0]?.["Product Description"] ?? "").slice(0, 90)} | ${c.reasons.join("; ")}`;
    if (c.petFood === "yes" && truth) tp++;
    else if (c.petFood === "yes") {
      fp++;
      falsePositives.push(label);
    } else if (truth) {
      fn++;
      falseNegatives.push(label);
    }
  }
  return {
    events: byEvent.size,
    positives,
    negatives: byEvent.size - positives,
    yes: prf(tp, fp, fn),
    unreviewed,
    falseNegatives,
    falsePositives,
  };
}

export const DEFAULT_FIXTURES_DIR = path.resolve(process.cwd(), "test/fixtures");

export async function loadFixtureFiles(dir: string = DEFAULT_FIXTURES_DIR) {
  const fixtures = JSON.parse(await readFile(path.join(dir, "fda_cvm_pet_recalls_40.json"), "utf8")) as FixtureRow[];
  const window = JSON.parse(await readFile(path.join(dir, "pet_food_rows_window.json"), "utf8")) as CsvRow[];
  const csvRows: CsvRow[] = [];
  for (let y = 2016; y <= 2030; y++) {
    try {
      csvRows.push(...parseCsvRows(await readFile(path.join(dir, "ires", `live_cvm_${y}.csv`), "utf8")));
    } catch {
      // year not present
    }
  }
  return { fixtures, window, csvRows };
}

/** Lot-parse stats over the 552 pet-food rows. */
export function evaluateLots(rows: CsvRow[]) {
  let withRules = 0;
  let clean = 0;
  let review = 0;
  for (const r of rows) {
    const rules = parseLotRules(r["Product Description"] ?? "", r["Code Info"] ?? null, r["More Code Info"] ?? null);
    if (rules.length) withRules++;
    if (rules.some((x) => !x.needsReview && x.kind !== "retailer_scope")) clean++;
    if (rules.some((x) => x.needsReview)) review++;
  }
  return { rows: rows.length, withRules, withCleanRule: clean, withReviewRule: review };
}
