import type { University } from "./types"
import fastJson from "./fast.json"
import lumsJson from "./lums.json"
import nustJson from "./nust.json"
import uetJson from "./uet.json"
import gikiJson from "./giki.json"
import pucitJson from "./pucit.json"

const VALID_TYPES = new Set([
  "applicationOpen",
  "applicationClose",
  "registrationOpen",
  "registrationClose",
  "test",
  "merit",
  "docsDeadline",
  "financialAid",
  "satDeadline",
  "actDeadline",
  "decisions",
  "classes",
])

function validate(uni: University, name: string): University {
  for (const cycle of uni.cycles) {
    for (const event of cycle.events) {
      if (!VALID_TYPES.has(event.type)) {
        console.warn(`[data] unknown event type "${event.type}" in ${name}.json`)
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
        throw new Error(`[data] invalid date "${event.date}" in ${name}.json`)
      }
    }
  }
  return uni
}

export const universities: University[] = [
  validate(fastJson as unknown as University, "fast"),
  validate(lumsJson as unknown as University, "lums"),
  validate(nustJson as unknown as University, "nust"),
  validate(uetJson as unknown as University, "uet"),
  validate(gikiJson as unknown as University, "giki"),
  validate(pucitJson as unknown as University, "pucit"),
]

export type { University, AdmissionCycle, AdmissionEvent, EventType } from "./types"
