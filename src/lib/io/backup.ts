// Backup und Stapel-Export als JSON (Bilder als Base64).
import { db, uid } from '../db/db';
import { cardsOfDeck, freshSrs } from '../db/cards';
import type { Card, Deck, Folder, Message, Session, StoredImage } from '../db/types';
import { base64ToBlob, blobToBase64 } from './base64';
import * as v from './validate';

export const FORMAT_VERSION = 1;

async function encodeImages(images: StoredImage[]): Promise<v.ImageRecord[]> {
  const out: v.ImageRecord[] = [];
  for (const img of images) {
    out.push({ id: img.id, mime: img.blob.type || 'image/jpeg', width: img.width, height: img.height, data: await blobToBase64(img.blob) });
  }
  return out;
}

function decodeImage(r: v.ImageRecord): StoredImage {
  return { id: r.id, blob: base64ToBlob(r.data, r.mime), width: r.width, height: r.height };
}

function imageIdsOf(cards: Card[]) {
  return cards.flatMap((c) => [c.front.imageId, c.back.imageId]).filter((x): x is string => !!x);
}

// ---------- Komplettes Backup ----------

export interface BackupData {
  exportedAt: string;
  folders: Folder[];
  decks: Deck[];
  cards: Card[];
  sessions: Session[];
  messages: Message[];
  images: v.ImageRecord[];
}

export async function createBackup(): Promise<string> {
  const [folders, decks, cards, sessions, messages, images] = await Promise.all([
    db.folders.toArray(),
    db.decks.toArray(),
    db.cards.toArray(),
    db.sessions.toArray(),
    db.messages.toArray(),
    db.images.toArray()
  ]);
  return JSON.stringify({
    app: 'karteikarten',
    kind: 'backup',
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    folders,
    decks,
    cards,
    sessions,
    messages,
    images: await encodeImages(images)
  });
}

export function parseBackup(text: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new v.ImportError('Die Datei ist kein gültiges JSON.');
  }
  const o = v.header(raw, 'backup');
  return {
    exportedAt: typeof o.exportedAt === 'string' ? o.exportedAt : '',
    folders: v.list(o.folders, 'folders').map(v.folder),
    decks: v.list(o.decks, 'decks').map(v.deck),
    cards: v.list(o.cards, 'cards').map(v.card),
    sessions: v.list(o.sessions, 'sessions').map(v.session),
    messages: v.list(o.messages, 'messages').map(v.message),
    images: v.list(o.images, 'images').map(v.image)
  };
}

/** Spielt ein Backup ein: „merge“ ergänzt und aktualisiert, „replace“ ersetzt alles. */
export async function restoreBackup(data: BackupData, mode: 'merge' | 'replace') {
  const tables = [db.folders, db.decks, db.cards, db.sessions, db.messages, db.images];
  await db.transaction('rw', tables, async () => {
    if (mode === 'replace') await Promise.all(tables.map((t) => t.clear()));
    await db.folders.bulkPut(data.folders);
    await db.decks.bulkPut(data.decks);
    await db.images.bulkPut(data.images.map(decodeImage));
    await db.cards.bulkPut(data.cards);
    await db.sessions.bulkPut(data.sessions);
    await db.messages.bulkPut(data.messages);
  });
}

// ---------- Einzelner Stapel ----------

export interface DeckData {
  deck: Deck;
  cards: Card[];
  images: v.ImageRecord[];
}

export async function exportDeck(deckId: string): Promise<string> {
  const deck = await db.decks.get(deckId);
  if (!deck) throw new Error('Stapel nicht gefunden');
  const cards = await cardsOfDeck(deckId);
  const images = (await db.images.bulkGet(imageIdsOf(cards))).filter((x): x is StoredImage => !!x);
  return JSON.stringify({
    app: 'karteikarten',
    kind: 'deck',
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    deck,
    cards,
    images: await encodeImages(images)
  });
}

export function parseDeck(text: string): DeckData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new v.ImportError('Die Datei ist kein gültiges JSON.');
  }
  const o = v.header(raw, 'deck');
  return {
    deck: v.deck(o.deck),
    cards: v.list(o.cards, 'cards').map(v.card),
    images: v.list(o.images, 'images').map(v.image)
  };
}

/**
 * Importiert einen Stapel als neuen Stapel in einen Ordner. Alle IDs werden neu vergeben,
 * damit nichts Bestehendes überschrieben wird. Der Lernstand startet neu.
 */
export async function importDeck(data: DeckData, folderId: string): Promise<string> {
  const deckId = uid();
  const imageMap = new Map(data.images.map((img) => [img.id, uid()]));
  return db.transaction('rw', db.decks, db.cards, db.images, async () => {
    const order = await db.decks.where('folderId').equals(folderId).count();
    await db.decks.add({ ...data.deck, id: deckId, folderId, order, createdAt: Date.now() });
    await db.images.bulkAdd(data.images.map((img) => decodeImage({ ...img, id: imageMap.get(img.id)! })));
    const now = Date.now();
    await db.cards.bulkAdd(
      data.cards.map((c, i) => {
        const remap = (id?: string) => (id ? imageMap.get(id) : undefined);
        const front = { text: c.front.text, ...(remap(c.front.imageId) ? { imageId: remap(c.front.imageId) } : {}) };
        const back = { text: c.back.text, ...(remap(c.back.imageId) ? { imageId: remap(c.back.imageId) } : {}) };
        return { id: uid(), deckId, order: i, front, back, createdAt: now, updatedAt: now, ...freshSrs() };
      })
    );
    return deckId;
  });
}

export function summarize(data: BackupData) {
  return { folders: data.folders.length, decks: data.decks.length, cards: data.cards.length, images: data.images.length };
}
