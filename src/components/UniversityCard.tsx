import { useTranslation } from "react-i18next"
import type { AdmissionCycle, AdmissionEvent, University } from "../data/types"
import {
  countdownTarget,
  daysUntil,
  formatDate,
  nextEventInCycle,
} from "../lib/dates"
import Timeline from "./Timeline"

interface UniContent {
  name: string
  fullName: string
  testName: string
  desc: string
  feeNote: string
  eligibility: string
  steps: string[]
}

interface UpcomingCycle {
  cycle: AdmissionCycle
  next: AdmissionEvent
}

export default function UniversityCard({ uni }: { uni: University }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const u = t(`universities.${uni.id}`, { returnObjects: true }) as unknown as UniContent

  const cyclesWithNext: UpcomingCycle[] = uni.cycles
    .map((cycle) => ({ cycle, next: nextEventInCycle(cycle.events) }))
    .filter((c): c is UpcomingCycle => c.next !== null)
  const upcoming = cyclesWithNext.length
    ? cyclesWithNext.reduce((a, b) =>
        countdownTarget(a.next) < countdownTarget(b.next) ? a : b,
      )
    : undefined
  const pastCycles = uni.cycles.filter((c) => nextEventInCycle(c.events) === null)

  const feeValue =
    lang === "ur"
      ? `${uni.fee.toLocaleString("ur-PK", { numberingSystem: "latn" })} روپے`
      : `PKR ${uni.fee.toLocaleString("en-PK")}`

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
      <div className="h-1.5" style={{ backgroundColor: uni.color }} />

      <div className="p-5">
        {/* Header */}
        <header>
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none" aria-hidden="true">
              {uni.emoji}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold leading-tight text-stone-900">{u.name}</h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide text-white"
                  style={{ backgroundColor: uni.color }}
                >
                  {uni.shortName}
                </span>
              </div>
              <p className="text-sm text-stone-500">{u.fullName}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-600">{u.desc}</p>
        </header>

        {/* Quick facts */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-100">
            <div className="text-xs font-semibold text-stone-500">{t("common.entryTest")}</div>
            <div className="mt-1 text-sm font-bold text-stone-800">{u.testName}</div>
          </div>
          <div className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-100">
            <div className="text-xs font-semibold text-stone-500">{t("common.applicationFee")}</div>
            <div className="mt-1 text-sm font-bold text-stone-800">{feeValue}</div>
            <div className="text-xs text-stone-500">{u.feeNote}</div>
          </div>
        </div>

        {/* Next upcoming (single) */}
        {upcoming && (
          <div
            className="mt-4 rounded-xl p-4"
            style={{ backgroundColor: `${uni.color}14` }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {t("common.nextUpcoming")}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="font-bold text-stone-900">
                {t(`events.${upcoming.next.type}`)}
                {upcoming.next.series && <span> · {upcoming.next.series}</span>}
              </span>
              <span className="text-sm opacity-80">
                {formatDate(countdownTarget(upcoming.next), lang)}
              </span>
            </div>
            <div className="mt-1 text-2xl font-extrabold text-stone-900">
              {daysUntil(countdownTarget(upcoming.next))}
              <span className="ms-2 text-sm font-semibold opacity-70">{t("common.daysLeft")}</span>
            </div>
          </div>
        )}

        {/* Upcoming cycle timeline */}
        {upcoming && (
          <section className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-stone-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: uni.color }} />
              {t("common.upcoming")} · {upcoming.cycle.title}
            </h3>
            <Timeline events={upcoming.cycle.events} lang={lang} color={uni.color} />
          </section>
        )}

        {/* How to apply */}
        <section className="mt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">
            {t("common.howToApply")}
          </h3>
          <ol className="mt-2 space-y-2">
            {u.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: uni.color }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-stone-700">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Eligibility */}
        <section className="mt-5 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-100">
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">
            {t("common.eligibility")}
          </h3>
          <p className="mt-1 text-sm text-stone-700">{u.eligibility}</p>
        </section>

        {/* Apply */}
        <a
          href={uni.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-bold text-white transition hover:opacity-90"
          style={{ backgroundColor: uni.color }}
        >
          {t("common.applyNow")}
          <span aria-hidden="true">↗</span>
        </a>

        {/* Past cycles */}
        {pastCycles.length > 0 && (
          <details className="mt-5 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-100">
            <summary className="text-sm font-bold text-stone-600">
              {t("common.pastCycle")}
            </summary>
            <div className="mt-2 space-y-4">
              {pastCycles.map((cycle) => (
                <div key={cycle.id}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {cycle.title}
                  </div>
                  <Timeline events={cycle.events} lang={lang} color={uni.color} />
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </article>
  )
}
