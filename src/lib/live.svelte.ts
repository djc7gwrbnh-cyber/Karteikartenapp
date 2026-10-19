import { liveQuery } from 'dexie';

/**
 * Reaktive Dexie-Abfrage für Svelte 5.
 * `deps` wird reaktiv verfolgt; ändern sich die Abhängigkeiten oder die Daten, wird neu abgefragt.
 */
export function live<T, D = void>(deps: () => D, query: (deps: D) => Promise<T> | T, initial: T) {
  let value = $state<T>(initial);
  let loaded = $state(false);
  let error = $state<unknown>(null);

  $effect(() => {
    const d = deps();
    const sub = liveQuery(() => query(d)).subscribe({
      next: (v) => {
        value = v;
        loaded = true;
        error = null;
      },
      error: (e) => {
        console.error(e);
        error = e;
        loaded = true;
      }
    });
    return () => sub.unsubscribe();
  });

  return {
    get value() {
      return value;
    },
    get loaded() {
      return loaded;
    },
    get error() {
      return error;
    }
  };
}
