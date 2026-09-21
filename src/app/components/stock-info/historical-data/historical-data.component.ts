// historical-data.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricalData } from '../stock-chart/stock-chart.component';

@Component({
  selector: 'app-historical-data',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl w-full max-w-xs flex flex-col justify-between" *ngIf="recentData.length">
      <h2 class="text-lg font-bold font-mono tracking-tight text-text-main text-center mb-4">
        Últimos Cierres
      </h2>
      <div class="divide-y divide-slate-800/80">
        @for (data of recentData; track data.date) {
          <div class="flex justify-between items-center py-2.5 font-mono text-xs">
            <span class="text-text-muted">{{ data.date }}</span>
            <span class="text-text-main font-bold">{{ data.close | number:'1.2-2' }}</span>
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
