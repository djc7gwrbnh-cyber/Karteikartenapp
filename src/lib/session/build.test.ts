import { describe, expect, it } from 'vitest';
import { buildItems, dueCards, selectCards } from './build';
import { freshSrs } from '../db/cards';
import type { Card, Deck } from '../db/types';

const card = (id: string, deckId = 'd', extra: Partial<Card> = {}): Card => ({
  id,
  deckId,
  order: 0,
  front: { text: id },
  back: { text: id.toUpperCase() },
  createdAt: 0,
  updatedAt: 0,
  ...freshSrs(),
  ...extra
});

const deck = (extra: Partial<Deck> = {}): Deck => ({
  id: 'd',
  folderId: 'f',
  name: 'D',
  description: '',
  color: null,
  order: 0,
  firstSide: 'front',
  bothDirections: false,
  shuffle: true,
  createdAt: 0,
  ...extra
});

describe('Kartenauswahl', () => {
  const cards = [
    card('neu'),
    card('arbeit', 'd', { lastStudied: '2026-01-01', interval: 3, due: '2026-01-04' }),
    card('sicher', 'd', { lastStudied: '2026-01-01', interval: 30, due: '2026-02-01' })
  ];

  it('filtert nach Lernstand', () => {
    expect(selectCards(cards, 'new', null, '2026-01-02').map((c) => c.id)).toEqual(['neu']);
    expect(selectCards(cards, 'unsure', null, '2026-01-02').map((c) => c.id)).toEqual(['neu', 'arbeit']);
    expect(selectCards(cards, 'all', 2, '2026-01-05')).toHaveLength(2);
  });

  it('bevorzugt fällige Karten bei einer Teilmenge', () => {
    expect(selectCards(cards, 'all', 1, '2026-01-05', () => 0)[0].id).toBe('arbeit');
  });

  it('findet heute fällige Karten, aber keine neuen', () => {
    expect(dueCards(cards, '2026-01-04').map((c) => c.id)).toEqual(['arbeit']);
    expect(dueCards(cards, '2026-01-03')).toEqual([]);
  });
});

describe('Abfrage-Einträge', () => {
  it('zeigt standardmäßig die Vorderseite zuerst', () => {
    const items = buildItems([card('a')], new Map([['d', deck()]]));
    expect(items).toEqual([{ key: 'a:f', cardId: 'a', deckId: 'd', reverse: false }]);
  });

  it('kann die Rückseite zuerst zeigen', () => {
    const items = buildItems([card('a')], new Map([['d', deck({ firstSide: 'back' })]]));
    expect(items[0].reverse).toBe(true);
  });

  it('fragt auf Wunsch beide Richtungen ab, nicht direkt hintereinander', () => {
    for (const n of [2, 3, 4, 7]) {
      const cards = Array.from({ length: n }, (_, i) => card('c' + i));
      for (let run = 0; run < 200; run++) {
        const items = buildItems(cards, new Map([['d', deck({ bothDirections: true })]]), {}, Math.random);
        expect(items).toHaveLength(2 * n);
        expect(new Set(items.map((i) => i.key)).size).toBe(2 * n);
        for (let i = 1; i < items.length; i++) expect(items[i].cardId).not.toBe(items[i - 1].cardId);
      }
    }
  });

  it('behält ohne Mischen die Reihenfolge', () => {
    const cards = ['a', 'b', 'c'].map((id) => card(id));
    const items = buildItems(cards, new Map([['d', deck({ shuffle: false })]]));
    expect(items.map((i) => i.cardId)).toEqual(['a', 'b', 'c']);
  });
});
