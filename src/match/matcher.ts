/**
 * Brand / product-line matching. OWNER: matcher agent.
 *
 * Rules:
 * - Brand comes from product text, never from the recalling firm alone. Firm names
 *   (alias kind 'firm') and co-packers (manufacturers) are supporting evidence only.
 * - Brand aliases (kind name/dba/label) and line aliases of kind 'label' identify a
 *   brand on their own. Line aliases of kind 'name' (incl. the line name) only count
 *   once the brand is established in the same text.
 * - Compare on normalizeText() output with token boundaries (no substring hits:
 *   "blue" must not match "blue ridge beef").
 * - Multiple brands in one row is normal (co-packer events list many). Return all.
 * - Unknown -> [] (the caller opens an 'unmatched' review item); conflicting -> the
 *   caller opens 'ambiguous'.
 *
 * How a row is read:
 * 1. The text is cut into chunks; "Manufactured by / Distributed by / Marketed by ..."
 *    clauses are "byline" chunks. A brand named only in a byline is weak evidence.
 * 2. One left-to-right scan over the tokens finds every catalog phrase (brand
 *    aliases, line labels, firm names, parent names, co-packer names); at each
 *    position the longest phrase wins, so "blue ridge beef" beats "blue" and
 *    "purina pro plan veterinary diets" beats "purina pro plan".
 * 3. Each brand mention owns the text up to the next mention of a different brand
 *    (the first one also owns the text before it: "44 lb. bag PEDIGREE ...").
 *    Line names of that brand are looked up inside that region only.
 * 4. Short aliases (kind 'short': "Meridian", "Quest", "Natural Selections") count only
 *    when the recalling firm corroborates the brand: the firm is one of the brand's firm
 *    names, its parent, or one of its co-packers. They never override a longer phrase.
 * 5. With still no brand in the text, a UPC whose GS1 company prefix belongs to a brand
 *    (data: upc_prefixes) gives a brand-level match when the recalling firm is that
 *    brand's owner (firm name or brand name in the firm).
 * 6. Lines: context line names inside the brand's region; a brand in a list ("Country Vet,
 *    Heartland Harvest Dog Biscuits") shares the list's trailing words; a generic format
 *    word ("pate") after a line label of the same brand describes that line and is ignored;
 *    a brand left at brand level whose region (else the row) says "canned"/"freeze dried"
 *    gets the one line of that format, if it has exactly one.
 * 7. With no brand in the text, a brand named by the recalling firm (dba or firm name)
 *    gives a brand-level match flagged needsReview, unless the firm name is shared by
 *    several brands (a parent or retailer). Co-packer firms give nothing.
 */
import type { CatalogSnapshot } from "../catalog/snapshot";
import { cleanText, normalizeText } from "../lib/normalize";
import { extractUpcs } from "../lib/upc";
import type { AliasEntityType, AliasKind, Match } from "../types";

type Role = "brand" | "line_label" | "line_name" | "brand_firm" | "parent" | "manufacturer";
/** Short aliases are scanned separately and become "brand" / "line_label" hits once corroborated. */

interface Phrase {
  tokens: string[];
  role: Role;
  brandId: string | null;
  lineId: string | null;
  entityType: AliasEntityType;
  entityId: string;
  alias: string;
  aliasKind: AliasKind;
}

/** Opaque, prebuilt lookup structure. */
export interface CatalogIndex {
  snapshot: CatalogSnapshot;
  /** Global phrases (everything except context-only line names), keyed by first token. */
  byFirstToken: Map<string, Phrase[]>;
  /** Context-only line names per brand, keyed by first token. */
  lineNames: Map<string, Map<string, Phrase[]>>;
  brandNames: Map<string, string>;
  lineNamesById: Map<string, string>;
  /** Short (firm-corroborated) aliases per brand. */
  shortByBrand: Map<string, Phrase[]>;
  /** Brand firm-name phrase -> every brand that lists it. */
  firmBrands: Map<string, Set<string>>;
  brandsByParent: Map<string, string[]>;
  brandsByManufacturer: Map<string, string[]>;
  /** Core prefixes (company prefix without the number-system digit) per brand. */
  upcCorePrefixes: Map<string, string[]>;
  linesByBrand: Map<string, { id: string; formats: string[] }[]>;
  /** Normalized UPC (see normalizeUpc) -> line id, from data/ line `upcs`. */
  lineByUpc: Map<string, string>;
  /** Normalized brand-identifying phrases per brand (name, dba, label, short), for "brand named alone". */
  brandPhrases: Map<string, Set<string>>;
  /** Normalized standalone phrase (brand alias or line label) -> brand id. */
  phraseBrand: Map<string, string>;
}

