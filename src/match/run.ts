/**
 * Apply classification + matching + lot parsing to everything in the database.
 * OWNER: matcher agent. Idempotent: safe to run after every ingest and after reseeding.
 *
 * - Loads the catalog with loadSnapshotFromDb (data/ is not on disk in production).
 * - Writes recall_events.pet_food, lot_rules (replace per product), recall_matches
 *   (upsert on the unique key; never delete rows with method 'manual'), review_items
 *   (upsert on (event, product, reason); never reopen dismissed items).
 * - Links fda_listing events to fda_ires events (recall_events.linked_event_id).
 *
 * - Refreshes recall_products.upcs of iRES rows from the stored text, so UPC parser fixes
 *   apply without re-ingesting.
 *
 * Only differences are written, so a nightly re-run over unchanged data issues
 * reads and almost no writes.
 *
 * Review items opened here:
 *   unclassified  event   pet_food could not be decided
 *   unmatched     product pet-food row with no brand in the text (and no manual match)
 *   ambiguous     product brand suggested only by the recalling firm or a byline;
 *                         no recall_matches row is written for it until a human confirms
 *   lot_parse     product at least one lot rule has needs_review, or code text could not be read
 *   upstream_ingredient
 *                 event   a 'no' event whose ingredient / premix names dog or cat food ("Canned Canine PMX")
 *   link_listing  event   a listing item matches several iRES events
 * Open items whose condition no longer holds (e.g. the catalog now knows the
 * brand) are resolved automatically; dismissed and resolved items are left alone.
 */
import { and, eq, inArray, ne, or, sql } from "drizzle-orm";
import { loadSnapshotFromDb } from "../catalog/snapshot";
import { normalizeText } from "../lib/normalize";
import { extractUpcs } from "../lib/upc";
import type { Db } from "../db/client";
import { lotRules, recallEvents, recallMatches, recallProducts, reviewItems } from "../db/schema";
import type { LotRule, MatchLevel, MatchMethod, PetFoodFlag, ReviewReason } from "../types";
import { classifyEvent } from "./classify";
import { parseLotRulesDetailed } from "./lots";
import { buildCatalogIndex, matchProductDetailed, type CatalogIndex } from "./matcher";

export interface MatchRunStats {
  eventsClassified: number;
  productsMatched: number;
  matchesWritten: number;
  lotRulesWritten: number;
  reviewItemsOpened: number;
}

/** Events per batch (one read round per table, one write transaction). */
const CHUNK = 200;
/** A listing item and an iRES event are the same recall when initiated this close together. */
export const LINK_WINDOW_DAYS = 30;
/** Reasons the per-event pass owns (link_listing is owned by linkListings). */
const MANAGED_REASONS: ReviewReason[] = ["unmatched", "ambiguous", "unclassified", "lot_parse", "upstream_ingredient"];

type EventRow = typeof recallEvents.$inferSelect;
type ProductRow = typeof recallProducts.$inferSelect;
type MatchRow = typeof recallMatches.$inferSelect;
type ReviewRow = typeof reviewItems.$inferSelect;

interface DesiredMatch {
  eventId: number;
  productId: number;
  brandId: string;
  lineId: string | null;
  level: MatchLevel;
  method: MatchMethod;
  detail: string;
}

interface DesiredReview {
  eventId: number;
  productId: number | null;
  reason: ReviewReason;
  notes: string;
}

const matchKey = (m: { productId: number | null; brandId: string; lineId: string | null }) =>
  `${m.productId ?? ""}\u0000${m.brandId}\u0000${m.lineId ?? ""}`;
/** Product-level items are keyed by product (older items may carry no event id). */
const reviewKey = (r: { eventId: number | null; productId: number | null; reason: string }) =>
  r.productId !== null ? `p${r.productId}\u0000${r.reason}` : `e${r.eventId ?? ""}\u0000${r.reason}`;
const ruleSig = (r: Pick<LotRule, "kind" | "value" | "valueTo" | "dateFrom" | "dateTo" | "scope" | "raw" | "needsReview">) =>
  JSON.stringify([r.kind, r.value, r.valueTo, r.dateFrom, r.dateTo, r.scope, r.raw, r.needsReview]);
