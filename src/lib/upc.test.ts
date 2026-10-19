import { describe, expect, it } from "vitest";
import { extractUpcs } from "./upc";

// Regressions from comparing the two former implementations over every CVM row 2016-2026.
describe("extractUpcs (shared)", () => {
  it("reads a label glued to the digits", () => {
    expect(extractUpcs("Homeopathic Dog 4 fl oz (118 mL) NDC# 57955-4406-4 UPC357955440642")).toEqual(["5795544064"]);
  });
  it("does not merge a following bag size into the UPC", () => {
    expect(extractUpcs("UPC: 7015514299 31 lb. bags lot code: TA 2")).toEqual(["7015514299"]);
  });
  it("does not merge the next product name into the UPC", () => {
    expect(extractUpcs("Individual Unit UPC 7910000364, and Case UPC 7910003640 9Lives products")).toEqual([
      "7910000364",
      "7910003640",
    ]);
  });
  it("ignores text that is not a UPC label", () => {
    expect(extractUpcs("Pupcakes lot 123456789012")).toEqual([]);
  });
});

// Judge findings from the 2016-2026 validation run (docs/validation/judge-disputes.md).
describe("extractUpcs: FDA typos and unlabelled UPCs", () => {
  it.each([
    ["75919 13 digits = UPC-A + stray digit", "UPC Code: 8542980011009, Lot #ga8516.", ["5429800110"]],
    ["96096 13 digits = UPC-A + one stray digit", "UPC: 8542980013436. Packaged", ["5429800143"]],
    ["88355 13 digits, 0-led typo", "UPC 30lb bag: 0736570085750 3.5lb bag: 073657008736", ["7365700875", "7365700873"]],
    ["96610 Colombian EAN-13 kept whole", "UPC: 7709417695092", ["7709417695092"]],
    ["98645 spaced EAN-13 (1-5-5-2)", "Net Wt 22lb UPC 8 01027 60423 85. Dog Food", ["8010276042385"]],
    ["81543 EAN-8 on a Lidl bag", "10 lbs Bag, UPC 20735302", ["20735302"]],
    ["87979 'UPC item code' is a UPC label", "Case item code: 2363306234, UPC item code: 2363300233 10 lb. bag", ["2363300233"]],
    [
      "86854 11 digits read against siblings (check digit dropped)",
      'UPC: 840139199493 " BB Date: 10/18/2022 " UPC: 84013905142 " BB Date: 10/25/2022 " UPC: 840139116742',
      ["4013919949", "4013911674", "4013905142"],
    ],
    ["92718 a lot list is not a UPC", "Lot No. 250402202223, 121110202122, 210510202324, 141228202223 Expiration", []],
    ["80859 13 digits", "8 oz tubs with UPC 8515360010005, 16 oz tubs with UPC 851536001012", ["5153600100", "5153600101"]],
    ["77441 11 digits, leading 0 dropped, never shift", "1 lb packages, UPC 72036977964; 2) 2 lb packages, UPC 72036981318;", ["7203698131", "7203697796"]],
    ["86569 11 digits repaired from a sibling", "20 lb. UPC: 70155505120 40 lb. UPC: 7015505119", ["7015505119", "7015505120"]],
    [
      "79291 11-digit typo of a core already captured",
      "UPC: 7910052457 on flat case and 79100034417 on cans; UPC: 7910052879 on flat case and 7910034417 on cans",
      ["7910052457", "7910052879", "7910034417"],
    ],
    ["76616 spaced UPC-A after ')'", "Net WT. 12.5 oz (354 g)0 76344 08822 6", ["7634408822"]],
    ["79164 bare 12 digits with a valid check digit", "Bully Stick, 800443104798; No packaging", ["0044310479"]],
    ["88479 6+5 grouping, no check digit", "net wt. 2 lb. UPC 737257 92262. Simply", ["3725792262"]],
    ["98446 1-10-1 hyphenation", "UPC 6-9173018103-1", ["9173018103"]],
  ])("%s", (_name, text, expected) => {
    expect(extractUpcs(text)).toEqual(expected);
  });

  it("a bare number after a lot keyword stays a lot", () => {
    expect(extractUpcs("Lot 123456789012 UPC 7910000367")).toEqual(["7910000367"]);
  });
});
