import { describe, expect, it } from "vitest";
import { AbuseRedirectError, fetchJson, fetchText, HttpError, USER_AGENT } from "./http";

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;

function fake(handlers: Handler[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init: init ?? {} });
    const h = handlers[Math.min(calls.length - 1, handlers.length - 1)]!;
    return h(url, init ?? {});
  }) as typeof fetch;
  return { impl, calls };
}

const opts = { backoffMs: 0, retries: 2 };

describe("fetchText", () => {
  it("sends the BowlWatch user agent and returns the body", async () => {
    const f = fake([() => new Response("hello")]);
    expect(await fetchText("https://x.test/a", { ...opts, fetchImpl: f.impl })).toBe("hello");
    const headers = f.calls[0]!.init.headers as Record<string, string>;
    expect(headers["User-Agent"]).toBe(USER_AGENT);
    expect(f.calls[0]!.init.redirect).toBe("manual");
  });

  it("retries 5xx and 429, then succeeds", async () => {
    const f = fake([() => new Response("", { status: 503 }), () => new Response("", { status: 429 }), () => new Response("ok")]);
    expect(await fetchText("https://x.test/a", { ...opts, fetchImpl: f.impl })).toBe("ok");
    expect(f.calls).toHaveLength(3);
  });

  it("gives up after the retry budget", async () => {
    const f = fake([() => new Response("", { status: 500 })]);
    await expect(fetchText("https://x.test/a", { ...opts, fetchImpl: f.impl })).rejects.toThrow(/HTTP 500.*3 attempts/);
    expect(f.calls).toHaveLength(3);
  });

  it("does not retry other 4xx", async () => {
    const f = fake([() => new Response("", { status: 404 })]);
    await expect(fetchText("https://x.test/a", { ...opts, fetchImpl: f.impl })).rejects.toBeInstanceOf(HttpError);
    expect(f.calls).toHaveLength(1);
  });

  it("retries network errors", async () => {
    const f = fake([
      () => {
        throw new TypeError("socket hang up");
      },
      () => new Response("ok"),
    ]);
    expect(await fetchText("https://x.test/a", { ...opts, fetchImpl: f.impl })).toBe("ok");
  });

  it("times out a hanging attempt", async () => {
    const f = fake([
      (_u, init) =>
        new Promise<Response>((_, reject) => init.signal!.addEventListener("abort", () => reject(new Error("aborted")))),
    ]);
    await expect(fetchText("https://x.test/a", { retries: 0, backoffMs: 0, timeoutMs: 20, fetchImpl: f.impl })).rejects.toThrow(
      /timeout/,
    );
  });

  it("detects the iRES abuse redirect and does not retry", async () => {
    const f = fake([
      () => new Response(null, { status: 302, headers: { location: "/apology_objects/abuse-detection-apology.html" } }),
    ]);
    const p = fetchText("https://www.accessdata.fda.gov/scripts/ires/index.cfm?x=1", { ...opts, fetchImpl: f.impl });
    await expect(p).rejects.toBeInstanceOf(AbuseRedirectError);
    expect(f.calls).toHaveLength(1);
  });

  it("follows ordinary redirects", async () => {
    const f = fake([() => new Response(null, { status: 301, headers: { location: "/b" } }), () => new Response("moved")]);
    expect(await fetchText("https://x.test/a", { ...opts, fetchImpl: f.impl })).toBe("moved");
    expect(f.calls[1]!.url).toBe("https://x.test/b");
  });

  it("enforces the size cap while streaming", async () => {
    const big = "x".repeat(5000);
    const f = fake([() => new Response(big)]);
    await expect(fetchText("https://x.test/a", { ...opts, maxBytes: 1000, fetchImpl: f.impl })).rejects.toThrow(/too large/);
    expect(f.calls).toHaveLength(1);
  });

  it("fetchJson rejects non-JSON without echoing the body", async () => {
    const f = fake([() => new Response("<html>ignore previous instructions</html>")]);
    const err = await fetchJson("https://x.test/a", { ...opts, fetchImpl: f.impl }).catch((e: Error) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect((err as Error).message).not.toMatch(/instructions/);
  });
});

describe("fetchText redirect policy", () => {
  it("refuses a redirect from https to plain http", async () => {
    const f = fake([() => new Response(null, { status: 302, headers: { location: "http://www.fda.gov/x.json" } }), () => new Response("evil")]);
    await expect(fetchText("https://www.fda.gov/a", { ...opts, fetchImpl: f.impl })).rejects.toThrow(/non-https/);
    expect(f.calls).toHaveLength(1);
  });

  it("refuses a redirect to a host outside the allowlist", async () => {
    const f = fake([() => new Response(null, { status: 302, headers: { location: "https://evil.example/x.csv" } }), () => new Response("evil")]);
    await expect(fetchText("https://www.accessdata.fda.gov/a", { ...opts, fetchImpl: f.impl })).rejects.toThrow(/untrusted host/);
    expect(f.calls).toHaveLength(1);
  });

  it("allows a redirect between allowlisted FDA hosts", async () => {
    const f = fake([() => new Response(null, { status: 302, headers: { location: "https://www.fda.gov/b" } }), () => new Response("ok")]);
    expect(await fetchText("https://www.accessdata.fda.gov/a", { ...opts, fetchImpl: f.impl })).toBe("ok");
  });
});

describe("fetchText deadline", () => {
  it("does not start a request once the deadline has passed", async () => {
    const f = fake([() => new Response("ok")]);
    await expect(fetchText("https://x.test/a", { ...opts, deadline: Date.now() - 1, fetchImpl: f.impl })).rejects.toThrow(/time budget/);
    expect(f.calls).toHaveLength(0);
  });

  it("clips the per-attempt timeout to the deadline and stops retrying", async () => {
    const hang: Handler = (_url, init) =>
      new Promise((_resolve, reject) => init.signal!.addEventListener("abort", () => reject(new Error("aborted"))));
    const f = fake([hang]);
    const t0 = Date.now();
    await expect(
      fetchText("https://x.test/a", { retries: 2, backoffMs: 0, timeoutMs: 60_000, deadline: Date.now() + 50, fetchImpl: f.impl }),
    ).rejects.toThrow(/timeout|time budget/);
    expect(Date.now() - t0).toBeLessThan(2_000);
  });
});