const rulesSig = (rs: Parameters<typeof ruleSig>[0][]) => rs.map(ruleSig).sort().join("\n");

/** Strip control characters from untrusted text before it lands in notes printed on a terminal. */
const safe = (s: string, max = 300) =>
  s.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

function chunks<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}

/**
 * Readable title from a listing path: "/safety/.../trupet-llc-recalls-boost-me-mighty-meaty-beef-topper"
 * -> "trupet llc recalls boost me mighty meaty beef topper". FDA slugs turn "®" into a trailing
 * "r" ("9livesr-protein-plusr"), so a copy without those r's is appended. Untrusted text.
 */
/** Real words that end in "r" and must keep it ("diner classic" is not "dine classic"). */
const R_WORDS = new Set(
  "diner dinner liver flavor flavour super premier water river fiber fibre burger power silver cooler freezer center centre winter summer border after under over other their your four deer beer pear star sugar feeder litter mixer topper copper butter starter finisher grower layer toddler lover leather taster tender filler supplier retailer distributor manufacturer recaller paper poor door floor".split(" "),
);

export function listingTitle(path: string): string {
  const slug = (path.split("/").filter(Boolean).pop() ?? "").toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) return "";
  const words = slug.split("-").filter(Boolean);
  const plain = words.join(" ");
  const unr = words.map((w) => (w.length > 3 && w.endsWith("r") && !R_WORDS.has(w) ? w.slice(0, -1) : w)).join(" ");
  return unr === plain ? plain : `${plain} ; ${unr}`;
}

const DAY = 86_400_000;
const eventDate = (e: EventRow) => e.initiatedOn ?? e.reportDate ?? e.classifiedOn;
const daysApart = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / DAY;

export async function matchAll(db: Db, opts: { onlyEventIds?: number[] } = {}): Promise<MatchRunStats> {
  const stats: MatchRunStats = {
    eventsClassified: 0,
    productsMatched: 0,
    matchesWritten: 0,
    lotRulesWritten: 0,
    reviewItemsOpened: 0,
  };
  const snapshot = await loadSnapshotFromDb(db);
  // An unseeded database would mark every event unmatched and flood the review queue.
  if (!snapshot.brands.length) throw new Error("catalog tables are empty: run `npm run seed` before matching");
  const index = buildCatalogIndex(snapshot);

  const ids = opts.onlyEventIds
    ? opts.onlyEventIds
    : (await db.select({ id: recallEvents.id }).from(recallEvents).orderBy(recallEvents.id)).map((r) => r.id);
  if (opts.onlyEventIds && !opts.onlyEventIds.length) return stats;

  for (const batch of chunks(ids, CHUNK)) await processBatch(db, index, batch, stats);
  stats.reviewItemsOpened += await linkListings(db, opts.onlyEventIds);
  return stats;
}

