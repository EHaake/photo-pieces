import { describe, expect, it } from 'vitest';
import { LOUPE, loupeImageOptions } from './src/lib/loupe.ts';

// The loupe (spec 019).
//
// (a) The file (T1710). `EXPECTED` below is the tunables' one other
//     copy: every LOUPE key and value, so a value retyped in loupe.ts
//     alone fails naming its key, and a key added or dropped fails the
//     name set. And the loupe's file: webp at the source's full size — a
//     format change, so a real transform that strips metadata — capped at
//     WebP's 16383px edge on the longer side, and one pixel less when the
//     source is already webp, the one request Astro's service would pass
//     through as the original. The build's side (the page's
//     `data-loupe-*`, the detail's original pruned, its transform kept)
//     is the barrier's scan 1, scripts/check-private-files.mjs.

/** The tunables, verbatim as src/lib/loupe.ts carries them: to retune,
 *  move the value in src/lib/loupe.ts and here. */
const EXPECTED = {
  LOUPE: {
    withoutDetail: true,
    pixelRatio: 1,
    minGain: 1.05,
    opensOn: 'click',
    pinch: true,
    wheelStep: 0.002,
    keyStep: 1.5,
    panStep: 0.15,
    dragSlop: 4,
    zoomInKeys: ['+', '='],
    zoomOutKeys: ['-', '_'],
  },
};

const meta = (width, height, format) => ({ src: '/x', width, height, format });

describe('(a) the file (T1710)', () => {
  it('LOUPE holds exactly EXPECTED — every key, every value, none missing or extra', () => {
    expect(Object.keys(LOUPE).sort()).toEqual(Object.keys(EXPECTED.LOUPE).sort());
    for (const [key, value] of Object.entries(EXPECTED.LOUPE)) {
      expect([key, LOUPE[key]]).toEqual([key, value]);
    }
  });

  it('a jpg source is asked for as webp at its full width — a format change, so a real transform', () => {
    expect(loupeImageOptions(meta(5400, 3600, 'jpg'))).toEqual({
      src: meta(5400, 3600, 'jpg'),
      width: 5400,
      format: 'webp',
      layout: 'none',
    });
  });

  it('a webp source at its own width would pass the original through, so it asks for one pixel less', () => {
    expect(loupeImageOptions(meta(2400, 1600, 'webp'))).toEqual({
      src: meta(2400, 1600, 'webp'),
      width: 2399,
      format: 'webp',
      layout: 'none',
    });
  });

  it("a source past WebP's 16383px edge is scaled until its longer edge fits", () => {
    expect(loupeImageOptions(meta(20000, 10000, 'jpg')).width).toBe(16383);
    expect(loupeImageOptions(meta(10000, 20000, 'jpg')).width).toBe(8191);
  });
});
