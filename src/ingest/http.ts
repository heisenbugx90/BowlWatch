/**
 * HTTP for feed fetching. OWNER: ingestion agent.
 *
 * Requirements:
 * - Always send USER_AGENT (a truthful identifier). Never use the API key embedded
 *   in FDA's service.js or any other borrowed credential.
 * - Timeout per attempt, bounded retries with backoff on network errors / 429 / 5xx,
 *   no retry on other 4xx.
 * - Hard size cap: abort once the body exceeds maxBytes (stream and count).
 * - Redirects are followed manually (max 5) so FDA's abuse-detection redirect
 *   (302 to an "apology" page) surfaces as AbuseRedirectError instead of HTML.
 *   A redirect must stay on https and on the same host or an allowlisted feed host;
 *   anything else is refused (never downgrade to plaintext or trust another origin).
 * - Return the body as text. Callers treat it as untrusted data.
 */

export const USER_AGENT = "Mozilla/5.0 (compatible; BowlWatch/0.1; +https://bowlwatch.ca)";

export interface FetchOptions {
  /** Per-attempt timeout. Default 60_000. */
  timeoutMs?: number;
  /** Extra attempts after the first. Default 2. */
  retries?: number;
  /** Abort when the body exceeds this many bytes. Default 25 MiB. */
  maxBytes?: number;
  accept?: string;
  /** Injectable for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Base backoff before retry n (n = 1, 2, ...): backoffMs * 2^(n-1), plus jitter. Default 2_000. Tests pass 0. */
  backoffMs?: number;
  /**
   * Absolute deadline (epoch ms). No attempt starts and no backoff sleeps past it, and each
   * attempt's timeout is clipped to the time left, so a caller with a hard wall-clock limit
   * (the Vercel function) gets an error back instead of being killed mid-request.
   */
  deadline?: number;
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** The server redirected us to an abuse-detection / apology page. Not retried: back off for the day. */
export class AbuseRedirectError extends HttpError {
  constructor(url: string, status: number, readonly location: string) {
    super(`blocked by the server's abuse detection (HTTP ${status} redirect to ${location}); not retrying`, url, status);
    this.name = "AbuseRedirectError";
  }
}

const DEFAULTS = { timeoutMs: 60_000, retries: 2, maxBytes: 25 * 1024 * 1024, backoffMs: 2_000 };
const MAX_REDIRECTS = 5;
const ABUSE_LOCATION = /apology|abuse|blocked|captcha/i;
/** Feed hosts a redirect may cross to. Same-host https redirects are always allowed. */
export const REDIRECT_HOST_ALLOWLIST: ReadonlySet<string> = new Set([
  "www.fda.gov",
  "fda.gov",
  "www.accessdata.fda.gov",
  "accessdata.fda.gov",
  "recalls-rappels.canada.ca",
]);

/** Throws unless `next` is https and on `from`'s host or an allowlisted host. */
function checkRedirect(from: URL, next: URL, status: number): void {
  if (next.protocol !== "https:")
    throw new HttpError(`refusing HTTP ${status} redirect to non-https URL ${next.toString()}`, from.toString(), status);
  if (next.host !== from.host && !REDIRECT_HOST_ALLOWLIST.has(next.hostname))
    throw new HttpError(`refusing HTTP ${status} redirect to untrusted host ${next.host}`, from.toString(), status);
}

const sleep = (ms: number) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

/** Retry-After in ms (seconds or HTTP date), capped at 60 s. */
function retryAfterMs(res: Response): number | null {
  const v = res.headers.get("retry-after");
  if (!v) return null;
  const secs = Number(v);
  const ms = Number.isFinite(secs) ? secs * 1000 : Date.parse(v) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? Math.min(ms, 60_000) : null;
}

class Retryable extends Error {
  constructor(
    readonly inner: HttpError,
    readonly waitMs: number | null,
  ) {
    super(inner.message);
  }
}

async function readCapped(res: Response, url: string, maxBytes: number, controller: AbortController): Promise<string> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes)
    throw new HttpError(`response too large: ${declared} bytes > ${maxBytes}`, url, res.status);
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let total = 0;
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      controller.abort();
      await reader.cancel().catch(() => undefined);
      throw new HttpError(`response too large: more than ${maxBytes} bytes`, url, res.status);
    }
    out += decoder.decode(value, { stream: true });
  }
  return out + decoder.decode();
}

