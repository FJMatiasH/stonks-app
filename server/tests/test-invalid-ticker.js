import { load } from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function testInvalid() {
  const url = 'https://www.marketbeat.com/stocks/NASDAQ/XYZNONEXISTENT/';
  const res = await fetch(url, { headers });
  console.log('Status for non-existent stock:', res.status, 'Final URL:', res.url);
  const text = await res.text();
  const $ = load(text);
  console.log('Title:', $('title').text().trim());
  console.log('h1:', $('h1').first().text().trim());
  console.log('Price strong:', $('div.d-inline-block.mb-2.mr-4 strong').text().trim());
}

testInvalid();
