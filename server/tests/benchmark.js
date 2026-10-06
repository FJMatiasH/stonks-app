import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { load } from 'cheerio';

puppeteer.use(StealthPlugin());

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1'
};

async function runBenchmark() {
  const testStocks = [
    { exchange: 'NASDAQ', ticker: 'NVDA' },
    { exchange: 'NYSE', ticker: 'JPM' }
  ];

  console.log('=== BENCHMARK: PUPPETEER (ACTUAL) ===');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  const startPuppeteer = Date.now();
  for (const s of testStocks) {
    const t0 = Date.now();
    const page = await browser.newPage();
    await page.setUserAgent(headers['User-Agent']);
    await page.goto(`https://www.marketbeat.com/stocks/${s.exchange}/${s.ticker}/forecast/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html1 = await page.content();
    await page.goto(`https://www.marketbeat.com/stocks/${s.exchange}/${s.ticker}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html2 = await page.content();
    await page.close();
    console.log(`Puppeteer ${s.ticker}: ${(Date.now() - t0)}ms`);
  }
  const totalPuppeteer = Date.now() - startPuppeteer;
  await browser.close();
  console.log(`Total Puppeteer (2 stocks): ${totalPuppeteer}ms\n`);

  console.log('=== BENCHMARK: HTTP DIRECT (OPTIMIZADO) ===');
  const startDirect = Date.now();
  for (const s of testStocks) {
    const t0 = Date.now();
    const [res1, res2] = await Promise.all([
      fetch(`https://www.marketbeat.com/stocks/${s.exchange}/${s.ticker}/forecast/`, { headers }).then(r => r.text()),
      fetch(`https://www.marketbeat.com/stocks/${s.exchange}/${s.ticker}`, { headers }).then(r => r.text())
    ]);
    console.log(`Direct Fetch ${s.ticker}: ${(Date.now() - t0)}ms`);
  }
  const totalDirect = Date.now() - startDirect;
  console.log(`Total Direct Fetch (2 stocks): ${totalDirect}ms`);
  console.log(`\nMejora de velocidad: ${(totalPuppeteer / totalDirect).toFixed(2)}x más rápido!`);
}

runBenchmark();
