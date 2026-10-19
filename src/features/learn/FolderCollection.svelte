<script lang="ts">
  import FolderBadge from '../../ui/FolderBadge.svelte';
  import Icon from '../../ui/Icon.svelte';
  import SortableList from '../../ui/SortableList.svelte';
  import { library } from '../../app/library.svelte';
  import { router } from '../../app/router.svelte';
  import { reorderFolders } from '../../lib/db/folders';
  import type { Folder } from '../../lib/db/types';
  import { plural } from '../../lib/text';

  let { folders, view, sorting = false }: { folders: Folder[]; view: 'grid' | 'list'; sorting?: boolean } = $props();

  function meta(f: Folder) {
    const s = library.folderStats.get(f.id);
    if (!s || s.decks === 0) {
      const subs = library.childFolders(f.id).length;
      return subs ? plural(subs, 'Thema', 'Themen') : 'Noch leer';
    }
    return `${plural(s.decks, 'Stapel', 'Stapel')} · ${plural(s.cards, 'Karte', 'Karten')}`;
  }

  const due = (f: Folder) => library.folderStats.get(f.id)?.due ?? 0;
  const open = (f: Folder) => router.go(`/folder/${f.id}`);
</script>

{#if sorting}
  <SortableList items={folders} onreorder={reorderFolders} label={(f) => f.name}>
    {#snippet row(f)}
      <FolderBadge color={f.color} icon={f.icon} size={36} />
      <div class="row-main"><div class="row-title">{f.name}</div></div>
    {/snippet}
  </SortableList>
{:else if view === 'grid'}
  <div class="grid">
    {#each folders as f (f.id)}
      <button class="tile" onclick={() => open(f)}>
        <div class="tile-top">
          <FolderBadge color={f.color} icon={f.icon} size={44} />
          {#if due(f)}<span class="due" aria-label="{due(f)} heute fällig">{due(f)}</span>{/if}
        </div>
        <div class="tile-name">{f.name}</div>
        <div class="tile-meta">{meta(f)}</div>
      </button>
    {/each}
  </div>
{:else}
  <div class="group">
    {#each folders as f (f.id)}
      <button class="row" style:--row-inset="68px" onclick={() => open(f)}>
        <FolderBadge color={f.color} icon={f.icon} size={40} />
        <div class="row-main">
          <div class="row-title">{f.name}</div>
          <div class="row-sub">{meta(f)}</div>
        </div>
        {#if due(f)}<span class="due" aria-label="{due(f)} heute fällig">{due(f)}</span>{/if}
        <span class="chevron"><Icon name="chevron" size={18} /></span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-3);
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: var(--space-4);
    min-height: 136px;
    text-align: left;
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-1);
    transition: transform var(--dur-fast) var(--ease-out);
  }

  .tile:active {
    transform: scale(0.97);
  }

  .tile-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    margin-bottom: var(--space-3);
  }

  .tile-name {
    font-weight: var(--fw-semibold);
    line-height: var(--lh-snug);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }

  .tile-meta {
    font-size: var(--fs-caption);
    color: var(--text-2);
  }

  .due {
    min-width: 26px;
    height: 24px;
    padding: 0 8px;
    border-radius: var(--radius-full);
    background: var(--accent-soft);
    color: var(--accent);
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    font-variant-numeric: tabular-nums;
    display: inline-grid;
    place-items: center;
  }
</style>
