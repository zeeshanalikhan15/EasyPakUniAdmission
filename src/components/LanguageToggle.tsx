import { useTranslation } from "react-i18next"

const LANGS = [
  { code: "ur", label: "اردو" },
  { code: "en", label: "English" },
]

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? i18n.language

  return (
    <div className="flex shrink-0 rounded-full bg-stone-200 p-0.5" role="group" aria-label="Language">
      {LANGS.map((l) => {
        const active = lang === l.code
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => i18n.changeLanguage(l.code)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              active ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
            }`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
