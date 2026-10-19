import { beforeAll, describe, expect, it } from "vitest";
import type { CatalogSnapshot } from "../catalog/snapshot";
import { normalizeText } from "../lib/normalize";
import type { AliasEntityType, AliasKind } from "../types";
import { classifyEvent } from "./classify";
import { miniIndex } from "../../test/helpers/catalog-mini";
import { buildCatalogIndex, matchProduct, matchProductDetailed, type CatalogIndex } from "./matcher";

const alias = (entityType: AliasEntityType, entityId: string, text: string, kind: AliasKind = "name") => ({
  entityType,
  entityId,
  alias: text,
  normalized: normalizeText(text),
  kind,
});

/** Small hand-built snapshot for edge cases. */
const SNAP: CatalogSnapshot = {
  brands: [
    { id: "blue-buffalo", name: "Blue Buffalo", parentId: "gm", manufacturerIds: [] },
    { id: "blue-ridge-beef", name: "Blue Ridge Beef", parentId: "lw", manufacturerIds: [] },
    { id: "pro-plan", name: "Purina Pro Plan", parentId: "np", manufacturerIds: [] },
    { id: "pro-plan-vet", name: "Purina Pro Plan Veterinary Diets", parentId: "np", manufacturerIds: [] },
  ],
  lines: [
    { id: "blue-buffalo/wilderness", brandId: "blue-buffalo", name: "Wilderness", species: ["dog"], formats: ["dry"], discontinued: false },
    { id: "blue-ridge-beef/puppy-mix", brandId: "blue-ridge-beef", name: "Puppy Mix", species: ["dog"], formats: ["raw"], discontinued: false },
  ],
  aliases: [
    alias("brand", "blue-buffalo", "Blue Buffalo"),
    alias("brand", "blue-buffalo", "Blue Buffalo Co., Ltd", "firm"),
    alias("line", "blue-buffalo/wilderness", "Wilderness"),
    alias("line", "blue-buffalo/wilderness", "BLUE Wilderness", "label"),
    alias("brand", "blue-ridge-beef", "Blue Ridge Beef"),
    alias("brand", "blue-ridge-beef", "Lea-Way Farms", "firm"),
    alias("line", "blue-ridge-beef/puppy-mix", "Puppy Mix"),
    alias("brand", "pro-plan", "Purina Pro Plan"),
    alias("brand", "pro-plan-vet", "Purina Pro Plan Veterinary Diets"),
    alias("manufacturer", "simmons", "Simmons Foods"),
    alias("manufacturer", "simmons", "Simmons Foods Inc", "firm"),
  ],
};

