import { db, uid } from './db';

export async function saveImage(blob: Blob, width: number, height: number): Promise<string> {
  const id = uid();
  await db.images.add({ id, blob, width, height });
  return id;
}

export async function deleteImage(id: string) {
  await db.images.delete(id);
}

/** Entfernt Bilder, die keine Karte mehr verwendet (z. B. verworfene Entwürfe). */
export async function collectUnusedImages(): Promise<number> {
  return db.transaction('rw', db.cards, db.images, async () => {
    const used = new Set<string>();
    await db.cards.each((c) => {
      if (c.front.imageId) used.add(c.front.imageId);
      if (c.back.imageId) used.add(c.back.imageId);
    });
    const all = (await db.images.toCollection().primaryKeys()) as string[];
    const unused = all.filter((id) => !used.has(id));
    await db.images.bulkDelete(unused);
    return unused.length;
  });
}
