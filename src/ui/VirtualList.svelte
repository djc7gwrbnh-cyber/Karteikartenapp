<script lang="ts" generics="T">
  /*
   * Virtualisierte Liste mit fester Zeilenhöhe: rendert nur sichtbare Zeilen,
   * damit auch Stapel mit tausenden Karten flüssig scrollen.
   */
  import { getContext, type Snippet } from 'svelte';

  let {
    items,
    rowHeight,
    key,
    row,
    overscan = 8
  }: { items: T[]; rowHeight: number; key: (item: T) => string; row: Snippet<[T, number]>; overscan?: number } = $props();

  const getScroller = getContext<() => HTMLElement>('scroller');
  let container: HTMLDivElement;
  let start = $state(0);
  let end = $state(30);

  function update() {
    const scroller = getScroller?.();
    if (!scroller || !container) return;
    const top = container.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const first = Math.floor(Math.max(0, -top) / rowHeight);
    const visible = Math.ceil(scroller.clientHeight / rowHeight);
    start = Math.max(0, first - overscan);
    end = Math.min(items.length, first + visible + overscan);
  }

  $effect(() => {
    void items.length;
    const scroller = getScroller?.();
    update();
    scroller?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  });

  const visibleItems = $derived(items.slice(start, end));
</script>

<div class="vlist" bind:this={container} style:height="{items.length * rowHeight}px" role="list">
  {#each visibleItems as item, i (key(item))}
    <div
      class="vrow"
      class:first={start + i === 0}
      role="listitem"
      style:height="{rowHeight}px"
      style:transform="translateY({(start + i) * rowHeight}px)"
    >
      {@render row(item, start + i)}
    </div>
  {/each}
</div>

<style>
  .vlist {
    position: relative;
  }

  .vrow {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    display: flex;
  }

  .vrow:not(.first)::before {
    content: '';
    position: absolute;
    top: 0;
    left: var(--row-inset, var(--space-4));
    right: 0;
    border-top: 0.5px solid var(--line-strong);
    z-index: 1;
  }
</style>
