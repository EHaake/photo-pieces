/**
 * The image page's stage `sizes` hint (spec 017): the frame's width
 * rule from global.css — `min(calc(L * q), calc(S * r))` with
 * L = min(--avail-w, --avail-h) and S = ⅔L on
 * `html:not([data-quiet]) .image-frame` — spelled in literals, because
 * a `sizes` attribute cannot read a custom property. The literals
 * mirror five tokens: --page-pad (`clamp(1rem, 3vw, 2rem)`),
 * --block-margin (the stage's --stage-pad, 3rem), --frame-nav-h (both
 * widths, the half-baseline as 0.75rem), the --header-h fallback
 * (4.5rem) and the nav's own 719.98px query. matte.test.mjs ("the
 * sizes hint agrees with the rule") evaluates this string against the
 * stylesheet's tokens over its grid of ratios and viewports, and pins
 * the query literal by string — retune them together.
 *
 * `100vh`, not `svh`: inside `sizes` the small-viewport unit is
 * unconfirmed, and on the measured viewports the two are equal. The
 * hint carries the fallback header, not the measured one, so where the
 * real header is taller it over-delivers by the difference.
 */

const AVAIL_W = 'calc(100vw - 2 * clamp(1rem, 3vw, 2rem))';
const availH = (nav: string) => `calc(100vh - 4.5rem - 2 * 3rem - ${nav})`;
const NAV = 'calc(0.78rem * 1.362 + 0.75rem)';
const NAV_PHONE = 'calc(0.78rem * 1.362 * 2 + 1rem + 0.75rem)';

/** The nav's own query, mirrored: below it the nav wraps to two rows. */
export const PHONE = '(max-width: 719.98px)';

const long = (nav: string) => `min(${AVAIL_W}, ${availH(nav)})`;

/** The stage image's `sizes` for a frame of ratio `ar` (width ÷ height). */
export function stageSizes(ar: number): string {
  const q = Math.min(ar, 1);
  const r = Math.max(ar, 1);
  // The rule: min(L·q, S·r) with S = ⅔L — the coefficients written as numbers.
  const width = (nav: string) =>
    `min(calc(${long(nav)} * ${q}), calc(${long(nav)} * ${(2 * r) / 3}))`;
  return `${PHONE} ${width(NAV_PHONE)}, ${width(NAV)}`;
}
