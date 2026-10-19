import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseTextList, toTextList } from './textlist';
import { createBackup, exportDeck, importDeck, parseBackup, parseDeck, restoreBackup } from './backup';
import { ImportError } from './validate';
import { db } from '../db/db';
import { createFolder } from '../db/folders';
import { createDeck } from '../db/decks';
import { addCard } from '../db/cards';
import { saveImage } from '../db/images';

describe('Textlisten', () => {
  it('liest Vorderseite;Rückseite pro Zeile', () => {
    const r = parseTextList('le pain;das Brot\r\n\nla pluie ; der Regen\nohne Trenner\n;leer');
    expect(r.cards).toEqual([
      { front: 'le pain', back: 'das Brot' },
      { front: 'la pluie', back: 'der Regen' }
    ]);
    expect(r.skipped).toBe(2);
  });

  it('akzeptiert Tabulatoren und nur das erste Trennzeichen', () => {
    expect(parseTextList('a\tb;c').cards).toEqual([{ front: 'a', back: 'b;c' }]);
    expect(parseTextList('a;b;c').cards).toEqual([{ front: 'a', back: 'b;c' }]);
  });

  it('übersteht den Hin- und Rückweg mit Sonderzeichen', () => {
    const cards = [
      { front: 'Zwei\nZeilen', back: 'mit ; Semikolon' },
      { front: 'Pfad C:\\x', back: 'ok' }
    ];
    expect(parseTextList(toTextList(cards)).cards).toEqual(cards);
  });
});

describe('Backup', () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });

  async function seed() {
    const folder = await createFolder({ parentId: '', name: 'Bio', color: 'sage', icon: 'leaf' });
    const deck = await createDeck({ folderId: folder, name: 'Zelle' });
    const img = await saveImage(new Blob([new Uint8Array([1, 2, 3, 250])], { type: 'image/jpeg' }), 10, 20);
    await addCard(deck, { text: 'Bild', imageId: img }, { text: 'Antwort' });
    await addCard(deck, { text: 'A' }, { text: 'B' });
    return { folder, deck };
  }

  it('exportiert und ersetzt vollständig, inklusive Bilder', async () => {
    await seed();
    const json = await createBackup();
    await createFolder({ parentId: '', name: 'Weg damit', color: 'sage', icon: 'leaf' });
    await restoreBackup(parseBackup(json), 'replace');
    expect(await db.folders.count()).toBe(1);
    expect(await db.cards.count()).toBe(2);
    const img = (await db.images.toArray())[0];
    expect(new Uint8Array(await img.blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3, 250]));
    expect(img.blob.type).toBe('image/jpeg');
  });

  it('führt zusammen, ohne Bestehendes zu verlieren', async () => {
    await seed();
    const json = await createBackup();
    await createFolder({ parentId: '', name: 'Neu', color: 'sage', icon: 'leaf' });
    await restoreBackup(parseBackup(json), 'merge');
    expect(await db.folders.count()).toBe(2);
    expect(await db.cards.count()).toBe(2);
  });

  it('lehnt fremde oder kaputte Dateien freundlich ab', () => {
    expect(() => parseBackup('kein json')).toThrow(ImportError);
    expect(() => parseBackup('{"app":"andere"}')).toThrow(/keine Datei aus der Karteikarten-App/);
    expect(() => parseBackup('{"app":"karteikarten","kind":"backup","version":9}')).toThrow(/neueren Version/);
    expect(() => parseBackup('{"app":"karteikarten","kind":"backup","version":1,"cards":[{"id":"x"}]}')).toThrow(ImportError);
    expect(() => parseBackup('{"app":"karteikarten","kind":"deck","version":1}')).toThrow(/einzelnen Stapel/);
  });

  it('importiert einen Stapel als Kopie mit neuen IDs', async () => {
    const { deck, folder } = await seed();
    const json = await exportDeck(deck);
    const newId = await importDeck(parseDeck(json), folder);
    expect(newId).not.toBe(deck);
    expect(await db.decks.count()).toBe(2);
    expect(await db.cards.where('deckId').equals(newId).count()).toBe(2);
    expect(await db.images.count()).toBe(2);
    const copy = await db.cards.where('deckId').equals(newId).toArray();
    expect(copy.every((c) => c.reps === 0 && !c.lastStudied)).toBe(true);
  });
});