/** Trailing corporate suffixes dropped from firm phrases ("Lidl US, LLC" also matches "Lidl US"). */
const CORP_SUFFIX = new Set(["inc", "llc", "l l c", "co", "corp", "corporation", "company", "ltd", "limited", "lp", "llp", "incorporated", "the"]);
function stripCorpSuffix(tokens: string[]): string[] {
  const t = [...tokens];
  while (t.length > 2 && CORP_SUFFIX.has(t[t.length - 1]!)) t.pop();
  if (t.length >= 4 && t.slice(-3).join(" ") === "l l c") t.splice(-3);
  return t;
}

const ROLE_PRIORITY: Record<Role, number> = {
  line_label: 6,
  brand: 5,
  manufacturer: 4,
  brand_firm: 3,
  parent: 2,
  line_name: 1,
};

function roleOf(a: { entityType: AliasEntityType; kind: AliasKind }): Role {
  switch (a.entityType) {
    case "brand":
      return a.kind === "firm" ? "brand_firm" : "brand";
    case "line":
      return a.kind === "label" ? "line_label" : "line_name";
    case "parent":
      return "parent";
    case "manufacturer":
      return "manufacturer";
  }
}

export function buildCatalogIndex(snapshot: CatalogSnapshot): CatalogIndex {
  const lineBrand = new Map(snapshot.lines.map((l) => [l.id, l.brandId]));
  const byFirstToken = new Map<string, Phrase[]>();
  const lineNames = new Map<string, Map<string, Phrase[]>>();
  const addTo = (map: Map<string, Phrase[]>, p: Phrase) => {
    const k = p.tokens[0]!;
    const list = map.get(k) ?? [];
    list.push(p);
    map.set(k, list);
  };
  const shortByBrand = new Map<string, Phrase[]>();
  const firmBrands = new Map<string, Set<string>>();
  for (const a of snapshot.aliases) {
    const tokens = (a.normalized || normalizeText(a.alias)).split(" ").filter(Boolean);
    if (!tokens.length) continue;
    const role = roleOf(a);
    const brandId = a.entityType === "brand" ? a.entityId : a.entityType === "line" ? (lineBrand.get(a.entityId) ?? null) : null;
    if ((a.entityType === "brand" || a.entityType === "line") && !brandId) continue;
    const p: Phrase = {
      tokens,
      role,
      brandId,
      lineId: a.entityType === "line" ? a.entityId : null,
      entityType: a.entityType,
      entityId: a.entityId,
      alias: a.alias,
      aliasKind: a.kind,
    };
    if (a.kind === "short") {
      // brand short -> "brand" hit, line short -> "line_label" hit, once the firm corroborates.
      shortByBrand.set(brandId!, [
        ...(shortByBrand.get(brandId!) ?? []),
        { ...p, role: a.entityType === "line" ? "line_label" : "brand" },
      ]);
      // A short line alias also works as a context-only line name.
      if (a.entityType === "line") {
        const m = lineNames.get(brandId!) ?? new Map<string, Phrase[]>();
        addTo(m, { ...p, role: "line_name" });
        lineNames.set(brandId!, m);
      }
      continue;
    }
    if (role === "line_name") {
      const m = lineNames.get(brandId!) ?? new Map<string, Phrase[]>();
      addTo(m, p);
      lineNames.set(brandId!, m);
    } else addTo(byFirstToken, p);
    if (role === "brand_firm") {
      const k = tokens.join(" ");
      firmBrands.set(k, (firmBrands.get(k) ?? new Set()).add(brandId!));
    }
    if (role === "brand_firm" || role === "parent" || role === "manufacturer") {
      const stripped = stripCorpSuffix(tokens);
      if (stripped.length < tokens.length) {
        addTo(byFirstToken, { ...p, tokens: stripped });
        if (role === "brand_firm") {
          const k = stripped.join(" ");
          firmBrands.set(k, (firmBrands.get(k) ?? new Set()).add(brandId!));
        }
      }
    }
  }
  const sortLongest = (m: Map<string, Phrase[]>) => {
    for (const list of m.values())
      list.sort((x, y) => y.tokens.length - x.tokens.length || ROLE_PRIORITY[y.role] - ROLE_PRIORITY[x.role]);
  };
  // Singular / plural of context line names: "Bully Stick" for "Bully Sticks", "Diner Classic" for
  // "Diner Classics", "Milk Replacers" for "Milk Replacer". Skipped when the variant is already a
  // phrase of the same brand (another line's name must keep winning).
  for (const m of lineNames.values()) {
    const taken = new Set([...m.values()].flat().map((p) => p.tokens.join(" ")));
    for (const p of [...m.values()].flat()) {
      if (p.aliasKind === "short") continue;
      const last = p.tokens[p.tokens.length - 1]!;
      if (!/^[a-z]{4,}$/.test(last) || /(?:ss|us|is)$/.test(last)) continue;
      const toggled = last.endsWith("s") ? last.slice(0, -1) : `${last}s`;
      const tokens = [...p.tokens.slice(0, -1), toggled];
      const key = tokens.join(" ");
      if (taken.has(key)) continue;
      taken.add(key);
      addTo(m, { ...p, tokens });
    }
  }
  sortLongest(byFirstToken);
  for (const m of lineNames.values()) sortLongest(m);
  for (const list of shortByBrand.values()) list.sort((x, y) => y.tokens.length - x.tokens.length);
  const linesByBrand = new Map<string, { id: string; formats: string[] }[]>();
  for (const l of snapshot.lines)
    linesByBrand.set(l.brandId, [...(linesByBrand.get(l.brandId) ?? []), { id: l.id, formats: [...l.formats] }]);
  const group = (pairs: [string, string][]) => {
    const m = new Map<string, string[]>();
    for (const [k, v] of pairs) m.set(k, [...(m.get(k) ?? []), v]);
    return m;
  };
  return {
    snapshot,
    byFirstToken,
    lineNames,
    brandNames: new Map(snapshot.brands.map((b) => [b.id, b.name])),
    lineNamesById: new Map(snapshot.lines.map((l) => [l.id, l.name])),
    shortByBrand,
    firmBrands,
    brandsByParent: group(snapshot.brands.map((b) => [b.parentId, b.id])),
    brandsByManufacturer: group(snapshot.brands.flatMap((b) => b.manufacturerIds.map((m): [string, string] => [m, b.id]))),
    upcCorePrefixes: new Map(
      snapshot.brands.filter((b) => b.upcPrefixes?.length).map((b) => [b.id, (b.upcPrefixes ?? []).map((x) => x.slice(1))]),
    ),
    linesByBrand,
    lineByUpc: new Map(snapshot.lines.flatMap((l) => (l.upcs ?? []).map((u): [string, string] => [u, l.id]))),
    brandPhrases: (() => {
      const m = new Map<string, Set<string>>();
      for (const a of snapshot.aliases) {
        if (a.entityType !== "brand" || a.kind === "firm") continue;
        const k = (a.normalized || normalizeText(a.alias)).trim();
        if (k) m.set(a.entityId, (m.get(a.entityId) ?? new Set()).add(k));
      }
      return m;
    })(),
    phraseBrand: new Map(
      snapshot.aliases
        .filter((a) => (a.entityType === "brand" && a.kind !== "firm") || (a.entityType === "line" && (a.kind === "label" || a.kind === "short")))
        .map((a): [string, string] => [(a.normalized || normalizeText(a.alias)).trim(), a.entityType === "brand" ? a.entityId : (lineBrand.get(a.entityId) ?? "")])
        .filter(([k, b]) => k && b),
    ),
  };
}

