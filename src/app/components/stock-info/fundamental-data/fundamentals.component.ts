// fundamentals.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fundamentals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl w-full max-w-md flex flex-col justify-between" *ngIf="incomeStatementData">
      <h2 class="text-lg font-bold font-mono tracking-tight text-text-main text-center mb-4">
        Datos Fundamentales
      </h2>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- Trimestral -->
        <div class="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted bg-slate-800/80 py-1 px-2 rounded-md text-center">
            Trimestral
          </h3>
          <div class="space-y-1.5 text-xs font-mono">
            <div class="flex justify-between">
              <span class="text-text-muted font-sans">EPS:</span>
              <span class="text-text-main font-semibold">{{ computedEPS | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted font-sans">Ingresos:</span>
              <span class="text-text-main font-semibold">{{ getCurrencySymbol(incomeStatementData.currency) }}{{ lastQuarterRevenue | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted font-sans">B. Neto:</span>
              <span class="text-text-main font-semibold">{{ getCurrencySymbol(incomeStatementData.currency) }}{{ lastQuarterNetIncome | number:'1.2-2' }}</span>
            </div>
            @if (profitMargin) {
              <div class="flex justify-between">
                <span class="text-text-muted font-sans">Margen:</span>
                <span class="text-bullish font-semibold">{{ profitMargin | percent:'1.2-2' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Anual -->
        <div class="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted bg-slate-800/80 py-1 px-2 rounded-md text-center">
            Anual
          </h3>
          <div class="space-y-1.5 text-xs font-mono">
            <div class="flex justify-between">
              <span class="text-text-muted font-sans">EPS:</span>
              <span class="text-text-main font-semibold">{{ computedYearEPS | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted font-sans">Ingresos:</span>
              <span class="text-text-main font-semibold">{{ getCurrencySymbol(incomeStatementData.currency) }}{{ lastYearRevenue | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted font-sans">B. Neto:</span>
              <span class="text-text-main font-semibold">{{ getCurrencySymbol(incomeStatementData.currency) }}{{ lastYearNetIncome | number:'1.2-2' }}</span>
            </div>
            @if (yearProfitMargin) {
              <div class="flex justify-between">
                <span class="text-text-muted font-sans">Margen:</span>
                <span class="text-bullish font-semibold">{{ yearProfitMargin | percent:'1.2-2' }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Métricas PER -->
      <div class="bg-slate-900/90 border border-slate-700/60 rounded-xl py-2.5 px-4 text-center font-mono text-xs flex justify-around items-center">
        <div>
          <span class="text-text-muted font-sans mr-1.5">PER:</span>
          <span [style.color]="getRatioColor(perRatio)" class="font-bold">{{ perRatio | number:'1.2-2' }}</span>
        </div>
        <span class="text-slate-700">|</span>
        <div>
          <span class="text-text-muted font-sans mr-1.5">Forward PER:</span>
          <span [style.color]="getRatioColor(forwardPerRatio)" class="font-bold">{{ forwardPerRatio | number:'1.2-2' }}</span>
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
      default: return currency;
    }
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
