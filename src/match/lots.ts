/**
 * Lot / date rule extraction. OWNER: matcher agent.
 *
 * Lots and dates appear in BOTH Product Description and Code Info (and More Code
 * Info). Parse every source into typed rules; keep the exact snippet in `raw`.
 * Kinds: exact, prefix, range, best_by_date, best_by_range, all_lots, retailer_scope
 * (see LOT_RULE_KINDS in src/types.ts). Per-SKU/UPC scoping ("SKU 3389: lots ...")
 * goes in `scope`.
 *
 * needsReview = true whenever the parse is not clean. A Stop-level email is only
 * allowed from a rule with needsReview = false.
 *
 * Conventions for shapes the fixed kinds cannot express exactly (all needsReview):
 *   - "lot codes containing X" (substring)      -> exact, value X
 *   - "lots ending in X through Y"               -> range X..Y ("lots ending in X" alone is a clean suffix rule)
 *   - production / manufacture dates only        -> production_date (dates parsed, value = the printed text)
 *   - an unlabelled date in Code Info            -> best_by_date / best_by_range (we cannot tell best-by from production)
 *   - a lot code with a date inside ("TD2 26 FEB 2019") -> exact (the whole code) plus best_by_date; the date
 *     is clean only when the text calls it a best-by date
 *   - "codes beginning with AH ... and expiration dates between X and Y" -> prefix rules carrying the date
 *     window (a conjunction, see LotRule in src/types.ts); one-character prefixes need review
 *   - "Code Info: None" on an iRES row with no other rule -> all_lots (needs review)
 *   - "Multiple codes" / "various lots" with nothing else  -> all_lots (needs review)
 *   - consumer units printed without a code ("no code dates on the bags, only on the case boxes",
 *     "Bulk pig ears have no lot codes")        -> the codes are scoped to the case; all_lots for the
 *                                                  unit (scope "bag", "bulk"), needs review
 *   - "Lot: X, BB: 08/2026" (one clause)        -> exact X carrying the date window (a conjunction)
 *   - anything left over that we cannot read     -> no rule; returned in `unparsed` (parseLotRulesDetailed)
 *                                                  so the run opens a lot_parse review item with the text
 *
 * Never an exact rule with an empty value. A best-by date before the recall started (a typo such as
 * "Exp. Date 6/8/2020" in a 2022 recall) needs review. A lot that appears in only one of
 * description / Code Info next to a one-character variant in the other ("1339T1" / "1139T1"), or
 * whose shape differs from the rest of its list ("PBST000p06" among "210166PBST000P06"), needs review.
 *
 * All input is untrusted recall text: it is only matched against fixed regexes,
 * never evaluated, and tags are stripped first.
 */
import { cleanText, upcCheckDigitValid } from "../lib/normalize";
import { extractUpcs as extractUpcCores } from "../lib/upc";
import type { LotRule, LotRuleKind } from "../types";
import { isWholeDate, MONTH_RE, parseDateAt, parseDateList, type DateSpan } from "./dates";

/** Hard boundary left where an extractor consumed text; lists never run across it. */
const B = "\u0001";
/** Follows B where a labelled lot list ("Lot # ...") was consumed. */
const LOT_MARK = "\u0002";
const MAX_RAW = 300;

interface Ctx {
  rules: LotRule[];
  scope: string | null;
  /** Description text: only keyword-anchored extraction, no leftover review rules. */
  fromDescription: boolean;
  productionDates: { value: string; raw: string; from: string | null; to: string | null }[];
  /** Year the recall started, for judging two-digit years ("Exp. 07/10"). */
  refYear?: number;
  /** Recalling firm, for "sold from bulk bins" style retailer scopes. */
  firm: string | null;
  /** The segment named a lot explicitly ("Lot 25260A3453"): unlabeled codes beside it need review. */
  labeledLot: boolean;
  /** Text no extractor could read (shared by every segment of a row). */
  unparsed: string[];
  /** Production dates encoded in kitchen codes ("WH11.1.18 to WH1.14.19"), ISO from..to. */
  encodedWindows: { from: string; to: string }[];
}

export interface LotParseOptions {
  /** Recall initiation (or classification) date, ISO. */
  refDate?: string | null;
  /** Recalling firm. */
  firm?: string | null;
  /**
   * iRES rows: a Code Info of "None" / "No code information on label" (or none at all) with no
   * other rule means every lot of the product is affected (all_lots, needs review).
   */
  noCodeMeansAllLots?: boolean;
}

const squash = (s: string) => s.replace(/[\u0001\u0002]/g, " ").replace(/\s+/g, " ").trim();
const rawOf = (s: string) => {
  const t = squash(s);
  return t.length > MAX_RAW ? `${t.slice(0, MAX_RAW - 1)}…` : t;
};

function push(
  ctx: Ctx,
  kind: LotRuleKind,
  raw: string,
  fields: Partial<Pick<LotRule, "value" | "valueTo" | "dateFrom" | "dateTo" | "scope">> = {},
  needsReview = false,
) {
  ctx.rules.push({
    kind,
    value: fields.value ?? null,
    valueTo: fields.valueTo ?? null,
    dateFrom: fields.dateFrom ?? null,
    dateTo: fields.dateTo ?? null,
    scope: fields.scope ?? ctx.scope,
    raw: rawOf(raw),
    needsReview,
  });
}

/** Character-class shape of a code: digits -> 9, letters -> A. Same shape = comparable range. */
export function codeShape(code: string): string {
  return code.toUpperCase().replace(/\s+/g, " ").replace(/[0-9]/g, "9").replace(/[A-Z]/g, "A");
}

/** Canonical form for comparing lot codes: upper-case, single spaces. */
export function normalizeLot(code: string): string {
  return code.toUpperCase().replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------- UPCs

/** One implementation for ingestion and matching: src/lib/upc.ts. */
export { extractUpcs } from "../lib/upc";

// ---------------------------------------------------------------- scopes

interface Segment {
  scope: string | null;
  text: string;
}

const SIZE = String.raw`\d+(?:\.\d+)?\s*(?:oz|lbs?|pounds?|kg|g)\b\.?`;

/** Split Code Info into per-SKU / per-size / per-item segments. */
function splitScopes(text: string): Segment[] {
  const markers: { index: number; end: number; scope: string }[] = [];
  const add = (re: RegExp, scopeOf: (m: RegExpExecArray) => string) => {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) markers.push({ index: m.index, end: m.index + m[0].length, scope: scopeOf(m) });
  };
  add(/\bSKU\s*#?\s*(\d+)\s*:/gi, (m) => `SKU ${m[1]}`);
  add(
    new RegExp(String.raw`(?<![\w.])(${SIZE})(?:\s*bags?)?(?:\s+(?:bag\s+)?(?:lot\s+codes?|lots?)\b)?\s*:`, "gi"),
    (m) => squash(m[1]!.replace(/\.$/, "")),
  );
  add(new RegExp(String.raw`\((${SIZE})\)`, "gi"), (m) => squash(m[1]!.replace(/\.$/, "")));
  // "72 oz. ; WH11.1.18 ..." / "7 oz. WH11.1.18 ...": a size at the start of the field or after ";" / ","
  // directly followed by a code (no colon)
  add(new RegExp(String.raw`(?:^|(?<=[;,]))\s*(${SIZE})\s*;?\s*(?=[A-Z]{1,3}\s?\d)`, "gi"), (m) => squash(m[1]!.replace(/\.$/, "")));
  // "7-pack: 1759T1 8-pack: 1129T1 & 1549T1" (TDBBS)
  add(/(?<![\w.])(\d+\s*-?\s*(?:pack|pk))\s*:/gi, (m) => squash(m[1]!));
  // "Product Codes 9900008 and 9900009: MANFU DATE: ..." (Christofersen)
  add(/\bproduct\s+codes?\s*:?\s*(\d[\w-]*(?:\s*(?:,|and|&)\s*\d[\w-]*)*)\s*:/gi, (m) => `product code ${squash(m[1]!).replace(/\s*(?:,|and|&)\s*/gi, ", ")}`);
  add(/\b(cat|dog)\s+lot\s+codes?\s*:/gi, (m) => m[1]!.toLowerCase());
  // "50 count-Lot: 20250301PR" (Petdine): the pack size scopes the lots after it
  add(/(?<![\w.])(\d+\s*(?:count|ct))\s*-\s*(?=lots?\b)/gi, (m) => squash(m[1]!));
  add(/\b([A-Z][\w']*(?:\s+[A-Z][\w']*){0,3})\s+brand\s*:/g, (m) => m[1]!);
  // Numbered items "1) ... 2) ..." or "1.  ... 2.  ..." (only when the sequence 1, 2 exists)
  for (const re of [/(?:^|\s)(\d{1,2})\)\s+/g, /(?:^|\s)(\d{1,2})\.\s+(?=[A-Z])/g]) {
    const found: { index: number; end: number; n: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) found.push({ index: m.index, end: m.index + m[0].length, n: Number(m[1]) });
    if (found.some((f) => f.n === 1) && found.some((f) => f.n === 2))
      for (const f of found) markers.push({ index: f.index, end: f.end, scope: `item ${f.n}` });
  }
  // Lettered items "a) ... b) ..." (Ark Naturals), only when a) and b) both exist
  {
    const re = /(?:^|[\s;:,])([a-z])\)\s*/g;
    const found: { index: number; end: number; l: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) found.push({ index: m.index, end: m.index + m[0].length, l: m[1]! });
    if (found.some((f) => f.l === "a") && found.some((f) => f.l === "b"))
      for (const f of found) markers.push({ index: f.index, end: f.end, scope: `item ${f.l}` });
  }
  if (!markers.length) return [{ scope: null, text }];
  markers.sort((a, b) => a.index - b.index);
  const segs: Segment[] = [];
  const head = text.slice(0, markers[0]!.index);
  if (head.trim()) segs.push({ scope: null, text: head });
  markers.forEach((mk, i) => {
    const next = markers[i + 1];
    segs.push({ scope: mk.scope, text: text.slice(mk.end, next ? next.index : text.length) });
  });
  return segs;
}

