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
  await page.setViewport({ width: 412, height: 1050, deviceScaleFactor: 2 });

  console.log('Navigating to base url...');
  await page.goto(`${BASE_URL}`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 600));

  // 1. Ensure public mode (no organiser session) and seed sample game winners if needed
  await page.evaluate(() => {
    localStorage.removeItem('mandal_active_organizer');

    const sampleGameWinners = [
      {
        id: 'gw-1',
        gameName: 'Musical Chairs (संगीत खुर्ची)',
        girls: { first: 'रिया पाटील (Riya)', second: 'सानिका जोशी (Sanika)', third: 'प्राची कुलकर्णी (Prachi)' },
        boys: { first: 'आदित्य शिंदे (Aditya)', second: 'रोहन गायकवाड (Rohan)', third: 'वेदांत मोरे (Vedant)' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'gw-2',
        gameName: 'Drawing Competition (चित्रकला स्पर्धा)',
        girls: { first: 'अन्वी सावंत (Anvi)', second: 'तन्वी पवार (Tanvi)', third: 'ईश्वरी काळे (Ishwari)' },
        boys: { first: 'अर्णव माने (Arnav)', second: 'आयुष पवार (Ayush)', third: 'श्रेयस कदम (Shreyas)' },
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('iv_game_winners', JSON.stringify(sampleGameWinners));
  });

  // Reload page as public visitor
  console.log('Reloading page in Public View...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));

  // Scroll down slightly so that the Game Winners card is in view
  await page.evaluate(() => {
    const winnersHeader = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Game Winners') || h.textContent.includes('खेळ विजेते'));
    if (winnersHeader) {
      winnersHeader.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise((r) => setTimeout(r, 400));

  console.log('Capturing Public View with Game Winners Section...');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'public_game_winners_section.png'),
    fullPage: false
  });
  console.log('Captured public_game_winners_section.png');

  await browser.close();
  console.log('Finished capturing screenshot!');
}

main().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
