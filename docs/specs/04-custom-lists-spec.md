# Especificación de Diseño de Software (SDD) - Listas Personalizadas

## 1. Introducción
Este documento detalla la implementación de la funcionalidad de "Listas Personalizadas" dentro del componente `recommended.component.ts`. Esta característica permite a los usuarios filtrar la tabla de acciones recomendadas basándose en conjuntos predefinidos (y en un futuro, creados por el usuario) de tickers.

## 2. Estructura de Datos
Se ha definido la siguiente interfaz en TypeScript para modelar una lista personalizada:

```typescript
interface CustomList {
  id: string;      // Identificador único de la lista
  name: string;    // Nombre descriptivo a mostrar en la UI
  tickers: string[]; // Array de símbolos (tickers) que pertenecen a la lista
}
```

## 3. Estado Inicial y Valores por Defecto
El componente inicializa el estado con dos listas por defecto:
1. **Todas**: Muestra todas las acciones disponibles sin filtro (`id: 'all'`).
2. **MAG10**: Una lista predefinida con las 10 empresas tecnológicas más importantes.

```typescript
customLists: CustomList[] = [
  { id: 'all', name: 'Todas', tickers: [] },
  { id: 'mag10', name: 'MAG10', tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'TSM', 'AVGO', 'MU'] }
];
selectedListId = 'mag10'; // Lista seleccionada por defecto al cargar
```

## 4. UI/UX
Se han añadido los controles en la parte superior izquierda, junto al botón de "Borrar Caché":
- **Botón "Crear"**: Un botón de acción preparado para integrar un modal o formulario de creación de nuevas listas en el futuro.
- **Dropdown (Select)**: Un menú desplegable enlazado bidireccionalmente a `selectedListId`. Muestra las listas disponibles y permite al usuario cambiar el filtro activo.

## 5. Lógica de Filtrado
El proceso de filtrado es reactivo y ocurre después de calcular las puntuaciones del algoritmo en la función `recalculateRatings()`:

1. Se toman las acciones cacheadas en memoria (`tempStocks`).
2. Si el `selectedListId` es distinto a `'all'`, se busca la lista correspondiente.
3. Se filtra el array de acciones, comprobando si cada `ticker` está incluido (`.includes()`) en el array de la lista.
4. El resultado final se asigna a `recommendedStocks` y se le aplica el ordenamiento (`applySort()`).

## 6. Siguientes Pasos
- Implementar la persistencia de listas en `localStorage` o en base de datos.
- Desarrollar la vista/modal de creación para el botón "Crear", permitiendo agregar/eliminar tickers dinámicamente.
