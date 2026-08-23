// Usage: node scripts/validate.mjs <university-id>
// Validates src/data/<id>.json after a scraper has written it. Exits non-zero
// (and prints reasons) if the data is malformed or contains implausible dates —
// e.g. a scraper mis-parse. The workflow only commits when this passes, so a
// bad parse never updates the live data file.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const id = process.argv[2];
if (!id) {
  console.error("usage: node scripts/validate.mjs <id>");
  process.exit(2);
}

const VALID_TYPES = new Set([
  "applicationOpen", "applicationClose", "registrationOpen", "registrationClose",
  "test", "merit", "docsDeadline", "financialAid", "satDeadline", "actDeadline",
  "decisions", "classes",
]);

const file = resolve("src/data", `${id}.json`);
let uni;
try {
  uni = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`[validate] ${id}: invalid JSON — ${e.message}`);
  process.exit(1);
}

const nowYear = new Date().getFullYear();
const errors = [];

if (!Array.isArray(uni.cycles) || uni.cycles.length === 0) {
  errors.push("no cycles array");
}

for (const cycle of uni.cycles || []) {
  if (!cycle.id || !Array.isArray(cycle.events)) {
    errors.push(`cycle "${cycle.id}": missing id or events`);
    continue;
  }
  if (cycle.events.length === 0) {
    errors.push(`cycle "${cycle.id}": no events`);
  }
  for (const ev of cycle.events) {
    if (!VALID_TYPES.has(ev.type)) {
      errors.push(`cycle "${cycle.id}": unknown type "${ev.type}"`);
    }
    if (typeof ev.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(ev.date)) {
      errors.push(`cycle "${cycle.id}": bad date "${ev.date}"`);
      continue;
    }
    const year = +ev.date.slice(0, 4);
    if (year < nowYear - 2 || year > nowYear + 3) {
      errors.push(`cycle "${cycle.id}": implausible year ${year} (${ev.date})`);
    }
    if (ev.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(ev.endDate)) {
      errors.push(`cycle "${cycle.id}": bad endDate "${ev.endDate}"`);
    }
  }
}

if (errors.length) {
  console.error(`[validate] ${id}: FAILED`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`[validate] ${id}: OK`);
