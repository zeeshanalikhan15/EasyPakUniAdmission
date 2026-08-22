export const id = "lums"

// Official source. NOTE: the LUMS admission portal (admissions.lums.edu.pk) is a
// JavaScript single-page app — the schedule is rendered client-side, so there is
// no stable server-rendered table to scrape. Until a structured source is found
// (their PDF prospectus, an API endpoint, or a static schedule page), this
// adapter returns null so the existing data is preserved.
export const sources = ["https://admissions.lums.edu.pk"]

export async function scrape() {
  return null
}
