import { describe, expect, it } from "vitest";
import type { LotRule } from "../types";
import { parseDateAt, parseDateList } from "./dates";
import { extractUpcs, hasCleanLotRule, parseLotRules, parseLotRulesDetailed } from "./lots";

const pick = (rules: LotRule[], kind: LotRule["kind"]) => rules.filter((r) => r.kind === kind);
const values = (rules: LotRule[], kind: LotRule["kind"] = "exact") => pick(rules, kind).map((r) => r.value);
const dates = (rules: LotRule[]) =>
  rules.filter((r) => r.kind === "best_by_date" || r.kind === "best_by_range").map((r) => [r.dateFrom, r.dateTo]);

describe("dates", () => {
  it.each([
    ["3/7/2022", "2022-03-07", "2022-03-07"],
    ["10-25-19", "2019-10-25", "2019-10-25"],
    ["9.9.25", "2025-09-09", "2025-09-09"],
    ["11/22//2025", "2025-11-22", "2025-11-22"],
    ["03/ 21/2019", "2019-03-21", "2019-03-21"],
    ["03 April 2021", "2021-04-03", "2021-04-03"],
    ["3/APRIL/2020", "2020-04-03", "2020-04-03"],
    ["02 FEB 19", "2019-02-02", "2019-02-02"],
    ["10-Mar-2022", "2022-03-10", "2022-03-10"],
    ["MAY 06, 2026", "2026-05-06", "2026-05-06"],
    ["Jan 02 2026", "2026-01-02", "2026-01-02"],
    ["Sept 2024", "2024-09-01", "2024-09-30"],
    ["03/2027", "2027-03-01", "2027-03-31"],
    ["11/21", "2021-11-01", "2021-11-30"],
    ["10 2024", "2024-10-01", "2024-10-31"],
    ["10 25 19", "2019-10-25", "2019-10-25"],
  ])("%s", (text, from, to) => {
    const d = parseDateAt(text, 0, true);
    expect(d && [d.from, d.to]).toEqual([from, to]);
  });

  it("compact forms only after a keyword, with ambiguity flagged", () => {
    expect(parseDateAt("032029", 0, false)).toBeNull();
    expect(parseDateAt("032029", 0, true)).toMatchObject({ from: "2029-03-01", to: "2029-03-31", ambiguous: true });
    expect(parseDateAt("090626", 0, true)).toMatchObject({ from: "2026-09-06", ambiguous: false });
    expect(parseDateAt("012729", 0, true)).toMatchObject({ from: "2029-01-27", ambiguous: false });
  });

  it("rejects impossible dates", () => {
    expect(parseDateAt("13/45/2020", 0)).toBeNull();
    expect(parseDateAt("2/30/2021", 0)).toBeNull();
  });

  it("lists and ranges", () => {
    expect(parseDateList("10 25 19 thru  02 09 2021", 0)?.spans.map((s) => [s.from, s.to])).toEqual([["2019-10-25", "2021-02-09"]]);
    expect(parseDateList("between 6/1/2019 and 5/31/2020", 0)?.spans.map((s) => [s.from, s.to])).toEqual([["2019-06-01", "2020-05-31"]]);
    expect(parseDateList("08/03/2019 & 08/04/2019", 0)?.spans).toHaveLength(2);
    expect(parseDateList("January 1, 2021 to present", 0)?.spans.map((s) => [s.from, s.to])).toEqual([["2021-01-01", null]]);
  });
});

