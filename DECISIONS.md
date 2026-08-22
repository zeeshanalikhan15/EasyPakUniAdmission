# Decisions

Key decisions for this project and why. Add a dated entry when a significant
choice is made; don't delete old ones.

## 2026-08-23 — Per-university JSON data + scraper

- **Data lives in `src/data/<id>.json`** (one file per university) with a shared
  schema in `src/data/types.ts`. Chose JSON over TS because the scraper can
  read/write it cleanly and it's machine-diffable.
- **Event model uses a `type` enum + optional `series`** (e.g. `type: "test",
  series: "Series 1"`). This lets NUST's 2–4 NET series each carry their own
  registration + test dates, while the app still auto-translates the type.
- **"Next upcoming" shows the 3 closest events** (not a single "next deadline"),
  because NUST alone has many near-term series deadlines worth surfacing.
- **Scraper is safe-by-design**: an adapter returns `null` when it can't parse
  confidently, and the orchestrator leaves the existing JSON untouched.
- **Twice-weekly refresh opens a PR** (Monday midday + Friday end-of-day,
  Pakistan time) — not auto-commit to main — so a human reviews scraped dates
  before they reach the live site.

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
