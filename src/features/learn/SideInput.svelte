<script lang="ts">
  // Eingabe einer Kartenseite: Text (und später Bild).
  import type { Side } from '../../lib/db/types';
  import { autosize } from '../../ui/autosize';

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
  const id = 'side-' + Math.random().toString(36).slice(2, 8);

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
</div>

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
