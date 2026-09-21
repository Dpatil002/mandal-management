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
  await page.setViewport({ width: 412, height: 950, deviceScaleFactor: 2 });

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

    const sampleOrganizers = [
      { id: 'org-1', name: 'Digambar Patil', phone: '8767977216' },
      { id: 'org-2', name: 'Suraj Patil', phone: '9876543210' },
      { id: 'org-3', name: 'Akshay Shinde', phone: '9123456780' }
    ];
    localStorage.setItem('mandal_organizers', JSON.stringify(sampleOrganizers));

    const sampleVargani = [
      { id: 'v-1', donorName: 'Dev Anand', amount: 3501, collectedBy: 'Digambar Patil', paidTo: 'Digambar Patil', status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-2', donorName: 'Tushar Wabhle', amount: 3000, collectedBy: 'Suraj Patil', paidTo: 'Suraj Patil', status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-3', donorName: 'Chaskar Kaka', amount: 2551, collectedBy: 'Digambar Patil', paidTo: 'Digambar Patil', status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-4', donorName: 'Sopan Mane', amount: 2551, collectedBy: 'Akshay Shinde', paidTo: 'Akshay Shinde', status: 'verified', createdAt: new Date().toISOString() },
      { id: 'v-5', donorName: 'Baliram Jadhav', amount: 2511, collectedBy: 'Suraj Patil', paidTo: 'Suraj Patil', status: 'verified', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('iv_mandal_vargani', JSON.stringify(sampleVargani));

    const sampleExpenses = [
      { id: 'e-1', title: 'मंडप व स्टेज सजावट (Stage Decor)', amount: 15000, category: 'Decoration', paidBy: 'Digambar Patil', date: new Date().toISOString() },
      { id: 'e-2', title: 'महाप्रसाद अन्नधान्य (Grocery for Mahaprasad)', amount: 8500, category: 'Mahaprasad', paidBy: 'Suraj Patil', date: new Date().toISOString() },
      { id: 'e-3', title: 'साउंड सिस्टीम भाडे (Sound System)', amount: 6000, category: 'Sound & Lights', paidBy: 'Akshay Shinde', date: new Date().toISOString() }
    ];
    localStorage.setItem('iv_mandal_expenses', JSON.stringify(sampleExpenses));
  });

  // Reload page
  console.log('Reloading page with session active...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 800));

  // 1. Navigate to Vargani tab
  console.log('Navigating to Vargani tab...');
  await page.evaluate(() => {
    const bottomNavButtons = Array.from(document.querySelectorAll('nav button'));
    const varganiBtn = bottomNavButtons.find(b => b.textContent.includes('Vargani'));
    if (varganiBtn) varganiBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('Capturing Vargani Tab Organiser-wise cards...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'organiser_vargani_tab_totals.png'),
    fullPage: false
  });
  console.log('Captured organiser_vargani_tab_totals.png');

  // 2. Navigate to Expenses tab
  console.log('Navigating to Expenses tab...');
  await page.evaluate(() => {
    const bottomNavButtons = Array.from(document.querySelectorAll('nav button'));
    const expensesBtn = bottomNavButtons.find(b => b.textContent.includes('Expenses'));
    if (expensesBtn) expensesBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Add sample expenses via UI drawer to verify live updates
  console.log('Opening Add Expense Drawer...');
  await page.evaluate(() => {
    const addBtn = document.querySelector('#quickAddBtn');
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Fill in expense 1
  await page.type('input[placeholder*="उदा. 4500"]', '12500');
  await page.type('input[placeholder*="Flower Garland"]', 'मंडप व स्टेज सजावट (Stage Decor)');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  console.log('Capturing Expenses Tab Organiser-wise cards...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'organiser_expenses_tab_totals.png'),
    fullPage: false
  });
  console.log('Captured organiser_expenses_tab_totals.png');

  await browser.close();
  console.log('Finished capturing screenshots!');
}

main().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
