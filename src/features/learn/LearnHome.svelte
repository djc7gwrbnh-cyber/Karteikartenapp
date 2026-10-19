<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import Icon from '../../ui/Icon.svelte';
  import SectionHeader from '../../ui/SectionHeader.svelte';
  import FolderCollection from './FolderCollection.svelte';
  import FolderEditor from './FolderEditor.svelte';
  import DueCard from './DueCard.svelte';
  import { library } from '../../app/library.svelte';
  import { settings } from '../../app/settings.svelte';

  let creating = $state(false);
  let sorting = $state(false);
  const folders = $derived(library.childFolders(''));
  const view = $derived(settings.values.folderView);
</script>

<Page title="Lernen">
  {#snippet actions()}
    {#if sorting}
      <button class="btn btn-quiet" onclick={() => (sorting = false)}>Fertig</button>
    {:else}
      <button class="icon-btn" aria-label="Neuer Ordner" onclick={() => (creating = true)}>
        <Icon name="plus" size={26} />
      </button>
    {/if}
  {/snippet}

  {#if library.loaded}
    <DueCard />
    {#if folders.length === 0}
      <EmptyState
        illustration="folders"
        title="Hier entsteht dein Lernplatz"
        text="Lege einen Ordner für ein Fach an – zum Beispiel Biologie oder Französisch."
      >
        <button class="btn btn-primary btn-large" onclick={() => (creating = true)}>
          <Icon name="folderPlus" size={22} /> Ersten Ordner anlegen
        </button>
      </EmptyState>
    {:else}
      <SectionHeader title="Fächer">
        {#if !sorting}
          <button
            class="icon-btn"
            aria-label={view === 'grid' ? 'Als Liste anzeigen' : 'Als Kacheln anzeigen'}
            onclick={() => settings.set('folderView', view === 'grid' ? 'list' : 'grid')}
          >
            <Icon name={view === 'grid' ? 'list' : 'grid'} size={22} />
          </button>
          {#if folders.length > 1}
            <button class="icon-btn" aria-label="Ordner sortieren" onclick={() => (sorting = true)}>
              <Icon name="sort" size={22} />
            </button>
          {/if}
        {/if}
      </SectionHeader>
      <FolderCollection {folders} {view} {sorting} />
    {/if}
  {/if}
</Page>

<FolderEditor bind:open={creating} parentId="" />
