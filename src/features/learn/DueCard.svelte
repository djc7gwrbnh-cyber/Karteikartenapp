<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import { library } from '../../app/library.svelte';
  import { study } from '../study/study.svelte';
  import { startAllDue } from '../study/start';
  import { router } from '../../app/router.svelte';

  const due = $derived(library.totalDue());
  const hasCards = $derived(library.deckStats.size > 0);
</script>

{#if study.active}
  <button class="due resume" onclick={() => router.go('/study')}>
    <div class="text">
      <div class="title">Sitzung fortsetzen</div>
      <div class="sub">„{study.active.title}“ wartet auf dich.</div>
    </div>
    <span class="go"><Icon name="play" size={20} /></span>
  </button>
{:else if hasCards}
  <div class="due" class:none={!due}>
    <div class="text">
      {#if due}
        <div class="title">Heute fällig: <span class="tabular">{due}</span> {due === 1 ? 'Karte' : 'Karten'}</div>
        <div class="sub">Aus allen Ordnern, in einem Rutsch.</div>
      {:else}
        <div class="title">Heute ist nichts fällig</div>
        <div class="sub">Alles im grünen Bereich. Lernen geht natürlich trotzdem.</div>
      {/if}
    </div>
    {#if due}
      <button class="btn btn-primary" onclick={startAllDue}>
        <Icon name="repeat" size={18} /> Wiederholen
      </button>
    {/if}
  </div>
{/if}

<style>
  .due {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-4);
    margin-bottom: var(--space-2);
    text-align: left;
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
  }

  .text {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-weight: var(--fw-semibold);
  }

  .sub {
    font-size: var(--fs-caption);
    color: var(--text-2);
    margin-top: 2px;
  }

  .due.none .title {
    color: var(--text-2);
    font-weight: var(--fw-medium);
  }

  .resume {
    background: var(--accent-soft);
    box-shadow: none;
  }

  .resume .title {
    color: var(--accent);
  }

  .go {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--on-accent);
  }
</style>
