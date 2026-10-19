/**
 * Regression tests for the validation problems independent judges found in the
 * 2016-2026 historical run (docs/validation/report.md). Each case quotes the real
 * FDA text of the event it comes from. Uses the REAL catalog in data/, so a
 * curation change that undoes a fix fails here.
 *
 * Disputed findings are explained in docs/validation/judge-disputes.md.
 */
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadCatalog } from "@/catalog/load";
import { snapshotFromCatalog } from "@/catalog/snapshot";
import { classifyEvent } from "@/match/classify";
import { buildCatalogIndex, matchProductDetailed, type CatalogIndex, type MatchInput } from "@/match/matcher";
import { listingTitle } from "@/match/run";

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

const cls = (firm: string | null, desc: string[], reason: string | null = null) =>
  classifyEvent({ firm, reason, products: desc.map((d) => ({ productDescription: d, codeInfo: null })) }, index);

describe("brands added to the catalog", () => {
  it.each([
    ["76151", "Dolgen Corp", "EverPet Mixed Grill Dinner, sole in 13 oz. cans with 12 cans per case", "everpet/wet"],
    ["76466", "AGAINST THE GRAIN", "Against the Grain PULLED BEEF with Gravy. Slow Simmered, Grain Free. NET WT. 12 OZ", "against-the-grain/canned"],
    ["77118", "Party Animal Inc.", "Cocolicious Beef and Turkey, Size: 13 ounce cans", "cocolicious/canned"],
    ["77476", "Loving Pets", "Loving Pets, 5 oz. Barksters Sweet Potato and Chicken UPC 842982057005", "loving-pets/barksters"],
    ["79151", "Christofersen Meats Co, Inc.", "Raws for Paws Ground Turkey Food for Pets, packaged in 1 lb. chubs", "raws-for-paws"],
    ["81526", "Elm Pet Foods", "3lb ELM CHICKEN AND CHICKPEA RECIPE - UPC (0-70155-22507-8)", "elm/chicken-and-chickpea"],
    ["81726", "The Kroger Co", "Abound Chicken & Brown Rice Recipe Net Wt 14 lb with UPC 11110-83573", "abound/dry-dog"],
    ["81739", "OMAHA STEAKS", "Real Beef Bone Bone Chews, Net Wt. 12 oz, Omaha Steaks International Inc., Omaha, NE.", "omaha-steaks/bone-chews"],
    ["83570", "Dog Goods USA", 'Non-irradiated, bulk and packaged "Chef Toby Pig Ears"', "chef-toby/pig-ears"],
    ["86475", "REAL PET FOOD COMPANY, LLC", "Billy + Margot Wild Kangaroo + Superfoods Recipe Multiple Protein Sources Net Wt 4 lb", "billy-and-margot/dry-dog"],
    ["86625", "Grassland Beef", "Dr. Siegel's S. A. F. E. Petfood, Ground Beef 70% Lean / 30% Fat Net Wt.: 2 lb", "dr-siegels/raw"],
    ["87420", "Visionary Pet Food", "Visionary Keto Pet Foods, Enlightened Choice; Beef Recipe", "visionary-pet-foods/enlightened-choice"],
    ["88355", "Sunshine Mills, Inc.", "Nuture Farms Deboned Chicken & Brown Rice 15lb bag", "nurture-farms/dry-dog"],
    ["88355", "Sunshine Mills, Inc.", "Elm Naturals Chicken & Rice 40lb bag", "elm/naturals"],
    ["92330", "Ark Naturals Company", "Ark Naturals Brushless Toothpaste Dental Chew 4-in-1 Original Dental Chew", "ark-naturals/dental-chews"],
    ["95835", "Gaines Pet Treats LLC", "Gaines Family Farmstead Chicken Chips Net Wt. 5 oz. (142g).", "gaines-family-farmstead/chicken-chips"],
    ["98006", "Ollie Pets Inc", "Ollie Gently Baked Beef Dish with Sweet Potatoes Net Wt. 4 lb (1.81kg)", "ollie/baked"],
    ["78945", "JustFoodForDogs", "JustFoodForDogs Fish and Sweet Potato; Wild Caught Pacific Cod", "justfoodfordogs/daily-diets"],
    ["85245", "IcelandicPlus LLC", "Capelin Whole Fish Treats, 1.5 oz, 2.5 oz packages", "icelandicplus/whole-fish"],
    ["98983", "Montgomery Meats", "My Pet Carnivore Coarse Ground Whole Goat Net Wt. 2lbs (907 grams).", "my-pet-carnivore/raw"],
    ["99287", "Doggone Raw, LLC", "Bosco's Blend Chicken Doggone Raw Net Weight 2 lbs and 10 lbs Frozen.", "doggone-raw/raw"],
    ["98774", "Revival Animal Health LLC", "Breeder's Edge Foster Care, Puppy Milk Replacer, Provides complete nutrition", "breeders-edge/milk-replacer"],
  ])("iRES %s: %s", (_event, firm, description, expected) => {
    expect(m({ description, firm })).toContain(expected);
  });

  it("names every brand of a multi-brand row (76781 / listing 569 pig ears)", () => {
    // listing 569 (second judge round): the names printed on the bags are brands of their own
    expect(m({ description: "Barnsdale Farms, HoundsTooth and Mac's Choice Brand Pig Ears, individually shrink-wrapped" })).toEqual([
      "barnsdale-farms/pig-ears",
      "houndstooth/pig-ears",
      "macs-choice/pig-ears",
    ]);
    expect(m({ description: "Loving Pets, Whole Hearted, 2.4 oz. Apple and Chicken Puff Treats" })).toContain("petco-brand/whole-hearted");
    expect(m({ description: 'Green Tripe: 7oz plastic bags, Barkworthies-brand; Best-Bully-Sticks-brand', firm: "TDBBS, LLC." })).toEqual(
      expect.arrayContaining(["barkworthies/treats", "best-bully-sticks/treats"]),
    );
  });
});