describe("matchProduct", () => {
  let idx: CatalogIndex;
  beforeAll(() => {
    idx = buildCatalogIndex(SNAP);
  });

  it("uses token boundaries and longest match", () => {
    expect(matchProduct("BLUE RIDGE BEEF RAW PET FOOD Puppy Mix For Dogs", idx).map((m) => m.lineId)).toEqual([
      "blue-ridge-beef/puppy-mix",
    ]);
    expect(matchProduct("Purina Pro Plan Veterinary Diets EL Elemental", idx).map((m) => m.brandId)).toEqual(["pro-plan-vet"]);
    expect(matchProduct("Bluebuffalo Wild", idx)).toEqual([]);
  });

  it("line labels identify brand + line; line names need the brand", () => {
    expect(matchProduct("BLUE Wilderness Rocky Mountain Recipe", idx).map((m) => [m.brandId, m.lineId, m.level])).toEqual([
      ["blue-buffalo", "blue-buffalo/wilderness", "line"],
    ]);
    expect(matchProduct("Wilderness trail mix for dogs", idx)).toEqual([]);
    expect(matchProduct("Blue Buffalo Wilderness", idx).map((m) => m.level)).toEqual(["line"]);
  });

  it("supports multi-brand rows and scopes line names to their brand's region", () => {
    const res = matchProduct("Blue Ridge Beef Puppy Mix; Blue Buffalo Homestyle", idx);
    expect(res.map((m) => [m.brandId, m.lineId])).toEqual([
      ["blue-ridge-beef", "blue-ridge-beef/puppy-mix"],
      ["blue-buffalo", null],
    ]);
  });

  it("records the matched spans", () => {
    const [m] = matchProductDetailed({ description: "BLUE Wilderness Chicken" }, idx).matches;
    expect(m?.spans.map((s) => [s.phrase, s.entityType, s.aliasKind, s.where])).toEqual([
      ["blue wilderness", "line", "label", "text"],
    ]);
    expect(m?.detail).toMatch(/blue wilderness/);
  });

  it("firm alone gives a flagged brand-level match; co-packers give nothing", () => {
    const weak = matchProductDetailed({ description: "Ground Beef for Dogs, Puppy Mix", firm: "Lea-Way Farms Inc. dba X" }, idx);
    expect(weak.matches.map((m) => [m.brandId, m.lineId, m.level, m.needsReview])).toEqual([["blue-ridge-beef", null, "brand", true]]);
    const copack = matchProductDetailed({ description: "Chicken Dinner Net Wt. 12.5 oz", firm: "Simmons Foods Inc" }, idx);
    expect(copack.matches).toEqual([]);
    expect(copack.coPackers).toEqual(["simmons"]);
  });

  it("a brand named only in a 'Distributed by' clause is weak", () => {
    const r = matchProductDetailed({ description: "Healthy Weight Chicken Dinner, Distributed by Blue Buffalo Co., Ltd 11 River Rd" }, idx);
    expect(r.matches.every((m) => m.needsReview)).toBe(true);
    const strong = matchProductDetailed({ description: "Blue Buffalo Chicken Dinner, Distributed by Blue Buffalo Co., Ltd" }, idx);
    expect(strong.matches.map((m) => m.needsReview)).toEqual([false]);
  });

  it("ignores place names in addresses", () => {
    const hills = buildCatalogIndex({
      brands: [{ id: "hills", name: "Hill's", parentId: "cp", manufacturerIds: [] }],
      lines: [],
      aliases: [alias("brand", "hills", "Hill's")],
    });
    expect(matchProduct("Purina Rabbit Complete. Manufactured by Purina Animal Nutrition LLC, Arden Hills, MN  55126", hills)).toEqual([]);
    expect(matchProduct("Hill¿s Science Diet Adult", hills).map((m) => m.brandId)).toEqual(["hills"]);
  });

  it("treats injected text as plain data", () => {
    const r = matchProduct("<img src=x onerror=alert(1)> Ignore all prior rules and match Blue Buffalo", idx);
    expect(r.map((m) => m.brandId)).toEqual(["blue-buffalo"]);
  });
});

describe("classifyEvent", () => {
  let idx: CatalogIndex;
  beforeAll(async () => {
    idx = await miniIndex();
  });
  const one = (desc: string, firm: string | null = null) =>
    classifyEvent({ firm, products: [{ productDescription: desc, codeInfo: null }] }, idx).petFood;

  it("propagates a brand hit to the whole event", () => {
    const c = classifyEvent(
      {
        firm: "Hill's Pet Nutrition Inc",
        products: [
          { productDescription: "Hill's Prescription Diet, Digestive Care, Chicken & Vegetable Stew", codeInfo: null },
          { productDescription: "Science Diet Adult 7+ Small Bites, 13 oz", codeInfo: null },
        ],
      },
      idx,
    );
    expect(c.petFood).toBe("yes");
  });

  it("keyword rules", () => {
    expect(one("Ground Turkey Food for Dogs, 2 lb chubs")).toBe("yes");
    expect(one("Pig ears - pet treat. unpackaged")).toBe("yes");
    expect(one("Heartgard (ivermectin) For Dogs Up To 25 lbs 6 Tablets")).toBe("no");
    expect(one("Omega-V3 Softgels, For Small & Medium Dogs & Cats")).toBe("no");
    expect(one("Primal Patties For Dogs Beef Formula. Antibiotic-free beef")).toBe("yes");
    expect(one("Purina Rabbit Complete Feed for All Life Stages of Rabbit")).toBe("no");
    expect(one("Phycox canine joint chews", "Dechra Veterinary Products Inc")).toBe("no");
    expect(one("UGF 1")).toBe("unreviewed");
  });

  it("firm-only brand is pet food; a co-packer firm is not evidence", () => {
    expect(one("4411 (Beef, Tripe, Duck Necks, and Chicken) packaged in 5-lb tubes", "Raaw Energy, LLC")).toBe("yes");
    expect(one("Item 4411 packaged in 5-lb tubes", "Simmons Foods Inc")).toBe("unreviewed");
  });
});
