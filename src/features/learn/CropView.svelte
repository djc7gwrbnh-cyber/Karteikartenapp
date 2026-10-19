<script lang="ts">
  /*
   * Zuschneiden vor dem Speichern: Ecken ziehen, Ausschnitt verschieben, drehen.
   * Danach wird das Bild auf max. 1600 px verkleinert und komprimiert.
   */
  import { fade } from 'svelte/transition';
  import Icon from '../../ui/Icon.svelte';
  import { portal, trapFocus } from '../../ui/actions';
  import { clampRect, cropAndCompress, loadWorkingImage, rotate90, type Rect } from '../../lib/image/compress';
  import { dur } from '../../lib/motion';
  import { toast } from '../../ui/overlay.svelte';

  let {
    file,
    onconfirm,
    oncancel
  }: { file: Blob; onconfirm: (result: { blob: Blob; width: number; height: number }) => void; oncancel: () => void } = $props();

  let source = $state.raw<HTMLCanvasElement | null>(null);
  let crop = $state<Rect>({ x: 0, y: 0, w: 1, h: 1 });
  let stageW = $state(0);
  let stageH = $state(0);
  let busy = $state(false);

  $effect(() => {
    loadWorkingImage(file)
      .then((c) => {
        source = c;
        crop = { x: 0, y: 0, w: c.width, h: c.height };
      })
      .catch(() => {
        toast('Dieses Bild konnte nicht geöffnet werden.');
        oncancel();
      });
  });

  const PAD = 20;
  const scale = $derived(source ? Math.min((stageW - PAD * 2) / source.width, (stageH - PAD * 2) / source.height) : 1);
  const ox = $derived(source ? (stageW - source.width * scale) / 2 : 0);
  const oy = $derived(source ? (stageH - source.height * scale) / 2 : 0);

  function showCanvas(node: HTMLDivElement, canvas: HTMLCanvasElement | null) {
    const set = (c: HTMLCanvasElement | null) => {
      node.replaceChildren();
      if (c) node.appendChild(c);
    };
    set(canvas);
    return { update: set };
  }

  type Mode = 'move' | 'nw' | 'ne' | 'sw' | 'se';
  let drag: { mode: Mode; x: number; y: number; start: Rect; id: number } | null = null;

  function down(e: PointerEvent, mode: Mode) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag = { mode, x: e.clientX, y: e.clientY, start: { ...crop }, id: e.pointerId };
  }

  function move(e: PointerEvent) {
    if (!drag || !source || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.x) / scale;
    const dy = (e.clientY - drag.y) / scale;
    const s = drag.start;
    const min = 48 / scale;
    let r: Rect;
    if (drag.mode === 'move') {
      r = { ...s, x: s.x + dx, y: s.y + dy };
    } else {
      let { x, y } = s;
      let x2 = s.x + s.w;
      let y2 = s.y + s.h;
      if (drag.mode.includes('w')) x = Math.min(x2 - min, Math.max(0, s.x + dx));
      if (drag.mode.includes('e')) x2 = Math.max(x + min, Math.min(source.width, x2 + dx));
      if (drag.mode.includes('n')) y = Math.min(y2 - min, Math.max(0, s.y + dy));
      if (drag.mode.includes('s')) y2 = Math.max(y + min, Math.min(source.height, y2 + dy));
      r = { x, y, w: x2 - x, h: y2 - y };
    }
    crop = clampRect(r, source.width, source.height, min);
  }

  function up(e: PointerEvent) {
    if (drag && e.pointerId === drag.id) drag = null;
  }

  function rotate() {
    if (!source) return;
    const old = source;
    source = rotate90(old);
    // Zuschnitt mitdrehen
    crop = { x: old.height - crop.y - crop.h, y: crop.x, w: crop.h, h: crop.w };
  }

  function reset() {
    if (source) crop = { x: 0, y: 0, w: source.width, h: source.height };
  }

  async function confirm() {
    if (!source || busy) return;
    busy = true;
    try {
      onconfirm(await cropAndCompress(source, crop));
    } catch (e) {
      console.error(e);
      toast('Das Bild konnte nicht gespeichert werden.');
      busy = false;
    }
  }
</script>

<div
  class="crop"
  use:portal
  use:trapFocus
  role="dialog"
  aria-modal="true"
  aria-label="Bild zuschneiden"
  tabindex="-1"
  transition:fade={{ duration: dur(200) }}
  onkeydown={(e) => e.key === 'Escape' && oncancel()}
