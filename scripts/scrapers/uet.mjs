import { writeUniversity, parseDate, parseRange } from "./_lib.mjs";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const DOWNLOADS = "https://admission.uet.edu.pk/downloads";

// The downloads page renders its list via JS; use a real browser to find the
// "Undergraduate Admission Process Schedule" PDF (UUID filename).
async function findSchedulePdf() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: UA, ignoreHTTPSErrors: true });
  await page.goto(DOWNLOADS, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(8000);
  const items = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*=".pdf"]')).map((a) => {
      let el = a;
      let title = "";
      for (let i = 0; i < 5 && el; i++) {
        const t = el.innerText.trim().replace(/\s+/g, " ");
        if (t && t.length > 8 && t !== "Download") {
          title = t;
          break;
        }
        el = el.parentElement;
      }
      return { title, url: a.href };
    }).filter((x) => x.title),
  );
  await browser.close();

  const item = items.find((x) => /admission process schedule/i.test(x.title));
  if (!item) throw new Error(`uet: schedule PDF not found (${items.length} items seen)`);
  return item.url;
}

async function pdfText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`uet: HTTP ${res.status} for ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const doc = await getDocument({ data: buf, useWorkerFetch: false, isEvalSupported: false }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text;
}

// UET's schedule PDF is a table of labelled dates. Pull label→date pairs.
function parseSchedule(text) {
  const events = [];
  const rules = [
    [/ecat.*(test|exam)|admission test/i, "test"],
    [/merit list/i, "merit"],
    [/commencement.*classes|classes.*commence|start of classes/i, "classes"],
    [/application.*last date|last date.*application|online application/i, "applicationClose"],
  ];
  // Walk the text; for each known label, take the next date-like token.
  for (const [re, type] of rules) {
    const m = text.match(re);
    if (!m) continue;
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 200);
    const dates = after.match(/[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[-/][A-Za-z]{3,9}[-/]\d{4}/g);
    if (!dates) continue;
    for (const d of dates) {
      const date = parseDate(d);
      if (date) {
        events.push({ type, date });
        break;
      }
    }
  }
  return events;
}

async function main() {
  const url = await findSchedulePdf();
  const text = await pdfText(url);
  const events = parseSchedule(text);
  if (!events.length) throw new Error("uet: no events parsed from schedule PDF");
  const { cycle, path } = writeUniversity("uet", events);
  console.log(`[uet] wrote ${cycle.id} (${events.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[uet] FAILED:", e.message);
  process.exit(1);
});
