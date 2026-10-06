# Spec: Arquitectura del Recommended Component (SDD)

## 1. Objetivo
Proporcionar una tabla interactiva para evaluar acciones del S&P500 en tiempo real vía Server-Sent Events (SSE), combinada con un panel de configuración de pesos (Two-Way Binding y bloqueo con candados), controles unificados de gestión de listas y detalle expandible por fila.

---

## 2. Layout y UI de Controles Superiores

### 2.1. Barra de Herramientas Unificada
Dispuesta en un contenedor horizontal fluido con 4 controles de dimensiones y estética estrictamente estandarizadas:
- **Borrar Caché**: `h-10 px-4 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30`.
- **Crear Lista**: `h-10 px-4 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`.
- **Selector Desplegable de Listas**: `h-10 pl-4 pr-9 rounded-lg bg-slate-800/80 text-text-main border border-slate-700`.
- **Configurar Algoritmo**: `h-10 px-4 rounded-lg bg-primary/20 text-primary border border-primary/30`.

### 2.2. Panel de Algoritmo (2 Columnas Compacto)
- Rejilla optimizada `grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4` para minimizar espacios en blanco excesivos.
- Orden visual con métricas prioritarias arriba (PEG, Valoración, Upside, Consenso, Analistas, Forward P/E, MarketBeat Rating).
- Candados de bloqueo (`locked`) que excluyen selectivamente métricas de la redistribución automática.
- Sincronización bidireccional entre slider (`range`) e input numérico (`number`) acotados estrictamente de 0 a 100.

---

## 3. Estructura y Estilos de la Tabla Principal (`table-fixed`)

### 3.1. Orden de Columnas
1. **[0] Expandir/Contraer**: Flecha interactiva (`▼` / `▶`).
2. **[1] Rating Global (Score Ponderado)**: Ubicado como primera columna analítica. Cuenta con codificación semafórica de color dinámico:
   - $\ge 80$: Verde (`text-emerald-400`).
   - $\ge 60$: Ámbar (`text-amber-400`).
   - $< 60$: Rojo (`text-rose-400`).
3. **[2] Ticker**: Símbolo en negrita (`text-bullish`).
4. **[3] Superinversores (Dataroma Score)**: Reubicado en la tercera columna, con estilo neutro y limpio (`text-text-main`) sin badges llamativos para mantener jerarquía visual.
5. **[4] Precio**: Formateado con 2 decimales (`number:'1.2-2'`).
6. **[5-7] Consenso (C / M / V)**: Opiniones de compra, mantener y venta.
7. **[8-14] Ratios Fundamentales**: Market Cap, Dividend Yield, Trailing P/E, Forward P/E, PEG, Potential Upside y Margen Neto.

### 3.2. Fila Expandida / Detalle de Acción
Cada fila desplegable contiene:
1. **Tabla Desglosada de Métricas Secundarias (Arriba)**:
   - Analistas, Valoración, Interés Corto, Dividendo, Noticias, Insiders, Debt/Equity, P/CF y MarketBeat Rating.
2. **Barra de Gestión de Listas y Favoritos (Debajo de los datos adicionales)**:
   - **Botón Estrella (★)**: Añade o retira instantáneamente la acción de la lista del sistema "Favoritos", alternando entre estado resaltado en dorado (`★ En Favoritos`) y neutral (`☆ Añadir a Favoritos`).
   - **Botón (+) Gestionar en Listas**: Despliega un panel inline responsivo (sin posición absoluta) donde se presentan todas las listas en botones/tarjetas con indicadores `✓` y `+` para conmutar su inclusión de forma reactiva y sin recortes de overflow.
   - **Botón Rápido (+ Nueva Lista)**: Acceso directo para registrar listas nuevas asociadas al ticker.
   - **Resumen en Chips**: Muestra las etiquetas de las listas donde ya está añadida la acción.

---

## 4. Integración con `ListsService` y Filtrado Reactivo
- Inyección de `ListsService` (`lists$`).
- Filtrado dinámico en `recalculateRatings()`:
  - Cuando se selecciona una lista activa (`selectedListId !== 'all'`), la tabla filtra en memoria a los tickers pertenecientes a dicha lista.
  - Al modificar listas o alternar favoritos, la reactividad del Observable actualiza automáticamente la vista sin recargar la página.
