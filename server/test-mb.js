import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { load } from 'cheerio';

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.marketbeat.com/stocks/NASDAQ/AAPL', { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  const $ = load(html);
  
  console.log("--- dt texts ---");
  $('.price-data dt').each((i, el) => {
     console.log($(el).text().trim());
  });
  
  console.log("--- scores ---");
  console.log("opinions:", $('#questionAnalystsOpinion .mr-score').first().text().trim());
  
  await browser.close();
})();
