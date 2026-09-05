import { describe, expect, it } from 'vitest';
import { RAMP, shape } from './src/lib/pause-shape.ts';

// Spec 007: the lights go up over the first 28 percent of the pinned
// stretch, hold, and go down over the last 28 — on a smooth curve.
describe('the pause shape (T505a)', () => {
  it('ramps are 28 percent of the stretch', () => {
    expect(RAMP).toBe(0.28);
  });

  it('is 0 at both ends and 1 across the held middle', () => {
    expect(shape(0)).toBe(0);
    expect(shape(1)).toBe(0);
    expect(shape(RAMP)).toBe(1);
    expect(shape(0.5)).toBe(1);
    expect(shape(1 - RAMP)).toBe(1);
  });

  it('is a smoothstep on each ramp: half-way up at half the ramp, symmetric', () => {
    expect(shape(RAMP / 2)).toBeCloseTo(0.5, 10);
    expect(shape(1 - RAMP / 2)).toBeCloseTo(0.5, 10);
    // Smooth, not linear: a quarter of the way up the ramp is below a
    // quarter (the curve starts flat).
    expect(shape(RAMP / 4)).toBeLessThan(0.25);
    expect(shape(RAMP / 4)).toBeCloseTo(0.15625, 10);
  });

  it('rises monotonically on the way up and falls on the way down', () => {
    let last = -1;
    for (let p = 0; p <= RAMP + 1e-9; p += RAMP / 20) {
      const v = shape(p);
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
    last = 2;
    for (let p = 1 - RAMP; p <= 1 + 1e-9; p += RAMP / 20) {
      const v = shape(p);
      expect(v).toBeLessThanOrEqual(last);
      last = v;
    }
  });
});
