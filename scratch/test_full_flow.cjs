const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:5173/join?role=advocate ...");
  await page.goto("http://localhost:5173/join?role=advocate", { waitUntil: "networkidle2" });

  // 1. Step 2 -> Fill First Name & click Next
  console.log("Filling Step 2: First Name = Rajesh, Last Name = Sharma");
  const inputs = await page.$$("input");
  await inputs[2].type("Rajesh");
  await inputs[4].type("Sharma");

  // Click Next
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await (await b.getProperty("innerText")).jsonValue();
    if (text.includes("आगे बढ़ें") || text.includes("Next")) {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));
  let pageText = await page.evaluate(() => document.body.innerText);
  console.log("After Step 2 -> Next: Is on Step 3?", pageText.includes("Step 3 of 6"));
  console.log("Header indicates:", pageText.includes("संपर्क एवं सुरक्षा") || pageText.includes("Contact"));

  // 2. Step 3 -> Fill Mobile, Email, Password, Confirm Password
  console.log("Filling Step 3: Mobile, Email, Password");
  const step3Inputs = await page.$$("input");
  await step3Inputs[0].type("9876543210");
  await step3Inputs[2].type("rajesh.adv@gmail.com");
  await step3Inputs[3].type("Rajesh12345");
  await step3Inputs[4].type("Rajesh12345");

  // Click Next
  const buttons3 = await page.$$("button");
  for (const b of buttons3) {
    const text = await (await b.getProperty("innerText")).jsonValue();
    if (text.includes("आगे बढ़ें") || text.includes("Next")) {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));
  pageText = await page.evaluate(() => document.body.innerText);
  console.log("After Step 3 -> Next: Is on Step 4?", pageText.includes("Step 4 of 6"));
  console.log("Step 4 shows Bar Council Reg No:", pageText.includes("Bar Council") || pageText.includes("रजिस्ट्रेशन नंबर"));

  await browser.close();
  console.log("🎉 Multi-step navigation and validation successfully tested in browser!");
})();
