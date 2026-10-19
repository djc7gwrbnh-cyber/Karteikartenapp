<script lang="ts">
  /*
   * Schnelleingabe: Vorderseite → Enter → Rückseite → Enter → nächste Karte.
   * Der Fokus springt synchron zurück, damit die iOS-Tastatur offen bleibt.
   */
  import { fly } from 'svelte/transition';
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import SideInput from './SideInput.svelte';
  import { library } from '../../app/library.svelte';
  import { router } from '../../app/router.svelte';
  import { addCard } from '../../lib/db/cards';
  import type { Side } from '../../lib/db/types';
  import { haptic } from '../../lib/haptics';
  import { toast } from '../../ui/overlay.svelte';
  import { plural } from '../../lib/text';
  import { dur } from '../../lib/motion';

  let { deckId }: { deckId: string } = $props();
  const deck = $derived(library.deck(deckId));

  let front = $state<Side>({ text: '' });
  let back = $state<Side>({ text: '' });
  let frontInput = $state<SideInput>();
  let backInput = $state<SideInput>();
  let added = $state<{ id: string; front: string; back: string }[]>([]);
  let saving = false;

  const hasContent = (s: Side) => s.text.trim().length > 0 || !!s.imageId;
  const valid = $derived(hasContent(front) && hasContent(back));

  function submit() {
    if (saving) return;
    if (!hasContent(front)) {
      frontInput?.focus();
      return;
    }
    if (!hasContent(back)) {
      backInput?.focus();
      return;
    }
    const f: Side = { ...front, text: front.text.trim() };
    const b: Side = { ...back, text: back.text.trim() };
    front = { text: '' };
    back = { text: '' };
    // Synchron fokussieren, solange wir noch in der Nutzergeste sind.
    frontInput?.focus();
    saving = true;
    addCard(deckId, f, b)
      .then((id) => {
        haptic('light');
        added = [{ id, front: f.text || 'Bild', back: b.text || 'Bild' }, ...added];
      })
      .catch((e) => {
        console.error(e);
        front = f;
        back = b;
        toast('Die Karte konnte nicht gespeichert werden.');
      })
      .finally(() => (saving = false));
  }
</script>

{#if deck}
  <Page title="Neue Karten" back={`/deck/${deckId}`} backLabel={deck.name}>
    {#snippet actions()}
      <button class="btn btn-quiet" onclick={() => router.back(`/deck/${deckId}`)}>Fertig</button>
    {/snippet}

    <div class="composer">
      <SideInput
        bind:this={frontInput}
        bind:side={front}
        label="Vorderseite"
        placeholder="Frage oder Begriff"
        autofocus
        onenter={() => (hasContent(front) ? backInput?.focus() : null)}
      />
      <div class="divider"></div>
      <SideInput bind:this={backInput} bind:side={back} label="Rückseite" placeholder="Antwort" onenter={submit} />
    </div>

    <button
      class="btn btn-primary btn-block btn-large add"
      disabled={!valid}
      onpointerdown={(e) => e.preventDefault()}
      onclick={submit}
    >
      Karte hinzufügen
    </button>

    <p class="counter" aria-live="polite">
      {#if added.length}
        {plural(added.length, 'Karte', 'Karten')} in dieser Sitzung angelegt
      {:else}
        Tipp: Mit der Eingabetaste springst du zum nächsten Feld.
      {/if}
    </p>

    {#if added.length}
      <div class="group recent">
        {#each added.slice(0, 5) as a (a.id)}
          <button class="row" in:fly={{ y: -8, duration: dur(220) }} onclick={() => router.go(`/card/${a.id}`)}>
            <div class="row-main">
              <div class="row-title">{a.front}</div>
              <div class="row-sub">{a.back}</div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </Page>
{:else if library.loaded}
  <Page title="Nicht gefunden" back="/" backLabel="Lernen">
    <EmptyState illustration="search" title="Dieser Stapel ist nicht mehr da" />
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
    height: 0;
    border-top: 1px dashed var(--line-strong);
    margin: var(--space-1) var(--space-4);
  }

  .add {
    margin-top: var(--space-4);
  }

  .counter {
    text-align: center;
    color: var(--text-2);
    font-size: var(--fs-caption);
    margin: var(--space-3) 0 var(--space-5);
  }

  .recent {
    opacity: 0.85;
  }
</style>
