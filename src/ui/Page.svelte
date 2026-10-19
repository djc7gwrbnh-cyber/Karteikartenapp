<script lang="ts" module>
  // Scrollposition je Pfad merken, damit "Zurück" an derselben Stelle landet.
  const scrollMemory = new Map<string, number>();
</script>

<script lang="ts">
  import { onMount, setContext, type Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import { router } from '../app/router.svelte';

  let {
    title,
    eyebrow,
    back,
    backLabel = 'Zurück',
    hideLargeTitle = false,
    actions,
    header,
    children
  }: {
    title: string;
    eyebrow?: string;
    back?: string;
    backLabel?: string;
    hideLargeTitle?: boolean;
    actions?: Snippet;
    header?: Snippet;
    children: Snippet;
  } = $props();

  let scroller: HTMLDivElement;
  let scrolled = $state(false);
  const memoryKey = router.route.path;

  setContext('scroller', () => scroller);

  function onScroll() {
    scrolled = scroller.scrollTop > 36;
  }

  onMount(() => {
    const saved = scrollMemory.get(memoryKey);
    if (saved) {
      requestAnimationFrame(() => {
        scroller.scrollTop = saved;
        onScroll();
      });
    }
    return () => scrollMemory.set(memoryKey, scroller.scrollTop);
  });
</script>

<div class="page">
  <header class="bar" class:scrolled class:always={hideLargeTitle}>
    <div class="bar-side">
      {#if back}
        <button class="back" onclick={() => router.back(back)}>
          <Icon name="back" size={24} stroke={2.1} />
          <span>{backLabel}</span>
        </button>
      {/if}
    </div>
    <div class="bar-title" aria-hidden={!hideLargeTitle}>{title}</div>
    <div class="bar-side right">
      {@render actions?.()}
    </div>
  </header>

  <div class="scroll" bind:this={scroller} onscroll={onScroll}>
    <div class="content">
      {#if !hideLargeTitle}
        <div class="title-block">
          {#if eyebrow}<div class="eyebrow">{eyebrow}</div>{/if}
          <h1 class="large-title">{title}</h1>
        </div>
      {/if}
      {@render header?.()}
      {@render children()}
    </div>
  </div>
</div>

<style>
  .page {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .bar {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--space-2);
    padding: var(--safe-top) max(var(--safe-right), 6px) 0 max(var(--safe-left), 6px);
    height: calc(var(--safe-top) + 52px);
    background: transparent;
    border-bottom: 0.5px solid transparent;
    transition:
      background var(--dur) var(--ease-out),
      border-color var(--dur) var(--ease-out);
  }

  .bar.scrolled,
  .bar.always {
    background: var(--bar-bg);
    -webkit-backdrop-filter: saturate(1.6) blur(20px);
    backdrop-filter: saturate(1.6) blur(20px);
    border-bottom-color: var(--line);
  }

  .bar-side {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .bar-side.right {
    justify-content: flex-end;
  }

  .bar-title {
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
    max-width: 52vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(4px);
    transition:
      opacity var(--dur) var(--ease-out),
      transform var(--dur) var(--ease-out);
  }

  .bar.scrolled .bar-title,
  .bar.always .bar-title {
    opacity: 1;
    transform: none;
  }

  .back {
    display: flex;
    align-items: center;
    gap: 2px;
    min-height: var(--tap);
    padding: 0 var(--space-2) 0 2px;
    color: var(--accent);
    font-size: var(--fs-body);
    max-width: 100%;
  }

  .back span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .back:active {
    opacity: 0.55;
  }

  .scroll {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }

  .content {
    padding: calc(var(--safe-top) + 52px) max(var(--safe-right), var(--gutter)) var(--space-8)
      max(var(--safe-left), var(--gutter));
    max-width: 720px;
    margin: 0 auto;
  }

  .title-block {
    padding: var(--space-1) var(--space-1) var(--space-5);
  }

  .eyebrow {
    font-size: var(--fs-caption);
    color: var(--text-2);
    font-weight: var(--fw-medium);
    margin-bottom: 2px;
  }

  .large-title {
    font-family: var(--font-display);
    font-size: var(--fs-hero);
    font-weight: var(--fw-semibold);
    line-height: var(--lh-tight);
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
</style>