>
  <header>
    <button class="btn btn-quiet light" onclick={oncancel}>Abbrechen</button>
    <h2>Zuschneiden</h2>
    <button class="btn btn-quiet light strong" disabled={!source || busy} onclick={confirm}>{busy ? 'Moment …' : 'Fertig'}</button>
  </header>

  <div class="stage" bind:clientWidth={stageW} bind:clientHeight={stageH} onpointermove={move} onpointerup={up} onpointercancel={up} role="presentation">
    {#if source}
      <div
        class="image"
        style:left="{ox}px"
        style:top="{oy}px"
        style:width="{source.width * scale}px"
        style:height="{source.height * scale}px"
        use:showCanvas={source}
      ></div>
      <div
        class="box"
        style:left="{ox + crop.x * scale}px"
        style:top="{oy + crop.y * scale}px"
        style:width="{crop.w * scale}px"
        style:height="{crop.h * scale}px"
        onpointerdown={(e) => down(e, 'move')}
        role="presentation"
      >
        <span class="grid" aria-hidden="true"></span>
        {#each ['nw', 'ne', 'sw', 'se'] as const as corner (corner)}
          <span class="handle {corner}" onpointerdown={(e) => down(e, corner)} role="presentation"></span>
        {/each}
      </div>
    {:else}
      <div class="loading">Bild wird geladen …</div>
    {/if}
  </div>

  <footer>
    <button class="tool" onclick={rotate} disabled={!source}><Icon name="rotate" size={22} /> Drehen</button>
    <button class="tool" onclick={reset} disabled={!source}><Icon name="image" size={22} /> Ganzes Bild</button>
  </footer>
</div>

<style>
  .crop {
    position: fixed;
    inset: 0;
    z-index: 250;
    display: flex;
    flex-direction: column;
    background: #0f0e0d;
    color: #f4efe7;
    padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    padding: 0 var(--space-2);
  }

  h2 {
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
  }

  .light {
    color: #f4efe7;
  }

  .strong {
    color: #9fd0c4;
    font-weight: var(--fw-bold);
  }

  .stage {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    touch-action: none;
  }

  .image {
    position: absolute;
  }

  .image :global(canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .box {
    position: absolute;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
    outline: 1.5px solid rgba(255, 255, 255, 0.9);
    cursor: move;
    touch-action: none;
  }

  .grid {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.35) 33.33%, transparent calc(33.33% + 0.5px), transparent calc(66.66% - 0.5px), rgba(255, 255, 255, 0.35) 66.66%, transparent calc(66.66% + 0.5px)),
      linear-gradient(to bottom, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.35) 33.33%, transparent calc(33.33% + 0.5px), transparent calc(66.66% - 0.5px), rgba(255, 255, 255, 0.35) 66.66%, transparent calc(66.66% + 0.5px));
    pointer-events: none;
  }

  .handle {
    position: absolute;
    width: 44px;
    height: 44px;
    touch-action: none;
  }

  .handle::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3.5px solid #fff;
  }

  .nw {
    left: -22px;
    top: -22px;
    cursor: nwse-resize;
  }

  .nw::after {
    left: 19px;
    top: 19px;
    border-right: 0;
    border-bottom: 0;
  }

  .ne {
    right: -22px;
    top: -22px;
    cursor: nesw-resize;
  }

  .ne::after {
    right: 19px;
    top: 19px;
    border-left: 0;
    border-bottom: 0;
  }

  .sw {
    left: -22px;
    bottom: -22px;
    cursor: nesw-resize;
  }

  .sw::after {
    left: 19px;
    bottom: 19px;
    border-right: 0;
    border-top: 0;
  }

  .se {
    right: -22px;
    bottom: -22px;
    cursor: nwse-resize;
  }

  .se::after {
    right: 19px;
    bottom: 19px;
    border-left: 0;
    border-top: 0;
  }

  .loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.6);
  }

  footer {
    display: flex;
    justify-content: center;
    gap: var(--space-6);
    padding: var(--space-3) 0 var(--space-4);
  }

  .tool {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--tap);
    padding: 0 var(--space-4);
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.1);
    color: #f4efe7;
    font-size: var(--fs-small);
  }
</style>
