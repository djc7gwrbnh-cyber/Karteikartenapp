import { cardStatus } from '../db/cards';
import { descendantIds } from '../db/tree';
import type { Card, Deck, Folder } from '../db/types';

export interface DeckStat {
  total: number;
  due: number;
  new: number;
  learning: number;
  secure: number;
}

export interface FolderStat {
  decks: number;
  cards: number;
  due: number;
}

export const emptyStat = (): DeckStat => ({ total: 0, due: 0, new: 0, learning: 0, secure: 0 });

export function isDue(card: Pick<Card, 'due'>, today: string): boolean {
  return !!card.due && card.due <= today;
}

export function computeDeckStats(cards: Card[], today: string): Map<string, DeckStat> {
  const map = new Map<string, DeckStat>();
  for (const card of cards) {
    let s = map.get(card.deckId);
    if (!s) map.set(card.deckId, (s = emptyStat()));
    s.total++;
    s[cardStatus(card)]++;
    if (isDue(card, today)) s.due++;
  }
  return map;
}

/** Summen pro Ordner, inklusive aller Unterordner. */
export function computeFolderStats(folders: Folder[], decks: Deck[], deckStats: Map<string, DeckStat>) {
  const map = new Map<string, FolderStat>();
  for (const folder of folders) {
    const ids = new Set([folder.id, ...descendantIds(folders, folder.id)]);
    const stat: FolderStat = { decks: 0, cards: 0, due: 0 };
    for (const deck of decks) {
      if (!ids.has(deck.folderId)) continue;
      const ds = deckStats.get(deck.id);
      stat.decks++;
      stat.cards += ds?.total ?? 0;
      stat.due += ds?.due ?? 0;
    }
    map.set(folder.id, stat);
  }
  return map;
}
