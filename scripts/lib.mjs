// Shared helpers for the admission-data scraper.
// Zero dependencies — uses Node's built-in fetch and fs/promises.

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

const MONTH_NAMES = Object.keys(MONTHS).join("|")

const pad = (n) => String(n).padStart(2, "0")
const iso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`

/** Fetch a page with a browser-like User-Agent (some sites 403 curl/Node default UA). */
export async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
  return res.text()
}

/** Strip tags/scripts so we can regex dates out of the visible text. */
export function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
}

/**
 * Extract date candidates from text, e.g. "26 June 2026" / "June 26, 2026".
 * Returns [{ iso, context }] where context is ~60 chars around the match so an
 * adapter can classify it (registration / test / merit / classes …).
 */
export function extractDateCandidates(text) {
  const results = []
  // "26 June 2026" (day month year) — most common on Pakistani admission pages
  const re = new RegExp(
    `(\\d{1,2})\\s+(${MONTH_NAMES})\\s+(20\\d{2})`,
    "gi",
  )
  let m
  while ((m = re.exec(text)) !== null) {
    const day = Number(m[1])
    const month = MONTHS[m[2].toLowerCase()]
    const year = Number(m[3])
    if (month && day >= 1 && day <= 31) {
      const context = text.slice(Math.max(0, m.index - 60), m.index + 60).trim()
      results.push({ iso: iso(year, month, day), context })
    }
  }
  return results
}
