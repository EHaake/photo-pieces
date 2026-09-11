import { describe, expect, it } from 'vitest';
import {
  GALLERY_SHORT_PX,
  GALLERY_SHORT_MIN_PX,
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
// to the density constant is caught). The gate's values landed at T904
// (2026-09-09): density `clamp(280px, 33vmin, 460px)`, width the bleed,
// gap one baseline.

describe('gallery layout knobs (T902, spec 011)', () => {
  it('galleryFlowStyle emits all four custom properties', () => {
    // Constant-built: the shape and the three inert knobs, so a
    // hardcoded divergence in the style string fails here.
    expect(galleryFlowStyle).toContain(
      `--gallery-short: clamp(${GALLERY_SHORT_MIN_PX}px, 33vmin, ${GALLERY_SHORT_PX}px)`,
    );
    expect(galleryFlowStyle).toContain(`--gallery-stretch: ${GALLERY_STRETCH}`);
    expect(galleryFlowStyle).toContain(`--gallery-width: ${GALLERY_WIDTH}`);
    expect(galleryFlowStyle).toContain(`--gallery-gap: ${GALLERY_GAP}`);

    // Density anchor (gate value): a change to GALLERY_SHORT_PX
    // fails this even though the constant-built assertion tracks it.
    expect(galleryFlowStyle).toContain('--gallery-short: clamp(280px, 33vmin, 460px)');
    // The gate's values, pinned literally.
    expect(galleryFlowStyle).toContain('--gallery-width: calc(100vw - 2 * var(--page-pad))');
    expect(galleryFlowStyle).toContain('--gallery-gap: calc(var(--baseline))');
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

    // Density anchor (gate value): 460 * 1.5 * 1.35 = 932; cap 1864.
    expect(cell.sizes).toContain('(min-width: 720px) 932px');
    expect(cell.width).toBe(1864);
  });

  it('relatedFlowStyle does not widen the strip', () => {
    expect(relatedFlowStyle).not.toContain('--gallery-width');
    expect(relatedFlowStyle).not.toContain('--gallery-gap');
  });
});
