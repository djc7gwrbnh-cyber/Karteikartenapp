<script lang="ts">
  import Sheet from '../../ui/Sheet.svelte';
  import FolderBadge from '../../ui/FolderBadge.svelte';
  import Pictogram from '../../ui/Pictogram.svelte';
  import { palette } from '../../content/palette';
  import { pictograms } from '../../content/pictograms';
  import { createFolder, updateFolder } from '../../lib/db/folders';
  import type { Folder } from '../../lib/db/types';
  import { toast } from '../../ui/overlay.svelte';

  let {
    open = $bindable(false),
    folder,
    parentId = '',
    onsaved
  }: { open?: boolean; folder?: Folder; parentId?: string; onsaved?: (id: string) => void } = $props();

  let name = $state('');
  let color = $state(palette[3].id);
  let icon = $state(pictograms[0].id);
  let wasOpen = false;

  $effect(() => {
    if (open && !wasOpen) {
      name = folder?.name ?? '';
      color = folder?.color ?? palette[(Date.now() / 1000) % palette.length | 0].id;
      icon = folder?.icon ?? 'book';
    }
    wasOpen = open;
  });

  const valid = $derived(name.trim().length > 0);

  async function save() {
    if (!valid) return;
    try {
      if (folder) {
        await updateFolder(folder.id, { name: name.trim(), color, icon });
        onsaved?.(folder.id);
      } else {
        const id = await createFolder({ parentId, name: name.trim(), color, icon });
        onsaved?.(id);
      }
      open = false;
    } catch (e) {
      console.error(e);
      toast('Das hat leider nicht geklappt.');
    }
  }
</script>

<Sheet bind:open title={folder ? 'Ordner bearbeiten' : parentId ? 'Neues Thema' : 'Neuer Ordner'}>
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
    <div class="preview">
      <FolderBadge {color} {icon} size={72} />
    </div>

    <div>
      <label class="label" for="folder-name">Name</label>
      <input
        id="folder-name"
        class="field"
        bind:value={name}
        placeholder={parentId ? 'z. B. Zellbiologie' : 'z. B. Biologie'}
        autocomplete="off"
        enterkeyhint="done"
        maxlength="80"
      />
    </div>

    <div>
      <div class="label" id="color-label">Farbe</div>
      <div class="swatches" role="radiogroup" aria-labelledby="color-label">
        {#each palette as c (c.id)}
          <button
            type="button"
            class="swatch"
            role="radio"
            aria-checked={color === c.id}
            aria-label={c.name}
            style:--c={c.hex}
            onclick={() => (color = c.id)}
          ></button>
        {/each}
      </div>
    </div>

    <div>
      <div class="label" id="icon-label">Symbol</div>
      <div class="icons" role="radiogroup" aria-labelledby="icon-label">
        {#each pictograms as p (p.id)}
          <button
            type="button"
            class="icon"
            role="radio"
            aria-checked={icon === p.id}
            aria-label={p.label}
            onclick={() => (icon = p.id)}
          >
            <Pictogram id={p.id} size={24} />
          </button>
        {/each}
      </div>
    </div>
  </form>
</Sheet>

<style>
  .preview {
    display: grid;
    place-items: center;
    padding-top: var(--space-2);
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--space-3);
    justify-items: center;
  }

  .swatch {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 0 0 var(--bg), 0 0 0 0 var(--c);
    transition: box-shadow var(--dur) var(--ease-out), transform var(--dur-fast) var(--ease-out);
  }

  .swatch[aria-checked='true'] {
    box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px var(--c);
  }

  .swatch:active {
    transform: scale(0.92);
  }

  .icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: var(--space-2);
  }

  .icon {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    min-height: 44px;
    border-radius: var(--radius-m);
    color: var(--text-2);
    background: var(--bg-elev);
    box-shadow: inset 0 0 0 1px var(--line);
    transition: background var(--dur-fast), color var(--dur-fast), box-shadow var(--dur-fast);
  }

  .icon[aria-checked='true'] {
    color: var(--accent);
    background: var(--accent-soft);
    box-shadow: inset 0 0 0 1.5px var(--accent);
  }
</style>
