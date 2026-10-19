<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import Thumb from '../../ui/Thumb.svelte';
  import { cardStatus } from '../../lib/db/cards';
  import type { Card } from '../../lib/db/types';

  let { card, onopen, onmore }: { card: Card; onopen: () => void; onmore: () => void } = $props();
  const status = $derived(cardStatus(card));
  const statusLabel = { new: 'Neu', learning: 'In Arbeit', secure: 'Sicher' };
</script>

<div class="card-row">
  <button class="main" onclick={onopen}>
    <span class="dot {status}" title={statusLabel[status]}></span>
    <span class="sr-only">{statusLabel[status]}:</span>
    <div class="texts">
      <div class="front">{card.front.text || (card.front.imageId ? 'Bild' : '—')}</div>
      <div class="back">{card.back.text || (card.back.imageId ? 'Bild' : '—')}</div>
    </div>
    {#if card.front.imageId}<Thumb id={card.front.imageId} />{/if}
    {#if card.back.imageId}<Thumb id={card.back.imageId} />{/if}
  </button>
  <button class="more" aria-label="Aktionen für diese Karte" onclick={onmore}>
    <Icon name="more" size={22} />
  </button>
</div>

<style>
  .card-row {
    display: flex;
    align-items: stretch;
    width: 100%;
    height: 100%;
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0 0 0 var(--space-4);
    text-align: left;
    transition: background var(--dur-fast);
  }

  .main:active {
    background: var(--surface-2);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;
  }

  .dot.new {
    background: var(--status-new);
  }

  .dot.learning {
    background: var(--status-learning);
  }

  .dot.secure {
    background: var(--status-secure);
  }

  .texts {
    flex: 1;
    min-width: 0;
  }

  .front,
  .back {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: var(--lh-snug);
  }

  .front {
    font-weight: var(--fw-medium);
  }

  .back {
    font-size: var(--fs-small);
    color: var(--text-2);
  }

  .more {
    display: grid;
    place-items: center;
    width: 48px;
    flex: none;
    color: var(--text-3);
  }
</style>
