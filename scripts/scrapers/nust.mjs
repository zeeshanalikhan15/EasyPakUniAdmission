import { writeUniversity, parseRange } from "./_lib.mjs";
import { chromium } from "playwright";

const URL = "https://nust.edu.pk/admissions/undergraduates/dates-to-remember/";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// NUST test cells carry several ranges ("31 Jan – 15 Feb 2026 (Isb) 25 – 26 Mar …").
// Pull just the first clean range.
function firstRange(s) {
  const m = String(s).match(
    /\d{1,2}\s+[A-Za-z]{3,9}\s*[–—–-]\s*\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}/,
  );
  return m ? m[0] : null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: UA, ignoreHTTPSErrors: true });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(8000);
  const tables = await page.evaluate(() =>
    Array.from(document.querySelectorAll("table")).map((t) =>
      Array.from(t.querySelectorAll("tr")).map((r) =>
        Array.from(r.querySelectorAll("th,td")).map((c) => c.innerText.trim().replace(/\s+/g, " ")),
      ),
    ),
  );
  await browser.close();

  const seriesTable =
    tables.find((t) =>
      t.some((r) => /online registration/i.test(r.join(" "))),
    ) || tables[0];

  const events = [];
  for (const row of seriesTable) {
    if (row.length < 3) continue;
    const m = row[0].match(/series\s*[–-]?\s*(\d)/i);
    if (!m) continue;
    const series = `Series ${m[1]}`;

    // Registration column is always a single clean range ("5 Oct – 25 Nov 2025").
    const reg = parseRange(row[1]);
    if (reg?.date) events.push({ type: "registrationOpen", series, date: reg.date });
    if (reg?.endDate) events.push({ type: "registrationClose", series, date: reg.endDate });

    // Test column can hold several ranges ("… (Isb) … (Qta)"); take the first.
    const test = parseRange(firstRange(row[2]) ?? row[2]);
    if (test?.date) {
      events.push({
        type: "test",
        series,
        date: test.date,
        ...(test.endDate ? { endDate: test.endDate } : {}),
      });
    }
  }

  if (!events.length) throw new Error("nust: no events parsed");
  const { cycle, path } = writeUniversity("nust", events);
  console.log(`[nust] wrote ${cycle.id} (${events.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[nust] FAILED:", e.message);
  process.exit(1);
});
