import { db, uid } from './db';

export async function saveImage(blob: Blob, width: number, height: number): Promise<string> {
  const id = uid();
  await db.images.add({ id, blob, width, height });
  return id;
}

export async function deleteImage(id: string) {
  await db.images.delete(id);
}
