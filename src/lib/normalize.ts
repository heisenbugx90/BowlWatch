/**
 * Text normalization shared by the catalog loader, ingestion and the matcher.
 * SHARED FILE: change additively only (new functions, never new behaviour for
 * existing ones without updating every caller and the alias table), and log the
 * change at the end of docs/ARCHITECTURE.md under "Change log".
 *
 * All inputs may be untrusted recall text. These functions only transform
 * strings; they never evaluate or render them.
 */

/** U+00BF INVERTED QUESTION MARK: FDA exports use it for any character they could not encode (é, ®, °, ', zero-width...). */
const FDA_GARBAGE = /¿/g;
const MARKS = /[®™©℠]/g; // ® ™ © ℠  (must go before NFKD, which turns ™ into "TM")
const APOSTROPHES = /['‘’ʼ`´]/g;
const COMBINING = /[̀-ͯ]/g;
const ZERO_WIDTH = /[​-‍⁠﻿]/g;

/**
 * Canonical comparison key for brand / line / alias / product text.
 *
 *   "Hill's® Science Diet™"      -> "hills science diet"
 *   "Hill¿s Prescription Diet"   -> "hills prescription diet"
 *   "Member s Mark"              -> "members mark"     (CSV lost the apostrophe)
 *   "Entrée"                     -> "entree"
 *   "Mac & Cheese"               -> "mac and cheese"
 *   "H-E-B Texas Pets"           -> "h e b texas pets"
 *
 * Aliases and recall text MUST go through the same function so they compare equal.
 */
export function normalizeText(input: string | null | undefined): string {
  if (!input) return "";
  let s = input
    .replace(MARKS, "")
    .replace(FDA_GARBAGE, "")
    .replace(ZERO_WIDTH, "")
    .normalize("NFKD")
    .replace(COMBINING, "")
    .toLowerCase();
  s = s.replace(/&/g, " and ");
  // Possessives: drop the apostrophe so "hill's" == "hills".
  s = s.replace(APOSTROPHES, "");
  // Everything that is not a letter or digit becomes a space.
  s = s.replace(/[^\p{L}\p{N}]+/gu, " ");
  s = s.replace(/\s+/g, " ").trim();
  // A lone "s" token right after a word is a possessive whose apostrophe became a space.
  s = s.replace(/\b([\p{L}\p{N}]+) s\b/gu, "$1s");
  return s;
}

/** Tokens of normalizeText(input). */
export function tokens(input: string | null | undefined): string[] {
  const n = normalizeText(input);
  return n ? n.split(" ") : [];
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  reg: "®",
  trade: "™",
  copy: "©",
  eacute: "é",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  ndash: "–",
  mdash: "—",
};

/** Decode the HTML entities FDA feeds actually use. Unknown named entities are left as-is. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/**
 * Display-safe plain text from untrusted feed content: strips tags (including
 * script/style bodies), decodes entities, removes U+00BF garbage, collapses
 * whitespace. The result is still untrusted: escape it when rendering.
 */
export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  let s = input
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ");
  // Decode after stripping, then strip again in case entities encoded tags.
  s = decodeEntities(s).replace(/<[^>]*>/g, " ");
  return s.replace(FDA_GARBAGE, "").replace(ZERO_WIDTH, "").replace(/\s+/g, " ").trim();
}

/** cleanText, then null for "", "N/A", "NA", "None". */
export function cleanNullable(input: string | null | undefined): string | null {
  const s = cleanText(input);
  return s === "" || /^(n\/?a|none)$/i.test(s) ? null : s;
}

/** True when the 12 digits form a UPC-A with a valid check digit. */
export function upcCheckDigitValid(digits12: string): boolean {
  if (!/^\d{12}$/.test(digits12)) return false;
  let sum = 0;
  for (let i = 0; i < 11; i++) sum += Number(digits12[i]) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(digits12[11]);
}