// ---------------------------------------------------------------- extractors

/** Replace every match of `re` in ctx text with a boundary, after calling `fn`. */
function consume(s: string, re: RegExp, fn: (m: RegExpExecArray) => boolean | void): string {
  return s.replace(re, (...args) => {
    const groups = args.slice(0, -2) as string[];
    const index = args[args.length - 2] as number;
    const m = Object.assign([...groups], { index, input: s }) as unknown as RegExpExecArray;
    return fn(m) === false ? groups[0]! : ` ${B} `;
  });
}

function dateRules(ctx: Ctx, spans: DateSpan[], raw: string, extraReview = false) {
  for (const sp of spans) {
    const review = extraReview || sp.ambiguous;
    if (sp.shape === "day" && sp.from) push(ctx, "best_by_date", raw, { dateFrom: sp.from }, review);
    else push(ctx, "best_by_range", raw, { dateFrom: sp.from, dateTo: sp.to }, review);
  }
}

const DATE_KW = String.raw`(?:bes(?:t)?[\s-]*(?:by|bt|before|buy|if[\s-]+used[\s-]+(?:by|before)|used[\s-]+by)(?:[\s-]*dates?)?(?:\s*codes?)?(?:\s*range)?|bubd|bbd|bb\s*dates?|bb(?=\s*[:.]?\s*\d)|use[\s-]*by(?:\s*dates?)?|sell[\s-]*by(?:\s*dates?)?|exp(?:iration|iry)?\.?(?:\s*dates?)?|expires?)`;

/** "Best By ...", "BB 10/19/18", "Exp. 11/21", "expiration dates of December 2019 through January 2021", "Best By Before 10/31/2024". */
function extractDateClauses(ctx: Ctx, s: string): string {
  const re = new RegExp(String.raw`\b${DATE_KW}\s*(?:of\s+|code\s+of\s+|between\s+|on\s+)?[:.,]?\s*(before\s+|prior\s+to\s+)?`, "giy");
  let out = "";
  let i = 0;
  const finder = new RegExp(String.raw`\b${DATE_KW}`, "gi");
  let m: RegExpExecArray | null;
  while ((m = finder.exec(s))) {
    re.lastIndex = m.index;
    const k = re.exec(s);
    if (!k) continue;
    const before = !!k[1];
    const between = /between/i.test(k[0]);
    let list = parseDateList(s, re.lastIndex, { allowCompact: true, between, refYear: ctx.refYear });
    if (!list) continue;
    // "09/28/22, 09/30/222, 10/06/22, ...": a malformed date in the list goes to review; the list goes on
    for (;;) {
      const bad = /\s*,?\s*(\d{1,2}\/\d{1,2}\/(?:\d{3}|\d{5,}))(?![\d/])\s*,?\s*/y;
      bad.lastIndex = list.end;
      const bm = bad.exec(s);
      if (!bm) break;
      const more = parseDateList(s, bad.lastIndex, { allowCompact: true, refYear: ctx.refYear });
      if (!more) break;
      ctx.unparsed.push(`malformed date ${bm[1]}`);
      list = { spans: [...list.spans, ...more.spans], end: more.end };
    }
    const raw = s.slice(m.index, list.end);
    if (before) {
      const last = list.spans[list.spans.length - 1]!;
      push(ctx, "best_by_range", raw, { dateFrom: null, dateTo: last.to ?? last.from }, last.ambiguous);
    } else dateRules(ctx, list.spans, raw);
    out += s.slice(i, m.index) + ` ${B} `;
    i = list.end;
    finder.lastIndex = list.end;
  }
  return out + s.slice(i);
}

/** "manufactured on 10/19/18", "MFG 13 NOV 22", "Production dates: 9.9.25, 9.23.25", "Date Code 12.5.25". */
function extractProductionDates(ctx: Ctx, s: string): string {
  // "Production date codes: 18 216, 18 220" (Omaha Steaks): YY + Julian day codes printed on the bag
  s = consume(s, /\bproduction\s+(?:date\s+)?codes?\s*:?\s*((?:\d{2}\s?\d{3}(?:\s*(?:,|and|&)\s*)?)+)(?![\w])/gi, (m) => {
    for (const code of m[1]!.split(/\s*(?:,|\band\b|&)\s*/i).map((x) => squash(x)).filter(Boolean))
      push(ctx, "exact", m[0], { value: normalizeLot(code) });
  });
  const kw = /\b(?:manufactured\s+(?:on|between|in)|manufactur(?:e|ing|ed)\s+dates?|manfu\.?\s*dates?|mfg\.?\s*dates?|mfg\.?|mfd\.?|production\s+dates?|produced\s+on|date\s+codes?|made\s+on|manufactured)\s*(?:on\s+)?[:.,]?\s*(?:between\s+)?/giy;
  const finder = /\b(?:manufactur|manfu|mfg|mfd|production\s+date|produced\s+on|date\s+code|made\s+on)/gi;
  let out = "";
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = finder.exec(s))) {
    kw.lastIndex = m.index;
    const k = kw.exec(s);
    if (!k) continue;
    const list = parseDateList(s, kw.lastIndex, { between: /between/i.test(k[0]) });
    if (!list) continue;
    const raw = s.slice(m.index, list.end);
    // keep the printed text of each date so a human can compare it with the bag
    for (const sp of list.spans) ctx.productionDates.push({ value: sp.text, raw, from: sp.from, to: sp.to });
    out += s.slice(i, m.index) + ` ${B} `;
    i = list.end;
    finder.lastIndex = list.end;
  }
  return out + s.slice(i);
}

const STATE_NAMES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO", connecticut: "CT",
  delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI",
  minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC",
  "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
};
const STATE_CODES = new Set(Object.values(STATE_NAMES));
const STATE_ITEM = String.raw`(?:${Object.keys(STATE_NAMES).sort((a, b) => b.length - a.length).join("|")}|[A-Z]{2})`;
const STATE_LIST = new RegExp(String.raw`\bin\s+(${STATE_ITEM}(?:\s*,\s*(?:and\s+)?${STATE_ITEM}|\s+and\s+${STATE_ITEM})+)\b`, "i");

/** "located in AL, AR, LA" / "in Alabama, Arkansas and Tennessee" -> ["AL", "AR", ...]; [] when not a state list. */
function statesIn(clause: string): string[] {
  const m = STATE_LIST.exec(clause);
  if (!m) return [];
  const items = m[1]!.split(/\s*,\s*(?:and\s+)?|\s+and\s+/i).map((x) => x.trim());
  const codes = items.map((x) => STATE_NAMES[x.toLowerCase()] ?? (STATE_CODES.has(x.toUpperCase()) && x === x.toUpperCase() ? x : null));
  return codes.every(Boolean) ? [...new Set(codes as string[])] : [];
}

const PACKAGING_CONDITION = /\bpackaged\s+in\s+(?:material|packaging|containers?)\s+other\s+than\s+[^.;]*/i;

/**
 * "purchased from Family Dollar retail stores ... from January 1, 2021 to present", "sold at Walmart",
 * "sold from self-serve bulk bins" (the recalling retailer), "Sold since: 10/25/22".
 * States and packaging conditions go into the rule's scope.
 */
