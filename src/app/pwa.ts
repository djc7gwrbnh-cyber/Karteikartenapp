import { registerSW } from 'virtual:pwa-register';

/** Registriert den Service Worker und bittet um dauerhaften Speicher. */
export function setupPwa(onUpdate?: (apply: () => void) => void) {
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      onUpdate?.(() => update(true));
    }
  });

  // Daten sollen nicht bei Speicherknappheit automatisch gelöscht werden.
  if (navigator.storage?.persist) {
    navigator.storage.persisted().then((done) => {
      if (!done) navigator.storage.persist().catch(() => {});
    });
  }
}
