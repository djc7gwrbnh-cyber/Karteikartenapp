<script lang="ts">
  import Sheet from '../../ui/Sheet.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import DeckBadge from '../../ui/DeckBadge.svelte';
  import StatusBar from '../../ui/StatusBar.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { library } from '../../app/library.svelte';
  import { router } from '../../app/router.svelte';
  import type { Deck } from '../../lib/db/types';
  import type { CardSelection } from '../../lib/session/build';
  import { plural } from '../../lib/text';
  import { startDeck } from './start';

  let { open = $bindable(false), deck, showCardsLink = true }: { open?: boolean; deck: Deck; showCardsLink?: boolean } = $props();

  const stat = $derived(library.stat(deck.id));
  let mode = $state<'learn' | 'review'>('learn');
  let selection = $state<CardSelection>('all');
  let limit = $state<string>('all');
  let wasOpen = false;

  $effect(() => {
    if (open && !wasOpen) {
      mode = stat.due > 0 ? 'review' : 'learn';
      selection = 'all';
      limit = 'all';
    }
    wasOpen = open;
  });

  const pool = $derived(selection === 'new' ? stat.new : selection === 'unsure' ? stat.new + stat.learning : stat.total);
  const count = $derived(mode === 'review' ? stat.due : limit === 'all' ? pool : Math.min(pool, Number(limit)));
  const directions = $derived(deck.bothDirections ? 2 : 1);

  const limits = $derived(
    [
      { value: 'all', label: 'Alle' },
      ...[10, 20, 50].filter((n) => n < pool).map((n) => ({ value: String(n), label: String(n) }))
    ]
  );

  async function start() {
    open = false;
    await startDeck(deck, mode, selection, limit === 'all' ? null : Number(limit));
  }
</script>

<Sheet bind:open title="Lernen">
  <div class="stack">
    <div class="head">
      <DeckBadge color={library.deckColor(deck)} size={52} />
      <div class="head-text">
        <div class="name">{deck.name}</div>
        <div class="muted small">{plural(stat.total, 'Karte', 'Karten')}{stat.due ? ` · ${stat.due} heute fällig` : ''}</div>
        {#if stat.total}<div class="bar"><StatusBar {stat} /></div>{/if}
      </div>
    </div>

    <Segmented
      label="Modus"
      bind:value={mode}
      options={[
        { value: 'learn', label: 'Lernen' },
        { value: 'review', label: stat.due ? `Wiederholen (${stat.due})` : 'Wiederholen' }
      ]}
    />

    {#if mode === 'learn'}
      <div>
        <div class="label">Welche Karten?</div>
        <div class="group" role="radiogroup" aria-label="Welche Karten?">
          {#each [{ id: 'all', label: 'Alle Karten', n: stat.total }, { id: 'unsure', label: 'Noch nicht sicher', n: stat.new + stat.learning }, { id: 'new', label: 'Nur neue', n: stat.new }] as o (o.id)}
            <button
              class="row"
              role="radio"
              aria-checked={selection === o.id}
              disabled={o.n === 0}
              onclick={() => {
                selection = o.id as CardSelection;
                limit = 'all';
              }}
            >
              <div class="row-main">{o.label}</div>
              <span class="row-value tabular">{o.n}</span>
              <span class="check" class:on={selection === o.id}><Icon name="check" size={20} stroke={2.4} /></span>
            </button>
          {/each}
        </div>
      </div>
      {#if limits.length > 1}
        <div>
          <div class="label">Wie viele?</div>
          <Segmented label="Anzahl" bind:value={limit} options={limits} />
        </div>
      {/if}
    {:else if !stat.due}
      <p class="calm">Heute ist in diesem Stapel nichts fällig. Du kannst trotzdem jederzeit lernen.</p>
    {/if}

    <button class="btn btn-primary btn-large btn-block" disabled={count === 0} onclick={start}>
      <Icon name="play" size={20} />
      {count ? `${plural(count * directions, 'Karte', 'Karten')} lernen` : 'Keine Karten'}
    </button>

    {#if showCardsLink}
      <button
        class="btn btn-quiet btn-block"
        onclick={() => {
          open = false;
          router.go(`/deck/${deck.id}`);
        }}>Karten ansehen und bearbeiten</button
      >
    {/if}
  </div>
</Sheet>

<style>
  .head {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }

  .head-text {
    flex: 1;
    min-width: 0;
  }

  .name {
    font-family: var(--font-display);
    font-size: var(--fs-h2);
    font-weight: var(--fw-semibold);
    line-height: var(--lh-tight);
  }

  .small {
    font-size: var(--fs-small);
    margin-top: 2px;
  }

  .bar {
    margin-top: var(--space-2);
  }

  .check {
    color: var(--accent);
    opacity: 0;
    transition: opacity var(--dur-fast);
  }

  .check.on {
    opacity: 1;
  }

  .calm {
    color: var(--text-2);
    text-align: center;
    padding: var(--space-2) var(--space-4);
  }
</style>
