// Zustand der laufenden Lernsitzung. Wird in localStorage gesichert, damit eine Sitzung
// nicht verloren geht, wenn iOS die App im Hintergrund beendet.
import { db, uid } from '../../lib/db/db';
import type { Session, SessionMode, SrsFields } from '../../lib/db/types';
import { answer as answerQueue, createQueue, isFinished, missed, shuffle, type QueueState } from '../../lib/session/queue';
import type { StudyItem } from '../../lib/session/build';
import { pickSrs, review } from '../../lib/srs/sm2';
import { dayKey } from '../../lib/dates';
import { router } from '../../app/router.svelte';

const STORAGE_KEY = 'karteikarten.session.v1';
/** Längere Pausen zählen nicht zur Lerndauer */
const MAX_GAP_MS = 120_000;

interface HistoryEntry {
  queue: QueueState;
  srs?: { cardId: string; before: SrsFields };
  activeMs: number;
}

export interface ActiveSession {
  id: string;
  mode: SessionMode;
  title: string;
  returnTo: string;
  deckIds: string[];
  items: StudyItem[];
  queue: QueueState;
  history: HistoryEntry[];
  srsApplied: string[];
  startedAt: number;
  activeMs: number;
  lastAt: number;
}

export interface FinishedSession {
  record: Session;
  title: string;
  returnTo: string;
  missedItems: StudyItem[];
  previous?: Session;
}

function load(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ActiveSession;
    if (!s || !Array.isArray(s.items) || !s.queue) return null;
    s.lastAt = Date.now();
    return s;
  } catch {
    return null;
  }
}

class StudyStore {
  active = $state<ActiveSession | null>(load());
  finished = $state<FinishedSession | null>(null);
  busy = false;

