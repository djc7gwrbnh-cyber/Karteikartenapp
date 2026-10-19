<script lang="ts">
  import type { Snippet } from 'svelte';
  import Illustration, { type IllustrationName } from './Illustration.svelte';

  let {
    illustration,
    title,
    text,
    children
  }: { illustration: IllustrationName; title: string; text?: string; children?: Snippet } = $props();
</script>

<div class="empty">
  <Illustration name={illustration} />
  <h2>{title}</h2>
  {#if text}<p>{text}</p>{/if}
  {#if children}<div class="actions">{@render children()}</div>{/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-7) var(--space-5) var(--space-6);
    gap: var(--space-2);
  }

  h2 {
    margin-top: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
  }

  p {
    max-width: 30ch;
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .actions {
    margin-top: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-items: center;
  }
</style>
