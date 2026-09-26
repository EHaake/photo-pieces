/**
 * The loupe (spec 019): its tunables, the getImage() options for the
 * file it zooms into (T1710), and the pure state the controller runs
 * (T1711) — no DOM. A round is a value here and its row in
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

/** A point in the photograph's box, CSS px from its top left. */
export type LoupePoint = { x: number; y: number };
/** The photograph's box at the fit, CSS px. */
export type LoupeBox = { width: number; height: number };
/** The layer's `translate(tx, ty) scale(s)`, origin top left; `s` is 1 at the fit. */
export type LoupeView = { s: number; tx: number; ty: number };
/** A press on the zoomed photograph: where it began, the view then, whether it has become a drag, whether it is still down. */
export type LoupePress = { start: LoupePoint; from: LoupeView; dragged: boolean; down: boolean };
/** The loupe's level, its view, and the press in hand. */
export type LoupeState = { level: 'fit' | 'zoomed'; view: LoupeView; press: LoupePress | null };
/** What the controller hears: pointer, wheel, pinch and keys. `on` is where a click landed: the photograph, or the mat and the ground around it. */
export type LoupeAction =
  | { type: 'click'; point: LoupePoint; on: 'photo' | 'around' }
  | { type: 'dblclick'; point: LoupePoint }
  | { type: 'press'; point: LoupePoint }
  | { type: 'move'; point: LoupePoint }
  | { type: 'release' }
  | { type: 'wheel'; point: LoupePoint; deltaY: number }
  | { type: 'pinch'; point: LoupePoint; ratio: number }
  | { type: 'key'; key: string };
/** The one thing the page does after an action: build the loupe, take it down, leave the quiet view, step the set, or nothing. */
export type LoupeEffect = 'open' | 'close' | 'leave-quiet' | 'step-prev' | 'step-next' | 'none';
/** The tunables `loupeReduce` reads, widened so a test can pass another value. */
export type LoupeTuning = {
  opensOn: 'click' | 'dblclick' | 'gesture';
  pinch: boolean;
  wheelStep: number;
  keyStep: number;
  panStep: number;
  dragSlop: number;
  zoomInKeys: readonly string[];
  zoomOutKeys: readonly string[];
};
/** The photograph's box, its full-detail scale (`fullScale`), and any tunable other than LOUPE's. */
export type LoupeContext = { box: LoupeBox; full: number; tune?: Partial<LoupeTuning> };
/** The new state and its one effect. */
export type LoupeStep = { state: LoupeState; effect: LoupeEffect };

/** The view at the fit. */
const FIT_VIEW: LoupeView = { s: 1, tx: 0, ty: 0 };

/** The loupe before any action: at the fit, nothing pressed. */
export const LOUPE_AT_FIT: LoupeState = { level: 'fit', view: FIT_VIEW, press: null };

/** Full detail over the fit: the largest file's natural width over the fit's device pixels, at `pixelRatio`; loupe-ready at `minGain` or more. */
export function fullScale(
  { natural, fit, dpr }: { natural: number; fit: number; dpr: number },
  pixelRatio: number = LOUPE.pixelRatio,
): number {
  return natural / (fit * dpr * pixelRatio);
}

/** The view panned back until the photograph covers its box. */
export function clampPan(view: LoupeView, box: LoupeBox): LoupeView {
  const clamp = (t: number, edge: number) => Math.min(0, Math.max(edge * (1 - view.s), t));
  return { s: view.s, tx: clamp(view.tx, box.width), ty: clamp(view.ty, box.height) };
}

/** The view at `scale` with `point` held under the pointer (t′ = p − (p − t) × s′ / s), then clamped to cover the box. */
export function zoomAbout(
  view: LoupeView,
  point: LoupePoint,
  scale: number,
  box: LoupeBox,
): LoupeView {
  const k = scale / view.s;
  return clampPan(
    { s: scale, tx: point.x - (point.x - view.tx) * k, ty: point.y - (point.y - view.ty) * k },
    box,
  );
}

