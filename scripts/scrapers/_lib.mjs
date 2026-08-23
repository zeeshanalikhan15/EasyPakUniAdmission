import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import https from "node:https";
import http from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../src/data");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export async function fetchHtml(url, maxRedirects = 5) {
  if (maxRedirects <= 0) throw new Error(`too many redirects for ${url}`);
  const u = new URL(url);
  const mod = u.protocol === "http:" ? http : https;
  return new Promise((resolve, reject) => {
    const req = mod.get(
      u,
      {
        headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
        rejectUnauthorized: false, // some uni sites have broken/self-signed certs
      },
      (res) => {
        const status = res.statusCode || 0;
        const loc = res.headers.location;
        if (status >= 300 && status < 400 && loc) {
          res.resume();
          resolve(fetchHtml(new URL(loc, u).toString(), maxRedirects - 1));
          return;
        }
        if (status >= 400) {
          res.resume();
          reject(new Error(`HTTP ${status} for ${url}`));
          return;
        }
        res.setEncoding("utf8");
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      },
    );
    req.on("error", reject);
  });
}

export function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns array of tables; each table = array of rows; each row = array of cell strings.
export function extractTables(html) {
  const tables = [];
  for (const tbl of html.match(/<table[\s\S]*?<\/table>/gi) || []) {
    const rows = [];
    for (const tr of tbl.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
      const cells = [];
      for (const cell of tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []) {
        const v = cell
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();
        if (v) cells.push(v);
      }
      if (cells.length) rows.push(cells);
    }
    if (rows.length) tables.push(rows);
  }
  return tables;
}

function iso(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function normalize(s) {
  return String(s)
    .replace(/\([^)]*\)/g, " ")
    .replace(/onwards?/gi, " ")
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b,?/gi, " ")
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDate(s) {
  if (!s) return null;
  const str = normalize(s);
  // "15-Mar-2026" / "15/Mar/2026"
  let m = str.match(/^(\d{1,2})\s*[-/]\s*([A-Za-z]{3,9})\s*[-/]\s*(\d{4})$/);
  if (m) return iso(+m[3], MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
  // "March 5, 2026" / "March 5 2026"
  m = str.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) return iso(+m[3], MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]);
  // "5 Oct 2025" / "5 Oct, 2025"
  m = str.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})$/);
  if (m) return iso(+m[3], MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
  // "19/07/2026" / "19-07-2026"
  m = str.match(/^(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})$/);
  if (m) return iso(+m[3], +m[2], +m[1]);
  // fallback: use local date components (avoid UTC shift)
  const d = new Date(str);
  return Number.isNaN(d.getTime())
    ? null
    : iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function parseRange(s) {
  if (!s) return null;
  const str = normalize(s);
  const month = (name) => MONTHS[name.slice(0, 3).toLowerCase()];

  // "August 29 & 30, 2026"
  let m = str.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})\s*&\s*(\d{1,2}),?\s+(\d{4})$/);
  if (m) return { date: iso(+m[4], month(m[1]), +m[2]), endDate: iso(+m[4], month(m[1]), +m[3]) };
  // "July 6 – 10, 2026"
  m = str.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})\s*[–—]\s*(\d{1,2}),?\s+(\d{4})$/);
  if (m) return { date: iso(+m[4], month(m[1]), +m[2]), endDate: iso(+m[4], month(m[1]), +m[3]) };

  const parts = str.split(/\s*[–—]\s*|\s+-\s+|\s+to\s+/i);
  if (parts.length >= 2) {
    let a = parts[0].trim();
    let b = parts.slice(1).join(" ").trim();
    if (!/\d{4}/.test(a) && /\d{4}/.test(b)) a += " " + b.match(/\d{4}/)[0];
    if (!/\d{4}/.test(b) && /\d{4}/.test(a)) b += " " + a.match(/\d{4}/)[0];
    const am = a.match(/[A-Za-z]{3,9}/);
    const bm = b.match(/[A-Za-z]{3,9}/);
    if (!bm && am) b = `${am[0]} ${b}`;
    if (!am && bm) a = `${bm[0]} ${a}`;
    const d = parseDate(a);
    const e = parseDate(b);
    if (d && e) return { date: d, endDate: e };
    if (d) return { date: d };
  }
  const d = parseDate(str);
  return d ? { date: d } : null;
}

function yearOfId(id) {
  const m = String(id).match(/(\d{4})/);
  return m ? +m[1] : 0;
}

function inferYear(events) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const classes = sorted.find((e) => e.type === "classes");
  const anchor = classes || sorted[sorted.length - 1];
  return +anchor.date.slice(0, 4);
}

// Merge scraped events into src/data/<id>.json.
// Upserts events by type(+series) into the matching cycle, preserving events the
// scraper did not find (e.g. LUMS "decisions"/"classes" come from other pages).
export function writeUniversity(id, events, { cycle = null } = {}) {
  const path = resolve(DATA_DIR, `${id}.json`);
  const uni = JSON.parse(readFileSync(path, "utf8"));
  const isNust = id === "nust";
  const year = inferYear(events);
  const cid = cycle?.id ?? `${isNust ? "net" : "fall"}-${year}`;
  const title = cycle?.title ?? `${isNust ? "NET" : "Fall"} ${year}`;

  const existing = (uni.cycles || []).find((c) => c.id === cid);
  let merged;
  if (existing) {
    merged = [...existing.events];
    for (const ev of events) {
      const i = merged.findIndex(
        (e) => e.type === ev.type && (e.series ?? "") === (ev.series ?? ""),
      );
      if (i >= 0) merged[i] = ev;
      else merged.push(ev);
    }
    merged.sort((a, b) => a.date.localeCompare(b.date));
  } else {
    merged = events;
  }

  const newCycle = { id: cid, title, events: merged };
  const others = (uni.cycles || []).filter((c) => c.id !== cid);
  uni.cycles = [newCycle, ...others].sort((a, b) => yearOfId(b.id) - yearOfId(a.id));
  writeFileSync(path, `${JSON.stringify(uni, null, 2)}\n`);
  return { cycle: newCycle, path };
}

// Shared label map for the simple "label | date" schedule tables (FAST, GIKI).
export const SCHEDULE_LABELS = [
  [/application\s+start/i, "applicationOpen"],
  [/application\s+deadline/i, "applicationClose"],
  [/financial\s+assistance/i, "financialAid"],
  [/admission\s+test/i, "test"],
  [/merit\s+list/i, "merit"],
  [/commencement\s+of\s+classes/i, "classes"],
];

// Generic scraper for a two-column "label | date" HTML table.
export async function scrapeLabelDateTable(id, url, labelMap) {
  const html = await fetchHtml(url);
  const events = [];
  for (const rows of extractTables(html)) {
    for (const cells of rows) {
      if (cells.length < 2) continue;
      const label = cells[0];
      const dateStr = cells[1];
      const entry = labelMap.find(([re]) => re.test(label));
      if (!entry) continue;
      const range = parseRange(dateStr);
      if (!range || !range.date) continue;
      events.push({ type: entry[1], ...range });
    }
  }
  if (!events.length) throw new Error(`${id}: no events parsed from ${url}`);
  return writeUniversity(id, events);
}
