# BowlWatch

Free, email-only pet food recall watch (bowlwatch.ca). See `CLAUDE.md` for the
product decisions and `docs/ARCHITECTURE.md` for the code layout.

## Setup

```sh
npm install
npm run validate:data   # check data/**.yaml
npm test
```

Without `DATABASE_URL` everything runs on PGlite. Set `PGLITE_DIR=./.pglite`
to keep a local database between CLI runs:

```sh
PGLITE_DIR=./.pglite npm run seed
PGLITE_DIR=./.pglite npm run ingest:fda
PGLITE_DIR=./.pglite npm run review
```

Environment (production, set in Vercel): `DATABASE_URL` (Neon), `CRON_SECRET`.
