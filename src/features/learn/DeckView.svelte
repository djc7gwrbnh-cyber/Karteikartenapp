<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import Icon from '../../ui/Icon.svelte';
  import StatusBar from '../../ui/StatusBar.svelte';
  import VirtualList from '../../ui/VirtualList.svelte';
  import SortableList from '../../ui/SortableList.svelte';
  import CardRow from './CardRow.svelte';
  import DeckEditor from './DeckEditor.svelte';
  import DeckPicker from './DeckPicker.svelte';
  import { library } from '../../app/library.svelte';
  import { router } from '../../app/router.svelte';
  import { live } from '../../lib/live.svelte';
  import {
    cardsOfDeck,
    cardStatus,
    deleteCards,
    duplicateCard,
    moveCards,
    reorderCards,
    restoreSnapshot,
    snapshotCards
  } from '../../lib/db/cards';
  import { deleteDeck } from '../../lib/db/decks';
  import type { Card, CardStatus } from '../../lib/db/types';
  import { matchesCard } from '../../lib/search';
  import { actionSheet, confirmDialog, toast } from '../../ui/overlay.svelte';
  import { plural } from '../../lib/text';

  let { id }: { id: string } = $props();

  const deck = $derived(library.deck(id));
  const folder = $derived(deck ? library.folder(deck.folderId) : undefined);
  const stat = $derived(library.stat(id));
  const cards = live(
    () => id,
    (deckId) => cardsOfDeck(deckId),
    [] as Card[]
  );

  let query = $state('');
  let filter = $state<'all' | CardStatus>('all');
  let sorting = $state(false);
  let editing = $state(false);
  let moving = $state<string | null>(null);
  let picking = $state(false);

  const filtered = $derived(
    cards.value.filter((c) => (filter === 'all' || cardStatus(c) === filter) && matchesCard(c, query))
  );

  const filters: { id: 'all' | CardStatus; label: string; count: () => number }[] = [
    { id: 'all', label: 'Alle', count: () => stat.total },
    { id: 'new', label: 'Neu', count: () => stat.new },
    { id: 'learning', label: 'In Arbeit', count: () => stat.learning },
    { id: 'secure', label: 'Sicher', count: () => stat.secure }
  ];

  const backPath = $derived(folder ? `/folder/${folder.id}` : '/');

  async function cardActions(card: Card) {
    const choice = await actionSheet(
      [
        { id: 'edit', label: 'Bearbeiten', icon: 'edit' },
        { id: 'duplicate', label: 'Duplizieren', icon: 'copy' },
        { id: 'move', label: 'In anderen Stapel verschieben', icon: 'move' },
        { id: 'delete', label: 'Löschen', icon: 'trash', destructive: true }
      ],
      card.front.text || undefined
    );
    if (choice === 'edit') router.go(`/card/${card.id}`);
    if (choice === 'duplicate') {
      await duplicateCard(card.id);
      toast('Karte dupliziert');
    }
    if (choice === 'move') {
      moving = card.id;
      picking = true;
    }
    if (choice === 'delete') {
      const snap = await snapshotCards([card.id]);
      await deleteCards([card.id]);
      toast('Karte gelöscht', { label: 'Rückgängig', run: () => restoreSnapshot(snap) });
    }
  }

  async function move(targetDeck: string) {
    if (!moving) return;
    await moveCards([moving], targetDeck);
    moving = null;
    toast(`Verschoben nach „${library.deck(targetDeck)?.name ?? ''}“`);
  }

  async function more() {
    const choice = await actionSheet(
      [
        { id: 'edit', label: 'Stapel bearbeiten', icon: 'edit' },
        ...(cards.value.length > 1 ? [{ id: 'sort', label: 'Karten sortieren', icon: 'sort' as const }] : []),
        { id: 'delete', label: 'Stapel löschen', icon: 'trash', destructive: true }
      ],
      deck?.name
    );
    if (choice === 'edit') editing = true;
    if (choice === 'sort') {
      query = '';
      filter = 'all';
      sorting = true;
    }
    if (choice === 'delete') remove();
  }

  async function remove() {
    if (!deck) return;
    const ok = await confirmDialog({
      title: `„${deck.name}“ löschen?`,
      message: stat.total ? `Dabei werden auch ${plural(stat.total, 'Karte', 'Karten')} gelöscht. Das lässt sich nicht rückgängig machen.` : undefined,
      confirmLabel: 'Löschen',
      destructive: true
    });
    if (!ok) return;
    router.back(backPath);
    await deleteDeck(deck.id);
    toast('Stapel gelöscht');
  }
</script>

