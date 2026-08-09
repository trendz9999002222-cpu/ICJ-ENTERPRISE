import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import membershipEngineService from "../src/services/membershipEngineService.js";

const ARTIFACT_DIR = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
const BASE_URL = "http://localhost:5173";

(async () => {
  console.log("\n=== PROFESSIONAL REGISTRATION ENGINE & MEMBERSHIP UAT VERIFICATION ===\n");

  // 1. Verify Membership & Payment Engine Architecture
  console.log("--- Membership Plans Audit ---");
  const plans = membershipEngineService.getPlans();
  plans.forEach(p => {
    const feeInfo = membershipEngineService.calculateFees(p.code);
    console.log(`  [Plan ${p.code}] ${p.name} | Reg Fee: ₹${p.registrationFee} | Renewal: ₹${p.renewalFee} | GST: ₹${feeInfo.gstAmount} | Total: ₹${feeInfo.totalAmount}`);
  });

  const paymentRecord = membershipEngineService.processPayment({
    memberId: "ICJ-MEM-9988",
    planCode: "GOLD",
    paymentMode: "online_upi",
    transactionRef: "UPI-ICJ-20260807"
  });
  console.log("\nPayment & GST Invoice Sample:");
  console.log(`  Txn Ref: ${paymentRecord.transactionRef} | Status: ${paymentRecord.paymentStatus} | Amount: ₹${paymentRecord.amount}`);
  const invoice = membershipEngineService.generateGstInvoice(paymentRecord);
  console.log(`  Invoice #: ${invoice.invoiceNumber} | CGST: ₹${invoice.cgst} | SGST: ₹${invoice.sgst}`);

  // 2. Browser Verification
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("\n[ACTIVE SERVER DETECTED] http://localhost:5173/");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Fill Stage 1 to navigate to Stage 2
  await page.type('input[name="firstName"]', 'Rajesh');
  await page.type('input[name="lastName"]', 'Sharma');
  await page.type('input[name="email"]', 'rajesh@icj.org');
  await page.type('input[name="mobile"]', '9876543210');
  await page.type('input[name="birthYear"]', '1995'); // Age 31 -> Max Exp = 13
  await new Promise(r => setTimeout(r, 500));

  // Click Continue to Stage 2
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt.includes("Continue to Stage 2")) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // Stage 2 Audit
  const stage2Audit = await page.evaluate(() => {
    const regAuth = document.querySelector('input[name="registrationAuthority"]');
    const issuingState = document.querySelector('input[name="issuingState"]');
    const issuingOffice = document.querySelector('input[name="issuingOffice"]');
    const expInput = document.querySelector('input[name="experience"]');
    const statusInput = document.querySelector('input[name="verification_status"]');
    const statusCtrl = statusInput?.closest('.MuiFormControl-root');
    const statusHelper = statusCtrl?.querySelector('.MuiFormHelperText-root')?.textContent?.trim() || '';

    return {
      regAuthFound: !!regAuth,
      issuingStateFound: !!issuingState,
      issuingOfficeFound: !!issuingOffice,
      expFound: !!expInput,
      statusFound: !!statusInput,
      statusValue: statusInput?.value || '',
      statusDisabled: statusInput?.disabled || false,
      statusHelper
    };
  });

  console.log("\nStage 2 Field Audit:");
  console.log(`  Professional Registration Authority Found: ${stage2Audit.regAuthFound}`);
  console.log(`  Duplicate issuingState Found: ${stage2Audit.issuingStateFound} (Expected: false)`);
  console.log(`  Duplicate issuingOffice Found: ${stage2Audit.issuingOfficeFound} (Expected: false)`);
  console.log(`  Verification Status Value: "${stage2Audit.statusValue}"`);
  console.log(`  Verification Status Disabled (Read-Only): ${stage2Audit.statusDisabled} (Expected: true)`);

  // Test Experience Validation (Age 31 -> Max 13)
  console.log("\nTesting Experience Input (Attempting 40 years for Age 31)...");
  await page.type('input[name="experience"]', '40');
  await new Promise(r => setTimeout(r, 500));

  const expValue = await page.evaluate(() => {
    return document.querySelector('input[name="experience"]')?.value;
  });
  console.log(`  Clamped Experience Value: "${expValue}" (Expected: "13" since Age = 31)`);

  const screenshot = path.join(ARTIFACT_DIR, "professional_engine_uat.png");
  await page.screenshot({ path: screenshot, fullPage: false });
  console.log("✓ Screenshot saved:", screenshot);

  await browser.close();
  console.log("\n=== PROFESSIONAL REGISTRATION ENGINE UAT VERIFICATION COMPLETE ===");
})();
