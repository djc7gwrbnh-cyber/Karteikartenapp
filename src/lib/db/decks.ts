import { db, uid } from './db';
import { deleteCardsOfDecks } from './folders';
import type { Deck } from './types';

export type DeckInput = Pick<Deck, 'folderId' | 'name'> & Partial<Omit<Deck, 'id' | 'folderId' | 'name'>>;

export async function createDeck(input: DeckInput): Promise<string> {
  const siblings = await db.decks.where('folderId').equals(input.folderId).toArray();
  const order = siblings.reduce((max, d) => Math.max(max, d.order), -1) + 1;
  const deck: Deck = {
    description: '',
    color: null,
    firstSide: 'front',
    bothDirections: false,
    shuffle: true,
    createdAt: Date.now(),
    ...input,
    id: uid(),
    order
  };
  await db.decks.add(deck);
  return deck.id;
}

export async function updateDeck(id: string, patch: Partial<Omit<Deck, 'id'>>) {
  await db.decks.update(id, patch);
}

export async function reorderDecks(ids: string[]) {
  await db.transaction('rw', db.decks, async () => {
    await Promise.all(ids.map((id, order) => db.decks.update(id, { order })));
  });
}

export async function deleteDeck(id: string) {
  await db.transaction('rw', [db.decks, db.cards, db.images], async () => {
    await deleteCardsOfDecks([id]);
    await db.decks.delete(id);
  });
}