describe("parseLotRules on fixture formats", () => {
  it("per-SKU lot lists (Hill's)", () => {
    const rules = parseLotRules(
      "Hill's Prescription Diet ... SKU 3389 ...",
      "SKU 3389: 092020T28, 102020T04, and 112020T11     SKU 3390: 102020T11, 112020T23, and 122020T07",
    );
    expect(rules.filter((r) => r.scope === "SKU 3389").map((r) => r.value)).toEqual(["092020T28", "102020T04", "112020T11"]);
    expect(rules.filter((r) => r.scope === "SKU 3390").map((r) => r.value)).toEqual(["102020T11", "112020T23", "122020T07"]);
    expect(rules.every((r) => r.kind === "exact" && !r.needsReview)).toBe(true);
  });

  it("two-word lots and per-size scopes", () => {
    expect(values(parseLotRules("", "Lot #   01022021L2 05,  01022021L3 05"))).toEqual(["01022021L2 05", "01022021L3 05"]);
    const zukes = parseLotRules("", "16 oz: 3450, 3460  6 oz: 3370, 0121");
    expect(zukes.map((r) => [r.scope, r.value])).toEqual([
      ["16 oz", "3450"],
      ["16 oz", "3460"],
      ["6 oz", "3370"],
      ["6 oz", "0121"],
    ]);
  });

  it("ranges with best-by ranges (Smucker)", () => {
    const rules = parseLotRules("", "Best By range 10 25 19 thru  02 09 2021;   Code range: 6299 through 8040, each with the suffix plant number 803");
    expect(dates(rules)).toEqual([["2019-10-25", "2021-02-09"]]);
    const [range] = pick(rules, "range");
    expect([range?.value, range?.valueTo, range?.needsReview]).toEqual(["6299", "8040", true]);
  });

  it("lot + best by in many spellings", () => {
    expect(dates(parseLotRules("", "410B2TXT02 Best By March 4, 2025"))).toEqual([["2025-03-04", null]]);
    expect(dates(parseLotRules("", "BUBD: MAY 06, 2026"))).toEqual([["2026-05-06", null]]);
    expect(dates(parseLotRules("", "Batch Number: B195313 Exp. 11/21"))).toEqual([["2021-11-01", "2021-11-30"]]);
    const m = parseLotRules("", "Lot No. 1081804 and 1082804  Product No 29274 and 52099  Best Buy Date 09/14/2022 and 09/15/2022");
    expect(values(m)).toEqual(["1081804", "1082804"]);
    expect(dates(m)).toEqual([
      ["2022-09-14", null],
      ["2022-09-15", null],
    ]);
  });

  it("lot glued to a date, and lot + production date pairs", () => {
    // 97982 (judge): one printed code; the composite is clean, the batch-plus-date reading needs review
    const glued = parseLotRules("", "12/25/2026B01");
    expect(glued.map((r) => [r.value, r.dateFrom, r.needsReview])).toEqual([
      ["12/25/2026B01", null, false],
      ["B01", "2026-12-25", true],
    ]);
    expect(dates(glued)).toEqual([]);
    expect(values(parseLotRules("", "Lot: TC2 3/APRIL/2020  Best By: 03 April 2021"))).toEqual(["TC2 3/APRIL/2020"]);
    const darwins = parseLotRules("", "Lot # 5309, manufactured on 10/19/18 (listed as 5309(11)181019 on label).");
    expect(values(darwins)).toEqual(["5309(11)181019", "5309"]);
    expect(darwins.every((r) => !r.needsReview)).toBe(true);
  });

  it("lots and dates in the product description", () => {
    const fp = parseLotRules("Freshpet Select ... UPC: 627975012939. Sell By 10/30/2021 L2", "Lot # 1421FBP0101");
    expect(values(fp)).toEqual(["1421FBP0101"]);
    expect(dates(fp)).toEqual([["2021-10-30", null]]);
    const tfp = parseLotRules(
      "Country Acres Farm Dog 55lb 23233TFP 18 -23316TFP 18 Exclusive Red Flannel 40lb 23233TFP 18- 23316TFP 18",
      "Best By 10/05/2024- 11/06/2024",
    );
    expect(pick(tfp, "range").map((r) => [r.value, r.valueTo])).toEqual([["23233TFP 18", "23316TFP 18"]]);
  });

  it("blanket, prefix, suffix and retailer rules", () => {
    expect(pick(parseLotRules("", "All lot codes"), "all_lots")).toHaveLength(1);
    const prefix = parseLotRules("", "All codes beginning with AH, AV, A, AI, AO, or AB and expiration dates between 6/1/2019 and 5/31/2020");
    expect(values(prefix, "prefix")).toEqual(["AH", "AV", "A", "AI", "AO", "AB"]);
    // event 77441: the code prefix AND the expiration window must both hold, so the window rides on
    // each prefix rule instead of standing alone (a matching date alone must not give Stop)
    expect(dates(prefix)).toEqual([]);
    expect(pick(prefix, "prefix").every((r) => r.dateFrom === "2019-06-01" && r.dateTo === "2020-05-31")).toBe(true);
    // a one-character prefix ("AV A, AI") is a typo or truncation
    expect(pick(prefix, "prefix").filter((r) => r.needsReview).map((r) => r.value)).toEqual(["A"]);
    expect(pick(prefix, "all_lots")).toEqual([]);
    // event 79164: "ending in BC" is a suffix rule, not an exact lot
    expect(parseLotRules("", 'All lot codes ending in "BC"').map((r) => [r.kind, r.value, r.needsReview])).toEqual([["suffix", "BC", false]]);
    const suffix = parseLotRules("", "All products with lot numbers that end in 022718 through 072018.");
    expect(suffix.map((r) => [r.kind, r.value, r.valueTo, r.needsReview])).toEqual([["range", "022718", "072018", true]]);
    const fd = parseLotRules(
      "",
      "All food products purchased from Family Dollar retail stores located in AL, AR, LA, MS, MO, and TN from January 1, 2021 to present",
    );
    expect(fd.map((r) => [r.kind, r.value, r.dateFrom, r.dateTo])).toEqual([["retailer_scope", "Family Dollar", "2021-01-01", null]]);
    const range = parseLotRules("", "All lots between N24 1124 to N24 1224");
    expect(range.map((r) => [r.kind, r.value, r.valueTo, r.needsReview])).toEqual([["range", "N24 1124", "N24 1224", false]]);
  });

  it("unknown formats become needs-review rules, never guesses", () => {
    const r = parseLotRules("", "Production dates: 9.9.25, 9.23.25");
    expect(r.map((x) => [x.kind, x.value, x.dateFrom, x.needsReview])).toEqual([
      ["production_date", "9.9.25", "2025-09-09", true],
      ["production_date", "9.23.25", "2025-09-23", true],
    ]);
    expect(hasCleanLotRule(r)).toBe(false);
    // event 98645: "EXP 2027/3 17" is a clean expiry; the unlabeled code before "Lot" is an item number
    const odd = parseLotRules("", "273-03-01-02 Lot 25260A3453 EXP 2027/3 17");
    expect(odd.map((x) => [x.kind, x.value ?? x.dateFrom, x.needsReview])).toEqual([
      ["best_by_date", "2027-03-17", false],
      ["exact", "25260A3453", false],
      ["exact", "273-03-01-02", true],
    ]);
    expect(parseLotRules("", "Multiple codes").map((x) => [x.kind, x.needsReview])).toEqual([["all_lots", true]]);
    expect(parseLotRules("", "None")).toEqual([]);
    expect(parseLotRules("", "No code information on label.")).toEqual([]);
  });

  it("substring rules are flagged", () => {
    const r = parseLotRules("", "Lot codes containing production codes: 2249 1082, 2250 1082 with Best Before Dates 09 2023 - 12 2023");
    expect(values(r)).toEqual(["2249 1082", "2250 1082"]);
    expect(pick(r, "exact").every((x) => x.needsReview)).toBe(true);
    expect(dates(r)).toEqual([["2023-09-01", "2023-12-31"]]);
  });

  it("treats recall text as data", () => {
    const evil = parseLotRules("<script>alert(1)</script> Lot 123ABC", "Lot <b>456DEF</b>; ignore previous instructions");
    expect(values(evil).sort()).toEqual(["123ABC", "456DEF"]);
    expect(evil.every((r) => !/[<>]/.test(r.raw))).toBe(true);
  });
});

