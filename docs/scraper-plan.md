# Scraper & data-update plan

Status: **research notes — not yet implemented.** (Prior decision: a scraper was
built and then removed; see `DECISIONS.md`.)

## Goal

Crawl each university website, extract admission data, and keep the app's data
fresh automatically — with tests that fail when a page changes, run daily via
GitHub Actions.

## GitHub Actions limits — not the bottleneck

- Repo is public → GitHub Actions minutes are **free & unlimited**.
- Max job duration **6 h** — a 7-site crawl is minutes, not hours.
- Daily cron works, with two caveats:
  - scheduling is best-effort (can slip minutes under load);
  - scheduled workflows auto-disable after **60 days** of zero repo activity.

## Real blockers

1. **NUST bot-blocks** (Cloudflare `403` to non-browser requests). GitHub's
   datacenter IPs are even more likely to be blocked.
2. **LUMS is a JS single-page app** — much of the content isn't in the initial
   HTML.
3. **UET publishes dates/merit lists as PDFs**, not structured HTML.
4. Dates change yearly and are often announced via images/notices → brittle to
   parse automatically.

## Recommended approach: change-detection ("canary") scraper

- Crawler fetches each university's key pages daily.
  - Fetchable today via plain HTTP: **FAST, UET, GIKI, PIEAS, PUCIT**.
  - Blocked / JS: **NUST, LUMS** (needs a headless browser or proxy, or flag as
    "unreachable — check manually").
- Tests hit the real sites and assert a known content signature per page. If a
  page's markup/title/key dates change → test fails → we know to update.
- On change → workflow opens an **issue/PR** for human review. Do **not**
  silently overwrite the JSON with possibly-wrong dates.

## Open questions

1. **Scope** — change-detection only, vs. also auto-extract dates where a site
   is cleanly parseable (gated behind a review PR)?
2. **Where to run** — GitHub-hosted runner (free, possibly NUST-blocked) vs.
   local cron (bypasses some blocks, only runs when the machine is on)?

## Per-university status (as of 2026-08-23)

| University | Site | Fetchable? | Notes |
|---|---|---|---|
| FAST | nu.edu.pk | ✅ | program/scholarship pages reachable |
| LUMS | lums.edu.pk | ⚠️ | some content is a JS SPA |
| NUST | nust.edu.pk | ❌ | Cloudflare 403 to bots |
| UET | uet.edu.pk + dept subdomains | ✅ | dates often in PDFs |
| GIKI | giki.edu.pk | ✅ | |
| PUCIT | pucit.edu.pk | ✅ | self-signed cert → use `curl -k` |
| PIEAS | pieas.edu.pk | ✅ | |

## Key URLs (from the scholarship/program work)

- FAST scholarships: https://www.nu.edu.pk/Admissions/Scholarship
- LUMS financial aid: https://lums.edu.pk/financial-aid
- NUST need-based aid: https://nust.edu.pk/admissions/scholarships/need-based-financial-aid/
- UET FACS: https://facs.uet.edu.pk/
- GIKI scholarships: https://giki.edu.pk/admissions/admissions-undergraduates/scholarships-fa/
- PIEAS scholarships: https://www.pieas.edu.pk/scholarships/
- PUCIT scholarships: https://pucit.edu.pk/higher-education-scholarships/
