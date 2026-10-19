import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createTestDb } from "../../test/helpers/db";
import { dbSizeBytes, type Db } from "./client";
import { recallEvents, recallMatches, reviewItems } from "./schema";

describe("db client (PGlite)", () => {
  let db: Db;
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ db, close } = await createTestDb());
  });
  afterAll(async () => close());

  it("applies migrations", async () => {
    const res = (await db.execute(sql`select count(*)::int as n from recall_events`)) as unknown as {
      rows: { n: number }[];
    };
    expect(res.rows[0]?.n).toBe(0);
  });

  it("rejects values outside the enums", async () => {
    await expect(
      db.insert(recallEvents).values({ source: "nope" as never, sourceEventId: "1", raw: {} }),
    ).rejects.toThrow();
  });

  it("treats NULL line/product as equal in the match and review uniqueness", async () => {
    const [ev] = await db
      .insert(recallEvents)
      .values({ source: "fda_ires", sourceEventId: "82018", raw: {} })
      .returning();
    const m = { eventId: ev!.id, brandId: "hills", level: "brand", method: "alias" } as const;
    await db.insert(recallMatches).values(m);
    await expect(db.insert(recallMatches).values(m)).rejects.toThrow();
    await db.insert(reviewItems).values({ eventId: ev!.id, reason: "unmatched" });
    await expect(db.insert(reviewItems).values({ eventId: ev!.id, reason: "unmatched" })).rejects.toThrow();
  });

  it("reports database size", async () => {
    expect(await dbSizeBytes(db)).toBeGreaterThan(0);
  });
});

describe("server version guard", () => {
  it("rejects Postgres 14 and accepts 15+", async () => {
    const { assertServerVersionNum } = await import("./client");
    expect(() => assertServerVersionNum(140012)).toThrow(/Postgres 15\+/);
    expect(() => assertServerVersionNum(NaN)).toThrow();
    expect(() => assertServerVersionNum(150000)).not.toThrow();
    expect(() => assertServerVersionNum(170004)).not.toThrow();
  });
});
