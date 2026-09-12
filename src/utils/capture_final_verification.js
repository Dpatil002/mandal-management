import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = '/Users/dinuu/.gemini/antigravity-ide/brain/246cd024-8d89-4817-b671-c3d4d359d0c7';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5176';

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2 });

  // 1. Capture Public Home
  console.log('Navigating to Public Home...');
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('main');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'public_home_concise.png'),
    fullPage: false
  });
  console.log('Captured public_home_concise.png');

  // 2. Capture Public Today Schedule with Day-wise Mankari Chips
  console.log('Navigating to Public Schedule...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    if (btns[1]) btns[1].click(); // Schedule tab
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'public_schedule_mankari_chips.png'),
    fullPage: false
  });
  console.log('Captured public_schedule_mankari_chips.png');

  // 3. Login to Organiser Portal
  console.log('Navigating to Committee tab & Login...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    if (btns[3]) btns[3].click(); // Committee tab
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click Organiser Login button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find((b) => b.textContent.includes('Organiser Login') || b.textContent.includes('Login'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Type PIN 1995 and submit
  const pinInput = await page.$('#organizer-pin');
  if (pinInput) {
    await pinInput.type('1995');
    const submitBtn = await page.$('#submit-btn');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 4. Capture Organiser Dashboard with Edit Public View CTA
  console.log('Capturing Organiser Dashboard...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'organiser_dashboard_edit_public.png'),
    fullPage: false
  });
  console.log('Captured organiser_dashboard_edit_public.png');

  // 5. Open Edit Public View Drawer
  console.log('Opening Edit Public View Drawer...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const editBtn = buttons.find((b) => b.textContent.includes('Edit Public'));
    if (editBtn) editBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'edit_public_view_drawer.png'),
    fullPage: false
  });
  console.log('Captured edit_public_view_drawer.png');

  await browser.close();
  console.log('All validation screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