// ---------------------------------------------------------------- scanning

/** Token stream; BREAK separates chunks so no phrase spans two chunks. */
const BREAK = "\u0000";

interface Stream {
  tokens: string[];
  byline: boolean[];
}

const BYLINE_RE =
  /\b(?:manufactured|distributed|marketed|packed|packaged|made|produced|imported|mfd|dist|mfg)\.?(?:\s+(?:in|for)\s+(?:the\s+)?(?:usa|u\.s\.a?\.?|united\s+states|canada))?\s+(?:exclusively\s+)?(?:by|for)\b\s*:?/gi;

const US_STATES =
  "A[LKZR]|C[AOT]|D[EC]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|PR|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY]";
/** "Arden Hills, MN 55126", "Rhinelander, WI 54501-0100", "Markham, IL 60428": place names are not brands. */
const ADDRESS_RE = new RegExp(
  String.raw`(?:\b\d+\s+(?:[NSEW]\.?\s+)?(?:[A-Z0-9][\w.]*\s+){0,3}(?:St|Street|Rd|Road|Ave|Avenue|Dr|Drive|Blvd|Hwy|Highway|Ln|Lane|Way|Pkwy|Parkway|Ct|Court|Pl|Place)\b\.?,?\s*)?(?:\bP\.?\s?O\.?\s+Box\s+\d+\.?,?\s*)?\b[A-Z][A-Za-z.]+(?:\s+[A-Z][A-Za-z.]+){0,2},?\s+(?:${US_STATES})\.?,?\s+(?:USA\s+)?\d{5}(?:-\d{4})?\b`,
  "g",
);

