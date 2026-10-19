<script lang="ts">
  // Schmaler Balken: Verhältnis neu / in Arbeit / sicher.
  import type { DeckStat } from '../lib/stats/deckStats';
  let { stat, height = 4 }: { stat: DeckStat; height?: number } = $props();
  const total = $derived(Math.max(1, stat.total));
</script>

<div
  class="status"
  style:height="{height}px"
  role="img"
  aria-label="{stat.new} neu, {stat.learning} in Arbeit, {stat.secure} sicher"
>
  {#if stat.secure}<span style:flex={stat.secure / total} class="secure"></span>{/if}
  {#if stat.learning}<span style:flex={stat.learning / total} class="learning"></span>{/if}
  {#if stat.new}<span style:flex={stat.new / total} class="new"></span>{/if}
</div>

<style>
  .status {
    display: flex;
    gap: 2px;
    width: 100%;
    border-radius: 99px;
    overflow: hidden;
  }

  span {
    min-width: 3px;
    border-radius: 99px;
    transition: flex var(--dur) var(--ease-out);
  }

  .secure {
    background: var(--status-secure);
  }

  .learning {
    background: var(--status-learning);
  }

  .new {
    background: var(--status-new);
  }
</style>