  private save() {
    try {
      if (this.active) localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(this.active)));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Speicher voll oder privat: Sitzung läuft trotzdem weiter */
    }
  }

  start(opts: { mode: SessionMode; title: string; returnTo: string; items: StudyItem[] }) {
    if (!opts.items.length) return false;
    const now = Date.now();
    this.finished = null;
    this.active = {
      id: uid(),
      mode: opts.mode,
      title: opts.title,
      returnTo: opts.returnTo,
      deckIds: [...new Set(opts.items.map((i) => i.deckId))],
      items: opts.items,
      queue: createQueue(opts.items.map((i) => i.key)),
      history: [],
      srsApplied: [],
      startedAt: now,
      activeMs: 0,
      lastAt: now
    };
    this.save();
    if (router.route.path !== '/study') router.go('/study');
    return true;
  }

  /** Entfernt Einträge, deren Karte inzwischen gelöscht wurde. */
  prune(existing: Set<string>) {
    const s = this.active;
    if (!s) return;
    const gone = new Set(s.items.filter((i) => !existing.has(i.cardId)).map((i) => i.key));
    if (!gone.size) return;
    s.items = s.items.filter((i) => !gone.has(i.key));
    s.queue = { ...s.queue, pending: s.queue.pending.filter((k) => !gone.has(k)), done: s.queue.done.filter((k) => !gone.has(k)) };
    this.save();
  }

  async answer(knew: boolean) {
    const s = this.active;
    if (!s || this.busy) return;
    const key = s.queue.pending[0];
    const item = s.items.find((i) => i.key === key);
    if (!item) return;
    this.busy = true;
    try {
      const now = Date.now();
      const entry: HistoryEntry = { queue: s.queue, activeMs: s.activeMs };
      const isFirstContact = !(key in s.queue.first);
      const next = answerQueue(s.queue, knew);

      // Spaced Repetition: einmal pro Karte und Sitzung, sobald alle ihre Richtungen
      // den ersten Kontakt hatten. Gewusst nur, wenn alle Richtungen auf Anhieb saßen.
      if (s.mode !== 'hard' && isFirstContact && !s.srsApplied.includes(item.cardId)) {
        const keys = s.items.filter((i) => i.cardId === item.cardId).map((i) => i.key);
        if (keys.every((k) => k in next.first)) {
          const result = keys.every((k) => next.first[k]);
          const card = await db.cards.get(item.cardId);
          if (card) {
            const before = pickSrs(card);
            await db.cards.update(card.id, review(before, result, dayKey()));
            entry.srs = { cardId: card.id, before };
            s.srsApplied = [...s.srsApplied, card.id];
          }
        }
      }

      s.history = [...s.history.slice(-49), entry];
      s.activeMs += Math.min(now - s.lastAt, MAX_GAP_MS);
      s.lastAt = now;
      s.queue = next;
      this.save();
      if (isFinished(next)) await this.finish();
    } finally {
      this.busy = false;
    }
  }

  get canUndo() {
    return !!this.active?.history.length;
  }

  async undo() {
    const s = this.active;
    const entry = s?.history.at(-1);
    if (!s || !entry || this.busy) return;
    this.busy = true;
    try {
      if (entry.srs) {
        // Felder, die vorher fehlten, explizit leeren
        const { due, lastStudied, ...rest } = entry.srs.before;
        await db.cards.update(entry.srs.cardId, { ...rest, due, lastStudied });
        s.srsApplied = s.srsApplied.filter((id) => id !== entry.srs!.cardId);
      }
      s.queue = entry.queue;
      s.activeMs = entry.activeMs;
      s.history = s.history.slice(0, -1);
      s.lastAt = Date.now();
      this.save();
    } finally {
      this.busy = false;
    }
  }

  private record(live: ActiveSession, completed: boolean): Session {
    // Reine Daten (keine Svelte-Proxys), damit IndexedDB sie speichern kann
    const s = $state.snapshot(live) as ActiveSession;
    const perDeck = new Map<string, { deckId: string; total: number; firstTry: number }>();
    for (const item of s.items) {
      if (!(item.key in s.queue.first)) continue;
      const r = perDeck.get(item.deckId) ?? { deckId: item.deckId, total: 0, firstTry: 0 };
      r.total++;
      if (s.queue.first[item.key]) r.firstTry++;
      perDeck.set(item.deckId, r);
    }
    const results = [...perDeck.values()];
    return {
      id: s.id,
      day: dayKey(new Date(s.startedAt)),
      startedAt: s.startedAt,
      endedAt: Date.now(),
      durationMs: Math.max(s.activeMs, 1000),
      mode: s.mode,
      deckIds: s.deckIds,
      total: results.reduce((n, r) => n + r.total, 0),
      firstTry: results.reduce((n, r) => n + r.firstTry, 0),
      completed,
      perDeck: results
    };
  }

  private async finish() {
    const s = this.active;
    if (!s) return;
    const record = this.record(s, true);
    let previous: Session | undefined;
    try {
      await db.sessions.put(record);
      if (s.deckIds.length === 1) {
        const earlier = await db.sessions.where('deckIds').equals(s.deckIds[0]).toArray();
        previous = earlier
          .filter((x) => x.id !== record.id && x.completed && x.mode !== 'hard' && x.deckIds.length === 1)
          .sort((a, b) => b.startedAt - a.startedAt)[0];
      }
    } catch (e) {
      console.error(e);
    }
    const missedKeys = new Set(missed(s.queue));
    this.finished = {
      record,
      title: s.title,
      returnTo: s.returnTo,
      missedItems: s.items.filter((i) => missedKeys.has(i.key)),
      previous
    };
    this.active = null;
    this.save();
  }

  /** Sitzung vorzeitig beenden. Bereits Gelerntes bleibt gespeichert. */
  async abort() {
    const s = this.active;
    if (!s) return;
    const returnTo = s.returnTo;
    if (Object.keys(s.queue.first).length) {
      try {
        await db.sessions.put(this.record(s, false));
      } catch (e) {
        console.error(e);
      }
    }
    this.active = null;
    this.save();
    router.go(returnTo, { replace: true });
  }

  close() {
    const returnTo = this.finished?.returnTo ?? '/';
    this.finished = null;
    router.go(returnTo, { replace: true });
  }

  /** „Nur die schweren Karten nochmal“ */
  repeatMissed() {
    const f = this.finished;
    if (!f || !f.missedItems.length) return;
    this.start({ mode: 'hard', title: 'Die schweren Karten', returnTo: f.returnTo, items: shuffle(f.missedItems) });
  }
}

export const study = new StudyStore();
