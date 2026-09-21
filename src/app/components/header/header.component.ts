import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-card/80 border-b border-slate-700/50 shadow-sm transition-all">
      <div class="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-bullish to-primary cursor-pointer" routerLink="/stocks">
          LOS STONKS
        </h1>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex gap-2 items-center">
          <a routerLink="/stocks" routerLinkActive="bg-slate-700 text-white" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">BUSCADOR</a>
          <a routerLink="/recommended" routerLinkActive="bg-slate-700 text-white" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">TOP S&P500</a>
          <a routerLink="/portfolios" routerLinkActive="bg-slate-700 text-white" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">CARTERAS</a>
          <a routerLink="/markets" routerLinkActive="bg-slate-700 text-white" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">MERCADOS</a>
          <a routerLink="/about" routerLinkActive="bg-slate-700 text-white" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">SOBRE MÍ</a>
        </nav>

        <!-- Mobile Menu Button -->
        <button class="md:hidden text-slate-300 hover:text-white focus:outline-none" (click)="toggleMenu()">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Nav -->
      @if (isMenuOpen) {
        <nav class="md:hidden flex flex-col gap-2 px-6 py-4 bg-card/95 border-b border-slate-700/50 backdrop-blur-lg">
          <a routerLink="/stocks" routerLinkActive="bg-slate-700 text-white" (click)="closeMenu()" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">BUSCADOR</a>
          <a routerLink="/recommended" routerLinkActive="bg-slate-700 text-white" (click)="closeMenu()" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">TOP S&P500</a>
          <a routerLink="/portfolios" routerLinkActive="bg-slate-700 text-white" (click)="closeMenu()" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">CARTERAS</a>
          <a routerLink="/markets" routerLinkActive="bg-slate-700 text-white" (click)="closeMenu()" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">MERCADOS</a>
          <a routerLink="/about" routerLinkActive="bg-slate-700 text-white" (click)="closeMenu()" class="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all duration-300">SOBRE MÍ</a>
        </nav>
      }
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
