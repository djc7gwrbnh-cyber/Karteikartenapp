<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import CardFace from './CardFace.svelte';
  import StudyCard from './StudyCard.svelte';
  import { study, type ActiveSession } from './study.svelte';
  import { db } from '../../lib/db/db';
  import type { Card, Side } from '../../lib/db/types';
  import { progress } from '../../lib/session/queue';
  import type { StudyItem } from '../../lib/session/build';
  import { confirmDialog } from '../../ui/overlay.svelte';

  let { session }: { session: ActiveSession } = $props();

  let cards = $state.raw(new Map<string, Card>());
  let ready = $state(false);
  let flipped = $state(false);
  let cardRef = $state<StudyCard>();

  $effect(() => {
    const ids = [...new Set(session.items.map((i) => i.cardId))];
    db.cards.bulkGet(ids).then((list) => {
      const map = new Map<string, Card>();
      for (const c of list) if (c) map.set(c.id, c);
      study.prune(new Set(map.keys()));
      cards = map;
      ready = true;
    });
  });

  const itemByKey = $derived(new Map(session.items.map((i) => [i.key, i])));
  const currentItem = $derived(itemByKey.get(session.queue.pending[0]));
  const nextItem = $derived(itemByKey.get(session.queue.pending[1]));
  const p = $derived(progress(session.queue));

  function sides(item: StudyItem): { q: Side; a: Side; ql: string; al: string } | null {
    const card = cards.get(item.cardId);
    if (!card) return null;
    return item.reverse
      ? { q: card.back, a: card.front, ql: 'Rückseite', al: 'Vorderseite' }
      : { q: card.front, a: card.back, ql: 'Vorderseite', al: 'Rückseite' };
  }

  const current = $derived(currentItem ? sides(currentItem) : null);
  const next = $derived(nextItem ? sides(nextItem) : null);

  async function onanswer(knew: boolean) {
    flipped = false;
    await study.answer(knew);
  }

  async function undo() {
    flipped = false;
    await study.undo();
  }

  async function close() {
    if (session.history.length) {
      const ok = await confirmDialog({
        title: 'Sitzung beenden?',
        message: 'Was du bisher gelernt hast, bleibt gespeichert.',
        confirmLabel: 'Beenden',
        cancelLabel: 'Weiterlernen'
      });
      if (!ok) return;
    }
    study.abort();
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLElement && e.target.closest('[role="dialog"], [role="alertdialog"]')) return;
    if (e.key === 'ArrowRight') cardRef?.fling(true);
    else if (e.key === 'ArrowLeft') cardRef?.fling(false);
    else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      cardRef?.flip();
    } else if ((e.key === 'z' && (e.metaKey || e.ctrlKey)) || e.key === 'Backspace') undo();
    else if (e.key === 'Escape') close();
  }
</script>

<svelte:window {onkeydown} />

<div class="session">
  <header class="top">
    <button class="icon-btn" aria-label="Sitzung beenden" onclick={close}><Icon name="close" size={24} /></button>
    <div class="title">{session.title}</div>
    <button class="icon-btn" aria-label="Letzte Bewertung rückgängig machen" disabled={!study.canUndo} onclick={undo}>
      <Icon name="undo" size={24} />
    </button>
  </header>

  <div class="stage">
    {#if ready && currentItem && current}
      {#if next}
        <div class="card-under" aria-hidden="true">
          <CardFace side={next.q} label={next.ql} />
        </div>
      {/if}
      {#key currentItem.key}
        <div class="card-slot">
          <StudyCard
            bind:this={cardRef}
            bind:flipped
            question={current.q}
            answer={current.a}
            questionLabel={current.ql}
            answerLabel={current.al}
            {onanswer}
          />
        </div>
      {/key}
    {/if}
  </div>

  <div class="answers">
    <button class="answer bad" onclick={() => cardRef?.fling(false)}>
      <span class="circle"><Icon name="close" size={26} stroke={2.2} /></span>
      <span>Nochmal</span>
    </button>
    <button class="answer flip" onclick={() => cardRef?.flip()} aria-label="Karte umdrehen">
      <span class="circle small"><Icon name="flip" size={22} /></span>
    </button>
    <button class="answer good" onclick={() => cardRef?.fling(true)}>
      <span class="circle"><Icon name="check" size={28} stroke={2.2} /></span>
      <span>Gewusst</span>
    </button>
  </div>

  <footer class="progress" aria-live="polite">
    <div
      class="bar"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax={p.total}
      aria-valuenow={p.done}
      aria-label="Fortschritt"
    >
      <span style:width="{p.total ? (p.done / p.total) * 100 : 0}%"></span>
    </div>
    <div class="meta">
      <span class="tabular">{p.done} / {p.total}</span>
      {#if p.comingAgain}
        <span class="again">{p.comingAgain === 1 ? '1 Karte kommt nochmal' : `${p.comingAgain} Karten kommen nochmal`}</span>
      {/if}
    </div>
  </footer>
</div>

<style>
  .session {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: var(--safe-top) max(var(--safe-right), 0px) var(--safe-bottom) max(var(--safe-left), 0px);
    background: var(--bg);
    overflow: hidden;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-1) var(--space-2);
    min-height: 52px;
  }

  .top .icon-btn {
    color: var(--text-2);
  }

  .title {
    font-size: var(--fs-small);
    font-weight: var(--fw-semibold);
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 var(--space-2);
  }

  .stage {
    position: relative;
    flex: 1;
    min-height: 0;
    margin: var(--space-2) var(--gutter) var(--space-4);
  }

  .card-slot,
  .card-under {
    position: absolute;
    inset: 0;
    max-width: 520px;
    max-height: 640px;
    margin: auto;
  }

  .card-slot {
    z-index: 2;
    animation: rise 280ms var(--ease-out);
  }

  .card-under {
    z-index: 1;
    border-radius: var(--radius-xl);
    background: var(--bg-elev);
    box-shadow: var(--shadow-1);
    transform: translateY(12px) scale(0.95);
    opacity: 0.7;
    overflow: hidden;
    pointer-events: none;
  }

  .card-under :global(.body),
  .card-under :global(.label) {
    visibility: hidden;
  }

  @keyframes rise {
    from {
      transform: translateY(12px) scale(0.95);
      opacity: 0.7;
    }
  }

  .answers {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: var(--space-7);
    padding: 0 var(--gutter);
  }

  .answer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 72px;
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--text-2);
  }

  .circle {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--bg-elev);
    box-shadow: var(--shadow-1);
    transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast);
  }

  .circle.small {
    width: 48px;
    height: 48px;
    margin-top: 8px;
    color: var(--text-2);
  }

  .answer:active .circle {
    transform: scale(0.92);
  }

  .bad .circle {
    color: var(--bad);
  }

  .good .circle {
    color: var(--good);
  }

  .bad:active .circle {
    background: var(--bad-soft);
  }

  .good:active .circle {
    background: var(--good-soft);
  }

  .progress {
    padding: var(--space-4) calc(var(--gutter) + 8px) var(--space-3);
  }

  .bar {
    height: 4px;
    border-radius: 2px;
    background: var(--surface-3);
    overflow: hidden;
  }

  .bar span {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--accent);
    transition: width 420ms var(--ease-out);
  }

  .meta {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-2);
    font-size: var(--fs-caption);
    color: var(--text-2);
  }

  .again {
    color: var(--text-3);
  }
</style>
