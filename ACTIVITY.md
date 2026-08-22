# Activity log

Running log of what's been done (newest last).

## 2026-08-23

- Split data into per-university JSON files (`fast.json`, `lums.json`, `nust.json`)
  with a shared schema in `src/data/types.ts`; added `src/data/index.ts` loader.
- Added a `series` field to events so NUST's multiple NET series are first-class.
- Replaced the single "next deadline" banner with "next upcoming" showing the
  3 closest events.
- Added `DECISIONS.md` and `ACTIVITY.md` (per user's standing rule).
- Removed the scraper (`scripts/`), the scheduled refresh workflow, and
  `docs/scraping.md` — automated scraping doesn't work for these sites, so dates
  are updated manually via web research instead.

## 2026-08-22

- Built the app: FAST, LUMS, NUST with admission dates, fees, eligibility and
  how-to-apply, Urdu-first with English toggle, mobile-first.
- Pushed to GitHub and deployed via GitHub Pages.
- Renamed repo `uni-admissions` → `EasyPakUniAdmission`.
- Added GitHub Pages deploy workflow (push to `main` → build → `prod` branch).
