/**
 * UPC extraction shared by ingestion (recall_products.upcs) and the matcher.
 * Input is untrusted recall text; this only scans it with regular expressions.
 */
import { ean13CheckDigitValid, normalizeUpc, upcCheckDigitValid, upcDeletionCandidates } from "./normalize";

/** "UPC357955440642" (no space) also counts, so the label ends at a non-letter, not a word boundary. */
const UPC_LABEL = /\b(?:U\.?P\.?C|GTIN|EAN)s?(?![A-Za-z])/gi;
/** Stop scanning a label's window at the next lot/date keyword so lot numbers are not taken for UPCs. */
const UPC_WINDOW_STOP = /\b(?:lots?|batch|best|exp(?:iration|iry)?|sell|use by|mfg|manufactured|production|code[sd]?|sku|item)\b/i;
/**
 * Structured forms first so trailing size digits ("UPC 8 50025 54628 7 4 oz") are not swallowed:
 * 1-5-5-2 (EAN-13 "8 01027 60423 85"), 1-5-5-1, 1-10-1 ("6-9173018103-1"), 1-5-5, 6-5 ("737257 92262"), 5-5-1.
 */
const UPC_NUMBER =
  /(?<![\d-])(?:\d{10,14}|\d[ -]?\d{5}[ -]\d{5}[ -]?\d{2}|\d[ -]?\d{5}[ -]\d{5}[ -]?\d|\d-\d{10}-\d|\d[ -]\d{5}[ -]\d{5}|\d{6} \d{5}|\d{5}[ -]\d{5}[ -]?\d?|\d{8})(?![\d])/g;
/** Printed UPC-A without a label: "0 76344 08822 6" (spaced) or a bare 12-digit number; both need a valid check digit. */
const UNLABELED_UPC = /(?<![\d-])(\d \d{5} \d{5} \d|\d{12})(?![\d-])/g;
/**
 * A bare number right after a lot keyword is a lot, not a UPC; so is every item of a lot list
 * ("Lot No. 250402202223, 121110202122, 210510202324").
 */
const LOT_BEFORE = /\b(?:lots?|batch(?:es)?|codes?)\s*(?:numbers?|nos?\.?|#|codes?)?\s*[:#]?\s*(?:[A-Z0-9][A-Z0-9-]*\s*(?:,|;|&|\band\b)\s*)*$/i;

interface Found {
  raw: string;
  digits: string;
  core: string;
}

/** Digit strings that need sibling context to resolve: 11 unspaced digits with a bad check digit. */
function needsRepair(raw: string, digits: string): boolean {
  return digits.length === 11 && /^\d+$/.test(raw.trim()) && digits[0] !== "0" && !upcCheckDigitValid(`0${digits}`);
}

const commonPrefix = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i;
};

/**
 * An 11-digit value with a bad check digit is usually a 10-digit core with one extra digit
 * typed in ("79100034417" next to "7910034417"; "70155505120" next to "7015505119").
 * Returns the repaired core, "" to drop the value (its core is already captured), or null
 * to fall back to normalizeUpc.
 */
function repairWithSiblings(digits: string, siblings: string[]): string | null {
  if (!siblings.length) return null;
  const deletions = new Set<string>();
  for (let i = 0; i < digits.length; i++) deletions.add(digits.slice(0, i) + digits.slice(i + 1));
  if ([...deletions].some((c) => siblings.includes(c))) return "";
  let best: string[] = [];
  let bestLen = 0;
  for (const c of deletions)
    for (const s of siblings) {
      const n = commonPrefix(c, s);
      if (n > bestLen) {
        bestLen = n;
        best = [c];
      } else if (n === bestLen && !best.includes(c)) best.push(c);
    }
  return bestLen >= 8 && best.length === 1 ? best[0]! : null;
}

/**
 * UPC cores (10 digits, see normalizeUpc) in `text`: numbers labelled UPC/GTIN/EAN, plus
 * unlabelled UPC-A numbers whose check digit is valid. Single-digit typos are repaired
 * against the other UPCs of the same text when that is unambiguous.
 */
export function extractUpcs(text: string | null | undefined): string[] {
  if (!text) return [];
  const found: Found[] = [];
  const add = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const core = normalizeUpc(raw);
    if (core) found.push({ raw, digits, core });
  };
  for (const label of text.matchAll(UPC_LABEL)) {
    let win = text.slice(label.index + label[0].length, label.index + label[0].length + 160);
    // "UPC: ...", "UPC Code ...", "UPC item code: 2363300233"
    win = win.replace(/^[\s:#.]*(?:item\s+codes?|codes?|numbers?|nos?\.?|is)?[\s:#.]*/i, "");
    const stop = UPC_WINDOW_STOP.exec(win);
    if (stop) win = win.slice(0, stop.index);
    for (const m of win.matchAll(UPC_NUMBER)) add(m[0]);
  }
  for (const m of text.matchAll(UNLABELED_UPC)) {
    const digits = m[1]!.replace(/\D/g, "");
    if (!upcCheckDigitValid(digits)) continue;
    if (LOT_BEFORE.test(text.slice(Math.max(0, m.index - 160), m.index))) continue;
    add(m[1]!);
  }

  const solid = found.filter((f) => !needsRepair(f.raw, f.digits)).map((f) => f.core);
  const out = new Set<string>();
  const siblingsOf = (f: Found) => [...new Set(found.filter((o) => o !== f && !needsRepair(o.raw, o.digits)).map((o) => o.core))];
  for (const f of found) if (!needsRepair(f.raw, f.digits)) out.add(readingFromSiblings(f, siblingsOf(f)) ?? f.core);
  for (const f of found) {
    if (!needsRepair(f.raw, f.digits)) continue;
    const repaired = repairWithSiblings(f.digits, [...new Set(solid)]);
    if (repaired === "") continue;
    out.add(repaired ?? readingFromSiblings(f, siblingsOf(f)) ?? f.core);
  }
  return [...out];
}

const sharedPrefix = (core: string, siblings: string[]) => Math.max(0, ...siblings.map((s) => commonPrefix(core, s)));

/**
 * A value whose reading is uncertain, settled by the other UPCs of the same text (same brand owner,
 * same company prefix):
 * - 11 unspaced digits are either a UPC-A without its leading 0 (core = first 10) or without its
 *   check digit (core = last 10): "84013905142" next to "840139199493" is 8 40139 05142 -> 4013905142.
 * - 13 digits that are not an EAN-13 with several one-deletion UPC-A fixes: the fix that shares the
 *   company prefix of a sibling.
 * Returns null when the siblings do not decide it.
 */
function readingFromSiblings(f: Found, siblings: string[]): string | null {
  if (!siblings.length) return null;
  let options: string[] = [];
  if (f.digits.length === 11 && /^\d+$/.test(f.raw.trim())) options = [f.digits.slice(0, 10), f.digits.slice(1, 11)];
  else if (f.digits.length === 13 && !ean13CheckDigitValid(f.digits)) options = upcDeletionCandidates(f.digits).map((c) => c.slice(1, 11));
  if (options.length < 2) return null;
  const scored = options.map((o) => ({ o, n: sharedPrefix(o, siblings) })).sort((a, b) => b.n - a.n);
  const [best, next] = scored;
  if (best!.n < 5 || best!.n === next!.n || best!.o === f.core) return null;
  return best!.o;
}
