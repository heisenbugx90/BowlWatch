/**
 * Regression tests for the second round of judge findings on the 2016-2026 validation run
 * (docs/validation/report.md). Each case quotes the real FDA text of the event named in the test
 * and uses the REAL catalog in data/, so a curation change that undoes a fix fails here.
 * Disputed and partly fixed findings: docs/validation/judge-disputes.md.
 */
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadCatalog } from "@/catalog/load";
import { snapshotFromCatalog } from "@/catalog/snapshot";
import { classifyEvent } from "@/match/classify";
import { buildCatalogIndex, matchProductDetailed, type CatalogIndex, type MatchInput } from "@/match/matcher";
import { dropCopiedUpcs, listingTitle } from "@/match/run";

let index: CatalogIndex;

beforeAll(async () => {
  const res = await loadCatalog(path.resolve(__dirname, "../data"));
  if (!res.ok) throw new Error(res.errors.join("\n"));
  index = buildCatalogIndex(snapshotFromCatalog(res.catalog));
});

/** "brand" or "brand/line" for every strong match; "?" marks a weak (review-only) suggestion. */
function m(input: MatchInput): string[] {
  return matchProductDetailed(input, index)
    .matches.map((x) => `${x.lineId ?? x.brandId}${x.needsReview ? "?" : ""}`)
    .sort();
}
const listing = (slug: string) => listingTitle(`/safety/recalls-market-withdrawals-safety-alerts/${slug}`);
const cls = (firm: string | null, desc: string[], reason: string | null = null, title: string | null = null) =>
  classifyEvent({ firm, reason, title, products: desc.map((d) => ({ productDescription: d, codeInfo: null })) }, index);

describe("classification: not dog or cat food", () => {
  it.each([
    ["78807 fenbendazole gel", "Schlotterbeck & Foss Company", "MediGel FBZ 4 oz. The cups are inside a cardboard box with protection barrier for sterility.", "One lot of product had sub-potent assay results."],
    ["81776 diatomaceous earth", "Earthworks Health", "Diatomaceous Earth packaged in the following ways: 1) Perma-Guard, Fossil Shell Flour, Anti-caking agent, Food Chemical Codex Grade, Weight: 50 lb/22.6 kg", null],
    ["84204 gypsum", "Harrison Gypsum, LLC", "Valu-Fil 650 packaged in 50 lbs. bags 2000 lbs. bulk bags or Approximately 44,000-55,000 lbs. bulk pneumatic tanks", null],
    ["86953 canola meal", "Perdue Agribusiness, LLC", "Organic Canola Meal in Hopper Bottom Trailers", null],
    ["92937 picking stone", "Charles Siegel & Son", "Natural Picking Stone packaged in cardboard box - 620g per stone, 6 stones per box", null],
    ["93365 flax", "Scoular Grain Co", "Milled Brown Flax - MBFG, packaged in 50lb bags and 2000lb totes.", null],
    ["97138 IBC totes", "Enzyme Development Corporation", "Liquipanol T200 3-6960-000. Packaged in 50lb, 20kg,and 25kg HDPE tight heads and 1200kg and 1000kg IBC Totes.", null],
    ["83326 by-product meal", "DaPro, LLC", "Turkey By-Product Meal, SKU 32012. Guaranteed Analysis: Crude Protein minimum 60%. Inedible: Not for Human Consumption.", null],
    ["91393 cat grass", "Wegmans Food Markets, Inc.", "Wegmans Organic Farm & Orchard Cat Grass", null],
    ["92716 probiotics", "Ozona Organics LLC", "OZONA ORGANICS PROBIOTICS FOR DOGS Net Wt. 4 ounces OZONA ORGANICS PROBIOTICS FOR CATS Net Wt. 4 ounces", null],
    ["96442 supplement soft chews", "Petdine, LLC.", "ZP Senior Advanced Probiotics Bites Gut Health Chicken Flavor 90 Soft Chews, 11.1 oz.", null],
  ])("%s", (_name, firm, desc, reason) => {
    expect(cls(firm, [desc], reason).petFood).toBe("no");
  });

  it("listing supplements read the notice title too (698, 751)", () => {
    expect(cls("Ozona Organics, LLC", ["Ozona, Go Healthy Liquid Probiotics for adults and toddlers; Probiotics for cats, dogs, swine, and equine"]).petFood).toBe("no");
    expect(cls("Fi Barking Labs Corp", ["FI Supplements"], null, listing("fi-recalls-supplements-dogs-because-possible-salmonella-contamination")).petFood).toBe("no");
  });

  it("food with a supplement word stays food", () => {
    expect(cls("Some Pet Co", ["Chicken Recipe Dog Food with Probiotics, 30 lb bag"]).petFood).toBe("yes");
  });

  it("an excluded premix that names canned canine food is flagged upstream (82087)", () => {
    const c = cls("DSM Nutritional Products, Inc.", ["DSM vitamin premix : Brand name: 2217 Canned Canine PMX Product Code: NP15268025, net weight: 25 Kg"]);
    expect(c.petFood).toBe("no");
    expect(c.upstream).toHaveLength(1);
    expect(cls("Earthworks Health", ["Diatomaceous Earth, Food Chemical Codex Grade"]).upstream).toEqual([]);
  });
});

