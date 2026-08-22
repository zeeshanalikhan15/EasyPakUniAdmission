import type { AdmissionEvent, EventType, University } from "../data/types"

const toDate = (iso: string) => new Date(`${iso}T00:00:00`)

// Events a student acts on (apply / register / take a test). "Outcome" events
// (merit, decisions, classes) happen after the process and must not be treated
// as the "next thing to do" — otherwise a cycle whose only future date is
// "classes begin" would show its old, closed admission dates as "upcoming".
const ACTIONABLE: EventType[] = [
  "applicationOpen",
  "applicationClose",
  "registrationOpen",
  "registrationClose",
  "test",
  "docsDeadline",
  "financialAid",
  "satDeadline",
  "actDeadline",
]

function isActionable(e: AdmissionEvent): boolean {
  return ACTIONABLE.includes(e.type)
}

/** Whole days from today until the given date (negative = past). */
export function daysUntil(iso: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((toDate(iso).getTime() - today.getTime()) / 86_400_000)
}

export function isPast(iso: string): boolean {
  return daysUntil(iso) < 0
}

/** Localised, human-friendly date, e.g. "5 October 2026" / "5 اکتوبر، 2026". */
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

/**
 * Earliest *actionable* upcoming event in a cycle, or null if the cycle's
 * apply/test phase is over (a future "classes begin" alone does not count).
 */
export function nextEventInCycle(events: AdmissionEvent[]): AdmissionEvent | null {
  const upcoming = events.filter((e) => isActionable(e) && eventIsUpcoming(e))
  if (upcoming.length === 0) return null
  return upcoming.reduce((a, b) => (countdownTarget(a) < countdownTarget(b) ? a : b))
}

export interface UpcomingEvent {
  uni: University
  event: AdmissionEvent
  days: number
}

/** The `count` soonest actionable upcoming events across all universities. */
export function nextEvents(unis: University[], count: number): UpcomingEvent[] {
  const all: UpcomingEvent[] = unis.flatMap((uni) =>
    uni.cycles.flatMap((cycle) =>
      cycle.events
        .filter((e) => isActionable(e) && eventIsUpcoming(e))
        .map((event) => ({ uni, event, days: daysUntil(countdownTarget(event)) })),
    ),
  )
  return all.sort((a, b) => a.days - b.days).slice(0, count)
}
