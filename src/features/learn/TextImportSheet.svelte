<script lang="ts">
  import Sheet from '../../ui/Sheet.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { parseTextList } from '../../lib/io/textlist';
  import { pickTextFile } from '../../lib/io/files';
  import { addCard } from '../../lib/db/cards';
  import { db } from '../../lib/db/db';
  import { toast } from '../../ui/overlay.svelte';
  import { plural } from '../../lib/text';

  let { open = $bindable(false), deckId }: { open?: boolean; deckId: string } = $props();

  let text = $state('');
  let busy = $state(false);
  const parsed = $derived(parseTextList(text));

  async function fromFile() {
    const content = await pickTextFile('.txt,.csv,.tsv,text/plain');
    if (content !== null) text = content;
  }

  async function run() {
    if (!parsed.cards.length || busy) return;
    busy = true;
    try {
      await db.transaction('rw', db.cards, async () => {
        for (const c of parsed.cards) await addCard(deckId, { text: c.front }, { text: c.back });
      });
      toast(`${plural(parsed.cards.length, 'Karte', 'Karten')} importiert`);
      text = '';
      open = false;
    } catch (e) {
      console.error(e);
      toast('Der Import hat nicht geklappt.');
    } finally {
      busy = false;
    }
  }
</script>

<Sheet bind:open title="Textimport">
  {#snippet action()}
    <button class="btn btn-quiet" disabled={!parsed.cards.length || busy} onclick={run}>Importieren</button>
  {/snippet}
  <div class="stack">
    <p class="muted hint">
      Eine Karte pro Zeile: <code>Vorderseite;Rückseite</code>. Ideal, um Karten am Rechner vorzubereiten – einfach den Text
      hier einfügen oder eine Textdatei wählen.
    </p>
    <textarea class="field mono" rows="8" bind:value={text} placeholder={'le pain;das Brot\nla pluie;der Regen'} aria-label="Textliste"></textarea>
    <button class="btn" onclick={fromFile}><Icon name="import" size={20} /> Textdatei wählen</button>
    {#if text.trim()}
      <p class="result" aria-live="polite">
        {parsed.cards.length ? `${plural(parsed.cards.length, 'Karte', 'Karten')} erkannt` : 'Noch keine Karte erkannt'}{parsed.skipped
          ? ` · ${plural(parsed.skipped, 'Zeile', 'Zeilen')} ohne Semikolon übersprungen`
          : ''}
      </p>
      {#if parsed.cards.length}
        <div class="group">
          {#each parsed.cards.slice(0, 3) as c, i (i)}
            <div class="row">
              <div class="row-main">
                <div class="row-title">{c.front}</div>
                <div class="row-sub">{c.back}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</Sheet>

<style>
  .hint {
    font-size: var(--fs-small);
  }

  code {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.92em;
    background: var(--surface-2);
    padding: 1px 6px;
    border-radius: 6px;
  }

  .mono {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 16px;
  }

  .result {
    font-size: var(--fs-small);
    color: var(--accent);
    font-weight: var(--fw-semibold);
  }
</style>
