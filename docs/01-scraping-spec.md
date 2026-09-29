# Spec: Scraping de Datos en MarketBeat (SDD)

## 1. Objetivo
Extraer métricas financieras clave y calificaciones de analistas desde MarketBeat para evaluar acciones, asegurando fiabilidad y manejo de errores.

## 2. Selectores HTML y Estrategias
El scraping se realiza mediante Puppeteer (simulando un navegador real con `puppeteer-extra-plugin-stealth` para evitar bloqueos de Cloudflare) y Cheerio para el parseo del DOM.

### 2.1. Precio Actual
- **Selector**: `div.d-inline-block.mb-2.mr-4 strong`
- **Extracción**: Primer elemento `<strong>` dentro de este contenedor.

### 2.2. MarketBeat Scores
Se extraen buscando IDs específicos que contienen `.mr-score`:
- `questionAnalystsOpinion`: Opinión de Analistas
- `questionEarningsandValuation`: Valoración y Ganancias
- `questionShortInterest`: Interés Corto
- `questionDividend`: Dividendo
- `questionNewsandSocialMedia`: Noticias y Redes Sociales
- `questionCompanyOwnership`: Transacciones Insider

### 2.3. Métricas Avanzadas (PE, D/E, P/CF, Margen)
Los datos se encuentran estructurados en listas de definición `<dl>` precedidas por un encabezado `<h2 class="section-h">`:
1. **Profitability**: 
   - *Trailing P/E Ratio*
   - *Forward P/E Ratio*
   - *Net Margin*
2. **Price Target and Rating**:
   - *Average Price Target*
   - *Potential Upside/Downside*
3. **Debt**:
   - *Debt-to-Equity Ratio*
4. **Sales & Book Value**:
   - *Price / Cash Flow*

## 3. Manejo de Errores y Fallbacks
- **Validación Cloudflare**: Si el título (`<title>`) incluye "Just a moment...", se lanza una excepción explícita que dispara los reintentos automáticos.
- **Limpieza Numérica**: Los datos extraídos pueden contener sufijos o signos (ej. "$10.5", "10%", "-"). Se utiliza un `parseNumberStrict` para dejar únicamente dígitos, y devolver `null` si la data no es parseable o es `-`.
- **Reintentos con Backoff Exponencial**: Máximo de reintentos predefinido con una espera progresiva (`2000 * 2^attempt` milisegundos).

## 4. Modelo de Datos Extraído (StockData)
```typescript
export interface StockData {
  price?: number;
  trailingPE?: number;
  forwardPE?: number;
  averagePriceTarget?: number;
  potentialUpside?: number;
  netMargins?: number;
  debtToEquity?: number;       // Nuevo
  priceToCashFlow?: number;    // Nuevo
  marketBeatScores?: {
    analystsOpinionScore?: number | null;
    earningsValuationScore?: number | null;
    shortInterestScore?: number | null;
    dividendScore?: number | null;
    newsSocialMediaScore?: number | null;
    companyOwnershipScore?: number | null;
  };
}
```
