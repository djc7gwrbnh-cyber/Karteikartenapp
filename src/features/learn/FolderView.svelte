<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import Icon from '../../ui/Icon.svelte';
  import FolderBadge from '../../ui/FolderBadge.svelte';
  import SectionHeader from '../../ui/SectionHeader.svelte';
  import FolderCollection from './FolderCollection.svelte';
  import FolderEditor from './FolderEditor.svelte';
  import DeckCollection from './DeckCollection.svelte';
  import DeckEditor from './DeckEditor.svelte';
  import type { Deck } from '../../lib/db/types';
  import StartSheet from '../study/StartSheet.svelte';
  import { importDeck, parseDeck } from '../../lib/io/backup';
  import { pickTextFile } from '../../lib/io/files';
  import { ImportError } from '../../lib/io/validate';
  import { library } from '../../app/library.svelte';
  import { router } from '../../app/router.svelte';
  import { settings } from '../../app/settings.svelte';
  import { deleteFolder, folderContentCount } from '../../lib/db/folders';
  import { actionSheet, confirmDialog, toast } from '../../ui/overlay.svelte';
  import { plural } from '../../lib/text';

  let { id }: { id: string } = $props();

  const folder = $derived(library.folder(id));
  const parent = $derived(folder?.parentId ? library.folder(folder.parentId) : undefined);
  const subfolders = $derived(library.childFolders(id));
  const decks = $derived(library.decksIn(id));
  const stat = $derived(library.folderStats.get(id));
  const view = $derived(settings.values.folderView);
  const backPath = $derived(parent ? `/folder/${parent.id}` : '/');

  let editing = $state(false);
  let creatingSub = $state(false);
  let sorting = $state(false);
  let creatingDeck = $state(false);

  async function add() {
    const choice = await actionSheet([
      { id: 'deck', label: 'Neuer Stapel', icon: 'cards' },
      { id: 'sub', label: 'Neues Thema (Unterordner)', icon: 'folderPlus' },
      { id: 'import', label: 'Geteilten Stapel importieren', icon: 'import' }
    ]);
    if (choice === 'deck') creatingDeck = true;
    if (choice === 'sub') creatingSub = true;
    if (choice === 'import') importShared();
  }

  async function importShared() {
    const text = await pickTextFile('.json,application/json');
    if (!text || !folder) return;
    try {
      const data = parseDeck(text);
      const deckId = await importDeck(data, folder.id);
      toast(`„${data.deck.name}“ importiert`);
      router.go(`/deck/${deckId}`);
    } catch (e) {
      console.error(e);
      toast(e instanceof ImportError ? e.message : 'Der Stapel konnte nicht importiert werden.');
    }
  }

  let startDeck = $state<Deck | null>(null);
  let starting = $state(false);

  // Ein Tipp auf einen Stapel startet das Lernen; leere Stapel öffnen sich zum Befüllen.
  function openDeck(deck: Deck) {
    if (library.stat(deck.id).total === 0) {
      router.go(`/deck/${deck.id}`);
      return;
    }
    startDeck = deck;
    starting = true;
  }

  async function more() {
    const choice = await actionSheet(
      [
        { id: 'edit', label: 'Ordner bearbeiten', icon: 'edit' },
        ...(subfolders.length > 1 || decks.length > 1 ? [{ id: 'sort', label: 'Sortieren', icon: 'sort' as const }] : []),
        { id: 'delete', label: 'Ordner löschen', icon: 'trash', destructive: true }
      ],
      folder?.name
    );
    if (choice === 'edit') editing = true;
    if (choice === 'sort') sorting = true;
    if (choice === 'delete') remove();
  }

  async function remove() {
    if (!folder) return;
    const c = await folderContentCount(folder.id);
    const parts = [
      c.folders && plural(c.folders, 'Thema', 'Themen'),
      c.decks && plural(c.decks, 'Stapel', 'Stapel'),
      c.cards && plural(c.cards, 'Karte', 'Karten')
    ].filter(Boolean);
    const ok = await confirmDialog({
      title: `„${folder.name}“ löschen?`,
      message: parts.length ? `Dabei werden auch ${parts.join(', ')} gelöscht. Das lässt sich nicht rückgängig machen.` : 'Der Ordner ist leer.',
      confirmLabel: 'Löschen',
      destructive: true
    });
    if (!ok) return;
    router.back(backPath);
    await deleteFolder(folder.id);
    toast('Ordner gelöscht');
  }
</script>

{#if folder}
  <Page title={folder.name} back={backPath} backLabel={parent?.name ?? 'Lernen'}>
    {#snippet actions()}
      {#if sorting}
        <button class="btn btn-quiet" onclick={() => (sorting = false)}>Fertig</button>
      {:else}
        <button class="icon-btn" aria-label="Hinzufügen" onclick={add}><Icon name="plus" size={26} /></button>
        <button class="icon-btn" aria-label="Weitere Aktionen" onclick={more}><Icon name="more" size={26} /></button>
      {/if}
    {/snippet}

    {#snippet header()}
      <div class="hero">
        <FolderBadge color={folder.color} icon={folder.icon} size={52} />
        <div class="hero-meta">
          {#if stat && stat.cards}
            <span>{plural(stat.decks, 'Stapel', 'Stapel')} · {plural(stat.cards, 'Karte', 'Karten')}</span>
            {#if stat.due}<span class="due-text">{stat.due} heute fällig</span>{/if}
          {:else}
            <span>Bereit für die ersten Karten</span>
          {/if}
        </div>
      </div>
    {/snippet}

    {#if subfolders.length}
      <SectionHeader title="Themen" />
      <FolderCollection folders={subfolders} {view} {sorting} />
    {/if}

    {#if decks.length}
      <SectionHeader title="Stapel">
        {#if !sorting}
          <button class="icon-btn" aria-label="Neuer Stapel" onclick={() => (creatingDeck = true)}>
            <Icon name="plus" size={22} />
          </button>
        {/if}
      </SectionHeader>
      <DeckCollection {decks} {sorting} onopen={openDeck} />
    {/if}

    {#if !subfolders.length && !decks.length}
      <EmptyState
        illustration="cards"
        title="Noch ganz leer hier"
        text="Lege einen Stapel mit Karten an – oder gliedere den Ordner zuerst in Themen."
      >
        <button class="btn btn-primary btn-large" onclick={() => (creatingDeck = true)}>
          <Icon name="cards" size={20} /> Stapel anlegen
        </button>
        <button class="btn btn-quiet" onclick={() => (creatingSub = true)}>Thema anlegen</button>
      </EmptyState>
    {/if}
  </Page>

  <FolderEditor bind:open={editing} {folder} parentId={folder.parentId} />
  <FolderEditor bind:open={creatingSub} parentId={folder.id} />
  {#if startDeck}<StartSheet bind:open={starting} deck={startDeck} />{/if}
  <DeckEditor bind:open={creatingDeck} folderId={folder.id} onsaved={(deckId) => router.go(`/deck/${deckId}`)} />
{:else if library.loaded}
  <Page title="Nicht gefunden" back="/" backLabel="Lernen">
    <EmptyState illustration="search" title="Dieser Ordner ist nicht mehr da" text="Vielleicht wurde er gelöscht." />
  </Page>
{/if}

<style>
  .hero {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin: calc(-1 * var(--space-2)) 0 var(--space-2) var(--space-1);
  }

  .hero-meta {
    display: flex;
    flex-direction: column;
    font-size: var(--fs-small);
    color: var(--text-2);
  }

  .due-text {
    color: var(--accent);
    font-weight: var(--fw-semibold);
  }
</style>
