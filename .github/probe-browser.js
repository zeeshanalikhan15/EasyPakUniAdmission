const { chromium } = require("playwright");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const sites = [
  "https://www.nu.edu.pk/",
  "https://lums.edu.pk/",
  "https://nust.edu.pk/",
  "https://www.uet.edu.pk/",
  "https://giki.edu.pk/",
  "https://pucit.edu.pk/",
  "https://www.pieas.edu.pk/",
];

function challenge(body) {
  return /just a moment|cf-browser|checking your browser|attention required/i.test(
    body,
  );
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: UA,
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
  });

  for (const url of sites) {
    const page = await context.newPage();
    try {
      let status = "?";
      const resp = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      status = resp ? String(resp.status()) : "no-response";

      // Let any Cloudflare challenge resolve.
      await page.waitForTimeout(12000);

      const title = await page.title().catch(() => "");
      const text = await page
        .evaluate(() => (document.body ? document.body.innerText : ""))
        .catch(() => "");
      const flat = text.replace(/\s+/g, " ").slice(0, 180);
      const challenged = challenge(title + " " + text);

      console.log(`### ${url}`);
      console.log(`  status=${status}  challenged=${challenged}`);
      console.log(`  title=${title}`);
      console.log(`  snippet=${flat}`);
    } catch (e) {
      console.log(`### ${url}`);
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
