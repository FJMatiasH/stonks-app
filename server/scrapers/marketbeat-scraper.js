import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

puppeteer.use(StealthPlugin());

// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================

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

// Configuración de caché (TTL por defecto: 24 horas)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cacheFile = path.resolve(__dirname, 'cache.json');

// Caché en memoria inicializada desde archivo
let cache = new Map();
if (fs.existsSync(cacheFile)) {
  try {
    const rawData = fs.readFileSync(cacheFile, 'utf8').trim();
    if (!rawData || rawData === '[]' || rawData === '{}') {
      console.log('[Cache] Archivo de caché vacío o inicial. Inicializando caché limpia.');
    } else {
      const parsedData = JSON.parse(rawData);
      cache = new Map(Object.entries(parsedData));
      console.log(`[Cache] Cargados ${cache.size} elementos desde disco.`);
    }
  } catch (e) {
    console.log('[Cache] Archivo de caché inválido. Inicializando caché limpia.');
  }
}

// Guardado asíncrono con debounce
let saveTimeout = null;
function scheduleCacheSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const obj = Object.fromEntries(cache);
      fs.writeFileSync(cacheFile, JSON.stringify(obj, null, 2), 'utf8');
      console.log(`[Cache] Guardada en disco con ${cache.size} elementos.`);
    } catch (e) {
      console.error('[Cache] Error al guardar en disco:', e.message);
    }
  }, 3000);
}

function getFromCache(key, maxAge = CACHE_TTL_MS) {
  if (!cache.has(key)) return null;
  const entry = cache.get(key);
  // Compatibilidad con entradas previas sin timestamp
  if (entry && entry._cachedAt) {
    if (Date.now() - entry._cachedAt > maxAge) {
      cache.delete(key);
      return null;
    }
    const { _cachedAt, ...data } = entry;
    return data;
  }
  return entry;
}

function saveToCache(key, value) {
  const entryWithMeta = {
    ...value,
    _cachedAt: Date.now()
  };
  cache.set(key, entryWithMeta);
  scheduleCacheSave();
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// MOTOR DE PETICIÓN DUAL: HTTP RÁPIDO + FALLBACK PUPPETEER
// ==========================================

let globalBrowser = null;
async function getPuppeteerBrowser() {
  if (!globalBrowser) {
    globalBrowser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return globalBrowser;
}

async function getHtmlWithPuppeteer(url) {
  console.log(`[Scraper] Ejecutando Puppeteer Stealth como fallback para: ${url}`);
  const browser = await getPuppeteerBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(DEFAULT_HEADERS['User-Agent']);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    return await page.content();
  } finally {
    await page.close();
  }
}

/**
 * Obtiene el HTML de una URL utilizando HTTP directo ultrarrápido con fallback resiliente.
 * @param {string} url 
 * @param {object} [options]
 * @returns {Promise<{ html: string, isRedirectedToExchange: boolean }>}
 */
async function fetchHtmlFast(url, options = {}) {
  const timeoutMs = options.timeout || 10000;
  
  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(timeoutMs)
    });

    const isRedirectedToExchange = response.url && (
      response.url.endsWith('/stocks/NASDAQ/') ||
      response.url.endsWith('/stocks/NYSE/') ||
      response.url.endsWith('/stocks/AMEX/') ||
      !response.url.includes(url.split('/').filter(Boolean).pop())
    );

    if (response.status === 404 || isRedirectedToExchange) {
      return { html: '', isNotFound: true, isRedirectedToExchange: true };
    }

    if (response.status === 403 || response.status === 429) {
      console.warn(`[Scraper] HTTP ${response.status} detectado en ${url}. Intentando fallback Puppeteer.`);
      const html = await getHtmlWithPuppeteer(url);
      return { html, isNotFound: false, isRedirectedToExchange: false };
    }

    const html = await response.text();

    if (html.includes('Just a moment...') || html.includes('cf-browser-verification')) {
      console.warn(`[Scraper] Reto Cloudflare detectado en ${url}. Pasando a Puppeteer Stealth.`);
      const puppeteerHtml = await getHtmlWithPuppeteer(url);
      return { html: puppeteerHtml, isNotFound: false, isRedirectedToExchange: false };
    }

    return { html, isNotFound: false, isRedirectedToExchange: false };
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.warn(`[Scraper] Timeout de HTTP directo (${timeoutMs}ms) en ${url}. Intentando fallback.`);
    } else {
      console.warn(`[Scraper] Error de red en fetch (${error.message}). Intentando fallback Puppeteer.`);
    }
    
    // Fallback a Puppeteer
    try {
      const html = await getHtmlWithPuppeteer(url);
      return { html, isNotFound: false, isRedirectedToExchange: false };
    } catch (fallbackError) {
      throw new Error(`Fallo en fetch y en fallback de Puppeteer: ${fallbackError.message}`);
    }
  }
}

