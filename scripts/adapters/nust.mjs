export const id = "nust"

// Official sources. NOTE: nust.edu.pk bot-blocks plain fetches but IS reachable
// with a browser User-Agent; the dates-to-remember page renders its schedule as
// an HTML table that changes layout across years. A reliable parser needs the
// page structure studied and pinned — until then this adapter is a safe no-op
// (returns null) so the hand-curated data is never clobbered.
export const sources = [
  "https://ugadmissions.nust.edu.pk",
  "https://nust.edu.pk/admissions/undergraduates/dates-to-remember/",
]

export async function scrape() {
  return null
}
