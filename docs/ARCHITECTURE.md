# BowlWatch architecture (build steps 1 and 2)

Scope right now: the normalization table, FDA ingestion and matching. No UI,
signup or email yet. Product decisions live in `CLAUDE.md`.

## Stack

Next.js 16 (App Router, TypeScript strict) on Vercel · Postgres on Neon in
production, PGlite locally and in tests · Drizzle ORM with SQL migrations in
`drizzle/` · Zod · `yaml` · papaparse · Vitest · tsx for CLI scripts.
TypeScript is pinned to 5.9 and ESLint to 9: TypeScript 7 and ESLint 10 are
newer than the Next tooling has been tested against.

## Data flow

```
data/**.yaml ──validate:data──▶ src/catalog/load.ts ──seed──▶ catalog tables
                                                                   │
                                          src/catalog/snapshot.ts ◀┘ (loadSnapshotFromDb)
                                                   │
FDA iRES CSV (CVM) ─┐                              ▼
                    ├─ src/ingest/* ─▶ recall_events / recall_products ─▶ src/match/run.ts (matchAll)
FDA listing JSON ───┘   (upsert, ingest_runs)                                   │
                                                  ┌─────────────────────────────┤
                                                  ▼                             ▼
                                   recall_events.pet_food, lot_rules,     review_items ─▶ npm run review
                                   recall_matches                         (manual match / dismiss)
```

Nightly: Vercel Cron (07:00 UTC, `vercel.json`) → `GET /api/cron/nightly`
(checks `Authorization: Bearer $CRON_SECRET`) → `runNightly(db)` in
`src/jobs/nightly.ts`. The same function runs from `npm run ingest:fda`.
Stages are isolated: a failure in one is recorded in `ingest_runs.errors` and
the others still run. The route returns counts and error messages only.

Production has no `data/` on disk: the matcher always reads the catalog from the
database via `loadSnapshotFromDb`. Tests and CLIs can use `snapshotFromCatalog`
on YAML. Both produce the same `CatalogSnapshot`.

## Module map

| Path | What | Status |
| --- | --- | --- |
| `src/types.ts` | Shared enums and interfaces (IresRow, ListingItem, EventInput, LotRule, Match, ...) | done, shared |
| `src/db/schema.ts` | Drizzle schema, all tables | done, shared |
| `src/db/client.ts` | `getDb()`, `migrateDb()`, `openPglite()`, `dbSizeBytes()` | done |
| `drizzle/` | Generated SQL migrations (`npm run db:generate`) | `0000_init.sql` |
| `src/lib/normalize.ts` | `normalizeText`, `tokens`, `cleanText`, `cleanNullable`, `decodeEntities`, `normalizeUpc` | done, shared |
| `src/lib/todo.ts` | `NotImplementedError` used by stubs | done |
| `src/lib/upc.ts` | `extractUpcs`: the one UPC extractor (ingestion and matcher both use it) | done |
| `src/catalog/schema.ts` | Zod schemas for the YAML | done |
| `src/catalog/load.ts` | Read + validate + cross-check all YAML, report every error | done |
| `src/catalog/seed.ts` | Replace catalog tables in one transaction | done |
| `src/catalog/snapshot.ts` | `CatalogSnapshot` from YAML or DB | done |
| `src/ingest/http.ts` | `fetchText` / `fetchJson` with UA, timeout, retry, size cap | done |
| `src/ingest/fda-ires.ts` | `buildIresExportUrl`, `classificationYearRanges`, `iresRowKey` (done); `fetchIresCsv`, `fetchIresRows` (splits at the 1000-row cap), `parseIresCsv`, `iresRowsToEvents` | done |
| `src/ingest/fda-listing.ts` | `fetchListing`, `parseListing`, `listingItemsToEvents` | done |
| `src/ingest/store.ts` | `upsertEvents`, `startIngestRun`, `finishIngestRun` | done |
| `src/match/lots.ts` | `parseLotRules(description, codeInfo, moreCodeInfo)` | done |
| `src/match/classify.ts` | `classifyEvent(event, index)` | done |
| `src/match/matcher.ts` | `buildCatalogIndex(snapshot)`, `matchProduct(text, index)`, `matchProductDetailed` | done |
| `src/match/run.ts` | `matchAll(db)`; refuses to run on an unseeded catalog | done |
| `src/match/report.ts` | `buildValidationReport()` | done |
| `src/match/db-report.ts` | `buildDbValidationReport()`, `renderMarkdown()` | done |
| `src/review/queue.ts` | list / show / resolve (manual match) / dismiss review items | done |
| `src/jobs/nightly.ts` | `runNightly(db, opts)`, `windowSlices` | done |
| `app/api/cron/nightly/route.ts` | Cron entry point | done |
| `scripts/*.ts` | CLI entry points (see npm scripts) | done |
| `test/helpers/db.ts` | `createTestDb()`: fresh migrated in-memory PGlite | done |
| `test/fixtures/` | Real FDA data, see below | done |
| `test/real-catalog.test.ts` | Seeds `data/` into PGlite, scores the 40 fixtures from the DB snapshot, runs ingest -> matchAll on 2021 rows | done |

