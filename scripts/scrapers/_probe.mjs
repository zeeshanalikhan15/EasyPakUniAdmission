// Dev-only probe: load a page in a real browser and dump the visible text,
// any popup/modal/notice elements, and any links that look like admission
// notices. Run with URLs as args, e.g.:
//   node scripts/scrapers/_probe.mjs "https://pu.edu.pk/home/admission_notices"
import { chromium } from "playwright";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error("usage: node _probe.mjs <url> [url...]");
  process.exit(1);
}

const POPUP_RE = /popup|modal|dialog|lightbox|overlay|marquee|modal-box|notification|toast|alert-box|noticeboard|notice-board|notice/i;

async function probe(browser, url) {
  const page = await browser.newPage({ userAgent: UA, ignoreHTTPSErrors: true });
  try {
    let status = null;
    try {
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      status = resp && resp.status();
    } catch (e) {
      console.log(`\n### ${url}\n  goto error: ${e.message}`);
      return;
    }
    // popups often appear after a delay
    await page.waitForTimeout(6000);

    const data = await page.evaluate((popupReSrc) => {
      const popupRe = new RegExp(popupReSrc, "i");
      const out = { title: document.title, links: [], popups: [] };

      // Visible links that look relevant
      for (const a of document.querySelectorAll("a[href]")) {
        const href = a.href || "";
        const text = (a.innerText || "").trim().replace(/\s+/g, " ");
        if (/notice|admission|more|schedule|apply|entry test|merit/i.test(href + " " + text)) {
          out.links.push({ text, href });
        }
      }

      // Elements that look like popups/modals/notice boards
      for (const el of document.querySelectorAll("*")) {
        const id = el.id || "";
        const cls = (typeof el.className === "string" ? el.className : "") || "";
        const tag = el.tagName.toLowerCase();
        if (!popupRe.test(id + " " + cls)) continue;
        const text = (el.innerText || "").trim().replace(/\s+/g, " ");
        if (!text) continue;
        // skip huge containers that merely contain a notice word somewhere
        if (text.length > 4000) continue;
        out.popups.push({ tag, id, cls: cls.slice(0, 80), text: text.slice(0, 1500) });
      }

      out.bodyText = (document.body.innerText || "").trim().replace(/\s+/g, " ");
      return out;
    }, POPUP_RE.source);

    console.log(`\n### ${url}\n  status: ${status}  title: ${data.title}`);
    console.log(`  bodyText length: ${data.bodyText.length}`);

    console.log(`\n  -- POPUP/MODAL/NOTICE elements (${data.popups.length}) --`);
    for (const p of data.popups) {
      console.log(`    [${p.tag}#${p.id}.${p.cls}]\n    ${p.text}\n`);
    }

    console.log(`\n  -- relevant links (${data.links.length}) --`);
    for (const l of data.links) {
      console.log(`    • ${l.text || "(no text)"}  ->  ${l.href}`);
    }

    // lines/sentences that mention a date, schedule, or admission window
    const dateLines = data.bodyText
      .split(/\s*[.;]\s*|\n/)
      .map((s) => s.trim())
      .filter((s) => /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|schedule|entry test|last date|deadline|portal (open|close)/i.test(s) && s.length < 400);
    console.log(`\n  -- DATE / SCHEDULE LINES (${dateLines.length}) --`);
    for (const s of dateLines.slice(0, 40)) console.log("    • " + s);

    console.log(`\n  -- BODY TEXT (first 4000) --`);
    console.log("    " + data.bodyText.slice(0, 4000));
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch({ headless: true });
try {
  for (const url of urls) await probe(browser, url);
} finally {
  await browser.close();
}
