/**
 * The image page's stage `sizes` hint (spec 017; the share rule since
 * spec 019): the frame's width rule from global.css — a landscape
 * `min(calc(--avail-w * --stage-share-landscape), calc(--avail-h * ar))`,
 * a portrait `min(calc(--avail-h * --stage-share-portrait * ar), --avail-w)`,
 * on `html:not([data-quiet]) .image-frame[data-shape]` — spelled in
 * literals, because a `sizes` attribute cannot read a custom property.
 * The literals mirror seven tokens: --page-pad (`clamp(1rem, 3vw, 2rem)`),
 * --block-margin (the stage's --stage-pad, 3rem), --frame-nav-h (both
 * widths, the half-baseline as 0.75rem), the --header-h fallback
 * (4.75rem), the nav's own 719.98px query, and the two shares
 * (--stage-share-landscape and --stage-share-portrait, as STAGE_SHARE).
 * matte.test.mjs ("the sizes hint agrees with the rule") evaluates this
 * string against the stylesheet's tokens over its grid of ratios and
 * viewports, pins STAGE_SHARE to the two tokens and the query literal by
 * string — retune them together.
 *
 * `100vh`, not `svh`: inside `sizes` the small-viewport unit is
 * unconfirmed, and on the measured viewports the two are equal. The
 * hint carries the fallback header, not the measured one, so where the
 * real header is taller it over-delivers by the difference.
 */

const AVAIL_W = 'calc(100vw - 2 * clamp(1rem, 3vw, 2rem))';
const availH = (nav: string) => `calc(100vh - 4.75rem - 2 * 3rem - ${nav})`;
const NAV = 'calc(0.78rem * 1.362 + 0.75rem)';
const NAV_PHONE = 'calc(0.78rem * 1.362 * 2 + 1rem + 0.75rem)';

/** The nav's own query, mirrored: below it the nav wraps to two rows. */
export const PHONE = '(max-width: 719.98px)';

/** Tunable: a square is sized as a 'portrait' or a 'landscape'. */
export const STAGE_SQUARE = 'portrait';

/** Mirrors :root's --stage-share-landscape and --stage-share-portrait. */
export const STAGE_SHARE = { landscape: 1, portrait: 1 } as const;

/** The frame's shape, written as the stage figure's data-shape: wider
 *  than tall is a landscape, taller than wide a portrait, and a square
 *  follows STAGE_SQUARE. */
export function stageShape(ar: number): 'landscape' | 'portrait' {
  if (ar > 1) return 'landscape';
  if (ar < 1) return 'portrait';
  return STAGE_SQUARE;
}

/** The stage image's `sizes` for a frame of ratio `ar` (width ÷ height). */
export function stageSizes(ar: number): string {
  // The rule of stageShape(ar), the share and the ratio written as numbers.
  const width = (nav: string) =>
    stageShape(ar) === 'landscape'
      ? `min(calc(${AVAIL_W} * ${STAGE_SHARE.landscape}), calc(${availH(nav)} * ${ar}))`
      : `min(calc(${availH(nav)} * ${STAGE_SHARE.portrait * ar}), ${AVAIL_W})`;
  return `${PHONE} ${width(NAV_PHONE)}, ${width(NAV)}`;
}
