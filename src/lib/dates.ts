import type { AdmissionEvent, University } from "../data/universities"

const toDate = (iso: string) => new Date(`${iso}T00:00:00`)

/** Whole days from today until the given date (negative = past). */
export function daysUntil(iso: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((toDate(iso).getTime() - today.getTime()) / 86_400_000)
}

export function isPast(iso: string): boolean {
  return daysUntil(iso) < 0
}

/** Localised, human-friendly date, e.g. "5 October 2026" / "5 اکتوبر 2026". */
export function formatDate(iso: string, lang: string): string {
  const locale = lang === "ur" ? "ur-PK" : "en-GB"
  return toDate(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  })
}

export function formatEventDate(e: AdmissionEvent, lang: string): string {
  const start = formatDate(e.date, lang)
  return e.endDate ? `${start} – ${formatDate(e.endDate, lang)}` : start
}

/** An event is "upcoming" if it has not yet fully passed. */
export function eventIsUpcoming(e: AdmissionEvent): boolean {
  return daysUntil(e.date) >= 0 || (e.endDate != null && daysUntil(e.endDate) >= 0)
}

/** Date to count down to: the start date, unless it already started (then the end). */
export function countdownTarget(e: AdmissionEvent): string {
  return daysUntil(e.date) >= 0 ? e.date : (e.endDate ?? e.date)
}

/** Earliest upcoming event in a cycle, or null if the cycle is fully in the past. */
export function nextEventInCycle(events: AdmissionEvent[]): AdmissionEvent | null {
  const upcoming = events.filter(eventIsUpcoming)
  if (upcoming.length === 0) return null
  return upcoming.reduce((a, b) => (countdownTarget(a) < countdownTarget(b) ? a : b))
}

/** Earliest upcoming event across all of a university's cycles. */
export function nextEventInUniversity(uni: University): AdmissionEvent | null {
  let best: AdmissionEvent | null = null
  for (const c of uni.cycles) {
    const n = nextEventInCycle(c.events)
    if (n && (best === null || countdownTarget(n) < countdownTarget(best))) best = n
  }
  return best
}
