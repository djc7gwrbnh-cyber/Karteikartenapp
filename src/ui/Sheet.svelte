<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Icon from './Icon.svelte';
  import { portal, trapFocus } from './actions';
  import { dur } from '../lib/motion';

  let {
    open = $bindable(false),
    title,
    onclose,
    action,
    cancelLabel = 'Abbrechen',
    children
  }: {
    open?: boolean;
    title: string;
    onclose?: () => void;
    /** Rechte Aktion im Kopf (z. B. „Sichern“). Dann erscheint links „Abbrechen“. */
    action?: Snippet;
    cancelLabel?: string;
    children: Snippet;
  } = $props();

  let dragY = $state(0);
  let startY = 0;
  let dragging = $state(false);

  function close() {
    open = false;
    onclose?.();
  }

  function down(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging = true;
    startY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function move(e: PointerEvent) {
    if (!dragging) return;
    dragY = Math.max(0, e.clientY - startY);
  }

  function up() {
    if (!dragging) return;
    dragging = false;
    if (dragY > 110) close();
    dragY = 0;
  }
</script>

{#if open}
  <div class="layer" use:portal>
    <div class="backdrop" transition:fade={{ duration: dur(200) }} onclick={close} aria-hidden="true"></div>
    <div
      class="sheet"
      class:dragging
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
      style:transform={dragY ? `translateY(${dragY}px)` : undefined}
      transition:fly={{ y: 500, duration: dur(320), easing: cubicOut, opacity: 1 }}
      use:trapFocus
      onkeydown={(e) => e.key === 'Escape' && close()}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="handle" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
        <div class="grabber"></div>
        <div class="head">
          <div class="side">
            {#if action}
              <button class="btn btn-quiet" onclick={close}>{cancelLabel}</button>
            {/if}
          </div>
          <h2>{title}</h2>
          <div class="side right">
            {#if action}
              {@render action()}
            {:else}
              <button class="close" onclick={close} aria-label="Schließen">
                <Icon name="close" size={18} stroke={2.2} />
              </button>
            {/if}
          </div>
        </div>
      </div>
      <div class="body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .layer {
    position: fixed;
    inset: 0;
    z-index: 100;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--backdrop);
  }

  .sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: var(--kb, 0px);
    max-width: 640px;
    margin: 0 auto;
    max-height: calc(100% - var(--kb, 0px) - var(--safe-top) - 16px);
    display: flex;
    flex-direction: column;
    background: var(--bg);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: var(--shadow-2);
    transition: transform var(--dur) var(--ease-out);
  }

  .sheet.dragging {
    transition: none;
  }

  .handle {
    touch-action: none;
    flex: none;
  }

  .grabber {
    width: 36px;
    height: 5px;
    border-radius: 3px;
    background: var(--line-strong);
    margin: 8px auto 0;
  }

  .head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3) var(--space-2);
    min-height: 52px;
  }

  .side {
    display: flex;
  }

  .side.right {
    justify-content: flex-end;
  }

  h2 {
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
    text-align: center;
  }

  .close {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    margin: 6px;
    border-radius: 50%;
    background: var(--surface-2);
    color: var(--text-2);
  }

  .close::after {
    content: '';
    position: absolute;
    width: var(--tap);
    height: var(--tap);
  }

  .body {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--space-2) var(--gutter) calc(var(--space-6) + var(--safe-bottom));
  }
</style>
