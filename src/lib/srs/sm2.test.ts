import { describe, expect, it } from 'vitest';
import { review, MIN_EASE } from './sm2';
import { freshSrs, cardStatus } from '../db/cards';
import type { SrsFields } from '../db/types';

describe('SM-2 (vereinfacht)', () => {
  it('Intervalle wachsen: 1 → 3 → × Faktor', () => {
    let s: SrsFields = freshSrs();
    s = review(s, true, '2026-01-01');
    expect(s).toMatchObject({ reps: 1, interval: 1, due: '2026-01-02', correct: 1, ease: 2.6 });
    s = review(s, true, '2026-01-02');
    expect(s).toMatchObject({ reps: 2, interval: 3, due: '2026-01-05', ease: 2.7 });
    s = review(s, true, '2026-01-05');
    expect(s).toMatchObject({ reps: 3, interval: 8, due: '2026-01-13' }); // 3 × 2.7 = 8.1
    s = review(s, true, '2026-01-13');
    expect(s.interval).toBe(22); // 8 × 2.8 = 22.4
    expect(cardStatus(s)).toBe('secure');
  });

  it('Nicht gewusst setzt zurück und senkt den Faktor', () => {
    let s: SrsFields = { ...freshSrs(), reps: 4, interval: 20, ease: 2.5, lastStudied: '2026-01-01' };
    s = review(s, false, '2026-02-01');
    expect(s).toMatchObject({ reps: 0, interval: 1, ease: 2.3, due: '2026-02-02', wrong: 1 });
    expect(cardStatus(s)).toBe('learning');
  });

  it('Faktor fällt nie unter 1,3', () => {
    let s: SrsFields = freshSrs();
    for (let i = 0; i < 20; i++) s = review(s, false, '2026-01-01');
    expect(s.ease).toBe(MIN_EASE);
  });

  it('Faktor hat eine Obergrenze', () => {
    let s: SrsFields = freshSrs();
    let day = '2026-01-01';
    for (let i = 0; i < 20; i++) {
      s = review(s, true, day);
      day = s.due!;
    }
    expect(s.ease).toBeLessThanOrEqual(3);
  });

  it('Zweites Wissen am selben Tag schiebt nicht weiter', () => {
    let s = review(freshSrs(), true, '2026-01-01');
    const again = review(s, true, '2026-01-01');
    expect(again.interval).toBe(s.interval);
    expect(again.due).toBe(s.due);
    expect(again.correct).toBe(2);
  });

  it('Nach Fehler am selben Tag zählt ein späteres Wissen normal', () => {
    let s = review(freshSrs(), false, '2026-01-01');
    s = review(s, true, '2026-01-01');
    expect(s).toMatchObject({ reps: 1, interval: 1, due: '2026-01-02' });
  });

  it('verändert den Eingabezustand nicht', () => {
    const s = freshSrs();
    review(s, true, '2026-01-01');
    expect(s).toEqual(freshSrs());
  });

  it('neue Karten sind „neu“', () => {
    expect(cardStatus(freshSrs())).toBe('new');
  });
});