async function processBatch(db: Db, index: CatalogIndex, eventIds: number[], stats: MatchRunStats): Promise<void> {
  const events = await db.select().from(recallEvents).where(inArray(recallEvents.id, eventIds));
  if (!events.length) return;
  const products = await db.select().from(recallProducts).where(inArray(recallProducts.eventId, eventIds));
  const productIds = products.map((p) => p.id);
  const existingMatches = await db.select().from(recallMatches).where(inArray(recallMatches.eventId, eventIds));
  const existingRules = productIds.length
    ? await db.select().from(lotRules).where(inArray(lotRules.productId, productIds))
    : [];
  const existingReviews = await db
    .select()
    .from(reviewItems)
    .where(
      productIds.length
        ? or(inArray(reviewItems.eventId, eventIds), inArray(reviewItems.productId, productIds))
        : inArray(reviewItems.eventId, eventIds),
    );

  const productsByEvent = new Map<number, ProductRow[]>();
  for (const p of products) productsByEvent.set(p.eventId, [...(productsByEvent.get(p.eventId) ?? []), p]);
  const manualProducts = new Set(existingMatches.filter((m) => m.method === "manual").map((m) => m.productId));
  const rulesByProduct = new Map<number, (typeof existingRules)[number][]>();
  for (const r of existingRules) rulesByProduct.set(r.productId, [...(rulesByProduct.get(r.productId) ?? []), r]);

  const petFoodUpdates: { id: number; petFood: PetFoodFlag }[] = [];
  const upcUpdates: { id: number; upcs: string[] }[] = [];
  const desiredMatches: DesiredMatch[] = [];
  const desiredReviews: DesiredReview[] = [];
  const desiredRules = new Map<number, LotRule[]>(); // productId -> rules (empty = delete all)

  for (const ev of events) {
    stats.eventsClassified++;
    const prods = productsByEvent.get(ev.id) ?? [];
    const title = ev.source === "fda_listing" ? listingTitle(ev.sourceEventId) : null;
    const cls = classifyEvent(
      {
        firm: ev.firm,
        reason: ev.reason,
        products: prods.map((p) => ({ productDescription: p.productDescription, codeInfo: p.codeInfo })),
        title,
      },
      index,
    );
    const excluded = new Set((cls.excludedRows ?? []).map((i) => prods[i]?.id));
    if (cls.petFood !== ev.petFood) petFoodUpdates.push({ id: ev.id, petFood: cls.petFood });

    if (cls.petFood === "no") {
      for (const p of prods) desiredRules.set(p.id, []);
      if (cls.upstream?.length)
        desiredReviews.push({
          eventId: ev.id,
          productId: null,
          reason: "upstream_ingredient",
          notes: safe(`not consumer pet food, but an ingredient for it: ${cls.upstream.join(" | ")}; firm: ${ev.firm ?? "?"}`),
        });
      continue;
    }
    if (cls.petFood === "unreviewed")
      desiredReviews.push({
        eventId: ev.id,
        productId: null,
        reason: "unclassified",
        notes: safe(`pet food undecided; firm: ${ev.firm ?? "?"}; ${cls.reasons.join("; ") || "no brand, species or exclusion term"}`),
      });

    // UPC extraction improves over time: keep stored cores in step with src/lib/upc.ts (as ingestion computes them).
    const upcsByProduct = new Map<number, string[]>();
    if (ev.source === "fda_ires")
      for (const p of prods)
        upcsByProduct.set(p.id, [...new Set([...extractUpcs(p.productDescription), ...extractUpcs(p.codeInfo), ...extractUpcs(p.moreCodeInfo)])].sort());
    const brandsByProduct = new Map<number, Set<string>>();

    for (const p of prods) {
      // a row that is clearly not dog/cat food inside a pet-food event ("Fat Cat Fish Food")
      if (excluded.has(p.id)) {
        desiredRules.set(p.id, []);
        continue;
      }
      const { rules, unparsed } = parseLotRulesDetailed(p.productDescription, p.codeInfo, p.moreCodeInfo, {
        refDate: ev.initiatedOn ?? ev.classifiedOn ?? ev.reportDate,
        firm: ev.firm,
        noCodeMeansAllLots: ev.source === "fda_ires",
      });
      desiredRules.set(p.id, rules);
      if (cls.petFood !== "yes") continue;

      if (rules.some((r) => r.needsReview) || unparsed.length)
        desiredReviews.push({
          eventId: ev.id,
          productId: p.id,
          reason: "lot_parse",
          notes: safe(
            [
              unparsed.length ? `unread: ${unparsed.join(" | ")}` : "",
              rules.some((r) => r.needsReview) ? `needs review: ${[...new Set(rules.filter((r) => r.needsReview).map((r) => r.raw))].join(" | ")}` : "",
            ]
              .filter(Boolean)
              .join("; "),
          ),
        });

      const res = matchProductDetailed(
        { description: p.productDescription, codeInfo: p.codeInfo, moreCodeInfo: p.moreCodeInfo, firm: ev.firm, title },
        index,
      );
      const strong = res.matches.filter((m) => !m.needsReview);
      const weak = res.matches.filter((m) => m.needsReview);
      brandsByProduct.set(p.id, new Set(strong.map((m) => m.brandId)));
      const method: MatchMethod = ev.source === "fda_listing" ? "listing" : "alias";
      for (const m of strong)
        desiredMatches.push({
          eventId: ev.id,
          productId: p.id,
          brandId: m.brandId,
          lineId: m.lineId,
          level: m.level,
          method,
          detail: safe(m.detail, 500),
        });
      if (strong.length || manualProducts.has(p.id)) {
        if (strong.length) stats.productsMatched++;
        continue;
      }
      if (weak.length)
        desiredReviews.push({
          eventId: ev.id,
          productId: p.id,
          reason: "ambiguous",
          notes: safe(
            `brand not in product text; suggested: ${weak.map((m) => `${m.brandId} (${m.detail})`).join(", ")}`,
            500,
          ),
        });
      else
        desiredReviews.push({
          eventId: ev.id,
          productId: p.id,
          reason: "unmatched",
          notes: safe(
            `no catalog brand in text${res.coPackers.length ? `; co-packer: ${res.coPackers.join(", ")}` : ""}; firm: ${ev.firm ?? "?"}`,
          ),
        });
    }

    dropCopiedUpcs(upcsByProduct, brandsByProduct, index);
    for (const p of prods) {
      const upcs = upcsByProduct.get(p.id);
      if (upcs && upcs.join(",") !== [...p.upcs].sort().join(",")) upcUpdates.push({ id: p.id, upcs });
    }
  }

  // ------------------------------------------------------------ diff + write
  const desiredByKey = new Map(desiredMatches.map((m) => [`${m.eventId}\u0000${matchKey(m)}`, m]));
  const existingByKey = new Map(existingMatches.map((m) => [`${m.eventId}\u0000${matchKey(m)}`, m]));
  const toDelete = existingMatches.filter(
    (m: MatchRow) => m.method !== "manual" && !desiredByKey.has(`${m.eventId}\u0000${matchKey(m)}`),
  );
  const toUpsert = desiredMatches.filter((m) => {
    const ex = existingByKey.get(`${m.eventId}\u0000${matchKey(m)}`);
    if (!ex) return true;
    if (ex.method === "manual") return false;
    return ex.level !== m.level || ex.method !== m.method || ex.detail !== m.detail;
  });

  const ruleWrites: { productId: number; rules: LotRule[] }[] = [];
  for (const [productId, rules] of desiredRules) {
    const current = rulesByProduct.get(productId) ?? [];
    if (rulesSig(current) !== rulesSig(rules)) ruleWrites.push({ productId, rules });
  }

  const existingReviewByKey = new Map(existingReviews.map((r) => [reviewKey(r), r]));
  const desiredReviewKeys = new Set(desiredReviews.map((r) => reviewKey(r)));
  const reviewsToOpen = desiredReviews.filter((r) => !existingReviewByKey.has(reviewKey(r)));
  const reviewsToRefresh = desiredReviews.filter((r) => {
    const ex = existingReviewByKey.get(reviewKey(r));
    return ex && ex.status === "open" && ex.notes !== r.notes;
  });
  const reviewsToAutoResolve = existingReviews.filter(
    (r: ReviewRow) =>
      r.status === "open" &&
      MANAGED_REASONS.includes(r.reason) &&
      ((r.eventId !== null && eventIds.includes(r.eventId)) || (r.productId !== null && productIds.includes(r.productId))) &&
      !desiredReviewKeys.has(reviewKey(r)),
  );

  const nothingToWrite =
    !petFoodUpdates.length &&
    !upcUpdates.length &&
    !toDelete.length &&
    !toUpsert.length &&
    !ruleWrites.length &&
    !reviewsToOpen.length &&
    !reviewsToRefresh.length &&
    !reviewsToAutoResolve.length;
  if (nothingToWrite) return;

  await db.transaction(async (tx) => {
    for (const u of petFoodUpdates)
      await tx.update(recallEvents).set({ petFood: u.petFood }).where(eq(recallEvents.id, u.id));
    for (const u of upcUpdates) await tx.update(recallProducts).set({ upcs: u.upcs }).where(eq(recallProducts.id, u.id));

    if (toDelete.length)
      await tx.delete(recallMatches).where(
        and(
          inArray(
            recallMatches.id,
            toDelete.map((m) => m.id),
          ),
          ne(recallMatches.method, "manual"),
        ),
      );
    for (const part of chunks(toUpsert, 500)) {
      await tx
        .insert(recallMatches)
        .values(part)
        .onConflictDoUpdate({
          target: [recallMatches.eventId, recallMatches.productId, recallMatches.brandId, recallMatches.lineId],
          set: {
            level: sql`excluded.level`,
            method: sql`excluded.method`,
            detail: sql`excluded.detail`,
          },
          setWhere: ne(recallMatches.method, "manual"),
        });
      stats.matchesWritten += part.length;
    }

    for (const w of ruleWrites) {
      await tx.delete(lotRules).where(eq(lotRules.productId, w.productId));
      if (w.rules.length) {
        await tx.insert(lotRules).values(w.rules.map((r) => ({ ...r, productId: w.productId })));
        stats.lotRulesWritten += w.rules.length;
      }
    }

    for (const part of chunks(reviewsToOpen, 500)) {
      const inserted = await tx
        .insert(reviewItems)
        .values(part.map((r) => ({ ...r, status: "open" as const })))
        .onConflictDoNothing()
        .returning({ id: reviewItems.id });
      stats.reviewItemsOpened += inserted.length;
    }
    for (const r of reviewsToRefresh) {
      const ex = existingReviewByKey.get(reviewKey(r))!;
      await tx.update(reviewItems).set({ notes: r.notes }).where(and(eq(reviewItems.id, ex.id), eq(reviewItems.status, "open")));
    }
    if (reviewsToAutoResolve.length)
      await tx
        .update(reviewItems)
        .set({
          status: "resolved",
          resolvedAt: new Date(),
          notes: sql`coalesce(${reviewItems.notes} || ' | ', '') || 'auto-resolved by matcher: condition no longer holds'`,
        })
        .where(
          and(
            inArray(
              reviewItems.id,
              reviewsToAutoResolve.map((r) => r.id),
            ),
            eq(reviewItems.status, "open"),
          ),
        );
  });
}