{#if deck}
  <Page title={deck.name} back={backPath} backLabel={folder?.name ?? 'Lernen'}>
    {#snippet actions()}
      {#if sorting}
        <button class="btn btn-quiet" onclick={() => (sorting = false)}>Fertig</button>
      {:else}
        <button class="icon-btn" aria-label="Karten hinzufügen" onclick={() => router.go(`/deck/${id}/add`)}>
          <Icon name="plus" size={26} />
        </button>
        <button class="icon-btn" aria-label="Weitere Aktionen" onclick={more}><Icon name="more" size={26} /></button>
      {/if}
    {/snippet}

    {#snippet header()}
      {#if deck.description}<p class="description">{deck.description}</p>{/if}
      {#if stat.total}
        <div class="summary">
          <StatusBar {stat} height={6} />
          <div class="legend">
            <span><i class="secure"></i>{stat.secure} sicher</span>
            <span><i class="learning"></i>{stat.learning} in Arbeit</span>
            <span><i class="new"></i>{stat.new} neu</span>
          </div>
        </div>
      {/if}
    {/snippet}

    {#if cards.loaded && cards.value.length === 0}
      <EmptyState illustration="cards" title="Noch keine Karten" text="Lege die ersten Karten an – das geht schnell, versprochen.">
        <button class="btn btn-primary btn-large" onclick={() => router.go(`/deck/${id}/add`)}>
          <Icon name="plus" size={22} /> Karten hinzufügen
        </button>
      </EmptyState>
    {:else if sorting}
      <p class="hint">Ziehe die Karten am Griff in die gewünschte Reihenfolge.</p>
      <SortableList items={cards.value} onreorder={reorderCards} label={(c) => c.front.text || 'Karte'}>
        {#snippet row(c)}
          <div class="row-main">
            <div class="row-title">{c.front.text || 'Bild'}</div>
            <div class="row-sub">{c.back.text}</div>
          </div>
        {/snippet}
      </SortableList>
    {:else if cards.value.length}
      <div class="tools">
        <label class="search">
          <Icon name="search" size={18} />
          <span class="sr-only">Karten durchsuchen</span>
          <input type="search" bind:value={query} placeholder="Suchen" autocomplete="off" enterkeyhint="search" />
        </label>
        <div class="chips" role="radiogroup" aria-label="Filter">
          {#each filters as f (f.id)}
            <button class="chip" role="radio" aria-checked={filter === f.id} onclick={() => (filter = f.id)}>
              {f.label} <span class="count">{f.count()}</span>
            </button>
          {/each}
        </div>
      </div>

      {#if filtered.length}
        <div class="group list" style:--row-inset="36px">
          <VirtualList items={filtered} rowHeight={64} key={(c) => c.id}>
            {#snippet row(card)}
              <CardRow {card} onopen={() => router.go(`/card/${card.id}`)} onmore={() => cardActions(card)} />
            {/snippet}
          </VirtualList>
        </div>
      {:else}
        <EmptyState illustration="search" title="Nichts gefunden" text="Probier einen anderen Suchbegriff oder Filter." />
      {/if}
    {/if}
  </Page>

  <DeckEditor bind:open={editing} {deck} folderId={deck.folderId} />
  <DeckPicker bind:open={picking} exclude={id} title="Verschieben nach" onpick={move} />
{:else if library.loaded}
  <Page title="Nicht gefunden" back="/" backLabel="Lernen">
    <EmptyState illustration="search" title="Dieser Stapel ist nicht mehr da" text="Vielleicht wurde er gelöscht." />
  </Page>
{/if}

<style>
  .description {
    color: var(--text-2);
    margin: calc(-1 * var(--space-3)) var(--space-1) var(--space-4);
  }

  .summary {
    margin: 0 var(--space-1) var(--space-5);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-2);
    font-size: var(--fs-caption);
    color: var(--text-2);
  }

  .legend i {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: 1px;
  }

  .legend .secure {
    background: var(--status-secure);
  }

  .legend .learning {
    background: var(--status-learning);
  }

  .legend .new {
    background: var(--status-new);
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    border-radius: var(--radius-m);
    background: var(--surface-2);
    color: var(--text-2);
  }

  .search input {
    flex: 1;
    min-width: 0;
    min-height: 42px;
    border: 0;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
  }

  .chips {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 calc(-1 * var(--gutter));
    padding: 0 var(--gutter);
  }

  .chip {
    flex: none;
    min-height: 36px;
    padding: 0 var(--space-4);
    border-radius: var(--radius-full);
    background: var(--bg-elev);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    font-size: var(--fs-small);
    color: var(--text-2);
    transition: background var(--dur-fast), color var(--dur-fast);
  }

  .chip[aria-checked='true'] {
    background: var(--text);
    color: var(--bg);
    box-shadow: none;
  }

  .count {
    opacity: 0.6;
    font-variant-numeric: tabular-nums;
    margin-left: 2px;
  }

  .list {
    overflow: hidden;
  }

  .hint {
    color: var(--text-2);
    font-size: var(--fs-small);
    margin: 0 var(--space-1) var(--space-3);
  }
</style>
