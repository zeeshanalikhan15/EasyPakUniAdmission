# Activity log

Running log of what's been done (newest last).

## 2026-08-23

- Split data into per-university JSON files (`fast.json`, `lums.json`, `nust.json`)
  with a shared schema in `src/data/types.ts`; added `src/data/index.ts` loader.
- Added a `series` field to events so NUST's multiple NET series are first-class.
- Replaced the single "next deadline" banner with "next upcoming" showing the
  3 closest events.
- Added scraper: `scripts/scrape.mjs` + per-university adapters + `scripts/lib.mjs`.
- Added monthly refresh workflow `.github/workflows/refresh.yml` (cron + manual).
- Added `docs/scraping.md` documenting sources and limitations.
- Added `DECISIONS.md` and `ACTIVITY.md` (per user's standing rule).

## 2026-08-22

- Built the app: FAST, LUMS, NUST with admission dates, fees, eligibility and
  how-to-apply, Urdu-first with English toggle, mobile-first.
- Pushed to GitHub and deployed via GitHub Pages.
- Renamed repo `uni-admissions` → `EasyPakUniAdmission`.
- Added GitHub Pages deploy workflow (push to `main` → build → `prod` branch).
