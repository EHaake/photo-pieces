import type { ImageMetadata } from 'astro';

/**
 * The gallery page's layout knobs (spec 004, T307R; extended spec 011) —
 * the one place their values live. The page hands them to the CSS as four
 * custom properties on the row container (global.css's `.gallery-flow`
 * reads `--gallery-short`, `--gallery-stretch`, `--gallery-width`, and
 * `--gallery-gap` and declares none) and derives each cell's srcset
 * ceiling and `sizes` from the same numbers, so the two can't drift. The
 * density is format-aware (spec 011): `--gallery-short` clamps on `vmin`,
 * sizing off the smaller viewport dimension.
 */

/** The density clamp CEILING, in CSS px — the largest common short side,
 *  reached on a wide or tall/square screen (spec 011 gate, 2026-09-09).
 *  This is the density knob: it drives both the emitted `--gallery-short`
 *  clamp ceiling AND `galleryCell`'s srcset ceiling, so the two can't drift. */
export const GALLERY_SHORT_PX = 460;
/** The density clamp FLOOR, in CSS px (spec 011). CSS-only — like the width
 *  and gap, it does not feed the srcset. */
export const GALLERY_SHORT_MIN_PX = 280;
/** How far a short row may stretch to fill the width (cap knob). */
export const GALLERY_STRETCH = 1.35;

/** The outer width the packed rows run to (spec 011 gate, 2026-09-09): a
 *  viewport bleed, wider than the text column, capped to the viewport by the
 *  breakout's min(). CSS-only — the density, not this, sets the per-cell
 *  srcset ceiling, so a wider row never asks for a larger image. */
export const GALLERY_WIDTH = 'calc(100vw - 2 * var(--page-pad))';
/** The gap between frames (spec 011 gate): one full baseline. CSS-only. */
export const GALLERY_GAP = 'calc(var(--baseline))';

/** The related strip on an image page (spec 006): the same packing
 *  rule at a smaller short side, so a handful of frames read as a row
 *  of thumbnails in the reading column. Below the 720px collapse the
 *  strip keeps two or three per row (the gallery goes to one), so its
 *  narrow short side is the clamp's floor, not the viewport. */
export const RELATED_SHORT_PX = 120;
export const RELATED_NARROW_SHORT_PX = 96;

/** Inline style for the `.gallery-flow` container. The short side is
 *  format-aware (spec 011 gate): `vmin` sizes off the smaller viewport
 *  dimension, so a tall/square screen (e.g. the 16:18 LG DualUp) sizes up
 *  while a 16:10 laptop stays near ~320. Floor/ceiling from the constants. */
export const galleryFlowStyle = `--gallery-short: clamp(${GALLERY_SHORT_MIN_PX}px, 33vmin, ${GALLERY_SHORT_PX}px); --gallery-stretch: ${GALLERY_STRETCH}; --gallery-width: ${GALLERY_WIDTH}; --gallery-gap: ${GALLERY_GAP}`;

/** Inline style for a related strip: a `.gallery-flow` at the smaller
 *  short side, the same stretch cap. */
export const relatedFlowStyle = `--gallery-short: clamp(${RELATED_NARROW_SHORT_PX}px, 13vw, ${RELATED_SHORT_PX}px); --gallery-stretch: ${GALLERY_STRETCH}`;

/** Per-cell data: the ratio the CSS needs, and image sizing that
 *  matches the widest the cell can grow to, at 2× density. `short` is
 *  the target short side the container was given; `narrowShort` the
 *  short side below the collapse, or undefined for the gallery's one
 *  frame per row at 94vw. */
export function galleryCell(
  image: ImageMetadata,
  short: number = GALLERY_SHORT_PX,
  narrowShort?: number,
) {
  const ratio = image.width / image.height;
  const w = Math.max(ratio, 1);
  const widest = Math.round(short * w * GALLERY_STRETCH);
  const narrow = narrowShort ? `${Math.round(narrowShort * w * GALLERY_STRETCH)}px` : '94vw';
  return {
    ar: Math.round(ratio * 1000) / 1000,
    width: Math.min(image.width, widest * 2),
    sizes: `(min-width: 720px) ${widest}px, ${narrow}`,
  };
}
