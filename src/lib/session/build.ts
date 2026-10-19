import { cardStatus } from '../db/cards';
import type { Card, Deck } from '../db/types';
import { isDue } from '../stats/deckStats';
import { shuffle, type Rand } from './queue';

export interface StudyItem {
  /** Eindeutig je Richtung: cardId + ':f' (Vorderseite zuerst) oder ':b' */
  key: string;
  cardId: string;
  deckId: string;
  /** true = Rückseite wird als Frage gezeigt */
  reverse: boolean;
}

export type CardSelection = 'all' | 'new' | 'unsure';

export function selectCards(cards: Card[], selection: CardSelection, limit: number | null, today: string, rand: Rand = Math.random): Card[] {
  let pool = cards;
  if (selection === 'new') pool = cards.filter((c) => cardStatus(c) === 'new');
  if (selection === 'unsure') pool = cards.filter((c) => cardStatus(c) !== 'secure');
  if (limit && pool.length > limit) {
    // Bei einer Teilmenge zuerst fällige und schwierige Karten, dann der Rest
    const score = (c: Card) => (isDue(c, today) ? 2 : 0) + (c.wrong > c.correct ? 1 : 0) + rand() * 0.5;
    pool = [...pool].sort((a, b) => score(b) - score(a)).slice(0, limit);
  }
  return pool;
}

export function dueCards(cards: Card[], today: string): Card[] {
  return cards.filter((c) => isDue(c, today));
}

/** Baut die Abfrage-Einträge: Richtung je Stapel-Einstellung, gemischt wenn gewünscht. */
export function buildItems(cards: Card[], decks: Map<string, Deck>, opts: { forceShuffle?: boolean } = {}, rand: Rand = Math.random): StudyItem[] {
  const items: StudyItem[] = [];
  let anyShuffle = !!opts.forceShuffle;
  for (const card of cards) {
    const deck = decks.get(card.deckId);
    const backFirst = deck?.firstSide === 'back';
    items.push({ key: card.id + (backFirst ? ':b' : ':f'), cardId: card.id, deckId: card.deckId, reverse: backFirst });
    if (deck?.bothDirections) {
      items.push({ key: card.id + (backFirst ? ':f' : ':b'), cardId: card.id, deckId: card.deckId, reverse: !backFirst });
    }
    if (deck?.shuffle !== false) anyShuffle = true;
  }
  if (!anyShuffle) {
    // Feste Reihenfolge: erst alle in Hauptrichtung, dann die Gegenrichtung
    const main = items.filter((_, i) => i === 0 || items[i - 1].cardId !== items[i].cardId);
    const extra = items.filter((it) => !main.includes(it));
    return [...main, ...extra];
  }
  return spreadPairs(shuffle(items, rand));
}

/** Verhindert, dass beide Richtungen einer Karte direkt aufeinander folgen (wo möglich). */
export function spreadPairs(items: StudyItem[]): StudyItem[] {
  const a = [...items];
  for (let i = 1; i < a.length; i++) {
    if (a[i].cardId !== a[i - 1].cardId) continue;
    // Zuerst einen späteren, passenden Eintrag nach vorn holen …
    const j = a.findIndex((it, k) => k > i && it.cardId !== a[i].cardId);
    if (j > 0) {
      [a[i], a[j]] = [a[j], a[i]];
      continue;
    }
    // … sonst den Eintrag weiter vorne an einer freien Lücke einsetzen.
    const [item] = a.splice(i, 1);
    const p = a.findIndex((it, k) => k <= i && it.cardId !== item.cardId && (k === 0 || a[k - 1].cardId !== item.cardId));
    a.splice(p >= 0 ? p : i, 0, item);
  }
  return a;
}
