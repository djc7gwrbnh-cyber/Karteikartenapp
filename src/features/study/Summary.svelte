<script lang="ts">
  import { fly } from 'svelte/transition';
  import Donut from '../../ui/Donut.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { study, type FinishedSession } from './study.svelte';
  import { formatDuration } from '../../lib/dates';
  import { percent, plural } from '../../lib/text';
  import { comparison, doneMessage } from '../../lib/session/feedback';
  import { dur } from '../../lib/motion';
  import { haptic } from '../../lib/haptics';
  import { onMount } from 'svelte';

  let { result }: { result: FinishedSession } = $props();

  const r = $derived(result.record);
  const repeated = $derived(r.total - r.firstTry);
  const rate = $derived(percent(r.firstTry, r.total));
  const prevRate = $derived(result.previous ? percent(result.previous.firstTry, result.previous.total) : null);
  const message = $derived(doneMessage(r.total, r.firstTry, r.id));
  const compare = $derived(comparison(rate, prevRate));

  onMount(() => haptic('success'));
  // Kleine iPhones (z. B. SE): etwas kompakter, damit alles auf einen Blick passt
  const compact = typeof window !== 'undefined' && window.innerHeight < 720;
</script>

<div class="summary">
  <div class="scroll">
    <div class="content">
      <div class="head" in:fly={{ y: 12, duration: dur(400) }}>
        <div class="eyebrow">{result.title}</div>
        <h1>Geschafft!</h1>
        <p class="message">{message}</p>
      </div>

      <div class="chart" in:fly={{ y: 12, duration: dur(400), delay: dur(80) }}>
        <Donut
          size={compact ? 132 : 164}
          thickness={compact ? 16 : 18}
          segments={[
            { value: r.firstTry, color: 'var(--good)', label: 'Auf Anhieb gewusst' },
            { value: repeated, color: 'var(--warm)', label: 'Musste wiederholt werden' }
          ]}
        >
          {#snippet label()}
            <div class="rate tabular">{rate}<span>%</span></div>
            <div class="rate-label">auf Anhieb</div>
          {/snippet}
        </Donut>
        <div class="legend">
          <div><i style:background="var(--good)"></i>Auf Anhieb gewusst <b class="tabular">{r.firstTry}</b></div>
          <div><i style:background="var(--warm)"></i>Wiederholt <b class="tabular">{repeated}</b></div>
        </div>
      </div>

      <div class="tiles" in:fly={{ y: 12, duration: dur(400), delay: dur(160) }}>
        <div class="tile">
          <div class="value tabular">{r.total}</div>
          <div class="caption">{r.total === 1 ? 'Karte' : 'Karten'}</div>
        </div>
        <div class="tile">
          <div class="value tabular">{formatDuration(r.durationMs)}</div>
          <div class="caption">Dauer</div>
        </div>
        <div class="tile">
          <div class="value tabular">{rate} %</div>
          <div class="caption">Trefferquote</div>
        </div>
      </div>

      {#if compare}
        <p class="compare" in:fly={{ y: 12, duration: dur(400), delay: dur(220) }}>{compare}</p>
      {/if}
    </div>
  </div>

  <div class="actions">
    {#if result.missedItems.length}
      <button class="btn btn-large btn-block repeat" onclick={() => study.repeatMissed()}>
        <Icon name="repeat" size={20} /> Schwere Karten nochmal ({result.missedItems.length})
      </button>
    {/if}
    <button class="btn btn-primary btn-large btn-block" onclick={() => study.close()}>Fertig</button>
  </div>
</div>

<style>
  .summary {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
  }

  .scroll {
    flex: 1;
    overflow-y: auto;
  }

  .content {
    max-width: 480px;
    margin: 0 auto;
    padding: var(--space-6) var(--gutter) var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    text-align: center;
  }

  .eyebrow {
    font-size: var(--fs-caption);
    color: var(--text-2);
    font-weight: var(--fw-medium);
  }

  h1 {
    font-family: var(--font-display);
    font-size: var(--fs-hero);
    font-weight: var(--fw-semibold);
    line-height: var(--lh-tight);
    margin-top: var(--space-1);
  }

  .message {
    margin-top: var(--space-3);
    color: var(--text-2);
    font-size: var(--fs-body);
    max-width: 32ch;
  }

  .chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .rate {
    font-family: var(--font-display);
    font-size: 38px;
    font-weight: var(--fw-semibold);
    line-height: 1;
  }

  .rate span {
    font-size: 22px;
    margin-left: 2px;
    color: var(--text-2);
  }

  .rate-label {
    font-size: var(--fs-caption);
    color: var(--text-2);
    margin-top: 4px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2) var(--space-5);
    font-size: var(--fs-small);
    color: var(--text-2);
  }

  .legend i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .legend b {
    color: var(--text);
    margin-left: 4px;
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    width: 100%;
  }

  .tile {
    padding: var(--space-3) var(--space-2);
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
  }

  .value {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    white-space: nowrap;
  }

  .caption {
    font-size: var(--fs-caption);
    color: var(--text-2);
  }

  .compare {
    font-size: var(--fs-small);
    color: var(--text-2);
    max-width: 34ch;
  }

  .repeat {
    white-space: nowrap;
    font-size: var(--fs-small);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: var(--space-3) var(--gutter) var(--space-3);
  }
</style>
