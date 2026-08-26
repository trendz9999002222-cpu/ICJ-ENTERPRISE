const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto("http://localhost:5173/join?role=advocate", { waitUntil: "networkidle2" });

  // Click proceed
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const proceed = btns.find(b => b.innerText.includes("Proceed") || b.innerText.includes("आगे बढ़ें") || b.innerText.includes("Select"));
    if (proceed) proceed.click();
  });

  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: "scratch/step2_crystal_clear.png" });
  console.log("Screenshot saved to scratch/step2_crystal_clear.png");

  const text = await page.evaluate(() => document.body.innerText);
  console.log("Step 2 text preview:", text.slice(0, 350));

  await browser.close();
})();
