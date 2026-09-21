# Stonks App - UI/UX Redesign Specification

## 1. Resumen de la Arquitectura de Componentes Actual
La aplicación es un frontend construido en **Angular 19** que se conecta a un backend en Node.js (con web scraping integrado para obtener datos de fuentes como Dataroma y MarketBeat).

La estructura de componentes bajo `src/app/components` es actualmente la siguiente:
- `header/`: Barra de navegación principal.
- `search/`: Buscador de acciones (tickers).
- `stock-info/`: Visualización de detalles financieros y gráficos de una acción seleccionada.
- `recommended/`: Acciones más recomendadas del Top S&P500.
- `portfolios/`: Carteras de expertos inversores (extraídas vía Dataroma).
- `market-status/`: Indicador visual de si el mercado está abierto o cerrado.
- `about-me/`: Información sobre el desarrollador.
- `loading/`: Componente global o interceptor de estados de carga (spinners/skeletons).

**Estado del Estilo Actual:**
El proyecto actualmente utiliza CSS clásico (Vanilla CSS) de forma muy básica (por ejemplo, `styles.css` solo define un color de fondo gris claro global `#f8f9fa`). No existe un sistema de diseño estandarizado ni directrices claras para estados responsivos o variables de tema consistentes.

---

## 2. Propuesta de Design System
Para transformar "Stonks App" en una plataforma de nivel premium, proponemos un enfoque **Spec-Driven Development** adoptando una filosofía "Utility-First" moderna y enfocada a datos financieros.

### 2.1 Stack de Estilos y Herramientas
- **Tailwind CSS v3/v4:** Sustituirá al Vanilla CSS para el layout y los estilos rápidos, permitiendo un desarrollo ágil de componentes y garantizando un tamaño de bundle pequeño.
- **Iconografía:** Implementar Lucide Icons o Heroicons para mantener una estética minimalista.
- **Tipografía:** Google Fonts: **Inter** para la interfaz (limpia, neutral) y **Roboto Mono** o **JetBrains Mono** para cifras y tickers financieros (tabular lining).

### 2.2 Estética y Tema ("Fintech Premium")
- **Paleta de Colores (Glassmorphism & High Contrast):**
  - *Fondo Global:* Modo oscuro de forma nativa (`bg-slate-900` o `bg-gray-950`) o un modo claro sofisticado con fondos gris muy sutiles.
  - *Acentos Financieros:* 
    - Positivo (Bullish): Verde neón vibrante (ej. `#10B981` o similar Tailwind `emerald-500`).
    - Negativo (Bearish): Rojo coral/carmesí (`#EF4444` o `rose-500`).
    - Primario: Azul eléctrico o Púrpura índigo para acciones primarias (botones de búsqueda, tabs).
- **Estructura Modular (Data Visualization):**
  - Uso intensivo de **Cards** con bordes sutiles, sombras suaves y `backdrop-blur` (glassmorphism) para encapsular métricas individuales o gráficos.
  - Skeletons animados para estados de carga al hacer scraping desde el backend.
  - Micro-interacciones: Transiciones suaves al hacer hover sobre los tickers o botones (`transition-all duration-300`).

---

## 3. Desglose de Tareas (Task Breakdown) para Sub-Agente de Frontend

El siguiente plan de acción deberá ser asignado a un sub-agente especializado en UI:

### Fase 1: Setup del Design System
- [ ] Instalar e inicializar Tailwind CSS en el proyecto Angular 19.
- [ ] Configurar `tailwind.config.js` definiendo la paleta de colores personalizada, fuentes (Inter/Mono) y habilitar el Dark Mode.
- [ ] Reemplazar el contenido obsoleto en `src/styles.css` por las directivas de Tailwind (`@tailwind base; @tailwind components; @tailwind utilities;`).

### Fase 2: Creación de Componentes Reutilizables (UI Kit)
- [ ] Crear un componente genérico `CardComponent` para envolver secciones de datos.
- [ ] Crear un componente `BadgeComponent` (verde/rojo) para mostrar los cambios porcentuales (+/-) de acciones.
- [ ] Crear un `SkeletonLoaderComponent` moderno para reemplazar el loader básico en las llamadas de red (útil por la latencia del web scraping).

### Fase 3: Refactorización de Componentes Core (Vistas)
- [ ] **Header / Navegación:** Convertir en un sticky navbar con glassmorphism.
- [ ] **Search:** Mejorar el input text haciéndolo grande, centrado y con un botón de acción claro.
- [ ] **Stock Info:** Organizar los datos en una "Bento Grid" usando Tailwind Grid. Separar claramente el gráfico de las métricas clave (Precio, Volumen, Market Cap).
- [ ] **Recommended & Portfolios:** Aplicar diseño de lista en tarjetas o tabla responsiva, destacando visualmente la recomendación (Comprar/Vender/Mantener).
- [ ] **Market Status:** Crear un indicador animado (punto parpadeante verde o rojo) según el estado del mercado.

### Fase 4: Pulido y Responsividad
- [ ] Probar y ajustar toda la interfaz para dispositivos móviles y tablets (mobile-first approach).
- [ ] Verificar contrastes y accesibilidad general.
