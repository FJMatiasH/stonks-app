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
    <app-header></app-header>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
  `]
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
