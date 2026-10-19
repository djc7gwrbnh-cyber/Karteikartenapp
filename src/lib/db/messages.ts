import { db, uid } from './db';

export async function addMessage(text: string) {
  await db.messages.add({ id: uid(), text: text.trim(), createdAt: Date.now() });
}

export async function updateMessage(id: string, text: string) {
  await db.messages.update(id, { text: text.trim() });
}

export async function deleteMessage(id: string) {
  await db.messages.delete(id);
}
