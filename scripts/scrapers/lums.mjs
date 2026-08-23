import { fetchHtml, extractText, parseDate, writeUniversity } from "./_lib.mjs";

const URL = "https://admission.lums.edu.pk/critical-dates-all-programmes";

const LABELS = [
  ["UG Online Application Deadline", "applicationClose"],
  ["Deadline to upload supporting documents", "docsDeadline"],
  ["LUMS Common Admission Test", "test"],
  ["Financial Aid Application and documents", "financialAid"],
  ["Deadline to take SAT", "satDeadline"],
  ["Deadline to take ACT", "actDeadline"],
];

async function main() {
  const html = await fetchHtml(URL);
  const text = extractText(html);
  const events = [];
  for (const [label, type] of LABELS) {
    const i = text.indexOf(label);
    if (i < 0) continue;
    const rest = text.slice(i, i + 140);
    const m = rest.match(
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/,
    );
    if (!m) continue;
    const date = parseDate(m[0]);
    if (date) events.push({ type, date });
  }
  if (!events.length) throw new Error("lums: no events parsed");
  const { cycle, path } = writeUniversity("lums", events);
  console.log(`[lums] wrote ${cycle.id} (${events.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[lums] FAILED:", e.message);
  process.exit(1);
});
