import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  console.log("Starting Puppeteer browser test for Complete 5-Stage Member Registration...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE UNCAUGHT ERROR:', err.message || err));

  try {
    console.log("1. Setting admin session in localStorage...");
    await page.goto("http://localhost:5173/login", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.setItem("icj_user", JSON.stringify({
        id: 1,
        email: "admin@icj.org",
        fullName: "Administrator",
        role: "admin"
      }));
    });

    console.log("2. Navigating to http://localhost:5173/member-registration");
    await page.goto("http://localhost:5173/member-registration", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1000));

    console.log("Current URL:", page.url());
    const bodyText = await page.$eval('body', el => el.innerText.trim()).catch(() => "EMPTY");
    console.log("Current Page Content:", bodyText);

    // STAGE 1
    console.log("--- STAGE 1: Basic Information ---");
    await page.waitForSelector('input[name="fullName"]', { timeout: 15000 });
    await page.type('input[name="fullName"]', 'Dr. Sarah Connor');
    await page.type('input[name="mobile"]', '9123456789');
    await page.type('input[name="email"]', 'sarah.connor@icj.org');
    
    const buttons1 = await page.$$('button');
    let stage1Btn = null;
    for (const btn of buttons1) {
      const bText = await page.evaluate(el => el.textContent, btn);
      if (bText && bText.includes('Continue to Stage 2')) {
        stage1Btn = btn;
        break;
      }
    }
    if (!stage1Btn) throw new Error("Could not find 'Continue to Stage 2' button");
    await stage1Btn.click();
    await new Promise(r => setTimeout(r, 800));

    // STAGE 2
    console.log("--- STAGE 2: Professional & Registration ---");
    await page.waitForSelector('input[name="birthYear"]', { timeout: 10000 });
    await page.type('input[name="birthYear"]', '1988');
    await new Promise(r => setTimeout(r, 300));
    const ageVal = await page.$eval('input[name="age"]', el => el.value);
    console.log(`Auto-calculated Age (1988): ${ageVal}`);

    await page.type('input[name="aadhaar"]', '987654321098');
    await page.type('input[name="pan"]', 'qwerty1234z');
    const panVal = await page.$eval('input[name="pan"]', el => el.value);
    console.log(`Formatted PAN: ${panVal}`);

    const buttons2 = await page.$$('button');
    let registerBtn = null;
    for (const btn of buttons2) {
      const bText = await page.evaluate(el => el.textContent, btn);
      if (bText && bText.includes('REGISTER MEMBER')) {
        registerBtn = btn;
        break;
      }
    }
    if (!registerBtn) throw new Error("Could not find REGISTER MEMBER button");
    await registerBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    const alertText = await page.$eval('.MuiAlert-message', el => el.innerText).catch(() => '');
    console.log(`Register Success: ${alertText}`);

    const buttons2b = await page.$$('button');
    let stage3Btn = null;
    for (const btn of buttons2b) {
      const bText = await page.evaluate(el => el.textContent, btn);
      if (bText && bText.includes('CONTINUE TO STAGE 3')) {
        stage3Btn = btn;
        break;
      }
    }
    if (!stage3Btn) throw new Error("Could not find CONTINUE TO STAGE 3 button");
    await stage3Btn.click();
    await new Promise(r => setTimeout(r, 800));

    // STAGE 3
    console.log("--- STAGE 3: Document Vault & Uploads ---");
    await page.waitForSelector('textarea[name="remarks"]', { timeout: 10000 });
    await page.type('textarea[name="remarks"]', 'Verified all original documents.');

    const buttons3 = await page.$$('button');
    let stage4Btn = null;
    for (const btn of buttons3) {
      const bText = await page.evaluate(el => el.textContent, btn);
      if (bText && bText.includes('CONTINUE TO STAGE 4')) {
        stage4Btn = btn;
        break;
      }
    }
    if (!stage4Btn) throw new Error("Could not find CONTINUE TO STAGE 4 button");
    await stage4Btn.click();
    await new Promise(r => setTimeout(r, 800));

    // STAGE 4
    console.log("--- STAGE 4: Verification & Level ---");
    const buttons4 = await page.$$('button');
    let stage5Btn = null;
    for (const btn of buttons4) {
      const bText = await page.evaluate(el => el.textContent, btn);
      if (textMatches(bText, 'SAVE & CONTINUE TO STAGE 5')) {
        stage5Btn = btn;
        break;
      }
    }
    if (!stage5Btn) {
      // fallback search by text
      stage5Btn = await page.waitForSelector('button:has-text("SAVE & CONTINUE TO STAGE 5")').catch(() => null);
    }
    if (stage5Btn) await stage5Btn.click();
    await new Promise(r => setTimeout(r, 800));

    // STAGE 5
    console.log("--- STAGE 5: Confirmation & ID Card ---");
    const stage5Text = await page.$eval('body', el => el.innerText);
    if (!stage5Text.includes('Registration Completed Successfully!') || !stage5Text.includes('ICJ ENTERPRISE CARD')) {
      throw new Error("Stage 5 confirmation or ID card rendering failed!");
    }

    const artifactDir = "C:\\Users\\Pawan\\.gemini\\antigravity\\brain\\1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
    await page.screenshot({ path: path.join(artifactDir, 'stage5_confirmation.png'), fullPage: true });

    console.log("Clicking View Member Directory...");
    const buttons5 = await page.$$('button');
    let dirBtn = null;
    for (const btn of buttons5) {
      const bText = await page.evaluate(el => el.textContent, btn);
      if (bText && bText.includes('View Member Directory')) {
        dirBtn = btn;
        break;
      }
    }
    if (!dirBtn) throw new Error("Could not find View Member Directory button");
    await dirBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    const dirText = await page.$eval('body', el => el.innerText);
    if (!dirText.includes('Member Directory') || !dirText.includes('Dr. Sarah Connor')) {
      throw new Error("New registered member not found in Member Directory!");
    }

    console.log("SUCCESS: ALL 5 STAGES OF MEMBER REGISTRATION COMPLETED PERFECTLY!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

function textMatches(str1, str2) {
  return str1 && str1.toLowerCase().includes(str2.toLowerCase());
}
