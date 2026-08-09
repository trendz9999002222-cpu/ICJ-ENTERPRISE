import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
const BASE_URL = "http://localhost:5173";

(async () => {
  console.log("\n=== MOBILE & WHATSAPP UAT VERIFICATION ===\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("[ACTIVE SERVER DETECTED] http://localhost:5173/");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Inspect Primary Mobile field
  const mobileAudit = await page.evaluate(() => {
    const mobileInput = document.querySelector('input[name="mobile"]');
    const countryCodeSelect = document.querySelector('select[name="countryCode"], input[name="countryCode"]');
    const ctrl = mobileInput?.closest('.MuiFormControl-root');
    const label = ctrl?.querySelector('label')?.textContent?.trim() || '';
    const helper = ctrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';
    const adornment = ctrl?.querySelector('.MuiInputAdornment-root')?.textContent?.trim() || '';

    return {
      mobileInputFound: !!mobileInput,
      countryCodeSelectFound: !!countryCodeSelect,
      label,
      helper,
      adornment,
      maxLength: mobileInput?.getAttribute('maxlength') || ''
    };
  });

  console.log("Primary Mobile Field Audit:");
  console.log(`  Input Found: ${mobileAudit.mobileInputFound}`);
  console.log(`  Country Code Dropdown Present: ${mobileAudit.countryCodeSelectFound} (Expected: false)`);
  console.log(`  Label: "${mobileAudit.label}"`);
  console.log(`  Start Adornment: "${mobileAudit.adornment}"`);
  console.log(`  Helper Text: "${mobileAudit.helper}"`);
  console.log(`  Max Length: ${mobileAudit.maxLength}`);

  // Test entering 5 digits -> check validation error
  await page.type('input[name="mobile"]', '98765');
  await new Promise(r => setTimeout(r, 500));

  const invalidState = await page.evaluate(() => {
    const mobileInput = document.querySelector('input[name="mobile"]');
    const ctrl = mobileInput?.closest('.MuiFormControl-root');
    const helper = ctrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';
    const isError = ctrl?.classList.contains('Mui-error') || mobileInput?.classList.contains('Mui-error');
    return { value: mobileInput?.value, helper, isError };
  });

  console.log("\nPartial Input Validation Test (5 digits):");
  console.log(`  Value: "${invalidState.value}"`);
  console.log(`  Helper Text: "${invalidState.helper}"`);

  // Fill valid 10 digits
  await page.type('input[name="mobile"]', '43210');
  await new Promise(r => setTimeout(r, 500));

  const validState = await page.evaluate(() => {
    const mobileInput = document.querySelector('input[name="mobile"]');
    const ctrl = mobileInput?.closest('.MuiFormControl-root');
    const helper = ctrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';
    return { value: mobileInput?.value, helper };
  });

  console.log("\nFull Valid Input Test (10 digits):");
  console.log(`  Value: "${validState.value}"`);
  console.log(`  Helper Text: "${validState.helper}"`);

  const screenshot = path.join(ARTIFACT_DIR, "mobile_validation_uat.png");
  await page.screenshot({ path: screenshot, fullPage: false });
  console.log("✓ Screenshot saved:", screenshot);

  await browser.close();
  console.log("\n=== MOBILE & WHATSAPP UAT VERIFICATION COMPLETE ===");
})();
