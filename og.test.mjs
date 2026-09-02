import { describe, expect, it } from 'vitest';
import { ogImageOptions } from './src/lib/og';

// Spec 004: the Open Graph image must be an optimized output, never the
// original file. Astro's service passes the original through when the
// requested width and format both equal the source's — observed on a
// 1200px JPEG at the post-build GPS scan (T312) — so the one case that
// would match asks for a pixel less.

const meta = (width, format) => ({ src: '/x', width, height: 800, format });

describe('OG image options (T312)', () => {
  it('a wide source is resized to 1200 as jpg — a real transform', () => {
    expect(ogImageOptions(meta(1800, 'jpg'))).toEqual({
      src: meta(1800, 'jpg'),
      width: 1200,
      format: 'jpg',
    });
  });

  it('a source-width jpg request would pass the original through, so it asks for one pixel less', () => {
    expect(ogImageOptions(meta(1200, 'jpg')).width).toBe(1199);
    expect(ogImageOptions(meta(1200, 'jpeg')).width).toBe(1199);
    expect(ogImageOptions(meta(800, 'jpg')).width).toBe(799);
  });

  it('a format change is a transform on its own, so the width stays', () => {
    expect(ogImageOptions(meta(1200, 'png')).width).toBe(1200);
    expect(ogImageOptions(meta(1200, 'webp')).width).toBe(1200);
    expect(ogImageOptions(meta(1200, 'webp')).format).toBe('jpg');
  });
});