/**
 * One UPC on rows of different brands in one event is a copy-paste error ("Cat Cuisine ... UPC
 * 7-37257-26116-7" copied from the Grreat Choice row above it). When the UPC carries the GS1 company
 * prefix of one of those brands (data: upc_prefixes), it is dropped from the rows that are not that
 * brand. Without a prefix to decide, the UPC stays on every row.
 */
export function dropCopiedUpcs(upcsByProduct: Map<number, string[]>, brandsByProduct: Map<number, Set<string>>, index: CatalogIndex): void {
  const rowsByUpc = new Map<string, number[]>();
  for (const [pid, upcs] of upcsByProduct) for (const u of upcs) rowsByUpc.set(u, [...(rowsByUpc.get(u) ?? []), pid]);
  for (const [upc, pids] of rowsByUpc) {
    if (pids.length < 2) continue;
    const brands = new Set(pids.flatMap((pid) => [...(brandsByProduct.get(pid) ?? [])]));
    if (brands.size < 2) continue;
    const owners = [...brands].filter((b) => (index.upcCorePrefixes.get(b) ?? []).some((pre) => upc.startsWith(pre)));
    if (!owners.length) continue;
    for (const pid of pids) {
      const rowBrands = brandsByProduct.get(pid) ?? new Set();
      if (!rowBrands.size || owners.some((o) => rowBrands.has(o))) continue;
      upcsByProduct.set(pid, (upcsByProduct.get(pid) ?? []).filter((u) => u !== upc));
    }
  }
}

