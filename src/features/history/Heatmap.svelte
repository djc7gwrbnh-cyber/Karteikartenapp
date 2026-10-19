<script lang="ts">
  // Kalender-Heatmap als SVG: je dunkler, desto mehr gelernt.
  import type { HeatCell } from '../../lib/stats/history';
  import { formatDayShort, monthsShort, parseDay } from '../../lib/dates';

  let { cells, weeks, selected, onselect }: { cells: HeatCell[]; weeks: number; selected?: string | null; onselect: (day: string) => void } =
    $props();

  const CELL = 14;
  const GAP = 3;
  const LEFT = 22;
  const TOP = 16;
  const step = CELL + GAP;
  const width = $derived(LEFT + weeks * step - GAP);
  const height = TOP + 7 * step - GAP;

  const months = $derived.by(() => {
    const out: { x: number; label: string }[] = [];
    let last = -1;
    for (const c of cells) {
      if (c.weekday !== 0) continue;
      const m = parseDay(c.day).getMonth();
      if (m !== last) {
        if (last !== -1 || c.week === 0) out.push({ x: LEFT + c.week * step, label: monthsShort[m] });
        last = m;
      }
    }
    // Erste Beschriftung weglassen, wenn sie direkt mit der zweiten kollidiert
    return out.filter((m, i) => !(i === 0 && out[1] && out[1].x - m.x < 3 * step));
  });

  let svg: SVGSVGElement;

  // Kleine Zellen sind schwer zu treffen: der Tipp wählt die nächstgelegene Zelle mit Daten.
  function onclick(e: MouseEvent) {
    const rect = svg.getBoundingClientRect();
    const scale = width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    let best: HeatCell | null = null;
    let bestDist = Infinity;
    for (const c of cells) {
      if (!c.total) continue;
      const cx = LEFT + c.week * step + CELL / 2;
      const cy = TOP + c.weekday * step + CELL / 2;
      const d = Math.hypot(cx - x, cy - y);
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }
    if (best && bestDist < step * 2) onselect(best.day);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<svg bind:this={svg} viewBox="0 0 {width} {height}" width="100%" role="img" aria-label="Lernkalender der letzten {weeks} Wochen" {onclick}>
  {#each months as m (m.x)}
    <text x={m.x} y={10} class="month">{m.label}</text>
  {/each}
  {#each ['Mo', 'Mi', 'Fr'] as d, i (d)}
    <text x={0} y={TOP + i * 2 * step + CELL - 3} class="weekday">{d}</text>
  {/each}
  {#each cells as c (c.day)}
    {#if !c.future}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <rect
        x={LEFT + c.week * step}
        y={TOP + c.weekday * step}
        width={CELL}
        height={CELL}
        rx="3.5"
        class="cell l{c.level}"
        class:selected={selected === c.day}
        role={c.total ? 'button' : undefined}
        tabindex={c.total ? 0 : undefined}
        aria-label={c.total ? `${formatDayShort(c.day)}: ${c.total} Karten` : undefined}
        aria-hidden={c.total ? undefined : 'true'}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onselect(c.day)}
      />
    {/if}
  {/each}
</svg>

<style>
  svg {
    display: block;
    overflow: visible;
    -webkit-user-select: none;
    user-select: none;
  }

  text {
    font-size: 9px;
    fill: var(--text-2);
    font-family: var(--font-body);
  }

  .cell {
    transition: fill var(--dur);
  }

  .l0 {
    fill: var(--heat-0);
  }

  .l1 {
    fill: var(--heat-1);
  }

  .l2 {
    fill: var(--heat-2);
  }

  .l3 {
    fill: var(--heat-3);
  }

  .l4 {
    fill: var(--heat-4);
  }

  .cell[role='button'] {
    cursor: pointer;
  }

  .selected {
    stroke: var(--text);
    stroke-width: 1.5;
  }

  .cell:focus-visible {
    outline: none;
    stroke: var(--accent);
    stroke-width: 2;
  }
</style>
