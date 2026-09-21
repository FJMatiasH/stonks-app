import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteraService, Holding, Manager } from '../../services/server.service';

@Component({
  selector: 'app-portfolios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl max-w-6xl mx-auto my-8">
      <h2 class="text-xl md:text-2xl font-bold font-mono tracking-tight text-text-main text-center mb-6">
        CARTERAS DE SUPERINVERSORES <span class="text-xs text-text-muted font-sans font-normal block mt-1">Datos extraídos de Dataroma.com</span>
      </h2>

      <!-- Controles / Desplegables con alto contraste -->
      <div class="flex flex-wrap items-center justify-center gap-4 mb-8">
        <!-- Select Inversionistas -->
        <div class="w-full sm:w-auto">
          <label for="tickerSelect" class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Inversionista Individual
          </label>
          <select 
            id="tickerSelect" 
            (change)="onSelectTicker($event)" 
            [value]="selectedTicker"
            class="w-full sm:w-80 px-4 py-2.5 bg-slate-900 text-text-main border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm shadow-md cursor-pointer"
          >
            <option value="" class="bg-slate-900 text-slate-400">-- Seleccione un inversor --</option>
            @for (manager of managers; track manager.ticker) {
              <option [value]="manager.ticker" class="bg-slate-900 text-text-main py-1.5">
                {{ manager.name }}
              </option>
            }
          </select>
        </div>

        <!-- Select Listas Home -->
        <div class="w-full sm:w-auto">
          <label for="homeListSelect" class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Conjuntos de Mercado
          </label>
          <select 
            id="homeListSelect" 
            (change)="onSelectHomeList($event)" 
            [value]="selectedHomeList"
            class="w-full sm:w-80 px-4 py-2.5 bg-slate-900 text-text-main border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm shadow-md cursor-pointer"
          >
            <option value="" class="bg-slate-900 text-slate-400">-- Conjunto de inversores --</option>
            @for (list of homeListKeys; track list.key) {
              <option [value]="list.key" class="bg-slate-900 text-text-main py-1.5">
                {{ list.label }}
              </option>
            }
          </select>
        </div>
      </div>

      <!-- Tabla de Datos Financieros -->
      @if ((selectedHomeList && homeLists[selectedHomeList]?.length) || (!selectedHomeList && holdings?.length)) {
        <div class="overflow-x-auto rounded-xl border border-slate-700/80 shadow-lg">
          <table class="w-full text-left border-collapse">
            @if (!selectedHomeList && holdings?.length) {
              <thead class="bg-slate-900/90 text-text-muted text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th class="px-5 py-3.5">Stock</th>            
                  <th class="px-5 py-3.5">Actividad Reciente</th>
                  <th class="px-5 py-3.5">% Cartera</th>
                  <th class="px-5 py-3.5">Pvp Acción ($)</th>
                  <th class="px-5 py-3.5">Nº de Acciones</th>
                </tr>
              </thead>
            }
            <tbody class="divide-y divide-slate-800 text-sm">
              @if (selectedHomeList) {
                @for (row of homeLists[selectedHomeList]; track $index) {
                  <tr class="hover:bg-slate-700/40 transition-colors">
                    @for (cell of row; track $index) {
                      <td class="px-5 py-3.5 text-text-main font-mono">{{ cell }}</td>
                    }
                  </tr>
                }
              } @else {
                @for (holding of holdings; track holding.stock) {
                  <tr class="hover:bg-slate-700/40 transition-colors">
                    <td class="px-5 py-3.5 font-bold font-mono text-bullish">{{ holding.stock }}</td>
                    <td class="px-5 py-3.5 text-text-muted">{{ holding.recentActivity }}</td>
                    <td class="px-5 py-3.5 font-mono text-text-main">{{ holding.percentage }}</td>
                    <td class="px-5 py-3.5 font-mono text-text-main">{{ holding.currentPrice }}</td>
                    <td class="px-5 py-3.5 font-mono text-text-muted">{{ holding.value }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Mensajes de Estado Vacío -->
      @if (!selectedHomeList && (!holdings || holdings.length === 0)) {
        <div class="text-center py-12 text-text-muted font-medium">
          Selecciona un inversionista del desplegable para inspeccionar su cartera.
        </div>
      }
      @if (selectedHomeList && (!homeLists[selectedHomeList] || homeLists[selectedHomeList].length === 0)) {
        <div class="text-center py-12 text-text-muted font-medium">
          Cargando o no hay datos disponibles para esta lista.
        </div>
      }
    </div>
  `,
  styles: []
})
export class PortfoliosComponent implements OnInit {
  holdings: Holding[] = [];
  managers: Manager[] = [];
  selectedTicker: string = '';

  homeLists: any = {};
  selectedHomeList: string = '';
  homeListKeys = [
    { key: 'topMostOwned', label: 'Top 10 most owned stocks' },
    { key: 'topStocksByPercentage', label: 'Top 10 stocks by %' },
    { key: 'topBigBets', label: 'Top "big bets"' },
    { key: 'topBuysLastQtr', label: 'Top 10 buys last qtr (Q4 2024)' },
    { key: 'topBuysLastQtrByPercentage', label: 'Top 10 buys last qtr by % (Q4 2024)' },
    { key: 'holdingsNear52Low', label: '5% or greater holdings near 52 week low' },
    { key: 'insiderBuys', label: 'Superinvestor stocks with most insider buys in the last 3 months' }
  ];

  constructor(private carteraService: CarteraService) {}

  ngOnInit(): void {
    this.loadManagers();
    this.loadHomeLists();
  }

  loadManagers(): void {
    this.carteraService.getManagers().subscribe(
      data => {
        this.managers = data;
        console.log('Managers:', this.managers);
      },
      error => console.error('Error al obtener los managers', error)
    );
  }

  loadCartera(ticker: string): void {
    this.carteraService.getCartera(ticker).subscribe(
      data => {
        this.holdings = data;
        this.selectedHomeList = '';
        console.log('Cartera cargada:', this.holdings);
      },
      error => console.error('Error al obtener la cartera', error)
    );
  }

  onSelectTicker(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const ticker = selectElement.value;
    this.selectedTicker = ticker;
    this.selectedHomeList = '';
    if (ticker) {
      this.loadCartera(ticker);
    } else {
      this.holdings = [];
    }
  }

  onSelectHomeList(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const key = selectElement.value;
    this.selectHomeList(key);
  }

  loadHomeLists(): void {
    this.carteraService.getHomeLists().subscribe(
      data => {
        this.homeLists = data;
        console.log('Listas de Home cargadas:', this.homeLists);
      },
      error => console.error('Error al obtener las listas de home', error)
    );
  }

  selectHomeList(key: string): void {
    this.selectedHomeList = key;
    this.holdings = [];
    this.selectedTicker = '';
  }
}
