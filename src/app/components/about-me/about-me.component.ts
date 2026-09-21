import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto my-8 px-4">
      <h1 class="text-2xl md:text-3xl font-bold font-mono tracking-tight text-text-main text-center mb-6">
        SOBRE MÍ
      </h1>
      
      <div class="relative w-24 h-24 mx-auto mb-8">
        <img 
          alt="Foto de perfil" 
          src="https://github.com/fjmatiash.png" 
          class="rounded-full w-24 h-24 object-cover border-2 border-primary/50 shadow-xl"
        />
      </div>

      <div class="card cursor-pointer" (click)="toggleDescription()" [class.flipped]="!description">
        <div class="card-inner">
          <div class="card-front">
            @if (description) {
              <p class="text-base md:text-lg leading-relaxed text-slate-200">
                ¡Hola! Mi nombre es <b class="text-white font-semibold">Francisco Javier Matías Hernández</b>. Soy un ingeniero de frontend apasionado por la tecnología y los mercados financieros. Combinando mi experiencia en desarrollo web con mi interés por la bolsa, he creado esta web para compartir información, herramientas y análisis que puedan ayudar a otros a entender mejor el mundo de las inversiones. Mi objetivo es hacer que los datos sean accesibles y presentarlos de una manera clara e intuitiva.
              </p>
            }
          </div>

          <div class="card-back">
            @if (!description) {
              <div class="text-left text-sm md:text-base leading-relaxed text-slate-200 space-y-4">
                <div>
                  <b class="text-emerald-400 font-bold block mb-1">Estudios:</b>
                  <p class="text-slate-300">
                    • Doble Grado en ADET e Ingeniería Informática en la UPSA, combinando estrategia empresarial con desarrollo tecnológico. Adquirí conocimientos en gestión financiera, optimización de recursos y diseño de software eficiente.
                  </p>
                </div>
                <div>
                  <b class="text-primary font-bold block mb-1">Experiencia:</b>
                  <p class="text-slate-300">
                    • Librería de componentes con Lit y NX, creando soluciones reutilizables y escalables.<br>
                    • Aplicaciones internas con React + Next.js, optimizando flujos de trabajo.<br>
                    • Cotizador de seguros en Angular, desarrollando interfaces intuitivas y eficientes.
                  </p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Indicador de giro -->
        <div class="flip-indicator">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0114.53-3.36L23 10"></path>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      height: 18rem;
      width: 100%;
      perspective: 75rem;
      position: relative;
    }
    .card-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .flipped .card-inner {
      transform: rotateY(180deg);
    }
    .card-front, .card-back {
      width: 100%;
      height: 100%;
      position: absolute;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .card-back {
      transform: rotateY(180deg);
      align-items: flex-start;
    }
    .flip-indicator {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      pointer-events: none;
      transition: transform 0.8s ease-in-out;
    }
    .flipped .flip-indicator {
      transform: rotate(180deg);
    }
  `]
})
export class AboutMeComponent {
  description = true;

  toggleDescription() {
    this.description = !this.description;
  }
}
