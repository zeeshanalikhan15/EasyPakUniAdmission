import { fetchHtml, extractTables, extractText, parseDate, writeUniversity } from "./_lib.mjs";

const URL = "https://admissions.pieas.edu.pk/Admissions/schedule.html";

const LABELS = [
  [/last date to apply for first test/i, "applicationClose", "1st"],
  [/first written test/i, "test", "1st"],
  [/last date to apply for second test/i, "applicationClose", "2nd"],
  [/second written test/i, "test", "2nd"],
  [/announcement of merit/i, "merit", null],
];

function firstDate(str) {
  const m = str.match(/[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/);
  return m ? m[0] : str;
}

async function main() {
  const html = await fetchHtml(URL);
  const events = [];
  for (const rows of extractTables(html)) {
    for (const cells of rows) {
      if (cells.length < 2) continue;
      const label = cells[0];
      const entry = LABELS.find(([re]) => re.test(label));
      if (!entry) continue;
      const date = parseDate(firstDate(cells[1]));
      if (!date) continue;
      const ev = { type: entry[1], date };
      if (entry[2]) ev.series = entry[2];
      events.push(ev);
    }
  }
  const seen = new Set();
  const unique = events.filter((e) => {
    const k = `${e.type}:${e.series ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // PIEAS sometimes moves a test date with a "now held on …" note; prefer it.
  const heldOn = extractText(html).match(/held on\s+([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})/i);
  if (heldOn) {
    const moved = parseDate(heldOn[1]);
    const t2 = unique.find((e) => e.type === "test" && e.series === "2nd");
    if (moved && t2) t2.date = moved;
  }
  if (!unique.length) throw new Error("pieas: no events parsed");
  const { cycle, path } = writeUniversity("pieas", unique);
  console.log(`[pieas] wrote ${cycle.id} (${unique.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[pieas] FAILED:", e.message);
  process.exit(1);
});
