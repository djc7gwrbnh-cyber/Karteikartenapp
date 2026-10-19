<script lang="ts" generics="T extends { id: string }">
  /*
   * Sortierbare Liste für Touch: Ziehen am Griff (Pointer Events, kein HTML5-Drag&Drop,
   * das auf iOS unzuverlässig ist). Tastatur: Griff fokussieren, Pfeil hoch/runter.
   */
  import { getContext, type Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import { haptic } from '../lib/haptics';

  let {
    items,
    row,
    onreorder,
    label = (item: T) => item.id
  }: {
    items: T[];
    row: Snippet<[T]>;
    onreorder: (ids: string[]) => void;
    label?: (item: T) => string;
  } = $props();

  const getScroller = getContext<(() => HTMLElement) | undefined>('scroller');

  let rows: HTMLElement[] = $state([]);
  let dragIndex = $state(-1);
  let targetIndex = $state(-1);
  let dy = $state(0);
  let heights: number[] = [];
  let tops: number[] = [];
  let startY = 0;
  let pointerY = 0;
  let startScroll = 0;
  let frame = 0;

  function scroller() {
    return getScroller?.();
  }

  function begin(e: PointerEvent, index: number) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    heights = rows.map((r) => r.getBoundingClientRect().height);
    tops = rows.map((r) => r.getBoundingClientRect().top);
    dragIndex = index;
    targetIndex = index;
    startY = pointerY = e.clientY;
    startScroll = scroller()?.scrollTop ?? 0;
    dy = 0;
    haptic('light');
    frame = requestAnimationFrame(tick);
  }

  function update() {
    const scrollDelta = (scroller()?.scrollTop ?? 0) - startScroll;
    dy = pointerY - startY + scrollDelta;
    const center = tops[dragIndex] + heights[dragIndex] / 2 + dy;
    let target = 0;
    for (let i = 0; i < tops.length; i++) {
      if (i === dragIndex) continue;
      const mid = tops[i] + heights[i] / 2;
      if (center > mid) target++;
    }
    if (target !== targetIndex) {
      targetIndex = target;
      haptic('light');
    }
  }

  function tick() {
    const el = scroller();
    if (el && dragIndex >= 0) {
      const rect = el.getBoundingClientRect();
      const edge = 70;
      if (pointerY < rect.top + edge) el.scrollTop -= Math.ceil((rect.top + edge - pointerY) / 8);
      else if (pointerY > rect.bottom - edge - 60) el.scrollTop += Math.ceil((pointerY - (rect.bottom - edge - 60)) / 8);
      update();
      frame = requestAnimationFrame(tick);
    }
  }

  function moveTo(e: PointerEvent) {
    if (dragIndex < 0) return;
    pointerY = e.clientY;
    update();
  }

  function end() {
    if (dragIndex < 0) return;
    cancelAnimationFrame(frame);
    if (targetIndex !== dragIndex) commit(dragIndex, targetIndex);
    dragIndex = -1;
    targetIndex = -1;
    dy = 0;
  }

  function commit(from: number, to: number) {
    const ids = items.map((i) => i.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    onreorder(ids);
  }

  function offset(i: number): number {
    if (dragIndex < 0) return 0;
    if (i === dragIndex) return dy;
    const h = heights[dragIndex] ?? 0;
    if (dragIndex < targetIndex && i > dragIndex && i <= targetIndex) return -h;
    if (dragIndex > targetIndex && i >= targetIndex && i < dragIndex) return h;
    return 0;
  }

  function onKey(e: KeyboardEvent, index: number) {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      commit(index, index - 1);
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      commit(index, index + 1);
    }
  }
</script>

<div class="group sortable">
  {#each items as item, i (item.id)}
    <div
      class="item row"
      class:dragging={i === dragIndex}
      class:settling={dragIndex >= 0 && i !== dragIndex}
      bind:this={rows[i]}
      style:transform={offset(i) ? `translateY(${offset(i)}px)` : undefined}
    >
      <div class="content">{@render row(item)}</div>
      <button
        class="handle"
        aria-label="{label(item)} verschieben (Pfeiltasten hoch oder runter)"
        onpointerdown={(e) => begin(e, i)}
        onpointermove={moveTo}
        onpointerup={end}
        onpointercancel={end}
        onkeydown={(e) => onKey(e, i)}
      >
        <Icon name="grip" size={22} stroke={2} />
      </button>
    </div>
  {/each}
</div>

<style>
  .sortable {
    overflow: visible;
  }

  .item {
    padding-right: 0;
    background: var(--bg-elev);
  }

  .item:first-child {
    border-radius: var(--radius-l) var(--radius-l) 0 0;
  }

  .item:last-child {
    border-radius: 0 0 var(--radius-l) var(--radius-l);
  }

  .item:only-child {
    border-radius: var(--radius-l);
  }

  .item.settling {
    transition: transform var(--dur) var(--ease-out);
  }

  .item.dragging {
    z-index: 5;
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-2);
    transform-origin: center;
  }

  .item.dragging::before,
  .item.dragging + .item::before {
    display: none;
  }

  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .handle {
    display: grid;
    place-items: center;
    width: 52px;
    align-self: stretch;
    min-height: var(--tap);
    color: var(--text-3);
    touch-action: none;
    cursor: grab;
  }

  .dragging .handle {
    color: var(--accent);
    cursor: grabbing;
  }
</style>