## Ownership for parallel agents

| Agent | Owns (may create/edit freely) |
| --- | --- |
| Catalog-data agents | `data/**` only |
| Ingestion agent | `src/ingest/**`, `scripts/ingest*.ts`, `scripts/backfill*.ts`, tests next to them |
| Matcher agent | `src/match/**`, `scripts/report-validation.ts`, tests next to them |

Shared files: `src/types.ts`, `src/db/schema.ts`, `src/lib/normalize.ts`. Change
them **additively only** (new exports, new nullable columns, new enum values),
never rename or change behaviour of what exists, and add a line to the Change log
at the end of this file. A schema change also needs `npm run db:generate` and the
new migration committed; migrations are append-only, never edit `0000_init.sql`.
Anything else outside your area (`src/db/client.ts`, `src/catalog/**`,
`src/review/**`, `src/jobs/**`, `app/**`, configs): ask the orchestrator.

Stubs throw `NotImplementedError`. Keep the exported signatures; add helpers freely.
Put tests next to the code (`*.test.ts`) or under `test/`.

## Schema notes

- Catalog ids are YAML slugs; line ids are `<brand>/<line>`. `npm run seed`
  deletes and reinserts the catalog tables in one transaction.
- `aliases` is polymorphic: `entity_type` parent | brand | line | manufacturer.
  `kind`: name | firm | dba | label. Meaning for the matcher:
  - brand aliases of kind name/dba/label identify the brand on their own;
  - line aliases of kind `label` identify brand + line on their own;
  - line aliases of kind `name` (including the line name) only count once the
    brand is already established in the same text;
  - `firm` (brand owners' legal names) and manufacturers (co-packers) are
    supporting evidence only, never enough to name a brand.
- `recall_events` is source-agnostic: `source` fda_ires | fda_listing | hc,
  unique on (`source`, `source_event_id`). `linked_event_id` links a listing
  event to its iRES event. `pet_food` yes | no | unreviewed is set by the matcher.
- `recall_products.row_key` is globally unique: `${source}:${rowKey}` where the
  iRES rowKey is `${eventId}:${recallNumber}` or `${eventId}:h:<hash>` when the
  recall number is "N/A".
- `lot_rules.scope` (nullable) holds the UPC/SKU/size a rule is limited to.
  `needs_review = true` blocks Stop-level emails.
- `recall_matches` has no FK to brands/lines (the catalog is replaced on reseed);
  `seed` reports orphans. Unique on (event, product, brand, line) with
  NULLS NOT DISTINCT. `method = 'manual'` rows are never deleted by the matcher.
- `review_items` unique on (event, product, reason), NULLS NOT DISTINCT, so
  re-runs upsert instead of duplicating. Dismissed items stay dismissed.
- `ingest_runs` one row per source per run, with `db_size_bytes`.

## Source facts the code relies on

- openFDA has no pet food. US source = FDA iRES Enforcement Report CSV export,
  center CVM (`buildIresExportUrl`). Send `USER_AGENT` from `src/ingest/http.ts`;
  never use the key embedded in FDA's `service.js`.
- 1000-row cap per export. Backfill per classification year; nightly re-pulls a
  400-day classification window in 200-day slices (lag median 42 d, max 811 d).
- Parse by header name. 2016-2021 and 2023-2026 exports have 25 columns; the
  2022 export has 32 because `More Code Info` repeats 7 times. It is not a column
  "added in 2022": it appears when code info overflows. Join all of them.
- U+00BF replaces characters FDA could not encode (é, ®, °, apostrophes,
  zero-width); `cleanText`/`normalizeText` drop it.
- Postal codes can start with a tab character.
- Listing JSON: `field_regulated_product_field` is HTML-escaped
  (`Animal &amp; Veterinary`); `field_brand_name` is an `<a>` tag;
  `field_change_date_2` can be later than the recall. The live file had 62
  Animal & Veterinary items on 2026-10-18; the static archive has 134 (2017-2021).
- Health Canada (`HCRSAMOpenData.json`) is build step 5: not implemented, but
  the schema already takes `source = 'hc'`.
- All fetched text is untrusted: never eval, never render as HTML, strip tags
  when extracting, strip control characters before printing to a terminal.

## Fixtures (`test/fixtures/`, public FDA data, ~4 MB)

- `fda_cvm_pet_recalls_40.json`: 40 real rows with hand-written `expected`
  (brands, parent, line, lots, best_by, UPCs, `code_kind`, notes).
- `pet_food_rows_window.json`: 552 pet-food rows / 134 events (raw iRES rows).
- `ires/live_cvm_YYYY.csv`: raw CVM exports by classification year, 2016-2026.
- `listing/*.animal-vet.sample.json`: Animal & Veterinary items from the live
  (27) and static archive (15) listing JSON, raw and unmodified.

## Running

```sh
npm install
npm run typecheck && npm run lint && npm test
npm run validate:data
npm run build
npm run db:generate                     # after editing src/db/schema.ts
PGLITE_DIR=./.pglite npm run seed       # local persistent DB; omit for in-memory
PGLITE_DIR=./.pglite npm run backfill:fda -- --file test/fixtures/ires/live_cvm_2019.csv
PGLITE_DIR=./.pglite npm run review -- list --reason unmatched
PGLITE_DIR=./.pglite npm run report:validation   # writes docs/validation/report.md + events.json
npm run report:validation -- --fixtures-only        # offline fixture summary, no DB
```

Tests use `createTestDb()` (in-memory PGlite with migrations applied); no network.

## Change log

Shared-file changes, newest last. Format: date, agent, file, change.

- 2026-10-18, scaffold, all shared files: initial version.
- 2026-10-18, integration, `src/lib/upc.ts` (new): single `extractUpcs`; `src/ingest/fda-ires.ts` and `src/match/lots.ts` re-export it. Label may be glued to digits ("UPC3579...").
- 2026-10-18, integration, `src/match/run.ts`: `matchAll` throws when the catalog tables are empty.
- 2026-10-18, validation, `src/match/db-report.ts` (new), `scripts/report-validation.ts`: report over a backfilled DB; writes `docs/validation/report.md` and `events.json`. Markdown escapes all recall text; only https fda.gov URLs become links.
- 2026-10-18, validation fixes, `src/types.ts`: alias kind `short` (firm-corroborated), lot rule kind `suffix`, optional `EventClassification.excludedRows`; a code rule that carries dateFrom/dateTo is a conjunction (code AND best-by). `src/db/schema.ts`: `brands.upc_prefixes`; check constraints for the new kinds (migration `drizzle/0001_short_alias_suffix_rule_upc_prefixes.sql`). `src/catalog/schema.ts`: brand `upc_prefixes`.
- 2026-10-18, validation fixes, `src/lib/normalize.ts`: `normalizeUpc` reads 11-digit groupings and keeps the first 12 digits of a 13-digit value that is not a valid EAN-13; new `upcCheckDigitValid` / `ean13CheckDigitValid` exports. `src/lib/upc.ts`: unlabelled UPC-A with a valid check digit, 1-10-1 and 6-5 groupings, single-digit typo repair against sibling UPCs.
- 2026-10-18, validation fixes, `src/match/run.ts`: classification reads Reason for Recall; listing events match against their de-slugged title (`listingTitle`); `parseLotRules` gets the recall date, firm and "no code means all lots" (iRES only); rows in `excludedRows` are skipped; stored UPC cores are refreshed from the text; the listing linker breaks ties by product line and same-day initiation and falls back to the recalling firm when no brand is shared.
- 2026-10-18, second judge round, `src/types.ts`: lot rule kind `production_date` (dates parsed, value as printed, always needs review); review reason `upstream_ingredient`; optional `EventClassification.upstream`. `src/db/schema.ts`: `product_lines.upcs` and the check constraints for the new kinds (migration `drizzle/0002_line_upcs_production_date_upstream.sql`). `src/catalog/schema.ts`: line `upcs`.
- 2026-10-18, second judge round, `src/lib/normalize.ts` / `src/lib/upc.ts`: `normalizeUpc` keeps a valid non-0 EAN-13 whole and an 8-digit EAN-8 / UPC-E as printed, and repairs a 13-digit typo when exactly one single-digit deletion is a valid UPC-A (`upcDeletionCandidates`); `extractUpcs` reads "UPC item code", the 1-5-5-2 EAN-13 grouping, settles 11-digit and ambiguous 13-digit values against sibling UPCs, and never takes a number in a lot list for a UPC.
- 2026-10-18, second judge round, `src/match/lots.ts`: `parseLotRulesDetailed` returns `{ rules, unparsed }`; `parseLotRules` keeps its signature. No exact rule with an empty value any more: unread text goes to `unparsed` (the run writes it into the lot_parse review notes, prefixed "unread:"). `src/match/db-report.ts` counts a row with unread text as needs_review / mixed.
- 2026-10-18, second judge round, `src/match/run.ts`: listing links are recomputed on every run (no longer only unlinked items), need brand agreement, and use a wider window for follow-up notices and late listing dates; `dropCopiedUpcs` (exported); `upstream_ingredient` review items; `ClassifyInput.title` for listings.
