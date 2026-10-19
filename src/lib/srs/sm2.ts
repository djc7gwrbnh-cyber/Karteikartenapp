/*
 * Vereinfachte SM-2-Variante (Spaced Repetition), als reine Funktion.
 *
 * Gewusst:       Intervall 1 Tag → 3 Tage → Intervall × Leichtigkeitsfaktor; Faktor +0,1
 * Nicht gewusst: Intervall zurück auf 1 Tag; Faktor −0,2 (nie unter 1,3)
 *
 * Bewertet wird nur der erste Kontakt einer Karte in einer Sitzung. Wird eine Karte am selben
 * Tag erneut gewusst, wächst das Intervall nicht ein zweites Mal.
 */
import { addDays } from '../dates';
import type { SrsFields } from '../db/types';

export const START_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const EASE_UP = 0.1;
export const EASE_DOWN = 0.2;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function review(state: SrsFields, knew: boolean, today: string): SrsFields {
  if (!knew) {
    return {
      ...state,
      reps: 0,
      interval: 1,
      ease: round2(Math.max(MIN_EASE, state.ease - EASE_DOWN)),
      due: addDays(today, 1),
      wrong: state.wrong + 1,
      lastStudied: today
    };
  }

  if (state.lastStudied === today && state.reps > 0) {
    // Heute schon erfolgreich gelernt: zählen, aber nicht weiter in die Zukunft schieben.
    return { ...state, correct: state.correct + 1 };
  }

  const reps = state.reps + 1;
  let interval: number;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 3;
  else interval = Math.max(state.interval + 1, Math.round(state.interval * state.ease));

  return {
    ...state,
    reps,
    interval,
    ease: round2(Math.min(MAX_EASE, state.ease + EASE_UP)),
    due: addDays(today, interval),
    correct: state.correct + 1,
    lastStudied: today
  };
}

export function pickSrs<T extends SrsFields>(card: T): SrsFields {
  const { reps, ease, interval, due, correct, wrong, lastStudied } = card;
  return { reps, ease, interval, due, correct, wrong, lastStudied };
}
