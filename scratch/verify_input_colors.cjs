const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:5173/join?role=advocate ...");
  await page.goto("http://localhost:5173/join?role=advocate", { waitUntil: "networkidle2" });

  // Click Step 1 -> Step 2
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const proceed = btns.find(b => b.innerText.includes("Proceed") || b.innerText.includes("आगे बढ़ें") || b.innerText.includes("Select"));
    if (proceed) proceed.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // Type in First Name
  await page.type("input[required]", "Rajesh");
  console.log("Typed 'Rajesh' in Step 2 First Name");

  await page.screenshot({ path: "scratch/step2_inputs_styled.png" });
  console.log("Screenshot saved to scratch/step2_inputs_styled.png");

  // Inspect the input colors in browser
  const styles = await page.evaluate(() => {
    const input = document.querySelector("input[required]");
    const computed = window.getComputedStyle(input);
    const parent = input.closest(".MuiOutlinedInput-root");
    const parentComputed = window.getComputedStyle(parent);
    const label = document.querySelector(".MuiInputLabel-root");
    const labelComputed = label ? window.getComputedStyle(label) : null;

    return {
      inputTextColor: computed.color,
      inputBgColor: parentComputed.backgroundColor,
      labelColor: labelComputed ? labelComputed.color : null,
    };
  });

  console.log("Computed Input Styles in Browser:", styles);

  await browser.close();
})();
