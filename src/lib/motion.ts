const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function reducedMotion(): boolean {
  return query?.matches ?? false;
}

/** Dauer für Svelte-Übergänge, 0 bei reduzierter Bewegung. */
export function dur(ms: number): number {
  return reducedMotion() ? 0 : ms;
}
