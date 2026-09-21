import { Component, OnInit } from '@angular/core';
import { AlphaVantageService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto my-8">
      <h2 class="text-xl md:text-2xl font-bold font-mono tracking-tight text-text-main text-center mb-6">
        ESTADO GLOBAL DE LOS MERCADOS
      </h2>

      @if (marketStatus?.markets) {
        <div class="overflow-x-auto rounded-xl border border-slate-700/80 shadow-lg">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-900/90 text-text-muted text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th class="px-6 py-3.5">Región</th>
                <th class="px-6 py-3.5">Bolsa Principal</th>
                <th class="px-6 py-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-sm">
              @for (market of marketStatus.markets; track market.region + market.primary_exchanges) {
                <tr class="hover:bg-slate-700/40 transition-colors">
                  <td class="px-6 py-4 font-semibold text-text-main">{{ market.region }}</td>
                  <td class="px-6 py-4 font-mono text-text-muted">{{ market.primary_exchanges }}</td>
                  <td class="px-6 py-4 text-center">
                    @if (market.current_status === 'open') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Abierto
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                        Cerrado
                      </span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (marketStatus?.error) {
        <div class="text-center py-8 text-bearish font-medium">
          {{ marketStatus.error }}
        </div>
      } @else {
        <div class="text-center py-8 text-text-muted font-medium">
          Consultando estado de los mercados...
        </div>
      }
    </div>
  `,
  styles: []
})
export class MarketStatusComponent implements OnInit {
  marketStatus: any;

  constructor(private stockService: AlphaVantageService) {}

  ngOnInit() {
    this.stockService.getMarketStatus().subscribe({
      next: (response) => {
        this.marketStatus = response;
      },
      error: () => {
        this.marketStatus = { error: 'No se pudo obtener el estado del mercado' };
      }
    });
  }
}