function extractRetailer(ctx: Ctx, s: string): string {
  const firmName = ctx.firm ? squash(ctx.firm) : "(recalling firm)";
  const condition = PACKAGING_CONDITION.exec(s)?.[0];
  s = consume(s, /\bpurchased\s+(?:from|at)\s+([^.;]*)/gi, (m) => {
    const clause = m[1]!;
    const nameMatch = new RegExp(String.raw`^(.*?)(?=\s+(?:retail\s+)?(?:stores?|locations?|outlets?)\b|\s+between\b|\s+from\b|\s+during\b|\s+located\b|\s+in\s+${STATE_ITEM}\b|\s+on\s+or\b|\s+that\b|\s+(?=\d)|\s+(?=${MONTH_RE})|$)`, "i").exec(clause);
    let name = squash(nameMatch?.[1] ?? clause);
    let review = false;
    if (/^(?:this|the|that)\s+(?:firm|distributor|company|business|retailer|supplier)$/i.test(name)) {
      name = "(recalling firm)";
      review = true;
    }
    let dateFrom: string | null = null;
    let dateTo: string | null = null;
    const w = /\b(between|from|since)\s+(?=\d|[A-Z][a-z]+\s+\d)/i.exec(clause);
    if (w) {
      const list = parseDateList(clause, w.index + w[0].length, { between: /between/i.test(w[1]!) });
      const sp = list?.spans[0];
      if (sp) {
        dateFrom = sp.from;
        dateTo = sp.shape === "day" ? (/since/i.test(w[1]!) ? null : sp.to) : sp.to;
      } else review = true;
    }
    if (!name) return false;
    const scopeParts = [statesIn(clause).join(", "), condition ? squash(condition) : ""].filter(Boolean);
    if (condition) review = true; // a packaging exclusion needs a human to read the bag
    push(ctx, "retailer_scope", m[0], { value: name, dateFrom, dateTo, scope: scopeParts.join("; ") || ctx.scope }, review);
  });
  s = consume(s, /\bsold\s+(?:from|in|at|through)\s+(?:the\s+)?(?:self[\s-]*serve\s+)?bulk\s+bins?\b/gi, (m) => {
    push(ctx, "retailer_scope", m[0], { value: `${firmName} (bulk bins)` });
  });
  {
    const re = /\bsold\s+(since|between|from)\s*:?\s*/gi;
    let out = "";
    let i = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      const list = parseDateList(s, re.lastIndex, { between: /between/i.test(m[1]!), refYear: ctx.refYear });
      const sp = list?.spans[0];
      if (!list || !sp) continue;
      const since = /since/i.test(m[1]!);
      push(ctx, "retailer_scope", s.slice(m.index, list.end), { value: firmName, dateFrom: sp.from, dateTo: since ? null : sp.to }, true);
      out += s.slice(i, m.index) + ` ${B} `;
      i = list.end;
      re.lastIndex = list.end;
    }
    s = out + s.slice(i);
  }
  s = consume(s, /\bsold\s+(?:exclusively\s+|only\s+)?(?:at|through|in)\s+([A-Z][\w'&.\-]*(?:\s+[A-Z][\w'&.\-]*){0,3})\s*(?:stores?|locations?)?/g, (m) => {
    push(ctx, "retailer_scope", m[0], { value: squash(m[1]!) });
  });
  return s;
}

/**
 * Prefix-like code item: "AH", "A", "AV".
 * List items for prefixes are short letter/digit codes.
 */
function readPrefixList(s: string, pos: number): { items: string[]; end: number } {
  const items: string[] = [];
  const re = /\s*(?:,\s*)?(?:\b(?:or|and)\b)?\s*["']?([A-Z0-9]{1,8})["']?(?![\w])/iy;
  let p = pos;
  for (;;) {
    re.lastIndex = p;
    const m = re.exec(s);
    if (!m) break;
    const word = m[1]!;
    if (/^(?:and|or|with|expiration|exp|best|dates?|lots?|codes?)$/i.test(word)) break;
    items.push(word.toUpperCase());
    p = re.lastIndex;
  }
  return { items, end: p };
}

const LOTLIKE = String.raw`[A-Z0-9][A-Z0-9\-/().]*`;

/** "All lot codes", "All lots within expiration including: ...", "All codes beginning with AH, AV", "lot numbers that end in X through Y". */
function extractBlanket(ctx: Ctx, s: string): string {
  // suffix rules (can appear without "all")
  s = consume(
    s,
    new RegExp(String.raw`\b(?:all\s+)?(?:products?\s+with\s+)?(?:lot\s+)?(?:codes?|lots?|numbers?|lot\s+numbers?)?\s*(?:that\s+)?end(?:s|ing)?\s+(?:in|with)\s+["']?(${LOTLIKE})["']?(?:\s*(?:through|thru|to|-)\s*["']?(${LOTLIKE})["']?)?`, "gi"),
    (m) => {
      const from = m[1]!.replace(/[.)]+$/, "");
      const to = m[2]?.replace(/[.)]+$/, "");
      if (to) push(ctx, "range", m[0], { value: normalizeLot(from), valueTo: normalizeLot(to) }, true);
      else push(ctx, "suffix", m[0], { value: normalizeLot(from) }, from.length < 2);
    },
  );
  // prefix rules
  {
    const re = /\b(?:all\s+)?(?:lot\s+)?(?:codes?|lots?)\s+(?:beginning|begin|starting|start)(?:s|ing)?\s+with\s+/gi;
    let out = "";
    let i = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      const { items, end: listEnd } = readPrefixList(s, re.lastIndex);
      if (!items.length) continue;
      let end = listEnd;
      // "... AB and expiration dates between 6/1/2019 and 5/31/2020": both must hold
      let dateFrom: string | null = null;
      let dateTo: string | null = null;
      let dateReview = false;
      const conj = new RegExp(String.raw`\s*,?\s*(?:and|with)\s+(?:with\s+)?(?:an?\s+)?${DATE_KW}\s*(?:of\s+|between\s+|from\s+)?[:.]?\s*`, "iy");
      conj.lastIndex = end;
      if (conj.exec(s)) {
        const list = parseDateList(s, conj.lastIndex, { allowCompact: true, between: /between/i.test(s.slice(end, conj.lastIndex)), refYear: ctx.refYear });
        if (list) {
          dateFrom = list.spans[0]!.from;
          const last = list.spans[list.spans.length - 1]!;
          dateTo = last.to ?? last.from;
          dateReview = list.spans.some((x) => x.ambiguous);
          end = list.end;
        }
      }
      const raw = s.slice(m.index, end);
      // a one-character prefix ("AV A, AI") is almost always a typo or truncation
      for (const it of items) push(ctx, "prefix", raw, { value: it, dateFrom, dateTo }, it.length < 2 || dateReview);
      out += s.slice(i, m.index) + ` ${B} `;
      i = end;
      re.lastIndex = end;
    }
    s = out + s.slice(i);
  }
  // "lot codes containing (production codes:) X, Y" -> substring rules
  {
    const re = /\b(?:lot\s+)?codes?\s+containing(?:\s+production\s+codes?)?\s*:?\s*/gi;
    let out = "";
    let i = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      const { items, end } = readLotItems(s, re.lastIndex);
      if (!items.length) continue;
      const raw = s.slice(m.index, end);
      for (const it of items) push(ctx, "exact", `${raw} (substring match)`, { value: it }, true);
      out += s.slice(i, m.index) + ` ${B} `;
      i = end;
      re.lastIndex = end;
    }
    s = out + s.slice(i);
  }
  // all lots
  s = consume(
    s,
    /\b(?:includes?\s+)?all\s+(?:lot\s+codes?|lot\s+numbers?|lots?|codes?|products?|product\s+codes?|sizes?|flavou?rs?|varieties|best[\s-]by\s+dates?|dates?)\b(?:\s+(?:within|in)\s+(?:expiration|expiry|date|code))?(\s+(?:including|includes?)\s*:?)?/gi,
    (m) => {
      const after = s.slice(m.index + m[0].length, m.index + m[0].length + 40);
      // a qualifier follows: the restriction is parsed by another extractor
      if (!m[1] && /^\s*(?:with|that|which|beginning|starting|ending|end|between|manufactured|made|produced|bearing|purchased|sold|from|of\s+the\s+following|listed|below|containing|in\s+the\s+range|having)\b/i.test(after)) {
        return false;
      }
      if (/purchased|sold/i.test(s)) return; // retailer rule carries the scope; drop "all products" wording
      push(ctx, "all_lots", m[0].replace(/\s+(?:including|includes?)\s*:?$/i, ""));
    },
  );
  return s;
}

