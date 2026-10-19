# Next steps (as of 2026-10-19)

Build steps 1 and 2 are in place: catalog YAML in `data/`, FDA iRES + listing
ingestion, matcher, lot parser, 10-year validation in `docs/validation/`.
typecheck, lint, 349 tests, `validate:data` and `build` pass.

## Not done

1. **Update CLAUDE.md data sources.** USA: FDA iRES Enforcement Report CSV
   export (center CVM) as record source, fda.gov recalls listing JSON for
   early warning and notice links. openFDA food enforcement has no pet food.
   Canada: Health Canada open data daily full dump (open.canada.ca dataset
   `d38de914-c94c-429b-8ab1-8776c31643e3`) plus per-notice HTML; the old JSON
   API is gone. Tick the "verify endpoints" open question.
2. **Set up Neon** by following `neon.md`. Decide first whether to drop the
   Neon `functions` service (the nightly job runs on Vercel Cron). `.env*.local`
   is already gitignored.
3. **Deploy to Vercel** and test that FDA (iRES, fda.gov) accepts requests
   from Vercel's egress IPs. If not, run the fetch from GitHub Actions.
4. **Work the review queue** (`npm run review`): 339 open items, mostly
   lot_parse (246) and ambiguous (68). This is how the catalog grows.
5. **Unmatched pet-food events:** 11 of 180 have no brand match; see
   `docs/validation/report.md`.
6. **Skipped by stopping the build early:** final validation round and the
   code review (ingestion correctness, matching/lot parsing, security).
   Worth one focused review of `src/match/lots.ts` before anything can send a
   Stop email.
7. **Optional:** request an iRES API key (OII Unified Logon) to replace the
   undocumented CSV export.

Then build step 3 (signup, pets, foods, profile card) from `DESIGN.md`.
