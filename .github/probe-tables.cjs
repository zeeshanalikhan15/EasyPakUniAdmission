const { chromium } = require("playwright");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: UA,
    ignoreHTTPSErrors: true,
  });

  // NUST — dump the dates-to-remember tables
  {
    const page = await context.newPage();
    try {
      await page.goto(
        "https://nust.edu.pk/admissions/undergraduates/dates-to-remember/",
        { waitUntil: "domcontentloaded", timeout: 40000 },
      );
      await page.waitForTimeout(8000);
      console.log("### NUST dates-to-remember — TABLES");
      const tables = await page.evaluate(() =>
        Array.from(document.querySelectorAll("table")).map((t) =>
          Array.from(t.querySelectorAll("tr"))
            .slice(0, 30)
            .map((r) =>
              Array.from(r.querySelectorAll("th,td"))
                .map((c) => c.innerText.trim().replace(/\s+/g, " "))
                .filter(Boolean)
                .join(" | "),
            )
            .filter(Boolean),
        ),
      );
      for (const [i, t] of tables.entries()) {
        console.log(`--- table ${i} ---`);
        t.forEach((row) => console.log(row));
      }
    } catch (e) {
      console.log("NUST ERROR: " + String(e.message).split("\n")[0]);
    } finally {
      await page.close();
    }
  }

  console.log("");

  // UET — dump the downloads page structure (titles + links)
  {
    const page = await context.newPage();
    try {
      await page.goto("https://admission.uet.edu.pk/downloads", {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      });
      await page.waitForTimeout(5000);
      console.log("### UET downloads — item titles");
      const items = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll("a[href$='.pdf']"),
        ).map((a) => {
          // walk up to find a likely card/row containing the title
          let el = a;
          for (let i = 0; i < 4 && el; i++) {
            const txt = el.innerText.trim().replace(/\s+/g, " ");
            if (txt && txt.length > 8 && txt !== "Download") return txt.slice(0, 100);
            el = el.parentElement;
          }
          return "(no title found)";
        }),
      );
      items.slice(0, 25).forEach((t, i) => console.log(`${i + 1}. ${t}`));
    } catch (e) {
      console.log("UET ERROR: " + String(e.message).split("\n")[0]);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
