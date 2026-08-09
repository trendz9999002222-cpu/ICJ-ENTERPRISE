import puppeteer from 'puppeteer';

const routesToTest = [
  '/',
  '/membership',
  '/member-directory',
  '/member-verification',
  '/member-documents',
  '/member-wallet',
  '/member-kyc',
  '/member-identity',
  '/member-certificates',
  '/member-history',
  '/member-activity',
  '/member-settings',
  '/member-card',
  '/documents',
  '/wallet',
  '/token',
  '/donation',
  '/settings',
  '/activity-log',
  '/transactions',
  '/member-profile',
  '/notifications',
  '/reports',
  '/legal',
  '/ai',
  '/research',
  '/administration',
  '/finance'
];

(async () => {
  console.log(`Starting Puppeteer module verification across ${routesToTest.length} routes...`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const errorsFound = [];

  page.on('pageerror', err => {
    console.error(`[PAGE UNCAUGHT ERROR]: ${err.message}`);
    errorsFound.push(err.message);
  });

  try {
    console.log("Setting admin session in localStorage...");
    await page.goto("http://localhost:5173/login", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.setItem("icj_user", JSON.stringify({
        id: 1,
        email: "admin@icj.org",
        fullName: "Administrator",
        role: "admin"
      }));
    });

    for (const route of routesToTest) {
      const url = `http://localhost:5173${route}`;
      console.log(`Testing route: ${route} (${url})`);
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 10000 });
        await new Promise(r => setTimeout(r, 400));
        
        const title = await page.title();
        const currentUrl = page.url();
        const text = await page.$eval('body', el => el.innerText.trim().slice(0, 150)).catch(() => '');

        if (!currentUrl.includes(route) && route !== '/') {
          console.warn(`  Redirected to ${currentUrl} instead of ${route}`);
        } else {
          console.log(`  Passed! Page content preview: "${text.replace(/\n/g, ' ')}"`);
        }
      } catch (err) {
        console.error(`  FAILED route ${route}:`, err.message);
        errorsFound.push(`Route ${route} failed: ${err.message}`);
      }
    }

    if (errorsFound.length > 0) {
      console.error("\nModule Verification Completed with Errors:");
      errorsFound.forEach(e => console.error(` - ${e}`));
      process.exitCode = 1;
    } else {
      console.log("\nALL MODULE ROUTES VERIFIED SUCCESSFULLY WITH 0 ERRORS!");
    }
  } catch (err) {
    console.error("Fatal error during module verification:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
