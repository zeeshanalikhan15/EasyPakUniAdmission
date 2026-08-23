import { fetchHtml, extractTables, parseRange, writeUniversity } from "./_lib.mjs";

const URL = "https://www.nu.edu.pk/Admissions/Schedule";

// FAST shows the schedule in a table headed "Tentative Admission Schedule 2026"
// with columns [label, Undergraduate, Graduate]; cells carry no year, so borrow
// it from the header. Dates look like "May 20 (Wed) - Jun 26 (Fri)".
function pickSchedule(tables) {
  return tables.find((rows) =>
    rows.some((cells) => /admission application submission/i.test(cells[0] ?? "")),
  );
}

function headerYear(rows) {
  for (const cells of rows) {
    const m = cells.join(" ").match(/admission schedule\s*(\d{4})/i);
    if (m) return +m[1];
  }
  return new Date().getFullYear();
}

function withYear(s, year) {
  return /\d{4}/.test(s) ? s : `${s} ${year}`;
}

async function main() {
  const html = await fetchHtml(URL);
  const rows = pickSchedule(extractTables(html));
  if (!rows) throw new Error("fast: schedule table not found");
  const year = headerYear(rows);
  const events = [];

  for (const cells of rows) {
    if (cells.length < 2) continue;
    const label = cells[0];
    const dateStr = withYear(cells[1], year);

    if (/admission application submission/i.test(label)) {
      const r = parseRange(dateStr);
      if (r?.date) events.push({ type: "applicationOpen", date: r.date });
      if (r?.endDate) events.push({ type: "applicationClose", date: r.endDate });
    } else if (/admission tests?/i.test(label)) {
      const r = parseRange(dateStr);
      if (r?.date) events.push({ type: "test", ...r });
    } else if (/merit list/i.test(label)) {
      const r = parseRange(dateStr);
      if (r?.date) events.push({ type: "merit", date: r.date });
    } else if (/commencement of classes/i.test(label)) {
      const r = parseRange(dateStr);
      if (r?.date) events.push({ type: "classes", date: r.date });
    }
  }

  if (!events.length) throw new Error("fast: no events parsed");
  const { cycle, path } = writeUniversity("fast", events);
  console.log(`[fast] wrote ${cycle.id} (${events.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[fast] FAILED:", e.message);
  process.exit(1);
});
