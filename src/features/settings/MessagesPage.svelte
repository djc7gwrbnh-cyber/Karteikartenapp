<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Sheet from '../../ui/Sheet.svelte';
  import { live } from '../../lib/live.svelte';
  import { db } from '../../lib/db/db';
  import type { Message } from '../../lib/db/types';
  import { addMessage, deleteMessage, updateMessage } from '../../lib/db/messages';
  import { autosize } from '../../ui/autosize';
  import { toast } from '../../ui/overlay.svelte';

  const messages = live(
    () => undefined,
    () => db.messages.orderBy('createdAt').toArray(),
    [] as Message[]
  );

  let open = $state(false);
  let editing = $state<Message | null>(null);
  let text = $state('');

  function edit(m: Message | null) {
    editing = m;
    text = m?.text ?? '';
    open = true;
  }

  async function save() {
    if (!text.trim()) return;
    if (editing) await updateMessage(editing.id, text);
    else await addMessage(text);
    open = false;
  }

  async function remove() {
    if (!editing) return;
    const m = editing;
    await deleteMessage(m.id);
    open = false;
    toast('Nachricht gelöscht', { label: 'Rückgängig', run: () => db.messages.put(m) });
  }
</script>

<Page title="Eigene Nachrichten" back="/settings" backLabel="Einstellungen">
  {#snippet actions()}
    <button class="icon-btn" aria-label="Nachricht hinzufügen" onclick={() => edit(null)}><Icon name="plus" size={26} /></button>
  {/snippet}

  <p class="intro">
    Eigene Nachrichten erscheinen bevorzugt auf dem Startbildschirm – an zwei von drei Tagen. Platz für liebe Worte, Insider und
    kleine Erinnerungen.
  </p>

  {#if messages.loaded && messages.value.length === 0}
    <EmptyState illustration="messages" title="Noch keine eigenen Nachrichten" text="Schreib etwas, das dich (oder jemand Besonderen) zum Lächeln bringt.">
      <button class="btn btn-primary" onclick={() => edit(null)}><Icon name="plus" size={20} /> Nachricht schreiben</button>
    </EmptyState>
  {:else}
    <div class="group">
      {#each messages.value as m (m.id)}
        <button class="row" onclick={() => edit(m)}>
          <div class="row-main"><div class="text">{m.text}</div></div>
          <span class="chevron"><Icon name="chevron" size={18} /></span>
        </button>
      {/each}
    </div>
  {/if}
</Page>

<Sheet bind:open title={editing ? 'Nachricht bearbeiten' : 'Neue Nachricht'}>
  {#snippet action()}
    <button class="btn btn-quiet" disabled={!text.trim()} onclick={save}>Sichern</button>
  {/snippet}
  <div class="stack">
    <div>
      <label class="label" for="message-text">Nachricht</label>
      <textarea id="message-text" class="field" rows="3" bind:value={text} use:autosize={text} maxlength="240" placeholder="z. B. Ich glaub an dich!"></textarea>
    </div>
    {#if editing}
      <button class="btn btn-danger btn-block" onclick={remove}><Icon name="trash" size={20} /> Löschen</button>
    {/if}
  </div>
</Sheet>

<style>
  .intro {
    color: var(--text-2);
    font-size: var(--fs-small);
    margin: calc(-1 * var(--space-2)) var(--space-1) var(--space-5);
  }

  .text {
    font-family: var(--font-display);
    line-height: var(--lh-snug);
    padding: var(--space-2) 0;
  }
</style>
