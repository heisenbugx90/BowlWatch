/**
 * Shared types. SHARED FILE: change additively only, and log the change at the
 * end of docs/ARCHITECTURE.md under "Change log".
 *
 * Everything that originates from a recall feed is untrusted text. These types
 * carry it as plain strings; nothing here is ever evaluated or rendered as HTML.
 */

// ---------- enums (mirrored as text columns + CHECK constraints in src/db/schema.ts) ----------

export const RECALL_SOURCES = ["fda_ires", "fda_listing", "hc"] as const;
export type RecallSource = (typeof RECALL_SOURCES)[number];

export const PET_FOOD_FLAGS = ["yes", "no", "unreviewed"] as const;
export type PetFoodFlag = (typeof PET_FOOD_FLAGS)[number];

export const ALIAS_ENTITY_TYPES = ["parent", "brand", "line", "manufacturer"] as const;
export type AliasEntityType = (typeof ALIAS_ENTITY_TYPES)[number];

/**
 * name = what's printed on the bag; firm = legal recalling-firm name; dba = trade name; label = other label text (sub-brand, retailer label);
 * short = a generic short name ("Meridian", "Quest", "Natural Selections") that identifies the brand (or line) only when the
 * recalling firm corroborates it (the firm is one of the brand's firm names, its parent, or a listed co-packer).
 */
export const ALIAS_KINDS = ["name", "firm", "dba", "label", "short"] as const;
export type AliasKind = (typeof ALIAS_KINDS)[number];

export const MATCH_LEVELS = ["brand", "line", "lot"] as const;
export type MatchLevel = (typeof MATCH_LEVELS)[number];

export const MATCH_METHODS = ["alias", "manual", "listing"] as const;
export type MatchMethod = (typeof MATCH_METHODS)[number];

/**
 * upstream_ingredient = an excluded ingredient / premix sold to manufacturers that names dogs, cats or canned
 * pet food: never matched to users, kept visible so downstream brand recalls can be linked to it.
 */
export const REVIEW_REASONS = ["unmatched", "ambiguous", "unclassified", "link_listing", "lot_parse", "upstream_ingredient"] as const;
export type ReviewReason = (typeof REVIEW_REASONS)[number];

