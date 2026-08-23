const { chromium } = require("playwright");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const targets = [
  ["FAST — admission schedule", "https://www.nu.edu.pk/Admissions/Schedule"],
  ["LUMS — admissions", "https://lums.edu.pk/admissions"],
  ["NUST — dates to remember", "https://nust.edu.pk/admissions/undergraduates/dates-to-remember/"],
  ["UET — admission portal", "https://admission.uet.edu.pk/"],
  ["GIKI — undergrad admissions", "https://giki.edu.pk/admissions/admissions-undergraduates/"],
  ["PUCIT — BS admission criteria", "https://pucit.edu.pk/admission-criteria/"],
  ["PIEAS — admissions", "https://admissions.pieas.edu.pk/"],
];

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: UA,
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
  });

  for (const [label, url] of targets) {
    const page = await context.newPage();
    try {
      let status = "?";
      const resp = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      });
      status = resp ? String(resp.status()) : "no-response";
      await page.waitForTimeout(7000);

      const title = await page.title().catch(() => "");
      const text = await page
        .evaluate(() => (document.body ? document.body.innerText : ""))
        .catch(() => "");
      const pdfs = await page
        .evaluate(() =>
          Array.from(document.querySelectorAll('a[href$=".pdf"], a[href*=".pdf"]'))
            .map((a) => a.href)
            .filter((h, i, arr) => arr.indexOf(h) === i)
            .slice(0, 5),
        )
        .catch(() => []);

      const dateRe = new RegExp(
        `(${MONTHS})\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}`,
        "gi",
      );
      const dates = [...new Set((text.match(dateRe) || []).slice(0, 8))];

      console.log(`### ${label}`);
      console.log(`  url=${url}`);
      console.log(`  status=${status}`);
      console.log(`  title=${title}`);
      console.log(`  dates=${dates.join(" | ") || "(none in rendered text)"}`);
      if (pdfs.length) console.log(`  pdfs=${pdfs.join(" , ")}`);
    } catch (e) {
      console.log(`### ${label}`);
      console.log(`  url=${url}`);
      console.log(`  ERROR: ${String(e.message).split("\n")[0]}`);
    } finally {
      await page.close().catch(() => {});
    }
    console.log("");
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