/**
 * The loupe's state machine (plan, "The loupe's state"). At the fit:
 * an open by `opensOn` goes to full detail about the point; a wheel, a
 * pinch or a zoom-in key zooms from 1 (a key about the centre) — each
 * `open`; Escape and a click around the photograph leave the quiet
 * view; ← and → step the set. Zoomed: a press that moves past
 * `dragSlop` is a drag and pans; a click without one goes back to the
 * fit; Escape goes back to the fit; the arrows pan by `panStep` of the
 * box; the zoom keys, the wheel and the pinch zoom between 1 and full
 * detail, and reaching 1 is `close`. Escape always steps back one level.
 */
export function loupeReduce(state: LoupeState, action: LoupeAction, ctx: LoupeContext): LoupeStep {
  const tune: LoupeTuning = { ...LOUPE, ...ctx.tune };
  const { box } = ctx;
  const full = Math.max(1, ctx.full);
  const centre = { x: box.width / 2, y: box.height / 2 };
  const stay: LoupeStep = { state, effect: 'none' };
  const zoomed = state.level === 'zoomed';
  /** The view zoomed to `scale` (kept within 1 and full detail) about `point`: back to the fit at 1. */
  const zoomTo = (scale: number, point: LoupePoint): LoupeStep => {
    const s = Math.min(full, scale);
    if (s <= 1) return zoomed ? { state: LOUPE_AT_FIT, effect: 'close' } : stay;
    const view = zoomAbout(state.view, point, s, box);
    return { state: { level: 'zoomed', view, press: null }, effect: zoomed ? 'none' : 'open' };
  };

  switch (action.type) {
    case 'click':
      if (zoomed) {
        if (state.press?.dragged) return { state: { ...state, press: null }, effect: 'none' };
        return { state: LOUPE_AT_FIT, effect: 'close' };
      }
      if (action.on === 'around') return { state, effect: 'leave-quiet' };
      return tune.opensOn === 'click' ? zoomTo(full, action.point) : stay;
    case 'dblclick':
      return !zoomed && tune.opensOn === 'dblclick' ? zoomTo(full, action.point) : stay;
    case 'press':
      if (!zoomed) return stay;
      return {
        state: {
          ...state,
          press: { start: action.point, from: state.view, dragged: false, down: true },
        },
        effect: 'none',
      };
    case 'move': {
      const press = state.press;
      if (!zoomed || !press?.down) return stay;
      const dx = action.point.x - press.start.x;
      const dy = action.point.y - press.start.y;
      const dragged = press.dragged || Math.hypot(dx, dy) > tune.dragSlop;
      if (!dragged) return stay;
      const view = clampPan(
        { s: press.from.s, tx: press.from.tx + dx, ty: press.from.ty + dy },
        box,
      );
      return { state: { ...state, view, press: { ...press, dragged } }, effect: 'none' };
    }
    case 'release':
      if (!state.press?.down) return stay;
      return { state: { ...state, press: { ...state.press, down: false } }, effect: 'none' };
    case 'wheel':
      return zoomTo(state.view.s * Math.exp(-action.deltaY * tune.wheelStep), action.point);
    case 'pinch':
      return tune.pinch ? zoomTo(state.view.s * action.ratio, action.point) : stay;
    case 'key': {
      const { key } = action;
      if (key === 'Escape')
        return zoomed ? { state: LOUPE_AT_FIT, effect: 'close' } : { state, effect: 'leave-quiet' };
      if (tune.zoomInKeys.includes(key)) return zoomTo(state.view.s * tune.keyStep, centre);
      if (tune.zoomOutKeys.includes(key)) return zoomTo(state.view.s / tune.keyStep, centre);
      const pan: Record<string, [number, number]> = {
        ArrowLeft: [1, 0],
        ArrowRight: [-1, 0],
        ArrowUp: [0, 1],
        ArrowDown: [0, -1],
      };
      if (!(key in pan)) return stay;
      if (!zoomed) {
        if (key === 'ArrowLeft') return { state, effect: 'step-prev' };
        if (key === 'ArrowRight') return { state, effect: 'step-next' };
        return stay;
      }
      const [px, py] = pan[key];
      const { view } = state;
      const moved = {
        s: view.s,
        tx: view.tx + px * tune.panStep * box.width,
        ty: view.ty + py * tune.panStep * box.height,
      };
      return { state: { ...state, view: clampPan(moved, box) }, effect: 'none' };
    }
  }
}
