import { describe, expect, it } from "vitest";
import { clip, mdEscape, mdLink } from "./db-report";

describe("db-report escaping (recall text is untrusted)", () => {
  it("neutralises HTML, links and table breaks", () => {
    const s = mdEscape('<img src=x onerror=alert(1)> [click](javascript:x) a|b *c*');
    expect(s).not.toMatch(/<|>/);
    expect(s).toContain("\\[click\\]\\(javascript:x\\)");
    expect(s).toContain("a\\|b");
  });
  it("links only https fda.gov URLs", () => {
    expect(mdLink("notice", "https://www.fda.gov/safety/x")).toBe("[notice](https://www.fda.gov/safety/x)");
    expect(mdLink("notice", "javascript:alert(1)")).not.toContain("](");
    expect(mdLink("notice", "https://evil.example/x")).not.toContain("](");
    expect(mdLink("notice", "https://www.fda.gov/a) [x](https://evil")).not.toContain("](");
  });
  it("clips and strips control characters", () => {
    expect(clip("a\u0000b\n\nc", 50)).toBe("a b c");
    expect(clip("x".repeat(20), 10)).toHaveLength(10);
  });
});
