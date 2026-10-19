<script lang="ts">
  import { fade } from 'svelte/transition';
  import { library } from '../../app/library.svelte';
  import { live } from '../../lib/live.svelte';
  import { db } from '../../lib/db/db';
  import { messageOfDay } from '../../lib/messages';
  import { dur } from '../../lib/motion';
  import { haptic } from '../../lib/haptics';

  const custom = live(
    () => undefined,
    () => db.messages.orderBy('createdAt').toArray(),
    []
  );
  let step = $state(0);
  const text = $derived(custom.loaded ? messageOfDay(library.today, custom.value.map((m) => m.text), step) : '');

  function next() {
    step++;
    haptic('light');
  }
</script>

{#if text}
  <button class="motivation" onclick={next} aria-label="{text} – Tippen für die nächste Nachricht">
    <span class="quote" aria-hidden="true">“</span>
    {#key text}
      <p in:fade={{ duration: dur(260) }}>{text}</p>
    {/key}
  </button>
{/if}

<style>
  .motivation {
    position: relative;
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    width: 100%;
    padding: var(--space-4) var(--space-5) var(--space-4) var(--space-4);
    margin-bottom: var(--space-3);
    text-align: left;
    border-radius: var(--radius-l);
    background: linear-gradient(135deg, var(--accent-soft), transparent 80%), var(--bg-elev);
    box-shadow: var(--shadow-1);
    transition: transform var(--dur-fast) var(--ease-out);
  }

  .motivation:active {
    transform: scale(0.985);
  }

  .quote {
    flex: none;
    font-family: var(--font-display);
    font-size: 44px;
    line-height: 0.9;
    color: var(--accent);
    opacity: 0.5;
    margin-top: 2px;
  }

  p {
    font-family: var(--font-display);
    font-size: var(--fs-h3);
    line-height: var(--lh-snug);
    color: var(--text);
    min-height: 1.35em;
  }
</style>
