/**
 * FDA iRES Enforcement Report CSV export, center CVM. OWNER: ingestion agent.
 *
 * Facts (verified, see docs/ARCHITECTURE.md):
 * - Export caps at 1000 rows: backfill by classification year; nightly re-pull a
 *   >= 365-day classification window (classification lags initiation, median 42d, max 811d).
 * - Columns vary by year. Parse by header name, never by position. "More Code Info"
 *   can appear several times in one header (7x in the 2022 export): join them.
 * - "Recall Number" can be the literal "N/A": rowKey falls back to a hash.
 * - U+00BF replaces characters FDA could not encode: remove it (cleanText does).
 * - Postal Code values can start with a tab.
 * - Dates are MM/DD/YYYY; "N/A" / "" mean null.
 */
import { createHash } from "node:crypto";
import Papa from "papaparse";
import { cleanNullable, cleanText } from "../lib/normalize";
import { extractUpcs } from "../lib/upc";
import type { DateRange, EventInput, IresRow, ProductInput } from "../types";
import { fetchText, HttpError, type FetchOptions } from "./http";

export const IRES_ENDPOINT = "https://www.accessdata.fda.gov/scripts/ires/index.cfm";

/** MM/DD/YYYY for the iRES criteria. */
export function toIresDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

/** Export URL for CVM records classified within `range` (inclusive). */
export function buildIresExportUrl(range: DateRange): string {
  const criteria = [
    { productdescriptiontxt: "" },
    { codeinformation: "" },
    { centercd: ["CVM"] },
    { centerclassificationtypetxt: null },
    { firmlegalnam: "" },
    { phasetxt: null },
    { recalleventid: "" },
    { recallnum: "" },
    { productshortreasontxt: "" },
    { centerclassificationdtfrom: toIresDate(range.from) },
    { centerclassificationdtto: toIresDate(range.to) },
  ];
  const params = new URLSearchParams({
    action: "export.getExportCSVResult",
    view: "AdvancedSearch",
    page: "product",
    criteria: JSON.stringify(criteria),
  });
  return `${IRES_ENDPOINT}?${params.toString()}`;
}

/** One range per calendar year, for backfill under the 1000-row cap. */
export function classificationYearRanges(fromYear: number, toYear: number): DateRange[] {
  const out: DateRange[] = [];
  for (let y = fromYear; y <= toYear; y++) out.push({ from: `${y}-01-01`, to: `${y}-12-31` });
  return out;
}

/** Fallback row key when Recall Number is missing / "N/A". */
export function iresRowKey(eventId: string, recallNumber: string | null, description: string, codeInfo: string | null): string {
  if (recallNumber) return `${eventId}:${recallNumber}`;
  const h = createHash("sha256").update(`${description}\u0000${codeInfo ?? ""}`).digest("hex").slice(0, 16);
  return `${eventId}:h:${h}`;
}

/** The export silently truncates at this many rows. */
export const IRES_ROW_CAP = 1000;

export class IresRowCapError extends Error {
  constructor(readonly range: DateRange, readonly rows: number) {
    super(`iRES export for ${range.from}..${range.to} hit the ${IRES_ROW_CAP}-row cap (${rows} rows); split the range`);
    this.name = "IresRowCapError";
  }
}

/** Defaults for iRES: the export is slow for a full year, and the site is touchy about bursts. */
const IRES_FETCH_DEFAULTS: FetchOptions = { timeoutMs: 120_000, retries: 2, maxBytes: 20 * 1024 * 1024, accept: "text/csv,*/*" };

/**
 * Raw CSV text for CVM records classified in `range`. Throws IresRowCapError when the
 * export reached the row cap (rows would be silently dropped); use fetchIresRows to split.
 */
export async function fetchIresCsv(range: DateRange, opts: FetchOptions = {}): Promise<string> {
  const url = buildIresExportUrl(range);
  const text = await fetchText(url, { ...IRES_FETCH_DEFAULTS, ...opts });
  const rows = parseIresCsv(text); // also rejects HTML / non-CSV bodies
  if (rows.length >= IRES_ROW_CAP) throw new IresRowCapError(range, rows.length);
  return text;
}

