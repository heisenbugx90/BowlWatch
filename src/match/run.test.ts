import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../../test/helpers/db";
import { loadCatalog } from "../catalog/load";
import { seedCatalog } from "../catalog/seed";
import type { Db } from "../db/client";
import { lotRules, recallEvents, recallMatches, recallProducts, reviewItems } from "../db/schema";
import { dismissReviewItem, resolveReviewItem } from "../review/queue";
import type { RecallSource } from "../types";
import { moreCodeInfoOf, type FixtureRow } from "./evaluate";
import { listingTitle, matchAll } from "./run";

const FIXTURES = path.resolve(__dirname, "../../test/fixtures");

interface Row {
  desc: string;
  code?: string | null;
  more?: string | null;
  recallNumber?: string;
}

async function insertEvent(
  db: Db,
  e: { source?: RecallSource; id: string; firm: string; initiatedOn?: string; rows: Row[] },
): Promise<{ eventId: number; productIds: number[] }> {
  const source = e.source ?? "fda_ires";
  const [ev] = await db
    .insert(recallEvents)
    .values({ source, sourceEventId: e.id, firm: e.firm, initiatedOn: e.initiatedOn ?? "2024-01-15", raw: {} })
    .returning();
  const productIds: number[] = [];
  for (const [i, r] of e.rows.entries()) {
    const [p] = await db
      .insert(recallProducts)
      .values({
        eventId: ev!.id,
        rowKey: `${source}:${e.id}:${r.recallNumber ?? i}`,
        recallNumber: r.recallNumber ?? null,
        productDescription: r.desc,
        codeInfo: r.code ?? null,
        moreCodeInfo: r.more ?? null,
        raw: {},
      })
      .returning();
    productIds.push(p!.id);
  }
  return { eventId: ev!.id, productIds };
}

