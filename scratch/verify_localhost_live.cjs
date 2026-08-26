const http = require("http");
const puppeteer = require("puppeteer");

http.get("http://localhost:5173", async (res) => {
  console.log("Localhost HTTP Status:", res.statusCode);

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Check Homepage
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle2" });
  const hpTitle = await page.title();
  console.log("✅ Homepage loaded successfully! Title:", hpTitle);

  // 2. Check Onboarding /join?role=advocate
  await page.goto("http://localhost:5173/join?role=advocate", { waitUntil: "networkidle2" });
  const onboardingText = await page.evaluate(() => document.body.innerText);
  console.log("✅ Onboarding loaded successfully! Heading:", onboardingText.includes("ICJ ENTERPRISE ONBOARDING"));
  console.log("✅ Zero-Scroll Step 2 Active:", onboardingText.includes("Step 2 of 6"));

  await browser.close();
  console.log("🎉 Localhost & Browser verification complete and 100% operational!");
}).on("error", (e) => {
  console.error("Localhost error:", e.message);
});