const DAY = 86_400_000;
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Fetch + parse `range`, halving it recursively whenever the export hits the row cap. */
export async function fetchIresRows(range: DateRange, opts: FetchOptions = {}): Promise<IresRow[]> {
  try {
    return parseIresCsv(await fetchIresCsv(range, opts));
  } catch (e) {
    if (!(e instanceof IresRowCapError)) throw e;
    const from = Date.parse(`${range.from}T00:00:00Z`);
    const to = Date.parse(`${range.to}T00:00:00Z`);
    if (to <= from) throw e; // a single day over the cap: nothing left to split
    const mid = from + Math.floor((to - from) / DAY / 2) * DAY;
    const left = await fetchIresRows({ from: range.from, to: isoDay(mid) }, opts);
    const right = await fetchIresRows({ from: isoDay(mid + DAY), to: range.to }, opts);
    return [...left, ...right];
  }
}

// ---------------------------------------------------------------- parsing

const COL = {
  productType: "Product Type",
  lastModified: "Last Modified Date",
  eventId: "Event ID",
  status: "Status",
  recallingFirm: "Recalling Firm",
  distributionPattern: "Distribution Pattern",
  recallNumber: "Recall Number",
  classification: "Classification",
  productDescription: "Product Description",
  productQuantity: "Product Quantity",
  reason: "Reason for Recall",
  initiatedOn: "Recall Initiation Date",
  classifiedOn: "Center Classification Date",
  terminatedOn: "Termination Date",
  reportDate: "Report Date",
  codeInfo: "Code Info",
  moreCodeInfo: "More Code Info",
} as const;

const REQUIRED = [COL.eventId, COL.productDescription, COL.recallingFirm] as const;

const headerKey = (h: string) => h.replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim().toLowerCase();

