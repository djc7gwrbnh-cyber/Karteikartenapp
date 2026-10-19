<script lang="ts">
  /*
   * Die Lernkarte: Tippen dreht um, Wischen nach rechts = gewusst, nach links = nicht gewusst.
   * Die Karte folgt dem Finger, neigt sich leicht und zeigt ein dezentes Farbsignal.
   */
  import CardFace from './CardFace.svelte';
  import type { Side } from '../../lib/db/types';
  import { haptic } from '../../lib/haptics';
  import { reducedMotion } from '../../lib/motion';

  let {
    question,
    answer,
    questionLabel,
    answerLabel,
    flipped = $bindable(false),
    onanswer
  }: {
    question: Side;
    answer: Side;
    questionLabel: string;
    answerLabel: string;
    flipped?: boolean;
    onanswer: (knew: boolean) => void;
  } = $props();

  let el: HTMLDivElement;
  let x = $state(0);
  let y = $state(0);
  let dragging = $state(false);
  let leaving = $state(false);
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let crossed = false;

  const width = () => el?.offsetWidth || 320;
  const threshold = () => Math.min(120, width() * 0.3);

  // Stärke des Farbsignals (−1 … 1)
  const signal = $derived(Math.max(-1, Math.min(1, x / threshold())));
  const rotation = $derived((x / width()) * 10);

  function down(e: PointerEvent) {
    if (leaving || pointerId !== null) return;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    startY = e.clientY;
    lastT = e.timeStamp;
    moved = false;
    crossed = false;
    velocity = 0;
  }

  function move(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) > 8) {
      moved = true;
      dragging = true;
      el.setPointerCapture(e.pointerId);
    }
    if (!moved) return;
    const dt = e.timeStamp - lastT;
    if (dt > 0) velocity = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastT = e.timeStamp;
    x = dx;
    y = dy * 0.25;
    const over = Math.abs(dx) > threshold();
    if (over !== crossed) {
      crossed = over;
      if (over) haptic('light');
    }
  }

  function up(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    dragging = false;
    if (!moved) {
      flip();
      return;
    }
    const fast = Math.abs(velocity) > 0.6 && Math.abs(x) > 30;
    if (Math.abs(x) > threshold() || fast) {
      fling(x > 0);
    } else {
      // federt zurück
      x = 0;
      y = 0;
    }
  }

  function cancel(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    dragging = false;
    x = 0;
    y = 0;
  }

  export function flip() {
    if (leaving) return;
    flipped = !flipped;
    haptic('light');
  }

  /** Karte hinausfliegen lassen und danach bewerten (auch für die Buttons). */
  export function fling(knew: boolean) {
    if (leaving) return;
    leaving = true;
    haptic(knew ? 'success' : 'light');
    if (reducedMotion()) {
      onanswer(knew);
      return;
    }
    const dir = knew ? 1 : -1;
    x = dir * (width() * 1.3 + 80);
    y = y + 30;
    setTimeout(() => onanswer(knew), 240);
  }
</script>

<div
  bind:this={el}
  class="card"
  class:dragging
  class:leaving
  role="button"
  tabindex="0"
  aria-label={flipped ? `${answerLabel}. Tippen zum Zurückdrehen` : `${questionLabel}. Tippen zum Umdrehen`}
  style:transform="translate3d({x}px, {y}px, 0) rotate({rotation}deg)"
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={cancel}
  onkeydown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      flip();
    }
  }}
>
  <div class="inner" class:flipped>
    <div class="face front" aria-hidden={flipped}>
      <CardFace side={question} label={questionLabel} hint="Tippen zum Umdrehen" />
    </div>
    <div class="face back" aria-hidden={!flipped}>
      <CardFace side={answer} label={answerLabel} />
    </div>
  </div>
  <div class="tint good" style:opacity={Math.max(0, signal) * 0.9} aria-hidden="true">
    <span>Gewusst</span>
  </div>
  <div class="tint bad" style:opacity={Math.max(0, -signal) * 0.9} aria-hidden="true">
    <span>Nochmal</span>
  </div>
</div>

<style>
  .card {
    position: relative;
    width: 100%;
    height: 100%;
    touch-action: pan-y;
    cursor: grab;
    perspective: 1400px;
    transition: transform 380ms var(--ease-spring);
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  .card.dragging {
    transition: none;
    cursor: grabbing;
  }

  .card.leaving {
    transition: transform 260ms var(--ease-in-out);
  }

  .card:focus-visible {
    outline: none;
  }

  .card:focus-visible .face {
    box-shadow: var(--shadow-card), 0 0 0 3px var(--accent);
  }

  .inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform var(--dur-flip) var(--ease-in-out);
  }

  .inner.flipped {
    transform: rotateY(180deg);
  }

  .face {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-xl);
    background: var(--bg-elev);
    box-shadow: var(--shadow-card);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
  }

  .face.back {
    transform: rotateY(180deg);
  }

  .tint {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-xl);
    pointer-events: none;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: var(--space-6);
  }

  .tint span {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: var(--fs-caption);
    font-weight: var(--fw-bold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-elev);
  }

  .tint.good {
    background: var(--good-soft);
    box-shadow: inset 0 0 0 2px var(--good);
  }

  .tint.good span {
    color: var(--good);
  }

  .tint.bad {
    background: var(--bad-soft);
    box-shadow: inset 0 0 0 2px var(--bad);
  }

  .tint.bad span {
    color: var(--bad);
  }

  @media (prefers-reduced-motion: reduce) {
    .inner.flipped {
      transform: none;
    }

    .face.back {
      transform: none;
      opacity: 0;
    }

    .inner.flipped .face.back {
      opacity: 1;
    }

    .inner.flipped .face.front {
      opacity: 0;
    }
  }
</style>