/** Split text into main / byline chunks. A byline runs to the next ",", ";", "." + space, digit, or "(". */
function toStream(texts: string[]): Stream {
  const tokens: string[] = [];
  const byline: boolean[] = [];
  const pushText = (t: string, isByline: boolean) => {
    const toks = normalizeText(t).split(" ").filter(Boolean);
    if (!toks.length) return;
    tokens.push(BREAK);
    byline.push(isByline);
    for (const tok of toks) {
      tokens.push(tok);
      byline.push(isByline);
    }
  };
  for (const raw of texts) {
    // "9LivesTM, EverPetTM": a trademark sign that became the letters TM/SM glued to the name.
    const s = cleanText(raw)
      .replace(/(?<=[a-z0-9])(?:TM|SM)(?![A-Za-z])/g, "")
      .replace(ADDRESS_RE, " ; ");
    if (!s) continue;
    let i = 0;
    BYLINE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = BYLINE_RE.exec(s))) {
      pushText(s.slice(i, m.index), false);
      const start = BYLINE_RE.lastIndex;
      const rest = s.slice(start);
      const stop = rest.search(/[,;(]|\.\s|\s\d|\bUPC\b|\bNet\s+W/i);
      const end = stop >= 0 ? start + stop : s.length;
      pushText(s.slice(m.index, end), true);
      i = end;
      BYLINE_RE.lastIndex = end;
    }
    pushText(s.slice(i), false);
  }
  return { tokens, byline };
}

interface Hit {
  phrase: Phrase;
  start: number;
  end: number; // exclusive
  byline: boolean;
}

function matchAt(tokens: string[], i: number, p: Phrase): boolean {
  if (i + p.tokens.length > tokens.length) return false;
  for (let k = 0; k < p.tokens.length; k++) if (tokens[i + k] !== p.tokens[k]) return false;
  return true;
}

/** Left-to-right longest-match scan. */
function scan(stream: Stream, table: Map<string, Phrase[]>, from = 0, to = stream.tokens.length): Hit[] {
  const hits: Hit[] = [];
  let i = from;
  while (i < to) {
    const cands = table.get(stream.tokens[i]!);
    let best: Phrase | null = null;
    if (cands)
      for (const p of cands) {
        if (i + p.tokens.length > to) continue;
        if (matchAt(stream.tokens, i, p)) {
          best = p; // sorted longest-first, then by role priority
          break;
        }
      }
    if (best) {
      hits.push({ phrase: best, start: i, end: i + best.tokens.length, byline: stream.byline[i] ?? false });
      i += best.tokens.length;
    } else i++;
  }
  return hits;
}

// ---------------------------------------------------------------- results

export interface MatchSpan {
  /** Normalized phrase that matched, e.g. "hills prescription diet". */
  phrase: string;
  /** The catalog alias as written in data/, e.g. "Hill's Prescription Diet". */
  alias: string;
  entityType: AliasEntityType;
  entityId: string;
  aliasKind: AliasKind;
  /** upc = a UPC company prefix of the brand owner (with the recalling firm). */
  where: "text" | "byline" | "firm" | "upc";
  /** Token offsets in the normalized text ([start, end)); -1 for firm hits. */
  start: number;
  end: number;
}

export interface ProductMatch extends Match {
  /** True when the brand rests on weak evidence (recalling firm or byline only). Never line level. */
  needsReview: boolean;
  /** A brand-level match because the brand is named alone in a brand list: every line is recalled. */
  brandWide?: boolean;
  spans: MatchSpan[];
}

export interface ProductMatchResult {
  matches: ProductMatch[];
  /** Every catalog phrase seen (brands, lines, firms, parents, co-packers), for audits. */
  spans: MatchSpan[];
  /** Co-packer (manufacturer) ids named in the text or the firm. */
  coPackers: string[];
  /** Text hits only (no firm / byline): brand ids. */
  strongBrandIds: string[];
}

export interface MatchInput {
  description: string;
  codeInfo?: string | null;
  moreCodeInfo?: string | null;
  /** Recalling firm. Supporting evidence only (and the corroboration short aliases need). */
  firm?: string | null;
  /** Extra free text read like the description, e.g. the de-slugged title of a listing notice. */
  title?: string | null;
}

function spanOf(h: Hit, stream: Stream | null, where: MatchSpan["where"]): MatchSpan {
  return {
    phrase: h.phrase.tokens.join(" "),
    alias: h.phrase.alias,
    entityType: h.phrase.entityType,
    entityId: h.phrase.entityId,
    aliasKind: h.phrase.aliasKind,
    where,
    start: stream ? h.start : -1,
    end: stream ? h.end : -1,
  };
}

/** Every phrase of `table` that matches anywhere in the stream (not only the longest). */
function allPhrases(stream: Stream, table: Map<string, Phrase[]>): Phrase[] {
  const out: Phrase[] = [];
  stream.tokens.forEach((tok, i) => {
    for (const p of table.get(tok) ?? []) if (matchAt(stream.tokens, i, p)) out.push(p);
  });
  return out;
}

