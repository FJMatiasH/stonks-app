# Especificación de Diseño de Software (SDD) - Sistema de Listas Personalizadas y Favoritos

## 1. Introducción y Objetivo
El Sistema de Listas permite a los usuarios crear, organizar y filtrar colecciones de acciones financieras dentro de **Stonks App**. Proporciona una arquitectura centralizada y reactiva accesible a lo largo de toda la aplicación (cross-app), con sincronización persistente en el navegador y controles interactivos en la vista de recomendaciones.

---

## 2. Arquitectura de Estado Global (`ListsService`)

El servicio `ListsService` (`src/app/services/lists.service.ts`) actúa como un **Singleton Global** (`providedIn: 'root'`), garantizando una fuente única de verdad (Single Source of Truth) tanto para componentes basados en RxJS como para componentes modernos basados en Angular Signals.

### 2.1 Modelo de Datos (`CustomList`)
```typescript
export interface CustomList {
  id: string;          // Identificador único (ej: 'favs', 'mag10', 'list_1712345678')
  name: string;        // Nombre descriptivo (ej: 'Favoritos', 'MAG10', 'Semiconductores')
  tickers: string[];   // Lista de símbolos en mayúsculas (ej: ['AAPL', 'MSFT'])
  isSystem?: boolean;  // Indica si es una lista protegida del sistema
  description?: string;// Descripción opcional de la lista
}
```

### 2.2 Reactividad Dual (Signals + RxJS)
- **Signal**: `public readonly lists = signal<CustomList[]>([...])`
- **Computed Signals**: `favoriteList`, `favoriteTickers`
- **Observable**: `public readonly lists$: Observable<CustomList[]>` mediante `BehaviorSubject`

### 2.3 Persistencia en `localStorage`
- Clave de almacenamiento: `'stonks_custom_lists'`
- Al arrancar la aplicación, se intenta hidratar el estado desde el almacenamiento local.
- Si no existe estado previo o hay datos corruptos, se cargan de forma segura las listas por defecto.
- Cada mutación (`createList`, `addStockToList`, `removeStockFromList`, `toggleFavorite`) ejecuta `persistLists()`, sincronizando simultáneamente `localStorage`, el signal y el stream Observable.

### 2.4 Listas Predeterminadas del Sistema
1. **"Favoritos" (`favs`)**:
   - `isSystem: true`
   - Inicialmente vacía (`tickers: []`).
   - Se gestiona directamente a través de accesos directos (ej. botón de estrella ★).
2. **"MAG10" (`mag10`)**:
   - `isSystem: true`
   - Compuesta por los *Magnificent 7* más 3 líderes en semiconductores:
     `AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA, TSM, AVGO, MU`.
   - Seleccionada por defecto al inicializar `recommended.component.ts`.

---

## 3. Métodos y API Pública de `ListsService`

| Método | Retorno | Descripción |
| :--- | :--- | :--- |
| `getLists()` | `CustomList[]` | Retorna el listado actual de listas. |
| `getListById(id: string)` | `CustomList \| undefined` | Busca una lista por su identificador. |
| `createList(name: string, tickers?: string[])` | `CustomList` | Crea y persiste una nueva lista personalizada con sanitización de tickers. |
| `deleteList(id: string)` | `boolean` | Elimina una lista personalizada (las del sistema están protegidas). |
| `addStockToList(listId: string, ticker: string)` | `void` | Añade un ticker a una lista si no está ya presente. |
| `removeStockFromList(listId: string, ticker: string)` | `void` | Elimina un ticker de una lista específica. |
| `toggleStockInList(listId: string, ticker: string)` | `boolean` | Conmuta la presencia de un ticker en la lista indicada. |
| `isStockInList(listId: string, ticker: string)` | `boolean` | Comprueba si un ticker pertenece a una lista. |
| `toggleFavorite(ticker: string)` | `boolean` | Conmuta el ticker en la lista 'favs'. |
| `isFavorite(ticker: string)` | `boolean` | Comprueba si el ticker está marcado como favorito. |

---

## 4. Experiencia de Usuario y Flujos de UI (`recommended.component.ts`)

### 4.1 Barra de Controles Unificada
Ubicada en la cabecera superior sobre la tabla:
- **Borrar Caché**: Estilo `bg-rose-500/20 text-rose-400`.
- **Crear**: Botón de acción con estilo `bg-emerald-500/20 text-emerald-400` que abre el modal de creación de lista.
- **Selector Desplegable (Select)**: Dropdown estilizado con indicador de tipo y conteo de tickers (ej: `⚡ MAG10 (10)` o `★ Favoritos (3)`).
- **Configurar Algoritmo**: Estilo `bg-primary/20 text-primary`.
- **Unificación Visual Estricta**: Los 4 controles comparten idéntica altura (`h-10`), padding horizontal (`px-4`), border-radius (`rounded-lg`), tipografía (`font-bold text-sm`) y bordes semitransparentes, alineados de forma fluida y responsiva.

### 4.2 Modal de Creación de Lista
- Modal centrado con fondo desenfocado (`backdrop-blur-sm`).
- Permite ingresar el nombre de la lista y tickers iniciales separados por coma o espacio.
- Al confirmar, la nueva lista se persiste inmediatamente en `ListsService` y pasa a ser la lista activa en el selector.

### 4.3 Acciones en la Fila Desplegable (Debajo de los Datos Adicionales)
Al pulsar sobre cualquier fila de la tabla se abre el detalle expandido:
1. **Datos Adicionales**: En la parte superior del detalle se renderiza la tabla de métricas avanzadas (MarketBeat Scores y ratios financieros).
2. **Barra de Gestión de Listas y Favoritos (Debajo)**:
   - **Botón Estrella (★) - Favoritos**: Conmuta instantáneamente la pertenencia a la lista `favs`, con estado visual destacado en ámbar (`★ En Favoritos`) o neutro (`☆ Añadir a Favoritos`).
   - **Botón (+) Gestionar en Listas**: Abre/cierra de forma fluida un **panel inline** en el flujo natural del DOM (evitando `position: absolute` y `overflow-hidden` para que ninguna lista resulte recortada).
   - **Panel Inline de Listas**: Muestra una cuadrícula responsive (`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`) con todas las listas disponibles (Favoritos, MAG10, y listas del usuario), con checkmarks (`✓` / `+`) para conmutar pertenencia en tiempo real.
   - **Botón Rápido "+ Nueva Lista"**: Acceso directo para registrar una nueva lista asociando el ticker actual.
   - **Chips Informativos**: Muestra etiquetas visibles de las listas en las que ya está incluido el ticker.

---

## 5. Lógica de Filtrado Reactivo
- En `RecommendedStocksComponent`, `recalculateRatings()` filtra reactivamente `tempStocks`:
  - Si `selectedListId === 'all'`, se muestran todas las acciones disponibles.
  - Si `selectedListId` es una lista específica, se muestran exclusivamente aquellas con `ticker` incluido en `list.tickers`. Si la lista está vacía, la tabla muestra el estado vacío ("No se encontraron datos para mostrar").
- Cualquier mutación emitida por `ListsService.lists$` dispara automáticamente `recalculateRatings()`, actualizando la vista al instante.
