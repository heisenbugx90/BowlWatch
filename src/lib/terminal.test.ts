import { describe, expect, it } from "vitest";
import { safeJson, safeLine } from "./terminal";

const evil = "Dog Food \u009b2J\u001b]0;pwned\u0007 ‮obyl\u007f";
// Everything unsafe except "\n", which JSON indentation uses.
const UNSAFE_BUT_NEWLINE = new RegExp("[\\u0000-\\u0009\\u000b-\\u001f\\u007f-\\u009f\\u202a-\\u202e\\u2066-\\u2069]");
const UNSAFE = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u202a-\\u202e\\u2066-\\u2069]");

describe("terminal output of untrusted recall text", () => {
  it("safeJson escapes C1 (CSI U+009B), DEL and bidi controls and stays valid JSON", () => {
    const out = safeJson({ productDescription: evil });
    expect(out).not.toMatch(UNSAFE_BUT_NEWLINE);
    expect(out).toContain("\\u009b");
    expect(out).toContain("\\u202e");
    expect(JSON.parse(out)).toEqual({ productDescription: evil });
  });

  it("safeLine replaces the same characters and truncates", () => {
    expect(safeLine(evil, 200)).not.toMatch(UNSAFE);
    expect(safeLine("abcdef", 3)).toBe("abc");
    expect(safeLine(null)).toBe("");
  });
});
