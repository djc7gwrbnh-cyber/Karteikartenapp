<script lang="ts">
  // Eingabe einer Kartenseite: Text, Bild oder beides.
  import type { Side } from '../../lib/db/types';
  import { autosize } from '../../ui/autosize';
  import Icon from '../../ui/Icon.svelte';
  import Thumb from '../../ui/Thumb.svelte';
  import CropView from './CropView.svelte';
  import { saveImage } from '../../lib/db/images';
  import { toast } from '../../ui/overlay.svelte';

  let {
    side = $bindable(),
    label,
    placeholder,
    multiline = false,
    autofocus = false,
    onenter
  }: {
    side: Side;
    label: string;
    placeholder?: string;
    /** true: Enter erzeugt Zeilenumbruch, sonst springt Enter weiter */
    multiline?: boolean;
    autofocus?: boolean;
    onenter?: () => void;
  } = $props();

  let textarea: HTMLTextAreaElement;
  let fileInput: HTMLInputElement;
  let pending = $state<File | null>(null);
  const id = 'side-' + Math.random().toString(36).slice(2, 8);

  function pick(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) pending = file;
  }

  async function onCropped(result: { blob: Blob; width: number; height: number }) {
    pending = null;
    try {
      // Das alte Bild bleibt bis zum Speichern der Karte erhalten (dort wird aufgeräumt).
      side.imageId = await saveImage(result.blob, result.width, result.height);
    } catch (e) {
      console.error(e);
      toast('Das Bild konnte nicht gespeichert werden. Ist der Speicher voll?');
    }
  }

  export function focus() {
    textarea.focus({ preventScroll: true });
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !multiline && !e.isComposing) {
      e.preventDefault();
      onenter?.();
    }
  }
</script>

<div class="side">
  <label class="side-label" for={id}>{label}</label>
  <!-- svelte-ignore a11y_autofocus -->
  <textarea
    {id}
    bind:this={textarea}
    bind:value={side.text}
    use:autosize={side.text}
    rows="1"
    {placeholder}
    {autofocus}
    enterkeyhint={multiline ? 'enter' : 'next'}
    autocomplete="off"
    {onkeydown}
  ></textarea>
  <div class="media">
    {#if side.imageId}
      <div class="preview">
        {#key side.imageId}<Thumb id={side.imageId} size={64} />{/key}
        <button type="button" class="remove" aria-label="Bild entfernen" onclick={() => (side.imageId = undefined)}>
          <Icon name="close" size={14} stroke={2.6} />
        </button>
      </div>
    {/if}
    <button type="button" class="photo" onclick={() => fileInput.click()}>
      <Icon name="camera" size={20} />
      {side.imageId ? 'Anderes Foto' : 'Foto'}
    </button>
    <input bind:this={fileInput} type="file" accept="image/*" hidden onchange={pick} />
  </div>
</div>

{#if pending}
  <CropView file={pending} onconfirm={onCropped} oncancel={() => (pending = null)} />
{/if}

<style>
  .side {
    padding: var(--space-2) var(--space-4);
  }

  .side-label {
    display: block;
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--text-2);
    letter-spacing: 0.02em;
    transition: color var(--dur-fast);
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 52px;
    padding: var(--space-2) 0;
    border: 0;
    background: transparent;
    resize: none;
    font-family: var(--font-display);
    font-size: 20px;
    line-height: var(--lh-snug);
  }

  .media {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .preview {
    position: relative;
  }

  .remove {
    position: absolute;
    top: -8px;
    right: -8px;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--text);
    color: var(--bg);
    box-shadow: 0 0 0 2px var(--bg-elev);
  }

  .remove::after {
    content: '';
    position: absolute;
    inset: -10px;
  }

  .photo {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-full);
    background: var(--surface-2);
    color: var(--text-2);
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
  }

  textarea:focus-visible {
    outline: none;
  }

  .side:focus-within .side-label {
    color: var(--accent);
  }

  textarea::placeholder {
    color: var(--text-3);
    opacity: 0.7;
  }
</style>
