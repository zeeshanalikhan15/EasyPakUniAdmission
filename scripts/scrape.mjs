// Admission-data scraper.
//
// Fetches each university's official source(s) and updates src/data/<id>.json.
// Safe-by-design: if an adapter can't confidently parse anything it returns
// null, and this script leaves the existing JSON untouched.
//
// Run manually:  node scripts/scrape.mjs
// Run on schedule: .github/workflows/refresh.yml (monthly cron + manual dispatch)

import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"
import * as fast from "./adapters/fast.mjs"
import * as lums from "./adapters/lums.mjs"
import * as nust from "./adapters/nust.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, "..", "src", "data")
const adapters = [fast, lums, nust]

/**
 * Backstop against a buggy adapter clobbering good data with garbage.
 * A real admission schedule has multiple distinct event types; a result with
 * a handful of identical events is almost certainly a mis-parse.
 */
function looksPlausible(result) {
  const events = (result.cycles ?? []).flatMap((c) => c.events ?? [])
  if (events.length < 3) return false
  return new Set(events.map((e) => e.type)).size >= 2
}

async function main() {
  let updated = 0

  for (const adapter of adapters) {
    const file = path.join(DATA_DIR, `${adapter.id}.json`)
    const existing = JSON.parse(await readFile(file, "utf8"))

    try {
      const result = await adapter.scrape()
      if (!result || !looksPlausible(result)) {
        console.warn(`[${adapter.id}] ⚠️  no plausible data scraped — keeping existing ${file}`)
        continue
      }
      // Keep static fields (id, fee, applyUrl, …) and only replace the cycles.
      const merged = { ...existing, cycles: result.cycles }
      await writeFile(file, JSON.stringify(merged, null, 2) + "\n", "utf8")
      console.log(`[${adapter.id}] ✅ updated ${file}`)
      updated += 1
    } catch (err) {
      console.error(`[${adapter.id}] ❌ ${err.message} — keeping existing ${file}`)
    }
  }

  console.log(`\nDone: ${updated}/${adapters.length} universities updated.`)
}

main()