describe("short aliases need a corroborating recalling firm", () => {
  it.each([
    ["listing 578", "Smokehouse Pet Products, Inc.", "Smokehouse Dog treats", "smokehouse"],
    ["listing 629", "Nestle Purina PetCare Company", "Muse Wet Cat Food", "muse"],
    ["listing 624", "Lidl US", "Orlando Chicken and Chickpea dog food", "orlando"],
    ["listing 713", "Lystn, LLC. d.b.a. ANSWERS", "ANSWERS Beef and Chicken Dog Foods", "answers"],
    ["listing 657", "Go Raw, LLC", "Quest Beef Cat Food", "quest-cat-food"],
    ["listing 728", "Viva Raw", "Viva Ground Beef for Dogs and Ground Chicken for Dogs and Cats", "viva-raw"],
    ["iRES 80942", "Bravo Packing, Inc.", 'Ground frozen dog food packaged in 2-pound bags, labeled in part, "PERFORMANCE DOG FOOD"', "performance-dog"],
    ["iRES 78676", "Arrow Reliance Inc", "Natural Selections Chicken with Organic Vegetables Meals for Dogs", "darwins/natural-selections"],
    ["iRES 85961", "The J.M. Smucker Company, Inc.", "Ultra Premium Chicken and Liver Pate Formula in a 5.5 oz. metal can", "natural-balance/original-ultra"],
  ])("%s", (_where, firm, description, expected) => {
    const got = m({ description, firm });
    expect(got.some((x) => x === expected || x.startsWith(`${expected}/`))).toBe(true);
  });

  it("Sunshine Mills listings name every bare brand word (612, 671, 673, 689)", () => {
    const firm = "Sunshine Mills, Inc.";
    expect(m({ description: "Evolve, Sportsman's Pride, and Triumph Dry Dog Food", firm }).map((x) => x.split("/")[0])).toEqual(
      expect.arrayContaining(["evolve", "sportsmans-pride", "triumph"]),
    );
    expect(m({ description: "Champ, Field Trial, Good Dog, and Others Pet Food", firm })).toEqual(["champ", "field-trial", "good-dog"]);
    expect(m({ description: "Family Pet, Heartland Farms, Paws Happy Life Dog Food", firm })).toContain("family-pet");
    expect(m({ description: "Triumph, Evolve, Nature Farms, Elm and others Dog Food", firm })).toEqual(
      expect.arrayContaining(["triumph", "evolve", "nurture-farms", "elm"]),
    );
  });

  it("Meridian in the Midwestern multi-brand row (fixture V-0104-2021)", () => {
    expect(m({ description: "Certain dog and cat food brands including CanineX, Pro Pac, Sportmix and Meridian", firm: "MIdwestern Pet Foods Inc." })).toContain(
      "meridian",
    );
  });

  it("without the firm, a short alias is not a brand", () => {
    expect(m({ description: "Muse Wet Cat Food" })).toEqual([]);
    expect(m({ description: "FRM Gold Select High Performance Dog Food 50lb bag", firm: "Sunshine Mills, Inc." })).not.toContain("performance-dog");
    expect(m({ description: "3lb ELM CHICKEN Recipe", firm: "Some Other Firm" })).not.toContain("elm");
  });

  it("a firm shared by several brands suggests none of them (listing 629 'beneful', listing 617 'luvsome')", () => {
    expect(m({ description: "Wet Cat Food", firm: "Nestle Purina PetCare Co" })).toEqual([]);
    expect(m({ description: "Chicken & Brown Rice Recipe dog food", firm: "The Kroger Co" })).toEqual([]);
  });

  it("listing 722 'Savage Pet' is the Savage Cat brand", () => {
    expect(m({ description: "Savage Pet Cat Food Chicken", firm: "Savage Pet" })).toContain("savage-cat");
  });
});

