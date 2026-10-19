import Dexie from 'dexie';
import { db, uid } from './db';
import type { Card, CardStatus, Side, SrsFields } from './types';

export const SECURE_INTERVAL = 21;

export function freshSrs(): SrsFields {
  return { reps: 0, ease: 2.5, interval: 0, correct: 0, wrong: 0 };
}

export function cardStatus(card: SrsFields): CardStatus {
  if (!card.lastStudied) return 'new';
  return card.interval >= SECURE_INTERVAL ? 'secure' : 'learning';
}

async function nextOrder(deckId: string): Promise<number> {
  const last = await db.cards
    .where('[deckId+order]')
    .between([deckId, Dexie.minKey], [deckId, Dexie.maxKey])
    .last();
  return last ? last.order + 1 : 0;
}

export async function addCard(deckId: string, front: Side, back: Side): Promise<string> {
  const now = Date.now();
  const card: Card = {
    id: uid(),
    deckId,
    order: await nextOrder(deckId),
    front,
    back,
    createdAt: now,
    updatedAt: now,
    ...freshSrs()
  };
  await db.cards.add(card);
  return card.id;
}

function imageIds(card: Pick<Card, 'front' | 'back'>): string[] {
  return [card.front.imageId, card.back.imageId].filter((x): x is string => !!x);
}

/** Aktualisiert Inhalt einer Karte und räumt nicht mehr verwendete Bilder auf. */
export async function updateCardContent(id: string, front: Side, back: Side) {
  await db.transaction('rw', db.cards, db.images, async () => {
    const old = await db.cards.get(id);
    if (!old) return;
    const keep = new Set(imageIds({ front, back }));
    await db.images.bulkDelete(imageIds(old).filter((i) => !keep.has(i)));
    await db.cards.update(id, { front, back, updatedAt: Date.now() });
  });
}

export async function deleteCards(ids: string[]) {
  await db.transaction('rw', db.cards, db.images, async () => {
    const cards = (await db.cards.bulkGet(ids)).filter((c): c is Card => !!c);
    await db.images.bulkDelete(cards.flatMap(imageIds));
    await db.cards.bulkDelete(ids);
  });
}

/** Dupliziert eine Karte (inklusive Bilder) direkt hinter das Original. Lernstand startet neu. */
export async function duplicateCard(id: string): Promise<string | undefined> {
  return db.transaction('rw', db.cards, db.images, async () => {
    const card = await db.cards.get(id);
    if (!card) return;
    const copySide = async (side: Side): Promise<Side> => {
      if (!side.imageId) return { ...side };
      const img = await db.images.get(side.imageId);
      if (!img) return { text: side.text };
      const newId = uid();
      await db.images.add({ ...img, id: newId });
      return { text: side.text, imageId: newId };
    };
    // Nachfolgende Karten um eins nach hinten schieben
    const later = await db.cards
      .where('[deckId+order]')
      .between([card.deckId, card.order], [card.deckId, Dexie.maxKey], false, true)
      .toArray();
    await Promise.all(later.map((c) => db.cards.update(c.id, { order: c.order + 1 })));
    const now = Date.now();
    const copy: Card = {
      ...card,
      ...freshSrs(),
      due: undefined,
      lastStudied: undefined,
      id: uid(),
      order: card.order + 1,
      front: await copySide(card.front),
      back: await copySide(card.back),
      createdAt: now,
      updatedAt: now
    };
    await db.cards.add(copy);
    return copy.id;
  });
}

export async function moveCards(ids: string[], deckId: string) {
  await db.transaction('rw', db.cards, async () => {
    let order = await nextOrder(deckId);
    for (const id of ids) await db.cards.update(id, { deckId, order: order++ });
  });
}

export async function reorderCards(ids: string[]) {
  await db.transaction('rw', db.cards, async () => {
    await Promise.all(ids.map((id, order) => db.cards.update(id, { order })));
  });
}

export async function cardsOfDeck(deckId: string): Promise<Card[]> {
  return db.cards
    .where('[deckId+order]')
    .between([deckId, Dexie.minKey], [deckId, Dexie.maxKey])
    .toArray();
}
