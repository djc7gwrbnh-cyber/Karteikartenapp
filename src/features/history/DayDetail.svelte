<script lang="ts">
  import Sheet from '../../ui/Sheet.svelte';
  import DeckBadge from '../../ui/DeckBadge.svelte';
  import { library } from '../../app/library.svelte';
  import { dayByDeck, type DaySummary } from '../../lib/stats/history';
  import { formatDayLong, formatDuration } from '../../lib/dates';
  import { percent, plural } from '../../lib/text';

  let { open = $bindable(false), summary }: { open?: boolean; summary: DaySummary | null } = $props();
  const decks = $derived(summary ? dayByDeck(summary) : []);
</script>

<Sheet bind:open title={summary ? formatDayLong(summary.day) : ''}>
  {#if summary}
    <div class="tiles">
      <div class="tile"><b class="tabular">{summary.total}</b><span>Karten</span></div>
      <div class="tile"><b class="tabular">{percent(summary.firstTry, summary.total)} %</b><span>auf Anhieb</span></div>
      <div class="tile"><b class="tabular">{formatDuration(summary.durationMs)}</b><span>Lernzeit</span></div>
    </div>

    <div class="group-title">Gelernte Stapel</div>
    <div class="group">
      {#each decks as d (d.deckId)}
        {@const deck = library.deck(d.deckId)}
        <div class="row" style:--row-inset="64px">
          <DeckBadge color={deck ? library.deckColor(deck) : 'slate'} size={36} />
          <div class="row-main">
            <div class="row-title">{deck?.name ?? 'Gelöschter Stapel'}</div>
            <div class="row-sub">{plural(d.total, 'Karte', 'Karten')} · {percent(d.firstTry, d.total)} % auf Anhieb</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Sheet>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3) var(--space-2);
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
  }

  .tile b {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    white-space: nowrap;
  }

  .tile span {
    font-size: var(--fs-caption);
    color: var(--text-2);
  }
</style>
