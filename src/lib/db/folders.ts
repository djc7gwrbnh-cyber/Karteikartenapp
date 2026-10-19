import { db, uid } from './db';
import { descendantIds } from './tree';
import type { Folder } from './types';

export async function createFolder(input: Pick<Folder, 'parentId' | 'name' | 'color' | 'icon'>): Promise<string> {
  const siblings = await db.folders.where('parentId').equals(input.parentId).toArray();
  const order = siblings.reduce((max, f) => Math.max(max, f.order), -1) + 1;
  const folder: Folder = { ...input, id: uid(), order, createdAt: Date.now() };
  await db.folders.add(folder);
  return folder.id;
}

export async function updateFolder(id: string, patch: Partial<Omit<Folder, 'id'>>) {
  await db.folders.update(id, patch);
}

/** Setzt die Reihenfolge entsprechend der übergebenen ID-Liste. */
export async function reorderFolders(ids: string[]) {
  await db.transaction('rw', db.folders, async () => {
    await Promise.all(ids.map((id, order) => db.folders.update(id, { order })));
  });
}

export async function folderContentCount(id: string) {
  const all = await db.folders.toArray();
  const folderIds = [id, ...descendantIds(all, id)];
  const decks = await db.decks.where('folderId').anyOf(folderIds).toArray();
  const cards = decks.length ? await db.cards.where('deckId').anyOf(decks.map((d) => d.id)).count() : 0;
  return { folders: folderIds.length - 1, decks: decks.length, cards };
}

/** Löscht einen Ordner samt Unterordnern, Stapeln, Karten und Bildern. */
export async function deleteFolder(id: string) {
  await db.transaction('rw', [db.folders, db.decks, db.cards, db.images], async () => {
    const all = await db.folders.toArray();
    const folderIds = [id, ...descendantIds(all, id)];
    const deckIds = (await db.decks.where('folderId').anyOf(folderIds).primaryKeys()) as string[];
    await deleteCardsOfDecks(deckIds);
    await db.decks.bulkDelete(deckIds);
    await db.folders.bulkDelete(folderIds);
  });
}

export async function deleteCardsOfDecks(deckIds: string[]) {
  if (!deckIds.length) return;
  const cards = await db.cards.where('deckId').anyOf(deckIds).toArray();
  const imageIds = cards.flatMap((c) => [c.front.imageId, c.back.imageId]).filter((x): x is string => !!x);
  await db.images.bulkDelete(imageIds);
  await db.cards.bulkDelete(cards.map((c) => c.id));
}
