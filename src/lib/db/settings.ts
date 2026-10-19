import { db } from './db';

export interface Settings {
  folderView: 'grid' | 'list';
  haptics: boolean;
  /** Tag des letzten Backups (YYYY-MM-DD) */
  lastBackup: string | null;
}

export const defaultSettings: Settings = {
  folderView: 'grid',
  haptics: true,
  lastBackup: null
};

export async function loadSettings(): Promise<Settings> {
  const rows = await db.settings.toArray();
  const out: Record<string, unknown> = { ...defaultSettings };
  for (const row of rows) if (row.key in defaultSettings) out[row.key] = row.value;
  return out as unknown as Settings;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  await db.settings.put({ key, value });
}
