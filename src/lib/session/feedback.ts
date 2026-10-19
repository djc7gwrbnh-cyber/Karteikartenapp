import { doneGood, doneGreat, doneShort, doneTough } from '../../content/messages';
import { pickStable } from '../pick';

/** Passende „Geschafft“-Nachricht zum Ergebnis. */
export function doneMessage(total: number, firstTry: number, seed: string): string {
  const rate = total ? firstTry / total : 0;
  const pool = total < 5 ? doneShort : rate >= 0.85 ? doneGreat : rate >= 0.5 ? doneGood : doneTough;
  return pickStable(pool, seed) ?? 'Geschafft!';
}

/** Freundlicher Vergleich mit dem letzten Durchgang – nie tadelnd. */
export function comparison(rate: number, previousRate: number | null): string | null {
  if (previousRate === null) return null;
  const diff = rate - previousRate;
  if (diff >= 5) return `${diff} Prozentpunkte mehr auf Anhieb als beim letzten Mal.`;
  if (diff <= -5) return `Beim letzten Mal waren es ${previousRate} %. Jeder Durchgang festigt das Wissen.`;
  return `Ungefähr wie beim letzten Mal (${previousRate} %) – schön beständig.`;
}
