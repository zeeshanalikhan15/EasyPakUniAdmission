import { useTranslation } from "react-i18next"
import type { AdmissionEvent } from "../data/types"
import { formatEventDate, isPast } from "../lib/dates"

interface Props {
  events: AdmissionEvent[]
  lang: string
  color: string
}

export default function Timeline({ events, lang, color }: Props) {
  const { t } = useTranslation()

  return (
    <ol className="divide-y divide-stone-100">
      {events.map((e, i) => {
        const past = isPast(e.endDate ?? e.date)
        return (
          <li
            key={`${e.type}-${e.series ?? ""}-${e.date}-${i}`}
            className="flex items-start gap-3 py-3"
          >
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: past ? "#d6d3d1" : color }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-snug text-stone-800">
                {t(`events.${e.type}`)}
                {e.series && (
                  <span
                    className="ms-2 inline-block rounded-full px-2 py-0.5 align-middle text-[11px] font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {e.series}
                  </span>
                )}
                {e.tentative && (
                  <span className="ms-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[11px] font-semibold text-amber-700">
                    {t("common.tentative")}
                  </span>
                )}
              </div>
              <div className={`text-sm ${past ? "text-stone-400" : "text-stone-600"}`}>
                {formatEventDate(e, lang)}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
