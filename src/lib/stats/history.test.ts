import { describe, expect, it } from 'vitest';
import { dayByDeck, heatmap, rateSeries, streak, summarizeDays } from './history';
import type { Session } from '../db/types';

const session = (day: string, total: number, firstTry: number, deckId = 'd'): Session => ({
  id: day + total + deckId,
  day,
  startedAt: 0,
  endedAt: 0,
  durationMs: 60_000,
  mode: 'learn',
  deckIds: [deckId],
  total,
  firstTry,
  completed: true,
  perDeck: [{ deckId, total, firstTry }]
});

describe('Verlauf', () => {
  it('fasst Sitzungen pro Tag zusammen', () => {
    const days = summarizeDays([session('2026-03-01', 10, 5), session('2026-03-01', 4, 4), session('2026-03-02', 0, 0)]);
    expect(days.size).toBe(1);
    expect(days.get('2026-03-01')).toMatchObject({ total: 14, firstTry: 9, durationMs: 120_000 });
  });

  it('zählt den Streak ohne Druck', () => {
    const days = ['2026-03-01', '2026-03-02', '2026-03-03'];
    expect(streak(days, '2026-03-03')).toEqual({ current: 3, longest: 3, learnedToday: true });
    // Heute noch nicht gelernt: Serie bleibt bestehen
    expect(streak(days, '2026-03-04')).toEqual({ current: 3, longest: 3, learnedToday: false });
    // Ein Tag Pause: neue Serie beginnt, längste bleibt erhalten
    expect(streak([...days, '2026-03-05'], '2026-03-05')).toMatchObject({ current: 1, longest: 3 });
    expect(streak([], '2026-03-05')).toEqual({ current: 0, longest: 0, learnedToday: false });
  });

  it('baut ein Wochenraster, das mit der aktuellen Woche endet', () => {
    const days = summarizeDays([session('2026-03-04', 10, 5), session('2026-03-05', 40, 30)]);
    const cells = heatmap(days, '2026-03-05', 4); // Donnerstag
    expect(cells).toHaveLength(28);
    expect(cells[0].weekday).toBe(0);
    const thu = cells.find((c) => c.day === '2026-03-05')!;
    expect(thu).toMatchObject({ level: 4, week: 3, weekday: 3, future: false });
    expect(cells.find((c) => c.day === '2026-03-04')!.level).toBe(1);
    expect(cells.at(-1)!.future).toBe(true);
  });

  it('liefert die Trefferquote je Lerntag', () => {
    const days = summarizeDays([session('2026-03-02', 10, 5), session('2026-03-01', 4, 4)]);
    expect(rateSeries(days)).toEqual([
      { day: '2026-03-01', rate: 100 },
      { day: '2026-03-02', rate: 50 }
    ]);
  });

  it('gruppiert einen Tag nach Stapeln', () => {
    const days = summarizeDays([session('2026-03-01', 10, 5, 'a'), session('2026-03-01', 20, 10, 'b'), session('2026-03-01', 2, 2, 'a')]);
    expect(dayByDeck(days.get('2026-03-01')!)).toEqual([
      { deckId: 'b', total: 20, firstTry: 10 },
      { deckId: 'a', total: 12, firstTry: 7 }
    ]);
  });
});
