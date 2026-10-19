/**
 * Historical validation over a backfilled database (CLAUDE.md build step 2).
 * OWNER: matcher agent. Node-only; never imported by the cron route.
 *
 * Reads what `npm run backfill:fda` + `npm run seed` + matchAll left in the
 * database and produces, for every pet-food or unreviewed event initiated on or
 * after `minInitiated`, the classification decision, per-row matches, lot rules
 * and review items, plus aggregate stats. Output: a JSON-able structure and a
 * Markdown rendering.
 *
 * All recall text is untrusted. It is truncated, stripped of control characters
 * and, in Markdown, escaped so that no HTML or link syntax from a notice can
 * render. Only URLs on fda.gov hosts become links.
 */
import { and, asc, eq, gte, inArray, isNull, or } from "drizzle-orm";
import { loadSnapshotFromDb } from "../catalog/snapshot";
import type { Db } from "../db/client";
import { lotRules, recallEvents, recallMatches, recallProducts, reviewItems } from "../db/schema";
import { classifyEvent } from "./classify";
import { buildCatalogIndex } from "./matcher";

export const DEFAULT_MIN_INITIATED = "2016-10-01";

type EventRow = typeof recallEvents.$inferSelect;
type ProductRow = typeof recallProducts.$inferSelect;
type MatchRow = typeof recallMatches.$inferSelect;
type RuleRow = typeof lotRules.$inferSelect;
type ReviewRow = typeof reviewItems.$inferSelect;

export type LotStatus = "clean" | "mixed" | "needs_review" | "none";

export interface ReportReview {
  id: number;
  reason: string;
  status: string;
  notes: string | null;
}

export interface ReportProduct {
  id: number;
  recallNumber: string | null;
  description: string;
  upcs: string[];
  matches: { brandId: string; lineId: string | null; level: string; method: string; detail: string | null }[];
  lotStatus: LotStatus;
  lotRules: {
    kind: string;
    value: string | null;
    valueTo: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    scope: string | null;
    needsReview: boolean;
    raw: string;
  }[];
  reviewItems: ReportReview[];
}

export interface ReportEvent {
  id: number;
  source: string;
  sourceEventId: string;
  firm: string | null;
  initiatedOn: string | null;
  classifiedOn: string | null;
  terminatedOn: string | null;
  status: string | null;
  classification: string | null;
  reason: string | null;
  petFood: string;
  classificationReasons: string[];
  enforcementReportUrl: string | null;
  /** Own notice URL (listing events) plus the notice URLs of listing items linked to this event. */
  noticeUrls: string[];
  /** For a listing event: the iRES event it is linked to. For an iRES event: linked listing paths. */
  linkedTo: string[];
  brands: string[];
  reviewItems: ReportReview[];
  products: ReportProduct[];
}

export interface DbValidationStats {
  minInitiated: string;
  iresEventsInWindow: number;
  iresEventsPetFood: number;
  iresEventsNotPetFood: number;
  iresEventsUnreviewed: number;
  iresPetFoodEventsMatched: number;
  iresPetFoodEventsMatchedRate: number;
  iresPetFoodEventsLineLevel: number;
  iresPetFoodRows: number;
  iresPetFoodRowsMatched: number;
  iresPetFoodRowsLineLevel: number;
  iresPetFoodRowsLineLevelRate: number;
  iresMatchedRowsLineLevelRate: number;
  iresPetFoodRowsLot: Record<LotStatus, number>;
  iresPetFoodRowsCleanLotRate: number;
  listingEventsInWindow: number;
  listingEventsPetFood: number;
  listingEventsPetFoodMatched: number;
  listingEventsLinkedToIres: number;
  listingEventsLinkReview: number;
  reviewQueueOpenByReason: Record<string, number>;
  reviewQueueOpenTotal: number;
  reviewQueueOpenInWindowByReason: Record<string, number>;
}

export interface DbValidationReport {
  generatedAt: string;
  stats: DbValidationStats;
  events: ReportEvent[];
}

