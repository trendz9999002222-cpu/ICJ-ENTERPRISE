import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:5173/register", { waitUntil: "networkidle0", timeout: 20000 });
await new Promise(r => setTimeout(r, 2500));

const genderLabel = await page.evaluate(() => {
  const inputs = document.querySelectorAll("input, select");
  for (const el of inputs) {
    if (el.name === "gender") {
      const ctrl = el.closest(".MuiFormControl-root");
      return ctrl?.querySelector("label")?.textContent?.trim() || "LABEL EMPTY";
    }
  }
  return "GENDER FIELD NOT FOUND";
});
console.log("[GENDER LABEL IN BROWSER]:", genderLabel);

const screenshot = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf/trace_after_fix.png";
await page.screenshot({ path: screenshot, fullPage: false });
console.log("Screenshot saved:", screenshot);
await browser.close();
