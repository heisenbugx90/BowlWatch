/**
 * Manual review queue: list, inspect, resolve (optionally recording a manual
 * match), dismiss. Resolving unmatched notices is how the normalization table
 * grows: the CLI prints the YAML file to edit when a brand is missing.
 */
import { and, asc, eq, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { brands, productLines, recallEvents, recallMatches, recallProducts, reviewItems } from "../db/schema";
import type { MatchLevel, ReviewReason, ReviewStatus } from "../types";

export interface ReviewListRow {
  id: number;
  reason: ReviewReason;
  status: ReviewStatus;
  createdAt: Date;
  eventId: number | null;
  productId: number | null;
  source: string | null;
  sourceEventId: string | null;
  firm: string | null;
  productDescription: string | null;
  notes: string | null;
}

export async function listReviewItems(
  db: Db,
  opts: { status?: ReviewStatus; reason?: ReviewReason; limit?: number } = {},
): Promise<ReviewListRow[]> {
  const where = and(
    eq(reviewItems.status, opts.status ?? "open"),
    opts.reason ? eq(reviewItems.reason, opts.reason) : undefined,
  );
  return db
    .select({
      id: reviewItems.id,
      reason: reviewItems.reason,
      status: reviewItems.status,
      createdAt: reviewItems.createdAt,
      eventId: reviewItems.eventId,
      productId: reviewItems.productId,
      source: recallEvents.source,
      sourceEventId: recallEvents.sourceEventId,
      firm: recallEvents.firm,
      productDescription: recallProducts.productDescription,
      notes: reviewItems.notes,
    })
    .from(reviewItems)
    .leftJoin(recallProducts, eq(recallProducts.id, reviewItems.productId))
    .leftJoin(
      recallEvents,
      eq(recallEvents.id, sql`coalesce(${reviewItems.eventId}, ${recallProducts.eventId})`),
    )
    .where(where)
    .orderBy(asc(reviewItems.createdAt), asc(reviewItems.id))
    .limit(opts.limit ?? 50);
}

export async function getReviewItem(db: Db, id: number) {
  const [item] = await db.select().from(reviewItems).where(eq(reviewItems.id, id));
  if (!item) return null;
  const product = item.productId
    ? ((await db.select().from(recallProducts).where(eq(recallProducts.id, item.productId)))[0] ?? null)
    : null;
  const eventId = item.eventId ?? product?.eventId ?? null;
  const event = eventId ? ((await db.select().from(recallEvents).where(eq(recallEvents.id, eventId)))[0] ?? null) : null;
  const matches = eventId ? await db.select().from(recallMatches).where(eq(recallMatches.eventId, eventId)) : [];
  return { item, product, event, matches };
}

export interface ResolveInput {
  id: number;
  reviewer: string;
  notes?: string;
  /** Record a manual match for the item's product (or event). */
  brandId?: string;
  lineId?: string;
  level?: MatchLevel;
}

export async function resolveReviewItem(db: Db, input: ResolveInput): Promise<void> {
  await db.transaction(async (tx) => {
    const [item] = await tx.select().from(reviewItems).where(eq(reviewItems.id, input.id));
    if (!item) throw new Error(`review item ${input.id} not found`);
    if (input.brandId) {
      const [b] = await tx.select({ id: brands.id }).from(brands).where(eq(brands.id, input.brandId));
      if (!b) throw new Error(`brand '${input.brandId}' is not in the catalog; add data/brands/${input.brandId}.yaml and run npm run seed`);
      if (input.lineId) {
        const [l] = await tx
          .select({ id: productLines.id })
          .from(productLines)
          .where(and(eq(productLines.id, input.lineId), eq(productLines.brandId, input.brandId)));
        if (!l) throw new Error(`line '${input.lineId}' is not a line of '${input.brandId}' (ids look like 'hills/science-diet')`);
      }
      let eventId = item.eventId;
      if (!eventId && item.productId) {
        const [p] = await tx.select({ eventId: recallProducts.eventId }).from(recallProducts).where(eq(recallProducts.id, item.productId));
        eventId = p?.eventId ?? null;
      }
      if (!eventId) throw new Error(`review item ${input.id} has no event`);
      const now = new Date();
      await tx
        .insert(recallMatches)
        .values({
          eventId,
          productId: item.productId,
          brandId: input.brandId,
          lineId: input.lineId ?? null,
          level: input.level ?? (input.lineId ? "line" : "brand"),
          method: "manual",
          detail: input.notes ?? `review item ${input.id}`,
          reviewedBy: input.reviewer,
          reviewedAt: now,
        })
        .onConflictDoUpdate({
          target: [recallMatches.eventId, recallMatches.productId, recallMatches.brandId, recallMatches.lineId],
          set: {
            level: input.level ?? (input.lineId ? "line" : "brand"),
            method: "manual",
            reviewedBy: input.reviewer,
            reviewedAt: now,
          },
        });
    }
    await tx
      .update(reviewItems)
      .set({ status: "resolved", resolvedAt: new Date(), notes: input.notes ?? item.notes })
      .where(eq(reviewItems.id, input.id));
  });
}

export async function dismissReviewItem(db: Db, id: number, notes?: string): Promise<void> {
  const res = await db
    .update(reviewItems)
    .set({ status: "dismissed", resolvedAt: new Date(), ...(notes ? { notes } : {}) })
    .where(eq(reviewItems.id, id))
    .returning({ id: reviewItems.id });
  if (!res.length) throw new Error(`review item ${id} not found`);
}