/** True when the 13 digits form an EAN-13 with a valid check digit. */
export function ean13CheckDigitValid(digits13: string): boolean {
  if (!/^\d{13}$/.test(digits13)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits13[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10 === Number(digits13[12]);
}

/**
 * Reduce a UPC / EAN / GTIN to its 10-digit core (5-digit manufacturer + 5-digit item),
 * dropping the number-system digit, check digit, and GTIN padding/indicator.
 *
 *   "0 52742 01234 5" (UPC-A, 12)   -> "5274201234"
 *   "052742012345" with EAN-13 "0"  -> "5274201234"
 *   GTIN-14 "10052742012342"        -> "5274201234"
 *
 * 11 digits (one digit missing). The digit grouping, when printed, says which:
 *   "d ddddd ddddd" / "dddddd ddddd"  number system + core, no check digit  -> drop the first
 *   "ddddd ddddd d" / "ddddd dddddd"  core + check digit, no number system   -> drop the last
 * Unspaced: if "0"+digits is a valid UPC-A, the leading 0 was dropped; a leading 0 means the
 * check digit was dropped; otherwise the number-system 0 was dropped and the check digit is
 * a typo ("72036977964" -> "7203697796"). The window never shifts on a bad check digit alone.
 *
 * 13 digits: a valid EAN-13 that starts with 0 is a UPC-A in EAN form and drops its first two
 * digits. A valid EAN-13 from outside the US/Canada ("7709417695092", Colombia) has no UPC-A core:
 * it is kept whole, 13 digits. Otherwise FDA typed a 12-digit UPC-A with one stray digit: when
 * exactly one single-digit deletion is a valid UPC-A ("8542980013436" -> 854298001436,
 * "0736570085750" -> 073657008750), that is the UPC; when several are, a 0-led value drops its
 * first two digits and any other keeps its first 12.
 *
 * 8 digits (EAN-8 / UPC-E, "UPC 20735302" on a Lidl bag): kept as printed. They are not
 * expanded to UPC-A, so they only compare equal to the same 8 digits.
 *
 * src/lib/upc.ts repairs single-digit typos further using sibling UPCs in the same text.
 * Returns null for any other length (fewer than 10 digits other than 8, or more than 14).
 */
export function normalizeUpc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  switch (d.length) {
    case 8:
      return d;
    case 10:
      return d;
    case 11: {
      const groups = raw
        .trim()
        .split(/[\s-]+/)
        .filter((g) => /\d/.test(g))
        .map((g) => g.replace(/\D/g, "").length)
        .join(",");
      if (groups === "1,5,5" || groups === "6,5") return d.slice(1, 11);
      if (groups === "5,5,1" || groups === "5,6") return d.slice(0, 10);
      if (upcCheckDigitValid(`0${d}`)) return d.slice(0, 10);
      return d[0] === "0" ? d.slice(1, 11) : d.slice(0, 10);
    }
    case 12:
      return d.slice(1, 11);
    case 13: {
      if (ean13CheckDigitValid(d)) return d[0] === "0" ? d.slice(2, 12) : d;
      // "0" + a UPC-A ("0052742012345"): GTIN padding, not a typo
      if (d[0] === "0" && (d[1] === "0" || upcCheckDigitValid(d.slice(1)))) return d.slice(2, 12);
      const fixes = upcDeletionCandidates(d);
      if (fixes.length === 1) return fixes[0]!.slice(1, 11);
      return d[0] === "0" ? d.slice(2, 12) : d.slice(1, 11);
    }
    case 14:
      return d.slice(3, 13);
    default:
      return null;
  }
}

/** Distinct 12-digit values, one digit shorter than `digits`, that are valid UPC-A codes. */
export function upcDeletionCandidates(digits: string): string[] {
  const out = new Set<string>();
  for (let i = 0; i < digits.length; i++) {
    const c = digits.slice(0, i) + digits.slice(i + 1);
    if (upcCheckDigitValid(c)) out.add(c);
  }
  return [...out];
}
