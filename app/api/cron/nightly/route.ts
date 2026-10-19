import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/db/client";
import { runNightly } from "@/jobs/nightly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
/** Leave headroom under maxDuration so the job finishes its ingest_runs rows and responds. */
const BUDGET_MS = (maxDuration - 20) * 1000;

function authorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Vercel Cron sends GET with "Authorization: Bearer $CRON_SECRET". */
export async function GET(request: Request): Promise<Response> {
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runNightly(await getDb(), { budgetMs: BUDGET_MS });
  // Counts and error messages only; never echo fetched recall text.
  return Response.json(
    {
      ok: result.errors.length === 0,
      ires: result.ires,
      listing: result.listing,
      matched: result.matched,
      reviewItemsOpened: result.reviewItemsOpened,
      errors: result.errors.map((e) => ({ stage: e.stage, message: e.message })),
    },
    { status: result.errors.length ? 500 : 200 },
  );
}
