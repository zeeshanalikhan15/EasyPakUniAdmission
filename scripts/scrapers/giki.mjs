import { scrapeLabelDateTable, SCHEDULE_LABELS } from "./_lib.mjs";

const URL = "https://giki.edu.pk/admissions/admissions-undergraduates/";

async function main() {
  const { cycle, path } = await scrapeLabelDateTable("giki", URL, SCHEDULE_LABELS);
  console.log(`[giki] wrote ${cycle.id} (${cycle.events.length} events) -> ${path}`);
}

main().catch((e) => {
  console.error("[giki] FAILED:", e.message);
  process.exit(1);
});