// ==========================================
// PARSERS DOM DE ALTO RENDIMIENTO (SINGLE-PASS)
// ==========================================

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

/**
 * Realiza un recorrido único O(N) de los bloques de métricas .price-data,
 * evitando las iteraciones anidadas anteriores sobre h2.section-h.
 */
function parseMetricsSinglePass($) {
  const metricsMap = new Map();
  $('.price-data').each((_, el) => {
    const dt = $(el).find('dt').text().trim().toLowerCase();
    const dd = $(el).find('dd').text().trim();
    if (dt && dd) {
      metricsMap.set(dt, dd);
    }
  });

  const getVal = (...keys) => {
    for (const key of keys) {
      if (metricsMap.has(key)) return metricsMap.get(key);
    }
    for (const [k, v] of metricsMap.entries()) {
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

// ==========================================
// ESTRUCTURAS POR DEFECTO Y FAIL-SAFE
// ==========================================

function createDefaultStockData() {
  return {
    price: null,
    trailingPE: null,
    forwardPE: null,
    averageStockPriceTarget: null,
    averagePriceTarget: null,
    potentialUpsideDownside: null,
    potentialUpside: null,
    netMargins: null,
    debtToEquity: null,
    priceToCashFlow: null,
    marketCap: null,
    dividendYield: null,
    mbRating: null,
    peg: null,
    marketBeatScores: {
      analystsOpinionScore: null,
      earningsValuationScore: null,
      shortInterestScore: null,
      dividendScore: null,
      newsSocialMediaScore: null,
      companyOwnershipScore: null
    }
  };
}

function createDefaultOpinions(ticker, exchange, name = null) {
  return {
    ticker,
    name: name || ticker,
    exchange,
    opinions: { compra: 0, mantener: 0, venta: 0 }
  };
}

// ==========================================
// EXTRACCIÓN DE OPINIONES DE ANALISTAS
// ==========================================

/**
 * Obtiene las opiniones de los analistas para una acción determinada.
 * @param {string} exchange 
 * @param {string} ticker 
 * @param {number|object} [optionsOrRetries=2] 
 * @returns {Promise<{ ticker: string, name: string, exchange: string, opinions: object }>}
 */
const getMarketBeatAnalystOpinions = async (exchange, ticker, optionsOrRetries = 2) => {
  const retryCount = typeof optionsOrRetries === 'number' ? optionsOrRetries : (optionsOrRetries.retries ?? 2);
  const forceRefresh = typeof optionsOrRetries === 'object' ? !!optionsOrRetries.forceRefresh : false;
  
  const cacheKey = `${exchange}:${ticker}`;
  if (!forceRefresh) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  let attempts = 0;
  while (attempts < retryCount) {
    try {
      const url = `https://www.marketbeat.com/stocks/${exchange}/${ticker}/forecast/`;
      const { html, isNotFound, isRedirectedToExchange } = await fetchHtmlFast(url);

      if (isNotFound || isRedirectedToExchange) {
        console.warn(`[Scraper] Ticker ${ticker} no encontrado en MarketBeat (Opiniones).`);
        const fallback = createDefaultOpinions(ticker, exchange);
        saveToCache(cacheKey, fallback);
        return fallback;
      }

      const $ = load(html);

      // Extraer nombre de la acción
      let name = $('h1').first().text().trim();
      const ix = name.indexOf('(');
      if (ix > -1) name = name.substring(0, ix).trim();
      if (!name) name = ticker;

      const opinions = { compra: 0, mantener: 0, venta: 0 };
      $('.d-flex.bold.justify-content-center > div').each((_, el) => {
        const label = $(el).contents()
          .filter((_, node) => node.type === 'text')
          .first().text().trim();
        const count = parseInt($(el).find('span').text().trim(), 10) || 0;
        if (recommendationMapping[label]) {
          opinions[recommendationMapping[label]] = count;
        }
      });

      const result = { ticker, name, exchange, opinions };
      saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      attempts++;
      if (attempts < retryCount) {
        await delay(1000 * Math.pow(2, attempts));
      } else {
        console.error(`[Scraper] Fallo final en getMarketBeatAnalystOpinions (${ticker}): ${error.message}`);
        // Fail-safe: no romper el proceso, devolver fallback seguro
        const safeFallback = createDefaultOpinions(ticker, exchange);
        return safeFallback;
      }
    }
  }
  return createDefaultOpinions(ticker, exchange);
};

// ==========================================
// EXTRACCIÓN DE DATOS FINANCIEROS Y SCORES
// ==========================================

/**
 * Obtiene métricas financieras y scores de MarketBeat para una acción.
 * @param {string} exchange 
 * @param {string} ticker 
 * @param {number|object} [optionsOrRetries=2] 
 * @returns {Promise<object>}
 */
const getMarketBeatStockData = async (exchange, ticker, optionsOrRetries = 2) => {
  const retryCount = typeof optionsOrRetries === 'number' ? optionsOrRetries : (optionsOrRetries.retries ?? 2);
  const forceRefresh = typeof optionsOrRetries === 'object' ? !!optionsOrRetries.forceRefresh : false;

  const cacheKey = `${exchange}:${ticker}:stockData`;
  if (!forceRefresh) {
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  let attempts = 0;
  while (attempts < retryCount) {
    try {
      const url = `https://www.marketbeat.com/stocks/${exchange}/${ticker}`;
      const { html, isNotFound, isRedirectedToExchange } = await fetchHtmlFast(url);

      if (isNotFound || isRedirectedToExchange) {
        console.warn(`[Scraper] Ticker ${ticker} no encontrado en MarketBeat (Datos).`);
        const fallback = createDefaultStockData();
        saveToCache(cacheKey, fallback);
        return fallback;
      }

      const $ = load(html);

      // 1) Precio actual
      const priceText = $('div.d-inline-block.mb-2.mr-4')
        .find('strong')
        .first()
        .text()
        .trim();

      // 2) Parseo de métricas en paso único O(N)
      const parsedMetrics = parseMetricsSinglePass($);

      // 3) Scores de MarketBeat
      const marketBeatScores = extractScores($);

      const stockData = {
        price: priceText || null,
        ...parsedMetrics,
        marketBeatScores
      };

      saveToCache(cacheKey, stockData);
      return stockData;
    } catch (error) {
      attempts++;
      if (attempts < retryCount) {
        await delay(1000 * Math.pow(2, attempts));
      } else {
        console.error(`[Scraper] Fallo final en getMarketBeatStockData (${ticker}): ${error.message}`);
        const safeFallback = createDefaultStockData();
        return safeFallback;
      }
    }
  }
  return createDefaultStockData();
};

// ==========================================
// EXTRACCIÓN COMBINADA Y PROCESAMIENTO EN LOTE
// ==========================================

/**
 * Obtiene opiniones y métricas de una acción en paralelo seguro.
 * @param {string} exchange 
 * @param {string} ticker 
 * @param {object} [options]
 */
const getMarketBeatCombinedData = async (exchange, ticker, options = {}) => {
  const [opinionsResult, stockDataResult] = await Promise.allSettled([
    getMarketBeatAnalystOpinions(exchange, ticker, options),
    getMarketBeatStockData(exchange, ticker, options)
  ]);

  const opinions = opinionsResult.status === 'fulfilled' 
    ? opinionsResult.value 
    : createDefaultOpinions(ticker, exchange);

  const stockData = stockDataResult.status === 'fulfilled'
    ? stockDataResult.value
    : createDefaultStockData();

  return {
    ticker,
    exchange,
    opinions,
    stockData
  };
};

/**
 * Procesa un catálogo de acciones por lotes con concurrencia controlada y fail-safe total.
 * @param {Array<{ exchange: string, ticker: string }>} stocks 
 * @param {object} [options]
 * @param {number} [options.concurrency=4] 
 * @param {function} [options.onProgress] 
 * @returns {Promise<Array<object>>}
 */
const scrapeStocksBatch = async (stocks, options = {}) => {
  const concurrency = options.concurrency || 4;
  const limit = pLimit(concurrency);
  const total = stocks.length;
  let completed = 0;

  const promises = stocks.map((stock) => {
    return limit(async () => {
      try {
        const data = await getMarketBeatCombinedData(stock.exchange, stock.ticker, options);
        completed++;
        if (options.onProgress) {
          options.onProgress({ completed, total, stock, data, error: null });
        }
        return data;
      } catch (err) {
        completed++;
        console.error(`[Batch] Error procesando ${stock.ticker}:`, err.message);
        const fallback = {
          ticker: stock.ticker,
          exchange: stock.exchange,
          opinions: createDefaultOpinions(stock.ticker, stock.exchange),
          stockData: createDefaultStockData(),
          error: err.message
        };
        if (options.onProgress) {
          options.onProgress({ completed, total, stock, data: fallback, error: err.message });
        }
        return fallback;
      }
    });
  });

  return Promise.all(promises);
};

function clearCache() {
  cache.clear();
  try {
    fs.writeFileSync(cacheFile, '{}', 'utf8');
    console.log('[Cache] Caché borrada y archivo reiniciado.');
  } catch (err) {
    console.error('[Cache] Error al reiniciar archivo:', err.message);
  }
}

// Cierre limpio de recursos al terminar el proceso
process.on('exit', () => {
  if (globalBrowser) {
    globalBrowser.close().catch(() => {});
  }
});

export {
  getMarketBeatAnalystOpinions,
  getMarketBeatStockData,
  getMarketBeatCombinedData,
  scrapeStocksBatch,
  clearCache
};
