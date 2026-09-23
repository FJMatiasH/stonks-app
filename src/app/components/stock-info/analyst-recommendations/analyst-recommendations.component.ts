// analyst-recommendations.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percent?: any;
}

@Component({
  selector: 'app-analyst-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-slate-700/60 rounded-xl p-4 shadow-lg flex flex-col min-w-0 flex-1 basis-52" *ngIf="recommendation">
      <h2 class="text-xs font-bold font-mono tracking-wider text-text-muted uppercase text-center mb-3">
        Analistas
      </h2>

      <div class="flex items-center justify-around gap-3 flex-1" *ngIf="recommendation; else noRecTpl">
        <!-- Donut Chart (compacto) -->
        <div class="relative flex-shrink-0">
          <svg width="90" height="90" viewBox="0 0 42 42" class="transform -rotate-90">
            <circle cx="21" cy="21" r="16" fill="#0f172a"></circle>
            <circle cx="21" cy="21" r="16" fill="transparent" stroke="#334155" stroke-width="3"></circle>
            @for (segment of donutData; track segment.label; let i = $index) {
              <circle cx="21" cy="21" r="16"
                [attr.stroke]="segment.color" stroke-width="3" fill="transparent"
                [attr.stroke-dasharray]="(segment.percent * 100) + ' ' + (100 - segment.percent * 100)"
                [attr.stroke-dashoffset]="calculateDonutOffset(i)">
              </circle>
            }
            <text x="50%" y="42%" text-anchor="middle" class="fill-slate-500" style="font-size:0.3rem;letter-spacing:0.05em" transform="rotate(90 21 21)">
              SRI
            </text>
            <text x="50%" y="62%" text-anchor="middle" class="fill-white" style="font-size:0.4rem;font-weight:bold" transform="rotate(90 21 21)">
              {{ recommendation.sri | number:'1.2-2' }}
            </text>
          </svg>
        </div>

        <!-- Stats compactas -->
        <div class="flex flex-col gap-1 flex-1 font-mono text-[11px] min-w-0">
          <div class="flex justify-between items-center min-w-0 gap-1">
            <span class="text-emerald-400 truncate">Str. Buy</span>
            <span class="text-text-main font-bold shrink-0">{{ recommendation.strong_buy }}</span>
          </div>
          <div class="flex justify-between items-center min-w-0 gap-1">
            <span class="text-emerald-300 truncate">Buy</span>
            <span class="text-text-main font-bold shrink-0">{{ recommendation.buy }}</span>
          </div>
          <div class="flex justify-between items-center min-w-0 gap-1">
            <span class="text-amber-400 truncate">Hold</span>
            <span class="text-text-main font-bold shrink-0">{{ recommendation.hold }}</span>
          </div>
          <div class="flex justify-between items-center min-w-0 gap-1">
            <span class="text-rose-400 truncate">Sell</span>
            <span class="text-text-main font-bold shrink-0">{{ recommendation.sell }}</span>
          </div>
          <div class="flex justify-between items-center min-w-0 gap-1">
            <span class="text-rose-600 truncate">Str. Sell</span>
            <span class="text-text-main font-bold shrink-0">{{ recommendation.strong_sell }}</span>
          </div>
          <div class="text-[9px] text-text-muted mt-1 font-sans text-right truncate">
            {{ recommendation.period * 1000 | date:'MM/yyyy' }}
          </div>
        </div>
      </div>

      <ng-template #noRecTpl>
        <p class="text-center py-4 text-text-muted text-xs font-medium">Sin datos</p>
      </ng-template>
    </div>
  `,
  styles: []
})
export class AnalystRecommendationsComponent {
  @Input() recommendation: any;

  get donutData(): DonutSegment[] {
    if (!this.recommendation) return [];
    const data: DonutSegment[] = [
      { label: 'strong_buy', value: this.recommendation.strong_buy, color: '#10B981' },
      { label: 'buy', value: this.recommendation.buy, color: '#34D399' },
      { label: 'hold', value: this.recommendation.hold, color: '#FBBF24' },
      { label: 'sell', value: this.recommendation.sell, color: '#F87171' },
      { label: 'strong_sell', value: this.recommendation.strong_sell, color: '#EF4444' },
    ];
    const total = data.reduce((sum, d) => sum + d.value, 0);
    data.forEach(d => d.percent = total ? (d.value / total) : 0);
    return data;
  }

  calculateDonutOffset(index: number): number {
    const segments = this.donutData;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (segments[i]?.percent || 0) * 100;
    }
    return 25 - offset;
  }
}
