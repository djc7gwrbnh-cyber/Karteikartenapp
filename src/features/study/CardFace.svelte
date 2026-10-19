<script lang="ts">
  import BlobImage from '../../ui/BlobImage.svelte';
  import type { Side } from '../../lib/db/types';

  let { side, label, hint }: { side: Side; label: string; hint?: string } = $props();

  // Kurze Texte groß, lange Texte kleiner – bleibt immer gut lesbar.
  const size = $derived.by(() => {
    const n = side.text.length + (side.imageId ? 60 : 0);
    if (n <= 24) return 30;
    if (n <= 60) return 25;
    if (n <= 140) return 21;
    if (n <= 280) return 18;
    return 16;
  });
</script>

<div class="face-inner">
  <div class="label">{label}</div>
  <div class="body">
    {#if side.imageId}
      <div class="image"><BlobImage id={side.imageId} alt={side.text ? '' : label} /></div>
    {/if}
    {#if side.text}
      <p class="text" style:font-size="{size}px">{side.text}</p>
    {/if}
  </div>
  {#if hint}<div class="hint">{hint}</div>{/if}
</div>

<style>
  .face-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: var(--space-5) var(--space-5) var(--space-4);
  }

  .label {
    flex: none;
    font-size: var(--fs-micro);
    font-weight: var(--fw-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
    padding-bottom: var(--space-3);
    border-bottom: 1.5px solid color-mix(in srgb, var(--bad) 55%, transparent);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    justify-content: safe center;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  .image {
    display: flex;
    justify-content: center;
    min-height: 0;
    max-height: 62%;
    flex: 0 1 auto;
  }

  .image :global(img) {
    max-height: 100%;
  }

  .text {
    font-family: var(--font-display);
    line-height: 1.35;
    text-align: center;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    color: var(--text);
  }

  .hint {
    flex: none;
    text-align: center;
    font-size: var(--fs-caption);
    color: var(--text-3);
  }
</style>