describe("UPC company prefix plus the owner firm", () => {
  it("iRES 80983 Steve's (691730) and 79164 Redbarn (785184)", () => {
    expect(m({ description: "Raw Frozen Pet Food Turducken Recipe for cats and dogs, packaged in 5 lb bags with UPC 6-91730-15304-5", firm: "STEVE'S REAL FOOD FOR PETS" })).toEqual([
      "steves-real-food/raw-frozen",
    ]);
    // the brand's line names still apply to a row whose brand came from the prefix (second judge round)
    expect(m({ description: "Dog Chew 7'' Bully Stick, 1 Count, UPC 785184207017", firm: "Redbarn Pet Products" })).toEqual(["redbarn/bully-sticks"]);
    // the prefix alone, with another firm, is nothing
    expect(m({ description: "Dog Chew 7'' Bully Stick, 1 Count, UPC 785184207017", firm: "Other Pet Co" })).toEqual([]);
  });
});

describe("line matching", () => {
  it("format cue picks a brand's only line of that format", () => {
    // 76151 V-0103, 79291 V-0058, 97762 P2006/P2007
    expect(m({ description: "Special Kitty Beef and Liver Dinner, sold in 13 oz. can with 12 cans per case" })).toEqual(["special-kitty/wet"]);
    expect(m({ description: "Gravy Train; With T-Bone Flavor Chunks; packaged in metal cans" })).toEqual(["gravy-train/wet"]);
    expect(m({ description: "BellePepper Cats Freeze Dried Chicken Heart Slices Treats for Cats & Dogs. Freeze Dried Chicken Heart Raw treats Kanu Pet" })).toEqual([
      "bellepepper-cats/freeze-dried",
      "kanu-pet/freeze-dried",
    ]);
  });

  it("a brand list shares the trailing product noun (listing 735)", () => {
    expect(m({ description: "Country Vet, Heartland Harvest Dog Biscuits" })).toEqual(["country-vet/biscuits", "heartland-harvest/biscuits"]);
  });

  it("a format word after a labelled line describes that line (99719 Fromm)", () => {
    expect(m({ description: "Fromm Diner Classics Milo's Meatloaf Pate, Net Wt 12.5 oz." })).toEqual(["fromm/diner-classics"]);
    expect(m({ description: "Fromm Pate Turkey Pate Net Wt 12.2 oz." })).toEqual(["fromm/pate"]);
  });

  it.each([
    ["76616 Wellness 2017 pate", "Wellness Chicken & Herring Formula, Natural Food for Cats, Net Wt. 12.5 oz (354g)", "wellness/complete-health"],
    ["79164 Redbarn", "Redbarn 9'' Bully 1-Lb. Redbarn Pet Products, LLC Great Bend Kansas", "redbarn/bully-sticks"],
    ["88031 Sprout", "Sprout Sporting Dog Food 5lb Bag 40lb Bag", "sprout/sporting"],
    ["95340 Answers", "Answers Pet Food Straight Chicken Formula for Dogs Net Wt. 4lb", "answers/straight"],
    ["98446 Quest", "Quest Cat Food Chicken Recipe Frozen. keep frozen", "quest-cat-food/frozen"],
    ["listing 588 Tucker's", "Tucker's 5lb Pork-Bison Box", "tuckers/raw-frozen"],
    ["93333 Victor Select is its own line", "Victor Super Premium Dog Food, Select Beef Meal & Brown Rice Formula", "victor/select"],
    ["listing 567 Evanger's", "Evanger's 12oz Hunk of Beef Dog food", "evangers/hand-packed"],
    ["listing 568 Wellness", "Wellness Beef Topper for Dogs", "wellness/ninety-five-percent"],
  ])("%s", (_name, description, expected) => {
    expect(m({ description })).toEqual([expected]);
  });

  it("the listing title supplies the line (597, 581, 630) and brands (730)", () => {
    const t = (slug: string) => listingTitle(`/safety/recalls-market-withdrawals-safety-alerts/${slug}`);
    expect(m({ description: "TRUDOG Pet food-freezed dried raw beef topper", title: t("trupet-llc-recalls-boost-me-mighty-meaty-beef-topper") })).toEqual([
      "trudog/boost-me",
    ]);
    expect(m({ description: "9Lives Cat food", title: t("jm-smucker-company-issues-voluntary-recall-specific-lots-9livesr-protein-plusr-wet-canned-cat-food") })).toEqual([
      "9lives/protein-plus",
    ]);
    expect(
      m({
        description: "Foodynamics Freeze Dried Pet Treats",
        title: t("correction-foodynamics-recalls-raw-dog-barkery-bellepepper-cats-and-kanu-pets-brand-freeze-dried-pet"),
      }),
    ).toEqual(["bellepepper-cats/freeze-dried", "kanu-pet/freeze-dried", "raw-dog-barkery/freeze-dried"]);
  });

  it("a trademark sign that became 'TM' does not hide the brand (listings 561/564)", () => {
    expect(m({ description: "9LivesTM, EverPetTM, and Special KittyTM Canned cat food" })).toEqual(["9lives", "everpet/wet", "special-kitty/wet"]);
  });
});

