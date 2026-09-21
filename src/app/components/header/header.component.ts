import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 shadow-md transition-all">
      <div class="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <h1 
          class="text-2xl font-bold font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-bullish to-primary cursor-pointer hover:opacity-95 transition-opacity" 
          routerLink="/stocks"
        >
          LOS STONKS
        </h1>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex gap-1.5 items-center">
          <a routerLink="/stocks" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800/60 px-4 py-2 rounded-xl transition-all duration-200">BUSCADOR</a>
          <a routerLink="/recommended" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800/60 px-4 py-2 rounded-xl transition-all duration-200">TOP S&P500</a>
          <a routerLink="/portfolios" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800/60 px-4 py-2 rounded-xl transition-all duration-200">CARTERAS</a>
          <a routerLink="/markets" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800/60 px-4 py-2 rounded-xl transition-all duration-200">MERCADOS</a>
          <a routerLink="/about" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800/60 px-4 py-2 rounded-xl transition-all duration-200">SOBRE MÍ</a>
        </nav>

        <!-- Mobile Menu Button -->
        <button 
          class="md:hidden text-text-muted hover:text-text-main p-2 rounded-lg bg-slate-800/60 border border-slate-700 focus:outline-none" 
          (click)="toggleMenu()"
          aria-label="Abrir menú"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Nav Dropdown (Solid background for high contrast) -->
      @if (isMenuOpen) {
        <nav class="md:hidden flex flex-col gap-2 px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-2xl">
          <a routerLink="/stocks" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" (click)="closeMenu()" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all">BUSCADOR</a>
          <a routerLink="/recommended" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" (click)="closeMenu()" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all">TOP S&P500</a>
          <a routerLink="/portfolios" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" (click)="closeMenu()" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all">CARTERAS</a>
          <a routerLink="/markets" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" (click)="closeMenu()" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all">MERCADOS</a>
          <a routerLink="/about" routerLinkActive="bg-slate-800 text-white font-semibold border border-slate-700" (click)="closeMenu()" class="text-sm font-medium text-text-muted hover:text-text-main hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all">SOBRE MÍ</a>
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
