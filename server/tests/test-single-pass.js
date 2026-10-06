import { load } from 'cheerio';

const DEFAULT_HEADERS = {
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

const recommendationMapping = {
  "Sell": "venta",
  "Hold": "mantener",
  "Buy": "compra"
};

function parseNumberStrict(str) {
  if (!str || str === '-') return null;
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
}

function parseMarketCap(str) {
  if (!str || str === '-') return null;
  let num = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return null;
  const upperStr = str.toUpperCase();
  if (upperStr.includes('T')) num *= 1000;
  else if (upperStr.includes('M')) num /= 1000;
  return num;
}

function extractScores($) {
  const extract = (id) => {
    const scoreText = $(`#${id} .mr-score`).first().text().trim();
    if (!scoreText) return null;
    const num = parseFloat(scoreText.split('/')[0]);
    return isNaN(num) ? null : num;
  };
  return {
    analystsOpinionScore: extract('questionAnalystsOpinion'),
    earningsValuationScore: extract('questionEarningsandValuation'),
    shortInterestScore: extract('questionShortInterest'),
    dividendScore: extract('questionDividend'),
    newsSocialMediaScore: extract('questionNewsandSocialMedia'),
    companyOwnershipScore: extract('questionCompanyOwnership')
  };
}

function parseMetricsSinglePass($) {
  const map = new Map();
  $('.price-data').each((_, el) => {
    const dt = $(el).find('dt').text().trim().toLowerCase();
    const dd = $(el).find('dd').text().trim();
    if (dt && dd) map.set(dt, dd);
  });

  const getVal = (...keys) => {
    for (const key of keys) {
      if (map.has(key)) return map.get(key);
    }
    for (const [k, v] of map.entries()) {
      for (const key of keys) {
        if (k.includes(key)) return v;
      }
    }
    return null;
  };

  const marketCapRaw = getVal('market capitalization', 'market cap');
  const divYieldRaw = getVal('dividend yield');
  const ratingRaw = getVal('rating score (0-4)', 'rating score');
  const pegRaw = getVal('p/e growth', 'peg');
  const trailingRaw = getVal('trailing p/e ratio', 'p/e ratio');
  const forwardRaw = getVal('forward p/e ratio');
  const netMarginsRaw = getVal('net margins', 'net margin');
  const priceTargetRaw = getVal('average price target', 'price target');
  const upsideRaw = getVal('potential upside/downside', 'upside/downside');
  const debtRaw = getVal('debt-to-equity ratio', 'debt-to-equity');
  const pcfRaw = getVal('price / cash flow', 'price/cash flow');

  return {
    trailingPE: trailingRaw,
    forwardPE: forwardRaw,
    averageStockPriceTarget: priceTargetRaw,
    averagePriceTarget: priceTargetRaw,
    potentialUpsideDownside: upsideRaw,
    potentialUpside: upsideRaw,
    netMargins: netMarginsRaw,
    debtToEquity: parseNumberStrict(debtRaw),
    priceToCashFlow: parseNumberStrict(pcfRaw),
    marketCap: parseMarketCap(marketCapRaw),
    dividendYield: parseNumberStrict(divYieldRaw),
    mbRating: parseNumberStrict(ratingRaw),
    peg: parseNumberStrict(pegRaw)
  };
}

async function testSinglePass() {
  const res = await fetch('https://www.marketbeat.com/stocks/NASDAQ/AAPL/', { headers: DEFAULT_HEADERS });
  const html = await res.text();
  const $ = load(html);
  const metrics = parseMetricsSinglePass($);
  const scores = extractScores($);
  const price = $('div.d-inline-block.mb-2.mr-4').find('strong').first().text().trim();

  console.log('Price:', price);
  console.log('Metrics:', metrics);
  console.log('Scores:', scores);
}

testSinglePass();
