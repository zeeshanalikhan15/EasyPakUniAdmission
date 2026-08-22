import { useTranslation } from "react-i18next"
import { universities } from "./data/universities"
import type { AdmissionEvent, University } from "./data/universities"
import {
  countdownTarget,
  daysUntil,
  formatDate,
  nextEventInUniversity,
} from "./lib/dates"
import LanguageToggle from "./components/LanguageToggle"
import UniversityCard from "./components/UniversityCard"

interface Deadline {
  uni: University
  next: AdmissionEvent
}

function App() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const deadlines: Deadline[] = universities.flatMap((uni) => {
    const next = nextEventInUniversity(uni)
    return next ? [{ uni, next }] : []
  })

  const globalNext = deadlines.reduce<Deadline | null>(
    (best, x) =>
      !best || countdownTarget(x.next) < countdownTarget(best.next) ? x : best,
    null,
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-[#f6f4ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              🎓
            </span>
            <h1 className="text-lg font-extrabold leading-tight text-stone-900">
              {t("common.appName")}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <p className="text-sm text-stone-600">{t("common.tagline")}</p>

        {globalNext && (
          <div className="mt-4 rounded-2xl bg-emerald-800 p-4 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
              {t("common.nextDeadline")}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-lg font-bold">{t(`events.${globalNext.next.key}`)}</span>
              <span className="text-emerald-100">· {globalNext.uni.shortName}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-3xl font-extrabold leading-none">
                {daysUntil(countdownTarget(globalNext.next))}
              </span>
              <span className="text-emerald-100">{t("common.daysLeft")}</span>
              <span className="text-emerald-100">
                — {formatDate(countdownTarget(globalNext.next), lang)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {universities.map((uni) => (
            <UniversityCard key={uni.id} uni={uni} />
          ))}
        </div>

        <p className="mt-8 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200">
          {t("common.disclaimer")}
        </p>
      </main>
    </div>
  )
}

export default App
