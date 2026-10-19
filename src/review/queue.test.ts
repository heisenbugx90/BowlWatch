import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../../test/helpers/db";
import { loadCatalog } from "../catalog/load";
import { seedCatalog } from "../catalog/seed";
import type { Db } from "../db/client";
import { recallEvents, recallMatches, recallProducts, reviewItems } from "../db/schema";
import { dismissReviewItem, getReviewItem, listReviewItems, resolveReviewItem } from "./queue";

describe("review queue", () => {
  let db: Db;
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const res = await loadCatalog();
    if (!res.ok) throw new Error(res.errors.join("\n"));
    await seedCatalog(db, res.catalog);
  });
  afterAll(async () => close());

  it("lists, resolves with a manual match, and dismisses", async () => {
    const [ev] = await db.insert(recallEvents).values({ source: "fda_ires", sourceEventId: "82018", firm: "Hill's Pet Nutrition Inc", raw: {} }).returning();
    const [p] = await db
      .insert(recallProducts)
      .values({ eventId: ev!.id, rowKey: "fda_ires:82018:V-0015-2020", recallNumber: "V-0015-2020", productDescription: "Hill's Prescription Diet, Digestive Care", raw: {} })
      .returning();
    const [a, b] = await db
      .insert(reviewItems)
      .values([
        { productId: p!.id, reason: "unmatched" },
        { eventId: ev!.id, reason: "unclassified" },
      ])
      .returning();

    const open = await listReviewItems(db);
    expect(open.map((r) => r.id)).toEqual([a!.id, b!.id]);
    expect(open[0]?.sourceEventId).toBe("82018");

    await expect(resolveReviewItem(db, { id: a!.id, reviewer: "t", brandId: "nope" })).rejects.toThrow(/not in the catalog/);
    await resolveReviewItem(db, { id: a!.id, reviewer: "t", brandId: "hills", lineId: "hills/prescription-diet" });
    const m = await db.select().from(recallMatches);
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ brandId: "hills", lineId: "hills/prescription-diet", level: "line", method: "manual" });

    await dismissReviewItem(db, b!.id, "not pet food");
    expect(await listReviewItems(db)).toHaveLength(0);
    const detail = await getReviewItem(db, a!.id);
    expect(detail?.item.status).toBe("resolved");
    expect(detail?.event?.sourceEventId).toBe("82018");
  });
});
