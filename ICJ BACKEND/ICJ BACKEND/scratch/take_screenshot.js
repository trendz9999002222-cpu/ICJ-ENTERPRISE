import puppeteer from "puppeteer";
import path from "path";

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    
    // Set a good desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log("Navigating to demo portal...");
    await page.goto("http://localhost:5173/demo-leads-portal", {
      waitUntil: "networkidle2",
      timeout: 15000
    });

    console.log("Waiting for leads list to render...");
    await page.waitForSelector(".MuiCard-root", { timeout: 5000 });

    const screenshotPath = "C:/Users/Pawan/.gemini/antigravity/brain/53437c2d-6514-40b5-92e3-45df2a1c4a71/demo_leads_portal_screenshot.png";
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved successfully at: ${screenshotPath}`);
  } catch (err) {
    console.error("Failed to capture screenshot:", err);
  } finally {
    await browser.close();
  }
})();
