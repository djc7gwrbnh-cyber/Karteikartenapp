/** Stabile Auswahl aus einer Liste anhand eines Textes (z. B. einer Sitzungs-ID). */
export function pickStable<T>(items: T[], seed: string): T | undefined {
  if (!items.length) return undefined;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return items[Math.abs(h) % items.length];
}
