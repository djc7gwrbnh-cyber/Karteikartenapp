// Startet Lernsitzungen aus verschiedenen Einstiegen.
import { db } from '../../lib/db/db';
import { cardsOfDeck } from '../../lib/db/cards';
import type { Deck } from '../../lib/db/types';
import { buildItems, dueCards, selectCards, type CardSelection } from '../../lib/session/build';
import { dayKey } from '../../lib/dates';
import { study } from './study.svelte';
import { router } from '../../app/router.svelte';
import { toast } from '../../ui/overlay.svelte';

function returnTo() {
  return router.route.path;
}

export async function startDeck(deck: Deck, mode: 'learn' | 'review', selection: CardSelection = 'all', limit: number | null = null) {
  const today = dayKey();
  const all = await cardsOfDeck(deck.id);
  const cards = mode === 'review' ? dueCards(all, today) : selectCards(all, selection, limit, today);
  const items = buildItems(cards, new Map([[deck.id, deck]]));
  if (!study.start({ mode, title: deck.name, returnTo: returnTo(), items })) {
    toast(mode === 'review' ? 'Heute ist hier nichts fällig.' : 'Keine passenden Karten gefunden.');
  }
}

/** Alle heute fälligen Karten über alle Ordner hinweg. */
export async function startAllDue() {
  const today = dayKey();
  const [cards, decks] = await Promise.all([db.cards.where('due').belowOrEqual(today).toArray(), db.decks.toArray()]);
  const items = buildItems(cards, new Map(decks.map((d) => [d.id, d])), { forceShuffle: true });
  if (!study.start({ mode: 'review', title: 'Heute fällig', returnTo: returnTo(), items })) {
    toast('Heute ist nichts fällig. Genieß den Tag!');
  }
}
