// splash.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
    <div class="flex flex-col justify-center items-center h-screen bg-surface text-text-main gap-4">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <h2 class="text-xl font-mono font-bold text-white">Iniciando el scraper...</h2>
      <p class="text-text-muted text-sm">Esto puede tardar unos segundos.</p>
    </div>
  `,
  styles: []
})
export class SplashComponent {}
