import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
const BASE_URL = "http://localhost:5173";

(async () => {
  console.log("\n=== PHASE 2 VERIFICATION — AGE ELIGIBILITY ENGINE ===\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("[ACTIVE SERVER DETECTED] http://localhost:5173/");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Audit DOB removal and Birth Year presence
  const domAudit = await page.evaluate(() => {
    const dobField = document.querySelector('input[name="dob"]');
    const birthYearInput = document.querySelector('input[name="birthYear"]');
    const ctrl = birthYearInput?.closest('.MuiFormControl-root');
    const label = ctrl?.querySelector('label')?.textContent?.trim() || '';
    const helper = ctrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';

    return {
      dobFieldFound: !!dobField,
      birthYearFound: !!birthYearInput,
      label,
      helper
    };
  });

  console.log("DOB & Birth Year Audit:");
  console.log(`  Date of Birth (dob) Found: ${domAudit.dobFieldFound} (Expected: false)`);
  console.log(`  Birth Year (birthYear) Found: ${domAudit.birthYearFound} (Expected: true)`);
  console.log(`  Label: "${domAudit.label}"`);
  console.log(`  Initial Helper Text: "${domAudit.helper}"`);

  // 2. Test Underage Input (e.g. 2015)
  console.log("\nTesting Underage Input (2015)...");
  await page.type('input[name="birthYear"]', '2015');
  await new Promise(r => setTimeout(r, 500));

  const underageState = await page.evaluate(() => {
    const input = document.querySelector('input[name="birthYear"]');
    const ctrl = input?.closest('.MuiFormControl-root');
    const helper = ctrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';
    const isError = ctrl?.classList.contains('Mui-error') || input?.classList.contains('Mui-error');
    return { value: input?.value, helper, isError };
  });

  console.log(`  Value: "${underageState.value}"`);
  console.log(`  Error State: ${underageState.isError}`);
  console.log(`  Helper Text: "${underageState.helper}"`);

  // 3. Test Eligible Input (e.g. 1995)
  console.log("\nTesting Eligible Input (1995)...");
  // Backspace 4 times
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.type('input[name="birthYear"]', '1995');
  await new Promise(r => setTimeout(r, 500));

  const eligibleState = await page.evaluate(() => {
    const input = document.querySelector('input[name="birthYear"]');
    const ctrl = input?.closest('.MuiFormControl-root');
    const helper = ctrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';
    const isError = ctrl?.classList.contains('Mui-error') || input?.classList.contains('Mui-error');
    return { value: input?.value, helper, isError };
  });

  console.log(`  Value: "${eligibleState.value}"`);
  console.log(`  Error State: ${eligibleState.isError}`);
  console.log(`  Helper Text: "${eligibleState.helper}"`);

  const screenshot = path.join(ARTIFACT_DIR, "phase2_age_eligibility.png");
  await page.screenshot({ path: screenshot, fullPage: false });
  console.log("✓ Screenshot saved:", screenshot);

  await browser.close();
  console.log("\n=== PHASE 2 VERIFICATION COMPLETE ===");
})();
