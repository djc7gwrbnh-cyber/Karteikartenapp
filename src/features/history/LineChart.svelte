<script lang="ts">
  // Liniendiagramm der Trefferquote als SVG.
  import { formatDayShort } from '../../lib/dates';

  let { points }: { points: { day: string; rate: number }[] } = $props();

  const W = 340;
  const H = 150;
  const PAD = { top: 12, right: 8, bottom: 22, left: 30 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const coords = $derived(
    points.map((p, i) => ({
      x: PAD.left + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw),
      y: PAD.top + ih - (p.rate / 100) * ih,
      ...p
    }))
  );

  // Sanft geglättete Linie (Catmull-Rom → Bézier)
  const line = $derived.by(() => {
    if (coords.length < 2) return '';
    let d = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i - 1] ?? coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] ?? p2;
      const t = 0.18;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = Math.min(PAD.top + ih, Math.max(PAD.top, p1.y + (p2.y - p0.y) * t));
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = Math.min(PAD.top + ih, Math.max(PAD.top, p2.y - (p3.y - p1.y) * t));
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  });

  const area = $derived(line ? `${line} L${coords.at(-1)!.x},${PAD.top + ih} L${coords[0].x},${PAD.top + ih} Z` : '');
  const avg = $derived(points.length ? Math.round(points.reduce((n, p) => n + p.rate, 0) / points.length) : 0);
</script>

<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="Trefferquote der letzten {points.length} Lerntage, im Schnitt {avg} Prozent">
  <defs>
    <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--accent)" stop-opacity="0.22" />
      <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
    </linearGradient>
  </defs>
  {#each [0, 50, 100] as g (g)}
    {@const y = PAD.top + ih - (g / 100) * ih}
    <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} class="grid" />
    <text x={PAD.left - 6} y={y + 3} class="axis" text-anchor="end">{g} %</text>
  {/each}
  {#if area}<path d={area} fill="url(#rate-fill)" />{/if}
  {#if line}<path d={line} class="line" />{/if}
  {#each coords as c, i (c.day)}
    {#if i === coords.length - 1 || coords.length <= 12}
      <circle cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5} class="dot" />
    {/if}
  {/each}
  {#if coords.length}
    <text x={coords[0].x} y={H - 4} class="axis" text-anchor={coords.length === 1 ? 'middle' : 'start'}>{formatDayShort(coords[0].day)}</text>
    {#if coords.length > 1}
      <text x={coords.at(-1)!.x} y={H - 4} class="axis" text-anchor="end">{formatDayShort(coords.at(-1)!.day)}</text>
    {/if}
  {/if}
</svg>

<style>
  svg {
    display: block;
    overflow: visible;
  }

  .grid {
    stroke: var(--line-strong);
    stroke-width: 0.75;
    stroke-dasharray: 2 3;
  }

  .axis {
    font-size: 9px;
    fill: var(--text-2);
    font-family: var(--font-body);
  }

  .line {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .dot {
    fill: var(--bg-elev);
    stroke: var(--accent);
    stroke-width: 2;
  }
</style>
