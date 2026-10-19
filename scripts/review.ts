/**
 * npm run review                              list open items
 * npm run review -- list --reason unmatched --status open --limit 20
 * npm run review -- show <id>
 * npm run review -- resolve <id> [--brand hills] [--line hills/science-diet] [--level brand|line|lot] [--note "..."]
 * npm run review -- dismiss <id> [--note "..."]
 *
 * Recall text printed here is untrusted data from FDA; it is shown, never executed.
 */
import { userInfo } from "node:os";
import { parseArgs } from "node:util";
import { dismissReviewItem, getReviewItem, listReviewItems, resolveReviewItem } from "../src/review/queue";
import {
  MATCH_LEVELS,
  REVIEW_REASONS,
  REVIEW_STATUSES,
  type MatchLevel,
  type ReviewReason,
  type ReviewStatus,
} from "../src/types";
import { safeJson, safeLine } from "../src/lib/terminal";
import { openMigrated, runCli } from "./_cli";

const oneOf = <T extends string>(list: readonly T[], v: string | undefined, name: string): T | undefined => {
  if (v === undefined) return undefined;
  if (!(list as readonly string[]).includes(v)) throw new Error(`--${name} must be one of ${list.join(", ")}`);
  return v as T;
};

/** Printable single line: control characters removed so recall text cannot drive the terminal. */
const safe = safeLine;

runCli(async () => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      reason: { type: "string" },
      status: { type: "string" },
      limit: { type: "string" },
      brand: { type: "string" },
      line: { type: "string" },
      level: { type: "string" },
      note: { type: "string" },
    },
  });
  const [cmd = "list", idArg] = positionals;
  const db = await openMigrated();
  const id = () => {
    const n = Number(idArg);
    if (!Number.isInteger(n)) throw new Error(`usage: review ${cmd} <id>`);
    return n;
  };

  switch (cmd) {
    case "list": {
      const rows = await listReviewItems(db, {
        reason: oneOf<ReviewReason>(REVIEW_REASONS, values.reason, "reason"),
        status: oneOf<ReviewStatus>(REVIEW_STATUSES, values.status, "status"),
        limit: values.limit ? Number(values.limit) : undefined,
      });
      if (!rows.length) console.log("no review items");
      for (const r of rows)
        console.log(`#${r.id} [${r.reason}] ${r.source ?? ""}:${safe(r.sourceEventId, 60)} ${safe(r.firm, 40)} | ${safe(r.productDescription)}`);
      return;
    }
    case "show": {
      const d = await getReviewItem(db, id());
      if (!d) throw new Error("not found");
      console.log(safeJson({ item: d.item, event: d.event && { ...d.event, raw: undefined }, product: d.product && { ...d.product, raw: undefined }, matches: d.matches }));
      return;
    }
    case "resolve":
      await resolveReviewItem(db, {
        id: id(),
        reviewer: process.env.REVIEWER ?? userInfo().username,
        brandId: values.brand,
        lineId: values.line,
        level: oneOf<MatchLevel>(MATCH_LEVELS, values.level, "level"),
        notes: values.note,
      });
      console.log("resolved");
      return;
    case "dismiss":
      await dismissReviewItem(db, id(), values.note);
      console.log("dismissed");
      return;
    default:
      throw new Error(`unknown command '${cmd}' (list | show | resolve | dismiss)`);
  }
});
