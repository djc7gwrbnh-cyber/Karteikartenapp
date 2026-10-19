<script lang="ts">
  import { pictogram } from '../content/pictograms';

  let { id, size = 24, stroke = 1.7 }: { id: string; size?: number; stroke?: number } = $props();
  const p = $derived(pictogram(id));
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false">{@html p.svg}</svg>

<style>
  svg {
    display: block;
    flex: none;
  }
</style>
