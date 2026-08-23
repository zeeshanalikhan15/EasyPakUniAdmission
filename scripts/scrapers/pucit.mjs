import { fetchHtml, extractText, parseDate, writeUniversity } from "./_lib.mjs";

// PUCIT (FCIT) admits through University of the Punjab's centralised portal.
// The BS dates live in two PU admission notices (plain HTML, not images):
//   #698 "Admission Notice for Undergraduate Programs 2026-27" — portal open/close
//   #693 "2nd Admission Test ... 2026-27" — test dates + registration deadline
const SOURCES = {
  admission: "https://pu.edu.pk/home/admission_notice/698",
  test: "https://pu.edu.pk/home/admission_notice/693",
};

// Non-capturing date patterns; wrap in a group at each call site.
const DATE = String.raw`\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s+\d{4}`;
const NUMDATE = String.raw`\d{1,2}[-/]\d{1,2}[-/]\d{4}`;

function find(text, re) {
  const m = text.match(re);
  return m ? parseDate(m[1]) : null;
}

async function main() {
  const events = [];

  const adm = extractText(await fetchHtml(SOURCES.admission));
  const open = find(adm, new RegExp(`online portal opens on:\\s*(${DATE})`, "i"));
  if (open) events.push({ type: "applicationOpen", date: open });
  const close = find(adm, new RegExp(`online portal closes on:\\s*(${DATE})`, "i"));
  if (close) events.push({ type: "applicationClose", date: close });

  const tst = extractText(await fetchHtml(SOURCES.test));
  const test1 = find(tst, new RegExp(`1st admission test\\s*\\((${NUMDATE})\\)`, "i"));
  if (test1) events.push({ type: "test", series: "1st", date: test1 });
  const test2 = find(tst, new RegExp(`second test.*?scheduled on\\s+(${DATE})`, "i"));
  if (test2) events.push({ type: "test", series: "2nd", date: test2 });
  const regClose = find(tst, new RegExp(`last date for online registration of 2nd pu admission test is\\s+(${DATE})`, "i"));
  if (regClose) events.push({ type: "registrationClose", series: "2nd", date: regClose });

  if (!events.length) throw new Error("pucit: no events parsed");
  const { cycle, path } = writeUniversity("pucit", events);
  console.log(`[pucit] wrote ${cycle.id} (${events.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[pucit] FAILED:", e.message);
  process.exit(1);
});