/** "Code range: 6299 through 8040, each with the suffix plant number 803", "Lot Number 62763 through and including Lot Number 63101", "N24 1124 to N24 1224", "23233TFP 18 - 23316TFP 18". */
function extractRanges(ctx: Ctx, s: string): string {
  const CODE = String.raw`[A-Z0-9][A-Z0-9\-]*\d[A-Z0-9\-]*|\d`;
  const ITEM = String.raw`(?:${CODE})(?: [A-Z0-9]*\d[A-Z0-9]*| (?!(?:and|or|to|thru|through|lot|lots)\b)[A-Z]{2,5}(?![\w]))?`;
  const re = new RegExp(
    String.raw`(?:\bcode\s+range\s*:?\s*|\b(?:all\s+)?lots?\s+(?:between\s+)?|\bbetween\s+)?(?:lot\s*(?:number|no\.?|#)?\s*)?(?<![\w/.])(${ITEM})\s*(?:-|–|\bthru\b|\bthrough(?:\s+and\s+including)?\b|\bto\b|\band\b(?<=between.*))\s*(?:lot\s*(?:number|no\.?|#)?\s*)?(${ITEM})(?![\w/])((?:\s*[,;]?\s*each\s+with\s+[^;.]*)|(?:\s*[,;]?\s*with\s+(?:the\s+)?(?:suffix|prefix)[^;.]*))?`,
    "gi",
  );
  // "WH11.1.18 to WH1.14.19" (JustFoodForDogs): kitchen code + production date; not lexically comparable
  s = consume(s, /\b([A-Z]{1,3}) ?(\d{1,2}\.\d{1,2}\. ?\d{2})\s*(?:to|thru|through|-)\s*\1 ?(\d{1,2}\.\d{1,2}\. ?\d{2})(?![\d.])/g, (m) => {
    const a = `${m[1]}${m[2]!.replace(/\s+/g, "")}`;
    const b = `${m[1]}${m[3]!.replace(/\s+/g, "")}`;
    push(ctx, "range", m[0], { value: normalizeLot(a), valueTo: normalizeLot(b) }, true);
    const da = parseDateAt(m[2]!.replace(/\s+/g, ""), 0);
    const db = parseDateAt(m[3]!.replace(/\s+/g, ""), 0);
    if (da && db) ctx.encodedWindows.push({ from: da.from, to: db.to });
  });
  // "BEEF-A-06 422503 2025 thru BEEF-A-06 422504 0042" (Cargill): multi-word codes of one shape
  const W = String.raw`[A-Z0-9][A-Z0-9-]*`;
  s = consume(s, new RegExp(String.raw`(?<![\w-])(${W}(?: ${W}){2})\s+(?:thru|through|to)\s+(${W}(?: ${W}){2})(?![\w-])`, "g"), (m) => {
    const a = normalizeLot(m[1]!);
    const b = normalizeLot(m[2]!);
    if (codeShape(a) !== codeShape(b) || a.replace(/\D/g, "").length < 6 || isWholeDate(a)) return false;
    push(ctx, "range", m[0], { value: a, valueTo: b }, true);
  });
  return consume(s, re, (m) => {
    const a = m[1]!.trim();
    const b = m[2]!.trim();
    if (isWholeDate(a) || isWholeDate(b)) return false;
    const na = normalizeLot(a);
    const nb = normalizeLot(b);
    const sameShape = codeShape(na) === codeShape(nb);
    if (!sameShape || na.length < 3) return false;
    if (/^\d{1,3}$/.test(na)) return false; // "1-7" ages, small counts
    if (na > nb) return false;
    if (ctx.fromDescription && !/[A-Z]/.test(na) && na.length < 5) return false;
    push(ctx, "range", m[0], { value: na, valueTo: nb }, !!m[3]);
  });
}

const ITEM_STOP = /^(?:and|or|with|best|bb|bbd|bubd|exp|exp\.|expiration|use|sell|by|manufactured|manufacture|mfg|mfg\.|date|dates|upc|product|item|sku|lot|lots|batch|through|thru|to|each|the|of|in|on|at|for|includes?|production|code|codes|net|wt|case|cases|bag|bags|oz|lb|lbs|kg|g|pound|pounds|count|ct)$/i;

/**
 * Read a list of lot codes at `pos`: "092020T28, 102020T04, and 112020T11",
 * "01022021L2 05,  01022021L3 05", "E1066 and E1067", "2249 1082, 2250 1082".
 * An item is one or two words (single space), containing a digit.
 */
function readLotItems(s: string, pos: number, allowSpaceSep = false, afterLotKeyword = false): { items: string[]; end: number } {
  const items: string[] = [];
  const word = /[A-Za-z0-9][A-Za-z0-9\-/().]*/y;
  const sepRe = allowSpaceSep
    ? /\s*(?:,|;|&|\band\b|\bor\b)?\s*(?:,|&|\band\b)?\s*/y
    : /\s*(?:,|;|&|\band\b|\bor\b)\s*(?:,|&|\band\b)?\s*/y;
  let p = pos;
  let first = true;
  for (;;) {
    let q = p;
    if (!first) {
      sepRe.lastIndex = p;
      const sm = sepRe.exec(s);
      if (!sm || sepRe.lastIndex === p) break;
      q = sepRe.lastIndex;
    } else {
      while (q < s.length && /[\s:#;,.&]/.test(s[q]!)) q++;
    }
    word.lastIndex = q;
    const w1 = word.exec(s);
    if (!w1) break;
    let item = w1[0];
    let end = word.lastIndex;
    const bare1 = item.replace(/[.,)]+$/, "");
    if (ITEM_STOP.test(bare1)) break;
    // first word: has a digit ("092020T28", "B-5") or is a short line code ("E 178", "TFP")
    if (!/\d/.test(bare1) && !/^[A-Z]{1,3}$/.test(bare1)) break;
    if (s[end] === " " && s[end + 1] !== " ") {
      word.lastIndex = end + 1;
      const w2 = word.exec(s);
      if (w2) {
        const t = w2[0].replace(/[.,]+$/, "");
        const after = s[word.lastIndex];
        const ok =
          !ITEM_STOP.test(t) &&
          t.length <= 12 &&
          (after === undefined || /[\s,;&)\u0001]/.test(after) || (after === "." && !/\d/.test(s[word.lastIndex + 1] ?? ""))) &&
          ((/\d/.test(t) && (t.length >= 2 || /[A-Za-z]/.test(t))) || /^[A-Z]{1,6}\d*$/.test(t)) &&
          !(/^\d+$/.test(t) && /^(?:oz|lbs?|pounds?|kg|g|ct|count)\b/i.test(s.slice(word.lastIndex + 1, word.lastIndex + 8)));
        if (ok) {
          item = `${item} ${w2[0]}`;
          end = word.lastIndex;
          // a third short number: "0134E15 237 13", "20083 1PR00271 47"
          const w3 = /(\d{1,3})(?=$|\s{2,}|[,;&)\u0001]|\s+(?:best|bb|exp|use|sell|lot|upc)\b)/iy;
          if (s[end] === " " && s[end + 1] !== " " && (/\d/.test(t) || /^[A-Z]$/i.test(t))) {
            w3.lastIndex = end + 1;
            const m3 = w3.exec(s);
            if (m3) {
              item = `${item} ${m3[1]}`;
              end = end + 1 + m3[1]!.length;
            }
          }
        }
      }
    }
    // the item must end at a boundary ("11:04" is a time, not a lot)
    const next = s[end];
    if (next !== undefined && !/[\s,;&)\u0001]/.test(next) && !(next === "." && !/\d/.test(s[end + 1] ?? ""))) break;
    item = item.replace(/[.,;:]+$/, "").replace(/^\(+|\)+$/g, "");
    if (!/\d/.test(item) || item.length > 30) break;
    // bare one- or two-digit numbers are counts, not lots ("lot 84" right after the keyword is a lot)
    if (/^\d{1,2}$/.test(item) && !(afterLotKeyword && first && /^\d{2}$/.test(item))) break;
    // an unbalanced "(" means we grabbed into a parenthetical; trim it
    if ((item.match(/\(/g)?.length ?? 0) !== (item.match(/\)/g)?.length ?? 0)) item = item.replace(/\(.*$/, "");
    if (!item) break;
    items.push(item);
    p = end;
    first = false;
  }
  return { items, end: p };
}

