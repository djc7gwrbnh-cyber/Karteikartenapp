import { dailyMessages } from '../content/messages';
import { dayNumber } from './dates';

/**
 * Nachricht des Tages – berechnet aus dem Datum, also stabil beim Neuladen.
 * Eigene Nachrichten werden bevorzugt: an zwei von drei Tagen erscheint eine eigene.
 * `step` blättert weiter (Tipp auf die Karte).
 */
export function messageOfDay(day: string, custom: string[], step = 0, builtin: string[] = dailyMessages): string {
  const n = dayNumber(day) + step;
  const useCustom = custom.length > 0 && (builtin.length === 0 || n % 3 !== 2);
  const pool = useCustom ? custom : builtin;
  if (!pool.length) return '';
  // Weiterblättern über eine feste, gemischte Reihenfolge, damit benachbarte Tage nicht ähnlich wirken
  const index = (Math.abs(n) * 7919) % pool.length;
  return pool[index];
}
