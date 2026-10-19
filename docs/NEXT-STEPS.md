# Next steps (as of 2026-10-19)

## Live

- Neon Postgres (`production` branch, project `late-breeze-20845974`), postgres
  service only. Migrated, catalog seeded, 10-year FDA backfill loaded
  (751 events, 791 matches, 339 review items).
- Vercel project `bowlwatch`, connected to GitHub; pushes to `main` deploy
  to production. Env: `DATABASE_URL`,
  `CRON_SECRET` (copy in `.env.local`). Nightly cron 07:00 UTC; a manual run
  from Vercel reached iRES and the fda.gov listing with no errors, so no
  GitHub Actions fallback is needed.
- bowlwatch.ca and www on Cloudflare DNS (A 76.76.21.21, CNAME
  cname.vercel-dns.com, proxy off). Landing page live; sign-ups shown as
  "opening soon".

## Paused: email (owner's decision, 2026-10-19)

No email is sent. Signup is blocked on this too, because login is a magic link.
To resume:

1. Pick a provider (Postmark suggested), add its SPF/DKIM records in Cloudflare.
2. Mailing address for the CASL footer.
3. Review `src/match/lots.ts` before any Stop email; until then send Stop-level
   matches as Alerts.
4. Build step 3 with the schema proposed on 2026-10-19: `users`, `login_tokens`,
   `sessions`, `pets`, `pet_foods`, `alerts` (unique per pet_food and
   recall_event), `email_sends`. Hand-rolled magic link, one nightly digest per
   user. Screens per `DESIGN.md`.

## Not blocked on email

1. **Work the review queue** (`npm run review`, with `.env.local` sourced to
   hit production): 339 open items, mostly lot_parse (246) and ambiguous (68).
2. **Unmatched pet-food events:** 11 of 180 have no brand match; see
   `docs/validation/report.md`.
3. **Health Canada ingestion** (build step 5) through the same pipeline; the
   landing page lists it as "Coming soon".
4. **Optional:** request an iRES API key (OII Unified Logon) to replace the
   undocumented CSV export.
