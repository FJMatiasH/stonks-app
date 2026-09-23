// fundamentals.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompactNumberPipe } from '../../../pipes/compact-number.pipe';

@Component({
  selector: 'app-fundamentals',
  standalone: true,
  imports: [CommonModule, CompactNumberPipe],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-xl p-4 shadow-lg flex flex-col justify-between min-w-0 flex-1 basis-56" *ngIf="incomeStatementData">
      <h2 class="text-xs font-bold font-mono tracking-wider text-text-muted uppercase text-center mb-3">
        Fundamentales
      </h2>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <!-- Trimestral -->
        <div class="bg-slate-900/80 border border-slate-700/60 rounded-lg p-2.5 flex flex-col gap-1.5 min-w-0">
          <h3 class="text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-slate-800/80 py-0.5 px-1.5 rounded text-center">
            Trim.
          </h3>
          <div class="space-y-1 text-[11px] font-mono min-w-0">
            <div class="flex justify-between items-center gap-1 min-w-0">
              <span class="text-text-muted font-sans shrink-0">EPS</span>
              <span class="text-text-main font-semibold truncate">{{ computedEPS | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-center gap-1 min-w-0">
              <span class="text-text-muted font-sans shrink-0">Ing.</span>
              <span 
                class="text-text-main font-semibold truncate cursor-help"
                [title]="getFullFormat(lastQuarterRevenue, getCurrencySymbol(incomeStatementData.currency))"
              >
                {{ lastQuarterRevenue | compactNumber:getCurrencySymbol(incomeStatementData.currency) }}
              </span>
            </div>
            <div class="flex justify-between items-center gap-1 min-w-0">
              <span class="text-text-muted font-sans shrink-0">B.N.</span>
              <span 
                class="text-text-main font-semibold truncate cursor-help"
                [title]="getFullFormat(lastQuarterNetIncome, getCurrencySymbol(incomeStatementData.currency))"
              >
                {{ lastQuarterNetIncome | compactNumber:getCurrencySymbol(incomeStatementData.currency) }}
              </span>
            </div>
            @if (profitMargin) {
              <div class="flex justify-between items-center gap-1 min-w-0">
                <span class="text-text-muted font-sans shrink-0">Mg.</span>
                <span class="text-bullish font-semibold">{{ profitMargin | percent:'1.1-1' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Anual -->
        <div class="bg-slate-900/80 border border-slate-700/60 rounded-lg p-2.5 flex flex-col gap-1.5 min-w-0">
          <h3 class="text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-slate-800/80 py-0.5 px-1.5 rounded text-center">
            Anual
          </h3>
          <div class="space-y-1 text-[11px] font-mono min-w-0">
            <div class="flex justify-between items-center gap-1 min-w-0">
              <span class="text-text-muted font-sans shrink-0">EPS</span>
              <span class="text-text-main font-semibold truncate">{{ computedYearEPS | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-center gap-1 min-w-0">
              <span class="text-text-muted font-sans shrink-0">Ing.</span>
              <span 
                class="text-text-main font-semibold truncate cursor-help"
                [title]="getFullFormat(lastYearRevenue, getCurrencySymbol(incomeStatementData.currency))"
              >
                {{ lastYearRevenue | compactNumber:getCurrencySymbol(incomeStatementData.currency) }}
              </span>
            </div>
            <div class="flex justify-between items-center gap-1 min-w-0">
              <span class="text-text-muted font-sans shrink-0">B.N.</span>
              <span 
                class="text-text-main font-semibold truncate cursor-help"
                [title]="getFullFormat(lastYearNetIncome, getCurrencySymbol(incomeStatementData.currency))"
              >
                {{ lastYearNetIncome | compactNumber:getCurrencySymbol(incomeStatementData.currency) }}
              </span>
            </div>
            @if (yearProfitMargin) {
              <div class="flex justify-between items-center gap-1 min-w-0">
                <span class="text-text-muted font-sans shrink-0">Mg.</span>
                <span class="text-bullish font-semibold">{{ yearProfitMargin | percent:'1.1-1' }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- PER y Forward PER -->
      <div class="bg-slate-900/90 border border-slate-700/60 rounded-lg py-2 px-3 font-mono text-[11px] flex justify-around items-center gap-2 min-w-0">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-text-muted font-sans text-[10px] shrink-0">PER</span>
          <span [style.color]="getRatioColor(perRatio)" class="font-bold truncate">{{ perRatio | number:'1.1-1' }}</span>
        </div>
        <span class="text-slate-700 shrink-0">|</span>
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-text-muted font-sans text-[10px] shrink-0">Fwd</span>
          <span [style.color]="getRatioColor(forwardPerRatio)" class="font-bold truncate">{{ forwardPerRatio | number:'1.1-1' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FundamentalsComponent {
  @Input() incomeStatementData: any;
  @Input() computedEPS: number = 0;
  @Input() computedYearEPS: number = 0;
  @Input() perRatio: number = 0;
  @Input() forwardPerRatio: number = 0;
  @Input() profitMargin: number = 0;
  @Input() yearProfitMargin: number = 0;
  @Input() lastQuarterRevenue: number = 0;
  @Input() lastQuarterNetIncome: number = 0;
  @Input() lastYearRevenue: number = 0;
  @Input() lastYearNetIncome: number = 0;

  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency ?? '';
    }
  }

  getFullFormat(value: number, symbol: string): string {
    return CompactNumberPipe.fullFormat(value, symbol);
  }

  getRatioColor(value: number): string {
    let hue: number;
    if (value <= 20) {
      const t = value / 20;
      hue = 120 - t * 60;
    } else if (value <= 50) {
      const t = (value - 20) / 30;
      hue = 60 - t * 60;
    } else {
      hue = 0;
    }
    return `hsl(${hue}, 100%, 45%)`;
  }
}