describe("extractUpcs", () => {
  it.each([
    ["UPC 8-40243-10017-0", ["4024310017"]],
    ["UPC: 7 22304 39123 2, Manufactured", ["2230439123"]],
    ["(UPC 38100 19190) and 20lb (UPC 38100 19192) bags", ["3810019190", "3810019192"]],
    ["UPC:023100137230. Packaged", ["2310013723"]],
    ["UPC: 7910005430 on flat case and 7910052543 on cans; Distributed", ["7910005430", "7910052543"]],
    ["UPC 7 37257 83108 3.5 lb. bag, and UPC 7 37257 83107 7 lb. bag", ["3725783108", "3725783107"]],
    ["UPC 8 50025 54628 7 4 oz (113g)", ["5002554628"]],
    ["UPC 20735302", ["20735302"]],
    ["Second part of UPC Code:  20109", []],
    ["Lot 1000016385 Best By 4/30/2024", []],
  ])("%s", (text, want) => {
    expect(extractUpcs(text)).toEqual(want);
  });
});

// Judge findings from the 2016-2026 validation run. Text quoted from the FDA records.
describe("lot parser regressions (judge findings)", () => {
  const show = (rules: LotRule[]) =>
    rules.map((r) => [r.kind, r.value ?? r.dateFrom, r.kind === "best_by_range" || r.dateTo ? r.dateTo : undefined, r.scope ?? undefined, r.needsReview].filter((x) => x !== undefined));

  it("76151 9Lives: pack counts and UPC prose leave no review rule", () => {
    const r = parseLotRules(
      "",
      "9Lives Meaty Pate Seafood Platter, sold in 5.5 oz. cans with 4 cans per pack and 6 packs per case, lot numbers 6355803 and 6356803, Individual Unit UPC 7910000367, and Case UPC 7910003670; also sold in 24 cans per case with lot number 6356803",
    );
    expect(show(r)).toEqual([
      ["exact", "6355803", false],
      ["exact", "6356803", false],
    ]);
  });

  it("76453 a bare full date is a best-by that needs review", () => {
    expect(show(parseLotRules("", "August 3, 2019"))).toEqual([["best_by_date", "2019-08-03", true]]);
  });

  it("76781 'lot 84' is a clean short lot after the keyword", () => {
    expect(show(parseLotRules("", "lot 84"))).toEqual([["exact", "84", false]]);
  });

  it("80152 a bare date range is a best-by range that needs review", () => {
    expect(show(parseLotRules("", "5/1/2017 - 9/1/2019; UPC 780872510806"))).toEqual([["best_by_range", "2017-05-01", "2019-09-01", true]]);
  });

  it("81526 / 81654 lot codes with a date: whole code exact, date clean only when labelled best-by", () => {
    expect(show(parseLotRules("", "Lot Codes: TD2 26 FEB 2019"))).toEqual([
      ["exact", "TD2 26 FEB 2019", false],
      ["best_by_date", "2019-02-26", true],
    ]);
    expect(show(parseLotRules("", "Lot Code and Best By Date TA2 20 Nov 2019 = 7.5 kg bag"))).toEqual([
      ["exact", "TA2 20 NOV 2019", false],
      ["best_by_date", "2019-11-20", false],
    ]);
    // a separate Best By clause means the code date is a production date: no extra best-by
    expect(show(parseLotRules("", "Lot: TC2 3/APRIL/2020 Best By: 03 April 2021"))).toEqual([
      ["exact", "TC2 3/APRIL/2020", false],
      ["best_by_date", "2021-04-03", false],
    ]);
    // 86475 a letter-only code after "lot code"
    expect(show(parseLotRules("", "lot code V 07 Feb 2022"))).toEqual([
      ["exact", "V 07 FEB 2022", false],
      ["best_by_date", "2022-02-07", true],
    ]);
  });

  it("81739 production date codes are clean exact lots", () => {
    expect(parseLotRules("", "Production date codes: 18 216, 18 220, 18 271").map((r) => [r.value, r.needsReview])).toEqual([
      ["18 216", false],
      ["18 220", false],
      ["18 271", false],
    ]);
  });

  it("83261 bulk bins of a retailer, 91393 'Sold since'", () => {
    expect(show(parseLotRules("Pig ears - pet treat. unpackaged. sold from self-serve bulk bins", "PLU 15033", null, { firm: "Pet Supplies Plus" }))).toContainEqual([
      "retailer_scope",
      "Pet Supplies Plus (bulk bins)",
      false,
    ]);
    const sold = parseLotRules("", "Sold since: 10/25/22", null, { firm: "Wegmans Food Markets, Inc." });
    expect(sold.map((x) => [x.kind, x.value, x.dateFrom, x.dateTo, x.needsReview])).toEqual([
      ["retailer_scope", "Wegmans Food Markets, Inc.", "2022-10-25", null, true],
    ]);
  });

  it("83404 'Product with UPC' numbers are UPCs, not lots", () => {
    const r = parseLotRules(
      "",
      "Product with UPC, may or may not be branded: 038538484108 Exp Nov 2021 (individually shrink-wrapped) 742174994166 Exp Nov 2021 (Branded 8-pack) Bulk unwrapped product with no UPC: Item 99510 Item 99530 Note that there is a discrepancy for code 038538484106.",
    );
    expect(show(r)).toEqual([["best_by_range", "2021-11-01", "2021-11-30", false]]);
  });

  it("83630 / 83755 no code information: all lots, needs review (iRES rows only)", () => {
    expect(show(parseLotRules("Pig ears", "No code information on label.", null, { noCodeMeansAllLots: true }))).toEqual([["all_lots", null, true]]);
    expect(show(parseLotRules("Ground beef", null, null, { noCodeMeansAllLots: true }))).toEqual([["all_lots", null, true]]);
    expect(parseLotRules("Ground beef", null)).toEqual([]);
  });

  it("86616 'Best if Used Before' and a three-part lot", () => {
    expect(show(parseLotRules("", "20083 1PR00271 47  Best if Used Before Feb 22, 2022"))).toEqual([
      ["best_by_date", "2022-02-22", false],
      ["exact", "20083 1PR00271 47", false],
    ]);
    // 77118
    expect(values(parseLotRules("", "Lot Number: 0134E15 237 13  Best By Date: August 2019"))).toEqual(["0134E15 237 13"]);
  });

  it("88355 per-size UPC lists are not lot scopes; one trailing best-by covers every size", () => {
    const r = parseLotRules("", "UPC 30lb bag: 0736570085750 3.5lb bag: 073657008736 Lot 30lb: TA2 11/Feb/2021 3.5lb: TD2 11/Feb/2021 Best By 02/11/22");
    expect(show(r)).toEqual([
      ["exact", "TA2 11/FEB/2021", "30lb", false],
      ["exact", "TD2 11/FEB/2021", "3.5lb", false],
      ["best_by_date", "2022-02-11", false],
    ]);
  });

  it("88774 'Best-by-date M-D-YYYY'; the code explanation is not a code", () => {
    expect(
      show(parseLotRules("", "Best-by-date 1-8-2022. Lot Code 000841. Lot code breaks down as follows: 0 (1st digit) = Year 2020. 008 (2nd - 4th digit) = Julian Date 008")),
    ).toEqual([
      ["best_by_date", "2022-01-08", false],
      ["exact", "000841", false],
    ]);
  });

  it("89627 one retailer scope with dates, states and the packaging condition", () => {
    const r = parseLotRules(
      "Pet food and treats purchased from Family Dollar retail stores in Alabama, Arkansas, Louisiana, Mississippi, Missouri and Tennessee that are packaged in material other than glass or metal can",
      "All food products purchased from Family Dollar retail stores located in AL, AR, LA, MS, MO, and TN from January 1, 2021 to present",
    );
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      kind: "retailer_scope",
      value: "Family Dollar",
      dateFrom: "2021-01-01",
      dateTo: null,
      scope: "AL, AR, LA, MS, MO, TN; packaged in material other than glass or metal can",
      needsReview: true,
    });
  });

  it("90832 (lot, SKU) pairs", () => {
    expect(show(parseLotRules("", "LOT CODE/ SKU number T-22220 U-C-004  T-22223 U-C-005 T-22220 U-C-006"))).toEqual([
      ["exact", "T-22220", "SKU U-C-004", false],
      ["exact", "T-22223", "SKU U-C-005", false],
      ["exact", "T-22220", "SKU U-C-006", false],
    ]);
  });

  it("92330 MMMDDYYYY codes before 'Exp.' are lots, not dates", () => {
    const r = parseLotRules("", "Lots: a) AUG092022 Exp. 8/9/24, SEP302022 Exp. 9/30/24; b) OCT112022 Exp. 10/11/24");
    expect(values(r).sort()).toEqual(["AUG092022", "OCT112022", "SEP302022"]);
    expect(dates(r).map(([a]) => a).sort()).toEqual(["2024-08-09", "2024-09-30", "2024-10-11"]);
    expect(r.every((x) => !x.needsReview)).toBe(true);
  });

  it("93333 a date followed by 'Expanded' is not a best-by", () => {
    const r = parseLotRules("", "Lot # 1000016890 5 pound bag Best by 6/12/2024 11/9/2023 Expanded to include: All lots with Best By Before 10/31/2024");
    expect(dates(r)).toEqual([
      ["2024-06-12", null],
      [null, "2024-10-31"],
    ]);
  });

  it("94732 'Best By: Mar-Aug 2026' month ranges and WO lots", () => {
    const r = parseLotRules("", "WO152669 Best By: Mar-Aug 2026  WO151401 Best By: Jan-Apr 2026");
    expect(values(r)).toEqual(["WO152669", "WO151401"]);
    expect(dates(r)).toEqual([
      ["2026-03-01", "2026-08-31"],
      ["2026-01-01", "2026-04-30"],
    ]);
  });

  it("96442 '<n> count-Lot:' scopes by pack size, no empty rules", () => {
    const r = parseLotRules("", "50 count-Lot: 20250301PR, BB:07/2026 250 count-Lot: 20250311APR, BB:07/2026");
    expect(r.every((x) => x.value !== null || x.dateFrom !== null)).toBe(true);
    expect(pick(r, "exact").map((x) => [x.value, x.scope])).toEqual([
      ["20250301PR", "50 count"],
      ["20250311APR", "250 count"],
    ]);
  });

  it("79022 MM/YY outside the plausible window needs review", () => {
    const r = parseLotRules("", "Lot# 302QAHAA (Exp. 07/10) Lot# 302QAJ1O (Exp. 10/24)", null, { refDate: "2017-07-28" });
    expect(dates(r).length).toBe(2);
    expect(r.filter((x) => x.kind === "best_by_range").every((x) => x.needsReview)).toBe(true);
    expect(pick(parseLotRules("", "Exp. 11/18", null, { refDate: "2017-07-28" }), "best_by_range")[0]!.needsReview).toBe(false);
  });

  it("79388 a description lot that contradicts the Code Info lot needs review", () => {
    const r = parseLotRules("Blue Ridge Beef BRB Complete; Case Label: Blue Ridge Beef; Kitten Grind; Lot # GA 1102", "Lot #: GA0131 UPC: 854298001177");
    expect(r.map((x) => [x.value, x.needsReview])).toEqual([
      ["GA0131", false],
      ["GA 1102", true],
    ]);
  });

  it("98983 two lot ranges joined by AND; 78945 kitchen-prefixed date ranges need review", () => {
    expect(pick(parseLotRules("", "Lots ranging from 20260330 to 20260403 AND 20260309 to 20260313"), "range").map((x) => [x.value, x.valueTo])).toEqual([
      ["20260330", "20260403"],
      ["20260309", "20260313"],
    ]);
    const j = parseLotRules("", "WH11.1.18 to WH1.14.19, DM11.1.18 to DM1.14.19");
    expect(j.map((x) => [x.kind, x.value, x.valueTo, x.needsReview])).toEqual([
      ["range", "WH11.1.18", "WH1.14.19", true],
      ["range", "DM11.1.18", "DM1.14.19", true],
    ]);
  });

  it("85961 catalog / product numbers are not lots", () => {
    const r = parseLotRules("", "Lot: 9217803  Product Number: 2363353227  Catalog Number: 2363357227  Best By: 08 04 2021");
    expect(r.every((x) => !x.needsReview)).toBe(true);
    expect(values(r)).toEqual(["9217803"]);
  });
});

