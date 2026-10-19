<script lang="ts">
  import Page from '../../ui/Page.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Switch from '../../ui/Switch.svelte';
  import { router } from '../../app/router.svelte';
  import { settings } from '../../app/settings.svelte';
  import { live } from '../../lib/live.svelte';
  import { db } from '../../lib/db/db';
  import { haptic } from '../../lib/haptics';

  const messageCount = live(
    () => undefined,
    () => db.messages.count(),
    0
  );

  let persisted = $state<boolean | null>(null);
  $effect(() => {
    navigator.storage?.persisted?.().then((p) => (persisted = p)).catch(() => {});
  });
</script>

<Page title="Einstellungen">
  <div class="stack">
    <section>
      <div class="group-title">Motivation</div>
      <div class="group">
        <button class="row" onclick={() => router.go('/settings/messages')}>
          <div class="row-main">Eigene Nachrichten</div>
          <span class="row-value tabular">{messageCount.value || ''}</span>
          <span class="chevron"><Icon name="chevron" size={18} /></span>
        </button>
      </div>
    </section>

    <section>
      <div class="group-title">Bedienung</div>
      <div class="group">
        <Switch
          label="Haptisches Feedback"
          hint="Ein feines Tippen beim Wischen und Umdrehen, wo das Gerät es unterstützt."
          checked={settings.values.haptics}
          onchange={(v) => {
            settings.set('haptics', v);
            if (v) haptic('light');
          }}
        />
      </div>
    </section>

    <section id="data">
      <div class="group-title">Daten</div>
      <div class="group">
        <div class="row">
          <div class="row-main">
            <div class="row-title">Speicherort</div>
            <div class="row-sub wrap">Nur auf diesem Gerät. Kein Konto, kein Server, keine Werbung.</div>
          </div>
        </div>
        {#if persisted !== null}
          <div class="row">
            <div class="row-main">Dauerhafter Speicher</div>
            <span class="row-value">{persisted ? 'Aktiv' : 'Vom Browser verwaltet'}</span>
          </div>
        {/if}
      </div>
      <p class="group-note">
        Wichtig: Wenn du die App vom Home-Bildschirm entfernst, löscht iOS auch alle Karten. Erstelle vorher ein Backup.
      </p>
    </section>

    <section class="about">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.1C4.5 7.2 6.4 5.3 8.8 5.3c1.4 0 2.5.7 3.2 1.8.7-1.1 1.8-1.8 3.2-1.8 2.4 0 4.3 1.9 4.3 4.6C19.5 15.4 12 20 12 20z" /></svg>
      <p>Karteikarten · Version {__APP_VERSION__}</p>
      <p class="muted">Mit Liebe gemacht.</p>
    </section>
  </div>
</Page>

<style>
  .wrap {
    white-space: normal;
  }

  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--space-4) 0 var(--space-6);
    font-size: var(--fs-caption);
    color: var(--text-2);
  }

  .about svg {
    fill: var(--bad);
    opacity: 0.7;
    margin-bottom: var(--space-2);
  }
</style>
