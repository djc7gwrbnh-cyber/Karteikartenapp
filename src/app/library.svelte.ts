// Zentrale, live aktualisierte Übersicht über Ordner, Stapel und Kartenzahlen.
import { liveQuery } from 'dexie';
import { db } from '../lib/db/db';
import type { Deck, Folder } from '../lib/db/types';
import { dayKey } from '../lib/dates';
import { computeDeckStats, computeFolderStats, emptyStat, type DeckStat, type FolderStat } from '../lib/stats/deckStats';

class Library {
  folders = $state.raw<Folder[]>([]);
  decks = $state.raw<Deck[]>([]);
  deckStats = $state.raw(new Map<string, DeckStat>());
  folderStats = $state.raw(new Map<string, FolderStat>());
  loaded = $state(false);
  today = $state(dayKey());

  private started = false;

  start() {
    if (this.started) return;
    this.started = true;
    liveQuery(async () => {
      const [folders, decks, cards] = await Promise.all([db.folders.toArray(), db.decks.toArray(), db.cards.toArray()]);
      return { folders, decks, cards };
    }).subscribe({
      next: ({ folders, decks, cards }) => {
        const today = dayKey();
        this.today = today;
        this.folders = folders;
        this.decks = decks;
        this.deckStats = computeDeckStats(cards, today);
        this.folderStats = computeFolderStats(folders, decks, this.deckStats);
        this.loaded = true;
      },
      error: (e) => {
        console.error(e);
        this.loaded = true;
      }
    });
    // Nach Mitternacht oder beim Zurückkehren in die App "heute" neu bestimmen.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && dayKey() !== this.today) {
        db.settings.put({ key: '_touch', value: Date.now() }); // löst Neuberechnung aus
      }
    });
  }

  folder(id: string) {
    return this.folders.find((f) => f.id === id);
  }

  deck(id: string) {
    return this.decks.find((d) => d.id === id);
  }

  childFolders(parentId: string) {
    return this.folders.filter((f) => f.parentId === parentId).sort((a, b) => a.order - b.order);
  }

  decksIn(folderId: string) {
    return this.decks.filter((d) => d.folderId === folderId).sort((a, b) => a.order - b.order);
  }

  stat(deckId: string): DeckStat {
    return this.deckStats.get(deckId) ?? emptyStat();
  }

  totalDue(): number {
    let n = 0;
    for (const deck of this.decks) n += this.deckStats.get(deck.id)?.due ?? 0;
    return n;
  }

  /** Farbe eines Stapels: eigene oder die seines Ordners. */
  deckColor(deck: Deck): string {
    return deck.color ?? this.folder(deck.folderId)?.color ?? 'fir';
  }
}

export const library = new Library();
