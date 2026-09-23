// historical-data.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricalData } from '../stock-chart/stock-chart.component';

@Component({
  selector: 'app-historical-data',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-xl p-4 shadow-lg flex flex-col min-w-0 flex-1 basis-44" *ngIf="recentData.length">
      <h2 class="text-xs font-bold font-mono tracking-wider text-text-muted uppercase text-center mb-3">
        Últimos Cierres
      </h2>
      <div class="divide-y divide-slate-800/80 flex-1">
        @for (data of recentData; track data.date) {
          <div class="flex justify-between items-center py-1.5 font-mono text-[11px] min-w-0">
            <span class="text-text-muted truncate mr-2">{{ data.date }}</span>
            <span class="text-text-main font-bold shrink-0">{{ data.close | number:'1.2-2' }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class HistoricalDataComponent {
  @Input() historicalData: HistoricalData[] = [];

  get recentData(): HistoricalData[] {
    return this.historicalData.length < 5
      ? [...this.historicalData].reverse()
      : this.historicalData.slice(-5).reverse();
  }
}