/** Firm name for comparing a listing company with an iRES recalling firm: normalized, corporate suffixes and "dba ..." dropped. */
function firmKey(firm: string | null): string[] {
  const t = normalizeText(firm).replace(/\b(?:dba|d b a|a division of)\b.*$/, "").split(" ").filter(Boolean);
  const SUFFIX = new Set(["inc", "llc", "l", "c", "co", "corp", "corporation", "company", "ltd", "lp", "the", "incorporated"]);
  while (t.length > 1 && SUFFIX.has(t[t.length - 1]!)) t.pop();
  while (t.length > 1 && SUFFIX.has(t[0]!)) t.shift();
  return t;
}
/** "United Pet Group, a division of Spectrum Brands, Inc." -> the parent firm, "Spectrum Brands, Inc.". */
function divisionParent(firm: string | null): string | null {
  const m = /\ba\s+division\s+of\s+(.+)$/i.exec(firm ?? "");
  return m ? m[1]! : null;
}
function sameFirm(a: string | null, b: string | null): boolean {
  // a division and its parent recall under either name
  const pa = divisionParent(a);
  const pb = divisionParent(b);
  if ((pa && sameFirmName(pa, b)) || (pb && sameFirmName(a, pb))) return true;
  return sameFirmName(a, b);
}
function sameFirmName(a: string | null, b: string | null): boolean {
  const x = firmKey(a);
  const y = firmKey(b);
  if (!x.length || !y.length) return false;
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  // "Raaw Energy" ~ "Raaw Energy LLC"; "Supercan Bulk" ~ "SUPERCAN BULLY STICKS LLC" (first word + 4+ letters)
  if (short.every((w, i) => long[i] === w)) return true;
  return short[0] === long[0] && short[0]!.length >= 5 && !GENERIC_FIRM_WORDS.has(short[0]!);
}
const GENERIC_FIRM_WORDS = new Set(["natural", "naturals", "nature", "natures", "premium", "american", "national", "united", "healthy", "happy", "simply", "golden", "global", "international", "animal", "animals", "pet", "pets", "great", "quality", "family", "country", "western", "southern", "northern", "midwest", "pacific", "atlantic"]);
const STOP = new Set(["and", "or", "the", "for", "with", "of", "in", "a", "dog", "dogs", "cat", "cats", "pet", "pets", "food", "foods", "treats", "treat", "recipe", "brand", "net", "wt", "oz", "lb", "lbs", "bag", "bags"]);
const productWords = (t: string) => new Set(normalizeText(t).split(" ").filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)));

