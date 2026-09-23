// search.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlphaVantageService } from '../../services/api.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full max-w-2xl mx-auto mb-2">
      <div class="flex items-center gap-3">
        <div class="relative flex-1">
          <input 
            type="text" 
            [(ngModel)]="symbol" 
            placeholder="Buscar ticker: AAPL, MSFT, TSLA, NVDA..."
            (input)="onInputChange()"
            (keyup.enter)="handleSearch()"
            class="w-full px-4 py-3 bg-card border border-slate-700 rounded-xl text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner font-sans text-base"
          >
          @if (symbol) {
            <button 
              (click)="symbol = ''; suggestions = []" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-1"
              title="Limpiar"
            >
              ✕
            </button>
          }
        </div>
        <button 
          (click)="handleSearch()" 
          class="px-6 py-3 bg-primary hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          Buscar
        </button>
      </div>

      <!-- Autocomplete Dropdown -->
      @if (suggestions.length) {
        <ul class="absolute z-50 left-0 right-0 mt-2 bg-dropdown border border-slate-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
          @for (suggestion of suggestions; track suggestion.symbol) {
            <li 
              (click)="selectSymbol(suggestion)"
              class="px-4 py-3 flex items-center justify-between hover:bg-slate-700/60 cursor-pointer transition-colors group"
            >
              <span class="font-mono font-bold text-bullish group-hover:text-emerald-400">
                {{ suggestion.symbol }}
              </span>
              <span class="text-sm text-text-muted group-hover:text-text-main text-right truncate max-w-md ml-4">
                {{ suggestion.name }}
              </span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: []
})
export class SearchComponent {
  @Output() search = new EventEmitter<{ symbol: string; name: string }>();
  symbol = '';
  suggestions: { symbol: string; name: string }[] = [];

  constructor(private stockService: AlphaVantageService) {}

  onInputChange() {
    if (this.symbol.length > 0) {
      this.stockService.searchSymbols(this.symbol).subscribe(response => {
        this.suggestions = response.result?.map((match: any) => ({
          symbol: match.symbol,
          name: match.description
        })) || [];              
      });
    } else {
      this.suggestions = [];
    }
  }

  selectSymbol(suggestion: { symbol: string; name: string }) {
    this.search.emit({
      symbol: suggestion.symbol.toUpperCase(),
      name: suggestion.name
    });
    this.suggestions = [];
    this.symbol = '';
  }

  handleSearch() {
    if (this.symbol.trim()) {
      this.search.emit({
        symbol: this.symbol.trim().toUpperCase(),
        name: ''
      });
      this.suggestions = [];
      this.symbol = '';
    }
  }
}
