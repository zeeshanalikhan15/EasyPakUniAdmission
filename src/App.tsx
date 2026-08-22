import { useTranslation } from "react-i18next"
import { universities } from "./data"
import { countdownTarget, formatDate, nextEvents } from "./lib/dates"
import LanguageToggle from "./components/LanguageToggle"
import UniversityCard from "./components/UniversityCard"

function App() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const upcoming = nextEvents(universities, 3)

  return (
    <div className="min-h-screen" id="top">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f6f4ef]/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-between gap-3 py-3">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl" aria-hidden="true">
                🎓
              </span>
              <h1 className="text-lg font-extrabold leading-tight text-stone-900">
                {t("common.appName")}
              </h1>
            </a>
            <LanguageToggle />
          </div>
          <nav
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
            aria-label="Universities"
          >
            {universities.map((uni) => (
              <a
                key={uni.id}
                href={`#${uni.id}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 transition hover:bg-stone-100"
              >
                <span aria-hidden="true">{uni.emoji}</span>
                {uni.shortName}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <p className="text-sm text-stone-600">{t("common.tagline")}</p>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200">
          <span className="shrink-0" aria-hidden="true">
            ⚠️
          </span>
          <span>{t("common.disclaimer")}</span>
        </p>

        {upcoming.length > 0 && (
          <div className="mt-4 rounded-2xl bg-emerald-800 p-4 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
              {t("common.nextUpcoming")}
            </div>
            <ol className="mt-2 space-y-3">
              {upcoming.map(({ uni, event, days }) => (
                <li
                  key={`${uni.id}-${event.type}-${event.date}`}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl leading-none" aria-hidden="true">
                    {uni.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold leading-snug">
                      {t(`events.${event.type}`)}
                      {event.series && <span className="text-emerald-200"> · {event.series}</span>}
                      <span className="text-emerald-200"> · {uni.shortName}</span>
                    </div>
                    <div className="text-xs text-emerald-100">
                      {formatDate(countdownTarget(event), lang)}
                    </div>
                  </div>
                  <div className="shrink-0 text-end">
                    <div className="text-xl font-extrabold leading-none">{days}</div>
                    <div className="text-[11px] text-emerald-100">{t("common.daysLeft")}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {universities.map((uni) => (
            <section key={uni.id} id={uni.id} className="scroll-mt-32">
              <UniversityCard uni={uni} />
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