describe("brands and lines", () => {
  it("known line UPCs resolve brand-only rows (76403 Wellness 2017 pate)", () => {
    expect(m({ description: "Wellness Chicken Formula Net Wt. 12.5 oz. Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08822-6", firm: "Simmons Foods Inc" })).toEqual([
      "wellness/complete-health",
    ]);
    expect(m({ description: "Wellness Turkey & Salmon Formula Net Wt. 12.5 oz UPC 0-76344-08819-6", firm: "Simmons Foods Inc" })).toEqual(["wellness/complete-health"]);
  });

  it("UPC company prefixes with the owner firm (75919 Blue Ridge, 86854 TDBBS)", () => {
    expect(m({ description: "Turkey with bone, UPC Code 854298001887", codeInfo: "Code Lot #103, Mfg. Date: 1276", firm: "blue ridge beef" })).toEqual(["blue-ridge-beef"]);
    expect(m({ description: "Natural Cow Ears 12-pack (Chewy.com) 12-pack , Poly (plastic) bag", codeInfo: 'Chewy.com " Natural Cow Ear 12 Pack " UPC: 840139120251', firm: "TDBBS, LLC." })).toEqual([
      "best-bully-sticks",
    ]);
  });

  it("rawhide / beefhide chews of one store brand share its chew line (77441)", () => {
    expect(m({ description: "yourpet Natural Beefhide Bones 2 count", firm: "Spectrum Brands Inc" })).toEqual(["yourpet/beefhide"]);
    expect(m({ description: "Pet Pride Rawhide Ring 1 count", firm: "Spectrum Brands Inc" })).toEqual(["pet-pride/beefhide"]);
    expect(m({ description: "Pet Pride Chicken Flavor Basted Chips 1 lb", firm: "Spectrum Brands Inc" })).toEqual(["pet-pride/beefhide"]);
    expect(m({ description: "Companion Natural Rawhide Rolls 10 count", firm: "Spectrum Brands Inc" })).toEqual(["companion-ahold/chews"]);
  });

  it("line names match singular or plural (79164 'Bully Stick', listing 748 'diner classic', listing 749 'Milk Replacers')", () => {
    expect(m({ description: "Dentley 7 in Bully Stick, 1 stick / 7in / Net Wt 0.49 oz (13.9 g) UPC 737257479852", firm: "Redbarn Pet Products" })).toEqual(["dentleys/bully-sticks"]);
    expect(
      m({
        description: "Fromm Fromm wet canned dog food",
        title: listing("fromm-family-foods-voluntarily-recalls-turkey-pate-wet-food-dogs-and-diner-classic-milos-meatloaf"),
        firm: "Fromm Family Foods LLC",
      }),
    ).toEqual(["fromm/diner-classics", "fromm/pate"]);
    expect(m({ description: "Shelter’s Choice, Breeder’s Edge Feline Milk Replacers", firm: "Revival Animal Health" })).toEqual([
      "breeders-edge/milk-replacer",
      "shelters-choice/milk-replacer",
    ]);
  });

  it("listing titles keep real words that end in 'r'", () => {
    expect(listing("x-recalls-diner-classic-milos-meatloaf")).toBe("x recalls diner classic milos meatloaf");
  });

  it("Kibbles 'n Bits Chef's Choice Homestyle is its own line; a variety pack names both (79291)", () => {
    expect(m({ description: "Kibbles 'n Bits brand Dog Food; Chef's Choice Homestyle Tender Slices With Real Beef, Chicken & Vegetables in Gravy; packaged in metal cans" })).toEqual([
      "kibbles-n-bits/homestyle",
    ]);
    expect(
      m({ description: "Kibbles 'n Bits 12 Can Variety Pack; Chef's Choice Bistro, containing 4 cans of Hearty Cuts; Chef's Choice Homestyle, 4 cans of Meatballs & Pasta Dinner" }),
    ).toEqual(["kibbles-n-bits/bistro", "kibbles-n-bits/homestyle"]);
  });

  it("a brand's only raw line from 'Keep Frozen' / 'Frozen product' (83272 Texas Tripe, 98983 The Butcher's Hound)", () => {
    expect(m({ description: "Texas Tripe Turkey Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case", firm: "Texas Tripe" })).toEqual(["texas-tripe/raw"]);
    expect(m({ description: "The Butcher's Hound Ground Whole Chicken, 3 lb Net Wt. 3lbs (1361 grams). Packaged in a 3 lb chub. Frozen product.", firm: "Montgomery Meats" })).toEqual([
      "the-butchers-hound/raw",
    ]);
    // never for freeze-dried text
    expect(m({ description: "Texas Tripe freeze dried raw dog treats" })).toEqual(["texas-tripe"]);
  });

  it("Sprout Bites & Bones is not the Sporting line (86569)", () => {
    expect(m({ description: "Sprout brand Bites & Bones in 40 lb. bags. UPC: 7015505091", firm: "SUNSHINE MILLS INC" })).toEqual(["sprout/bites-and-bones"]);
  });

  it("bare 'Grain Free' is a descriptor, not the NutriSource Grain Free line (88842)", () => {
    expect(m({ description: "Nutri Source Pure Vita limited Ingredient Salmon Entree. Single Source Animal Protein. Grain Free Pate-Style Dog Food." })).toEqual(["nutrisource/pure-vita"]);
  });

  it("a brand named alone in a brand list is matched brand-wide next to its named lines (87625)", () => {
    expect(
      m({
        description:
          "Certain dog and cat food brands including CanineX, Earthborn Holistic, Venture, Unrefined, Sportmix Wholesomes, Pro Pac, Pro Pac Ultimates, Sportstrail, Sportmix and Meridian; the products are packaged in paper or plastic bags",
        firm: "MIdwestern Pet Foods Inc.",
      }),
    ).toEqual([
      "canine-x",
      "earthborn-holistic",
      "earthborn-holistic/unrefined",
      "earthborn-holistic/venture",
      "meridian",
      "pro-pac",
      "pro-pac/ultimates",
      "sportmix",
      "sportmix/wholesomes",
      "sportstrail",
    ]);
    const wide = matchProductDetailed(
      { description: "Certain dog and cat food brands including CanineX, Pro Pac, Pro Pac Ultimates, Sportstrail", firm: "MIdwestern Pet Foods Inc." },
      index,
    ).matches.find((x) => x.brandId === "pro-pac" && !x.lineId);
    expect(wide?.detail).toMatch(/^brand-wide/);
    // a brand printed as the last item of its own row is not a brand list
    expect(m({ description: "Beef For Dogs, 100% Pure Natural Pet Food, Net Wt. 2 lbs., Blue Ridge Beef" })).toEqual(["blue-ridge-beef/beef-for-dogs"]);
  });

  it("Nature's Own Pet Chews (97743, listing 729)", () => {
    expect(m({ description: "Nature's Own Pet Chews Bully Bites 1 pound Net Wt. 16oz (454g) UPC: 739598900750." })).toEqual(["natures-own-pet-chews/bully-bites"]);
    expect(m({ description: "Nature's Own Bread, 20 oz" })).toEqual([]);
  });

  it("EuroCan's pig-ear names are brands; no generic pig-ear line (listing 569)", () => {
    expect(m({ description: "Barnsdale Farms®, HoundsTooth® and Mac's Choice® Dog treat- Pig Ears" })).toEqual([
      "barnsdale-farms/pig-ears",
      "houndstooth/pig-ears",
      "macs-choice/pig-ears",
    ]);
    expect(m({ description: "EuroCan Pig Ears" })).toEqual(["eurocan"]);
  });

  it("Bravo Packing's own products are not Performance Dog lines (listings 678, 680; iRES 80942)", () => {
    expect(m({ description: "Bravo Packing, Inc. Ground Beef and Performance Dog, frozen raw pet food", firm: "Bravo Packing, Inc." })).toEqual([
      "bravo-packing-house/ground-beef",
      "performance-dog/performance-dog",
    ]);
    expect(m({ description: "Bravo Packing, Inc. Pet food: Performance Dog, beef, green tripe, and bone", firm: "Bravo Packing, Inc." })).toEqual([
      "bravo-packing-house/bones",
      "bravo-packing-house/green-tripe",
      "bravo-packing-house/ground-beef",
      "performance-dog/performance-dog",
    ]);
    expect(m({ description: 'Ground frozen dog food packaged in 2-pound bags, labeled in part, "PERFORMANCE DOG FOOD".', firm: "Bravo Packing, Inc." })).toEqual([
      "performance-dog/performance-dog",
    ]);
  });
});

describe("a UPC copied onto another brand's row (76403 V-0123)", () => {
  it("is dropped from the row whose brand does not own the UPC's company prefix", () => {
    const upcs = new Map([
      [1, ["3725726116"]], // Grreat Choice (PetSmart prefix 737257)
      [2, ["3725726116", "5193346489"]], // Cat Cuisine, copied the Grreat Choice UPC
    ]);
    dropCopiedUpcs(upcs, new Map([[1, new Set(["grreat-choice"])], [2, new Set(["cat-cuisine"])]]), index);
    expect(upcs.get(1)).toEqual(["3725726116"]);
    expect(upcs.get(2)).toEqual(["5193346489"]);
  });
  it("stays when no brand's prefix decides it", () => {
    const upcs = new Map([
      [1, ["1111111111"]],
      [2, ["1111111111"]],
    ]);
    dropCopiedUpcs(upcs, new Map([[1, new Set(["grreat-choice"])], [2, new Set(["cat-cuisine"])]]), index);
    expect(upcs.get(2)).toEqual(["1111111111"]);
  });
});
