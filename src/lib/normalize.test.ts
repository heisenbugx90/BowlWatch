import { describe, expect, it } from "vitest";
import { cleanNullable, cleanText, decodeEntities, normalizeText, normalizeUpc, tokens } from "./normalize";

describe("normalizeText", () => {
  it.each([
    ["Hill's Science Diet", "hills science diet"],
    ["Hill’s® Prescription Diet™", "hills prescription diet"],
    ["Hill¿s Prescription Diet", "hills prescription diet"],
    ["Member s Mark Chicken and Rice", "members mark chicken and rice"],
    ["Darwin's Natural Selections", "darwins natural selections"],
    ["Entrée for Dogs", "entree for dogs"],
    ["Beef Entr¿e", "beef entre"],
    ["Mac & Cheese", "mac and cheese"],
    ["H-E-B Texas Pets", "h e b texas pets"],
    ["Kibbles 'n Bits", "kibbles n bits"],
    ["  BLUE   Buffalo\t\nWilderness ", "blue buffalo wilderness"],
    ["Lot 111-¿15, Use By 4/21/2016", "lot 111 15 use by 4 21 2016"],
    ["Purina​ ONE", "purina one"],
    ["", ""],
  ])("%j -> %j", (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });

  it("handles null/undefined", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
  });

  it("is idempotent", () => {
    for (const s of ["Hill's® Science Diet™", "Member s Mark", "Entrée & Co."]) {
      expect(normalizeText(normalizeText(s))).toBe(normalizeText(s));
    }
  });

  it("does not glue a real word 's' after a number or at the start", () => {
    expect(normalizeText("s brand")).toBe("s brand");
  });

  it("tokens splits the normalized form", () => {
    expect(tokens("Hill's Science-Diet")).toEqual(["hills", "science", "diet"]);
    expect(tokens("")).toEqual([]);
  });
});

describe("cleanText", () => {
  it("strips tags and script bodies and decodes entities", () => {
    expect(cleanText('<a href="/x">Blue&nbsp;Buffalo</a><script>alert(1)</script> Animal &amp; Veterinary')).toBe(
      "Blue Buffalo Animal & Veterinary",
    );
  });
  it("strips tags that were entity-encoded", () => {
    expect(cleanText("&lt;img src=x onerror=alert(1)&gt;Safe")).toBe("Safe");
  });
  it("removes U+00BF garbage", () => {
    expect(cleanText("Freeze-¿Dried")).toBe("Freeze-Dried");
  });
  it("cleanNullable maps N/A to null", () => {
    expect(cleanNullable("N/A")).toBeNull();
    expect(cleanNullable("  ")).toBeNull();
    expect(cleanNullable("V-0015-2020")).toBe("V-0015-2020");
  });
  it("decodes numeric entities", () => {
    expect(decodeEntities("Hill&#39;s &#x2122;")).toBe("Hill's ™");
  });
});

describe("normalizeUpc", () => {
  it.each([
    ["751485152509", "5148515250"],
    ["UPC 0-52742-01234-5", "5274201234"],
    ["0052742012345", "5274201234"],
    ["10052742012342", "5274201234"],
    ["5274201234", "5274201234"],
    ["123", null],
    ["", null],
  ])("%j -> %j", (input, expected) => {
    expect(normalizeUpc(input)).toBe(expected);
  });

  it("11 digits: keeps core when the check digit is present", () => {
    const full = "036000291452"; // valid UPC-A (well-known example)
    expect(normalizeUpc(full.slice(1))).toBe("3600029145"); // number-system digit dropped
    expect(normalizeUpc(full.slice(0, 11))).toBe("3600029145"); // check digit dropped
  });
});

describe("normalizeUpc: 11 and 13 digits (judge findings)", () => {
  it("13 digits that are not a valid EAN-13: the one single-digit deletion that is a valid UPC-A", () => {
    // 96096 / 96687 Blue Ridge Kitten Mix: the known UPC is 854298001436 (iRES 93641)
    expect(normalizeUpc("8542980013436")).toBe("5429800143");
    // 88355 Triumph 30 lb: 073657008750, sibling of 073657008736 (not the shifted 3657008575)
    expect(normalizeUpc("0736570085750")).toBe("7365700875");
    // several deletions are valid UPC-A: fall back to the first 12 digits
    expect(normalizeUpc("8542980011009")).toBe("5429800110");
  });
  it("a valid non-0 EAN-13 has no UPC-A core and is kept whole (96610, 97762, 98645)", () => {
    expect(normalizeUpc("7709417695092")).toBe("7709417695092");
    expect(normalizeUpc("7707708816188")).toBe("7707708816188");
    expect(normalizeUpc("8 01027 60423 85")).toBe("8010276042385");
    // a 0-led EAN-13 is a UPC-A in EAN form
    expect(normalizeUpc("0076344088226")).toBe("7634408822");
  });
  it("8 digits (EAN-8 / UPC-E) are kept as printed (81543 Lidl)", () => {
    expect(normalizeUpc("20735302")).toBe("20735302");
    expect(normalizeUpc("1234567")).toBeNull();
  });
  it("11 digits: grouping decides, otherwise the leading 0 was dropped", () => {
    expect(normalizeUpc("737257 92262")).toBe("3725792262");
    expect(normalizeUpc("0 52742 01234")).toBe("5274201234");
    expect(normalizeUpc("72036977964")).toBe("7203697796");
  });
});
