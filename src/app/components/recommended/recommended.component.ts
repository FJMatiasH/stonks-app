import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteraService, AnalystData } from '../../services/server.service';
import { Subscription } from 'rxjs';

interface SortEvent {
  field: string;
  direction: 'asc' | 'desc';
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
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-text-muted text-[10px] md:text-xs font-semibold uppercase tracking-wider border-b border-slate-700 select-none">
              <tr>
                <th (click)="sortBy('ticker')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors" title="Ticker">
                  Tick {{ getSortIcon('ticker') }}
                </th>
                <th (click)="sortBy('superInvestorScore')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center" title="Superinversor Score (0-100)">
                  S.Inv {{ getSortIcon('superInvestorScore') }}
                </th>
                <th (click)="sortBy('price')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Precio">
                  Precio {{ getSortIcon('price') }}
                </th>
                <th (click)="sortBy('rating')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center" title="Rating">
                  Rat. {{ getSortIcon('rating') }}
                </th>
                <th (click)="sortBy('compra')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center text-emerald-400" title="Comprar">
                  C {{ getSortIcon('compra') }}
                </th>
                <th (click)="sortBy('mantener')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center text-amber-400" title="Mantener">
                  M {{ getSortIcon('mantener') }}
                </th>
                <th (click)="sortBy('venta')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center text-rose-400" title="Vender">
                  V {{ getSortIcon('venta') }}
                </th>
                <th class="px-2 py-1.5 text-center" title="MarketBeat Scores (Analysts, Earnings, Short, Div, News, Ownership)">
                  MB Scores
                </th>
                <th (click)="sortBy('trailingPE')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Trailing P/E">
                  P/E {{ getSortIcon('trailingPE') }}
                </th>
                <th (click)="sortBy('forwardPE')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Forward P/E">
                  Fwd PE {{ getSortIcon('forwardPE') }}
                </th>
                <th (click)="sortBy('averagePriceTarget')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Precio Objetivo">
                  P. Obj {{ getSortIcon('averagePriceTarget') }}
                </th>
                <th (click)="sortBy('potentialUpside')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Potencial Upside">
                  Upside {{ getSortIcon('potentialUpside') }}
                </th>
                <th (click)="sortBy('netMargins')" class="px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Margen Neto">
                  M. Neto {{ getSortIcon('netMargins') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-text-main font-mono text-[10px] md:text-xs">
              @for (stock of recommendedStocks; track stock.ticker) {
                <tr class="hover:bg-slate-700/40 transition-colors">
                  <td class="px-2 py-1.5 font-bold text-bullish">{{ stock.ticker }}</td>
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
                  <td class="px-2 py-1.5 text-center text-emerald-400 font-semibold">{{ stock.opinions?.compra || 0 }}</td>
                  <td class="px-2 py-1.5 text-center text-amber-400">{{ stock.opinions?.mantener || 0 }}</td>
                  <td class="px-2 py-1.5 text-center text-rose-400 font-semibold">{{ stock.opinions?.venta || 0 }}</td>
                  <td class="px-2 py-1.5 text-center flex flex-wrap justify-center gap-1">
                    <span title="Analysts Opinion" class="text-[9px] bg-slate-800 px-1 rounded">{{ stock.stockData?.marketBeatScores?.analystsOpinionScore || '-' }}</span>
                    <span title="Earnings & Valuation" class="text-[9px] bg-slate-800 px-1 rounded">{{ stock.stockData?.marketBeatScores?.earningsValuationScore || '-' }}</span>
                    <span title="Short Interest" class="text-[9px] bg-slate-800 px-1 rounded">{{ stock.stockData?.marketBeatScores?.shortInterestScore || '-' }}</span>
                    <span title="Dividend" class="text-[9px] bg-slate-800 px-1 rounded">{{ stock.stockData?.marketBeatScores?.dividendScore || '-' }}</span>
                    <span title="News & Social" class="text-[9px] bg-slate-800 px-1 rounded">{{ stock.stockData?.marketBeatScores?.newsSocialMediaScore || '-' }}</span>
                    <span title="Ownership" class="text-[9px] bg-slate-800 px-1 rounded">{{ stock.stockData?.marketBeatScores?.companyOwnershipScore || '-' }}</span>
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.trailingPE != null ? (stock.stockData!.trailingPE | number:'1.1-1') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted">
                    {{ stock.stockData?.forwardPE != null ? (stock.stockData!.forwardPE | number:'1.1-1') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-main">
                    {{ stock.stockData?.averagePriceTarget != null ? (stock.stockData!.averagePriceTarget | number:'1.1-2') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right font-bold" 
                      [ngClass]="(stock.stockData?.potentialUpside ?? 0) >= 0 ? 'text-bullish' : 'text-bearish'">
                    {{ stock.stockData?.potentialUpside != null ? ((stock.stockData!.potentialUpside! / 100) | percent:'1.0-1') : '-' }}
                  </td>
                  <td class="px-2 py-1.5 text-right text-text-muted font-sans text-[10px]">
                    {{ stock.stockData?.netMargins || '-' }}
                  </td>
                </tr>
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
  progressText = 'Iniciando conexión...';
  sortEvent: SortEvent = { field: 'rating', direction: 'desc' };
  private streamSub!: Subscription;

  constructor(private carteraService: CarteraService) {}

  ngOnInit(): void {
    this.streamData();
  }

  ngOnDestroy(): void {
    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
  }

  private streamData(): void {
    this.streamSub = this.carteraService.getFullAnalystsStream().subscribe({
      next: (event: any) => {
        if (event.type === 'start') {
          this.loading = true;
          this.progressText = `Cargando 0 de ${event.total} acciones...`;
        } else if (event.type === 'data') {
          this.progressText = `Cargando ${event.completed} de ${event.total} acciones...`;
          if (event.result && !event.result.error) {
            this.processNewStock(event.result);
          }
        } else if (event.type === 'error') {
          this.progressText = `Cargando ${event.completed} de ${event.total} acciones... (hubo un error con una acción)`;
        } else if (event.type === 'done') {
          this.loading = false;
          this.recommendedStocks = [...this.tempStocks];
          this.applySort();
        }
      },
      error: (err) => { 
        console.error('Error en el stream', err);
        this.loading = false; 
      }
    });
  }

  private processNewStock(rawStock: any): void {
    let s: AnalystData = rawStock;

    if (s.opinions && (s.opinions as any).opinions) {
      s.opinions = (s.opinions as any).opinions;
    }

    const { compra = 0, mantener = 0, venta = 0 } = s.opinions || {};
    if ((compra + mantener + venta) < 5) return;

    if (s.stockData) {
      const raw: any = s.stockData;
      s.stockData.price = this.parseNumber(raw.price);
      s.stockData.trailingPE = this.parseNumber(raw.trailingPE);
      s.stockData.forwardPE = this.parseNumber(raw.forwardPE);
      const avgRaw = raw.averagePriceTarget ?? raw.averageStockPriceTarget;
      s.stockData.averagePriceTarget = this.parseNumber(avgRaw);
      const upRaw = raw.potentialUpside ?? raw.potentialUpsideDownside;
      s.stockData.potentialUpside = this.parseNumber(upRaw);
      s.stockData.netMargins = raw.netMargins;
    }

    const total = compra + mantener + venta;
    const analystRatio = total ? (compra - venta) / total : 0;
    const safeAnalyst = Math.max(0, Math.min(analystRatio, 1));
    const analystPts = safeAnalyst * 70;

    const upsideVal = s.stockData?.potentialUpside ?? 0;
    let upsidePts = 0;
    if (upsideVal > 0) {
      if (upsideVal <= 10) {
        upsidePts = (upsideVal / 10) * 15;
      } else {
        const clamped = Math.min(upsideVal, 100);
        upsidePts = 15 + ((clamped - 10) / 90) * 15;
      }
    }

    s.rating = analystPts + upsidePts;

    const existingIndex = this.tempStocks.findIndex(st => st.ticker === s.ticker);
    if (existingIndex !== -1) {
      if ((s.rating ?? 0) > (this.tempStocks[existingIndex].rating ?? 0)) {
        this.tempStocks[existingIndex] = s;
      }
    } else {
      this.tempStocks.push(s);
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
      case 'averagePriceTarget': return stock.stockData?.averagePriceTarget;
      case 'potentialUpside': return stock.stockData?.potentialUpside;
      case 'netMargins': return this.parseNumber(stock.stockData?.netMargins);
      default: return undefined;
    }
  }

  getSuperInvColor(score: number): string {
    if (score >= 70) return 'bg-emerald-500/20 text-emerald-400';
    if (score >= 40) return 'bg-amber-500/20 text-amber-400';
    return 'bg-rose-500/20 text-rose-400';
  }

  private parseNumber(value: any): number | undefined {
    if (value == null) return undefined;
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? undefined : num;
  }
}