/** Untrusted text: drop control characters, collapse whitespace, truncate. */
export const clip = (s: string | null | undefined, max: number): string | null => {
  if (s == null) return null;
  const t = s.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

const ratio = (a: number, b: number) => (b ? a / b : 0);

/** `unread`: the row has code text no rule could express (an open lot_parse item with "unread:" notes). */
function lotStatus(rules: RuleRow[], unread = false): LotStatus {
  if (!rules.length) return unread ? "needs_review" : "none";
  const review = rules.filter((r) => r.needsReview).length;
  if (!review) return unread ? "mixed" : "clean";
  return review === rules.length ? "needs_review" : "mixed";
}

const toReview = (r: ReviewRow): ReportReview => ({
  id: r.id,
  reason: r.reason,
  status: r.status,
  notes: clip(r.notes, 300),
});

function group<K, T>(xs: T[], key: (x: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const x of xs) {
    const k = key(x);
    const arr = m.get(k);
    if (arr) arr.push(x);
    else m.set(k, [x]);
  }
  return m;
}

function chunks<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}

async function selectIn<T>(ids: number[], q: (part: number[]) => Promise<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (const part of chunks(ids, 500)) out.push(...(await q(part)));
  return out;
}

export async function buildDbValidationReport(
  db: Db,
  opts: { minInitiated?: string } = {},
): Promise<DbValidationReport> {
  const minInitiated = opts.minInitiated ?? DEFAULT_MIN_INITIATED;
  const snapshot = await loadSnapshotFromDb(db);
  if (!snapshot.brands.length) throw new Error("catalog tables are empty: run `npm run seed` first");
  const index = buildCatalogIndex(snapshot);

  // Events with no initiation date are kept (the backfill keeps them too).
  const inWindow: EventRow[] = await db
    .select()
    .from(recallEvents)
    .where(or(isNull(recallEvents.initiatedOn), gte(recallEvents.initiatedOn, minInitiated)))
    .orderBy(asc(recallEvents.initiatedOn), asc(recallEvents.id));
  const ids = inWindow.map((e) => e.id);
  const products: ProductRow[] = await selectIn(ids, (p) =>
    db.select().from(recallProducts).where(inArray(recallProducts.eventId, p)).orderBy(asc(recallProducts.id)),
  );
  const productIds = products.map((p) => p.id);
  const matches: MatchRow[] = await selectIn(ids, (p) => db.select().from(recallMatches).where(inArray(recallMatches.eventId, p)));
  const rules: RuleRow[] = await selectIn(productIds, (p) => db.select().from(lotRules).where(inArray(lotRules.productId, p)));
  const reviewsByEvent: ReviewRow[] = await selectIn(ids, (p) => db.select().from(reviewItems).where(inArray(reviewItems.eventId, p)));
  const reviewsByProduct: ReviewRow[] = await selectIn(productIds, (p) =>
    db.select().from(reviewItems).where(inArray(reviewItems.productId, p)),
  );
  const reviews = [...new Map([...reviewsByEvent, ...reviewsByProduct].map((r) => [r.id, r])).values()];
  const allOpen = await db.select({ reason: reviewItems.reason }).from(reviewItems).where(eq(reviewItems.status, "open"));
  const linkedListings = await db
    .select({ id: recallEvents.id, linkedEventId: recallEvents.linkedEventId, noticeUrl: recallEvents.noticeUrl, path: recallEvents.sourceEventId })
    .from(recallEvents)
    .where(and(eq(recallEvents.source, "fda_listing")));

  const byId = new Map(inWindow.map((e) => [e.id, e]));
  const productsByEvent = group(products, (p) => p.eventId);
  const matchesByProduct = group(
    matches.filter((m) => m.productId !== null),
    (m) => m.productId!,
  );
  const matchesByEvent = group(matches, (m) => m.eventId);
  const rulesByProduct = group(rules, (r) => r.productId);
  const reviewsByProductId = group(
    reviews.filter((r) => r.productId !== null),
    (r) => r.productId!,
  );
  const unreadRow = (pid: number) =>
    (reviewsByProductId.get(pid) ?? []).some((r) => r.reason === "lot_parse" && r.status === "open" && /\bunread:/.test(r.notes ?? ""));
  const eventReviews = group(
    reviews.filter((r) => r.productId === null && r.eventId !== null),
    (r) => r.eventId!,
  );
  const listingByIres = group(
    linkedListings.filter((l) => l.linkedEventId !== null),
    (l) => l.linkedEventId!,
  );
  const allEventsById = new Map<number, { sourceEventId: string }>();
  if (linkedListings.some((l) => l.linkedEventId !== null)) {
    const targets = [...new Set(linkedListings.map((l) => l.linkedEventId).filter((x): x is number => x !== null))];
    for (const t of await selectIn(targets, (p) =>
      db.select({ id: recallEvents.id, sourceEventId: recallEvents.sourceEventId }).from(recallEvents).where(inArray(recallEvents.id, p)),
    ))
      allEventsById.set(t.id, t);
  }

  // ------------------------------------------------------------ per event
  const events: ReportEvent[] = [];
  for (const ev of inWindow) {
    if (ev.petFood === "no") continue;
    const prods = productsByEvent.get(ev.id) ?? [];
    const cls = classifyEvent(
      { firm: ev.firm, products: prods.map((p) => ({ productDescription: p.productDescription, codeInfo: p.codeInfo })) },
      index,
    );
    const linkedFrom = listingByIres.get(ev.id) ?? [];
    const noticeUrls = [ev.noticeUrl, ...linkedFrom.map((l) => l.noticeUrl)].filter((u): u is string => !!u);
    const linkedTo =
      ev.source === "fda_listing"
        ? ev.linkedEventId !== null
          ? [`fda_ires:${allEventsById.get(ev.linkedEventId)?.sourceEventId ?? `#${ev.linkedEventId}`}`]
          : []
        : linkedFrom.map((l) => `fda_listing:${l.path}`);
    events.push({
      id: ev.id,
      source: ev.source,
      sourceEventId: ev.sourceEventId,
      firm: clip(ev.firm, 120),
      initiatedOn: ev.initiatedOn,
      classifiedOn: ev.classifiedOn,
      terminatedOn: ev.terminatedOn,
      status: ev.status,
      classification: ev.classification,
      reason: clip(ev.reason, 240),
      petFood: ev.petFood,
      classificationReasons: cls.reasons.map((r) => clip(r, 120)!),
      enforcementReportUrl: ev.enforcementReportUrl,
      noticeUrls: [...new Set(noticeUrls)],
      linkedTo,
      brands: [...new Set((matchesByEvent.get(ev.id) ?? []).map((m) => m.brandId))].sort(),
      reviewItems: (eventReviews.get(ev.id) ?? []).map(toReview),
      products: prods.map((p) => {
        const rs = rulesByProduct.get(p.id) ?? [];
        return {
          id: p.id,
          recallNumber: p.recallNumber,
          description: clip(p.productDescription, 300)!,
          upcs: p.upcs,
          matches: (matchesByProduct.get(p.id) ?? []).map((m) => ({
            brandId: m.brandId,
            lineId: m.lineId,
            level: m.level,
            method: m.method,
            detail: clip(m.detail, 160),
          })),
          lotStatus: lotStatus(rs, unreadRow(p.id)),
          lotRules: rs.map((r) => ({
            kind: r.kind,
            value: clip(r.value, 80),
            valueTo: clip(r.valueTo, 80),
            dateFrom: r.dateFrom,
            dateTo: r.dateTo,
            scope: clip(r.scope, 80),
            needsReview: r.needsReview,
            raw: clip(r.raw, 160)!,
          })),
          reviewItems: (reviewsByProductId.get(p.id) ?? []).map(toReview),
        };
      }),
    });
  }

  // ------------------------------------------------------------ stats
  const ires = inWindow.filter((e) => e.source === "fda_ires");
  const iresPet = ires.filter((e) => e.petFood === "yes");
  const iresPetIds = new Set(iresPet.map((e) => e.id));
  const iresPetRows = products.filter((p) => iresPetIds.has(p.eventId));
  const rowMatched = (p: ProductRow) => (matchesByProduct.get(p.id) ?? []).length > 0;
  const rowLine = (p: ProductRow) => (matchesByProduct.get(p.id) ?? []).some((m) => m.lineId !== null);
  const lot: Record<LotStatus, number> = { clean: 0, mixed: 0, needs_review: 0, none: 0 };
  for (const p of iresPetRows) lot[lotStatus(rulesByProduct.get(p.id) ?? [], unreadRow(p.id))]++;
  const listing = inWindow.filter((e) => e.source === "fda_listing");
  const listingPet = listing.filter((e) => e.petFood === "yes");
  const listingReviewOpen = new Set(
    reviews.filter((r) => r.reason === "link_listing" && r.status === "open" && r.eventId !== null).map((r) => r.eventId!),
  );
  const countBy = (xs: { reason: string }[]) => {
    const out: Record<string, number> = {};
    for (const x of xs) out[x.reason] = (out[x.reason] ?? 0) + 1;
    return Object.fromEntries(Object.entries(out).sort());
  };
  const iresPetMatched = iresPet.filter((e) => (matchesByEvent.get(e.id) ?? []).length > 0).length;
  const iresRowsMatched = iresPetRows.filter(rowMatched).length;
  const iresRowsLine = iresPetRows.filter(rowLine).length;

  const stats: DbValidationStats = {
    minInitiated,
    iresEventsInWindow: ires.length,
    iresEventsPetFood: iresPet.length,
    iresEventsNotPetFood: ires.filter((e) => e.petFood === "no").length,
    iresEventsUnreviewed: ires.filter((e) => e.petFood === "unreviewed").length,
    iresPetFoodEventsMatched: iresPetMatched,
    iresPetFoodEventsMatchedRate: ratio(iresPetMatched, iresPet.length),
    iresPetFoodEventsLineLevel: iresPet.filter((e) => (matchesByEvent.get(e.id) ?? []).some((m) => m.lineId !== null)).length,
    iresPetFoodRows: iresPetRows.length,
    iresPetFoodRowsMatched: iresRowsMatched,
    iresPetFoodRowsLineLevel: iresRowsLine,
    iresPetFoodRowsLineLevelRate: ratio(iresRowsLine, iresPetRows.length),
    iresMatchedRowsLineLevelRate: ratio(iresRowsLine, iresRowsMatched),
    iresPetFoodRowsLot: lot,
    iresPetFoodRowsCleanLotRate: ratio(lot.clean, iresPetRows.length),
    listingEventsInWindow: listing.length,
    listingEventsPetFood: listingPet.length,
    listingEventsPetFoodMatched: listingPet.filter((e) => (matchesByEvent.get(e.id) ?? []).length > 0).length,
    listingEventsLinkedToIres: listingPet.filter((e) => e.linkedEventId !== null).length,
    listingEventsLinkReview: listingPet.filter((e) => listingReviewOpen.has(e.id)).length,
    reviewQueueOpenByReason: countBy(allOpen),
    reviewQueueOpenTotal: allOpen.length,
    reviewQueueOpenInWindowByReason: countBy(
      reviews.filter((r) => r.status === "open" && (r.eventId === null || byId.has(r.eventId))),
    ),
  };

  return { generatedAt: new Date().toISOString(), stats, events };
}

// ------------------------------------------------------------ Markdown

/** Escape untrusted text for Markdown: no HTML, no links, no emphasis, no table breaks. */
export function mdEscape(s: string | null | undefined): string {
  if (s == null) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([\\`*_[\]{}()#+!|~])/g, "\\$1");
}

/** Only fda.gov URLs we built ourselves become links; anything else is printed escaped. */
export function mdLink(label: string, url: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const okHost = u.hostname === "www.fda.gov" || u.hostname === "www.accessdata.fda.gov";
    if (u.protocol === "https:" && okHost && !/[\s()<>]/.test(url)) return `[${mdEscape(label)}](${url})`;
  } catch {
    /* fall through */
  }
  return mdEscape(url);
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export function statsLines(s: DbValidationStats): string[] {
  return [
    `window: events initiated on/after ${s.minInitiated} (or with no initiation date)`,
    `iRES events in window: ${s.iresEventsInWindow}`,
    `  classified pet food: ${s.iresEventsPetFood}   not pet food: ${s.iresEventsNotPetFood}   unreviewed: ${s.iresEventsUnreviewed}`,
    `  pet-food events matched to >=1 brand: ${s.iresPetFoodEventsMatched}/${s.iresEventsPetFood} (${pct(s.iresPetFoodEventsMatchedRate)})`,
    `  pet-food events with >=1 line-level match: ${s.iresPetFoodEventsLineLevel}/${s.iresEventsPetFood}`,
    `iRES pet-food rows: ${s.iresPetFoodRows}`,
    `  rows matched to a brand: ${s.iresPetFoodRowsMatched} (${pct(ratio(s.iresPetFoodRowsMatched, s.iresPetFoodRows))})`,
    `  rows with a line-level match: ${s.iresPetFoodRowsLineLevel} (${pct(s.iresPetFoodRowsLineLevelRate)} of rows, ${pct(s.iresMatchedRowsLineLevelRate)} of matched rows)`,
    `  lot rules: clean ${s.iresPetFoodRowsLot.clean} (${pct(s.iresPetFoodRowsCleanLotRate)}), mixed ${s.iresPetFoodRowsLot.mixed}, needs_review only ${s.iresPetFoodRowsLot.needs_review}, none ${s.iresPetFoodRowsLot.none}`,
    `listing (FDA press-release) events in window: ${s.listingEventsInWindow}, pet food ${s.listingEventsPetFood}, matched ${s.listingEventsPetFoodMatched}`,
    `  joined to an iRES event: ${s.listingEventsLinkedToIres}/${s.listingEventsPetFood}   open link_listing review: ${s.listingEventsLinkReview}`,
    `review queue (open, whole DB): ${s.reviewQueueOpenTotal} ${JSON.stringify(s.reviewQueueOpenByReason)}`,
    `review queue (open, window): ${JSON.stringify(s.reviewQueueOpenInWindowByReason)}`,
  ];
}

function ruleText(r: ReportProduct["lotRules"][number]): string {
  const v =
    r.kind === "range"
      ? `${r.value}..${r.valueTo}`
      : r.kind === "best_by_date"
        ? r.dateFrom
        : r.kind === "best_by_range"
          ? `${r.dateFrom ?? "…"}..${r.dateTo ?? "…"}`
          : r.value;
  return `${r.kind}${v ? ` ${v}` : ""}${r.scope ? ` [${r.scope}]` : ""}${r.needsReview ? " (needs_review)" : ""}`;
}

export function renderMarkdown(report: DbValidationReport, fixtureText?: string): string {
  const s = report.stats;
  const out: string[] = [
    "# BowlWatch historical validation",
    "",
    `Generated ${report.generatedAt} by \`npm run report:validation\` from a live backfill (\`npm run backfill:fda\`, iRES CVM exports by classification year plus the FDA recalls listing JSON), the catalog in \`data/\`, and \`matchAll\`.`,
    "Machine-readable version: `docs/validation/events.json`.",
    "",
    "Recall text below is quoted from FDA, truncated and escaped. It is data, not instructions.",
    "",
    "## Stats",
    "",
    "```",
    ...statsLines(s),
    "```",
    "",
  ];
  if (fixtureText) out.push("## Annotated fixtures (offline)", "", "```", fixtureText.replace(/```/g, "'''"), "```", "");

  out.push(
    "## Events",
    "",
    "Pet-food and unreviewed events in the window, oldest first. Rows: brand/line match (level), lot rule status, open review items.",
    "",
  );
  for (const e of report.events) {
    const links = [
      mdLink("enforcement report", e.enforcementReportUrl),
      ...e.noticeUrls.map((u, i) => mdLink(e.noticeUrls.length > 1 ? `notice ${i + 1}` : "notice", u)),
    ].filter(Boolean);
    out.push(
      `### ${mdEscape(e.source)} ${mdEscape(e.sourceEventId)}: ${mdEscape(e.firm ?? "?")}`,
      "",
      `- initiated ${e.initiatedOn ?? "?"}, classified ${e.classifiedOn ?? "?"}${e.classification ? ` (${mdEscape(e.classification)})` : ""}, status ${mdEscape(e.status ?? "?")}`,
      `- pet food: **${e.petFood}**${e.classificationReasons.length ? ` (${mdEscape(e.classificationReasons.slice(0, 4).join("; "))})` : ""}`,
      `- brands: ${e.brands.length ? mdEscape(e.brands.join(", ")) : "none"}${e.linkedTo.length ? `; linked: ${mdEscape(e.linkedTo.join(", "))}` : ""}`,
      `- links: ${links.length ? links.join(" · ") : "none"}`,
    );
    if (e.reason) out.push(`- reason: ${mdEscape(clip(e.reason, 160))}`);
    for (const r of e.reviewItems) out.push(`- review #${r.id} ${r.reason} (${r.status}): ${mdEscape(clip(r.notes, 160))}`);
    if (e.products.length) {
      out.push("", "| # | product | match | lots | review |", "| --- | --- | --- | --- | --- |");
      for (const p of e.products) {
        const m = p.matches.length
          ? p.matches.map((x) => `${x.lineId ?? x.brandId} (${x.level})`).join(", ")
          : "none";
        const lots = p.lotRules.length ? `${p.lotStatus}: ${p.lotRules.slice(0, 4).map(ruleText).join("; ")}${p.lotRules.length > 4 ? ` +${p.lotRules.length - 4}` : ""}` : "none";
        const rv = p.reviewItems
          .filter((r) => r.status === "open")
          .map((r) => r.reason)
          .join(", ");
        out.push(
          `| ${mdEscape(p.recallNumber ?? "")} | ${mdEscape(clip(p.description, 140))} | ${mdEscape(m)} | ${mdEscape(clip(lots, 200))} | ${mdEscape(rv)} |`,
        );
      }
    }
    out.push("");
  }
  return out.join("\n");
}
