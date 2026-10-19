import { describe, expect, it } from 'vitest';
import { comparison, doneMessage } from './feedback';
import { doneGreat, doneTough } from '../../content/messages';

describe('Rückmeldung nach der Sitzung', () => {
  it('wählt passend zum Ergebnis und stabil je Sitzung', () => {
    expect(doneGreat).toContain(doneMessage(20, 19, 'abc'));
    expect(doneTough).toContain(doneMessage(20, 5, 'abc'));
    expect(doneMessage(20, 5, 'abc')).toBe(doneMessage(20, 5, 'abc'));
  });

  it('vergleicht freundlich', () => {
    expect(comparison(80, null)).toBeNull();
    expect(comparison(80, 60)).toContain('20 Prozentpunkte mehr');
    expect(comparison(50, 80)).toContain('80 %');
    expect(comparison(70, 72)).toContain('beständig');
  });
});
