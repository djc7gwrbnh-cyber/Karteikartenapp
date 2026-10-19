<script lang="ts">
  import DeckBadge from '../../ui/DeckBadge.svelte';
  import Icon from '../../ui/Icon.svelte';
  import SortableList from '../../ui/SortableList.svelte';
  import StatusBar from '../../ui/StatusBar.svelte';
  import { library } from '../../app/library.svelte';
  import { reorderDecks } from '../../lib/db/decks';
  import type { Deck } from '../../lib/db/types';
  import { plural } from '../../lib/text';

  let { decks, sorting = false, onopen }: { decks: Deck[]; sorting?: boolean; onopen: (deck: Deck) => void } = $props();
</script>

{#if sorting}
  <SortableList items={decks} onreorder={reorderDecks} label={(d) => d.name}>
    {#snippet row(d)}
      <DeckBadge color={library.deckColor(d)} size={36} />
      <div class="row-main"><div class="row-title">{d.name}</div></div>
    {/snippet}
  </SortableList>
{:else}
  <div class="group">
    {#each decks as d (d.id)}
      {@const s = library.stat(d.id)}
      <button class="row deck-row" style:--row-inset="68px" onclick={() => onopen(d)}>
        <DeckBadge color={library.deckColor(d)} size={40} />
        <div class="row-main">
          <div class="row-title">{d.name}</div>
          <div class="row-sub">
            {s.total ? plural(s.total, 'Karte', 'Karten') : 'Noch keine Karten'}{#if s.due}<span class="due"> · {s.due} fällig</span>{/if}
          </div>
          {#if s.total}<div class="bar"><StatusBar stat={s} /></div>{/if}
        </div>
        <span class="chevron"><Icon name="chevron" size={18} /></span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .deck-row {
    min-height: 68px;
  }

  .due {
    color: var(--accent);
    font-weight: var(--fw-semibold);
  }

  .bar {
    margin-top: 6px;
    max-width: 180px;
  }
</style>
