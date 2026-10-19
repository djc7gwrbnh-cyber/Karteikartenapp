// Prüft importierte Daten Feld für Feld und ergänzt fehlende optionale Felder.
import { freshSrs } from '../db/cards';
import type { Card, Deck, Folder, Message, Session, Side } from '../db/types';

export class ImportError extends Error {}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback?: string): string => {
  if (typeof v === 'string') return v;
  if (fallback !== undefined) return fallback;
  throw new ImportError('Ein Textfeld fehlt oder ist ungültig.');
};
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);
const day = (v: unknown): string | undefined => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export function list(v: unknown, name: string): unknown[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new ImportError(`„${name}“ ist keine Liste.`);
  return v;
}

function need(v: unknown, what: string): Obj {
  if (!isObj(v)) throw new ImportError(`Ein Eintrag in „${what}“ ist beschädigt.`);
  if (typeof v.id !== 'string' || !v.id) throw new ImportError(`Ein Eintrag in „${what}“ hat keine ID.`);
  return v;
}

export function folder(v: unknown): Folder {
  const o = need(v, 'Ordner');
  return {
    id: o.id as string,
    parentId: str(o.parentId, ''),
    name: str(o.name, 'Ordner'),
    color: str(o.color, 'fir'),
    icon: str(o.icon, 'book'),
    order: num(o.order, 0),
    createdAt: num(o.createdAt, Date.now())
  };
}

export function deck(v: unknown): Deck {
  const o = need(v, 'Stapel');
  return {
    id: o.id as string,
    folderId: str(o.folderId),
    name: str(o.name, 'Stapel'),
    description: str(o.description, ''),
    color: typeof o.color === 'string' ? o.color : null,
    order: num(o.order, 0),
    firstSide: o.firstSide === 'back' ? 'back' : 'front',
    bothDirections: o.bothDirections === true,
    shuffle: o.shuffle !== false,
    createdAt: num(o.createdAt, Date.now())
  };
}

function side(v: unknown): Side {
  if (!isObj(v)) throw new ImportError('Eine Kartenseite ist beschädigt.');
  const s: Side = { text: str(v.text, '') };
  const img = optStr(v.imageId);
  if (img) s.imageId = img;
  return s;
}

export function card(v: unknown): Card {
  const o = need(v, 'Karten');
  const f = freshSrs();
  const c: Card = {
    id: o.id as string,
    deckId: str(o.deckId),
    order: num(o.order, 0),
    front: side(o.front),
    back: side(o.back),
    createdAt: num(o.createdAt, Date.now()),
    updatedAt: num(o.updatedAt, Date.now()),
    reps: num(o.reps, f.reps),
    ease: Math.max(1.3, num(o.ease, f.ease)),
    interval: num(o.interval, f.interval),
    correct: num(o.correct, 0),
    wrong: num(o.wrong, 0)
  };
  const due = day(o.due);
  const last = day(o.lastStudied);
  if (due) c.due = due;
  if (last) c.lastStudied = last;
  return c;
}

export function session(v: unknown): Session {
  const o = need(v, 'Sitzungen');
  const d = day(o.day);
  if (!d) throw new ImportError('Eine Lernsitzung hat kein gültiges Datum.');
  return {
    id: o.id as string,
    day: d,
    startedAt: num(o.startedAt, 0),
    endedAt: num(o.endedAt, 0),
    durationMs: num(o.durationMs, 0),
    mode: o.mode === 'review' || o.mode === 'hard' ? o.mode : 'learn',
    deckIds: list(o.deckIds, 'deckIds').filter((x): x is string => typeof x === 'string'),
    total: num(o.total, 0),
    firstTry: num(o.firstTry, 0),
    completed: o.completed !== false,
    perDeck: list(o.perDeck, 'perDeck')
      .filter(isObj)
      .map((r) => ({ deckId: str(r.deckId, ''), total: num(r.total, 0), firstTry: num(r.firstTry, 0) }))
  };
}

export function message(v: unknown): Message {
  const o = need(v, 'Nachrichten');
  return { id: o.id as string, text: str(o.text), createdAt: num(o.createdAt, Date.now()) };
}

export interface ImageRecord {
  id: string;
  mime: string;
  width: number;
  height: number;
  data: string;
}

export function image(v: unknown): ImageRecord {
  const o = need(v, 'Bilder');
  const data = str(o.data);
  if (!/^[A-Za-z0-9+/=\s]*$/.test(data.slice(0, 200))) throw new ImportError('Ein Bild ist beschädigt.');
  return { id: o.id as string, mime: str(o.mime, 'image/jpeg'), width: num(o.width, 0), height: num(o.height, 0), data };
}

export function header(v: unknown, kind: 'backup' | 'deck') {
  if (!isObj(v) || v.app !== 'karteikarten') {
    throw new ImportError('Das ist keine Datei aus der Karteikarten-App.');
  }
  if (v.kind !== kind) {
    throw new ImportError(kind === 'backup' ? 'Diese Datei enthält nur einen einzelnen Stapel.' : 'Diese Datei ist ein komplettes Backup, kein einzelner Stapel.');
  }
  if (typeof v.version !== 'number' || v.version > 1) {
    throw new ImportError('Diese Datei stammt aus einer neueren Version der App.');
  }
  return v;
}
