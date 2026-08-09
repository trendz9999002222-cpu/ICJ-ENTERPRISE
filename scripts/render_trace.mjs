/**
 * ICJ RENDER TRACE — Puppeteer browser screenshot + DOM audit
 * Navigates to http://localhost:5173/register and captures:
 *   - Stage 1 screenshots (top + scroll)
 *   - All visible form fields with names/labels
 *   - Policy acceptance section DOM
 */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/Pawan/.gemini/antigravity/brain/1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
const BASE_URL = "http://localhost:5173";

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function captureFields(page) {
  return page.evaluate(() => {
    const fields = [];
    document.querySelectorAll("input, select, textarea").forEach(el => {
      const ctrl = el.closest(".MuiFormControl-root");
      const label = ctrl?.querySelector("label")?.textContent?.trim() || "";
      const visible = el.offsetParent !== null;
      if (visible || el.type === "hidden") {
        fields.push({
          name: el.name || el.getAttribute("name") || "(none)",
          type: el.type || el.tagName,
          label,
          visible,
          id: el.id || ""
        });
      }
    });
    return fields;
  });
}

async function captureConsentSection(page) {
  return page.evaluate(() => {
    // Find all checkboxes
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(el => ({
      id: el.id,
      name: el.name,
      label: el.closest(".MuiFormControlLabel-root")?.textContent?.trim()?.slice(0, 80) || "",
      checked: el.checked,
      visible: el.offsetParent !== null
    }));

    // Find all policy-related text sections
    const policyTexts = Array.from(document.querySelectorAll('[class*="Policy"],[class*="policy"],[class*="Consent"],[class*="consent"]'))
      .map(el => el.textContent?.trim()?.slice(0, 60));

    // Find MasterLegalConsent heading
    const heading = Array.from(document.querySelectorAll("h6, h5, h4"))
      .find(h => h.textContent.includes("Consent") || h.textContent.includes("Policy"));

    return {
      checkboxCount: checkboxes.length,
      checkboxes,
      policyTexts,
      consentHeading: heading?.textContent?.trim()?.slice(0, 80) || "NOT FOUND"
    };
  });
}