interface FirmEvidence {
  /** Brands the firm owns: one of its firm names, or its brand name, is in the firm. */
  owner: Set<string>;
  /** owner plus brands of a parent or co-packer named by the firm. */
  any: Set<string>;
  /** Firm phrases that point at exactly one brand (safe for a weak suggestion). */
  hits: Hit[];
  coPackers: string[];
  /** The firm names a parent (or retailer) that owns several catalog brands. */
  multiBrandParent: boolean;
}

function firmEvidence(firm: string | null | undefined, index: CatalogIndex): FirmEvidence {
  const ev: FirmEvidence = { owner: new Set(), any: new Set(), hits: [], coPackers: [], multiBrandParent: false };
  if (!firm) return ev;
  const fs = toStream([firm]);
  for (const p of allPhrases(fs, index.byFirstToken)) {
    if (p.role === "brand_firm") for (const b of index.firmBrands.get(p.tokens.join(" ")) ?? [p.brandId!]) ev.owner.add(b);
    else if (p.role === "brand" || p.role === "line_label") ev.owner.add(p.brandId!);
    else if (p.role === "parent") {
      const owned = index.brandsByParent.get(p.entityId) ?? [];
      if (owned.length > 1) ev.multiBrandParent = true;
      for (const b of owned) ev.any.add(b);
    }
    else if (p.role === "manufacturer") {
      ev.coPackers.push(p.entityId);
      for (const b of index.brandsByManufacturer.get(p.entityId) ?? []) ev.any.add(b);
    }
  }
  for (const b of ev.owner) ev.any.add(b);
  ev.hits = scan(fs, index.byFirstToken);
  return ev;
}

/** Format cues that pick a brand's only line of that format. Normalized-token regexes. */
const FORMAT_CUES: { format: string; re: RegExp }[] = [
  { format: "wet", re: /\b(?:canned|cans?|metal cans?)\b/ },
  { format: "freeze-dried", re: /\bfreeze dried\b/ },
  // "Keep Frozen", "Frozen product", "raw frozen": a brand's only raw line. Never for dried or freeze-dried text.
  { format: "raw", re: /^(?!.*\b(?:freeze dried|dehydrated|dried|air dried)\b).*\b(?:keep frozen|frozen|raw)\b/ },
];
/** Line names that are just a format word: after a line label of the same brand they describe that line. */
const GENERIC_LINE_WORDS = new Set(["pate", "pates", "stew", "stews", "gravy", "loaf", "chunks", "dinner", "dinners", "canned", "wet", "dry", "treats", "chews", "jerky", "biscuits", "kibble", "raw", "frozen"]);

