/**
 * Date parsing for recall code text. OWNER: matcher agent.
 *
 * Handles every format seen in the FDA CVM fixtures, for example
 * "3/7/2022", "10-25-19", "9.9.25", "11/22//2025", "03/ 21/2019", "2027-03-17",
 * "03 April 2021", "3/APRIL/2020", "02 FEB 19", "10-Mar-2022", "MAY 06, 2026",
 * "Jan 02 2026", "Sept 2024", "03/2027", "11/21" (MM/YY), "10 2024" (MM YYYY),
 * "10 25 19" (MM DD YY with spaces), "032029" / "090626" / "BB012729" (compact).
 *
 * Input is untrusted text; this only runs fixed regexes over it.
 */
import type { IsoDate } from "../types";

export interface ParsedDate {
  from: IsoDate;
  to: IsoDate;
  precision: "day" | "month";
  /** True when the text supports more than one reading (e.g. "082024" = 08/20/24 or 08/2024). */
  ambiguous: boolean;
  /** Index just past the date in the input string. */
  end: number;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
export const MONTH_RE = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?![a-z])";

const monthOf = (name: string): number | null => MONTH_NAMES[name.slice(0, 3).toLowerCase()] ?? null;

const pad = (n: number) => String(n).padStart(2, "0");

function fullYear(y: string): number | null {
  const n = Number(y);
  if (y.length === 4) return n >= 1990 && n <= 2099 ? n : null;
  if (y.length === 2) return 2000 + n; // recall data is all 21st century
  return null;
}

