import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
const BASE_URL = "http://localhost:5173";

(async () => {
  console.log("\n=== PHASE 1 VERIFICATION — PERSON NAME & SIGNATORY ENGINE ===\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("[ACTIVE SERVER DETECTED] http://localhost:5173/");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Check Individual Mode Name Fields
  const indFields = await page.evaluate(() => {
    const fields = [];
    document.querySelectorAll("input, select").forEach(el => {
      if (el.name && el.offsetParent !== null) {
        const ctrl = el.closest(".MuiFormControl-root");
        const label = ctrl?.querySelector("label")?.textContent?.trim() || "";
        fields.push({ name: el.name, label });
      }
    });
    return fields;
  });

  console.log("Individual Mode Name Fields:");
  const indNameNames = ["prefix", "firstName", "middleName", "lastName", "preferredName"];
  indNameNames.forEach(n => {
    const f = indFields.find(x => x.name === n);
    console.log(`  [${n}] ${f ? `PRESENT (label: "${f.label}")` : "MISSING"}`);
  });

  const indScreenshot = path.join(ARTIFACT_DIR, "phase1_individual_name.png");
  await page.screenshot({ path: indScreenshot, fullPage: false });
  console.log("✓ Screenshot saved:", indScreenshot);

  // 2. Switch to Organisation Mode
  console.log("\nSwitching to Organisation Mode...");
  const radioLabels = await page.$$("label");
  for (const lbl of radioLabels) {
    const txt = await page.evaluate(el => el.textContent, lbl);
    if (txt.includes("Organisation / Law Firm")) {
      await lbl.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Check Organisation & Authorised Signatory Fields
  const orgFields = await page.evaluate(() => {
    const fields = [];
    document.querySelectorAll("input, select").forEach(el => {
      if (el.name && el.offsetParent !== null) {
        const ctrl = el.closest(".MuiFormControl-root");
        const label = ctrl?.querySelector("label")?.textContent?.trim() || "";
        fields.push({ name: el.name, label });
      }
    });
    return fields;
  });

  console.log("\nOrganisation Mode & Authorised Signatory Fields:");
  const orgNameNames = [
    "organisationName",
    "authSignatoryPrefix",
    "authSignatoryFirstName",
    "authSignatoryMiddleName",
    "authSignatoryLastName",
    "authSignatoryDesignation",
    "authSignatoryMobile",
    "authSignatoryEmail",
    "authSignatoryLetterDocName"
  ];
  orgNameNames.forEach(n => {
    const f = orgFields.find(x => x.name === n);
    console.log(`  [${n}] ${f ? `PRESENT (label: "${f.label}")` : "MISSING"}`);
  });

  const orgScreenshot = path.join(ARTIFACT_DIR, "phase1_organisation_signatory.png");
  await page.screenshot({ path: orgScreenshot, fullPage: false });
  console.log("✓ Screenshot saved:", orgScreenshot);

  await browser.close();
  console.log("\n=== PHASE 1 VERIFICATION COMPLETE ===");
})();
