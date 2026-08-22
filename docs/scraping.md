# Scraping admission data

The admission dates in `src/data/*.json` are updated by `scripts/scrape.mjs`.

## How it works

```
scripts/
  scrape.mjs            orchestrator — runs each adapter, safely merges results
  lib.mjs               shared helpers (fetch with browser UA, date extraction)
  adapters/
    fast.mjs            fetch + parse FAST schedule
    lums.mjs            LUMS source (currently no-op, see below)
    nust.mjs            NUST source (currently no-op, see below)
```

Each adapter declares its `sources` (the official URLs) and a `scrape()` that
returns `{ cycles: [...] }` or `null`. The orchestrator merges only the `cycles`
field, so the static fields (fee, apply URL, …) are never overwritten.

**Safety rule:** if an adapter can't confidently parse anything, it returns
`null` and the existing JSON is left untouched — the scraper never destroys data.

## Per-university sources & status

| University | Source | Status |
|------------|--------|--------|
| FAST       | `https://admissions.nu.edu.pk`, `https://pwr.nu.edu.pk/pages/admission-schedule` | reachable, best-effort regex parse |
| LUMS       | `https://admissions.lums.edu.pk` | JS single-page app — no server-rendered schedule yet |
| NUST       | `https://ugadmissions.nust.edu.pk`, `https://nust.edu.pk/admissions/undergraduates/dates-to-remember/` | reachable with a browser User-Agent, but needs a pinned table parser — currently no-op |

## Known limitations

- These universities do **not** publish a stable API. Dates live in HTML tables
  (and sometimes behind JavaScript or bot protection), so the parser is
  heuristic and will need occasional tuning when a page layout changes.
- LUMS and NUST currently fall back to `null` (keep existing data). To activate
  them, find a stable, fetchable source (PDF prospectus, a static mirror, or an
  API) and implement `scrape()` in their adapter.

## Running manually

```bash
node scripts/scrape.mjs
```

## Automation

`.github/workflows/refresh.yml` runs the scraper monthly (and on manual
dispatch). If data changed, it opens a pull request; merging the PR triggers the
normal deploy workflow, which rebuilds and publishes the site.
