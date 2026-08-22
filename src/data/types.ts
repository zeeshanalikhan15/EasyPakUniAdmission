/**
 * Common schema shared by every university data file (src/data/<id>.json).
 *
 * The scraper (scripts/scrape.mjs) writes these JSON files, so this type
 * definition is the single contract between the scraper and the app.
 */

export type EventType =
  | "applicationOpen"
  | "applicationClose"
  | "registrationOpen"
  | "registrationClose"
  | "test"
  | "merit"
  | "docsDeadline"
  | "financialAid"
  | "satDeadline"
  | "actDeadline"
  | "decisions"
  | "classes"

export interface AdmissionEvent {
  /** One of the EventType values; translated via the `events.*` i18n keys */
  type: EventType
  /** Optional free-text tag, e.g. "Series 1" for NUST's multiple NET series */
  series?: string
  /** ISO date, YYYY-MM-DD */
  date: string
  /** Optional end date for a range (e.g. a test window) */
  endDate?: string
  /** True when the date is projected from last year, not yet confirmed */
  tentative?: boolean
}

export interface AdmissionCycle {
  id: string
  /** Short Latin label, e.g. "Fall 2027" / "NET 2027" — shown in both languages */
  title: string
  events: AdmissionEvent[]
}

export interface University {
  id: "fast" | "lums" | "nust"
  /** Latin brand short name, shown as a badge in both languages */
  shortName: string
  emoji: string
  /** Brand accent colour (hex) */
  color: string
  applyUrl: string
  /** Application / processing fee in PKR */
  fee: number
  cycles: AdmissionCycle[]
}
