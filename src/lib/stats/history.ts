// Auswertungen für den Verlauf – reine Funktionen.
import { addDays, diffDays, parseDay } from '../dates';
import type { Session } from '../db/types';

export interface DaySummary {
  day: string;
  total: number;
  firstTry: number;
  durationMs: number;
  sessions: Session[];
}

export function summarizeDays(sessions: Session[]): Map<string, DaySummary> {
  const map = new Map<string, DaySummary>();
  for (const s of sessions) {
    if (!s.total) continue;
    const d = map.get(s.day) ?? { day: s.day, total: 0, firstTry: 0, durationMs: 0, sessions: [] };
    d.total += s.total;
    d.firstTry += s.firstTry;
    d.durationMs += s.durationMs;
    d.sessions.push(s);
    map.set(s.day, d);
  }
  return map;
}

/**
 * Lernstreak ohne Druck: Ein noch nicht gelernter heutiger Tag bricht die Serie nicht,
 * gezählt wird dann bis gestern.
 */
export function streak(days: Iterable<string>, today: string): { current: number; longest: number; learnedToday: boolean } {
  const set = new Set(days);
  const learnedToday = set.has(today);
  let current = 0;
  let cursor = learnedToday ? today : addDays(today, -1);
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  const sorted = [...set].sort();
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && diffDays(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest, learnedToday };
}

export interface HeatCell {
  day: string;
  week: number;
  weekday: number; // 0 = Montag
  level: number; // 0–4
  total: number;
  future: boolean;
}

/** Raster der letzten `weeks` Wochen (Montag bis Sonntag), endet mit der aktuellen Woche. */
export function heatmap(days: Map<string, DaySummary>, today: string, weeks: number): HeatCell[] {
  const weekdayToday = (parseDay(today).getDay() + 6) % 7;
  const start = addDays(today, -weekdayToday - (weeks - 1) * 7);
  const max = Math.max(1, ...[...days.values()].map((d) => d.total));
  const cells: HeatCell[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const day = addDays(start, i);
    const total = days.get(day)?.total ?? 0;
    cells.push({
      day,
      week: Math.floor(i / 7),
      weekday: i % 7,
      total,
      level: total === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((total / max) * 4))),
      future: day > today
    });
  }
  return cells;
}

/** Trefferquote (auf Anhieb) pro Lerntag, die letzten `limit` Lerntage. */
export function rateSeries(days: Map<string, DaySummary>, limit = 30): { day: string; rate: number }[] {
  return [...days.values()]
    .filter((d) => d.total > 0)
    .sort((a, b) => (a.day < b.day ? -1 : 1))
    .slice(-limit)
    .map((d) => ({ day: d.day, rate: Math.round((d.firstTry / d.total) * 100) }));
}

/** Ergebnisse eines Tages je Stapel zusammengefasst. */
export function dayByDeck(summary: DaySummary) {
  const map = new Map<string, { deckId: string; total: number; firstTry: number }>();
  for (const s of summary.sessions) {
    for (const r of s.perDeck) {
      const e = map.get(r.deckId) ?? { deckId: r.deckId, total: 0, firstTry: 0 };
      e.total += r.total;
      e.firstTry += r.firstTry;
      map.set(r.deckId, e);
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
