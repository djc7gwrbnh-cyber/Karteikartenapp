<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, children }: { title: string; children?: Snippet } = $props();
</script>

<div class="section-header">
  <h2>{title}</h2>
  {#if children}<div class="tools">{@render children()}</div>{/if}
</div>

<style>
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin: var(--space-6) 0 var(--space-2);
    padding-left: var(--space-1);
    min-height: var(--tap);
  }

  h2 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
  }

  .tools {
    display: flex;
    align-items: center;
    margin-right: -10px;
  }
</style>
