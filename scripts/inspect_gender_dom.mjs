import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:5173/register", { waitUntil: "networkidle0", timeout: 20000 });
await new Promise(r => setTimeout(r, 2500));

// Deep label inspection using innerText and computed styles
const genderAnalysis = await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  for (const el of inputs) {
    if (el.name === "gender") {
      const ctrl = el.closest(".MuiFormControl-root");
      const label = ctrl?.querySelector("label");
      const span = label?.querySelector("span");
      const style = label ? window.getComputedStyle(label) : null;
      return {
        labelExists: !!label,
        labelTextContent: label?.textContent || "",
        labelInnerText: label?.innerText || "",
        spanTextContent: span?.textContent || "",
        dataShrink: label?.getAttribute("data-shrink") || "",
        labelTop: style?.top || "",
        labelTransform: style?.transform || "",
        labelFontSize: style?.fontSize || "",
        labelColor: style?.color || "",
        labelOpacity: style?.opacity || "",
        labelVisibility: style?.visibility || ""
      };
    }
  }
  return { error: "No gender input" };
});

console.log("GENDER LABEL DEEP ANALYSIS:");
console.log(JSON.stringify(genderAnalysis, null, 2));

// Take screenshot to visually confirm
const s = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf/trace_gender_zoom.png";
await page.screenshot({ path: s, fullPage: false, clip: { x: 0, y: 100, width: 800, height: 300 } });
console.log("Gender area screenshot:", s);

await browser.close();