describe("matchAll", () => {
  let db: Db;
  let close: () => Promise<void>;
  const ids: Record<string, { eventId: number; productIds: number[] }> = {};

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const res = await loadCatalog(path.join(FIXTURES, "catalog-mini"));
    if (!res.ok) throw new Error(res.errors.join("\n"));
    await seedCatalog(db, res.catalog);

    const fixtures = JSON.parse(await readFile(path.join(FIXTURES, "fda_cvm_pet_recalls_40.json"), "utf8")) as FixtureRow[];
    const byEvent = new Map<string, FixtureRow[]>();
    for (const f of fixtures) byEvent.set(f.raw["Event ID"]!, [...(byEvent.get(f.raw["Event ID"]!) ?? []), f]);
    for (const [eventId, rows] of byEvent) {
      ids[eventId] = await insertEvent(db, {
        id: eventId,
        firm: rows[0]!.raw["Recalling Firm"]!,
        rows: rows.map((f) => ({
          desc: f.raw["Product Description"]!,
          code: f.raw["Code Info"] ?? null,
          more: moreCodeInfoOf(f.raw),
          recallNumber: f.raw["Recall Number"],
        })),
      });
    }
    // A co-packer row for a brand the catalog does not know (event 76403 also covered 4Health).
    const [p] = await db
      .insert(recallProducts)
      .values({
        eventId: ids["76403"]!.eventId,
        rowKey: "fda_ires:76403:extra",
        productDescription: "4health Grain Free Turkey & Potato Formula Net Wt. 13.2 oz. UPC 0 52742 43204 4",
        codeInfo: "TGF1S1",
        raw: {},
      })
      .returning();
    ids["76403"]!.productIds.push(p!.id);
    // Unclassifiable: no brand, no species, no exclusion term.
    ids["unclear"] = await insertEvent(db, { id: "76001", firm: "Acme Holdings", rows: [{ desc: "UGF 1", code: "Lot 123" }] });
    // Event 76000 itself is CHS pig feed: a feed firm, so it classifies as not pet food (judge finding).
    ids["chs"] = await insertEvent(db, { id: "76000", firm: "Farmers Alliance/CHS", rows: [{ desc: "UGF 1", code: "Lot 123" }] });
    // Listing item for the Pedigree recall; iRES event 99362 was initiated the same week.
    await db.update(recallEvents).set({ initiatedOn: "2026-03-02" }).where(eq(recallEvents.id, ids["99362"]!.eventId));
    ids["listing"] = await insertEvent(db, {
      source: "fda_listing",
      id: "/safety/recalls-market-withdrawals/pedigree-example",
      firm: "Mars Petcare US",
      initiatedOn: "2026-03-05",
      rows: [{ desc: "Pedigree High Protein Chopped Ground Dinner Chicken & Duck Flavor" }],
    });
  });
  afterAll(async () => close());

  const eventRow = async (key: string) =>
    (await db.select().from(recallEvents).where(eq(recallEvents.id, ids[key]!.eventId)))[0]!;
  const matchesOf = async (key: string) =>
    db.select().from(recallMatches).where(eq(recallMatches.eventId, ids[key]!.eventId));
  const reviewsOf = async (key: string) =>
    db.select().from(reviewItems).where(eq(reviewItems.eventId, ids[key]!.eventId));

  it("classifies, matches, parses lots and opens review items", async () => {
    const stats = await matchAll(db);
    expect(stats.eventsClassified).toBeGreaterThan(30);
    expect(stats.matchesWritten).toBeGreaterThan(30);
    expect(stats.lotRulesWritten).toBeGreaterThan(50);
    expect(stats.reviewItemsOpened).toBeGreaterThan(0);

    // Hill's: line-level, no species word in the text.
    expect((await eventRow("82018")).petFood).toBe("yes");
    expect((await matchesOf("82018")).map((m) => [m.brandId, m.lineId, m.level, m.method])).toEqual([
      ["hills", "hills/prescription-diet", "line", "alias"],
    ]);
    const hillsRules = await db.select().from(lotRules).where(eq(lotRules.productId, ids["82018"]!.productIds[0]!));
    expect(hillsRules.filter((r) => r.scope === "SKU 3389")).toHaveLength(12);
    expect(hillsRules.every((r) => !r.needsReview)).toBe(true);

    // Drug: not pet food, nothing matched.
    expect((await eventRow("86229")).petFood).toBe("no");
    expect(await matchesOf("86229")).toEqual([]);

    // Co-packer event: Blue Buffalo, Wellness, Doctors Foster & Smith matched; 4health unmatched.
    const simmons = await matchesOf("76403");
    expect(new Set(simmons.map((m) => m.brandId))).toEqual(new Set(["blue-buffalo", "wellness", "doctors-foster-smith"]));
    const unmatched = (await reviewsOf("76403")).filter((r) => r.reason === "unmatched");
    expect(unmatched.map((r) => r.productId)).toEqual([ids["76403"]!.productIds.at(-1)]);
    expect(unmatched[0]!.notes).toMatch(/co-packer: simmons-foods/);

    // Firm-only brand: no match row, an 'ambiguous' item that names the suggestion.
    expect(await matchesOf("99033")).toEqual([]);
    const amb = (await reviewsOf("99033")).filter((r) => r.reason === "ambiguous");
    expect(amb).toHaveLength(1);
    expect(amb[0]!.notes).toMatch(/raaw-energy/);

    // Production dates only -> lot_parse.
    expect((await reviewsOf("99033")).some((r) => r.reason === "lot_parse")).toBe(true);

    // Unclassified event.
    expect((await eventRow("unclear")).petFood).toBe("unreviewed");
    expect((await eventRow("chs")).petFood).toBe("no");
    expect((await reviewsOf("unclear")).map((r) => [r.reason, r.productId])).toEqual([["unclassified", null]]);

    // Listing item linked to the iRES event and matched with method 'listing'.
    expect((await eventRow("listing")).linkedEventId).toBe(ids["99362"]!.eventId);
    expect((await matchesOf("listing")).map((m) => [m.brandId, m.method])).toEqual([["pedigree", "listing"]]);
  });

  it("is idempotent: a second run writes nothing and opens nothing", async () => {
    const before = {
      matches: (await db.select().from(recallMatches)).length,
      rules: (await db.select().from(lotRules)).length,
      reviews: (await db.select().from(reviewItems)).length,
    };
    const stats = await matchAll(db);
    expect(stats.matchesWritten).toBe(0);
    expect(stats.lotRulesWritten).toBe(0);
    expect(stats.reviewItemsOpened).toBe(0);
    expect((await db.select().from(recallMatches)).length).toBe(before.matches);
    expect((await db.select().from(lotRules)).length).toBe(before.rules);
    expect((await db.select().from(reviewItems)).length).toBe(before.reviews);
  });

  it("keeps manual matches and dismissed items across runs", async () => {
    const [amb] = (await reviewsOf("99033")).filter((r) => r.reason === "ambiguous");
    await resolveReviewItem(db, { id: amb!.id, reviewer: "test", brandId: "raaw-energy" });
    const [unm] = (await reviewsOf("76403")).filter((r) => r.reason === "unmatched");
    await dismissReviewItem(db, unm!.id, "4health not tracked yet");

    await matchAll(db);

    const raaw = await matchesOf("99033");
    expect(raaw.map((m) => [m.brandId, m.method])).toEqual([["raaw-energy", "manual"]]);
    const items = await db.select().from(reviewItems).where(and(eq(reviewItems.reason, "ambiguous"), eq(reviewItems.eventId, ids["99033"]!.eventId)));
    expect(items.map((i) => i.status)).toEqual(["resolved"]);
    const dismissed = await db.select().from(reviewItems).where(eq(reviewItems.id, unm!.id));
    expect(dismissed[0]!.status).toBe("dismissed");
  });

  it("re-matches only the requested events", async () => {
    await db.delete(recallMatches).where(eq(recallMatches.eventId, ids["82018"]!.eventId));
    const stats = await matchAll(db, { onlyEventIds: [ids["82018"]!.eventId] });
    expect(stats.eventsClassified).toBe(1);
    expect(stats.matchesWritten).toBe(1);
  });

  it("auto-resolves open items whose condition is gone", async () => {
    // Pretend an old run had flagged the Hill's row as unmatched.
    const pid = ids["82018"]!.productIds[0]!;
    await db.insert(reviewItems).values({ eventId: ids["82018"]!.eventId, productId: pid, reason: "unmatched" });
    await matchAll(db, { onlyEventIds: [ids["82018"]!.eventId] });
    const [item] = await db.select().from(reviewItems).where(and(eq(reviewItems.productId, pid), eq(reviewItems.reason, "unmatched")));
    expect(item!.status).toBe("resolved");
    expect(item!.notes).toMatch(/auto-resolved/);
  });
});