export const REVIEW_STATUSES = ["open", "resolved", "dismissed"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const LOT_RULE_KINDS = [
  "exact", // value = one lot code
  "prefix", // value = lot code prefix
  "range", // value..value_to, same-shaped codes compared lexically after normalization
  "best_by_date", // date_from = the single best-by / use-by / expiration date
  "best_by_range", // date_from..date_to inclusive (either side may be null = open-ended)
  "all_lots", // every lot of the product is recalled
  "retailer_scope", // value = retailer / channel the recall is limited to; scope = states / conditions
  "suffix", // value = lot code suffix ("All lot codes ending in BC")
  "production_date", // date_from..date_to = manufacture / production date(s); value = the date as printed. Always needs review.
] as const;
export type LotRuleKind = (typeof LOT_RULE_KINDS)[number];

export const SPECIES = ["dog", "cat"] as const;
export type Species = (typeof SPECIES)[number];

export const FORMATS = ["dry", "wet", "raw", "freeze-dried", "treat", "topper", "other"] as const;
export type Format = (typeof FORMATS)[number];

export const MARKETS = ["US", "CA"] as const;
export type Market = (typeof MARKETS)[number];

/** ISO date string, YYYY-MM-DD. */
export type IsoDate = string;

export interface DateRange {
  from: IsoDate;
  to: IsoDate;
}

// ---------- ingestion ----------

/**
 * One row of the FDA iRES Enforcement Report CSV export, parsed by header name.
 * Column set varies by year (see docs/ARCHITECTURE.md). All values are cleaned
 * text (U+00BF removed, trimmed); "N/A" and "" become null.
 */
export interface IresRow {
  eventId: string;
  recallNumber: string | null; // null when the CSV says "N/A"
  /** Stable key: `${eventId}:${recallNumber}` or `${eventId}:h:${sha256(description|codeInfo)[0..16]}` when recallNumber is null. */
  rowKey: string;
  productType: string | null;
  status: string | null;
  recallingFirm: string;
  classification: string | null;
  productDescription: string;
  productQuantity: string | null;
  reason: string | null;
  codeInfo: string | null;
  /** All "More Code Info" columns joined with "\n" (the header can repeat, e.g. 7 times in 2022). */
  moreCodeInfo: string | null;
  distributionPattern: string | null;
  initiatedOn: IsoDate | null;
  classifiedOn: IsoDate | null;
  reportDate: IsoDate | null;
  terminatedOn: IsoDate | null;
  lastModified: IsoDate | null;
  /** Original header -> value map, untouched except U+00BF cleanup. */
  raw: Record<string, string>;
}

/** One item of the FDA recalls-market-withdrawals datatables JSON, filtered to Animal & Veterinary. */
export interface ListingItem {
  /** e.g. "/safety/recalls-market-withdrawals/..." ; the stable key. */
  path: string;
  /** "https://www.fda.gov" + path */
  noticeUrl: string;
  date: IsoDate | null;
  brandName: string; // tags stripped, entities decoded
  productDescription: string;
  productType: string; // the regulated-product field, decoded
  reason: string | null;
  company: string | null;
  raw: Record<string, unknown>;
}

/** Normalized event shape the store upserts, regardless of source. */
export interface EventInput {
  source: RecallSource;
  sourceEventId: string;
  firm: string | null;
  noticeUrl: string | null;
  enforcementReportUrl: string | null;
  initiatedOn: IsoDate | null;
  classifiedOn: IsoDate | null;
  reportDate: IsoDate | null;
  terminatedOn: IsoDate | null;
  status: string | null;
  classification: string | null;
  reason: string | null;
  lastModified: IsoDate | null;
  raw: unknown;
  products: ProductInput[];
}

export interface ProductInput {
  rowKey: string;
  recallNumber: string | null;
  productDescription: string;
  codeInfo: string | null;
  moreCodeInfo: string | null;
  upcs: string[]; // 10-digit cores, see normalizeUpc
  raw: unknown;
}

export interface UpsertStats {
  rowsRead: number;
  rowsNew: number;
  rowsUpdated: number;
}

export interface IngestError {
  at: string; // ISO timestamp
  stage: string;
  message: string;
  context?: Record<string, unknown>;
}

// ---------- matching ----------

/** A parsed lot rule, before it is stored in lot_rules. `raw` keeps the exact source snippet. */
export interface LotRule {
  kind: LotRuleKind;
  value: string | null;
  valueTo: string | null;
  dateFrom: IsoDate | null;
  dateTo: IsoDate | null;
  /** UPC core / SKU / size the rule is limited to, when the notice scopes lots per item. */
  scope: string | null;
  raw: string;
  /** True when parsing was not clean. Stop-level emails are only allowed when false. */
  needsReview: boolean;
}
// A code rule (exact / prefix / suffix / range) that also carries dateFrom/dateTo is a
// conjunction: the lot code AND the best-by date must both fall inside the rule
// ("All codes beginning with AH ... and expiration dates between 6/1/2019 and 5/31/2020").

export interface Match {
  brandId: string;
  lineId: string | null;
  level: MatchLevel;
  method: MatchMethod;
  /** Which alias/text produced the match, for the review CLI and audits. */
  detail: string;
}

export interface EventClassification {
  petFood: PetFoodFlag;
  /** Short human-readable reasons, e.g. ["alias:blue buffalo", "excluded firm:elanco"]. */
  reasons: string[];
  /** Row indexes (in input order) that are clearly not dog/cat food even inside a pet-food event ("Fish Food"). */
  excludedRows?: number[];
  /**
   * Set on a 'no' event whose excluded rows are an ingredient or premix that names dogs, cats or canned pet
   * food ("2217 Canned Canine PMX"): not matched to users, but worth a review item (upstream_ingredient).
   */
  upstream?: string[];
}

export interface NightlyResult {
  startedAt: string;
  finishedAt: string;
  ires: UpsertStats | null;
  listing: UpsertStats | null;
  matched: number;
  reviewItemsOpened: number;
  errors: IngestError[];
}
