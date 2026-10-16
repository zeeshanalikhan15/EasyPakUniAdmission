import { fetchHtml, extractText, parseDate, writeUniversity } from "./_lib.mjs";

// PUCIT (FCIT) admits through University of the Punjab's centralised portal.
// Notice IDs rotate every cycle (e.g. 698/693 for Fall 2026 → 719 for the
// 2nd phase), so we don't hardcode them: read the admission-notices index,
// pick the notice(s) about undergraduate programmes, and parse the dates.
const INDEX = "https://pu.edu.pk/home/admission_notices";
const BASE = "https://pu.edu.pk";

// "8 September 2026" / "8th Sep, 2026" (day-first) or "September 8, 2026"
// (month-first). parseDate() accepts both.
const D = String.raw`(?:\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})`;
const NUMDATE = String.raw`\d{1,2}[-/]\d{1,2}[-/]\d{4}`;
const ANYDATE = String.raw`(?:${D}|${NUMDATE})`;

// Pull every /admission_notice/<id> link out of the index HTML, with its title.
function noticeLinks(html) {
  const seen = new Set();
  const links = [];
  const re = /<a\b[^>]*href="([^"]*admission_notice\/(\d+))"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (seen.has(m[2])) continue;
    const title = extractText(m[3]);
    if (!title) continue;
    seen.add(m[2]);
    links.push({ id: m[2], url: new URL(m[1], BASE).toString(), title });
  }
  return links;
}

function parseNotice(text) {
  const events = [];

  // "…from September 8, 2026 (08:00 AM) to September 28, 2026 (11:59 PM)."
  const range = text.match(
    new RegExp(`\\bfrom\\s+(${ANYDATE})[\\s\\S]{0,200}?\\bto\\s+(${ANYDATE})`, "i"),
  );
  if (range) {
    const open = parseDate(range[1]);
    const close = parseDate(range[2]);
    if (open) events.push({ type: "applicationOpen", date: open });
    if (close) events.push({ type: "applicationClose", date: close });
  }

  // Fallback open/close phrasings when "from…to" isn't used, e.g.
  // "online portal opens on 8 September 2026" / "portal closes on 28 September 2026".
  if (!events.some((e) => e.type === "applicationOpen")) {
    const m = text.match(
      new RegExp(`(?:portal|application|admissions?|registration)[\\s\\S]{0,60}?\\bopens?\\b\\s*(?:on|from)?\\s*:?\\s*(${ANYDATE})`, "i"),
    );
    if (m) {
      const date = parseDate(m[1]);
      if (date) events.push({ type: "applicationOpen", date });
    }
  }
  if (!events.some((e) => e.type === "applicationClose")) {
    const m = text.match(
      new RegExp(`(?:portal|application|admissions?|registration)[\\s\\S]{0,60}?\\bcloses?\\b\\s*(?:on)?\\s*:?\\s*(${ANYDATE})`, "i"),
    );
    if (m) {
      const date = parseDate(m[1]);
      if (date) events.push({ type: "applicationClose", date });
    }
  }

  // "2nd Admission Test … July 5, 2026" (ordinal + a date somewhere after).
  for (const m of text.matchAll(
    new RegExp(`(\\d(?:st|nd|rd|th)?)\\s*(?:pu\\s*)?admission\\s*test[\\s\\S]{0,160}?(${ANYDATE})`, "gi"),
  )) {
    const date = parseDate(m[2]);
    if (date) events.push({ type: "test", series: m[1].toLowerCase(), date });
  }

  // "last date for online registration … DATE"
  const reg = text.match(
    new RegExp(`last date for online registration[\\s\\S]{0,160}?(${ANYDATE})`, "i"),
  );
  if (reg) {
    const date = parseDate(reg[1]);
    if (date) events.push({ type: "registrationClose", date });
  }

  return events;
}

async function main() {
  const html = await fetchHtml(INDEX);
  const links = noticeLinks(html);
  const all = links.filter((l) => /undergraduate/i.test(l.title));
  if (!all.length) {
    const titles = links.map((l) => l.title).filter(Boolean);
    throw new Error(
      `pucit: no undergraduate notice in index. Notices found (${titles.length}): ${titles.join(" | ") || "(none parsed)"}`,
    );
  }

  // "2nd Phase (Vacant Seats)" re-openings are not a new admission cycle — they
  // post-date the already-recorded Phase-1 window, so we skip them rather than
  // overwrite the real applicationOpen/applicationClose with the re-opening.
  const REOPEN = /vacant\s*seats|2nd\s*phase|phase\s*2|second\s*phase|re-?open/i;
  const primary = all.filter((l) => !REOPEN.test(l.title));
  if (!primary.length) {
    console.log(`[pucit] only re-opening notice(s) live (${all.map((l) => l.title).join(" | ")}); nothing to write`);
    return; // exit 0, no data change
  }

  const events = [];
  const errors = [];
  for (const c of primary) {
    try {
      events.push(...parseNotice(extractText(await fetchHtml(c.url))));
    } catch (e) {
      errors.push(`${c.title}: ${e.message}`);
    }
  }

  // De-duplicate by type(+series)+date (the index can surface an event twice).
  const seen = new Set();
  const deduped = events.filter((e) => {
    const k = `${e.type}|${e.series ?? ""}|${e.date}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (!deduped.length) {
    const tried = primary.map((c) => `#${c.id} ${c.title}`).join(" | ");
    throw new Error(`pucit: no events parsed from ${tried}${errors.length ? ` (${errors.join("; ")})` : ""}`);
  }
  const { cycle, path } = writeUniversity("pucit", deduped);
  console.log(`[pucit] wrote ${cycle.id} (${deduped.length} events) -> ${path}`);
  if (errors.length) console.warn(`[pucit] partial — ${errors.join("; ")}`);
}

main().catch((e) => {
  console.error("[pucit] FAILED:", e.message);
  process.exit(1);
});
