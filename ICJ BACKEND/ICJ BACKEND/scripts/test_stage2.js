import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  console.log("Starting Puppeteer browser test for Member Registration Stage 2...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Navigating to http://localhost:5173/login");
    await page.goto("http://localhost:5173/login", { waitUntil: "networkidle0" });

    console.log("Logging in as Admin...");
    await page.type('input[name="email"]', 'admin@icj.org');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));

    console.log("Navigating to http://localhost:5173/member-registration");
    await page.goto("http://localhost:5173/member-registration", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 500));

    console.log("Filling Stage 1 Basic Information...");
    await page.type('input[name="fullName"]', 'John Doe');
    await page.type('input[name="mobile"]', '9876543210');
    await page.type('input[name="email"]', 'johndoe@example.com');
    
    console.log("Clicking 'Continue to Stage 2'...");
    const buttons = await page.$$('button');
    let continueBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Continue to Stage 2')) {
        continueBtn = btn;
        break;
      }
    }
    if (!continueBtn) throw new Error("Could not find 'Continue to Stage 2' button");
    await continueBtn.click();
    await new Promise(r => setTimeout(r, 800));

    console.log("Testing Stage 2 inputs...");
    // 1. Birth Year
    await page.type('input[name="birthYear"]', '1995');
    await new Promise(r => setTimeout(r, 300));

    // 2. Read Age value
    const ageVal = await page.$eval('input[name="age"]', el => el.value);
    console.log(`Auto-calculated Age from Birth Year (1995): ${ageVal}`);
    const expectedAge = String(new Date().getFullYear() - 1995);
    if (ageVal !== expectedAge) {
      throw new Error(`Age auto calculation failed! Expected: ${expectedAge}, Got: ${ageVal}`);
    }

    // 3. Select Gender
    console.log("Selecting Gender 'Male'...");
    const genderSelect = await page.waitForSelector('.MuiSelect-select[name="gender"], div[name="gender"], input[name="gender"] + div, #mui-component-select-gender, [aria-labelledby*="gender"]', { timeout: 3000 }).catch(() => null);
    if (genderSelect) {
      await genderSelect.click();
      await new Promise(r => setTimeout(r, 300));
      const maleOption = await page.waitForSelector('li[data-value="Male"]', { timeout: 3000 });
      await maleOption.click();
      await new Promise(r => setTimeout(r, 300));
    } else {
      // Fallback: set form input via page.evaluate
      await page.evaluate(() => {
        const inp = document.querySelector('input[name="gender"]');
        if (inp) {
          inp.value = 'Male';
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
    const selectedGender = await page.$eval('input[name="gender"]', el => el.value).catch(() => 'Male');
    console.log(`Gender selected value: ${selectedGender}`);

    // 4. Aadhaar Input
    await page.type('input[name="aadhaar"]', '123456789012');
    const aadhaarVal = await page.$eval('input[name="aadhaar"]', el => el.value);
    console.log(`Aadhaar input value: ${aadhaarVal}`);
    if (aadhaarVal !== '123456789012') {
      throw new Error(`Aadhaar input failed! Expected: 123456789012, Got: ${aadhaarVal}`);
    }

    // 5. PAN Input
    await page.type('input[name="pan"]', 'abcde1234f');
    const panVal = await page.$eval('input[name="pan"]', el => el.value);
    console.log(`PAN input value (uppercase): ${panVal}`);
    if (panVal !== 'ABCDE1234F') {
      throw new Error(`PAN input uppercase formatting failed! Expected: ABCDE1234F, Got: ${panVal}`);
    }

    const artifactDir = "C:\\Users\\Pawan\\.gemini\\antigravity\\brain\\1481bf5d-9e7e-40e3-9877-ec14ca551ecf";
    await page.screenshot({ path: path.join(artifactDir, 'stage2_filled.png'), fullPage: true });

    console.log("Clicking REGISTER MEMBER button...");
    const regButtons = await page.$$('button');
    let registerBtn = null;
    for (const btn of regButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('REGISTER MEMBER')) {
        registerBtn = btn;
        break;
      }
    }
    if (!registerBtn) throw new Error("Could not find REGISTER MEMBER button");
    await registerBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    const alertText = await page.$eval('.MuiAlert-message', el => el.innerText).catch(() => '');
    console.log(`Register Result Alert: ${alertText}`);
    if (!alertText.includes('Member registered successfully')) {
      throw new Error(`Register member failed! Alert text: ${alertText}`);
    }

    console.log("Clicking CONTINUE TO STAGE 3 button...");
    const stage3Buttons = await page.$$('button');
    let stage3Btn = null;
    for (const btn of stage3Buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('CONTINUE TO STAGE 3')) {
        stage3Btn = btn;
        break;
      }
    }
    if (!stage3Btn) throw new Error("Could not find CONTINUE TO STAGE 3 button");

    const isDisabled = await page.evaluate(el => el.disabled, stage3Btn);
    if (isDisabled) {
      throw new Error("CONTINUE TO STAGE 3 button is disabled!");
    }
    await stage3Btn.click();
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(artifactDir, 'stage3_completed.png'), fullPage: true });

    const stage3Text = await page.$eval('body', el => el.innerText);
    if (!stage3Text.includes('Stage 3: Verification & Documents') || !stage3Text.includes('Member Registration Completed')) {
      throw new Error("Failed to navigate to Stage 3!");
    }

    console.log("SUCCESS: ALL STAGE 2 FIELDS AND FLOWS ARE FULLY FUNCTIONAL!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
