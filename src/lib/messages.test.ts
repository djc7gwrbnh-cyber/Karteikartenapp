import { describe, expect, it } from 'vitest';
import { messageOfDay } from './messages';
import { dailyMessages } from '../content/messages';

describe('Nachricht des Tages', () => {
  it('gibt es rund 60 Mal', () => {
    expect(dailyMessages.length).toBeGreaterThanOrEqual(55);
    expect(new Set(dailyMessages).size).toBe(dailyMessages.length);
  });

  it('ist am selben Tag stabil und wechselt täglich', () => {
    expect(messageOfDay('2026-05-01', [])).toBe(messageOfDay('2026-05-01', []));
    expect(messageOfDay('2026-05-01', [])).not.toBe(messageOfDay('2026-05-02', []));
  });

  it('blättert beim Tippen weiter', () => {
    expect(messageOfDay('2026-05-01', [], 1)).not.toBe(messageOfDay('2026-05-01', [], 0));
  });

  it('bevorzugt eigene Nachrichten', () => {
    const custom = ['Ich bin stolz auf dich.'];
    let own = 0;
    for (let i = 0; i < 30; i++) if (messageOfDay('2026-05-01', custom, i) === custom[0]) own++;
    expect(own).toBe(20);
  });

  it('kommt ohne Nachrichten aus', () => {
    expect(messageOfDay('2026-05-01', [], 0, [])).toBe('');
  });
});