/** Brand- and line-level matches for one recall product row. */
export function matchProductDetailed(input: MatchInput, index: CatalogIndex): ProductMatchResult {
  const stream = toStream([input.description, input.codeInfo ?? "", input.moreCodeInfo ?? "", input.title ?? ""]);
  const hits = scan(stream, index.byFirstToken);
  const firm = firmEvidence(input.firm, index);

  // Short aliases of brands the recalling firm corroborates, where no other phrase matched.
  if (firm.any.size) {
    const table = new Map<string, Phrase[]>();
    for (const b of firm.any)
      for (const p of index.shortByBrand.get(b) ?? []) table.set(p.tokens[0]!, [...(table.get(p.tokens[0]!) ?? []), p]);
    for (const list of table.values()) list.sort((x, y) => y.tokens.length - x.tokens.length);
    for (const h of scan(stream, table))
      if (!hits.some((o) => o.start < h.end && h.start < o.end)) hits.push(h);
    hits.sort((a, b) => a.start - b.start);
  }

  const spans: MatchSpan[] = hits.map((h) => spanOf(h, stream, h.byline ? "byline" : "text"));
  const coPackers = new Set([...hits.filter((h) => h.phrase.role === "manufacturer").map((h) => h.phrase.entityId), ...firm.coPackers]);

  const identifying = (h: Hit) => h.phrase.role === "brand" || h.phrase.role === "line_label";
  const strong = hits.filter((h) => identifying(h) && !h.byline);
  const matches = new Map<string, ProductMatch>();
  const add = (m: ProductMatch) => {
    const key = `${m.brandId}\u0000${m.lineId ?? ""}`;
    const prev = matches.get(key);
    if (!prev) matches.set(key, m);
    else {
      prev.spans.push(...m.spans);
      prev.needsReview = prev.needsReview && m.needsReview;
    }
  };

  const cores = extractUpcs([input.description, input.codeInfo ?? "", input.moreCodeInfo ?? ""].join(" ; "));
  /** A line of `brandId` whose catalog UPCs include one of the row's UPCs. */
  const lineFromUpc = (brandId: string): { lineId: string; upc: string } | null => {
    for (const c of cores) {
      const lineId = index.lineByUpc.get(c);
      if (lineId && lineId.startsWith(`${brandId}/`)) return { lineId, upc: c };
    }
    return null;
  };
  const upcSpan = (lineId: string, upc: string): MatchSpan => ({
    phrase: `upc ${upc}`,
    alias: `known UPC ${upc}`,
    entityType: "line",
    entityId: lineId,
    aliasKind: "name",
    where: "upc",
    start: -1,
    end: -1,
  });

  // UPC company prefix + owner firm: brand level, when the text names no brand. Line names of that
  // brand anywhere in the row ("Dog Chew 7'' Bully Stick ... UPC 785184207017") and its known UPCs
  // still give the line.
  if (!strong.length && firm.owner.size) {
    for (const b of firm.owner) {
      const prefix = (index.upcCorePrefixes.get(b) ?? []).find((pre) => cores.some((c) => c.startsWith(pre)));
      if (!prefix) continue;
      const span: MatchSpan = {
        phrase: `upc prefix ${prefix}`,
        alias: `UPC company prefix …${prefix}`,
        entityType: "brand",
        entityId: b,
        aliasKind: "firm",
        where: "upc",
        start: -1,
        end: -1,
      };
      spans.push(span);
      const lineHits = scan(stream, index.lineNames.get(b) ?? new Map());
      const known = lineFromUpc(b);
      if (lineHits.length)
        for (const lh of lineHits) {
          const ls = spanOf(lh, stream, lh.byline ? "byline" : "text");
          spans.push(ls);
          add({ brandId: b, lineId: lh.phrase.lineId, level: "line", method: "alias", needsReview: false, spans: [span, ls], detail: "" });
        }
      else if (known) {
        const ls = upcSpan(known.lineId, known.upc);
        spans.push(ls);
        add({ brandId: b, lineId: known.lineId, level: "line", method: "alias", needsReview: false, spans: [span, ls], detail: "" });
      } else add({ brandId: b, lineId: null, level: "brand", method: "alias", needsReview: false, spans: [span], detail: "" });
    }
  }

  if (strong.length) {
    const brandOf = (h: Hit) => h.phrase.brandId!;
    // A brand directly followed by another brand ("Country Vet, Heartland Harvest Dog Biscuits")
    // is a list: its region runs to the end of the list's last region.
    const regionEndOf = (k: number): number => {
      const h = strong[k]!;
      const nk = strong.findIndex((o, j) => j > k && brandOf(o) !== brandOf(h));
      if (nk < 0) return stream.tokens.length;
      const next = strong[nk]!;
      const lastOfBrand = strong.filter((o, j) => j < nk && brandOf(o) === brandOf(h)).pop()!;
      const gapFromLast = stream.tokens.slice(lastOfBrand.end, next.start);
      if (gapFromLast.every((t) => t === "and" || t === "or") && gapFromLast.length <= 1) return regionEndOf(nk);
      return next.start;
    };
    const lineHitsByBrand = new Map<string, Hit[]>();
    const regionTokens = new Map<string, string[]>();
    const regions: { brandId: string; start: number; end: number }[] = [];
    strong.forEach((h, k) => {
      const brandId = brandOf(h);
      if (h.phrase.role === "line_label") {
        const list = lineHitsByBrand.get(brandId) ?? [];
        list.push(h);
        lineHitsByBrand.set(brandId, list);
      }
      let regionStart = h.start;
      if (!strong.slice(0, k).some((o) => brandOf(o) !== brandId)) regionStart = 0;
      const regionEnd = regionEndOf(k);
      regionTokens.set(brandId, [...(regionTokens.get(brandId) ?? []), ...stream.tokens.slice(regionStart, regionEnd)]);
      regions.push({ brandId, start: regionStart, end: regionEnd });
      const table = index.lineNames.get(brandId);
      if (table) {
        for (const lh of scan(stream, table, regionStart, regionEnd)) {
          // already covered by a line label ("blue wilderness" contains "wilderness")
          if (strong.some((o) => o.phrase.lineId === lh.phrase.lineId && o.start <= lh.start && lh.end <= o.end)) continue;
          // "Fromm Diner Classics Milo's Meatloaf Pate": the format word describes the labelled line
          if (
            GENERIC_LINE_WORDS.has(lh.phrase.tokens.join(" ")) &&
            strong.some((o) => o.phrase.role === "line_label" && brandOf(o) === brandId && o.phrase.lineId !== lh.phrase.lineId && o.end <= lh.start)
          )
            continue;
          const list = lineHitsByBrand.get(brandId) ?? [];
          if (list.some((o) => o.start === lh.start && o.phrase.lineId === lh.phrase.lineId)) continue;
          list.push(lh);
          lineHitsByBrand.set(brandId, list);
          spans.push(spanOf(lh, stream, lh.byline ? "byline" : "text"));
        }
      }
    });
    // Two brands of one parent in one list ("Bravo Packing, Inc. Pet food: Performance Dog, beef,
    // green tripe, and bone"): a line name of the first brand that falls in the second brand's region,
    // and is not a line name of that brand, still belongs to the first.
    const parentOf = (b: string) => index.snapshot.brands.find((x) => x.id === b)?.parentId;
    const strongBrands = [...new Set(strong.map(brandOf))];
    for (const a of strongBrands) {
      const table = index.lineNames.get(a);
      if (!table) continue;
      for (const lh of scan(stream, table)) {
        const owner = regions.find((r) => r.start <= lh.start && lh.end <= r.end && r.brandId !== a && !regions.some((o) => o.brandId === a && o.start <= lh.start && lh.end <= o.end));
        if (!owner || parentOf(owner.brandId) !== parentOf(a)) continue;
        const ownerTable = index.lineNames.get(owner.brandId);
        const key = lh.phrase.tokens.join(" ");
        if (ownerTable && [...ownerTable.values()].flat().some((p) => p.tokens.join(" ") === key)) continue;
        if ((lineHitsByBrand.get(owner.brandId) ?? []).some((o) => o.start < lh.end && lh.start < o.end)) continue;
        const list = lineHitsByBrand.get(a) ?? [];
        if (list.some((o) => o.start === lh.start && o.phrase.lineId === lh.phrase.lineId)) continue;
        list.push(lh);
        lineHitsByBrand.set(a, list);
        spans.push(spanOf(lh, stream, lh.byline ? "byline" : "text"));
      }
    }
    const brandSpans = new Map<string, MatchSpan[]>();
    for (const h of strong) {
      if (h.phrase.role !== "brand") continue;
      const list = brandSpans.get(h.phrase.brandId!) ?? [];
      list.push(spanOf(h, stream, "text"));
      brandSpans.set(h.phrase.brandId!, list);
    }
    const brandIds = [...new Set(strong.map(brandOf))];
    for (const brandId of brandIds) {
      const lineHits = lineHitsByBrand.get(brandId) ?? [];
      const viaBrand = brandSpans.get(brandId) ?? [];
      if (lineHits.length) {
        // "brands including ... Pro Pac, Pro Pac Ultimates, ... Sportmix and Meridian": the brand is
        // also named alone as a list item, so the whole brand is recalled, not only the named lines.
        if (brandNamedAlone(input.description, brandId, lineHits, index))
          add({ brandId, lineId: null, level: "brand", method: "alias", needsReview: false, brandWide: true, spans: [...viaBrand], detail: "" });
        for (const lh of lineHits) {
          const lineSpan = spanOf(lh, stream, lh.byline ? "byline" : "text");
          add({
            brandId,
            lineId: lh.phrase.lineId,
            level: "line",
            method: "alias",
            needsReview: false,
            spans: lh.phrase.role === "line_label" ? [lineSpan] : [...viaBrand, lineSpan],
            detail: "",
          });
        }
        continue;
      }
      // Brand level only: a format cue in the brand's region picks its one line of that format.
      // The brand's region first; a brand named last in a row ("... Chicken Heart Raw treats Kanu Pet")
      // falls back to the whole row, which describes one product.
      const region = (regionTokens.get(brandId) ?? []).filter((t) => t !== BREAK).join(" ");
      const row = stream.tokens.filter((t) => t !== BREAK).join(" ");
      const lines = index.linesByBrand.get(brandId) ?? [];
      const oneLine = (format: string) => lines.filter((l) => l.formats.includes(format)).length === 1;
      const cue =
        FORMAT_CUES.map((c) => ({ c, m: c.re.exec(region) })).find((x) => x.m && oneLine(x.c.format)) ??
        FORMAT_CUES.map((c) => ({ c, m: c.re.exec(row) })).find((x) => x.m && oneLine(x.c.format));
      const known = lineFromUpc(brandId);
      if (known) {
        const span = upcSpan(known.lineId, known.upc);
        spans.push(span);
        add({ brandId, lineId: known.lineId, level: "line", method: "alias", needsReview: false, spans: [...viaBrand, span], detail: "" });
      } else if (cue) {
        const line = lines.find((l) => l.formats.includes(cue.c.format))!;
        const span: MatchSpan = {
          phrase: cue.m![0],
          alias: `format cue: ${cue.c.format}`,
          entityType: "line",
          entityId: line.id,
          aliasKind: "name",
          where: "text",
          start: -1,
          end: -1,
        };
        spans.push(span);
        add({ brandId, lineId: line.id, level: "line", method: "alias", needsReview: false, spans: [...viaBrand, span], detail: "" });
      } else add({ brandId, lineId: null, level: "brand", method: "alias", needsReview: false, spans: viaBrand, detail: "" });
    }
  } else if (!matches.size) {
    // Weak evidence only: brand named in a byline, a brand firm name in the text, or the recalling firm.
    const weak: { brandId: string; span: MatchSpan }[] = [];
    for (const h of hits)
      if ((identifying(h) || h.phrase.role === "brand_firm") && h.phrase.brandId)
        weak.push({ brandId: h.phrase.brandId, span: spanOf(h, stream, h.byline ? "byline" : "text") });
    for (const h of firm.hits) spans.push(spanOf(h, null, "firm"));
    // A co-packer firm never implies a brand; a firm name shared by several brands (a parent
    // or retailer: "Nestle Purina PetCare", "The Kroger Co") suggests none of them.
    if (!firm.coPackers.length && !firm.multiBrandParent)
      for (const h of firm.hits) {
        if (!(identifying(h) || h.phrase.role === "brand_firm") || !h.phrase.brandId) continue;
        if (h.phrase.role === "brand_firm" && (index.firmBrands.get(h.phrase.tokens.join(" "))?.size ?? 1) > 1) continue;
        weak.push({ brandId: h.phrase.brandId, span: spanOf(h, null, "firm") });
      }
    for (const w of weak)
      add({ brandId: w.brandId, lineId: null, level: "brand", method: "alias", needsReview: true, spans: [w.span], detail: "" });
  }

  const out = [...matches.values()];
  for (const m of out) m.detail = describe(m);
  return {
    matches: out,
    spans,
    coPackers: [...coPackers],
    strongBrandIds: [...new Set([...strong.map((h) => h.phrase.brandId!), ...out.filter((m) => !m.needsReview).map((m) => m.brandId)])],
  };
}

