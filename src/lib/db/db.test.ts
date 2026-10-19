import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { createFolder, deleteFolder } from './folders';
import { createDeck, deleteDeck } from './decks';
import { addCard, cardsOfDeck, deleteCards, duplicateCard, moveCards, updateCardContent } from './cards';
import { saveImage } from './images';

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

describe('Datenbank', () => {
  it('legt Ordner mit fortlaufender Reihenfolge an', async () => {
    await createFolder({ parentId: '', name: 'Bio', color: 'sage', icon: 'leaf' });
    const b = await createFolder({ parentId: '', name: 'Mathe', color: 'ocean', icon: 'sigma' });
    expect((await db.folders.get(b))!.order).toBe(1);
  });

  it('löscht Ordner rekursiv mit Stapeln, Karten und Bildern', async () => {
    const root = await createFolder({ parentId: '', name: 'Bio', color: 'sage', icon: 'leaf' });
    const sub = await createFolder({ parentId: root, name: 'Zelle', color: 'sage', icon: 'leaf' });
    const deck = await createDeck({ folderId: sub, name: 'Organellen' });
    const img = await saveImage(new Blob(['x']), 1, 1);
    await addCard(deck, { text: 'A', imageId: img }, { text: 'B' });
    const other = await createFolder({ parentId: '', name: 'Mathe', color: 'ocean', icon: 'sigma' });
    await deleteFolder(root);
    expect(await db.folders.count()).toBe(1);
    expect((await db.folders.toArray())[0].id).toBe(other);
    expect(await db.decks.count()).toBe(0);
    expect(await db.cards.count()).toBe(0);
    expect(await db.images.count()).toBe(0);
  });

  it('hält die Kartenreihenfolge und dupliziert hinter das Original', async () => {
    const deck = await createDeck({ folderId: 'f', name: 'S' });
    const a = await addCard(deck, { text: '1' }, { text: 'eins' });
    await addCard(deck, { text: '2' }, { text: 'zwei' });
    await duplicateCard(a);
    const cards = await cardsOfDeck(deck);
    expect(cards.map((c) => c.front.text)).toEqual(['1', '1', '2']);
    expect(cards[1].id).not.toBe(a);
  });

  it('räumt ersetzte Bilder auf und verschiebt Karten', async () => {
    const d1 = await createDeck({ folderId: 'f', name: 'A' });
    const d2 = await createDeck({ folderId: 'f', name: 'B' });
    const img = await saveImage(new Blob(['x']), 1, 1);
    const id = await addCard(d1, { text: '', imageId: img }, { text: 'B' });
    await updateCardContent(id, { text: 'neu' }, { text: 'B' });
    expect(await db.images.count()).toBe(0);
    await moveCards([id], d2);
    expect((await db.cards.get(id))!.deckId).toBe(d2);
    await deleteDeck(d2);
    expect(await db.cards.count()).toBe(0);
    await deleteCards([]);
  });
});

describe('Bilder aufräumen', () => {
  it('löscht nur unbenutzte Bilder', async () => {
    const { collectUnusedImages } = await import('./images');
    const deck = await createDeck({ folderId: 'f', name: 'A' });
    const used = await saveImage(new Blob(['a']), 1, 1);
    await saveImage(new Blob(['b']), 1, 1);
    await addCard(deck, { text: '', imageId: used }, { text: 'x' });
    expect(await collectUnusedImages()).toBe(1);
    expect(await db.images.count()).toBe(1);
  });
});
