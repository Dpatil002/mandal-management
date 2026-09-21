import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = '/Users/dinuu/.gemini/antigravity-ide/brain/cdc0bb46-201d-448e-90d4-10a46a477214';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 1100, deviceScaleFactor: 2 });

  console.log('Navigating to base url...');
  await page.goto(`${BASE_URL}`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 600));

  // 1. Setup session & seed sample data
  await page.evaluate(() => {
    const session = {
      organizer: {
        id: 'org-default-1',
        name: 'Digambar Patil',
        phone: '8767977216'
      },
      sessionToken: `ivmm_sess_${Date.now()}_test`,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem('mandal_active_organizer', JSON.stringify(session));

    const sampleVargani = [
      { id: 'v-1', donorName: 'Suraj Patil', amount: 5001, status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-2', donorName: 'Ramesh Kadam', amount: 3501, status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-3', donorName: 'Suraj Patil', amount: 2000, status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-4', donorName: 'Amit Deshmukh', amount: 3001, status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-5', donorName: 'Mahesh Shinde', amount: 2501, status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-6', donorName: 'Ramesh Kadam', amount: 1500, status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-7', donorName: 'Vikram Joshi', amount: 2101, status: 'verified', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('iv_mandal_vargani', JSON.stringify(sampleVargani));
  });

  // Reload page
  console.log('Reloading page with session active...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 800));

  // 1. Capture Organiser Home showing Total Collected + Per-Person Vargani Total card
  console.log('Capturing Organiser Home with Per-Person Vargani Totals...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'organiser_home_per_person_totals.png'),
    fullPage: false
  });
  console.log('Captured organiser_home_per_person_totals.png');

  // 2. Click on Winners CTA button
  console.log('Clicking on Game Winners CTA button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const winnersBtn = buttons.find(b => b.textContent.includes('Winners') || b.textContent.includes('खेळ विजेते') || b.textContent.includes('Game Winners'));
    if (winnersBtn) winnersBtn.click();
  });

  await new Promise((r) => setTimeout(r, 800));

  // Capture Game Winners screen with full page view
  console.log('Capturing Game Winners Screen...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'organiser_game_winners.png'),
    fullPage: false
  });
  console.log('Captured organiser_game_winners.png');

  await browser.close();
  console.log('Finished capturing screenshots!');
}

main().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