/** Items of a comma / "and" list, normalized: "CanineX, Pro Pac, Sportmix and Meridian" -> ["caninex", "pro pac", ...]. */
function listItems(text: string): string[] {
  return cleanText(text)
    .replace(/,\s*(?:inc|llc|l\.l\.c|ltd|co|corp|corporation|company)\b\.?/gi, "") // "Bravo Packing, Inc." is one name
    .split(/[,;:]|\band\b|\bor\b|&/i)
    .map((x) => normalizeText(x))
    .filter(Boolean);
}

/**
 * True when `brandId` is named alone as an item of a brand list (a neighbouring item is another
 * brand) AND one of its matched lines comes from another
 * list item that names no other brand ("Pro Pac, Pro Pac Ultimates"; "Earthborn Holistic, Venture,
 * Unrefined"). Not for a trailing noun shared by a brand list ("Country Vet, Heartland Harvest Dog
 * Biscuits"): there the line words sit in another brand's item.
 */
function brandNamedAlone(description: string, brandId: string, lineHits: Hit[], index: CatalogIndex): boolean {
  const phrases = index.brandPhrases.get(brandId);
  if (!phrases) return false;
  const items = listItems(description);
  // the brand is an item of a brand list: an item next to it is another brand (or line label)
  // ("... brands including CanineX, Earthborn Holistic, Venture"): the neighbour starts or ends with it
  const otherBrandItem = (k: number) => {
    const it = items[k];
    if (!it) return false;
    const b = index.phraseBrand.get(it);
    if (b) return b !== brandId;
    const st = toStream([it]);
    return scan(st, index.byFirstToken).some(
      (h) =>
        (h.phrase.role === "brand" || h.phrase.role === "line_label") &&
        h.phrase.brandId !== brandId &&
        (h.start === 1 || h.end === st.tokens.length),
    );
  };
  if (!items.some((it, k) => phrases.has(it) && (otherBrandItem(k - 1) || otherBrandItem(k + 1)))) return false;
  const linePhrases = lineHits.map((h) => ` ${h.phrase.tokens.join(" ")} `);
  return items.some((it) => {
    if (phrases.has(it)) return false;
    if (!linePhrases.some((lp) => ` ${it} `.includes(lp))) return false;
    const others = scan(toStream([it]), index.byFirstToken).filter(
      (h) => (h.phrase.role === "brand" || h.phrase.role === "line_label") && h.phrase.brandId !== brandId,
    );
    return !others.length;
  });
}

function describe(m: ProductMatch): string {
  const parts = m.spans.map((s) => `${s.where === "text" ? "" : `${s.where}:`}${s.entityType}:${s.aliasKind}:"${s.phrase}"`);
  return `${m.needsReview ? "weak " : ""}${m.brandWide ? "brand-wide (named alone in a brand list) " : ""}${m.level} via ${[...new Set(parts)].join(", ")}`.slice(0, 500);
}

/** Match one product's text (description + code info). Level is 'brand' or 'line' here; 'lot' is decided with lot rules. */
export function matchProduct(text: string, index: CatalogIndex): Match[] {
  return matchProductDetailed({ description: text }, index).matches.map(({ brandId, lineId, level, method, detail }) => ({
    brandId,
    lineId,
    level,
    method,
    detail,
  }));
}
