/**
 * Printing untrusted recall text to a terminal. FDA text is stored as-is (cleanText does not
 * remove control characters), so anything the review CLI prints must neutralize C0/C1 controls
 * (C1 U+009B is a one-character CSI) and bidi overrides that could drive or spoof the terminal.
 */

/** C0, DEL, C1, and bidi embedding/override/isolate controls. */
const TERMINAL_UNSAFE = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u202a-\\u202e\\u2066-\\u2069]", "g");
/** What JSON.stringify leaves raw (it escapes C0 inside strings; C0 outside strings is its own indentation). */
const JSON_UNESCAPED_UNSAFE = new RegExp("[\\u007f-\\u009f\\u202a-\\u202e\\u2066-\\u2069]", "g");

/** Single printable line: unsafe characters become spaces, then truncated to `max`. */
export function safeLine(s: string | null | undefined, max = 120): string {
  return (s ?? "").replace(TERMINAL_UNSAFE, " ").slice(0, max);
}

/**
 * JSON.stringify for the terminal. JSON.stringify escapes U+0000-U+001F but leaves DEL, C1 and
 * bidi controls raw; this escapes them as \uXXXX so the output is still valid JSON.
 */
export function safeJson(value: unknown, indent = 2): string {
  return JSON.stringify(value, null, indent).replace(
    JSON_UNESCAPED_UNSAFE,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
