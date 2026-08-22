import { fetchHtml, stripTags, extractDateCandidates } from "../lib.mjs"

export const id = "fast"

// Official sources for FAST admission dates.
export const sources = [
  "https://admissions.nu.edu.pk", // main admissions portal
  "https://pwr.nu.edu.pk/pages/admission-schedule", // Peshawar campus publishes a schedule table
]

// Keywords that hint at each event type, checked against the ~60 chars of
// text around a matched date. Order matters — check more specific first.
function classify(context) {
  const c = context.toLowerCase()
  if (/merit/.test(c)) return "merit"
  if (/class/.test(c) || /commence/.test(c)) return "classes"
  if (/test/.test(c) || /entry/.test(c)) return "test"
  if (/last date|deadline|close/.test(c)) return "applicationClose"
  if (/apply|admission|open|start/.test(c)) return "applicationOpen"
  return null
}

/**
 * Best-effort scrape of FAST admission dates. Returns { cycles } on success,
 * or null when nothing could be confidently parsed (caller keeps existing data).
 */
export async function scrape() {
  const html = await fetchHtml(sources[1])
  const text = stripTags(html)
  const candidates = extractDateCandidates(text)

  const events = []
  for (const { iso: date, context } of candidates) {
    const type = classify(context)
    if (type) events.push({ type, date, tentative: false })
  }

  if (events.length === 0) return null

  // FAST publishes one fall intake per year. Group by the year of the last event.
  const year = Math.max(...events.map((e) => Number(e.date.slice(0, 4))))
  return {
    cycles: [
      {
        id: `fall-${year}`,
        title: `Fall ${year}`,
        events,
      },
    ],
  }
}
