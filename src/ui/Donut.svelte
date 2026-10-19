<script lang="ts">
  // Kuchendiagramm (Ring) als reines SVG, keine Chart-Library.
  import { onMount } from 'svelte';
  import { reducedMotion } from '../lib/motion';

  let {
    segments,
    size = 180,
    thickness = 18,
    label
  }: { segments: { value: number; color: string; label: string }[]; size?: number; thickness?: number; label?: import('svelte').Snippet } = $props();

  const r = $derived((size - thickness) / 2);
  const c = $derived(2 * Math.PI * r);
  const total = $derived(segments.reduce((n, s) => n + s.value, 0) || 1);
  const visible = $derived(segments.filter((s) => s.value > 0));
  const gap = $derived(visible.length > 1 ? Math.min(6, c * 0.015) : 0);

  let grown = $state(reducedMotion());
  onMount(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => (grown = true)));
  });

  const arcs = $derived.by(() => {
    let offset = 0;
    return visible.map((s) => {
      const len = (s.value / total) * c;
      const arc = { color: s.color, dash: Math.max(0, len - gap), offset };
      offset += len;
      return arc;
    });
  });
</script>

<div class="donut" style:width="{size}px" style:height="{size}px">
  <svg width={size} height={size} viewBox="0 0 {size} {size}" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}>
    <circle cx={size / 2} cy={size / 2} {r} fill="none" stroke="var(--surface-2)" stroke-width={thickness} />
    <g transform="rotate(-90 {size / 2} {size / 2})">
      {#each arcs as a, i (i)}
        <circle
          cx={size / 2}
          cy={size / 2}
          {r}
          fill="none"
          stroke={a.color}
          stroke-width={thickness}
          stroke-linecap={visible.length > 1 ? 'butt' : 'round'}
          stroke-dasharray="{grown ? a.dash : 0} {c}"
          stroke-dashoffset={-a.offset}
          class="arc"
        />
      {/each}
    </g>
  </svg>
  {#if label}<div class="center">{@render label()}</div>{/if}
</div>

<style>
  .donut {
    position: relative;
    flex: none;
  }

  .arc {
    transition: stroke-dasharray 900ms var(--ease-out);
  }

  .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
