import { fetchHtml, extractText, parseDate, writeUniversity } from "./_lib.mjs";

// PUCIT admission is run through University of the Punjab's centralised portal,
// so dates are announced in short notices rather than one stable schedule page.
// Sources: the PU admission-test portal + PUCIT's BS admission-criteria page.
const SOURCES = [
  "https://admissiontest.pu.edu.pk/",
  "https://pucit.edu.pk/admission-criteria/",
];

const RULES = [
  [/admission test.*(held on|on)\s+([\d/.-]+)/i, "test"],
  [/application.*(deadline|last date|close).*([\d/.-]+)/i, "applicationClose"],
];

async function main() {
  const events = [];
  for (const url of SOURCES) {
    let text;
    try {
      text = extractText(await fetchHtml(url));
    } catch {
      continue; // one source down shouldn't sink the scrape
    }
    for (const [re, type] of RULES) {
      for (const m of text.matchAll(new RegExp(re.source, "gi"))) {
        const date = parseDate(m[2]);
        if (date) events.push({ type, date });
      }
    }
    // fallback: any bare date on the test portal is very likely the test date
    if (url.includes("admissiontest")) {
      for (const m of text.matchAll(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b/g)) {
        const date = parseDate(m[1]);
        if (date && !events.some((e) => e.date === date)) events.push({ type: "test", date });
      }
    }
  }

  if (!events.length) throw new Error("pucit: no events parsed");
  const seen = new Set();
  const unique = events.filter((e) => (seen.has(`${e.type}:${e.date}`) ? false : seen.add(`${e.type}:${e.date}`)));
  const { cycle, path } = writeUniversity("pucit", unique);
  console.log(`[pucit] wrote ${cycle.id} (${unique.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[pucit] FAILED:", e.message);
  process.exit(1);
});
