<script lang="ts">
  import Icon from '../ui/Icon.svelte';
  import type { UiIcon } from '../ui/icons';
  import { router, tabOf, type Tab } from './router.svelte';
  import { haptic } from '../lib/haptics';

  const tabs: { id: Tab; label: string; icon: UiIcon }[] = [
    { id: 'learn', label: 'Lernen', icon: 'cards' },
    { id: 'history', label: 'Verlauf', icon: 'calendar' },
    { id: 'settings', label: 'Einstellungen', icon: 'settings' }
  ];

  const active = $derived(tabOf(router.route));

  function open(tab: Tab) {
    if (tab !== active) haptic('light');
    router.openTab(tab);
  }
</script>

<nav class="tabbar" aria-label="Hauptnavigation">
  {#each tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={active === tab.id}
      aria-current={active === tab.id ? 'page' : undefined}
      onclick={() => open(tab.id)}
    >
      <Icon name={tab.icon} size={26} stroke={active === tab.id ? 2 : 1.7} />
      <span>{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  .tabbar {
    position: relative;
    z-index: 20;
    display: flex;
    justify-content: space-around;
    padding: 6px max(var(--safe-left), 8px) max(var(--safe-bottom), 8px) max(var(--safe-right), 8px);
    background: var(--bar-bg);
    -webkit-backdrop-filter: saturate(1.6) blur(20px);
    backdrop-filter: saturate(1.6) blur(20px);
    border-top: 0.5px solid var(--line-strong);
  }

  .tab {
    flex: 1;
    max-width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-height: 48px;
    padding-top: 2px;
    color: var(--text-3);
    font-size: var(--fs-micro);
    font-weight: var(--fw-medium);
    letter-spacing: 0.01em;
    transition: color var(--dur) var(--ease-out);
  }

  .tab :global(svg) {
    transition: transform var(--dur) var(--ease-spring);
  }

  .tab.active {
    color: var(--accent);
  }

  .tab:active :global(svg) {
    transform: scale(0.9);
  }
</style>
