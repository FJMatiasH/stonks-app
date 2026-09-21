import { Routes } from '@angular/router';
import { StocksViewComponent } from './components/stocks-view/stocks-view.component';
import { RecommendedStocksComponent } from './components/recommended/recommended.component';
import { PortfoliosComponent } from './components/portfolios/portfolios.component';
import { MarketStatusComponent } from './components/market-status/market-status.component';
import { AboutMeComponent } from './components/about-me/about-me.component';

export const routes: Routes = [
  { path: '', redirectTo: 'stocks', pathMatch: 'full' },
  { path: 'stocks', component: StocksViewComponent },
  { path: 'recommended', component: RecommendedStocksComponent },
  { path: 'portfolios', component: PortfoliosComponent },
  { path: 'markets', component: MarketStatusComponent },
  { path: 'about', component: AboutMeComponent },
  { path: '**', redirectTo: 'stocks' }
];