/** Days before / after the listing date an iRES initiation may fall, for the normal match. */
export const LINK_DAYS_BEFORE = 90;
/** Wide window (iRES initiated up to 3 years before the listing date) for strong fingerprints only. */
export const LINK_WIDE_DAYS_BEFORE = 1095;
/** Listing slugs of follow-up notices ("... expands voluntary recall ...", "additionally expands"). */
const FOLLOW_UP_SLUG = /\b(?:expands?|expanded|expanding|additionally|update[sd]?|updating|correction)\b/;

/**
 * Listing items (FDA press-release list) arrive before iRES classifies the recall. Each pet-food
 * listing event is linked to at most one iRES event; links are recomputed on every run, so a
 * catalog or rule fix also repairs old links.
 *
 * Normal match: the iRES event was initiated between LINK_DAYS_BEFORE days before and
 * LINK_WINDOW_DAYS after the listing date (FDA posts and edits notices after the recall starts),
 * and the brands agree: they share a brand AND (the recalling firms are the same, or every listing
 * brand is in the iRES event, or they share two or more brands). A shared retailer house brand
 * alone ("petco-brand", "Dentley's" made by several suppliers) is not enough.
 * With no brand on one side, the same recalling firm close in time links them (a firm that only
 * shares its first word must also share a product word). When both sides have brands and share
 * none, the firm alone never links them (J.M. Smucker's cat food is not its dog food).
 *
 * Wide match, only when nothing matched normally: the listing date of older notices is often a
 * later edit date (the 2017-2021 static file has 14 items dated 2018-02-08), so an iRES event
 * initiated up to LINK_WIDE_DAYS_BEFORE earlier links when the firm is the same, every listing
 * brand is in the iRES event, and the listing names two or more brands or is a follow-up notice
 * ("expands").
 *
 * Ties: a shared product line, then the same initiation date, then the only candidate within
 * LINK_WINDOW_DAYS; still several -> 'link_listing' review item. Runs after all matches are written. Returns the number of review items opened.
 */