(async () => {
  console.log("\n=== ICJ RENDER TRACE — PUPPETEER BROWSER AUDIT ===\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // === STAGE 1 ===
  console.log("[ACTIVE SERVER DETECTED] http://localhost:5173/");
  console.log("\n--- Stage 1: Navigating to /register ---");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0", timeout: 20000 });
  await sleep(2000);

  // Screenshot: Stage 1 top
  const s1top = path.join(ARTIFACT_DIR, "trace_stage1_top.png");
  await page.screenshot({ path: s1top, fullPage: false });
  console.log("✓ Screenshot saved:", s1top);

  // Screenshot: Stage 1 full page
  const s1full = path.join(ARTIFACT_DIR, "trace_stage1_full.png");
  await page.screenshot({ path: s1full, fullPage: true });
  console.log("✓ Full-page screenshot saved:", s1full);

  // Capture all fields on Stage 1
  const stage1Fields = await captureFields(page);
  console.log("\n--- Stage 1 Visible Fields ---");
  stage1Fields.filter(f => f.visible).forEach(f => {
    console.log(`  [${f.name}] type=${f.type} label="${f.label}"`);
  });

  // Specific checks
  const professionField = stage1Fields.filter(f => f.name === "profession" || f.label?.toLowerCase().includes("profession"));
  const genderField = stage1Fields.filter(f => f.name === "gender" || f.label?.toLowerCase().includes("gender"));
  const gstField = stage1Fields.filter(f => f.name === "gst" || f.label?.toLowerCase().includes("gst") || f.label?.toLowerCase().includes("gstin"));
  const addressField = stage1Fields.filter(f => f.name === "address" || f.label?.toLowerCase().includes("address"));
  const cityField = stage1Fields.filter(f => f.name === "city" || f.label?.toLowerCase().includes("city"));
  const pincodeField = stage1Fields.filter(f => f.name === "pincode" || f.label?.toLowerCase().includes("pin"));

  console.log("\n--- Issue Check Results (Stage 1) ---");
  console.log("Profession field count:", professionField.length, professionField.map(f => `name=${f.name} label="${f.label}"`).join(", ") || "NOT FOUND");
  console.log("Gender field:", genderField.length > 0 ? `label="${genderField[0].label}"` : "NOT FOUND");
  console.log("GST field:", gstField.length > 0 ? `label="${gstField[0].label}"` : "NOT FOUND");
  console.log("Address field:", addressField.length > 0 ? "PRESENT" : "MISSING");
  console.log("City field:", cityField.length > 0 ? "PRESENT" : "MISSING");
  console.log("Pincode field:", pincodeField.length > 0 ? "PRESENT" : "MISSING");

  // Get field order — compare GST position vs Aadhaar/PAN
  const fieldOrder = stage1Fields.filter(f => f.visible).map(f => f.name);
  const aadhaarIdx = fieldOrder.indexOf("aadhaar");
  const panIdx = fieldOrder.indexOf("pan");
  const gstIdx = fieldOrder.indexOf("gst");
  console.log("\nField render order (visible):", fieldOrder.join(" → "));
  console.log("Aadhaar index:", aadhaarIdx, "| PAN index:", panIdx, "| GST index:", gstIdx);
  if (gstIdx > panIdx && gstIdx !== -1) {
    console.log("✓ GST is correctly AFTER PAN/Aadhaar");
  } else {
    console.log("✗ GST position may be wrong or missing");
  }

  // Navigate through stages to reach Stage 4 (Verification/Consent)
  console.log("\n--- Navigating to Stage 4 (Consent) ---");
  try {
    // Fill required fields for Stage 1
    await page.type('input[name="fullName"]', "Render Trace User", { delay: 20 });
    await page.type('input[name="email"]', "trace@icj.org", { delay: 20 });
    await page.type('input[name="mobile"]', "9876543210", { delay: 20 });
    await sleep(500);

    // Click Continue to Stage 2
    const stage2Btn = await page.$('button');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const txt = await page.evaluate(el => el.textContent, btn);
      if (txt.includes("Continue to Stage 2")) {
        await btn.click();
        break;
      }
    }
    await sleep(1500);

    // Stage 2: Click REGISTER MEMBER
    const allBtns2 = await page.$$('button');
    for (const btn of allBtns2) {
      const txt = await page.evaluate(el => el.textContent, btn);
      if (txt.includes("REGISTER MEMBER")) {
        await btn.click();
        break;
      }
    }
    await sleep(2000);

    // Screenshot stage 2
    const s2 = path.join(ARTIFACT_DIR, "trace_stage2.png");
    await page.screenshot({ path: s2, fullPage: true });
    console.log("✓ Stage 2 screenshot:", s2);

    // Click CONTINUE TO STAGE 3
    const allBtns3 = await page.$$('button');
    for (const btn of allBtns3) {
      const txt = await page.evaluate(el => el.textContent, btn);
      if (txt.includes("CONTINUE TO STAGE 3")) {
        await btn.click();
        break;
      }
    }
    await sleep(1500);

    // Click CONTINUE TO STAGE 4
    const allBtns4 = await page.$$('button');
    for (const btn of allBtns4) {
      const txt = await page.evaluate(el => el.textContent, btn);
      if (txt.includes("CONTINUE TO STAGE 4")) {
        await btn.click();
        break;
      }
    }
    await sleep(2000);

    // Stage 4 screenshot
    const s4 = path.join(ARTIFACT_DIR, "trace_stage4_consent.png");
    await page.screenshot({ path: s4, fullPage: true });
    console.log("✓ Stage 4 screenshot:", s4);

    // Capture consent section
    const consent = await captureConsentSection(page);
    console.log("\n--- Stage 4 Consent Section ---");
    console.log("Total checkboxes visible:", consent.checkboxCount);
    console.log("Consent heading:", consent.consentHeading);
    consent.checkboxes.forEach((c, i) => {
      console.log(`  Checkbox ${i+1}: id="${c.id}" label="${c.label}" visible=${c.visible}`);
    });

    if (consent.checkboxCount === 1) {
      console.log("✓ SINGLE MASTER CONSENT checkbox (correct)");
    } else if (consent.checkboxCount === 0) {
      console.log("✗ NO checkbox found — MasterLegalConsent may not be rendering");
    } else {
      console.log("✗ MULTIPLE checkboxes found — old policy cards still present!");
    }

  } catch (err) {
    console.log("Navigation error (Stage 4):", err.message);
  }

  await browser.close();
  console.log("\n=== RENDER TRACE COMPLETE ===");
})();
