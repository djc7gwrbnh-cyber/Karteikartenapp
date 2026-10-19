<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import Icon from '../../ui/Icon.svelte';
  import SideInput from './SideInput.svelte';
  import { library } from '../../app/library.svelte';
  import { router } from '../../app/router.svelte';
  import { db } from '../../lib/db/db';
  import { cardStatus, deleteCards, restoreSnapshot, snapshotCards, updateCardContent } from '../../lib/db/cards';
  import type { Card, Side } from '../../lib/db/types';
  import { formatDayLong } from '../../lib/dates';
  import { toast } from '../../ui/overlay.svelte';

  let { id }: { id: string } = $props();

  let card = $state<Card | null>(null);
  let loaded = $state(false);
  let front = $state<Side>({ text: '' });
  let back = $state<Side>({ text: '' });

  $effect(() => {
    db.cards.get(id).then((c) => {
      card = c ?? null;
      if (c) {
        front = { ...c.front };
        back = { ...c.back };
      }
      loaded = true;
    });
  });

  const deck = $derived(card ? library.deck(card.deckId) : undefined);
  const backPath = $derived(card ? `/deck/${card.deckId}` : '/');
  const hasContent = (s: Side) => s.text.trim().length > 0 || !!s.imageId;
  const valid = $derived(hasContent(front) && hasContent(back));
  const statusLabel = { new: 'Neu', learning: 'In Arbeit', secure: 'Sicher' };

  async function save() {
    if (!card || !valid) return;
    try {
      await updateCardContent(card.id, { ...front, text: front.text.trim() }, { ...back, text: back.text.trim() });
      router.back(backPath);
    } catch (e) {
      console.error(e);
      toast('Das hat leider nicht geklappt.');
    }
  }

  async function remove() {
    if (!card) return;
    const snap = await snapshotCards([card.id]);
    router.back(backPath);
    await deleteCards([card.id]);
    toast('Karte gelöscht', { label: 'Rückgängig', run: () => restoreSnapshot(snap) });
  }
</script>

{#if card}
  <Page title="Karte bearbeiten" eyebrow={deck?.name} back={backPath} backLabel={deck?.name ?? 'Zurück'}>
    {#snippet actions()}
      <button class="btn btn-quiet" disabled={!valid} onclick={save}>Sichern</button>
    {/snippet}

    <div class="composer">
      <SideInput bind:side={front} label="Vorderseite" multiline />
      <div class="divider"></div>
      <SideInput bind:side={back} label="Rückseite" multiline />
    </div>

    <div class="group info">
      <div class="row">
        <div class="row-main">Lernstand</div>
        <span class="row-value">{statusLabel[cardStatus(card)]}</span>
      </div>
      {#if card.lastStudied}
        <div class="row">
          <div class="row-main">Gewusst / nicht gewusst</div>
          <span class="row-value tabular">{card.correct} / {card.wrong}</span>
        </div>
        {#if card.due}
          <div class="row">
            <div class="row-main">Nächste Wiederholung</div>
            <span class="row-value">{formatDayLong(card.due)}</span>
          </div>
        {/if}
      {/if}
    </div>

    <button class="btn btn-danger btn-block delete" onclick={remove}>
      <Icon name="trash" size={20} /> Karte löschen
    </button>
  </Page>
{:else if loaded}
  <Page title="Nicht gefunden" back="/" backLabel="Lernen">
    <EmptyState illustration="search" title="Diese Karte ist nicht mehr da" />
  </Page>
{/if}

<style>
  .composer {
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
    padding: var(--space-2) 0;
  }

  .divider {
    border-top: 1px dashed var(--line-strong);
    margin: var(--space-1) var(--space-4);
  }

  .info {
    margin-top: var(--space-6);
  }

  .delete {
    margin-top: var(--space-6);
  }
</style>
