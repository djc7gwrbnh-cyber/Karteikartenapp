// Datenmodell. Alle IDs sind UUID-Strings, damit Importe zusammengeführt werden können.

export interface Folder {
  id: string;
  /** '' = oberste Ebene (leerer String statt null, damit indexierbar) */
  parentId: string;
  name: string;
  color: string; // ID aus der Palette
  icon: string; // ID aus den Piktogrammen
  order: number;
  createdAt: number;
}

export interface Deck {
  id: string;
  folderId: string;
  name: string;
  description: string;
  /** null = Farbe des Ordners */
  color: string | null;
  order: number;
  /** Welche Seite zuerst gezeigt wird */
  firstSide: 'front' | 'back';
  /** Beide Richtungen abfragen */
  bothDirections: boolean;
  /** Reihenfolge beim Lernen mischen */
  shuffle: boolean;
  createdAt: number;
}

export interface Side {
  text: string;
  imageId?: string;
}

export interface SrsFields {
  reps: number;
  ease: number;
  /** Tage */
  interval: number;
  /** YYYY-MM-DD; fehlt bei neuen Karten */
  due?: string;
  correct: number;
  wrong: number;
  /** YYYY-MM-DD */
  lastStudied?: string;
}

export interface Card extends SrsFields {
  id: string;
  deckId: string;
  order: number;
  front: Side;
  back: Side;
  createdAt: number;
  updatedAt: number;
}

export interface StoredImage {
  id: string;
  blob: Blob;
  width: number;
  height: number;
}

export type SessionMode = 'learn' | 'review' | 'hard';

export interface DeckResult {
  deckId: string;
  total: number;
  firstTry: number;
}

export interface Session {
  id: string;
  /** Tag des Beginns, YYYY-MM-DD */
  day: string;
  startedAt: number;
  endedAt: number;
  /** Aktive Lernzeit */
  durationMs: number;
  mode: SessionMode;
  deckIds: string[];
  /** Abgefragte Karten (je Richtung) */
  total: number;
  /** Davon auf Anhieb gewusst */
  firstTry: number;
  completed: boolean;
  perDeck: DeckResult[];
}

export interface Message {
  id: string;
  text: string;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export type CardStatus = 'new' | 'learning' | 'secure';
