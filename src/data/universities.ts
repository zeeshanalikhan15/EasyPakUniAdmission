export interface AdmissionEvent {
  /** i18n key under `events.*`, e.g. "applyStart" */
  key: string
  /** ISO date, YYYY-MM-DD */
  date: string
  /** Optional end date for a range, e.g. a test window */
  endDate?: string
  /** True when the date is projected from last year, not yet officially confirmed */
  tentative?: boolean
}

export interface AdmissionCycle {
  id: string
  /** Short Latin label, e.g. "Fall 2027" — understood in both languages */
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

export const universities: University[] = [
  {
    id: "fast",
    shortName: "FAST",
    emoji: "💻",
    color: "#1d4ed8",
    applyUrl: "https://admissions.nu.edu.pk",
    fee: 3000,
    cycles: [
      {
        id: "fast-f27",
        title: "Fall 2027",
        events: [
          { key: "applyStart", date: "2027-05-18", tentative: true },
          { key: "applyEnd", date: "2027-06-25", tentative: true },
          { key: "test", date: "2027-06-29", endDate: "2027-07-10", tentative: true },
          { key: "merit", date: "2027-07-22", tentative: true },
          { key: "classes", date: "2027-08-16", tentative: true },
        ],
      },
      {
        id: "fast-f26",
        title: "Fall 2026",
        events: [
          { key: "applyStart", date: "2026-05-20" },
          { key: "applyEnd", date: "2026-06-26" },
          { key: "test", date: "2026-06-29", endDate: "2026-07-10" },
          { key: "merit", date: "2026-07-22" },
          { key: "classes", date: "2026-08-17" },
        ],
      },
    ],
  },
  {
    id: "lums",
    shortName: "LUMS",
    emoji: "🎓",
    color: "#9f1239",
    applyUrl: "https://admissions.lums.edu.pk",
    fee: 11500,
    cycles: [
      {
        id: "lums-f27",
        title: "Fall 2027",
        events: [
          { key: "applyStart", date: "2026-11-02", tentative: true },
          { key: "applyEnd", date: "2027-01-26", tentative: true },
          { key: "docsDeadline", date: "2027-01-27", tentative: true },
          { key: "test", date: "2027-02-14", tentative: true },
          { key: "decisions", date: "2027-04-15", endDate: "2027-07-31", tentative: true },
          { key: "classes", date: "2027-09-01", tentative: true },
        ],
      },
      {
        id: "lums-f26",
        title: "Fall 2026",
        events: [
          { key: "applyEnd", date: "2026-01-27" },
          { key: "docsDeadline", date: "2026-01-28" },
          { key: "test", date: "2026-02-15" },
          { key: "financialAid", date: "2026-02-28" },
          { key: "satDeadline", date: "2026-03-14" },
          { key: "actDeadline", date: "2026-04-11" },
          { key: "decisions", date: "2026-04-15", endDate: "2026-07-31" },
          { key: "classes", date: "2026-09-01" },
        ],
      },
    ],
  },
  {
    id: "nust",
    shortName: "NUST",
    emoji: "🏗️",
    color: "#0e7490",
    applyUrl: "https://ugadmissions.nust.edu.pk",
    fee: 5000,
    cycles: [
      {
        id: "nust-net1-27",
        title: "NET 2027 · Series 1",
        events: [
          { key: "applyStart", date: "2026-10-05", tentative: true },
          { key: "applyEnd", date: "2026-11-25", tentative: true },
          { key: "test", date: "2026-11-22", endDate: "2026-12-10", tentative: true },
        ],
      },
      {
        id: "nust-f27",
        title: "Fall 2027 intake",
        events: [
          { key: "merit", date: "2027-07-25", tentative: true },
          { key: "classes", date: "2027-09-01", tentative: true },
        ],
      },
      {
        id: "nust-f26",
        title: "Fall 2026",
        events: [
          { key: "applyStart", date: "2026-04-26" },
          { key: "applyEnd", date: "2026-06-18" },
          { key: "test", date: "2026-06-13", endDate: "2026-07-29" },
          { key: "classes", date: "2026-09-01" },
        ],
      },
    ],
  },
]