/** MM/DD/YYYY (or YYYY-MM-DD) -> ISO date; anything else -> null. */
export function iresDateToIso(input: string | null | undefined): string | null {
  const s = (input ?? "").trim();
  let y: number, m: number, d: number;
  let match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (match) [m, d, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  else if ((match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s))) [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

/** Single-line cleanup (tags stripped, U+00BF removed, whitespace collapsed). */
const one = (v: string | undefined) => cleanNullable(v);

/** Multi-line cleanup for code info: keeps line breaks (lot lists are often one per line). */
function multi(v: string | undefined): string | null {
  if (!v) return null;
  const lines = v
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => cleanText(l))
    .filter((l) => l !== "");
  return cleanNullable(lines.join(" ")) === null ? null : lines.join("\n");
}

/**
 * Parse an iRES CSV export by header name. Throws if the body is not an iRES export
 * (e.g. an HTML error page). Rows without an Event ID are skipped.
 */
export function parseIresCsv(text: string): IresRow[] {
  const body = text.replace(/^\uFEFF/, "");
  if (/^\s*</.test(body)) throw new HttpError("iRES returned HTML instead of CSV (blocked or error page)", IRES_ENDPOINT, null);
  if (body.trim() === "") return [];
  const parsed = Papa.parse<string[]>(body, { header: false, skipEmptyLines: "greedy" });
  const [header, ...data] = parsed.data;
  if (!header) return [];
  const keys = header.map(headerKey);
  const missing = REQUIRED.filter((c) => !keys.includes(c.toLowerCase()));
  if (missing.length) throw new Error(`not an iRES CSV export: missing column(s) ${missing.join(", ")}`);
  const idx = (name: string) => keys.indexOf(name.toLowerCase());
  const moreIdx = keys.flatMap((k, i) => (k === COL.moreCodeInfo.toLowerCase() ? [i] : []));

  const rawNames = header.map((h, i) => {
    const name = h.replace(/^\uFEFF/, "").trim();
    const earlier = header.slice(0, i).filter((x) => x.replace(/^\uFEFF/, "").trim() === name).length;
    return earlier ? `${name} (${earlier + 1})` : name;
  });

  const out: IresRow[] = [];
  for (const cells of data) {
    if (cells.length === 1 && cells[0]!.trim() === "") continue;
    const get = (name: string) => {
      const i = idx(name);
      return i < 0 ? undefined : cells[i];
    };
    const eventId = one(get(COL.eventId));
    if (!eventId) continue;
    const productDescription = one(get(COL.productDescription)) ?? "";
    const codeInfo = multi(get(COL.codeInfo));
    const moreParts = moreIdx.map((i) => multi(cells[i])).filter((v): v is string => v !== null);
    const recallNumber = one(get(COL.recallNumber));
    const raw: Record<string, string> = {};
    rawNames.forEach((n, i) => {
      raw[n] = (cells[i] ?? "").replace(/\u00BF/g, "");
    });
    out.push({
      eventId,
      recallNumber,
      rowKey: iresRowKey(eventId, recallNumber, productDescription, codeInfo),
      productType: one(get(COL.productType)),
      status: one(get(COL.status)),
      recallingFirm: one(get(COL.recallingFirm)) ?? "",
      classification: one(get(COL.classification)),
      productDescription,
      productQuantity: one(get(COL.productQuantity)),
      reason: one(get(COL.reason)),
      codeInfo,
      moreCodeInfo: moreParts.length ? moreParts.join("\n") : null,
      distributionPattern: one(get(COL.distributionPattern)),
      initiatedOn: iresDateToIso(get(COL.initiatedOn)),
      classifiedOn: iresDateToIso(get(COL.classifiedOn)),
      reportDate: iresDateToIso(get(COL.reportDate)),
      terminatedOn: iresDateToIso(get(COL.terminatedOn)),
      lastModified: iresDateToIso(get(COL.lastModified)),
      raw,
    });
  }
  return out;
}

// ---------------------------------------------------------------- UPCs

/** Re-exported: the one implementation lives in src/lib/upc.ts (also used by the matcher). */
export { extractUpcs };

// ---------------------------------------------------------------- events

const CLASS_RANK: Record<string, number> = { "class i": 1, "class ii": 2, "class iii": 3 };
const minIso = (vals: (string | null)[]) => vals.filter((v): v is string => !!v).sort()[0] ?? null;
const maxIso = (vals: (string | null)[]) => vals.filter((v): v is string => !!v).sort().at(-1) ?? null;

/** Group rows by Event ID into source-agnostic events (source 'fda_ires'). */
export function iresRowsToEvents(rows: IresRow[]): EventInput[] {
  const byEvent = new Map<string, IresRow[]>();
  for (const r of rows) {
    const list = byEvent.get(r.eventId);
    if (list) list.push(r);
    else byEvent.set(r.eventId, [r]);
  }
  const events: EventInput[] = [];
  for (const [eventId, list] of byEvent) {
    // Latest-modified row carries event-level status (rows of one event normally agree).
    const latest = [...list].sort((a, b) => (a.lastModified ?? "").localeCompare(b.lastModified ?? "")).at(-1)!;
    const classes = list.map((r) => r.classification).filter((c): c is string => !!c);
    const classification =
      classes.sort((a, b) => (CLASS_RANK[a.toLowerCase()] ?? 9) - (CLASS_RANK[b.toLowerCase()] ?? 9))[0] ?? null;
    const reasons = [...new Set(list.map((r) => r.reason).filter((r): r is string => !!r))];
    const allTerminated = list.every((r) => r.terminatedOn);

    const products = new Map<string, ProductInput>();
    for (const r of list) {
      products.set(r.rowKey, {
        rowKey: r.rowKey,
        recallNumber: r.recallNumber,
        productDescription: r.productDescription,
        codeInfo: r.codeInfo,
        moreCodeInfo: r.moreCodeInfo,
        upcs: [...new Set([...extractUpcs(r.productDescription), ...extractUpcs(r.codeInfo), ...extractUpcs(r.moreCodeInfo)])],
        raw: r.raw,
      });
    }

    events.push({
      source: "fda_ires",
      sourceEventId: eventId,
      firm: latest.recallingFirm || null,
      noticeUrl: null,
      enforcementReportUrl: iresEventUrl(eventId),
      initiatedOn: minIso(list.map((r) => r.initiatedOn)),
      classifiedOn: minIso(list.map((r) => r.classifiedOn)),
      reportDate: minIso(list.map((r) => r.reportDate)),
      terminatedOn: allTerminated ? maxIso(list.map((r) => r.terminatedOn)) : null,
      status: latest.status,
      classification,
      reason: reasons.length ? reasons.join("\n") : null,
      lastModified: maxIso(list.map((r) => r.lastModified)),
      raw: {
        eventId,
        recallingFirm: latest.recallingFirm,
        distributionPattern: latest.distributionPattern,
        productType: latest.productType,
        rows: list.length,
      },
      products: [...products.values()],
    });
  }
  return events;
}

/** Export URL scoped to one event: the public, citable iRES record for it (CSV, all fields). */
export function iresEventUrl(eventId: string): string {
  const criteria = [{ centercd: ["CVM"] }, { recalleventid: eventId }];
  const params = new URLSearchParams({
    action: "export.getExportCSVResult",
    view: "AdvancedSearch",
    page: "product",
    criteria: JSON.stringify(criteria),
  });
  return `${IRES_ENDPOINT}?${params.toString()}`;
}
