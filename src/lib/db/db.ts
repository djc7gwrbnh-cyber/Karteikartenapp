import Dexie, { type EntityTable } from 'dexie';
import type { Card, Deck, Folder, Message, Session, Setting, StoredImage } from './types';

export class KarteiDB extends Dexie {
  folders!: EntityTable<Folder, 'id'>;
  decks!: EntityTable<Deck, 'id'>;
  cards!: EntityTable<Card, 'id'>;
  images!: EntityTable<StoredImage, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  messages!: EntityTable<Message, 'id'>;
  settings!: EntityTable<Setting, 'key'>;

  constructor(name = 'karteikarten') {
    super(name);
    /*
     * Migrationen: Für jede Schemaänderung eine neue version(n) ergänzen,
     * die alten Versionen stehen lassen und Daten in .upgrade() nur ergänzen,
     * nie verwerfen.
     */
    this.version(1).stores({
      folders: 'id, parentId, order',
      decks: 'id, folderId, order',
      cards: 'id, deckId, due, [deckId+order]',
      images: 'id',
      sessions: 'id, day, startedAt, *deckIds',
      messages: 'id, createdAt',
      settings: 'key'
    });
  }
}

export const db = new KarteiDB();

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
