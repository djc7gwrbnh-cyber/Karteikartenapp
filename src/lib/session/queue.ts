/*
 * Ablauf einer Lernsitzung als reine Funktionen.
 * Eine nicht gewusste Karte wird 3 bis 6 Plätze weiter hinten wieder eingemischt
 * (bei weniger verbleibenden Karten entsprechend früher). Erledigt ist eine Karte erst,
 * wenn sie in dieser Sitzung gewusst wurde.
 */

export interface QueueState {
  /** Noch offene Einträge, der erste ist die aktuelle Karte */
  pending: string[];
  /** Erledigte Einträge (gewusst) */
  done: string[];
  /** Ergebnis beim ersten Kontakt: true = auf Anhieb gewusst */
  first: Record<string, boolean>;
}

export type Rand = () => number;

export const MIN_GAP = 3;
export const MAX_GAP = 6;

export function createQueue(keys: string[]): QueueState {
  return { pending: [...keys], done: [], first: {} };
}

/** Index in der Restliste, an dem eine nicht gewusste Karte wieder eingefügt wird. */
export function reinsertIndex(remaining: number, rand: Rand): number {
  const gap = MIN_GAP + Math.floor(rand() * (MAX_GAP - MIN_GAP + 1));
  return Math.min(gap, remaining);
}

export function current(state: QueueState): string | undefined {
  return state.pending[0];
}

export function answer(state: QueueState, knew: boolean, rand: Rand = Math.random): QueueState {
  const [key, ...rest] = state.pending;
  if (key === undefined) return state;
  const first = key in state.first ? state.first : { ...state.first, [key]: knew };
  if (knew) {
    return { pending: rest, done: [...state.done, key], first };
  }
  const index = reinsertIndex(rest.length, rand);
  const pending = [...rest.slice(0, index), key, ...rest.slice(index)];
  return { pending, done: state.done, first };
}

export function isFinished(state: QueueState): boolean {
  return state.pending.length === 0;
}

export function progress(state: QueueState) {
  const total = state.pending.length + state.done.length;
  const comingAgain = state.pending.filter((k) => state.first[k] === false).length;
  return { done: state.done.length, total, comingAgain };
}

/** Einträge, die beim ersten Kontakt nicht gewusst wurden. */
export function missed(state: QueueState): string[] {
  return Object.keys(state.first).filter((k) => state.first[k] === false);
}

export function shuffle<T>(items: T[], rand: Rand = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
