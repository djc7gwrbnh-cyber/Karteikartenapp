import { describe, expect, it } from 'vitest';
import { clampRect, fitSize } from './compress';

describe('Bildgrößen', () => {
  it('verkleinert auf die maximale Kantenlänge', () => {
    expect(fitSize(4032, 3024, 1600)).toEqual({ w: 1600, h: 1200 });
    expect(fitSize(3024, 4032, 1600)).toEqual({ w: 1200, h: 1600 });
    expect(fitSize(800, 600, 1600)).toEqual({ w: 800, h: 600 });
  });

  it('hält den Zuschnitt im Bild', () => {
    expect(clampRect({ x: -10, y: 5, w: 50, h: 50 }, 100, 100, 20)).toEqual({ x: 0, y: 5, w: 50, h: 50 });
    expect(clampRect({ x: 80, y: 80, w: 50, h: 50 }, 100, 100, 20)).toEqual({ x: 50, y: 50, w: 50, h: 50 });
    expect(clampRect({ x: 0, y: 0, w: 5, h: 500 }, 100, 100, 20)).toEqual({ x: 0, y: 0, w: 20, h: 100 });
  });
});