/** "Lot # 1421FBP0101", "Lots E1066 and E1067", "Lot No. 1081804 and 1082804", "Batch Number: B195313", "BATCH ID 32CDS116". */
function extractLotLists(ctx: Ctx, s: string, review = false): string {
  // "Case Code 20200812", "Case Codes: 20200812 and 20200813": printed on the shipping case only
  // (Code Info only: in a description "Case code 11877" is the case item number)
  if (!ctx.fromDescription) s = consume(s, /\bcase\s+codes?\s*:?\s*(\d[\w-]*(?:\s*(?:,|and|&)\s*\d[\w-]*)*)/gi, (m) => {
    for (const c of m[1]!.split(/\s*(?:,|and|&)\s*/i).filter(Boolean)) push(ctx, "exact", m[0], { value: normalizeLot(c), scope: ctx.scope ? `${ctx.scope}; case` : "case" }, review);
  });
  // "Batch: 3188 (428590-C), 3188 (428590-D), ... & 3248 (419486-A)": batch plus sub-lot, both printed
  s = consume(
    s,
    /\b(?:lots?|batch(?:es)?)(?:\s*(?:codes?|numbers?|nos?\.?|#))?\s*:?\s*((?:[A-Z0-9][A-Z0-9-]*\s*\(\s*[A-Z0-9][A-Z0-9-]*\s*\)(?:\s*(?:,|&|\band\b))*\s*)+)/gi,
    (m) => {
      const pairs = [...m[1]!.matchAll(/([A-Z0-9][A-Z0-9-]*)\s*\(\s*([A-Z0-9][A-Z0-9-]*)\s*\)/gi)];
      if (!pairs.length || !pairs.every((p) => /\d/.test(p[1]!) && /\d/.test(p[2]!))) return false;
      ctx.labeledLot = true;
      for (const p of pairs) {
        push(ctx, "exact", m[0], { value: normalizeLot(p[1]!) }, review);
        push(ctx, "exact", m[0], { value: normalizeLot(p[2]!) }, review);
      }
    },
  );
  const re = /\b(?:(?:bulk\s+)?product\s+|code\s+)?(?:lots?|batch(?:es)?)(?:\s*(?:codes?|numbers?|nos?\.?|#|id|ids))*\s*(?:[:#.,]\s*)*/gi;
  let out = "";
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const { items, end } = readLotItems(s, re.lastIndex, false, /^(?:bulk\s+product\s+|product\s+|code\s+)?lots?\b/i.test(m[0]));
    if (!items.length) continue;
    const raw = s.slice(m.index, end);
    ctx.labeledLot = true;
    for (const it of items) {
      // "Lot Codes: 02/2020, 03/2020, ...": month/year values are dates (best-by or production?), not codes
      const my = /^(\d{1,2})\s*\/\s*(\d{4})$/.exec(it);
      const d = my ? parseDateAt(it, 0) : null;
      if (d && d.precision === "month") push(ctx, "best_by_range", raw, { dateFrom: d.from, dateTo: d.to }, true);
      else push(ctx, "exact", raw, { value: normalizeLot(it) }, review);
    }
    out += s.slice(i, m.index) + ` ${B}${LOT_MARK} `;
    i = end;
    re.lastIndex = end;
  }
  return out + s.slice(i);
}

const BEST_BY_LABEL_BEFORE = /\bbest[\s-]*(?:by|before|if[\s-]+used[\s-]+by)(?:[\s-]*dates?)?\s*[:#]?\s*$/i;

/**
 * Lots with an embedded date that would otherwise be read as a best-by: "TC2 3/APRIL/2020",
 * "TI1 3 Mar 2019", "TB 2 4/April/2020", "TA1 06/Oct/2020", "lot code V 07 Feb 2022".
 * The whole code is an exact lot. The date is also a best_by_date: clean when the text labels
 * the code itself as a best-by date ("Lot Code and Best By Date TA2 20 Nov 2019"), absent when
 * the field has its own best-by clause (then the code date is the production date), and needing
 * review otherwise (Sunshine Mills / Lidl codes are usually production dates).
 */
function extractLineDateLots(ctx: Ctx, s: string, fieldHasBestBy: boolean): string {
  const DATE = String.raw`(\d{1,2}\s*[/ \-]\s*${MONTH_RE}\s*[/ \-]\s*\d{4})(?![\d])`;
  const emit = (m: RegExpExecArray, code: string, dateText: string) => {
    const date = parseDateAt(dateText.replace(/\s*\/\s*/g, "/"), 0);
    push(ctx, "exact", m[0], { value: normalizeLot(`${code} ${dateText.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ")}`) });
    if (!date) return;
    const labelled = BEST_BY_LABEL_BEFORE.test(m.input.slice(Math.max(0, m.index - 40), m.index + (m[0].length - m[0].trimStart().length)));
    if (labelled) push(ctx, "best_by_date", m[0], { dateFrom: date.from });
    else if (!fieldHasBestBy) push(ctx, "best_by_date", m[0], { dateFrom: date.from }, true);
  };
  s = consume(s, new RegExp(String.raw`(?:\blots?\s*[:#]?\s*)?\b([A-Z]{1,3} ?\d{1,2})\s+${DATE}`, "gi"), (m) => {
    if (/^(?:by|bb|on|of|exp)\s?\d/i.test(m[1]!)) return false;
    emit(m, m[1]!, m[2]!);
  });
  // letter-only code, only right after a lot keyword
  s = consume(s, new RegExp(String.raw`\blots?(?:\s+codes?)?\s*[:#]?\s*([A-Z]{1,3})\s+${DATE}`, "gi"), (m) => {
    emit(m, m[1]!, m[2]!);
  });
  return s;
}

/** "12/25/2026B01": best-by date glued to a lot. "5309(11)181019 on label": GS1-style label form of a lot. */
function extractGlued(ctx: Ctx, s: string): string {
  // One printed code: the composite is what the bag shows. The date's meaning is not labelled, so the
  // batch-plus-date reading (a conjunction) needs review.
  s = consume(s, /\b(\d{1,2}\/\d{1,2}\/\d{4})([A-Z]\d{1,4})\b/g, (m) => {
    const d = parseDateAt(m[1]!, 0);
    if (!d) return false;
    push(ctx, "exact", m[0], { value: normalizeLot(m[0]) });
    push(ctx, "exact", m[0], { value: normalizeLot(m[2]!), dateFrom: d.from, dateTo: d.to }, true);
  });
  // "(written as 20190614 13753 on label)": the label form is what a consumer reads
  s = consume(s, /\(\s*(?:listed|written|printed|shown|appears?)\s+as\s+(.*?)\s+on\s+(?:the\s+)?(?:label|bag|package)\s*\)/gi, (m) => {
    push(ctx, "exact", m[0], { value: normalizeLot(m[1]!) });
  });
  return s;
}

/** A lot keyword followed by list items up to here: the next number is one more lot. */
const LOT_LIST_BEFORE = /\b(?:lots?|batch(?:es)?)\s*(?:numbers?|nos?\.?|#|codes?)?\s*[:#.]?\s*(?:[A-Z0-9][A-Z0-9-]*\s*(?:,|;|&|\band\b)\s*)*$/i;

/** Remove identifiers that are not lots (UPCs, product/item numbers, PLUs) and filler phrases. */
function stripNoise(ctx: Ctx, s: string): string {
  s = s.replace(/\([^()\d]*\)/g, " "); // parentheticals with no digits: "(on case)", "(found on the bottom of the can)"
  s = s.replace(/\b(?:please\s+)?note\s+that\b.*$/is, " ");
  s = s.replace(/\bplease\s+note\b.*$/is, " ");
  // explanations of the code layout are not codes: "Lot code breaks down as follows: 0 (1st digit) = Year 2020 ..."
  // but a date they state is: "-082218 is the expiration date 8-22-2018"
  {
    const expl = /\b(?:(?:lot\s+)?codes?\s+)?(?:breaks?\s+down|is\s+(?:read|interpreted|decoded))\s+as\s+follows\b.*$/is.exec(s);
    if (expl) {
      const re = new RegExp(String.raw`\bis\s+the\s+(${DATE_KW})\s*(?:date)?\s*:?\s*`, "gi");
      let m: RegExpExecArray | null;
      while ((m = re.exec(expl[0]))) {
        const d = parseDateAt(expl[0], re.lastIndex, false, ctx.refYear);
        if (d) push(ctx, d.precision === "day" ? "best_by_date" : "best_by_range", expl[0].slice(m.index, d.end), { dateFrom: d.from, dateTo: d.precision === "day" ? null : d.to }, d.ambiguous);
      }
    }
  }
  s = s.replace(/\b(?:(?:lot\s+)?codes?\s+)?(?:breaks?\s+down|is\s+(?:read|interpreted|decoded))\s+as\s+follows\b.*$/is, " ");
  // "11/9/2023 Expanded to include:" is when the recall grew, not a code or a best-by
  s = s.replace(/(?:\b\d{1,2}\/\d{1,2}\/\d{2,4}\s+)?\b(?:recall\s+)?expanded\s+to\s+include\s*:?/gi, ` ${B} `);
  // pack counts: "4 cans per pack and 6 packs per case", "24 cans per case", "15 packages per case"
  s = s.replace(/\b\d+\s*(?:cans?|packs?|pouch(?:es)?|bags?|packages?|units?|pieces?|canisters?|bottles?|trays?|boxes?|tubs?|count|ct)?\s+(?:total\s+)?per\s+(?:pack|case|bag|box|carton|display|tray)\b/gi, " ");
  s = s.replace(/\b(?:code\s+)?(?:is\s+)?(?:printed|stamped|located|found|listed)\s+on\b[^;.]*/gi, ` ${B} `);
  s = s.replace(/(?:second|first|last)\s+part\s+of\s+/gi, " ");
  s = s.replace(/\b(?:UPC|GTIN|EAN)s?(?:\s+(?:code|codes|is|no\.?|number|#))*\s*[:#]?\s*(?:\d[\d \-]*\d|\d)(?:\s*(?:and|&|,)\s*\d[\d \-]*\d)*/gi, ` ${B} `);
  // "UPC Code for the case - 6 8113107896 9"
  s = s.replace(/\b(?:UPC|GTIN)\s+codes?\s+for\s+the\s+(?:case|cans?|bags?|units?|packages?|box(?:es)?)\s*[-:]?\s*[\d -]*\d/gi, ` ${B} `);
  // "Packer/Manufacturer Number: 11300253442", "Establishment No. 1234": plant ids, not lots
  s = s.replace(/\b(?:packer|manufacturer|plant|establishment)(?:\s*\/\s*(?:packer|manufacturer))?\s*(?:numbers?|nos?\.?|#)\s*:?\s*[A-Z0-9][A-Z0-9-]*/gi, ` ${B} `);
  s = s.replace(/\b(?:product|item|sku|catalog(?:ue)?)(?:\s+(?:and|&)\s+(?:catalog(?:ue)?|item|product))?(?:\s+ids?)?\s*(?:codes?|nos?\.?|numbers?|#s?)?\s*(?:\([^)]*\))?\s*[:#,]?\s*[A-Z0-9][A-Z0-9\-]*(?:\s*(?:,|and|&)\s*[A-Z0-9][A-Z0-9\-]*\d[A-Z0-9\-]*)*/gi, (m) =>
    /\d/.test(m) ? ` ${B} ` : m,
  );
  // bare 12-digit numbers with a valid check digit are UPCs (src/lib/upc.ts), not lots
  // ... except inside a lot list ("Lot No. 250402202223, 121110202122, 210510202324")
  s = s.replace(/(?<![\d-])\d{12}(?![\d-])/g, (m, off: number, all: string) =>
    upcCheckDigitValid(m) && !LOT_LIST_BEFORE.test(all.slice(Math.max(0, off - 200), off)) ? ` ${B} ` : m,
  );
  s = consume(s, /\bPLU\s*#?\s*(\d{3,6})\b/gi, (m) => {
    push(ctx, "exact", m[0], { value: `PLU ${m[1]}` }, true);
  });
  s = s.replace(new RegExp(String.raw`(?<![\w.])(?:\d+\s*x\s*)?${SIZE}(?:\s*(?:bags?|cans?|cases?|pouch(?:es)?|boxes?|tubs?|packages?))?`, "gi"), " ");
  return s;
}

const FILLER = /\b(?:and|or|with|the|a|an|of|on|in|at|for|to|each|all|per|bag|bags|case|cases|can|cans|package|packages|label|labels|time|code|codes|lot|lots|number|numbers|date|dates|expanded|include|includes|including|individual|products?|food|treats?|pet|purchased|this|firm|following|as|is|are|follows|interpreted|bearing|within|expiration|stamped|back|front|bottom|top|side|printed|found|located|sold|only|also|affected|recalled|sizes?|varieties|flavou?rs?|retail|stores?|no|none|n\/a|upcs?)\b/gi;

/** A token that could be a lot code: has digits, is not a count, an ordinal or a name like "9Lives". */
function lotLike(t: string): boolean {
  const digits = t.match(/\d/g)?.length ?? 0;
  if (!digits || t.length < 3) return false;
  if (/^\d+(?:st|nd|rd|th)$/i.test(t)) return false;
  return digits >= 2 || t.length <= 4;
}

/** Whatever is left after every extractor ran. */
function handleLeftover(ctx: Ctx, s: string, rulesBefore: number) {
  let afterLotLabel = false;
  const parts = s.split(B).map((p) => p.trim()).filter(Boolean);
  for (const rawPart of parts) {
    if (rawPart.includes(LOT_MARK)) afterLotLabel = true;
    const part = rawPart.replace(new RegExp(LOT_MARK, "g"), " ").trim();
    if (!part) continue;
    // An unlabeled date (list or range): "August 3, 2019", "5/1/2017 - 9/1/2019", "& Date 6/21/2023".
    // Best-by or production date cannot be told apart, so it needs review. A range that repeats the
    // production dates encoded in the field's kitchen codes ("WH11.1.18 to WH1.14.19 ... Nov 1, 2018 to
    // Jan 14, 2019") is that production window.
    const lead = part.replace(/^(?:[\s,.;:&]+|(?:and|dates?)\b)+/i, "");
    const dl = parseDateList(lead, 0, { refYear: ctx.refYear });
    if (dl && !lead.slice(dl.end).replace(FILLER, " ").replace(/[\s,.;:&\-/()#"'=]+/g, "")) {
      for (const sp of dl.spans) {
        const encoded = ctx.encodedWindows.some((w) => sp.from !== null && sp.to !== null && w.from <= sp.from && sp.to <= w.to);
        if (encoded) push(ctx, "production_date", part, { value: sp.text, dateFrom: sp.from, dateTo: sp.to }, true);
        else dateRules(ctx, [sp], part, true);
      }
      continue;
    }
    // A part made only of code-like items (keywordless list): "102020T10, 102020T25", "N26 0114", "62HYCS1"
    const { items, end } = readLotItems(part, 0, true);
    const rest = part.slice(end).replace(/[\s,.;:&\-/]+/g, " ").trim();
    if (items.length && !rest.replace(FILLER, "").replace(/[\s,.;:&\-/]+/g, "").trim()) {
      for (const it of items) {
        if (isWholeDate(it)) {
          const d = parseDateAt(it, 0, false, ctx.refYear);
          if (d) dateRules(ctx, [{ from: d.from, to: d.precision === "day" ? d.from : d.to, ambiguous: true, shape: d.precision === "day" ? "day" : "range", text: it }], part, true);
          continue;
        }
        // "Sell By 10/29/22 L3": a plant / line suffix, not a lot of its own
        if (/^L\d{1,2}$/i.test(it)) continue;
        // an unlabeled code BEFORE an explicit "Lot ..." label is probably an item or product number;
        // an unlabeled code that reads like a date ("4 24-27") or a Sunshine code with no day
        // ("TA1/Feb/2021") cannot be compared reliably
        const dateLike = /^\d{1,2}[\s/.-]\d{1,2}[\s/.-]\d{2,4}$/.test(it) || new RegExp(String.raw`^[A-Z]{1,3}\d?\s*/\s*${MONTH_RE}\s*/\s*\d{2,4}$`, "i").test(it);
        push(ctx, "exact", part, { value: normalizeLot(it) }, (ctx.labeledLot && !afterLotLabel) || dateLike);
      }
      continue;
    }
    const residue = part.replace(FILLER, " ").replace(/[\s,.;:&\-/()#"'=]+/g, " ").trim();
    if (!residue) continue;
    if (/\b(?:multiple|various|several|many|assorted)\s+(?:lot\s+)?(?:codes?|lots?|dates?)\b/i.test(part) && ctx.rules.length === rulesBefore) {
      // "Multiple codes": every lot may be affected; a human reads the notice
      push(ctx, "all_lots", part, {}, true);
    } else if (residue.split(" ").some(lotLike) || /\b(?:see\s+attached|refer)\b/i.test(part)) {
      ctx.unparsed.push(rawOf(part));
    }
  }
}

/**
 * One clause that pairs lots with a date: "Lot:20250321APR, BB:08/2026", "Lots: 20250361-1PR,
 * 20250361-2PR, BB: 08/2025" -> exact lots carrying the date window (a conjunction: lot AND date, so a
 * bag with the same best-by but another lot is not a Stop). "Lot E2411034: 12-9-2026" (date not
 * labelled) -> the lot alone; the date stays in `raw`.
 */
function extractLotDatePairs(ctx: Ctx, s: string): string {
  const LOT = String.raw`[A-Z0-9][A-Z0-9-]*\d[A-Z0-9-]*`;
  const re = new RegExp(
    String.raw`\blots?\s*[:#]?\s*(${LOT}(?:\s*(?:,|&|\band\b)\s*${LOT})*)\s*,\s*(?:BB|best\s*by|exp(?:iration|iry)?)\.?(?:\s*dates?)?\s*:?\s*`,
    "gi",
  );
  let out = "";
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const list = parseDateList(s, re.lastIndex, { allowCompact: true, refYear: ctx.refYear });
    if (!list || list.spans.length !== 1) continue;
    const sp = list.spans[0]!;
    ctx.labeledLot = true;
    for (const lot of m[1]!.split(/\s*(?:,|&|\band\b)\s*/i).filter(Boolean))
      push(ctx, "exact", s.slice(m.index, list.end), { value: normalizeLot(lot), dateFrom: sp.from, dateTo: sp.to }, sp.ambiguous);
    out += s.slice(i, m.index) + ` ${B} `;
    i = list.end;
    re.lastIndex = list.end;
  }
  s = out + s.slice(i);
  s = consume(s, new RegExp(String.raw`\blot\s+(${LOT})\s*:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})(?![\d/])`, "gi"), (m) => {
    ctx.labeledLot = true;
    push(ctx, "exact", m[0], { value: normalizeLot(m[1]!) });
  });
  return s;
}

/** "LOT CODE/ SKU number T-22220 U-C-004 T-22223 U-C-005": (lot, SKU) pairs. */
function extractLotSkuPairs(ctx: Ctx, s: string): string {
  const re = /\blots?\s*(?:codes?|numbers?|#)?\s*\/\s*sku\s*(?:numbers?|#|nos?\.?)?\s*[:#]?\s*((?:[A-Z0-9][\w-]*\d[\w-]*\s+[A-Z0-9][\w-]*\d[\w-]*(?:\s*[,;]\s*|\s+|$))+)/gi;
  return consume(s, re, (m) => {
    const toks = m[1]!.trim().split(/[\s,;]+/).filter(Boolean);
    if (toks.length % 2) return false;
    for (let k = 0; k < toks.length; k += 2)
      push(ctx, "exact", m[0], { value: normalizeLot(toks[k]!), scope: `SKU ${toks[k + 1]}` });
  });
}

type Base = Omit<Ctx, "rules" | "scope" | "fromDescription" | "productionDates" | "labeledLot" | "encodedWindows">;

function parseSegment(seg: Segment, fromDescription: boolean, base: Base, fieldHasBestBy: boolean): LotRule[] {
  const ctx: Ctx = { ...base, rules: [], scope: seg.scope, fromDescription, productionDates: [], labeledLot: false, encodedWindows: [] };
  let s = ` ${seg.text} `;
  if (!fromDescription) s = stripNoise(ctx, extractLotSkuPairs(ctx, s));
  else s = s.replace(/\b(?:UPC|GTIN|EAN)s?(?:\s+(?:code|codes|is|no\.?|number|#))*\s*[:#]?\s*(?:\d[\d \-]*\d)/gi, ` ${B} `);
  s = extractGlued(ctx, s);
  s = extractLineDateLots(ctx, s, fieldHasBestBy);
  s = extractRetailer(ctx, s);
  s = extractBlanket(ctx, s);
  s = extractLotDatePairs(ctx, s);
  s = extractDateClauses(ctx, s);
  s = extractProductionDates(ctx, s);
  s = extractRanges(ctx, s);
  s = extractLotLists(ctx, s);
  if (!fromDescription) {
    handleLeftover(ctx, s, 0);
    // Only production dates: keep them visible, but never clean (they are not lot or best-by data).
    if (!ctx.rules.length)
      for (const p of ctx.productionDates)
        push(ctx, "production_date", `production date: ${p.raw}`, { value: p.value, dateFrom: p.from, dateTo: p.to }, true);
  }
  return ctx.rules;
}

const EMPTY_CODE = /^(?:n\/?a|none|no\s+codes?|no\s+code\s+information(?:\s+on\s+(?:the\s+)?label)?|no\s+lot(?:\s+codes?)?(?:\s+on\s+(?:the\s+)?(?:label|package|bag))?|unknown|not\s+applicable)\.?$/i;

/** "UPC 30lb bag: 0736570085750 3.5lb bag: 073657008736": per-size UPC lists are not lot scopes. */
const SIZED_UPC_LIST = /\b(?:UPC|GTIN)s?\s*:?\s*((?:\d+(?:\.\d+)?\s*(?:lbs?|oz|kg|g)\.?\s*(?:bags?)?\s*:\s*\d[\d \-]{8,}\d(?![\d.])\s*,?\s*)+)/gi;

function parseCodeField(text: string | null | undefined, fromDescription: boolean, base: Base): LotRule[] {
  let t = cleanText(text);
  if (!t || EMPTY_CODE.test(t)) return [];
  if (!fromDescription) t = t.replace(SIZED_UPC_LIST, " ; ");
  const fieldHasBestBy = new RegExp(String.raw`\b${DATE_KW}`, "i").test(t);
  const segs = fromDescription ? [{ scope: null, text: t }] : splitScopes(t);
  const perSeg = segs.map((seg) => parseSegment(seg, fromDescription, base, fieldHasBestBy));
  // "Lot 30lb: TA2 ... 3.5lb: TD2 ... Best By 02/11/22": one trailing best-by covers every size
  if (perSeg.length > 1) {
    const isDate = (r: LotRule) => r.kind === "best_by_date" || r.kind === "best_by_range";
    const withDates = perSeg.map((rs, k) => (rs.some((r) => isDate(r) && !r.needsReview) ? k : -1)).filter((k) => k >= 0);
    const last = perSeg.length - 1;
    if (withDates.length === 1 && withDates[0] === last && segs[last]!.scope && segs.slice(0, last).some((sg) => sg.scope))
      for (const r of perSeg[last]!) if (isDate(r) && !r.needsReview) r.scope = null;
  }
  return perSeg.flat();
}

const ruleKey = (r: LotRule) =>
  [r.kind, r.value ?? "", r.valueTo ?? "", r.dateFrom ?? "", r.dateTo ?? "", r.scope ?? "", r.value === null && r.dateFrom === null && r.dateTo === null ? r.raw : ""].join("\u0000");

/** Lots and unread text of one recall product row. */
export interface LotParseResult {
  rules: LotRule[];
  /** Text no extractor could read; the run puts it in the row's lot_parse review item. Never a rule. */
  unparsed: string[];
}

/**
 * Typed lot / best-by rules for one recall product row.
 * Duplicate rules (same kind, values and scope) are merged; a clean copy wins over
 * a needs-review copy. Retailer scopes for the same retailer are merged into one.
 */
export function parseLotRules(
  description: string,
  codeInfo: string | null,
  moreCodeInfo: string | null = null,
  opts: LotParseOptions = {},
): LotRule[] {
  return parseLotRulesDetailed(description, codeInfo, moreCodeInfo, opts).rules;
}

/** Consumer units printed without a code: "no code dates on the (individual) bags", "the individual bags are not" (labelled). */
const UNIT_WITHOUT_CODE = [
  /\bno\s+(?:code\s+dates?|lot\s+codes?|codes?|dates?|lot\s+numbers?)\s+on\s+the\s+(?:individual\s+|retail\s+)?(bags?|packages?|units?|cans?|chubs?|pouches?|tubs?)\b/i,
  /\b(?:individual|retail)\s+(bags?|packages?|units?|cans?|chubs?|pouches?)\s+(?:are|is)\s+not\b/i,
];
/** "Bulk pig ears have no lot codes": the bulk (unlabelled) product has every lot. */
const BULK_WITHOUT_CODE = /\bbulk\b[^.;]{0,40}?\b(?:have|has|with|carry|bear)\s+no\s+(?:lot\s+)?(?:codes?|numbers?)\b/i;

const singular = (w: string) => w.toLowerCase().replace(/(?:es|s)$/, "") || w.toLowerCase();

export function parseLotRulesDetailed(
  description: string,
  codeInfo: string | null,
  moreCodeInfo: string | null = null,
  opts: LotParseOptions = {},
): LotParseResult {
  const refYear = opts.refDate && /^\d{4}/.test(opts.refDate) ? Number(opts.refDate.slice(0, 4)) : undefined;
  const unparsed: string[] = [];
  const base: Base = { refYear, firm: opts.firm ?? null, unparsed };
  const fromCode = [...parseCodeField(codeInfo, false, base), ...parseCodeField(moreCodeInfo, false, base)];
  const fromDesc = parseCodeField(description, true, base);

  // A lot in the description that contradicts the Code Info lots (copy-paste errors such as
  // "Case Label: ...; Lot # GA 1102" on a row whose Code Info says "Lot #: GA0131") needs review.
  const tight = (v: string) => v.replace(/[\s\-]+/g, "");
  // Only the one-lot-versus-one-lot case: Code Info is often a truncated copy of a longer description.
  const codeLots = new Set(fromCode.filter((r) => r.kind === "exact" && r.value && !r.needsReview).map((r) => tight(r.value!)));
  const descLots = new Set(fromDesc.filter((r) => r.kind === "exact" && r.value).map((r) => tight(r.value!)));
  if (codeLots.size === 1 && descLots.size === 1 && !codeLots.has([...descLots][0]!))
    for (const r of fromDesc) if (r.kind === "exact" && r.value) r.needsReview = true;
  // Both name several lots and each has one the other lacks, one character apart ("1339T1" in the
  // description, "1139T1" in Code Info): one of them is a typo, so both need review.
  if (codeLots.size && descLots.size) {
    const onlyCode = [...codeLots].filter((v) => !descLots.has(v));
    const onlyDesc = [...descLots].filter((v) => !codeLots.has(v));
    const near = (a: string, b: string) => a.length === b.length && [...a].filter((c, k) => c !== b[k]).length === 1;
    const flagged = new Set<string>();
    for (const a of onlyCode) for (const b of onlyDesc) if (near(a, b)) flagged.add(a).add(b);
    for (const r of [...fromCode, ...fromDesc]) if (r.kind === "exact" && r.value && flagged.has(tight(r.value))) r.needsReview = true;
  }

  const all = [...fromCode, ...fromDesc];

  // A 10-digit "lot" with the manufacturer prefix of the row's UPCs / product numbers is a product number
  // ("Product Numbers: 7910014981 ... Lot Code: 7910083052, 7910058991, 1179395, ...").
  const productIds = new Set<string>([...extractUpcCores(`${description} ; ${codeInfo ?? ""} ; ${moreCodeInfo ?? ""}`)]);
  for (const m of `${codeInfo ?? ""} ${description}`.matchAll(/\bproduct\s+(?:numbers?|nos?\.?|#)\s*:?\s*((?:\d{10}\s*(?:,|and|&)?\s*)+)/gi))
    for (const n of m[1]!.match(/\d{10}/g) ?? []) productIds.add(n);
  const mfr = new Set([...productIds].filter((u) => /^\d{10}$/.test(u)).map((u) => u.slice(0, 5)));
  const kept = all.filter((r) => !(r.kind === "exact" && r.value && /^\d{10}$/.test(r.value) && (productIds.has(r.value) || mfr.has(r.value.slice(0, 5)))));
  all.length = 0;
  all.push(...kept);

  // A list item whose shape differs from the rest of its list, in a way that looks like a typo or a
  // truncation ("PBST000p06" among "210166PBST000P06"; "210169PBST0000P06" with an extra 0).
  const byList = new Map<string, LotRule[]>();
  for (const r of all) if (r.kind === "exact" && r.value && r.dateFrom === null) byList.set(`${r.raw}\u0000${r.scope ?? ""}`, [...(byList.get(`${r.raw}\u0000${r.scope ?? ""}`) ?? []), r]);
  for (const list of byList.values()) {
    // batch-plus-sub-lot lists ("3188 (428590-C)") mix two kinds of code on purpose
    if (list.length < 4 || list[0]!.raw.includes("(")) continue;
    const shapes = new Map<string, number>();
    for (const r of list) shapes.set(codeShape(r.value!), (shapes.get(codeShape(r.value!)) ?? 0) + 1);
    const top = Math.max(...shapes.values());
    for (const r of list) {
      const v = r.value!.replace(/\s+/g, "");
      // one shape is (nearly) the whole list and this code has its digit/letter runs but is two or more
      // characters shorter or longer: malformed ("0320222 L 05" among "06032022L2 05")
      const topShape = [...shapes.entries()].find(([, n]) => n === top)![0];
      const runs = (x: string) => x.replace(/\s+/g, "").replace(/9+/g, "9").replace(/A+/g, "A");
      if (
        list.length >= 5 &&
        top >= 0.8 * list.length &&
        codeShape(r.value!) !== topShape &&
        runs(codeShape(r.value!)) === runs(topShape) &&
        Math.abs(v.length - topShape.replace(/\s+/g, "").length) >= 2
      ) {
        r.needsReview = true;
        continue;
      }
      if ((shapes.get(codeShape(r.value!)) ?? 0) > 1) continue;
      const others = list.filter((o) => o !== r).map((o) => o.value!.replace(/\s+/g, ""));
      const truncated = others.some((o) => o.length > v.length && o.endsWith(v));
      const oneExtra = [...v].some((_, k) => {
        const d = v.slice(0, k) + v.slice(k + 1);
        return others.some((o) => codeShape(o) === codeShape(d));
      });
      const oneShort = others.some((o) => o.length === v.length + 1 && [...o].some((_, k) => o.slice(0, k) + o.slice(k + 1) === v));
      if (truncated || oneExtra || oneShort) r.needsReview = true;
    }
  }

  // A best-by date before the recall started is a typo or the wrong field ("Best Before: 08/04/2016" in
  // a recall started 2016-10-07; "Exp. Date 6/8/2020" among June 2023 dates).
  if (opts.refDate && /^\d{4}-\d{2}-\d{2}$/.test(opts.refDate))
    for (const r of all)
      if ((r.kind === "best_by_date" || r.kind === "best_by_range") && (r.dateTo ?? r.dateFrom) && (r.dateTo ?? r.dateFrom)! < opts.refDate)
        r.needsReview = true;

  // Consumer units carry no code: the codes are on the case; the unit itself can only be matched by line.
  const text = `${cleanText(codeInfo)} ${cleanText(description)}`;
  const unit = UNIT_WITHOUT_CODE.map((re) => re.exec(text)).find(Boolean);
  if (unit) {
    for (const r of all) if (r.kind === "exact" && r.scope === null && r.dateFrom === null) r.scope = "case";
    all.push({ kind: "all_lots", value: null, valueTo: null, dateFrom: null, dateTo: null, scope: `${singular(unit[1]!)} (no code printed)`, raw: rawOf(unit[0]), needsReview: true });
  }
  const bulk = BULK_WITHOUT_CODE.exec(text);
  if (bulk) all.push({ kind: "all_lots", value: null, valueTo: null, dateFrom: null, dateTo: null, scope: "bulk", raw: rawOf(bulk[0]), needsReview: true });

  if (!all.length && !unparsed.length && opts.noCodeMeansAllLots) {
    const t = cleanText(codeInfo);
    if (!t || EMPTY_CODE.test(t))
      all.push({ kind: "all_lots", value: null, valueTo: null, dateFrom: null, dateTo: null, scope: null, raw: rawOf(t ? `Code Info: ${t}` : "no code information"), needsReview: true });
  }

  const byKey = new Map<string, LotRule>();
  const retailers = new Map<string, LotRule>();
  for (const r of all) {
    if (r.kind === "retailer_scope" && r.value) {
      const k = `${r.value.toLowerCase()}\u0000${r.dateFrom ?? ""}\u0000${r.dateTo ?? ""}`;
      const sameName = [...retailers.entries()].find(([key]) => key.split("\u0000")[0] === r.value!.toLowerCase());
      if (sameName) {
        const prev = sameName[1];
        prev.dateFrom ??= r.dateFrom;
        prev.dateTo ??= r.dateTo;
        const scopes = [...new Set([...(prev.scope ?? "").split("; "), ...(r.scope ?? "").split("; ")].filter(Boolean))];
        prev.scope = scopes.join("; ") || null;
        prev.needsReview ||= r.needsReview;
        if (r.raw.length > prev.raw.length) prev.raw = r.raw;
      } else retailers.set(k, { ...r });
      continue;
    }
    const k = ruleKey(r);
    const prev = byKey.get(k);
    if (!prev || (prev.needsReview && !r.needsReview)) byKey.set(k, r);
  }
  return { rules: [...byKey.values(), ...retailers.values()], unparsed: [...new Set(unparsed)] };
}

/** True when at least one rule can support a Stop-level (lot / best-by) match. */
export function hasCleanLotRule(rules: LotRule[]): boolean {
  return rules.some((r) => !r.needsReview && r.kind !== "retailer_scope");
}