async function linkListings(db: Db, onlyEventIds?: number[]): Promise<number> {
  const listing = await db
    .select()
    .from(recallEvents)
    .where(
      and(
        eq(recallEvents.source, "fda_listing"),
        onlyEventIds ? inArray(recallEvents.id, onlyEventIds.length ? onlyEventIds : [-1]) : undefined,
      ),
    );
  if (!listing.length) return 0;
  const listingIds = listing.map((e) => e.id);
  const listingMatches = await db
    .select({ eventId: recallMatches.eventId, brandId: recallMatches.brandId, lineId: recallMatches.lineId })
    .from(recallMatches)
    .where(inArray(recallMatches.eventId, listingIds));
  const brandsByEvent = new Map<number, Set<string>>();
  const linesByListing = new Map<number, Set<string>>();
  for (const m of listingMatches) {
    brandsByEvent.set(m.eventId, (brandsByEvent.get(m.eventId) ?? new Set()).add(m.brandId));
    if (m.lineId) linesByListing.set(m.eventId, (linesByListing.get(m.eventId) ?? new Set()).add(m.lineId));
  }

  // iRES pet-food events with their brands, lines and product words.
  const iresPet = await db
    .select({ id: recallEvents.id, firm: recallEvents.firm, initiatedOn: recallEvents.initiatedOn, sourceEventId: recallEvents.sourceEventId })
    .from(recallEvents)
    .where(and(eq(recallEvents.source, "fda_ires"), eq(recallEvents.petFood, "yes")));
  const iresPetIds = iresPet.map((e) => e.id);
  const iresBrands = new Map<number, Set<string>>();
  const iresLines = new Map<number, Set<string>>();
  const iresWords = new Map<number, Set<string>>();
  for (const part of chunks(iresPetIds, 500)) {
    if (!part.length) continue;
    const ms = await db
      .selectDistinct({ eventId: recallMatches.eventId, brandId: recallMatches.brandId, lineId: recallMatches.lineId })
      .from(recallMatches)
      .where(inArray(recallMatches.eventId, part));
    for (const m of ms) {
      iresBrands.set(m.eventId, (iresBrands.get(m.eventId) ?? new Set()).add(m.brandId));
      if (m.lineId) iresLines.set(m.eventId, (iresLines.get(m.eventId) ?? new Set()).add(m.lineId));
    }
    const rows = await db
      .select({ eventId: recallProducts.eventId, d: recallProducts.productDescription })
      .from(recallProducts)
      .where(inArray(recallProducts.eventId, part));
    for (const r of rows) {
      const set = iresWords.get(r.eventId) ?? new Set<string>();
      for (const w of productWords(r.d)) set.add(w);
      iresWords.set(r.eventId, set);
    }
  }
  const listingText = new Map<number, string>();
  {
    const rows = await db
      .select({ eventId: recallProducts.eventId, d: recallProducts.productDescription })
      .from(recallProducts)
      .where(inArray(recallProducts.eventId, listingIds));
    for (const r of rows) listingText.set(r.eventId, `${listingText.get(r.eventId) ?? ""} ${r.d}`);
  }

  const existing = await db
    .select()
    .from(reviewItems)
    .where(and(inArray(reviewItems.eventId, listingIds), eq(reviewItems.reason, "link_listing")));

  const desired = new Map<number, number | null>();
  const reviews: { eventId: number; notes: string }[] = [];
  for (const ev of listing) {
    desired.set(ev.id, null);
    const date = eventDate(ev);
    if (ev.petFood !== "yes" || !date) continue;
    const brands = brandsByEvent.get(ev.id) ?? new Set<string>();
    const words = productWords(listingText.get(ev.id) ?? "");
    const offset = (c: { initiatedOn: string | null }) => (c.initiatedOn ? (Date.parse(c.initiatedOn) - Date.parse(date)) / DAY : null);
    const hits = new Map<number, { sid: string; initiatedOn: string }>();
    for (const c of iresPet) {
      const off = offset(c);
      if (off === null || off < -LINK_DAYS_BEFORE || off > LINK_WINDOW_DAYS) continue;
      const cb = iresBrands.get(c.id) ?? new Set<string>();
      if (brands.size && cb.size) {
        const shared = [...brands].filter((b) => cb.has(b));
        const subset = [...brands].every((b) => cb.has(b));
        if (shared.length && (sameFirm(ev.firm, c.firm) || subset || shared.length >= 2)) hits.set(c.id, { sid: c.sourceEventId, initiatedOn: c.initiatedOn! });
      } else if (Math.abs(off) <= LINK_WINDOW_DAYS && sameFirm(ev.firm, c.firm)) {
        // No brand on one side: the same firm, close in time. A firm that only shares its first
        // word must also share a product word ("Supercan Bulk" / "SUPERCAN BULLY STICKS LLC").
        const exactFirm = firmKey(ev.firm).join(" ") === firmKey(c.firm).join(" ");
        if (exactFirm || [...words].some((w) => iresWords.get(c.id)?.has(w))) hits.set(c.id, { sid: c.sourceEventId, initiatedOn: c.initiatedOn! });
      }
    }
    if (!hits.size && brands.size && (brands.size >= 2 || FOLLOW_UP_SLUG.test(listingTitle(ev.sourceEventId))))
      for (const c of iresPet) {
        const off = offset(c);
        if (off === null || off < -LINK_WIDE_DAYS_BEFORE || off > LINK_WINDOW_DAYS || !sameFirm(ev.firm, c.firm)) continue;
        const cb = iresBrands.get(c.id) ?? new Set<string>();
        if ([...brands].every((b) => cb.has(b))) hits.set(c.id, { sid: c.sourceEventId, initiatedOn: c.initiatedOn! });
      }
    let ids = [...hits.keys()];
    if (ids.length > 1) {
      // Tie-breaks: a shared product line, then the same initiation date.
      const lines = linesByListing.get(ev.id);
      const byLine = lines ? ids.filter((id) => [...(iresLines.get(id) ?? [])].some((l) => lines.has(l))) : [];
      if (byLine.length === 1) ids = byLine;
      else {
        const pool = byLine.length > 1 ? byLine : ids;
        const near = pool.filter((id) => daysApart(hits.get(id)!.initiatedOn, date) <= LINK_WINDOW_DAYS);
        const sameDay = pool.filter((id) => daysApart(hits.get(id)!.initiatedOn, date) === 0);
        if (sameDay.length === 1) ids = sameDay;
        else if (near.length === 1) ids = near;
      }
    }
    if (ids.length === 1) desired.set(ev.id, ids[0]!);
    else if (ids.length > 1)
      reviews.push({ eventId: ev.id, notes: safe(`several iRES events match: ${ids.map((id) => hits.get(id)!.sid).sort().join(", ")}`) });
  }
  const changes = listing.filter((ev) => (desired.get(ev.id) ?? null) !== (ev.linkedEventId ?? null));
  const reviewEvents = new Set(reviews.map((r) => r.eventId));
  const resolve = existing.filter((r) => r.status === "open" && r.eventId !== null && !reviewEvents.has(r.eventId));
  const toOpen = reviews.filter((r) => !existing.some((x) => x.eventId === r.eventId));
  if (!changes.length && !toOpen.length && !resolve.length) return 0;

  let opened = 0;
  await db.transaction(async (tx) => {
    for (const ev of changes)
      await tx.update(recallEvents).set({ linkedEventId: desired.get(ev.id) ?? null }).where(eq(recallEvents.id, ev.id));
    if (toOpen.length) {
      const inserted = await tx
        .insert(reviewItems)
        .values(toOpen.map((r) => ({ eventId: r.eventId, productId: null, reason: "link_listing" as const, notes: r.notes })))
        .onConflictDoNothing()
        .returning({ id: reviewItems.id });
      opened = inserted.length;
    }
    if (resolve.length)
      await tx
        .update(reviewItems)
        .set({ status: "resolved", resolvedAt: new Date(), notes: sql`coalesce(${reviewItems.notes} || ' | ', '') || 'auto-resolved by matcher'` })
        .where(and(inArray(reviewItems.id, resolve.map((r) => r.id)), eq(reviewItems.status, "open")));
  });
  return opened;
}
