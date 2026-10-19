/**
 * FDA "Recalls, Market Withdrawals & Safety Alerts" datatables JSON. OWNER: ingestion agent.
 *
 * - LISTING_LIVE_URL: current within ~1 day, dense from 2024.
 * - LISTING_ARCHIVE_URL: static, 2017-01..2021-11.
 * - Keep items whose field_regulated_product_field contains "Animal & Veterinary"
 *   (it arrives HTML-escaped as "Animal &amp; Veterinary").
 * - field_brand_name is an <a> tag: strip tags with cleanText. All fields are untrusted.
 * - Key = path; notice URL = "https://www.fda.gov" + path.
 * - field_change_date_2 is MM/DD/YYYY and can be later than the recall itself.
 *
 * Listing items become events with source 'fda_listing' so they can produce brand/line
 * matches before iRES classifies the recall. Linking to the iRES event happens later
 * (store/matcher: brand + date proximity; ambiguous -> review_items 'link_listing').
 */
import { z } from "zod";
import { cleanNullable, cleanText, decodeEntities } from "../lib/normalize";
import type { EventInput, ListingItem } from "../types";
import { fetchJson, type FetchOptions } from "./http";
import { iresDateToIso } from "./fda-ires";

export const LISTING_LIVE_URL = "https://www.fda.gov/datatables-json/recalls-market-withdrawals.json";
export const LISTING_ARCHIVE_URL = "https://www.fda.gov/files/api/datatables/static/recalls-market-withdrawals.json";
export const FDA_ORIGIN = "https://www.fda.gov";

export async function fetchListing(url: string = LISTING_LIVE_URL, opts: FetchOptions = {}): Promise<unknown> {
  return fetchJson(url, { timeoutMs: 90_000, maxBytes: 30 * 1024 * 1024, ...opts });
}

const str = z.string().nullish();
const ItemSchema = z
  .object({
    path: z.string(),
    field_change_date_2: str,
    field_brand_name: str,
    field_product_description: str,
    field_recall_reason_description: str,
    field_company_name: str,
    field_regulated_product_field: str,
  })
  .passthrough();

/** Site-relative recall page path, or null if it is not one (absolute URLs, schemes, "//host" are rejected). */
function safePath(p: string): string | null {
  const s = p.trim();
  if (!/^\/(?!\/)[A-Za-z0-9\-._~/%]+$/.test(s)) return null;
  return s;
}

const ANIMAL_VET = /animal\s*&\s*veterinary/i;

/** Validate (Zod), filter to Animal & Veterinary, clean. Unknown shapes are skipped, not thrown. */
export function parseListing(json: unknown): ListingItem[] {
  // The datatables files are a bare array; tolerate a { data: [...] } wrapper too.
  const list: unknown[] = Array.isArray(json)
    ? json
    : json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)
      ? (json as { data: unknown[] }).data
      : [];
  const out: ListingItem[] = [];
  const seen = new Set<string>();
  for (const entry of list) {
    const parsed = ItemSchema.safeParse(entry);
    if (!parsed.success) continue;
    const it = parsed.data;
    const productType = cleanText(decodeEntities(it.field_regulated_product_field ?? ""));
    if (!ANIMAL_VET.test(productType)) continue;
    const path = safePath(it.path);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    out.push({
      path,
      noticeUrl: FDA_ORIGIN + path,
      date: iresDateToIso(it.field_change_date_2),
      brandName: cleanText(it.field_brand_name),
      productDescription: cleanText(it.field_product_description),
      productType,
      reason: cleanNullable(it.field_recall_reason_description),
      company: cleanNullable(it.field_company_name),
      raw: entry as Record<string, unknown>,
    });
  }
  return out;
}

export function listingItemsToEvents(items: ListingItem[]): EventInput[] {
  return items.map((it) => ({
    source: "fda_listing",
    sourceEventId: it.path,
    firm: it.company,
    noticeUrl: it.noticeUrl,
    enforcementReportUrl: null,
    // The listing date is the FDA posting / change date: closest thing to initiation it has.
    initiatedOn: it.date,
    classifiedOn: null,
    reportDate: it.date,
    terminatedOn: null,
    status: null,
    classification: null,
    reason: it.reason,
    lastModified: it.date,
    raw: it.raw,
    products: [
      {
        rowKey: it.path,
        recallNumber: null,
        productDescription: [it.brandName, it.productDescription].filter(Boolean).join(" "),
        codeInfo: null,
        moreCodeInfo: null,
        upcs: [],
        raw: { brandName: it.brandName, productDescription: it.productDescription, company: it.company },
      },
    ],
  }));
}
