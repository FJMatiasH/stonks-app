import { load } from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function testExtraction() {
  const url = 'https://www.marketbeat.com/stocks/NASDAQ/AAPL/';
  const res = await fetch(url, { headers });
  const html = await res.text();
  const $ = load(html);

  // Map all dt -> dd
  const metricsMap = new Map();
  $('.price-data').each((_, el) => {
    const dt = $(el).find('dt').text().trim().toLowerCase();
    const dd = $(el).find('dd').text().trim();
    if (dt && dd) {
      metricsMap.set(dt, dd);
    }
  });

  console.log('Total metrics captured:', metricsMap.size);
  for (const [k, v] of metricsMap.entries()) {
    console.log(`  ${k} => ${v}`);
  }
}

testExtraction();
