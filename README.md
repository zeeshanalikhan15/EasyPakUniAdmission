# Pakistani University Admissions — یونیورسٹی داخلے

A **Urdu-first, mobile-first** guide to Pakistani university admissions, built for **F.Sc. students** who don't know where or when to apply.

Live: **[zeeshanalikhan15.github.io/EasyPakUniAdmission](https://zeeshanalikhan15.github.io/EasyPakUniAdmission/)**

## What it shows

For each university, one card with everything a student needs:

- 📅 **Admission dates** — the upcoming cycle (with tentative dates projected from last year) and the last cycle for reference
- ⏳ **Countdown** — the next 3 upcoming deadlines across all universities
- 🧪 **Entry test** and **application fee**
- ✅ **Eligibility** and a step-by-step **"how to apply"**
- 📚 **Free test-prep resources** — YouTube channels/playlists, past papers, mock tests, and websites

## Universities

FAST NUCES · LUMS · NUST · UET Lahore · GIKI · PUCIT · PIEAS

## Features

- **Urdu-first (RTL)** with an English toggle — language persists and the whole layout flips
- **Mobile-first** single-column design
- **Localized dates** (Urdu month names via `Intl`)
- SEO/AI-ready: JSON-LD structured data, `llms.txt`, `sitemap.xml`, `robots.txt`, Open Graph tags

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-i18next (Urdu / English)

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## Deployment

Deploys automatically to GitHub Pages on every push to `main`:

1. `.github/workflows/deploy.yml` builds the app
2. `deploy.sh` force-pushes `dist/` to the `prod` branch
3. GitHub Pages serves the `prod` branch

No manual steps — `git push` to `main` is all it takes.

## Project structure

```
src/
  data/
    types.ts         # shared schema (the contract)
    <id>.json        # one file per university (dates, fee, apply URL)
    index.ts         # loads + validates all universities
  i18n/
    en.ts / ur.ts    # all display text: names, steps, eligibility, resources
  components/        # App, UniversityCard, Timeline, LanguageToggle
  lib/dates.ts       # date formatting + "next upcoming" logic
public/
  llms.txt, robots.txt, sitemap.xml   # SEO / AI-discoverability
```

### Adding a university

1. Create `src/data/<id>.json` (copy an existing one — the `types.ts` schema is the contract)
2. Add `id` to the union in `src/data/types.ts`
3. Import + register it in `src/data/index.ts`
4. Add its text to `src/i18n/en.ts` and `src/i18n/ur.ts`

### Updating admission dates

Edit `src/data/<id>.json` by hand (dates change yearly — see `DECISIONS.md` for the update workflow).

## Note

Dates change every year. Always confirm on the official website before applying.