function lastDay(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function dayDate(y: number | null, m: number | null, d: number): Omit<ParsedDate, "end" | "ambiguous"> | null {
  if (y === null || m === null || m < 1 || m > 12 || d < 1 || d > lastDay(y, m)) return null;
  const iso = `${y}-${pad(m)}-${pad(d)}`;
  return { from: iso, to: iso, precision: "day" };
}

function monthDate(y: number | null, m: number | null): Omit<ParsedDate, "end" | "ambiguous"> | null {
  if (y === null || m === null || m < 1 || m > 12) return null;
  return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(lastDay(y, m))}`, precision: "month" };
}

type Attempt = (m: RegExpExecArray, refYear?: number) => Omit<ParsedDate, "end"> | null;

const sticky = (src: string) => new RegExp(src, "iy");

/** Tried in order; the first that matches AND yields a valid date wins. */
const PATTERNS: { re: RegExp; build: Attempt; compact?: boolean }[] = [
  // 2027-03-17, 2027/3/17, 2027/3 17
  {
    re: sticky(String.raw`(\d{4})[-/.](\d{1,2})[-/. ](\d{1,2})(?![\d/])`),
    build: (m) => withAmb(dayDate(fullYear(m[1]!), Number(m[2]), Number(m[3]))),
  },
  // 3/7/2022, 10-25-19, 9.9.25, 11/22//2025, 03/ 21/2019
  {
    re: sticky(String.raw`(\d{1,2})\s*[/.\-]{1,2}\s*(\d{1,2})\s*[/.\-]{1,2}\s*(\d{4}|\d{2})(?![\d/])`),
    build: (m) => withAmb(dayDate(fullYear(m[3]!), Number(m[1]), Number(m[2]))),
  },
  // 03 April 2021, 3/APRIL/2020, 02 FEB 19, 10-Mar-2022, 21 FEB 2026, 20/April /2020
  {
    re: sticky(String.raw`(\d{1,2})(?:st|nd|rd|th)?\s*[/\- ]?\s*(${MONTH_RE})\.?\s*[/\-, ]?\s*(\d{4}|\d{2})(?![\d/])`),
    build: (m) => withAmb(dayDate(fullYear(m[3]!), monthOf(m[2]!), Number(m[1]))),
  },
  // MAY 06, 2026 ; Jan 02 2026 ; March 4, 2025 ; Nov 19 2018. A separator is required after
  // the month: "SEP302022" (Ark Naturals) is a lot code, not September 30.
  {
    re: sticky(String.raw`(${MONTH_RE})(?:\.\s*|\s+|-)(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})(?![\d/])`),
    build: (m) => withAmb(dayDate(fullYear(m[3]!), monthOf(m[1]!), Number(m[2]))),
  },
  // Mar-Aug 2026 ; Jan - Apr 2026 : a month range in one year
  {
    re: sticky(String.raw`(${MONTH_RE})\.?\s*(?:-|–|to|thru|through)\s*(${MONTH_RE})\.?\s*,?\s*(\d{4})(?![\d/])`),
    build: (m) => {
      const y = fullYear(m[3]!);
      const m1 = monthOf(m[1]!);
      const m2 = monthOf(m[2]!);
      if (y === null || m1 === null || m2 === null) return null;
      // "Nov-Feb 2026" crosses a year boundary: read it as Nov 2025..Feb 2026, flagged.
      const a = monthDate(m1 <= m2 ? y : y - 1, m1);
      const b = monthDate(y, m2);
      return a && b ? { from: a.from, to: b.to, precision: "month", ambiguous: m1 > m2 } : null;
    },
  },
  // Sept 2024 ; December 2019 ; AUG 2023
  {
    re: sticky(String.raw`(${MONTH_RE})\.?\s*,?\s*(\d{4})(?![\d/])`),
    build: (m) => withAmb(monthDate(fullYear(m[2]!), monthOf(m[1]!))),
  },
  // 03/2027 ; 8/2020 ; 05-2023
  {
    re: sticky(String.raw`(\d{1,2})\s*[/\-.]\s*(\d{4})(?![\d/])`),
    build: (m) => withAmb(monthDate(fullYear(m[2]!), Number(m[1]))),
  },
  // "10 25 19" / "02 09 2021": MM DD YY(YY) with single spaces (seen in Smucker notices)
  {
    re: sticky(String.raw`(\d{1,2}) (\d{1,2})(?!\d) (\d{4}|\d{2})(?![\d/])`),
    build: (m) => withAmb(dayDate(fullYear(m[3]!), Number(m[1]), Number(m[2]))),
  },
  // "10 2024" / "09 2023": MM YYYY with a space
  {
    re: sticky(String.raw`(\d{1,2}) (\d{4})(?![\d/])`),
    build: (m) => withAmb(monthDate(fullYear(m[2]!), Number(m[1]))),
  },
  // 11/21 ; 04/27 ; 12/25 : MM/YY (expiry month). "07/10" can also be MM/DD with no year:
  // with a reference year, a YY outside [ref-2, ref+6] is flagged ambiguous.
  {
    re: sticky(String.raw`(\d{1,2})\s*/\s*(\d{2})(?![\d/])`),
    build: (m, refYear) => {
      const y = fullYear(m[2]!);
      const implausible = refYear !== undefined && y !== null && (y < refYear - 2 || y > refYear + 6);
      return withAmb(monthDate(y, Number(m[1])), implausible);
    },
  },
  // 8 digits: MMDDYYYY or YYYYMMDD
  { re: sticky(String.raw`(\d{8})(?!\d)`), build: (m) => compact8(m[1]!), compact: true },
  // 6 digits: MMDDYY or MMYYYY
  { re: sticky(String.raw`(\d{6})(?!\d)`), build: (m) => compact6(m[1]!), compact: true },
];

function withAmb(d: Omit<ParsedDate, "end" | "ambiguous"> | null, ambiguous = false): Omit<ParsedDate, "end"> | null {
  return d ? { ...d, ambiguous } : null;
}

function compact8(s: string): Omit<ParsedDate, "end"> | null {
  const mdy = dayDate(fullYear(s.slice(4)), Number(s.slice(0, 2)), Number(s.slice(2, 4)));
  const ymd = dayDate(fullYear(s.slice(0, 4)), Number(s.slice(4, 6)), Number(s.slice(6)));
  if (mdy && ymd) return withAmb(mdy, true);
  return withAmb(mdy ?? ymd);
}

function compact6(s: string): Omit<ParsedDate, "end"> | null {
  const my = monthDate(fullYear(s.slice(2)), Number(s.slice(0, 2)));
  const mdy = dayDate(fullYear(s.slice(4)), Number(s.slice(0, 2)), Number(s.slice(2, 4)));
  // "032029" = 03/2029 (also readable as 03/20/29): prefer the month reading, flag it.
  if (my && mdy) return withAmb(my, true);
  return withAmb(my ?? mdy);
}

/**
 * Parse one date starting at `pos` (leading whitespace skipped).
 * `allowCompact` enables bare 6/8-digit forms, which are only safe right after a
 * date keyword ("Best By 032029"); elsewhere they are usually lot codes.
 */
export function parseDateAt(s: string, pos: number, allowCompact = false, refYear?: number): ParsedDate | null {
  let p = pos;
  while (p < s.length && /\s/.test(s[p]!)) p++;
  for (const { re, build, compact } of PATTERNS) {
    if (compact && !allowCompact) continue;
    re.lastIndex = p;
    const m = re.exec(s);
    if (!m) continue;
    const d = build(m, refYear);
    if (d) return { ...d, end: re.lastIndex };
  }
  return null;
}

/** True when the whole string is one date (used to spot unlabeled dates among lot codes). */
export function isWholeDate(s: string): boolean {
  const t = s.trim();
  const d = parseDateAt(t, 0, false);
  return !!d && t.slice(d.end).trim() === "";
}

export interface DateSpan {
  from: IsoDate | null;
  to: IsoDate | null;
  ambiguous: boolean;
  /** "day" for a single day, "range" otherwise (month precision or explicit range). */
  shape: "day" | "range";
  /** The date text exactly as printed, e.g. "9.9.25" or "December 2019 through January 2021". */
  text: string;
}

const RANGE_SEP = sticky(String.raw`\s*(?:-|–|—|thru|through|to|until)\s*`);
const BETWEEN_AND = sticky(String.raw`\s*(?:and|&|-|–|to|thru|through)\s*`);
const LIST_SEP = sticky(String.raw`\s*(?:,|&|/|;)?\s*(?:\band\b|\bor\b)?\s*`);
const EXPANDED = /^\s*(?:recall\s+)?(?:expanded|updated|amended)\b/i;
const PRESENT = sticky(String.raw`\s*(?:present|current|now|today)\b`);

/**
 * Parse a list of dates and date ranges starting at `pos`:
 *   "08/03/2019 & 08/04/2019", "10 25 19 thru 02 09 2021", "between 6/1/2019 and 5/31/2020",
 *   "December 2019 through January 2021", "09 2023 - 12 2023", "January 1, 2021 to present".
 * Returns null when no date starts at `pos`.
 */
export function parseDateList(
  s: string,
  pos: number,
  opts: { allowCompact?: boolean; between?: boolean; refYear?: number } = {},
): { spans: DateSpan[]; end: number } | null {
  const spans: DateSpan[] = [];
  let p = pos;
  let between = !!opts.between;
  for (;;) {
    const bm = /\s*(?:between|from|of)\s+/iy;
    bm.lastIndex = p;
    if (bm.exec(s)) {
      if (/between/i.test(s.slice(p, bm.lastIndex))) between = true;
      p = bm.lastIndex;
    }
    const d1 = parseDateAt(s, p, opts.allowCompact, opts.refYear);
    if (!d1) break;
    let start = p;
    while (start < s.length && /\s/.test(s[start]!)) start++;
    let span: DateSpan = {
      from: d1.from,
      to: d1.precision === "day" ? d1.from : d1.to,
      ambiguous: d1.ambiguous,
      shape: d1.precision === "day" ? "day" : "range",
      text: "",
    };
    p = d1.end;
    const sep = between ? BETWEEN_AND : RANGE_SEP;
    sep.lastIndex = p;
    if (sep.exec(s)) {
      const after = sep.lastIndex;
      const d2 = parseDateAt(s, after, opts.allowCompact, opts.refYear);
      if (d2) {
        span = { from: d1.from, to: d2.to, ambiguous: d1.ambiguous || d2.ambiguous, shape: "range", text: "" };
        p = d2.end;
      } else {
        PRESENT.lastIndex = after;
        if (PRESENT.exec(s)) {
          span = { from: d1.from, to: null, ambiguous: d1.ambiguous, shape: "range", text: "" };
          p = PRESENT.lastIndex;
        }
      }
    }
    // "Best by 6/12/2024 11/9/2023 Expanded to include": the second date is when the recall grew.
    if (EXPANDED.test(s.slice(p, p + 40))) {
      p = start;
      break;
    }
    span.text = s.slice(start, p).replace(/\s+/g, " ").trim();
    spans.push(span);
    between = false;
    LIST_SEP.lastIndex = p;
    LIST_SEP.exec(s);
    const next = LIST_SEP.lastIndex;
    if (next === p || !parseDateAt(s, next, opts.allowCompact, opts.refYear)) {
      // allow "and between"/"from" continuation only if a date follows
      const bm2 = /\s*(?:,|&|and)?\s*(?:between|from)\s+/iy;
      bm2.lastIndex = p;
      if (bm2.exec(s) && parseDateAt(s, bm2.lastIndex, opts.allowCompact, opts.refYear)) {
        p = next;
        continue;
      }
      break;
    }
    p = next;
  }
  return spans.length ? { spans, end: p } : null;
}
