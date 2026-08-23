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

## 2026-08-22

- Built the app: FAST, LUMS, NUST with admission dates, fees, eligibility and
  how-to-apply, Urdu-first with English toggle, mobile-first.
- Pushed to GitHub and deployed via GitHub Pages.
- Renamed repo `uni-admissions` → `EasyPakUniAdmission`.
- Added GitHub Pages deploy workflow (push to `main` → build → `prod` branch).
