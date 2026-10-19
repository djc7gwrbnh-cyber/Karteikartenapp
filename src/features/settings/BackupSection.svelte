<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import { settings } from '../../app/settings.svelte';
  import { createBackup, parseBackup, restoreBackup, summarize } from '../../lib/io/backup';
  import { pickTextFile, shareFile } from '../../lib/io/files';
  import { ImportError } from '../../lib/io/validate';
  import { dayKey, diffDays, formatDayLong } from '../../lib/dates';
  import { actionSheet, confirmDialog, toast } from '../../ui/overlay.svelte';
  import { plural } from '../../lib/text';

  let busy = $state<'export' | 'import' | null>(null);

  const lastBackupText = $derived.by(() => {
    const last = settings.values.lastBackup;
    if (!last) return 'Noch kein Backup erstellt';
    const days = diffDays(last, dayKey());
    if (days === 0) return 'Letztes Backup: heute';
    if (days === 1) return 'Letztes Backup: gestern';
    return `Letztes Backup: vor ${days} Tagen`;
  });

  async function exportAll() {
    busy = 'export';
    try {
      const json = await createBackup();
      const result = await shareFile(json, `karteikarten-backup-${dayKey()}.json`, 'application/json');
      if (result !== 'cancelled') {
        await settings.set('lastBackup', dayKey());
        toast(result === 'shared' ? 'Backup bereit' : 'Backup heruntergeladen');
      }
    } catch (e) {
      console.error(e);
      toast('Das Backup konnte nicht erstellt werden.');
    } finally {
      busy = null;
    }
  }

  async function importAll() {
    const text = await pickTextFile('.json,application/json');
    if (!text) return;
    busy = 'import';
    try {
      const data = parseBackup(text);
      const s = summarize(data);
      const date = data.exportedAt ? formatDayLong(dayKey(new Date(data.exportedAt))) : 'unbekanntem Datum';
      const content = [plural(s.folders, 'Ordner', 'Ordner'), plural(s.decks, 'Stapel', 'Stapel'), plural(s.cards, 'Karte', 'Karten')].join(', ');
      const mode = await actionSheet(
        [
          { id: 'merge', label: 'Zusammenführen', icon: 'import' },
          { id: 'replace', label: 'Alles ersetzen', icon: 'trash', destructive: true }
        ],
        `Backup vom ${date}: ${content}`
      );
      if (!mode) return;
      if (mode === 'replace') {
        const ok = await confirmDialog({
          title: 'Alles ersetzen?',
          message: 'Alle Ordner, Stapel, Karten und der Verlauf auf diesem Gerät werden durch das Backup ersetzt.',
          confirmLabel: 'Ersetzen',
          destructive: true
        });
        if (!ok) return;
      }
      await restoreBackup(data, mode as 'merge' | 'replace');
      toast(mode === 'replace' ? 'Backup wiederhergestellt' : 'Backup zusammengeführt');
    } catch (e) {
      console.error(e);
      toast(e instanceof ImportError ? e.message : 'Das Backup konnte nicht eingelesen werden.');
    } finally {
      busy = null;
    }
  }
</script>

<div class="group">
  <button class="row" onclick={exportAll} disabled={busy !== null}>
    <span class="ico"><Icon name="share" size={22} /></span>
    <div class="row-main">
      <div class="row-title">{busy === 'export' ? 'Backup wird erstellt …' : 'Backup erstellen'}</div>
      <div class="row-sub">{lastBackupText}</div>
    </div>
  </button>
  <button class="row" onclick={importAll} disabled={busy !== null}>
    <span class="ico"><Icon name="import" size={22} /></span>
    <div class="row-main">
      <div class="row-title">{busy === 'import' ? 'Wird eingelesen …' : 'Backup wiederherstellen'}</div>
      <div class="row-sub">Zusammenführen oder ersetzen – du wirst vorher gefragt.</div>
    </div>
  </button>
</div>
<p class="group-note">
  Das Backup enthält alle Ordner, Karten, Bilder und deinen Verlauf. Über „Teilen“ kannst du es in der Dateien-App oder in
  iCloud sichern.
</p>

<style>
  .group {
    --row-inset: 54px;
  }

  .ico {
    color: var(--accent);
    width: 26px;
    display: grid;
    place-items: center;
  }
</style>
