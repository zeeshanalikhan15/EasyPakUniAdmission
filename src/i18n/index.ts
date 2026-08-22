import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { en } from "./en"
import { ur } from "./ur"

function applyDocumentLanguage(lang: string) {
  const dir = lang === "ur" ? "rtl" : "ltr"
  document.documentElement.lang = lang
  document.documentElement.dir = dir
  document.title = i18n.t("common.appName")
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: "ur",
    supportedLngs: ["ur", "en"],
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

i18n.on("languageChanged", applyDocumentLanguage)
applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language)

export default i18n
