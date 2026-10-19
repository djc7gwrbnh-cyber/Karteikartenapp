<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import SectionHeader from '../../ui/SectionHeader.svelte';
  import StatusBar from '../../ui/StatusBar.svelte';
  import Heatmap from './Heatmap.svelte';
  import LineChart from './LineChart.svelte';
  import DayDetail from './DayDetail.svelte';
  import { library } from '../../app/library.svelte';
  import { live } from '../../lib/live.svelte';
  import { db } from '../../lib/db/db';
  import type { Session } from '../../lib/db/types';
  import { heatmap, rateSeries, streak, summarizeDays } from '../../lib/stats/history';
  import { formatDuration } from '../../lib/dates';
  import { pathTo } from '../../lib/db/tree';

  const WEEKS = 20;
  const sessions = live(
    () => undefined,
    () => db.sessions.toArray(),
    [] as Session[]
  );

  const days = $derived(summarizeDays(sessions.value));
  const today = $derived(library.today);
  const s = $derived(streak(days.keys(), today));
  const cells = $derived(heatmap(days, today, WEEKS));
  const series = $derived(rateSeries(days, 30));
  const totals = $derived.by(() => {
    let cards = 0;
    let ms = 0;
    for (const d of days.values()) {
      cards += d.total;
      ms += d.durationMs;
    }
    return { cards, ms, days: days.size };
  });

  const decks = $derived(
    library.folders.length
      ? library.decks
          .filter((d) => library.stat(d.id).total > 0)
          .map((d) => ({ deck: d, stat: library.stat(d.id), path: pathTo(library.folders, d.folderId).map((f) => f.name).join(' › ') }))
          .sort((a, b) => a.path.localeCompare(b.path, 'de') || a.deck.order - b.deck.order)
      : []
  );

  let selected = $state<string | null>(null);
  let detailOpen = $state(false);
  const selectedSummary = $derived(selected ? (days.get(selected) ?? null) : null);

  function select(day: string) {
    selected = day;
    detailOpen = true;
  }

  const streakText = $derived(
    s.current === 0
      ? 'Schön, dass du da bist.'
      : s.current === 1
        ? '1 Tag'
        : `${s.current} Tage in Folge`
  );
</script>

<Page title="Verlauf">
  {#if sessions.loaded}
    {#if days.size === 0}
      <EmptyState
        illustration="history"
        title="Noch ganz frisch"
        text="Sobald du deine erste Lernsitzung abschließt, wächst hier dein Kalender."
      />
      {#if decks.length}
        <SectionHeader title="Lernstand" />
        {@render deckList()}
      {/if}
    {:else}
      <div class="streak">
        <svg class="sprout" viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
          <path d="M12 21v-9" />
          <path d="M12 12c0-4.4 3-7 7.5-7 0 4.4-3 7-7.5 7zM12 14.5c0-3.6-2.6-6-6.5-6 0 3.6 2.6 6 6.5 6z" />
        </svg>
        <div>
          <div class="streak-value">{streakText}</div>
          <div class="streak-sub">
            {#if s.current > 0 && s.learnedToday}
              Heute schon gelernt – wunderbar.
            {:else if s.current > 0}
              Gestern warst du auch dabei.
            {:else if s.longest > 1}
              Dein längster Lauf bisher: {s.longest} Tage.
            {:else}
              Jeder Tag, an dem du lernst, zählt.
            {/if}
          </div>
        </div>
      </div>

      <div class="panel">
        <Heatmap {cells} weeks={WEEKS} {selected} onselect={select} />
        <div class="heat-legend" aria-hidden="true">
          <span>weniger</span>
          {#each [0, 1, 2, 3, 4] as l (l)}<i style:background="var(--heat-{l})"></i>{/each}
          <span>mehr</span>
        </div>
      </div>

      <div class="tiles">
        <div class="tile"><b class="tabular">{totals.cards.toLocaleString('de-DE')}</b><span>Karten gelernt</span></div>
        <div class="tile"><b class="tabular">{totals.days}</b><span>Lerntage</span></div>
        <div class="tile"><b class="tabular">{formatDuration(totals.ms)}</b><span>Lernzeit</span></div>
      </div>

      <SectionHeader title="Trefferquote" />
      <div class="panel">
        {#if series.length >= 2}
          <LineChart points={series} />
          <p class="note">Anteil der Karten, die du beim ersten Versuch wusstest – pro Lerntag.</p>
        {:else}
          <p class="note center">Nach dem zweiten Lerntag erscheint hier deine Kurve.</p>
        {/if}
      </div>

      {#if decks.length}
        <SectionHeader title="Lernstand" />
        {@render deckList()}
      {/if}
    {/if}
  {/if}
</Page>

{#snippet deckList()}
  <div class="group">
    {#each decks as d (d.deck.id)}
      <div class="row deck">
        <div class="row-main">
          <div class="row-title">{d.deck.name}</div>
          <div class="row-sub">{d.path} · {d.stat.secure} sicher · {d.stat.learning} in Arbeit · {d.stat.new} neu</div>
          <div class="bar"><StatusBar stat={d.stat} height={6} /></div>
        </div>
      </div>
    {/each}
  </div>
  <div class="legend">
    <span><i class="secure"></i>sicher</span>
    <span><i class="learning"></i>in Arbeit</span>
    <span><i class="new"></i>neu</span>
  </div>
{/snippet}

<DayDetail bind:open={detailOpen} summary={selectedSummary} />

<style>
  .streak {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    margin-bottom: var(--space-3);
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
  }

  .sprout {
    flex: none;
    fill: var(--good-soft);
    stroke: var(--good);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .streak-value {
    font-family: var(--font-display);
    font-size: var(--fs-h2);
    font-weight: var(--fw-semibold);
    line-height: var(--lh-tight);
  }

  .streak-sub {
    font-size: var(--fs-caption);
    color: var(--text-2);
    margin-top: 2px;
  }

  .panel {
    padding: var(--space-4);
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
  }

  .heat-legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    margin-top: var(--space-3);
    font-size: var(--fs-micro);
    color: var(--text-2);
  }

  .heat-legend span {
    margin: 0 4px;
  }

  .heat-legend i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
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

  .note {
    font-size: var(--fs-caption);
    color: var(--text-2);
    margin-top: var(--space-3);
  }

  .note.center {
    text-align: center;
    padding: var(--space-5) 0;
    margin: 0;
  }

  .deck {
    align-items: center;
    padding-top: var(--space-3);
    padding-bottom: var(--space-3);
  }

  .bar {
    margin-top: var(--space-2);
  }

  .legend {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    margin-top: var(--space-3);
    font-size: var(--fs-caption);
    color: var(--text-2);
  }

  .legend i {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .legend i.secure {
    background: var(--status-secure);
  }

  .legend i.learning {
    background: var(--status-learning);
  }

  .legend i.new {
    background: var(--status-new);
  }
</style>
