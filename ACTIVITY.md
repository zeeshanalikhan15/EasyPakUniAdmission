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
- Moved the "dates change yearly" notice to the top and added a jump-nav to
  each university so you don't have to scroll the whole page.
- Added a "Test preparation" section per university (YouTube channels, free
  websites, Khan Academy).
- Added NUST NET Physics playlists (Physics Ka Manjan · Class 11 & 12).
- Added three more universities: UET, GIKI and PUCIT (data + bilingual content + resources).
- Increased Urdu line spacing (Nastaliq) so lines no longer merge; marked channel resources to check their entry test playlists.
- Added PIEAS university (data + bilingual content + resources).
- Fixed UET data: added the admission-application open date (June 8) and reconciled the conflicting classes-commence date (Sept 14 per admission portal).
- Recorded the update workflow: on each "update", also refresh the resources list.
- Fixed "upcoming" logic: only actionable events (apply/register/test) count as
  upcoming, so a closed cycle with a future "classes begin" no longer shows old dates.
- Added a "BS programmes offered" section to each university card — linked chips
  pointing to each programme's official page or department.
- Corrected programme lists while adding links: removed UET "BSc Software
  Engineering" (UET offers it only at MSc level), fixed PIEAS to its six actual
  BS programmes (no BS Nuclear/Mathematics), and completed GIKI to all 13
  (added Cyber Security, Engineering Sciences, Management Sciences).
- Added a "Scholarships & financial aid" section to each university card — a
  brief summary of the aid types plus links to the official financial-aid page.
- Researched scraper feasibility from GitHub Actions (headless Chromium passes
  Cloudflare for NUST/UET; curl is blocked), and mapped each university's actual
  schedule page and format.
- Built a per-university admission scraper + daily workflow for FAST,
  GIKI, PIEAS, LUMS, NUST and PUCIT, with a validation gate that blocks bad
  parses before commit. UET held (site down 522) on the `scraper-uet` branch.

## 2026-10-16

- Investigated the failing GitHub Actions scrapers. Two are failing: **PUCIT**
  (`no events parsed` — `pu.edu.pk` admission-notice pages now render an empty
  PHP-error template, "Undefined variable: adm_title/adm_description") and
  **UET** (`HTTP 403 for admission.uet.edu.pk/news`). FAST/GIKI/LUMS/NUST/PIEAS
  are all passing.
- Fixed the UET scraper: the news-page fetch used the plain-https `fetchHtml`
  helper and got a 403, while a real browser returns 200. Routed the news page
  through the Playwright browser already used for the downloads page, and
  refactored to share one browser across both sources. Verified locally
  (`wrote fall-2026 (1 events)` + `validate uet: OK`).
- Rewrote the PUCIT scraper to stop hardcoding notice IDs (698/693 had been
  unpublished — their pages now render a PHP "Undefined variable" error). It
  now reads the `admission_notices` index, selects the undergraduate notice by
  title, and parses the `from … to …` open/close window (with fallback
  `opens on`/`closes on` phrasings, and failure messages that list the index
  notices). "2nd Phase (Vacant
  Seats)" re-openings are treated as a no-op so they don't overwrite the main
  Phase-1 window (verified: `pucit.mjs` exits 0 without touching `pucit.json`).
- Added an official website link per university: new `website` field in the
  JSON schema (`src/data/types.ts` + all 7 JSON files), rendered as a link on
  each card's title in `UniversityCard.tsx`.
- Bumped `actions/checkout` and `actions/setup-node` from v4 (deprecated
  Node 20) to v7 across all eight GitHub Actions workflows.

## 2026-10-19

- Fixed an intermittent UET scraper failure: `findSchedulePdf` used a fixed
  8-second sleep before scanning the JS-rendered downloads list, so a slow load
  returned "0 PDF items" (the Oct 18 scheduled run). It now waits for the PDF
  links to appear (up to 30s) before scanning. The "Admission Process Schedule -
  Fall 2026" PDF is still present — it was just a load-timing issue.

## 2026-08-22

- Built the app: FAST, LUMS, NUST with admission dates, fees, eligibility and
  how-to-apply, Urdu-first with English toggle, mobile-first.
- Pushed to GitHub and deployed via GitHub Pages.
- Renamed repo `uni-admissions` → `EasyPakUniAdmission`.
- Added GitHub Pages deploy workflow (push to `main` → build → `prod` branch).
