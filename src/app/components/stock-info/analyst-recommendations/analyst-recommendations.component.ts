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
    <div class="bg-card border border-slate-700/60 rounded-2xl p-6 shadow-xl w-full max-w-sm flex flex-col justify-between" *ngIf="recommendation">
      <h2 class="text-lg font-bold font-mono tracking-tight text-text-main text-center mb-4">
        Opinión de Analistas
      </h2>

      <div class="flex items-center justify-around gap-4" *ngIf="recommendation; else noRecTpl">
        <!-- Donut Chart -->
        <div class="relative w-36 h-36 flex-shrink-0">
          <svg width="144" height="144" viewBox="0 0 42 42" class="transform -rotate-90">
            <circle cx="21" cy="21" r="16" fill="#0f172a"></circle>
            <circle cx="21" cy="21" r="16" fill="transparent" stroke="#334155" stroke-width="3"></circle>
            @for (segment of donutData; track segment.label; let i = $index) {
              <circle cx="21" cy="21" r="16"
                [attr.stroke]="segment.color" stroke-width="3" fill="transparent"
                [attr.stroke-dasharray]="(segment.percent * 100) + ' ' + (100 - segment.percent * 100)"
                [attr.stroke-dashoffset]="calculateDonutOffset(i)">
              </circle>
            }
            <text x="50%" y="42%" text-anchor="middle" dy=".3em" class="fill-slate-400 text-[0.35rem] font-bold uppercase tracking-widest" transform="rotate(90 21 21)">
              SRI
            </text>
            <text x="50%" y="62%" text-anchor="middle" dy=".3em" class="fill-white text-[0.45rem] font-bold font-mono" transform="rotate(90 21 21)">
              {{ recommendation.sri | number:'1.2-2' }}
            </text>
          </svg>
        </div>

        <!-- Breakdown de opiniones -->
        <div class="flex flex-col gap-1.5 flex-1 font-mono text-xs">
          <div class="flex justify-between items-center">
            <span class="text-emerald-400 font-medium">Strong Buy</span>
            <span class="text-text-main font-bold">{{ recommendation.strong_buy }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-emerald-300 font-medium">Buy</span>
            <span class="text-text-main font-bold">{{ recommendation.buy }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-amber-400 font-medium">Hold</span>
            <span class="text-text-main font-bold">{{ recommendation.hold }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-rose-400 font-medium">Sell</span>
            <span class="text-text-main font-bold">{{ recommendation.sell }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-rose-600 font-medium">Strong Sell</span>
            <span class="text-text-main font-bold">{{ recommendation.strong_sell }}</span>
          </div>
          <div class="text-[0.7rem] text-text-muted mt-2 font-sans text-right">
            Periodo: {{ recommendation.period * 1000 | date:'dd/MM/yyyy' }}
          </div>
        </div>
      </div>

      <ng-template #noRecTpl>
        <p class="text-center py-6 text-text-muted text-sm font-medium">No hay recomendaciones disponibles.</p>
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