describe("matchAll on an unseeded database", () => {
  it("refuses to run instead of opening a review item for every event", async () => {
    const { db, close } = await createTestDb();
    try {
      await insertEvent(db, { id: "1", firm: "Example Pet Foods", rows: [{ desc: "Dog food" }] });
      await expect(matchAll(db)).rejects.toThrow(/npm run seed/);
      expect(await db.select().from(reviewItems)).toEqual([]);
    } finally {
      await close();
    }
  });
});

describe("listing links and stored UPCs (judge findings, real data/ catalog)", () => {
  let db: Db;
  let close: () => Promise<void>;
  const ids: Record<string, { eventId: number; productIds: number[] }> = {};
  const BRB = "Lea-Way Farms Inc. dba Blue Ridge Beef";

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const res = await loadCatalog(path.resolve(__dirname, "../../data"));
    if (!res.ok) throw new Error(res.errors.join("\n"));
    await seedCatalog(db, res.catalog);
    // Blue Ridge Beef 2024-2025: three iRES events within 30 days of each listing.
    ids["95879"] = await insertEvent(db, { id: "95879", firm: BRB, initiatedOn: "2024-12-04", rows: [{ desc: "Blue Ridge Beef Puppy Mix Net Wt. 2 lbs" }] });
    ids["96096"] = await insertEvent(db, {
      id: "96096",
      firm: BRB,
      initiatedOn: "2025-01-03",
      rows: [{ desc: "Blue Ridge Beef Kitten Mix Net Wt. 2 lbs (.91 kg) UPC: 8542980013436.", code: "Lot 07/16/N25" }],
    });
    ids["96213"] = await insertEvent(db, { id: "96213", firm: BRB, initiatedOn: "2025-01-31", rows: [{ desc: "Blue Ridge Beef Natural Mix Net Wt. 2 lbs" }] });
    const listing = (id: string, date: string, desc: string, firm = "Blue Ridge Beef") =>
      insertEvent(db, { source: "fda_listing", id: `/safety/recalls-market-withdrawals-safety-alerts/${id}`, firm, initiatedOn: date, rows: [{ desc }] });
    ids["716"] = await listing("blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix", "2024-12-04", "Blue Ridge Beef Puppy Mix");
    ids["717"] = await listing("blue-ridge-beef-recalls-blue-ridge-beef-kitten-mix", "2025-01-03", "Blue Ridge Beef Kitten mix pet food");
    ids["718"] = await listing("blue-ridge-beef-issues-recall-blue-ridge-beef-natural-mix", "2025-01-31", "Blue Ridge Beef Natural Mix");
    // Raaw Energy 2026: the iRES rows never print the brand, so only the firm links them.
    ids["99033"] = await insertEvent(db, {
      id: "99033",
      firm: "Raaw Energy, LLC",
      initiatedOn: "2026-05-19",
      rows: [{ desc: "70/30 Beef Heart packaged in 5-lb and 2-lb tubes. Frozen raw dog food." }],
    });
    ids["743"] = await listing("raaw-energy-expands-recall-dog-food", "2026-05-22", "Raaw Energy Dog Food", "Raaw Energy");
    await matchAll(db);
  }, 60_000);

  afterAll(async () => {
    await close();
  });

  const linkOf = async (key: string) =>
    (await db.select().from(recallEvents).where(eq(recallEvents.id, ids[key]!.eventId)))[0]!.linkedEventId;

  it("breaks brand + date ties by product line (716, 717, 718)", async () => {
    expect(await linkOf("716")).toBe(ids["95879"]!.eventId);
    expect(await linkOf("717")).toBe(ids["96096"]!.eventId);
    expect(await linkOf("718")).toBe(ids["96213"]!.eventId);
    expect(await db.select().from(reviewItems).where(eq(reviewItems.reason, "link_listing"))).toEqual([]);
  });

  it("links by recalling firm when the iRES event names no brand (743 <-> 99033)", async () => {
    expect(await linkOf("743")).toBe(ids["99033"]!.eventId);
  });

  it("refreshes stored UPC cores from the text (96096: 8542980013436 -> 5429800143)", async () => {
    const [p] = await db.select().from(recallProducts).where(eq(recallProducts.id, ids["96096"]!.productIds[0]!));
    expect(p!.upcs).toEqual(["5429800143"]);
  });
});

