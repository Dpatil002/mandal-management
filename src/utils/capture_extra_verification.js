import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = '/Users/dinuu/.gemini/antigravity-ide/brain/246cd024-8d89-4817-b671-c3d4d359d0c7';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5176';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2 });

  // 1. Capture Public Schedule with Day 4 selected
  console.log('Navigating to Public Schedule Day 4...');
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    if (btns[1]) btns[1].click(); // Schedule tab
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click on Day 4 button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const day4Btn = buttons.find((b) => b.textContent.trim() === 'Day 4');
    if (day4Btn) day4Btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'public_schedule_day4_mankari.png'),
    fullPage: false
  });
  console.log('Captured public_schedule_day4_mankari.png');

  // 2. Login to Organiser Portal
  console.log('Navigating to Organiser Login...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    if (btns[3]) btns[3].click(); // Committee tab
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find((b) => b.textContent.includes('Organiser Login') || b.textContent.includes('Login'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const pinInput = await page.$('#organizer-pin');
  if (pinInput) {
    await pinInput.type('1995');
    const submitBtn = await page.$('#submit-btn');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 3. Open Edit Public View Drawer and switch to Mankari & PDF tab
  console.log('Opening Edit Public View Drawer & switching to Mankari & PDF tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const editBtn = buttons.find((b) => b.textContent.includes('Edit Public'));
    if (editBtn) editBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const mankariTab = buttons.find((b) => b.textContent.includes('Mankari & PDF'));
    if (mankariTab) mankariTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'edit_public_mankari_pdf_tab.png'),
    fullPage: false
  });
  console.log('Captured edit_public_mankari_pdf_tab.png');

  await browser.close();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
