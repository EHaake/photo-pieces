import { describe, expect, it } from 'vitest';
import {
  GALLERY_SHORT_PX,
  GALLERY_STRETCH,
  GALLERY_WIDTH,
  GALLERY_GAP,
  galleryFlowStyle,
  relatedFlowStyle,
  galleryCell,
} from './src/lib/gallery-layout.ts';

// The gallery's packing knobs (spec 004, extended by spec 011): one
// source (src/lib/gallery-layout.ts) feeds both the CSS custom
// properties the row container carries and the srcset/`sizes` math per
// cell, so the two can't drift. Each data test holds both a
// constant-built assertion (so a hardcoded divergence in the style
// string is caught) and a current-literal density anchor (so a change
// to the density constant is caught). The density literals below are
// today's inert-default values; they update at T904 when the gate's
// value lands.

describe('gallery layout knobs (T902, spec 011)', () => {
  it('galleryFlowStyle emits all four custom properties', () => {
    // Constant-built: the shape and the three inert knobs, so a
    // hardcoded divergence in the style string fails here.
    expect(galleryFlowStyle).toContain(
      `--gallery-short: clamp(200px, 26vw, ${GALLERY_SHORT_PX}px)`,
    );
    expect(galleryFlowStyle).toContain(`--gallery-stretch: ${GALLERY_STRETCH}`);
    expect(galleryFlowStyle).toContain(`--gallery-width: ${GALLERY_WIDTH}`);
    expect(galleryFlowStyle).toContain(`--gallery-gap: ${GALLERY_GAP}`);

    // Density anchor (today's value): a change to GALLERY_SHORT_PX
    // fails this even though the constant-built assertion tracks it.
    expect(galleryFlowStyle).toContain('--gallery-short: clamp(200px, 26vw, 280px)');
    // The inert-default values, pinned literally.
    expect(galleryFlowStyle).toContain('--gallery-width: var(--content-width)');
    expect(galleryFlowStyle).toContain('--gallery-gap: calc(var(--baseline) * 0.75)');
  });

  it('galleryCell density drives the srcset ceiling and the width cap', () => {
    const image = { width: 3000, height: 2000 };
    const ratio = image.width / image.height;
    const w = Math.max(ratio, 1);
    const widest = Math.round(GALLERY_SHORT_PX * w * GALLERY_STRETCH);
    const cell = galleryCell(image);

    // Constant-built: same numbers as the emitted property.
    expect(cell.sizes).toContain(`(min-width: 720px) ${widest}px`);
    expect(cell.width).toBe(Math.min(image.width, widest * 2));

    // Density anchor (today's value): 280 * 1.5 * 1.35 = 567; cap 1134.
    expect(cell.sizes).toContain('(min-width: 720px) 567px');
    expect(cell.width).toBe(1134);
  });

  it('relatedFlowStyle does not widen the strip', () => {
    expect(relatedFlowStyle).not.toContain('--gallery-width');
    expect(relatedFlowStyle).not.toContain('--gallery-gap');
  });
});