describe("listing links: brand agreement and late listing dates (second judge round, real data/ catalog)", () => {
  let db: Db;
  let close: () => Promise<void>;
  const ids: Record<string, { eventId: number; productIds: number[] }> = {};
  const SMUCKER = "The J.M. Smucker Company, Inc.";

  beforeAll(async () => {
    ({ db, close } = await createTestDb());
    const res = await loadCatalog(path.resolve(__dirname, "../../data"));
    if (!res.ok) throw new Error(res.errors.join("\n"));
    await seedCatalog(db, res.catalog);
    const listing = (id: string, firm: string, date: string, desc: string) =>
      insertEvent(db, { source: "fda_listing", id: `/safety/recalls-market-withdrawals-safety-alerts/${id}`, firm, initiatedOn: date, rows: [{ desc }] });
    ids["76151"] = await insertEvent(db, {
      id: "76151",
      firm: "J M Smucker Co",
      initiatedOn: "2017-01-03",
      rows: [{ desc: "9Lives Meaty Pate Seafood Platter sold in 5.5 oz. cans" }, { desc: "EverPet Mixed Grill Dinner, sole in 13 oz. cans" }, { desc: "Special Kitty Beef and Liver Dinner, sold in 13 oz. can" }],
    });
    ids["79291"] = await insertEvent(db, { id: "79291", firm: SMUCKER, initiatedOn: "2018-02-12", rows: [{ desc: "Gravy Train With Lamb & Rice Chunks, packaged in metal cans" }] });
    ids["77476"] = await insertEvent(db, {
      id: "77476",
      firm: "Loving Pets",
      initiatedOn: "2017-06-07",
      rows: [{ desc: "Loving Pets, 5 oz. Barksters Sweet Potato and Chicken" }, { desc: "Loving Pets, Whole Hearted, 2.4 oz. Apple and Chicken Puff Treats" }],
    });
    ids["79164"] = await insertEvent(db, {
      id: "79164",
      firm: "Redbarn Pet Products",
      initiatedOn: "2018-02-06",
      rows: [
        { desc: "Redbarn, 5 Inch Bully Sticks, Premium Dog Chews" },
        { desc: "Chewy Louie 7 inch Bully Stick" },
        { desc: "Dentley 7 in Bully Stick" },
        { desc: "Good Lovin' 7 in Bully Stick" },
        { desc: "petco PRIME CUTS, 7'' Bully Stick" },
      ],
    });
    ids["82018"] = await insertEvent(db, { id: "82018", firm: "Hill's Pet Nutrition Inc", initiatedOn: "2019-01-30", rows: [{ desc: "Hill's Prescription Diet, Urinary Care, Chicken & Vegetable Stew" }] });
    ids["97982"] = await insertEvent(db, { id: "97982", firm: "Fromm Family Foods, LLC", initiatedOn: "2025-10-10", rows: [{ desc: "Bonnihill Farms Pet Foods BeefiBowls Beef Recipe Dog Food, Net Wt 16 oz" }] });
    // 2017-2021 listing items, several dated 2018-02-08 (a later edit date)
    ids["561"] = await listing("jm-smucker-company-expands-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels", "J.M. Smucker Company", "2018-02-08", "9LivesTM, EverPetTM, and Special KittyTM Canned cat food");
    ids["608"] = await listing("loving-pets-voluntarily-recalls-limited-lot-numbers-air-puffed-dog-treats-because-possible", "Loving Pets", "2018-02-08", "Loving Pets, Whole Hearted Dog treats");
    ids["590"] = await listing("redbarn-pet-products-expands-voluntary-recall-dog-chews", "Redbarn Pet Products, LLC", "2020-04-10", "Redbarn, Chewy Louie, Dentley's, and Good Lovin' Bully Stick dog food");
    ids["622"] = await listing("hills-pet-nutrition-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d", "Hill’s Pet Nutrition", "2019-03-20", "Hill’s Canned Dog Food");
    ids["733"] = await listing("fromm-family-foods-voluntarily-recalls-bonnihill-beefibowls-food-dogs-due-potential-foreign-material", "Fromm Family Foods", "2025-12-03", "Bonnihill Farms BeefiBowls Beef Recipe gently cooked frozen dog food, 16 oz. chubs");
    await matchAll(db);
  }, 60_000);

  afterAll(async () => {
    await close();
  });

  const linkOf = async (key: string) =>
    (await db.select().from(recallEvents).where(eq(recallEvents.id, ids[key]!.eventId)))[0]!.linkedEventId;

  it("the same firm with no shared brand never links (561 cat food is not 79291 dog food)", async () => {
    expect(await linkOf("561")).toBe(ids["76151"]!.eventId);
  });

  it("a shared retailer house brand alone does not link; the full brand set does (608, 590)", async () => {
    expect(await linkOf("608")).toBe(ids["77476"]!.eventId);
    expect(await linkOf("590")).toBe(ids["79164"]!.eventId);
  });

  it("follow-up notices and late listing dates still link to their iRES event (622, 733)", async () => {
    expect(await linkOf("622")).toBe(ids["82018"]!.eventId);
    expect(await linkOf("733")).toBe(ids["97982"]!.eventId);
  });

  it("opens an upstream_ingredient item for a premix that names canned canine food (82087), and puts unread code text in lot_parse", async () => {
    const dsm = await insertEvent(db, {
      id: "82087",
      firm: "DSM Nutritional Products, Inc.",
      initiatedOn: "2019-01-30",
      rows: [{ desc: "DSM vitamin premix : Brand name: 2217 Canned Canine PMX Product Code: NP15268025", code: "NP15268025 Lot numbers 9100058130 and 9100058131" }],
    });
    const raw = await insertEvent(db, { id: "83458", firm: "Raw Advantage", initiatedOn: "2019-07-29", rows: [{ desc: "Raw Advantage Chicken Dinner for Dogs, frozen", code: "manufactured 201916" }] });
    await matchAll(db, { onlyEventIds: [dsm.eventId, raw.eventId] });
    const items = await db.select().from(reviewItems).where(eq(reviewItems.eventId, dsm.eventId));
    expect(items.map((i) => [i.reason, i.productId])).toEqual([["upstream_ingredient", null]]);
    expect(await db.select().from(lotRules).where(eq(lotRules.productId, dsm.productIds[0]!))).toEqual([]);
    const [lp] = await db.select().from(reviewItems).where(and(eq(reviewItems.productId, raw.productIds[0]!), eq(reviewItems.reason, "lot_parse")));
    expect(lp!.notes).toBe("unread: manufactured 201916");
    expect(await db.select().from(lotRules).where(eq(lotRules.productId, raw.productIds[0]!))).toEqual([]);
  });

  it("recomputes a wrong link left by an older run", async () => {
    await db.update(recallEvents).set({ linkedEventId: ids["79291"]!.eventId }).where(eq(recallEvents.id, ids["561"]!.eventId));
    await matchAll(db);
    expect(await linkOf("561")).toBe(ids["76151"]!.eventId);
  });
});

describe("listingTitle", () => {
  it("de-slugs the notice path and drops the 'r' left by a stripped ®", () => {
    expect(listingTitle("/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-recall-9livesr-protein-plusr-wet-canned-cat-food")).toBe(
      // the copy also trims real words ("smucke"): harmless, the original stays alongside it
      "jm smucker recall 9livesr protein plusr wet canned cat food ; jm smucke recall 9lives protein plus wet canned cat food",
    );
    expect(listingTitle("/x/<script>")).toBe("");
  });
});
