import { describe, expect, it } from 'vitest';
import { answer, createQueue, isFinished, missed, progress, reinsertIndex } from './queue';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('Einmischen', () => {
  it('fügt nicht gewusste Karten 3 bis 6 Plätze weiter hinten ein', () => {
    expect(reinsertIndex(20, () => 0)).toBe(3);
    expect(reinsertIndex(20, () => 0.999)).toBe(6);
    for (let i = 0; i < 100; i++) {
      const idx = reinsertIndex(20, Math.random);
      expect(idx).toBeGreaterThanOrEqual(3);
      expect(idx).toBeLessThanOrEqual(6);
    }
  });

  it('mischt bei wenigen verbleibenden Karten früher ein', () => {
    expect(reinsertIndex(2, () => 0.999)).toBe(2);
    expect(reinsertIndex(0, () => 0.5)).toBe(0);
  });

  it('hängt eine Karte nicht einfach ans Ende', () => {
    const q = createQueue(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    const next = answer(q, false, () => 0); // Abstand 3
    expect(next.pending).toEqual(['b', 'c', 'd', 'a', 'e', 'f', 'g', 'h', 'i', 'j']);
  });
});

describe('Sitzungsablauf', () => {
  it('endet erst, wenn jede Karte einmal gewusst wurde', () => {
    let q = createQueue(['a', 'b']);
    q = answer(q, false, seq(0)); // a falsch -> hinter b
    expect(q.pending).toEqual(['b', 'a']);
    q = answer(q, true); // b gewusst
    expect(isFinished(q)).toBe(false);
    q = answer(q, false, seq(0)); // a wieder falsch, keine anderen Karten
    expect(q.pending).toEqual(['a']);
    q = answer(q, true);
    expect(isFinished(q)).toBe(true);
    expect(q.done).toEqual(['b', 'a']);
  });

  it('merkt sich nur den ersten Kontakt', () => {
    let q = createQueue(['a', 'b', 'c']);
    q = answer(q, false, seq(0));
    q = answer(q, true);
    q = answer(q, true);
    q = answer(q, true);
    expect(q.first).toEqual({ a: false, b: true, c: true });
    expect(missed(q)).toEqual(['a']);
  });

  it('zählt Fortschritt und wiederkehrende Karten', () => {
    let q = createQueue(['a', 'b', 'c', 'd', 'e']);
    q = answer(q, false, seq(0));
    q = answer(q, true);
    expect(progress(q)).toEqual({ done: 1, total: 5, comingAgain: 1 });
  });

  it('ignoriert Antworten auf eine leere Sitzung', () => {
    const q = createQueue([]);
    expect(answer(q, true)).toBe(q);
    expect(isFinished(q)).toBe(true);
  });
});
