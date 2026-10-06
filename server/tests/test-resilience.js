import { 
  getMarketBeatAnalystOpinions, 
  getMarketBeatStockData, 
  getMarketBeatCombinedData, 
  scrapeStocksBatch 
} from '../scrapers/marketbeat-scraper.js';

async function runResilienceTests() {
  console.log('=== TEST 1: TICKER INEXISTENTE (RESILIENCIA Y FAIL-SAFE) ===');
  const invalidStock = { exchange: 'NASDAQ', ticker: 'NON_EXISTENT_XYZ123' };
  
  const startInvalid = Date.now();
  const invalidResult = await getMarketBeatCombinedData(invalidStock.exchange, invalidStock.ticker, { forceRefresh: true });
  console.log(`Tiempo ticker inexistente: ${Date.now() - startInvalid}ms`);
  console.log('Resultado seguro obtenido:', JSON.stringify(invalidResult, null, 2));

  if (invalidResult.opinions && invalidResult.stockData && invalidResult.stockData.price === null) {
    console.log('✅ TEST 1 PASADO: Ticker inexistente manejado limpiamente con valores por defecto.');
  } else {
    console.error('❌ TEST 1 FALLADO: Estructura inesperada');
  }

  console.log('\n=== TEST 2: PROCESAMIENTO EN LOTE (BATCH CONCURRENT POOL) ===');
  const batchStocks = [
    { exchange: 'NASDAQ', ticker: 'GOOGL' },
    { exchange: 'NASDAQ', ticker: 'AMZN' },
    { exchange: 'NYSE', ticker: 'KO' },
    { exchange: 'NASDAQ', ticker: 'FAKE_TICKER_404' }
  ];

  const startBatch = Date.now();
  const batchResults = await scrapeStocksBatch(batchStocks, { 
    concurrency: 4, 
    forceRefresh: true,
    onProgress: (p) => {
      console.log(`Progreso: [${p.completed}/${p.total}] ${p.stock.ticker}`);
    }
  });
  const durationBatch = Date.now() - startBatch;
  console.log(`Lote completado en: ${durationBatch}ms (${(durationBatch / batchStocks.length).toFixed(0)}ms/acción)`);
  console.log(`Total resultados obtenidos: ${batchResults.length}`);

  const fakeResult = batchResults.find(r => r.ticker === 'FAKE_TICKER_404');
  if (fakeResult && batchResults.length === 4) {
    console.log('✅ TEST 2 PASADO: Lote ejecutado sin interrupción ante tickers fallidos.');
  } else {
    console.error('❌ TEST 2 FALLADO: Batch incompleto');
  }
}

runResilienceTests().catch(console.error);
