const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto("http://localhost:5173/join?role=advocate", { waitUntil: "networkidle2" });

  // Type into First Name (which has label "First Name (पहला नाम) *")
  const firstNameInput = await page.$("input[label*='First Name'], input[required]");
  console.log("Found firstNameInput:", !!firstNameInput);

  // Use page.evaluate to set React state by typing into the input
  const allInputs = await page.$$("input");
  console.log("Total inputs found on Step 2:", allInputs.length);

  for (let i = 0; i < allInputs.length; i++) {
    await allInputs[i].click();
  }

  // Type in the first text input (First Name)
  await page.type("input[required]", "Rajesh");
  console.log("Typed Rajesh in required input");

  // Click Next Button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const nextBtn = btns.find(b => b.innerText.includes("आगे बढ़ें") || b.innerText.includes("Next"));
    if (nextBtn) nextBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  const afterText = await page.evaluate(() => document.body.innerText);
  console.log("Contains Step 3 of 6:", afterText.includes("Step 3 of 6"));
  console.log("Alert message if any:", afterText.includes("Alert") ? "Alert detected" : "No alert");

  await browser.close();
})();
