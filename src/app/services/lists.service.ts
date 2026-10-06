import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CustomList {
  id: string;
  name: string;
  tickers: string[];
  isSystem?: boolean;
  description?: string;
}

const STORAGE_KEY = 'stonks_custom_lists';

const DEFAULT_LISTS: CustomList[] = [
  {
    id: 'favs',
    name: 'Favoritos',
    tickers: [],
    isSystem: true,
    description: 'Acciones marcadas como favoritas'
  },
  {
    id: 'mag10',
    name: 'MAG10',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'TSM', 'AVGO', 'MU'],
    isSystem: true,
    description: 'Top 10 gigantes tecnológicos y semiconductores'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ListsService {
  private listsSubject = new BehaviorSubject<CustomList[]>(this.loadInitialLists());
  public readonly lists$: Observable<CustomList[]> = this.listsSubject.asObservable();

  // Angular Signal para reactividad moderna en templates
  public readonly lists = signal<CustomList[]>(this.loadInitialLists());

  // Señales calculadas de conveniencia
  public readonly favoriteList = computed(() => 
    this.lists().find(l => l.id === 'favs')
  );

  public readonly favoriteTickers = computed(() => 
    this.favoriteList()?.tickers ?? []
  );

  constructor() {}

  /**
   * Carga las listas almacenadas en localStorage o retorna las predeterminadas.
   */
  private loadInitialLists(): CustomList[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CustomList[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Aseguramos que las listas del sistema existan siempre
            const hasFavs = parsed.some(l => l.id === 'favs');
            const hasMag10 = parsed.some(l => l.id === 'mag10');
            const merged = [...parsed];
            if (!hasFavs) {
              merged.unshift(DEFAULT_LISTS[0]);
            }
            if (!hasMag10) {
              merged.push(DEFAULT_LISTS[1]);
            }
            return merged;
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo listas de localStorage, usando valores por defecto:', e);
    }
    return DEFAULT_LISTS.map(l => ({ ...l, tickers: [...l.tickers] }));
  }

  /**
   * Guarda el estado actual en localStorage y actualiza señales y subjects.
   */
  private persistLists(newLists: CustomList[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLists));
      }
    } catch (e) {
      console.warn('Error guardando listas en localStorage:', e);
    }
    this.lists.set(newLists);
    this.listsSubject.next(newLists);
  }

  /**
   * Obtiene la copia actual de las listas.
   */
  public getLists(): CustomList[] {
    return this.lists();
  }

  /**
   * Encuentra una lista por su id.
   */
  public getListById(id: string): CustomList | undefined {
    return this.lists().find(l => l.id === id);
  }

  /**
   * Crea una nueva lista personalizada.
   */
  public createList(name: string, tickers: string[] = []): CustomList {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('El nombre de la lista no puede estar vacío');
    }
    const id = `list_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newList: CustomList = {
      id,
      name: trimmed,
      tickers: Array.from(new Set(tickers.map(t => t.toUpperCase())))
    };

    const updated = [...this.lists(), newList];
    this.persistLists(updated);
    return newList;
  }

  /**
   * Elimina una lista personalizada (las del sistema no pueden eliminarse).
   */
  public deleteList(id: string): boolean {
    const list = this.getListById(id);
    if (!list || list.isSystem) {
      return false;
    }
    const updated = this.lists().filter(l => l.id !== id);
    this.persistLists(updated);
    return true;
  }

  /**
   * Añade una acción a una lista si no está ya presente.
   */
  public addStockToList(listId: string, ticker: string): void {
    const normTicker = ticker.toUpperCase();
    const updated = this.lists().map(list => {
      if (list.id === listId && !list.tickers.includes(normTicker)) {
        return {
          ...list,
          tickers: [...list.tickers, normTicker]
        };
      }
      return list;
    });
    this.persistLists(updated);
  }

  /**
   * Elimina una acción de una lista.
   */
  public removeStockFromList(listId: string, ticker: string): void {
    const normTicker = ticker.toUpperCase();
    const updated = this.lists().map(list => {
      if (list.id === listId && list.tickers.includes(normTicker)) {
        return {
          ...list,
          tickers: list.tickers.filter(t => t !== normTicker)
        };
      }
      return list;
    });
    this.persistLists(updated);
  }

  /**
   * Conmuta la pertenencia de una acción en una lista.
   */
  public toggleStockInList(listId: string, ticker: string): boolean {
    const isPresent = this.isStockInList(listId, ticker);
    if (isPresent) {
      this.removeStockFromList(listId, ticker);
      return false;
    } else {
      this.addStockToList(listId, ticker);
      return true;
    }
  }

  /**
   * Comprueba si una acción está en una lista dada.
   */
  public isStockInList(listId: string, ticker: string): boolean {
    const list = this.getListById(listId);
    return list ? list.tickers.includes(ticker.toUpperCase()) : false;
  }

  /**
   * Conmuta el estado de favorito de una acción.
   */
  public toggleFavorite(ticker: string): boolean {
    return this.toggleStockInList('favs', ticker);
  }

  /**
   * Comprueba si una acción es favorita.
   */
  public isFavorite(ticker: string): boolean {
    return this.isStockInList('favs', ticker);
  }
}
