<script lang="ts">
  import Sheet from '../../ui/Sheet.svelte';
  import Switch from '../../ui/Switch.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import DeckBadge from '../../ui/DeckBadge.svelte';
  import { palette } from '../../content/palette';
  import { createDeck, updateDeck } from '../../lib/db/decks';
  import type { Deck } from '../../lib/db/types';
  import { library } from '../../app/library.svelte';
  import { toast } from '../../ui/overlay.svelte';
  import { autosize } from '../../ui/autosize';

  let {
    open = $bindable(false),
    deck,
    folderId,
    onsaved
  }: { open?: boolean; deck?: Deck; folderId: string; onsaved?: (id: string) => void } = $props();

  let name = $state('');
  let description = $state('');
  let color = $state<string | null>(null);
  let firstSide = $state<'front' | 'back'>('front');
  let bothDirections = $state(false);
  let shuffle = $state(true);
  let wasOpen = false;

  $effect(() => {
    if (open && !wasOpen) {
      name = deck?.name ?? '';
      description = deck?.description ?? '';
      color = deck?.color ?? null;
      firstSide = deck?.firstSide ?? 'front';
      bothDirections = deck?.bothDirections ?? false;
      shuffle = deck?.shuffle ?? true;
    }
    wasOpen = open;
  });

  const folderColor = $derived(library.folder(folderId)?.color ?? 'fir');
  const valid = $derived(name.trim().length > 0);

  async function save() {
    if (!valid) return;
    const data = { name: name.trim(), description: description.trim(), color, firstSide, bothDirections, shuffle };
    try {
      if (deck) {
        await updateDeck(deck.id, data);
        onsaved?.(deck.id);
      } else {
        onsaved?.(await createDeck({ folderId, ...data }));
      }
      open = false;
    } catch (e) {
      console.error(e);
      toast('Das hat leider nicht geklappt.');
    }
  }
</script>

<Sheet bind:open title={deck ? 'Stapel bearbeiten' : 'Neuer Stapel'}>
  {#snippet action()}
    <button class="btn btn-quiet" disabled={!valid} onclick={save}>Sichern</button>
  {/snippet}

  <form
    class="stack"
    onsubmit={(e) => {
      e.preventDefault();
      save();
    }}
  >
    <div class="preview"><DeckBadge color={color ?? folderColor} size={64} /></div>

    <div>
      <label class="label" for="deck-name">Name</label>
      <input id="deck-name" class="field" bind:value={name} placeholder="z. B. Vokabeln Kapitel 3" autocomplete="off" maxlength="80" enterkeyhint="next" />
    </div>

    <div>
      <label class="label" for="deck-desc">Beschreibung (optional)</label>
      <textarea id="deck-desc" class="field" rows="2" bind:value={description} use:autosize={description} maxlength="300"></textarea>
    </div>

    <div>
      <div class="label" id="deck-color">Farbe</div>
      <div class="swatches" role="radiogroup" aria-labelledby="deck-color">
        <button type="button" class="swatch inherit" role="radio" aria-checked={color === null} aria-label="Farbe des Ordners" onclick={() => (color = null)}>
          <span style:background={palette.find((p) => p.id === folderColor)?.hex}></span>
        </button>
        {#each palette as c (c.id)}
          <button type="button" class="swatch" role="radio" aria-checked={color === c.id} aria-label={c.name} style:--c={c.hex} onclick={() => (color = c.id)}></button>
        {/each}
      </div>
      <div class="group-note">Der erste Punkt übernimmt die Farbe des Ordners.</div>
    </div>

    <div>
      <div class="label">Zuerst zeigen</div>
      <Segmented
        label="Zuerst zeigen"
        bind:value={firstSide}
        options={[
          { value: 'front', label: 'Vorderseite' },
          { value: 'back', label: 'Rückseite' }
        ]}
      />
    </div>

    <div class="group">
      <Switch label="Beide Richtungen abfragen" hint="Jede Karte kommt einmal von vorne und einmal von hinten." bind:checked={bothDirections} />
      <Switch label="Reihenfolge mischen" hint="Empfohlen – so lernst du die Inhalte, nicht die Reihenfolge." bind:checked={shuffle} />
    </div>
  </form>
</Sheet>

<style>
  .preview {
    display: grid;
    place-items: center;
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: var(--space-3);
    justify-items: center;
  }

  .swatch {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--c);
    transition: box-shadow var(--dur) var(--ease-out);
  }

  .swatch.inherit {
    display: grid;
    place-items: center;
    background: var(--bg-elev);
    box-shadow: inset 0 0 0 1.5px var(--line-strong);
  }

  .swatch.inherit span {
    width: 18px;
    height: 18px;
    border-radius: 50%;
  }

  .swatch[aria-checked='true'] {
    box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px var(--text-2);
  }

  .swatch:not(.inherit)[aria-checked='true'] {
    box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px var(--c);
  }
</style>