describe("date parser regressions (judge findings)", () => {
  it("YYYY/M DD with a space (98645)", () => {
    expect(parseDateAt("2027/3 17", 0)).toMatchObject({ from: "2027-03-17" });
  });
  it("a month name glued to digits is not a date (92330 'SEP302022')", () => {
    expect(parseDateAt("SEP302022", 0)).toBeNull();
    expect(parseDateAt("Sept. 30, 2022", 0)).toMatchObject({ from: "2022-09-30" });
  });
  it("Mon-Mon YYYY (94732)", () => {
    expect(parseDateAt("Mar-Aug 2026", 0)).toMatchObject({ from: "2026-03-01", to: "2026-08-31", ambiguous: false });
  });
});

// Second judge round over the 2016-2026 validation run (docs/validation/judge-disputes.md). Each
// case quotes the FDA Code Info / description of the event named in the test.
describe("lot rules: second judge round", () => {
  const parse = (desc: string, code: string | null, refDate = "2020-01-01") => parseLotRulesDetailed(desc, code, null, { refDate, noCodeMeansAllLots: true });
  const sig = (r: LotRule) => `${r.needsReview ? "R " : ""}${r.kind}:${r.value ?? ""}${r.valueTo ? `..${r.valueTo}` : ""}${r.dateFrom ? `@${r.dateFrom}` : ""}${r.dateTo && r.dateTo !== r.dateFrom ? `..${r.dateTo}` : ""}${r.scope ? ` [${r.scope}]` : ""}`;
  const sigs = (rules: LotRule[]) => rules.map(sig);

  it("never emits an exact rule with an empty value; unread text is returned instead (75919, 83458, 87625)", () => {
    const mfg = parse("Turkey with bone, UPC Code 854298001887", "Code Lot #103, Mfg. Date: 1276", "2016-12-09");
    expect(sigs(mfg.rules)).toEqual(["exact:103"]);
    expect(mfg.unparsed.join(" ")).toMatch(/Mfg\. Date: 1276/);
    const made = parse("Chicken Dinner for Dogs", "manufactured 201916", "2019-07-29");
    expect(made.rules).toEqual([]);
    expect(made.unparsed).toEqual(["manufactured 201916"]);
    expect(sigs(parse("", "Multiple codes").rules)).toEqual(["R all_lots:"]);
  });

  it("a best-by date before the recall started needs review (75402, 90584)", () => {
    const cesar = parse("", "631FKKC, 631GKKC, 632D14JC; Best Before Dates 08/04/18 and 08/05/18. Best Before: 08/04/2016 and 08/05/2016", "2016-10-07");
    expect(sigs(cesar.rules).filter((x) => x.includes("best_by"))).toEqual([
      "best_by_date:@2018-08-04",
      "best_by_date:@2018-08-05",
      "R best_by_date:@2016-08-04",
      "R best_by_date:@2016-08-05",
    ]);
    const beg = parse("", "Product #, BE0C0104, Exp. Date, 6/8/2023 Exp. Batch No., 72224014 & Date 6/14/2023, Batch No. 72235001. Exp. Date 6/8/2020 Batch No. 72224014", "2022-07-08");
    expect(sigs(beg.rules)).toContain("R best_by_date:@2020-06-08");
    expect(beg.rules.every((r) => r.kind !== "exact" || r.value)).toBe(true);
  });

  it("size headers without a colon, and a date range that repeats the kitchen-code dates is production (78945)", () => {
    const r = parse("", "14 oz.: WH11.1.18 to WH12.31.18, DM 12.1.18 to DM 12.31.18; 72 oz. ; WH11.1.18 to WH12.31.18, DM 12.1.18 to DM 12.31.18", "2018-01-12");
    expect(sigs(r.rules)).toEqual([
      "R range:WH11.1.18..WH12.31.18 [14 oz]",
      "R range:DM12.1.18..DM12.31.18 [14 oz]",
      "R range:WH11.1.18..WH12.31.18 [72 oz]",
      "R range:DM12.1.18..DM12.31.18 [72 oz]",
    ]);
    const v13 = parse("", "7 oz.: WH11.1.18 to WH1.14.19, DM11.1.18 to DM1.14.19 Nov 1, 2018 to Jan 14, 2019; 72 oz.; WH11.1.18 to WH1.14.19", "2018-01-12");
    expect(sigs(v13.rules)).toContain("R production_date:Nov 1, 2018 to Jan 14, 2019@2018-11-01..2019-01-14 [7 oz]");
    expect(v13.rules.some((x) => x.kind === "best_by_range")).toBe(false);
    expect(sigs(v13.rules)).toContain("R range:WH11.1.18..WH1.14.19 [72 oz]");
  });

  it("manufacture dates are production_date rules, scoped by product code (79151) and with doubled slashes (98343)", () => {
    const r = parse("", "Product Codes 9900008 and 9900009: MANFU DATE: 10/12/17. Product Code: 9900014 and 9900015: MANFU DATE: between 10/12/2017 and 2/2/18.", "2018-02-05");
    expect(sigs(r.rules)).toEqual([
      "R production_date:10/12/17@2017-10-12 [product code 9900008, 9900009]",
      "R production_date:10/12/2017 and 2/2/18@2017-10-12..2018-02-02 [product code 9900014, 9900015]",
    ]);
    expect(sigs(parse("", "Date Code: 11/22//2025, 7/17/2025", "2026-01-26").rules)).toEqual([
      "R production_date:11/22//2025@2025-11-22",
      "R production_date:7/17/2025@2025-07-17",
    ]);
  });

  it("a date stated inside a code explanation is kept (79323)", () => {
    const r = parse("", "15 082218 The code is interpreted as follows: -15 is the batch number made on 12-22-2016. -082218 is the expiration date 8-22-2018.", "2018-02-21");
    expect(sigs(r.rules)).toEqual(["best_by_date:@2018-08-22", "exact:15 082218"]);
  });

  it("the label form of a lot, and a lot paired with its best-by in one clause (79330, 96442)", () => {
    const ve = parse("", "Lot 13753, Best by 6/14/19 (written as 20190614 13753 on label)", "2018-02-23");
    expect(sigs(ve.rules)).toEqual(["exact:20190614 13753", "exact:13753@2019-06-14"]);
    const zp = parse("", "50 count-Lot: 20250301PR, BB:07/2026 250 count-Lot: 20250311APR, BB:07/2026", "2025-02-17");
    expect(sigs(zp.rules)).toEqual(["exact:20250301PR@2026-07-01..2026-07-31 [50 count]", "exact:20250311APR@2026-07-01..2026-07-31 [250 count]"]);
    expect(sigs(parse("", "Lot E2411034: 12-9-2026 Lot E2411037: 12-11-2026", "2025-06-12").rules)).toEqual(["exact:E2411034", "exact:E2411037"]);
  });

  it("codes only on the case: the bag gets an all-lots rule that needs review (80942, 83683)", () => {
    const r = parse("Ground frozen dog food", "071418 Please note that there are no code dates on the individual bags of product, only on the 40-pound case boxes.", "2018-08-31");
    expect(sigs(r.rules)).toEqual(["exact:071418 [case]", "R all_lots: [bag (no code printed)]"]);
    const r2 = parse("The product is packaged in 2-lb bags, 20 bags to a box. The boxes are labeled with lot codes, but the individual bags are not.", "072219", "2019-08-26");
    expect(sigs(r2.rules)).toEqual(["exact:072219 [case]", "R all_lots: [bag (no code printed)]"]);
  });

  it("bulk product without codes gets an all-lots rule scoped to bulk (83570)", () => {
    const r = parse("", "Bulk pig ears have no lot codes. Packaged pig ears with the Chef Toby brand logo with lot codes 428590, 074599, 1106709", "2019-08-16");
    expect(sigs(r.rules)).toEqual(["exact:428590", "exact:074599", "exact:1106709", "R all_lots: [bulk]"]);
  });

  it("pack-size scopes, and a lot in only one source with a near twin in the other (83589)", () => {
    const r = parse(
      "USA Pig Ears by Best Bully Sticks (20 pack) Thick-Cut UPC: X000RBC5VF, lots 1129T1; 1339T1, 2179T1.",
      "7-pack: 1759T1 8-pack: 1129T1 & 1549T1; best by 4/22/2021 20-pack: 1129T1, 1139T1, and 2179T1; best by 8/5/2021",
      "2019-08-17",
    );
    expect(sigs(r.rules)).toEqual(expect.arrayContaining(["exact:1759T1 [7-pack]", "R exact:1139T1 [20-pack]", "R exact:1339T1", "exact:2179T1 [20-pack]"]));
  });

  it("batch plus sub-lot pairs (83998)", () => {
    const r = parse("", "Batch: 3188 (428590-C), 3188 (428590-D), 3248 (206228-A), & 3248 (419486-A) SKU: 819895022444 Packer/Manufacturer Number: 11300253442", "2019-10-11");
    expect(values(r.rules)).toEqual(["3188", "428590-C", "428590-D", "3248", "206228-A", "419486-A"]);
    expect(r.rules.every((x) => !x.needsReview)).toBe(true);
    expect(r.unparsed).toEqual([]);
  });

  it("month/year 'lot codes' are date windows, catalog ids are not lots (85245)", () => {
    const r = parse("", "Lot Codes: 02/2020, 03/2020 Product and Catalog ID #s: IFT-00144, IFT-00104", "2020-03-13");
    expect(sigs(r.rules)).toEqual(["R best_by_range:@2020-02-01..2020-02-29", "R best_by_range:@2020-03-01..2020-03-31"]);
    expect(r.unparsed).toEqual([]);
  });

  it("case codes and multi-word code ranges (86729)", () => {
    const r = parse("", "1. Case Code 20200812, Individual bags BEEF-A-06 422503 2025 thru BEEF-A-06 422504 0042 2. Case Code 20200813, Individual bags BEEF-A-07 422603 0750 thru BEEF-A-07 422603 0956", "2020-11-07");
    expect(sigs(r.rules)).toEqual([
      "R range:BEEF-A-06 422503 2025..BEEF-A-06 422504 0042 [item 1]",
      "exact:20200812 [item 1; case]",
      "R range:BEEF-A-07 422603 0750..BEEF-A-07 422603 0956 [item 2]",
      "exact:20200813 [item 2; case]",
    ]);
    // a two-word range stays the clean range it was ("N24 1124 to N24 1224")
    expect(sigs(parse("", "N24 1124 to N24 1224").rules)).toEqual(["range:N24 1124..N24 1224"]);
  });

  it("a malformed list item does not end the list (87068)", () => {
    const r = parse(
      "",
      "Lot # 06022022L2 05, 06022022L3 05, 0320222 L 05, 06032022L2 05, 06102022L2 05, 06102022L3 05, 06162022L2 05, 07072022L2 05",
      "2020-12-30",
    );
    expect(values(r.rules)).toHaveLength(8);
    expect(r.rules.filter((x) => x.needsReview).map((x) => x.value)).toEqual(["0320222 L 05"]);
  });

  it("codes whose shape breaks from their list need review (89217)", () => {
    const r = parse("", "Cat Lot Codes: 210166pbst000p06, PBST000p06, 210168PBST000P06, 210169PBST0000P06 Best By: 05/2023", "2021-12-10");
    expect(r.rules.filter((x) => x.kind === "exact" && x.needsReview).map((x) => x.value)).toEqual(["PBST000P06", "210169PBST0000P06"]);
  });

  it("a Sunshine code with no day, and an unlabeled date-like code, need review (88355, 99287)", () => {
    expect(sigs(parse("", "UPC 30lb: 073657380313 Lot TA2 11/Feb/2021, TA1/Feb/2021 Best By 02/11/22", "2021-07-26").rules)).toContain("R exact:TA1/FEB/2021");
    expect(sigs(parse("", "4 24-27", "2026-06-18").rules)).toEqual(["R exact:4 24-27"]);
  });

  it("a malformed date does not end a best-by list; product numbers are not lots (88480)", () => {
    const r = parse("", "Product Numbers: 7910072026, 7910083052 Best By Dates: 09/28/22, 09/30/222, 10/06/22, 10/08/22 Lot Code: 1095395, 1103395", "2021-07-28");
    expect(dates(r.rules)).toEqual([
      ["2022-09-28", null],
      ["2022-10-06", null],
      ["2022-10-08", null],
    ]);
    expect(r.unparsed).toEqual(["malformed date 09/30/222"]);
    const v149 = parse("", "Product Numbers: 7910014981, 7910058991 Best By Dates: 12/02/22 Lot Code: 7910083052, 7910058991, 1179395, 1180395", "2021-07-28");
    expect(values(v149.rules)).toEqual(["1179395", "1180395"]);
  });

  it("a plant / line suffix after a date is not a lot (90470, 93131)", () => {
    expect(sigs(parse("", "Sell By 10/29/22 L3", "2022-06-15").rules)).toEqual(["best_by_date:@2022-10-29"]);
    expect(sigs(parse("", "Lot 20082323 BEST BY: 02/25/25 L2", "2023-09-27").rules)).toEqual(["best_by_date:@2025-02-25", "exact:20082323"]);
  });

  it("12-digit lots in a lot list are lots, not UPCs (92718)", () => {
    const r = parse("Single Dried Sardine. No labeling on product.", "Lot No. 250402202223, 121110202122, 210510202324, 141228202223, 210620202324", "2023-07-14");
    expect(values(r.rules)).toEqual(["250402202223", "121110202122", "210510202324", "141228202223", "210620202324"]);
  });

  it("a misspelled best-by label (98774 'Bes By Dates')", () => {
    const r = parse("", "3.  Bes By Dates:  7/11/2026, 9/9/2026", "2026-04-15");
    expect(sigs(r.rules)).toEqual(["best_by_date:@2026-07-11", "best_by_date:@2026-09-09"]);
  });
});
