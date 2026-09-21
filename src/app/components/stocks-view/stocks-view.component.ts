import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { StockInfoMixComponent } from '../stock-info/stock-info-mix/stock-info-mix.component';
import { AlphaVantageService } from '../../services/api.service';

@Component({
  selector: 'app-stocks-view',
  standalone: true,
  imports: [CommonModule, SearchComponent, StockInfoMixComponent],
  template: `
    <div class="flex flex-col gap-6">
      <app-search (search)="onSearch($event)"></app-search>
      <app-stock-info-mix 
        [ticker]="selectedSymbol" 
        [stockName]="selectedStockName">
      </app-stock-info-mix>
    </div>
  `
})
export class StocksViewComponent {
  selectedSymbol: string = 'AAPL';
  selectedStockName: string = 'Apple Inc.';

  constructor(private stockService: AlphaVantageService) {}

  onSearch(data: { symbol: string; name: string }): void {
    this.selectedSymbol = data.symbol;
    if (data.name.trim() === '') {
      this.stockService.searchSymbols(data.symbol).subscribe(response => {
        const bestMatch = response.result && response.result[0];
        this.selectedStockName = bestMatch && bestMatch.description ? bestMatch.description : data.symbol;
      }, err => {
        console.error('Error al buscar el nombre de la acción', err);
        this.selectedStockName = data.symbol;
      });
    } else {
      this.selectedStockName = data.name;
    }
  }
}
