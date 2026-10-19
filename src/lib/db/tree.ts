import type { Folder } from './types';

/** Kinder eines Ordners, sortiert. */
export function childrenOf(folders: Folder[], parentId: string): Folder[] {
  return folders.filter((f) => f.parentId === parentId).sort((a, b) => a.order - b.order);
}

/** Alle Nachfahren-IDs eines Ordners (ohne ihn selbst). */
export function descendantIds(folders: Folder[], id: string): string[] {
  const out: string[] = [];
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    for (const f of folders) {
      if (f.parentId === current && !out.includes(f.id)) {
        out.push(f.id);
        stack.push(f.id);
      }
    }
  }
  return out;
}

/** Pfad von der obersten Ebene bis zum Ordner (inklusive). */
export function pathTo(folders: Folder[], id: string): Folder[] {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const path: Folder[] = [];
  let current = byId.get(id);
  while (current && path.length < 50) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}
