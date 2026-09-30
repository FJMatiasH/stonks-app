import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteraService, AnalystData } from '../../services/server.service';
import { Subscription } from 'rxjs';

interface SortEvent {
  field: string;
  direction: 'asc' | 'desc';
}

interface MetricWeight {
  id: string;
  name: string;
  weight: number;
  locked: boolean;
}

@Component({
  selector: 'app-recommended',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl max-w-7xl mx-auto my-8">
      <h1 class="text-xl md:text-2xl font-bold font-mono tracking-tight text-text-main text-center mb-6">
        ACCIONES MÁS RECOMENDADAS
      </h1>

      <div class="flex justify-between items-center mb-4">
        <button (click)="clearCache()" [disabled]="clearingCache" class="bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 font-bold py-2 px-4 rounded transition-colors flex items-center gap-2">
          @if(clearingCache) {
            <div class="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
          }
          Borrar Caché
        </button>
        
        <button (click)="togglePanel()" class="bg-primary/20 hover:bg-primary/40 text-primary font-bold py-2 px-4 rounded transition-colors">
          Configurar Algoritmo
        </button>
      </div>

      @if(showPanel) {
        <div class="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-text-main">Ponderación del Algoritmo (Suma: {{ getTotalWeight() | number:'1.0-0' }}%)</h3>
            <button (click)="resetMetrics()" class="text-xs text-text-muted hover:text-text-main underline">Restablecer por defecto</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            @for(m of metrics; track m.id; let i = $index) {
              <div class="flex items-center gap-2">
                <button (click)="toggleLock(i)"
                  class="shrink-0 w-10 py-0.5 rounded text-[10px] font-bold border transition-all duration-200"
                  [ngClass]="m.locked
                    ? 'bg-[#6366f1] border-[#80DEEA] text-slate-800'
                    : 'bg-transparent border-slate-600 text-text-muted hover:border-slate-400'">
                  {{ m.locked ? '🔒' : '🔓' }}
                </button>
                <label class="w-1/4 text-xs truncate" [title]="m.name">{{ m.name }}</label>
                <input type="range" min="0" max="100" step="1" [value]="m.weight"
                  (input)="onWeightChange(i, $event)"
                  class="w-1/3 accent-primary"
                  [class.opacity-40]="m.locked">
                <div class="w-14 flex justify-end items-center gap-1">
                    <input type="number" min="0" max="100" step="1" [value]="m.weight"
                      (input)="onWeightChange(i, $event)"
                      class="w-12 bg-slate-900 border border-slate-700 text-xs text-right p-1 rounded font-mono focus:outline-none focus:border-primary"
                      [class.opacity-40]="m.locked">
                    <span class="text-xs font-mono text-text-muted">%</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (loading) {
        <div class="flex flex-col items-center justify-center py-12 gap-3">
          <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-text-muted font-medium text-sm animate-pulse">{{ progressText }}</span>
        </div>
      }

      @if (!loading && !recommendedStocks.length) {
        <div class="text-center py-12 text-text-muted font-medium">
          No se encontraron datos para mostrar.
        </div>
      }

      @if (!loading && recommendedStocks.length) {
        <div class="overflow-x-auto rounded-xl border border-slate-700/80 shadow-lg">
          <table class="w-full text-left border-collapse text-xs table-fixed">
            <thead class="bg-slate-900/90 text-text-muted text-[10px] md:text-xs font-semibold uppercase tracking-wider border-b border-slate-700 select-none">
              <tr>
                <th class="w-8 px-1 py-1.5"></th>
                <th (click)="sortBy('ticker')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors" title="Ticker">
                  Ticker {{ getSortIcon('ticker') }}
                </th>
                <th (click)="sortBy('superInvestorScore')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center" title="Superinversor Score (0-100)">
                  Sinvestors {{ getSortIcon('superInvestorScore') }}
                </th>
                <th (click)="sortBy('price')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Precio">
                  Precio {{ getSortIcon('price') }}
                </th>
                <th (click)="sortBy('rating')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center" title="Rating">
                  Rating {{ getSortIcon('rating') }}
                </th>
                <th (click)="sortBy('compra')" class="w-10 px-1 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center text-emerald-400" title="Comprar">
                  C {{ getSortIcon('compra') }}
                </th>
                <th (click)="sortBy('mantener')" class="w-10 px-1 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center text-amber-400" title="Mantener">
                  M {{ getSortIcon('mantener') }}
                </th>
                <th (click)="sortBy('venta')" class="w-10 px-1 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center text-rose-400" title="Vender">
                  V {{ getSortIcon('venta') }}
                </th>
                <th (click)="sortBy('marketCap')" class="w-20 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Capitalización (Billions)">
                  Cap {{ getSortIcon('marketCap') }}
                </th>
                <th (click)="sortBy('dividendYield')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Dividend Yield">
                  Div% {{ getSortIcon('dividendYield') }}
                </th>
                <th (click)="sortBy('trailingPE')" class="w-14 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Trailing P/E">
                  P/E {{ getSortIcon('trailingPE') }}
                </th>
                <th (click)="sortBy('forwardPE')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Forward P/E">
                  F. PE {{ getSortIcon('forwardPE') }}
                </th>
                <th (click)="sortBy('peg')" class="w-14 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="P/E Growth (PEG)">
                  PEG {{ getSortIcon('peg') }}
                </th>
                <th (click)="sortBy('potentialUpside')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Potencial Upside">
                  Upside {{ getSortIcon('potentialUpside') }}
                </th>
                <th (click)="sortBy('netMargins')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Margen Neto">
                  M. Neto {{ getSortIcon('netMargins') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-text-main font-mono text-[10px] md:text-xs">
              @for (stock of recommendedStocks; track stock.ticker) {
                <tr class="hover:bg-slate-700/40 transition-colors cursor-pointer" (click)="toggleRow(stock.ticker)">
                  <td class="px-1 py-1.5 text-center text-text-muted text-xs select-none">
                    {{ expandedTickers.has(stock.ticker) ? '▼' : '▶' }}
                  </td>
                  <td class="px-2 py-1.5 font-bold text-bullish truncate">{{ stock.ticker }}</td>
                  <td class="px-2 py-1.5 text-center">
                    <span class="px-1.5 py-0.5 rounded font-bold text-[10px]" [ngClass]="getSuperInvColor(stock.superInvestorScore || 0)">
                      {{ stock.superInvestorScore || 0 }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5 text-right">
                    {{ stock.stockData?.price != null ? (stock.stockData!.price | number:'1.2-2') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-center font-bold text-primary">
                    {{ stock.rating | number:'1.0-1' }}
                  </td>
                  <td class="px-1 py-1.5 text-center text-emerald-400 font-semibold">{{ stock.opinions?.compra || 0 }}</td>
                  <td class="px-1 py-1.5 text-center text-amber-400">{{ stock.opinions?.mantener || 0 }}</td>
                  <td class="px-1 py-1.5 text-center text-rose-400 font-semibold">{{ stock.opinions?.venta || 0 }}</td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.marketCap != null ? (formatMarketCap(stock.stockData!.marketCap!)) : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.dividendYield != null ? (stock.stockData!.dividendYield | number:'1.2-2') + '%' : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.trailingPE != null ? (stock.stockData!.trailingPE | number:'1.1-1') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.forwardPE != null ? (stock.stockData!.forwardPE | number:'1.1-1') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.peg != null ? (stock.stockData!.peg | number:'1.2-2') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right font-bold" 
                      [ngClass]="(stock.stockData?.potentialUpside ?? 0) >= 0 ? 'text-bullish' : 'text-bearish'">
                    {{ stock.stockData?.potentialUpside != null ? ((stock.stockData!.potentialUpside! / 100) | percent:'1.0-1') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted font-sans text-[10px]">
                    {{ stock.stockData?.netMargins || '-' }}
                  </td>
                </tr>
                @if (expandedTickers.has(stock.ticker)) {
                  <tr class="bg-slate-800/30 border-b border-slate-700/50">
                    <td [attr.colspan]="15" class="px-4 py-0">
                      <div class="overflow-hidden">
                        <table class="w-full text-[10px] my-2">
                          <thead>
                            <tr class="text-slate-400 font-bold uppercase tracking-wider">
                              <th class="px-3 py-1 text-center">Analistas</th>
                              <th class="px-3 py-1 text-center">Valoración</th>
                              <th class="px-3 py-1 text-center">Desinteres Corto</th>
                              <th class="px-3 py-1 text-center">Dividendo</th>
                              <th class="px-3 py-1 text-center">Noticias</th>
                              <th class="px-3 py-1 text-center">Insiders</th>
                              <th class="px-3 py-1 text-center">Debt/Equity</th>
                              <th class="px-3 py-1 text-center">P/CF</th>
                              <th class="px-3 py-1 text-center">MB Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr class="text-text-main">
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.marketBeatScores?.analystsOpinionScore ?? '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.marketBeatScores?.earningsValuationScore ?? '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.marketBeatScores?.shortInterestScore ?? '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.marketBeatScores?.dividendScore ?? '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.marketBeatScores?.newsSocialMediaScore ?? '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.marketBeatScores?.companyOwnershipScore ?? '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.debtToEquity != null ? (stock.stockData!.debtToEquity | number:'1.2-2') : '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.priceToCashFlow != null ? (stock.stockData!.priceToCashFlow | number:'1.2-2') : '-' }}</span>
                              </td>
                              <td class="px-3 py-1 text-center">
                                <span class="bg-slate-700/60 px-2 py-0.5 rounded">{{ stock.stockData?.mbRating != null ? (stock.stockData!.mbRating | number:'1.1-1') + '/4' : '-' }}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: []
})
export class RecommendedStocksComponent implements OnInit, OnDestroy {
  recommendedStocks: AnalystData[] = [];
  private tempStocks: AnalystData[] = [];
  loading = true;
  clearingCache = false;
  showPanel = false;
  progressText = 'Iniciando conexión...';
  sortEvent: SortEvent = { field: 'rating', direction: 'desc' };
  private streamSub!: Subscription;
  expandedTickers = new Set<string>();

  metrics: MetricWeight[] = [];

  constructor(private carteraService: CarteraService) {
    this.resetMetrics();
  }

  ngOnInit(): void {
    this.streamData();
  }

  ngOnDestroy(): void {
    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
  }

  resetMetrics() {
    this.metrics = [
      { id: 'superInvestor', name: 'Superinversores Dataroma', weight: 0, locked: true },
      { id: 'ana', name: 'Opinión de Analistas (MB)', weight: 50, locked: true },
      { id: 'val', name: 'Valoración y Ganancias (MB)', weight: 0, locked: true },
      { id: 'ic', name: 'Interés Corto (MB)', weight: 0, locked: true },
      { id: 'div', name: 'Rendimiento por Dividendo (MB)', weight: 0, locked: true },
      { id: 'news', name: 'Sentimiento en Noticias (MB)', weight: 0, locked: true },
      { id: 'ins', name: 'Transacciones Insider (MB)', weight: 0, locked: true },
      { id: 'analystRatio', name: 'Consenso de Compra/Venta', weight: 0, locked: true },
      { id: 'upside', name: 'Potencial Upside', weight: 50, locked: true },
      { id: 'trailingPE', name: 'Trailing P/E', weight: 0, locked: true },
      { id: 'forwardPE', name: 'Forward P/E', weight: 0, locked: true },
      { id: 'debtToEquity', name: 'Debt-to-Equity Ratio', weight: 0, locked: true },
      { id: 'priceToCashFlow', name: 'Price / Cash Flow', weight: 0, locked: true },
      { id: 'netMargins', name: 'Margen Neto', weight: 0, locked: true },
      { id: 'marketCap', name: 'Market Cap', weight: 0, locked: true },
      { id: 'dividendYield', name: 'Dividend Yield', weight: 0, locked: true },
      { id: 'mbRating', name: 'MarketBeat Rating (0-4)', weight: 0, locked: true },
      { id: 'peg', name: 'P/E Growth (PEG)', weight: 0, locked: true }
    ];
    this.recalculateRatings();
  }

  togglePanel() {
    this.showPanel = !this.showPanel;
  }

  toggleRow(ticker: string) {
    if (this.expandedTickers.has(ticker)) {
      this.expandedTickers.delete(ticker);
    } else {
      this.expandedTickers.add(ticker);
    }
  }

  toggleLock(index: number) {
    this.metrics[index].locked = !this.metrics[index].locked;
  }

  clearCache() {
    this.clearingCache = true;
    this.carteraService.clearCache().subscribe({
      next: () => {
        this.clearingCache = false;
        if (this.streamSub) this.streamSub.unsubscribe();
        this.tempStocks = [];
        this.recommendedStocks = [];
        this.streamData();
      },
      error: (err: unknown) => {
        console.error('Error borrando caché:', err);
        this.clearingCache = false;
      }
    });
  }

  getTotalWeight(): number {
    return this.metrics.reduce((s, m) => s + m.weight, 0);
  }

  onWeightChange(index: number, event: Event) {
    const target = event.target as HTMLInputElement;

    // If locked, revert the input to the current value
    if (this.metrics[index].locked) {
      target.value = String(this.metrics[index].weight);
      return;
    }

    let newVal = parseInt(target.value, 10);
    if (isNaN(newVal)) newVal = 0;
    if (newVal < 0) newVal = 0;
    if (newVal > 100) newVal = 100;

    const oldVal = this.metrics[index].weight;
    const diff = newVal - oldVal;
    if (diff === 0) return;

    // Only unlocked sliders (excluding current) participate in redistribution
    const unlocked = this.metrics
      .map((m, i) => ({ m, i }))
      .filter(x => x.i !== index && !x.m.locked);

    if (unlocked.length === 0) {
      // Can't redistribute — revert
      target.value = String(oldVal);
      return;
    }

    this.metrics[index].weight = newVal;
    const unlockedSum = unlocked.reduce((s, x) => s + x.m.weight, 0);

    if (unlockedSum === 0) {
      const share = -diff / unlocked.length;
      unlocked.forEach(x => { x.m.weight = Math.max(0, x.m.weight + share); });
    } else {
      unlocked.forEach(x => {
        x.m.weight = Math.max(0, x.m.weight - (diff * (x.m.weight / unlockedSum)));
      });
    }

    // Round and fix residual
    this.metrics.forEach(m => { m.weight = Math.max(0, Math.round(m.weight)); });
    const total = this.metrics.reduce((s, m) => s + m.weight, 0);
    if (Math.abs(total - 100) > 0.001 && unlocked.length > 0) {
      unlocked[0].m.weight += (100 - total);
      unlocked[0].m.weight = Math.max(0, unlocked[0].m.weight);
    }

    this.recalculateRatings();
  }

  // --- Normalization helpers (Score 0-100) ---

  private normalizePE(pe: number | undefined): number {
    if (pe == null || pe <= 0) return 0;
    if (pe <= 15) return 100;
    if (pe >= 80) return 0;
    return 100 - ((pe - 15) / (80 - 15) * 100);
  }

  private normalizeDebtToEquity(de: number | undefined): number {
    if (de == null) return 0;
    if (de <= 0) return 100;
    if (de >= 3) return 0;
    return 100 - ((de / 3) * 100);
  }

  private normalizePriceToCashFlow(pcf: number | undefined): number {
    if (pcf == null || pcf <= 0) return 0;
    if (pcf <= 10) return 100;
    if (pcf >= 50) return 0;
    return 100 - ((pcf - 10) / (50 - 10) * 100);
  }

  private normalizeMargin(margin: number | undefined): number {
    if (margin == null) return 0;
    if (margin <= 0) return 0;
    if (margin >= 40) return 100;
    return (margin / 40) * 100;
  }

  /** mbRating 0-4 → 0-100 linearly */
  private normalizeMBRating(rating: number | undefined): number {
    if (rating == null) return 0;
    return Math.min(100, Math.max(0, (rating / 4.0) * 100));
  }

  /** PEG <= 1 → 100, PEG >= 5 → 0, linear between */
  private normalizePEG(peg: number | undefined): number {
    if (peg == null) return 0;
    if (peg <= 0.0) return 100;
    if (peg >= 5.0) return 0;
    return 100 - ((peg - 1.0) / 4.0) * 100;
  }

  /** Dividend Yield 0% → 0, >=5% → 100 */
  private normalizeDividendYield(div: number | undefined): number {
    if (div == null || div <= 0) return 0;
    if (div >= 5.0) return 100;
    return (div / 5.0) * 100;
  }

  /** Market cap in Billions: >=2000B(2T) → 100, logarithmic scale */
  private normalizeMarketCap(cap: number | undefined): number {
    if (cap == null || cap <= 0) return 0;
    // Logarithmic scale: log(cap) / log(2000) * 100, capped at 100
    const score = (Math.log10(cap) / Math.log10(2000)) * 100;
    return Math.min(100, Math.max(0, score));
  }

  private recalculateRatings() {
    const m: Record<string, number> = {};
    this.metrics.forEach(x => { m[x.id] = x.weight / 100; });
    
    this.tempStocks.forEach(s => {
        let score = 0;
        
        // Basic metrics
        score += (s.superInvestorScore || 0) * m['superInvestor'];
        score += (s.stockData?.marketBeatScores?.analystsOpinionScore || 0) * m['ana'];
        score += (s.stockData?.marketBeatScores?.earningsValuationScore || 0) * m['val'];
        score += (s.stockData?.marketBeatScores?.shortInterestScore || 0) * m['ic'];
        score += (s.stockData?.marketBeatScores?.dividendScore || 0) * m['div'];
        score += (s.stockData?.marketBeatScores?.newsSocialMediaScore || 0) * m['news'];
        score += (s.stockData?.marketBeatScores?.companyOwnershipScore || 0) * m['ins'];
        
        // Consenso
        const { compra = 0, mantener = 0, venta = 0 } = s.opinions || {};
        const total = compra + mantener + venta;
        const analystRatio = total ? (compra - venta) / total : 0;
        const safeAnalyst = Math.max(0, Math.min(analystRatio, 1));
        score += (safeAnalyst * 100) * m['analystRatio'];
        
        // Upside — FIXED: 50% upside = 100 pts (was 10%)
        const upsideVal = s.stockData?.potentialUpside ?? 0;
        let upsidePts = 0;
        if (upsideVal > 0) {
          if (upsideVal <= 50) upsidePts = (upsideVal / 50) * 100;
          else upsidePts = 100; 
        }
        score += upsidePts * m['upside'];

        // Advanced Metrics (Normalized to 0-100)
        score += this.normalizePE(s.stockData?.trailingPE) * m['trailingPE'];
        score += this.normalizePE(s.stockData?.forwardPE) * m['forwardPE'];
        score += this.normalizeDebtToEquity(s.stockData?.debtToEquity) * m['debtToEquity'];
        score += this.normalizePriceToCashFlow(s.stockData?.priceToCashFlow) * m['priceToCashFlow'];
        score += this.normalizeMargin(s.stockData?.netMargins) * m['netMargins'];

        // NEW 4 metrics
        score += this.normalizeMarketCap(s.stockData?.marketCap) * m['marketCap'];
        score += this.normalizeDividendYield(s.stockData?.dividendYield) * m['dividendYield'];
        score += this.normalizeMBRating(s.stockData?.mbRating) * m['mbRating'];
        score += this.normalizePEG(s.stockData?.peg) * m['peg'];
        
        s.rating = score;
    });
    
    this.recommendedStocks = [...this.tempStocks];
    this.applySort();
  }

  private streamData(): void {
    this.streamSub = this.carteraService.getFullAnalystsStream().subscribe({
      next: (event: Record<string, unknown>) => {
        if (event['type'] === 'start') {
          this.loading = true;
          this.progressText = `Cargando 0 de ${event['total']} acciones...`;
        } else if (event['type'] === 'data') {
          this.progressText = `Cargando ${event['completed']} de ${event['total']} acciones...`;
          const result = event['result'] as Record<string, unknown> | undefined;
          if (result && !result['error']) {
            this.processNewStock(result as unknown as AnalystData);
          }
        } else if (event['type'] === 'error') {
          this.progressText = `Cargando ${event['completed']} de ${event['total']} acciones... (hubo un error con una acción)`;
        } else if (event['type'] === 'done') {
          this.loading = false;
          this.recalculateRatings();
        }
      },
      error: (err: unknown) => { 
        console.error('Error en el stream', err);
        this.loading = false; 
      }
    });
  }

  private processNewStock(rawStock: AnalystData): void {
    const s: AnalystData = rawStock;

    if (s.opinions && (s.opinions as Record<string, unknown>)['opinions']) {
      s.opinions = (s.opinions as Record<string, unknown>)['opinions'] as AnalystData['opinions'];
    }

    const { compra = 0, mantener = 0, venta = 0 } = s.opinions || {};
    if ((compra + mantener + venta) < 5) return;

    if (s.stockData) {
      const raw = s.stockData as Record<string, unknown>;
      s.stockData.price = this.parseNumber(raw['price']);
      s.stockData.trailingPE = this.parseNumber(raw['trailingPE']);
      s.stockData.forwardPE = this.parseNumber(raw['forwardPE']);
      const avgRaw = raw['averagePriceTarget'] ?? raw['averageStockPriceTarget'];
      s.stockData.averagePriceTarget = this.parseNumber(avgRaw);
      const upRaw = raw['potentialUpside'] ?? raw['potentialUpsideDownside'];
      s.stockData.potentialUpside = this.parseNumber(upRaw);
      s.stockData.netMargins = this.parseNumber(raw['netMargins']);
      s.stockData.debtToEquity = this.parseNumber(raw['debtToEquity']);
      s.stockData.priceToCashFlow = this.parseNumber(raw['priceToCashFlow']);
      s.stockData.marketCap = this.parseNumber(raw['marketCap']);
      s.stockData.dividendYield = this.parseNumber(raw['dividendYield']);
      s.stockData.mbRating = this.parseNumber(raw['mbRating']);
      s.stockData.peg = this.parseNumber(raw['peg']);
    }

    const existingIndex = this.tempStocks.findIndex(st => st.ticker === s.ticker);
    if (existingIndex !== -1) {
      this.tempStocks[existingIndex] = s;
    } else {
      this.tempStocks.push(s);
    }
    
    // update real-time
    if (!this.loading) {
        this.recalculateRatings();
    }
  }

  sortBy(field: string): void {
    if (this.sortEvent.field === field) {
      this.sortEvent.direction = this.sortEvent.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortEvent.field = field;
      this.sortEvent.direction = 'asc';
    }
    this.applySort();
  }

  getSortIcon(field: string): string {
    return this.sortEvent.field === field
      ? this.sortEvent.direction === 'asc' ? '▲' : '▼'
      : '';
  }

  private applySort(): void {
    const { field, direction } = this.sortEvent;
    this.recommendedStocks = [...this.recommendedStocks].sort((a, b) => {
      const aVal = this.getFieldValue(a, field);
      const bVal = this.getFieldValue(b, field);
      if (aVal == null && bVal != null) return 1;
      if (aVal != null && bVal == null) return -1;
      if (aVal == null && bVal == null) return 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * (direction === 'asc' ? 1 : -1);
      }
      return ((aVal as number) - (bVal as number)) * (direction === 'asc' ? 1 : -1);
    });
  }

  private getFieldValue(stock: AnalystData, field: string): string | number | undefined {
    switch (field) {
      case 'ticker': return stock.ticker;
      case 'superInvestorScore': return stock.superInvestorScore;
      case 'exchange': return stock.exchange;
      case 'price': return stock.stockData?.price;
      case 'rating': return stock.rating;
      case 'compra': return stock.opinions?.compra;
      case 'mantener': return stock.opinions?.mantener;
      case 'venta': return stock.opinions?.venta;
      case 'trailingPE': return stock.stockData?.trailingPE;
      case 'forwardPE': return stock.stockData?.forwardPE;
      case 'debtToEquity': return stock.stockData?.debtToEquity;
      case 'priceToCashFlow': return stock.stockData?.priceToCashFlow;
      case 'averagePriceTarget': return stock.stockData?.averagePriceTarget;
      case 'potentialUpside': return stock.stockData?.potentialUpside;
      case 'netMargins': return stock.stockData?.netMargins;
      case 'marketCap': return stock.stockData?.marketCap;
      case 'dividendYield': return stock.stockData?.dividendYield;
      case 'peg': return stock.stockData?.peg;
      default: return undefined;
    }
  }

  getSuperInvColor(score: number): string {
    if (score >= 70) return 'bg-emerald-500/20 text-emerald-400';
    if (score >= 40) return 'bg-amber-500/20 text-amber-400';
    return 'bg-rose-500/20 text-rose-400';
  }

  formatMarketCap(capBillions: number): string {
    if (capBillions >= 1000) {
      return (capBillions / 1000).toFixed(2) + 'T';
    }
    if (capBillions >= 1) {
      return capBillions.toFixed(1) + 'B';
    }
    return (capBillions * 1000).toFixed(0) + 'M';
  }

  private parseNumber(value: unknown): number | undefined {
    if (value == null) return undefined;
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? undefined : num;
  }
}
