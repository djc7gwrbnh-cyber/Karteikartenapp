<script lang="ts">
  import Sheet from '../../ui/Sheet.svelte';
  import DeckBadge from '../../ui/DeckBadge.svelte';
  import { library } from '../../app/library.svelte';
  import { pathTo } from '../../lib/db/tree';

  let {
    open = $bindable(false),
    title = 'Stapel wählen',
    exclude,
    onpick
  }: { open?: boolean; title?: string; exclude?: string; onpick: (deckId: string) => void } = $props();

  const groups = $derived.by(() => {
    const out: { label: string; decks: typeof library.decks }[] = [];
    const walk = (parentId: string) => {
      for (const f of library.childFolders(parentId)) {
        const decks = library.decksIn(f.id).filter((d) => d.id !== exclude);
        if (decks.length) out.push({ label: pathTo(library.folders, f.id).map((p) => p.name).join(' › '), decks });
        walk(f.id);
      }
    };
    walk('');
    return out;
  });
</script>

<Sheet bind:open {title}>
  {#if groups.length === 0}
    <p class="muted empty">Es gibt noch keinen anderen Stapel.</p>
  {/if}
  {#each groups as g (g.label)}
    <div class="block">
      <div class="group-title">{g.label}</div>
      <div class="group">
        {#each g.decks as d (d.id)}
          <button
            class="row"
            style:--row-inset="64px"
            onclick={() => {
              open = false;
              onpick(d.id);
            }}
          >
            <DeckBadge color={library.deckColor(d)} size={36} />
            <div class="row-main"><div class="row-title">{d.name}</div></div>
          </button>
        {/each}
      </div>
    </div>
  {/each}
</Sheet>

<style>
  .block + .block {
    margin-top: var(--space-5);
  }

  .empty {
    text-align: center;
    padding: var(--space-6) 0;
  }
</style>
