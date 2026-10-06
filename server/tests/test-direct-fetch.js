import { load } from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1'
};

async function testDirectFetch() {
  console.time('Direct Fetch Forecast');
  const resForecast = await fetch('https://www.marketbeat.com/stocks/NASDAQ/AAPL/forecast/', { headers });
  console.timeEnd('Direct Fetch Forecast');
  console.log('Forecast HTTP Status:', resForecast.status);
  const htmlForecast = await resForecast.text();
  console.log('Forecast HTML Length:', htmlForecast.length, 'Cloudflare?', htmlForecast.includes('Just a moment...'));

  const $f = load(htmlForecast);
  let opinions = { compra: 0, mantener: 0, venta: 0 };
  const mapping = { "Sell": "venta", "Hold": "mantener", "Buy": "compra" };
  $f('.d-flex.bold.justify-content-center > div').each((i, el) => {
    const label = $f(el).contents().filter((_, node) => node.type === 'text').first().text().trim();
    const count = parseInt($f(el).find('span').text().trim(), 10) || 0;
    if (mapping[label]) opinions[mapping[label]] = count;
  });
  console.log('Opinions extracted:', opinions);

  console.time('Direct Fetch Stock Page');
  const resStock = await fetch('https://www.marketbeat.com/stocks/NASDAQ/AAPL/', { headers });
  console.timeEnd('Direct Fetch Stock Page');
  console.log('Stock HTTP Status:', resStock.status);
  const htmlStock = await resStock.text();
  console.log('Stock HTML Length:', htmlStock.length, 'Cloudflare?', htmlStock.includes('Just a moment...'));

  const $s = load(htmlStock);
  const price = $s('div.d-inline-block.mb-2.mr-4').find('strong').first().text().trim();
  console.log('Price extracted:', price);

  let trailingPE = null;
  $s('.price-data').each((i, el) => {
    const dt = $s(el).find('dt').text().trim();
    const dd = $s(el).find('dd').text().trim();
    if (dt.includes('Trailing P/E Ratio')) trailingPE = dd;
  });
  console.log('Trailing P/E extracted:', trailingPE);
}

testDirectFetch();
