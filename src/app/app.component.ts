import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CarteraService } from './services/server.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent
  ],
  template: `
    <div class="flex flex-col h-screen overflow-hidden bg-surface">
      <app-header></app-header>
      <main class="flex-1 overflow-y-auto px-4 py-3">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  scrapperLoaded: boolean = false;
  private sub!: Subscription;

  constructor(private carteraService: CarteraService) {}

  ngOnInit(): void {
    this.sub = this.carteraService.scrapperLoaded$.subscribe(loaded => {
      console.log('Scrapper loaded:', loaded);
      this.scrapperLoaded = loaded;
    });
  }
}