describe("pet-food classification", () => {
  it.each([
    ["93131 Hollywood Feed jerky ('feed' is the brand)", "Carolina Prime Pet, Inc.", "Hollywood Feed CAROLINA Made USA FARM RAISED BEEF JERKY NET WEIGHT 5OZ DISTRIBUTED BY HOLLYWOOD FEED, LLC", null],
    ["78945 fish is an ingredient", "JustFoodForDogs", "JustFoodForDogs Fish and Sweet Potato; Wild Caught Pacific Cod; Sweet Potatoes", null],
    ["98983 goat is the protein, tub is packaging", "Montgomery Meats", "My Pet Carnivore Coarse Ground Whole Goat Net Wt. 2lbs. Packaged in a plastic tub. Frozen product.", null],
    ["98774 puppy milk replacer is food", "Revival Animal Health LLC", "Breeder's Edge Foster Care, Puppy Milk Replacer, Provides complete nutrition", null],
    ["listing 749 feline milk replacers", "Revival Animal Health", "Shelter's Choice, Breeder's Edge Feline Milk Replacers", null],
    ["77118 reason says canned dog foods", "Party Animal Inc.", "Some Beef and Turkey, Size: 13 ounce cans", "Party Animal is recalling canned dog foods because of pentobarbital"],
    ["92718 reason says raw pet food", "What The Raw", "Single Dried Sardine packaged in shrink wrap. Individually sold.", "Uneviscerated whole dried sardines used in raw pet food."],
    ["81739 dog chews", "OMAHA STEAKS", "Real Beef Bone Bone Chews, Net Wt. 12 oz", null],
    ["98006 pet firm + food word", "Ollie Pets Inc", "Gently Baked Beef Dish with Sweet Potatoes Net Wt. 4 lb", null],
    ["95835 pet treats firm + chips", "Gaines Pet Treats LLC", "Family Farmstead Chicken Chips Net Wt. 5 oz.", null],
  ])("yes: %s", (_name, firm, desc, reason) => {
    expect(cls(firm, [desc], reason).petFood).toBe("yes");
  });

  it.each([
    ["76000 CHS feed firm", "Farmers Alliance/CHS", "UGF 1"],
    ["80170 pig feed", "Farmers Ranchers Coop Assn", "Western Choice, Pig Grow/Finish 95 PLT, Manufactured for Farmers Coop"],
    ["77952 quail starter", "Ridley USA Inc.", "RFI Quail Starter 0-6 Weeks, Quail Starter, Hubbard Feeds"],
    ["94212 gilt", "Countryside Feed, LLC", "Replacement Gilt 4 + Skycis 18.1, bulk"],
    ["94996 ewes", "Furst-McNess Company", "McNess Ewetopia Lactation QP, for ewes"],
    ["83973 lamb creep", "ADM Alliance Nutrition, Inc.", "11153AE MoorMan's ShowTec Lamb Creep DC, in 50 lb. bag"],
    ["84861 pellet", "Cargill, Inc Corporate Headquarters", "Nutrena, NutreBeef Transition Pellet"],
    ["87415 hedgehog", "Vitakraft Sun Seed Inc", "Vitakraft : VitaSmart Natural Pelleted Diet Hedgehog Food 25 ounce plastic bags"],
    ["79832 sugar glider", "Vitakraft Sun Seed Inc", "Sunseed Vita Prima Exotics Sugar Glider Formula, 28oz bag"],
    ["97983 small animal", "Vitakraft Sun Seed Inc", "Premium Nutrition Menu Small Animal Food Net Wt 2 lb"],
    ["83221 betta", "Farnam Companies Inc.", "Aqueon Betta Food. Daily nutrition for all betta."],
    ["96929 reptile", "Spectrum Brands Pet LLC", "Tetra ReptoMin 3-IN-1 SELECT-A-FOOD Net Wt. 1.56 OZ"],
    ["listing 688 flock", "Manna Pro Products, LLC", "Flock Party Duck treats"],
    ["79022 lab test", "NeuroLogica Corporation", "PT Electrolyte Test 3V"],
    ["90097 device", "bioMerieux, Inc.", "VITEK 2 automated system."],
    ["99688 IV sets", "ICU Medical, Inc.", "IV Sets with drip chambers"],
    ["listing 650 drug", "KRS Global Biotechnology", "KRS Global Biotechnology Animal Sterile Drug Products"],
    ["95788 NDC / w/v", "Blendpack Inc", "Aspen Sodium Salicylate 48.6% w/v, NDC 46066-186-93"],
    ["84354 homeopathic dewormer", "Washington Homeopathic Products, Inc.", "HomeoPet K9 WRM Clear"],
    ["96279 iodine", "Western Chemical Inc.", "Ovadine, 1% Iodine, 1 gallon"],
    ["listing 696 drink bottles", "Bindle Bottle LLC", "Bindle Bottle LLC Bottles"],
  ])("no: %s", (_name, firm, desc) => {
    expect(cls(firm, [desc]).petFood).toBe("no");
  });

  it("calf milk replacer stays excluded; an omnibus notice still covers pet food", () => {
    expect(cls("Some Feed Co", ["Calf Milk Replacer 50 lb"]).petFood).toBe("no");
    expect(cls("Family Dollar, Inc.", ["Numerous brand names Numerous human food, animal (pet) food, medical devices, and drug products"]).petFood).toBe("yes");
  });

  it("a fish-food row inside a pet-food event is excluded on its own (87068 V-0044)", () => {
    const res = cls("Midwestern Pet Foods Chickasha Operation", [
      "Sportmix Premium High Energy Targeted Nutrition for Dogs",
      "Splash Fat Cat Fish Food Floater For All Fresh Water Fish 32% 50 pound bag",
    ]);
    expect(res.petFood).toBe("yes");
    expect(res.excludedRows).toEqual([1]);
  });
});
