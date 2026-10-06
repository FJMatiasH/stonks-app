import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteraService, AnalystData } from '../../services/server.service';
import { ListsService, CustomList } from '../../services/lists.service';
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl max-w-7xl mx-auto my-8">
      <h1 class="text-xl md:text-2xl font-bold font-mono tracking-tight text-text-main text-center mb-6">
        ACCIONES MÁS RECOMENDADAS
      </h1>

      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Borrar Caché -->
          <button (click)="clearCache()" [disabled]="clearingCache" 
            class="h-10 px-4 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            @if(clearingCache) {
              <div class="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
            }
            <span>🗑️ Borrar Caché</span>
          </button>
          
          <!-- Crear Lista -->
          <button (click)="openCreateListModal()" 
            class="h-10 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
            <span class="text-base leading-none font-bold">+</span>
            <span>Crear</span>
          </button>

          <!-- Menú Desplegable (Select) -->
          <div class="relative inline-flex items-center">
            <select (change)="onListChange($event)" [value]="selectedListId" 
              class="h-10 pl-4 pr-9 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-text-main border border-slate-700 hover:border-slate-600 font-bold text-xs md:text-sm transition-all focus:outline-none focus:border-primary cursor-pointer shadow-sm appearance-none">
              <option value="all">🌐 Todas</option>
              @for(list of customLists; track list.id) {
                <option [value]="list.id">
                  {{ list.id === 'favs' ? '★ ' : (list.id === 'mag10' ? '⚡ ' : '📁 ') }}{{ list.name }} ({{ list.tickers.length }})
                </option>
              }
            </select>
            <span class="pointer-events-none absolute right-3 text-slate-400 text-xs">▼</span>
          </div>
        </div>
        
        <!-- Configurar Algoritmo -->
        <button (click)="togglePanel()" 
          class="h-10 px-4 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
          <span>⚙️ Configurar Algoritmo</span>
        </button>
      </div>

      @if(showPanel) {
        <div class="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-text-main">Ponderación del Algoritmo (Suma: {{ getTotalWeight() | number:'1.0-0' }}%)</h3>
            <button (click)="resetMetrics()" class="text-xs text-text-muted hover:text-text-main underline">Restablecer por defecto</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
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
                <th (click)="sortBy('rating')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center" title="Rating">
                  Rating {{ getSortIcon('rating') }}
                </th>
                <th (click)="sortBy('ticker')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors" title="Ticker">
                  Ticker {{ getSortIcon('ticker') }}
                </th>
                <th (click)="sortBy('superInvestorScore')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-center" title="Superinversor Score (0-100)">
                  Sinvestors {{ getSortIcon('superInvestorScore') }}
                </th>
                <th (click)="sortBy('price')" class="w-16 px-2 py-1.5 cursor-pointer hover:text-text-main transition-colors text-right" title="Precio">
                  Precio {{ getSortIcon('price') }}
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
                  <td class="px-2 py-1.5 text-center font-bold" [ngClass]="getRatingColor(stock.rating)">
                    {{ stock.rating | number:'1.0-1' }}
                  </td>
                  <td class="px-2 py-1.5 font-bold text-bullish truncate">{{ stock.ticker }}</td>
                  <td class="px-2 py-1.5 text-center text-text-main">
                    {{ stock.superInvestorScore || 0 }}
                  </td>
                  <td class="px-2 py-1.5 text-right">
                    {{ stock.stockData?.price != null ? (stock.stockData!.price | number:'1.2-2') : '-' }}
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
                    <td [attr.colspan]="15" class="px-4 py-3 bg-slate-900/40">
                      <div class="space-y-3">
                        <!-- 1. DATOS ADICIONALES (Tabla MarketBeat Scores & Ratios) -->
                        <div>
                          <div class="flex items-center justify-between mb-1.5 text-xs">
                            <span class="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                              Métricas Avanzadas de {{ stock.ticker }} (MarketBeat & Ratios)
                            </span>
                          </div>

                          <table class="w-full text-[10px]">
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

                        <!-- 2. GESTIÓN DE LISTAS Y FAVORITOS (DEBAJO DE LOS DATOS ADICIONALES) -->
                        <div class="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
                            <div class="flex flex-wrap items-center gap-2.5">
                              <span class="font-bold text-text-main text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 mr-1">
                                <span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                {{ stock.ticker }}
                              </span>

                              <!-- Botón Favorito (★) -->
                              <button (click)="toggleFavorite(stock.ticker); $event.stopPropagation()"
                                type="button"
                                class="h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all duration-200 border cursor-pointer select-none"
                                [ngClass]="isFavorite(stock.ticker)
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-sm shadow-amber-500/10'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-slate-500'"
                                [title]="isFavorite(stock.ticker) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'">
                                <span class="text-sm leading-none">{{ isFavorite(stock.ticker) ? '★' : '☆' }}</span>
                                <span>{{ isFavorite(stock.ticker) ? 'En Favoritos' : 'Añadir a Favoritos' }}</span>
                              </button>

                              <!-- Botón (+) Desplegar/Ocultar Menú de Listas -->
                              <button (click)="toggleListMenu(stock.ticker); $event.stopPropagation()"
                                type="button"
                                class="h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all duration-200 border cursor-pointer"
                                [ngClass]="openListMenuTicker === stock.ticker
                                  ? 'bg-primary/20 text-primary border-primary/50'
                                  : 'bg-slate-800 text-text-muted border-slate-700 hover:text-text-main hover:border-slate-500'">
                                <span class="text-emerald-400 text-sm leading-none font-bold">+</span>
                                <span>Gestionar en Listas</span>
                                <span class="text-[9px] ml-0.5">{{ openListMenuTicker === stock.ticker ? '▲' : '▼' }}</span>
                              </button>

                              <!-- Botón Rápido Nueva Lista -->
                              <button (click)="openQuickCreateList(stock.ticker); $event.stopPropagation()" 
                                type="button"
                                class="h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all duration-200 border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-800/40 text-slate-400 hover:text-emerald-400 cursor-pointer">
                                <span class="text-emerald-400 font-bold">+</span>
                                <span>Nueva Lista</span>
                              </button>
                            </div>

                            <!-- Chips de listas activas para este ticker -->
                            <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
                              <span class="text-slate-400 text-xs">Incluido en:</span>
                              @for (list of customLists; track list.id) {
                                @if (list.id !== 'all' && isStockInList(list.id, stock.ticker)) {
                                  <span class="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-medium flex items-center gap-1 shadow-sm">
                                    <span>{{ list.id === 'favs' ? '★' : '📁' }}</span>
                                    <span>{{ list.name }}</span>
                                  </span>
                                }
                              }
                            </div>
                          </div>

                          <!-- Panel de Listas Inline (Flujo natural del DOM: NUNCA se corta) -->
                          @if (openListMenuTicker === stock.ticker) {
                            <div (click)="$event.stopPropagation()"
                              class="p-3.5 bg-slate-900 border border-slate-700 rounded-xl shadow-xl space-y-2.5 animate-in fade-in">
                              <div class="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                                <span class="font-bold text-slate-300">
                                  Selecciona las listas a las que pertenece <span class="text-primary font-mono">{{ stock.ticker }}</span>:
                                </span>
                                <button (click)="closeListMenu($event)" class="text-slate-500 hover:text-slate-300 font-bold text-xs cursor-pointer">
                                  ✕ Cerrar
                                </button>
                              </div>

                              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
                                @for (list of customLists; track list.id) {
                                  @if (list.id !== 'all') {
                                    <button (click)="toggleStockInList(list.id, stock.ticker)"
                                      type="button"
                                      class="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer text-left"
                                      [ngClass]="isStockInList(list.id, stock.ticker)
                                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'">
                                      <span class="truncate flex items-center gap-1.5">
                                        <span>{{ list.id === 'favs' ? '★' : '📁' }}</span>
                                        <span class="truncate">{{ list.name }}</span>
                                      </span>
                                      <span class="font-mono font-bold text-xs shrink-0"
                                        [ngClass]="isStockInList(list.id, stock.ticker) ? 'text-emerald-400' : 'text-slate-500'">
                                        {{ isStockInList(list.id, stock.ticker) ? '✓' : '+' }}
                                      </span>
                                    </button>
                                  }
                                }
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal para Crear Nueva Lista -->
      @if (showCreateListModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" (click)="closeCreateListModal()">
          <div class="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 class="text-base font-bold text-text-main flex items-center gap-2">
                <span class="text-emerald-400 font-bold">+</span> Crear Nueva Lista
              </h3>
              <button (click)="closeCreateListModal()" class="text-slate-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Nombre de la lista</label>
                <input type="text" [(ngModel)]="newListName" placeholder="Ej. Big Tech, Dividendo Alto, Watchlist..."
                  class="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs md:text-sm text-text-main focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Tickers iniciales (opcional, separados por coma o espacio)</label>
                <input type="text" [(ngModel)]="newListTickers" placeholder="Ej. NVDA, MSFT, AMD..."
                  class="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs md:text-sm text-text-main focus:outline-none focus:border-primary font-mono uppercase" />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button (click)="closeCreateListModal()" class="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs md:text-sm transition-colors cursor-pointer">
                Cancelar
              </button>
              <button (click)="confirmCreateList()" [disabled]="!newListName.trim()"
                class="h-9 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs md:text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                Crear y Activar
              </button>
            </div>
          </div>
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
  private listsSub!: Subscription;
  expandedTickers = new Set<string>();

  metrics: MetricWeight[] = [];

  customLists: CustomList[] = [];
  selectedListId = 'mag10';

  openListMenuTicker: string | null = null;
  showCreateListModal = false;
  newListName = '';
  newListTickers = '';

  constructor(
    private carteraService: CarteraService,
    private listsService: ListsService
  ) {
    this.resetMetrics();
  }

  ngOnInit(): void {
    this.customLists = this.listsService.getLists();
    this.listsSub = this.listsService.lists$.subscribe(lists => {
      this.customLists = lists;
      this.recalculateRatings();
    });
    this.streamData();
  }

  ngOnDestroy(): void {
    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
    if (this.listsSub) {
      this.listsSub.unsubscribe();
    }
  }

  resetMetrics() {
    this.metrics = [
      { id: 'peg', name: 'P/E Growth (PEG)', weight: 30, locked: true },
      { id: 'val', name: 'Valoración y Ganancias (MB)', weight: 18, locked: true },
      { id: 'upside', name: 'Potencial Upside', weight: 17, locked: true },
      { id: 'analystRatio', name: 'Consenso de Compra/Venta', weight: 15, locked: true },
      { id: 'ana', name: 'Opinión de Analistas (MB)', weight: 10, locked: true },
      { id: 'forwardPE', name: 'Forward P/E', weight: 5, locked: true },
      { id: 'mbRating', name: 'MarketBeat Rating (0-4)', weight: 5, locked: true },
      { id: 'superInvestor', name: 'Superinversores Dataroma', weight: 0, locked: true },
      { id: 'trailingPE', name: 'Trailing P/E', weight: 0, locked: true },
      { id: 'netMargins', name: 'Margen Neto', weight: 0, locked: true },
      { id: 'debtToEquity', name: 'Debt-to-Equity Ratio', weight: 0, locked: true },
      { id: 'dividendYield', name: 'Dividend Yield', weight: 0, locked: true },
      { id: 'priceToCashFlow', name: 'Price / Cash Flow', weight: 0, locked: true },
      { id: 'marketCap', name: 'Market Cap', weight: 0, locked: true },
      { id: 'ic', name: 'Interés Corto (MB)', weight: 0, locked: true },
      { id: 'div', name: 'Rendimiento por Dividendo (MB)', weight: 0, locked: true },
      { id: 'news', name: 'Sentimiento en Noticias (MB)', weight: 0, locked: true },
      { id: 'ins', name: 'Transacciones Insider (MB)', weight: 0, locked: true }
    ];
    this.recalculateRatings();
  }

  onListChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedListId = target.value;
    this.recalculateRatings();
  }

  toggleFavorite(ticker: string): void {
    this.listsService.toggleFavorite(ticker);
  }

  isFavorite(ticker: string): boolean {
    return this.listsService.isFavorite(ticker);
  }

  toggleListMenu(ticker: string): void {
    this.openListMenuTicker = this.openListMenuTicker === ticker ? null : ticker;
  }

  closeListMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openListMenuTicker = null;
  }

  isStockInList(listId: string, ticker: string): boolean {
    return this.listsService.isStockInList(listId, ticker);
  }

  toggleStockInList(listId: string, ticker: string): void {
    this.listsService.toggleStockInList(listId, ticker);
  }

  openCreateListModal(): void {
    this.newListName = '';
    this.newListTickers = '';
    this.showCreateListModal = true;
    this.openListMenuTicker = null;
  }

  openQuickCreateList(initialTicker: string): void {
    this.newListName = '';
    this.newListTickers = initialTicker;
    this.showCreateListModal = true;
    this.openListMenuTicker = null;
  }

  closeCreateListModal(): void {
    this.showCreateListModal = false;
    this.newListName = '';
    this.newListTickers = '';
  }

  confirmCreateList(): void {
    const trimmed = this.newListName.trim();
    if (!trimmed) return;
    const tickers = this.newListTickers
      .split(/[\s,]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    const created = this.listsService.createList(trimmed, tickers);
    this.selectedListId = created.id;
    this.closeCreateListModal();
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
    
    let filteredStocks = this.tempStocks;
    if (this.selectedListId !== 'all') {
      const list = this.customLists.find(l => l.id === this.selectedListId);
      if (list) {
        filteredStocks = this.tempStocks.filter(s => list.tickers.includes(s.ticker));
      } else {
        filteredStocks = [];
      }
    }
    
    this.recommendedStocks = [...filteredStocks];
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

  getRatingColor(score: number | undefined): string {
    if (score == null) return 'text-text-muted';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
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
