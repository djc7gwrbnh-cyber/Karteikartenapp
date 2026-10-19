<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { router, tabOf } from './router.svelte';
  import { dur } from '../lib/motion';
  import TabBar from './TabBar.svelte';
  import LearnHome from '../features/learn/LearnHome.svelte';
  import HistoryHome from '../features/history/HistoryHome.svelte';
  import SettingsHome from '../features/settings/SettingsHome.svelte';
  import FolderView from '../features/learn/FolderView.svelte';
  import Overlays from '../ui/Overlays.svelte';
  import DeckView from '../features/learn/DeckView.svelte';
  import QuickAdd from '../features/learn/QuickAdd.svelte';
  import CardEditor from '../features/learn/CardEditor.svelte';

  const route = $derived(router.route);
  const tab = $derived(tabOf(route));
  const seg = $derived(route.segments);
  // Tab-Wechsel blendet über, Navigation innerhalb eines Tabs gleitet leicht.
  let lastTab = tabOf(router.route);
  let switchedTab = $state(false);
  $effect.pre(() => {
    switchedTab = tab !== lastTab;
    lastTab = tab;
  });
</script>

<div class="app">
  <main class="view">
    {#key route.path}
      <div
        class="screen"
        in:fly={{ x: switchedTab ? 0 : 14, duration: dur(switchedTab ? 180 : 240), opacity: 0 }}
      >
        {#if seg[0] === 'history'}
          <HistoryHome />
        {:else if seg[0] === 'settings'}
          <SettingsHome />
        {:else if seg[0] === 'deck' && seg[1] && seg[2] === 'add'}
          <QuickAdd deckId={seg[1]} />
        {:else if seg[0] === 'deck' && seg[1]}
          <DeckView id={seg[1]} />
        {:else if seg[0] === 'card' && seg[1]}
          <CardEditor id={seg[1]} />
        {:else if seg[0] === 'folder' && seg[1]}
          <FolderView id={seg[1]} />
        {:else}
          <LearnHome />
        {/if}
      </div>
    {/key}
  </main>

  {#if tab}
    <div transition:fade={{ duration: dur(150) }}>
      <TabBar />
    </div>
  {/if}
</div>

<Overlays />

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .view {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  .screen {
    position: absolute;
    inset: 0;
  }
</style>
