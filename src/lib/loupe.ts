/**
 * The loupe (spec 019): its tunables and the getImage() options for the
 * file it zooms into (T1710). A round is a value here and its row in
 * loupe.test.mjs's `EXPECTED`.
 */

import type { ImageMetadata } from 'astro';

/** The loupe's tunables, each one value in one place (plan, "The tuning envelope, placed"). */
export const LOUPE = {
  withoutDetail: true, // a photograph with no detail export still has the loupe, to its own file's full size
  pixelRatio: 1, // image pixels per device pixel at full detail (1: one to one)
  minGain: 1.05, // no loupe when full detail is less than this over the fit
  opensOn: 'click', // 'click', 'dblclick', or 'gesture' (only a wheel or a pinch opens it)
  pinch: true,
  wheelStep: 0.002, // scale × e^(−deltaY × step)
  keyStep: 1.5, // + and − multiply and divide the scale
  panStep: 0.15, // an arrow pans this share of the view
  dragSlop: 4, // px a press may move and still be a click
  zoomInKeys: ['+', '='],
  zoomOutKeys: ['-', '_'],
} as const;

/** WebP's largest edge, in pixels. */
const WEBP_MAX_EDGE = 16383;

/**
 * The getImage() options for the loupe's file: the detail export, or
 * the photograph's own file when it has none.
 *
 * Webp at the source's full size: full detail is one image pixel to one
 * device pixel of the largest file the photograph has, so the loupe asks
 * for every pixel, and the format change makes the request a real
 * transform, which strips the metadata an original may carry (spec
 * 004's contract: an original never reaches the output). No quality is
 * given — the stage's <Image> gives none either — so where the full
 * size equals a stage candidate's width Astro can serve one file for
 * both.
 *
 * WebP cannot hold an edge over 16383px, so a larger source is scaled
 * until its longer edge fits. And a webp source asked for at its own
 * width as webp is the shape Astro's service passes through untouched,
 * original bytes and all (og.ts guards the same case for jpg), so that
 * one case asks for one pixel less.
 *
 * Layout 'none': the site-wide constrained layout (astro.config) would
 * otherwise give this call a responsive set of widths, emitted and named
 * by no page; the loupe needs its one file.
 */
export function loupeImageOptions(source: ImageMetadata) {
  const longer = Math.max(source.width, source.height);
  const target =
    longer > WEBP_MAX_EDGE ? Math.floor((source.width * WEBP_MAX_EDGE) / longer) : source.width;
  const wouldPassThrough = target === source.width && source.format === 'webp';
  return {
    src: source,
    width: wouldPassThrough ? target - 1 : target,
    format: 'webp' as const,
    layout: 'none' as const,
  };
}
