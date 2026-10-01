import { writeUniversity, fetchHtml, extractText, parseDate } from "./_lib.mjs";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const DOWNLOADS = "https://admission.uet.edu.pk/downloads";
const NEWS = "https://admission.uet.edu.pk/news";

// ---------------------------------------------------------------------------
// Source 1 — the "Undergraduate Admission Process Schedule" PDF.
// The downloads page renders its list via JS, so we drive a real browser to
// find the schedule PDF, then extract text with pdfjs-dist.
// ---------------------------------------------------------------------------
async function findSchedulePdf() {
  const browser = await chromium.launch({ headless: true });
  try {
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
    const item = items.find((x) => /admission process schedule/i.test(x.title));
    if (!item) throw new Error(`schedule PDF not found (${items.length} PDF items seen)`);
    return item.url;
  } finally {
    await browser.close();
  }
}

async function pdfText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
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

function parseSchedule(text) {
  const events = [];
  const rules = [
    [/ecat.*(test|exam)|admission test/i, "test"],
    [/merit list/i, "merit"],
    [/commencement.*classes|classes.*commence|start of classes/i, "classes"],
    [/application.*last date|last date.*application|online application/i, "applicationClose"],
  ];
  for (const [re, type] of rules) {
    const m = text.match(re);
    if (!m) continue;
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 200);
    const dates = after.match(
      /[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[-/][A-Za-z]{3,9}[-/]\d{4}/g,
    );
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

// ---------------------------------------------------------------------------
// Source 2 — the news page (server-rendered, lightweight).
// Used as a fallback and for recent announcements. Conservative on purpose:
// only clear labels, so we don't mis-map "leftover seats" / "walk-in" wording.
// ---------------------------------------------------------------------------
async function scrapeNews() {
  const text = extractText(await fetchHtml(NEWS));
  const events = [];
  const rules = [
    [/merit\s*list/i, "merit"],
    [/application(s)?\s*(deadline|clos)/i, "applicationClose"],
  ];
  for (const [re, type] of rules) {
    const m = text.match(re);
    if (!m) continue;
    const after = text.slice(m.index, m.index + 400);
    const d = after.match(/\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s+\d{4}/);
    if (d) {
      const date = parseDate(d[0]);
      if (date) events.push({ type, date });
    }
  }
  return events;
}

async function main() {
  const events = [];
  const errors = [];

  // PDF first (full schedule), then news (fallback / recent).
  try {
    const url = await findSchedulePdf();
    events.push(...parseSchedule(await pdfText(url)));
  } catch (e) {
    errors.push(`pdf: ${e.message}`);
  }
  try {
    events.push(...(await scrapeNews()));
  } catch (e) {
    errors.push(`news: ${e.message}`);
  }

  // De-duplicate by type(+series)+date (both sources can surface the same event).
  const seen = new Set();
  const deduped = events.filter((e) => {
    const k = `${e.type}|${e.series ?? ""}|${e.date}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (!deduped.length) throw new Error(`uet: no events (${errors.join("; ")})`);
  const { cycle, path } = writeUniversity("uet", deduped);
  console.log(`[uet] wrote ${cycle.id} (${deduped.length} events) -> ${path}`);
  if (errors.length) console.warn(`[uet] partial — ${errors.join("; ")}`);
}

main().catch((e) => {
  console.error("[uet] FAILED:", e.message);
  process.exit(1);
});
