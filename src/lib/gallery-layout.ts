import type { ImageMetadata } from 'astro';

/**
 * The gallery page's layout knobs (spec 004, T307R) — the one place
 * their values live. The page hands them to the CSS as custom
 * properties on the row container (global.css's `.gallery-flow` reads
 * `--gallery-short` and `--gallery-stretch` and declares neither) and
 * derives each cell's srcset ceiling and `sizes` from the same numbers,
 * so the two can't drift.
 */

/** The common short side at desktop width, in CSS px (density knob). */
export const GALLERY_SHORT_PX = 280;
/** How far a short row may stretch to fill the width (cap knob). */
export const GALLERY_STRETCH = 1.35;

/** The related strip on an image page (spec 006): the same packing
 *  rule at a smaller short side, so a handful of frames read as a row
 *  of thumbnails in the reading column. */
export const RELATED_SHORT_PX = 120;

/** Inline style for the `.gallery-flow` container. Below ~1080px wide
 *  the short side follows the viewport so rows keep two or three cells. */
export const galleryFlowStyle = `--gallery-short: clamp(200px, 26vw, ${GALLERY_SHORT_PX}px); --gallery-stretch: ${GALLERY_STRETCH}`;

/** Inline style for a related strip: a `.gallery-flow` at the smaller
 *  short side, the same stretch cap. */
export const relatedFlowStyle = `--gallery-short: clamp(96px, 13vw, ${RELATED_SHORT_PX}px); --gallery-stretch: ${GALLERY_STRETCH}`;

/** Per-cell data: the ratio the CSS needs, and image sizing that
 *  matches the widest the cell can grow to, at 2× density. `short` is
 *  the target short side the container was given. */
export function galleryCell(image: ImageMetadata, short: number = GALLERY_SHORT_PX) {
  const ratio = image.width / image.height;
  const widest = Math.round(short * Math.max(ratio, 1) * GALLERY_STRETCH);
  return {
    ar: Math.round(ratio * 1000) / 1000,
    width: Math.min(image.width, widest * 2),
    sizes: `(min-width: 720px) ${widest}px, 94vw`,
  };
}