async function attempt(url: string, o: Required<Omit<FetchOptions, "accept" | "fetchImpl" | "deadline">> & FetchOptions): Promise<string> {
  const fetchImpl = o.fetchImpl ?? fetch;
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const timeoutMs = o.deadline === undefined ? o.timeoutMs : Math.min(o.timeoutMs, o.deadline - Date.now());
    if (timeoutMs <= 0) throw new HttpError("time budget exhausted before the request finished", current, null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let res: Response;
      try {
        res = await fetchImpl(current, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: { "User-Agent": USER_AGENT, Accept: o.accept ?? "*/*" },
        });
      } catch (e) {
        const msg = controller.signal.aborted ? `timeout after ${timeoutMs} ms` : `network error: ${(e as Error).message}`;
        throw new Retryable(new HttpError(msg, current, null), null);
      }

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        await res.body?.cancel().catch(() => undefined);
        if (!location) throw new HttpError(`HTTP ${res.status} redirect without Location`, current, res.status);
        const nextUrl = new URL(location, current);
        const next = nextUrl.toString();
        if (ABUSE_LOCATION.test(location)) throw new AbuseRedirectError(current, res.status, next);
        checkRedirect(new URL(current), nextUrl, res.status);
        current = next;
        continue;
      }
      if (res.status === 429 || res.status >= 500) {
        await res.body?.cancel().catch(() => undefined);
        throw new Retryable(new HttpError(`HTTP ${res.status}`, current, res.status), retryAfterMs(res));
      }
      if (!res.ok) {
        await res.body?.cancel().catch(() => undefined);
        throw new HttpError(`HTTP ${res.status}`, current, res.status);
      }
      try {
        return await readCapped(res, current, o.maxBytes, controller);
      } catch (e) {
        if (e instanceof HttpError) throw e;
        const msg = controller.signal.aborted ? `timeout after ${timeoutMs} ms while reading body` : `body read failed: ${(e as Error).message}`;
        throw new Retryable(new HttpError(msg, current, res.status), null);
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new HttpError(`more than ${MAX_REDIRECTS} redirects`, url, null);
}

export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const o = { ...DEFAULTS, ...opts };
  let last: HttpError | null = null;
  let attempts = 0;
  for (let n = 0; n <= o.retries; n++) {
    if (o.deadline !== undefined && Date.now() >= o.deadline) {
      if (last) break;
      throw new HttpError("time budget exhausted; request not started", url, null);
    }
    attempts++;
    try {
      return await attempt(url, o);
    } catch (e) {
      if (!(e instanceof Retryable)) throw e;
      last = e.inner;
      if (n < o.retries) {
        const backoff = o.backoffMs * 2 ** n;
        const wait = e.waitMs ?? backoff + Math.floor(Math.random() * o.backoffMs * 0.25);
        if (o.deadline !== undefined && Date.now() + wait >= o.deadline) {
          last.message = `${last.message}; time budget exhausted, not retrying`;
          break;
        }
        await sleep(wait);
      }
    }
  }
  const err = last ?? new HttpError("request failed", url, null);
  err.message = `${err.message} (after ${attempts} attempts)`;
  throw err;
}

export async function fetchJson<T = unknown>(url: string, opts: FetchOptions = {}): Promise<T> {
  const text = await fetchText(url, { accept: "application/json", ...opts });
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(`response is not JSON (${text.length} chars)`, url, 200);
  }
}
