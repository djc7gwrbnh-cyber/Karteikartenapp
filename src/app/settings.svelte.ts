import { liveQuery } from 'dexie';
import { db } from '../lib/db/db';
import { defaultSettings, saveSetting, type Settings } from '../lib/db/settings';
import { setHapticsEnabled } from '../lib/haptics';

class AppSettings {
  values = $state<Settings>({ ...defaultSettings });

  start() {
    liveQuery(() => db.settings.toArray()).subscribe((rows) => {
      const next: Record<string, unknown> = { ...defaultSettings };
      for (const row of rows) if (row.key in defaultSettings) next[row.key] = row.value;
      this.values = next as unknown as Settings;
      setHapticsEnabled(this.values.haptics);
    });
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]) {
    this.values[key] = value;
    return saveSetting(key, value);
  }
}

export const settings = new AppSettings();
