# Decisions

Key decisions for this project and why. Add a dated entry when a significant
choice is made; don't delete old ones.

## Update workflow

When the user asks to "update" the admission data:
1. Web-search each university's latest admission schedule and update the dates in `src/data/<id>.json` by hand.
2. Also search for any new/updated test-prep resources and add them to the `resources` list in `src/i18n/en.ts` and `src/i18n/ur.ts`.

## 2026-08-23 — Per-university JSON data, no automated scraping

- **Data lives in `src/data/<id>.json`** (one file per university) with a shared
  schema in `src/data/types.ts`. JSON (not TS) so it's easy to read/edit and
  machine-diffable.
- **Event model uses a `type` enum + optional `series`** (e.g. `type: "test",
  series: "Series 1"`) so NUST's 2–4 NET series each carry their own
  registration + test dates, while the app auto-translates the type.
- **"Next upcoming" shows the 3 closest events** (not a single "next deadline").
- **No automated scraping.** These universities have no stable API (LUMS is a
  JS single-page app, NUST bot-blocks, and dates change yearly), so an
  auto-scraper can't run reliably. Dates are updated manually via web research.
  (A scraper + scheduled GitHub Actions workflow was built, then removed for
  this reason.)

## 2026-08-23 — Admission scraper (weekly auto-update)

**Supersedes the "no automated scraping" note above.** The earlier blockers
(NUST bot-blocks, LUMS JS, yearly date changes) were solved with a real browser
(Playwright) and targeted per-site parsers.

- **One scraper + one workflow per university** (`scripts/scrapers/<id>.mjs` +
  `.github/workflows/scrape-<id>.yml`) so changing one never affects another. A
  shared `_lib.mjs` holds generic helpers (date/range parsing, cert-bypass
  fetch, JSON upsert).
- **Fully automated, no review gate** — the weekly run scrapes → validates →
  auto-commits to `main`. The safety net is the **validation gate**
  (`scripts/validate.mjs`), which blocks the commit (and fails the job, so
  GitHub emails) if the data is malformed or has implausible dates.
- **Daily, staggered cron.** Access: FAST/GIKI/PIEAS/LUMS/PUCIT via
  plain HTTPS; NUST via Playwright (Cloudflare); UET held (site down `522`).
- **Coverage: 6 of 7.** UET is parked on the `scraper-uet` branch until its
  server recovers (issue #3).

## 2026-08-23 — BS programmes listed per university

- Each university card now lists its **BS programmes** as linked chips (a
  `programs: { name, url }[]` list in `src/i18n/en.ts` + `ur.ts`, rendered in
  `UniversityCard.tsx`).
- **Descriptive content lives in i18n, not JSON** — the JSON files only carry
  dates/cycles (the scraper contract); programme names, eligibility, steps,
  resources and links are hand-curated in `en.ts`/`ur.ts`.
- **Links point to the official programme/department page where one exists**
  (FAST, LUMS, PUCIT, UET, GIKI, PIEAS each have per-program or per-department
  URLs). NUST is bot-blocked (Cloudflare 403), so its programmes link to the
  single undergraduate category page; per-program pages there aren't cleanly
  addressable.

## 2026-08-23 — Scholarships & financial aid

- Each card now shows a brief **"Scholarships & financial aid"** summary plus
  links to the official financial-aid page (UET → `facs.uet.edu.pk`, NUST →
  `fao.nust.edu.pk` + need-based-aid page, etc.). Same i18n pattern as
  programmes: descriptive text and links live in `en.ts`/`ur.ts`.

## 2026-08-22 — Deployment

- **Deploy via GitHub Pages "legacy" mode from a `prod` branch** — mirrors
  `zeeshanalikhan15.github.io`: `.github/workflows/deploy.yml` builds on push to
  `main` and `deploy.sh` force-pushes `dist/` to `prod`. Uses the built-in
  `GITHUB_TOKEN` (no extra secrets).
- **`vite.config.ts` uses `base: './'`** so the app works at the
  `/EasyPakUniAdmission/` subpath without hardcoding the repo name.

## 2026-08-22 — Stack

- **Vite + React 19 + TypeScript + Tailwind CSS v4 + react-i18next.**
- **Urdu-first (RTL), English toggle** via react-i18next + `dir` on `<html>`.
  Noto Nastaliq Urdu font; English uses Inter.
- **Target audience**: F.Sc. students. Content is simple, mobile-first, with
  countdowns and step-by-step "how to apply".
