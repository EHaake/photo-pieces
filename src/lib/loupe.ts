/**
 * The loupe (spec 019): its tunables, the getImage() options for the
 * file it zooms into (T1710), and the pure state the controller runs
 * (T1711) — no DOM — and, after them, the controller itself (T1712),
 * which runs that state on the image page's stage. A round is a value
 * here and its row in loupe.test.mjs's `EXPECTED`.
 */

import type { ImageMetadata } from 'astro';
import { reducedMotion } from './motion';

/** The loupe's tunables, each one value in one place (plan, "The tuning envelope, placed"). */
export const LOUPE = {
  withoutDetail: true, // a photograph with no detail export still has the loupe, to its own file's full size
  pixelRatio: 1, // image pixels per device pixel at full detail (1: one to one)
  minGain: 1.05, // no loupe when full detail is less than this over the fit
  opensOn: 'click', // 'click' (a click on the photograph zooms) or 'gesture' (a click leaves; the wheel, a pinch or + opens it). The zoom-in key opens it under either
  pinch: true,
  wheelStep: 0.002, // scale × e^(−deltaY × step)
  keyStep: 1.5, // + and − multiply and divide the scale
  panStep: 0.15, // an arrow pans this share of the view
  dragSlop: 4, // px a press may move and still be a click
  pan: 'follow', // 'follow' (zoomed, the mouse's place over the box is the place shown) or 'drag' (only a drag pans)
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
 * given — the stage's <Image> gives none either.
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
  | { type: 'press'; point: LoupePoint }
  | { type: 'move'; point: LoupePoint }
  | { type: 'release' }
  | { type: 'hover'; point: LoupePoint }
  | { type: 'wheel'; point: LoupePoint; deltaY: number }
  | { type: 'pinch'; point: LoupePoint; ratio: number }
  | { type: 'key'; key: string };
/** The one thing the page does after an action: build the loupe, take it down, leave the quiet view, step the set, or nothing. */
export type LoupeEffect = 'open' | 'close' | 'leave-quiet' | 'step-prev' | 'step-next' | 'none';
/** The tunables `loupeReduce` reads, widened so a test can pass another value. */
export type LoupeTuning = {
  opensOn: 'click' | 'gesture';
  pinch: boolean;
  wheelStep: number;
  keyStep: number;
  panStep: number;
  dragSlop: number;
  pan: 'follow' | 'drag';
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
 * a click on the photograph goes to full detail about the point, or
 * under `opensOn: 'gesture'` leaves the quiet view; a wheel, a pinch or
 * a zoom-in key zooms from 1 (a key about the centre) — each `open`;
 * Escape and a click around the photograph leave the quiet view; ← and
 * → step the set. Zoomed: a press that moves past
 * `dragSlop` is a drag and pans; under `pan: 'follow'` a mouse over the
 * box without a press pans to its place — at fraction (fx, fy) of the
 * box, `tx = fx · w(1 − s)`, `ty = fy · h(1 − s)`; a click without a drag goes back to the
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
      if (action.on === 'around' || tune.opensOn === 'gesture')
        return { state, effect: 'leave-quiet' };
      return zoomTo(full, action.point);
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
    case 'hover': {
      if (!zoomed || tune.pan !== 'follow') return stay;
      const share = (at: number, edge: number) =>
        edge > 0 ? Math.min(1, Math.max(0, at / edge)) : 0;
      const { s } = state.view;
      const view = {
        s,
        tx: share(action.point.x, box.width) * box.width * (1 - s),
        ty: share(action.point.y, box.height) * box.height * (1 - s),
      };
      return { state: { ...state, view }, effect: 'none' };
    }
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

/** The controller the image page asks first, in the quiet view. */
export type Loupe = {
  /** Back to the fit at once, then, in the quiet view, re-read whether full detail gains `minGain` over the fit — `data-loupe-ready`. */
  refresh: () => void;
  /** Back to the fit at once: the overlay taken down, no press in hand. */
  reset: () => void;
  /** A click on the stage in the quiet view, and its effect; `leave-quiet` is the page's to act on. */
  click: (event: MouseEvent) => LoupeEffect;
  /** A key in the quiet view, and its effect; null when the key is not the loupe's. */
  key: (event: KeyboardEvent) => LoupeEffect | null;
};

/**
 * The loupe on the image page's stage (plan, "The loupe, wired"): the
 * controller the page makes in init() when the stage carries
 * `data-loupe-src`, running `loupeReduce` on the stage's clicks,
 * presses, a mouse's hover, wheel, pinch (two pointers, or Safari's gesture events) and
 * the page's keys.
 *
 * An overlay, not the stage image. On `open` it builds `div.loupe` over
 * the photograph's own box, read from the image's rect, inside
 * `.image-stage` (already `position: relative`), holding
 * `div.loupe-layer` whose `translate(tx, ty) scale(s)` it writes. So
 * the mat, the frame and the dark ground are untouched and not zoomed,
 * nothing spec 018 or the mat rule pinned on the stage image moves, and
 * taking the overlay down restores the page as it was. The layer holds
 * `img.loupe-base`, the stage image's `currentSrc` — already decoded, so
 * no request and nothing to wait for — and, once decoded,
 * `img.loupe-detail`, which fades in over it (its CSS animation).
 *
 * The loupe file is fetched only at the first `open`: `data-loupe-src`
 * is a data attribute, which the browser never fetches on its own, so
 * the quiet view and the page weigh what they did until the reader
 * zooms (the spec's "The loupe's cost"). One `new Image()` per page —
 * `src`, `decode()`, then appended — kept for the page's life, so a
 * second zoom requests nothing.
 *
 * Loupe-ready: `fullScale` of the loupe file over the photograph's
 * width at the quiet fit, at the screen's pixel ratio, reaches
 * `minGain` — re-read by `refresh()`, which the page calls on entering
 * the quiet view and on resize (a resize also resets to the fit). A
 * photograph that is not ready keeps the quiet view as it was: every
 * click is `around`, so every click leaves.
 *
 * Motion: a discrete zoom (a click, a key) glides on the
 * move duration — `data-glide`, written only when motion is not
 * reduced, removed on `transitionend`; a drag, the wheel and a pinch
 * follow the hand without it. A close that glides takes the overlay
 * down when it lands; without the glide, at once.
 */
export function createLoupe(stage: HTMLElement): Loupe | null {
  const img = stage.querySelector<HTMLImageElement>('.image-frame img');
  if (!img) return null;
  const root = document.documentElement;
  const src = stage.dataset.loupeSrc ?? '';
  const natural = Number(stage.dataset.loupeW);

  let ready = false;
  let state: LoupeState = LOUPE_AT_FIT;
  let overlay: { loupe: HTMLDivElement; layer: HTMLDivElement } | null = null;
  let detail: HTMLImageElement | null = null; // the loupe file, decoded
  let requested = false;
  const pointers = new Map<number, LoupePoint>();
  let spread = 0; // the two pointers' distance at the last pinch step
  let gestureScale = 0; // a Safari gesture's scale at its last step; 0 when none is in hand

  /** The photograph's box on screen; its size is the box at the fit. */
  const photo = () => img.getBoundingClientRect();
  const pointIn = (event: Pick<MouseEvent, 'clientX' | 'clientY'>, at = photo()): LoupePoint => ({
    x: event.clientX - at.left,
    y: event.clientY - at.top,
  });
  const inside = (point: LoupePoint, at: DOMRect) =>
    point.x >= 0 && point.y >= 0 && point.x <= at.width && point.y <= at.height;
  const quiet = () => root.hasAttribute('data-quiet');
  /** Whether the loupe hears the stage at all: zoomed, or ready at the fit. */
  const live = () => quiet() && (ready || state.level === 'zoomed');

  const fetchDetail = () => {
    if (requested) return;
    requested = true;
    const file = new Image();
    file.className = 'loupe-detail';
    file.alt = '';
    file.draggable = false;
    file.src = src;
    file.decode().then(
      () => {
        detail = file;
        overlay?.layer.append(file);
      },
      () => {
        /* the page's own file stays */
      },
    );
  };

  const takeDown = () => {
    overlay?.loupe.remove();
    overlay = null;
  };

  /** The glide landed: at the fit, the overlay comes down. */
  const settle = () => {
    if (!overlay) return;
    delete overlay.loupe.dataset.glide;
    if (state.level === 'fit') takeDown();
  };

  /** The overlay over the photograph's box, at the fit; one still gliding closed is taken up again. */
  const build = () => {
    if (overlay) return;
    const at = photo();
    const box = stage.getBoundingClientRect();
    const loupe = document.createElement('div');
    loupe.className = 'loupe';
    loupe.style.left = `${at.left - box.left - stage.clientLeft}px`;
    loupe.style.top = `${at.top - box.top - stage.clientTop}px`;
    loupe.style.width = `${at.width}px`;
    loupe.style.height = `${at.height}px`;
    const layer = document.createElement('div');
    layer.className = 'loupe-layer';
    layer.style.width = `${at.width}px`;
    layer.style.height = `${at.height}px`;
    layer.style.transform = 'translate(0px, 0px) scale(1)';
    const base = new Image();
    base.className = 'loupe-base';
    base.alt = '';
    base.draggable = false;
    base.src = img.currentSrc || img.src;
    layer.append(base);
    if (detail) layer.append(detail);
    loupe.append(layer);
    loupe.addEventListener('dragstart', (event) => event.preventDefault());
    layer.addEventListener('transitionend', (event) => {
      if (event.target === layer && event.propertyName === 'transform') settle();
    });
    stage.append(loupe);
    void layer.offsetWidth; // the fit is the glide's start
    overlay = { loupe, layer };
    fetchDetail();
  };

  /** The layer to the state's view: gliding for a discrete zoom, with the hand otherwise. */
  const write = (glide: boolean) => {
    if (!overlay) return;
    const { loupe, layer } = overlay;
    delete loupe.dataset.glide;
    if (!reducedMotion() && glide) loupe.dataset.glide = '';
    const { s, tx, ty } = state.view;
    layer.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    if ('glide' in loupe.dataset) {
      if (layer.getAnimations().length === 0) settle(); // nothing to glide: landed already
    } else if (state.level === 'fit') takeDown();
  };

  /** One action through the state machine, and the view it leaves written. */
  const run = (action: LoupeAction, glide: boolean): LoupeStep => {
    const at = photo();
    const step = loupeReduce(state, action, {
      box: { width: at.width, height: at.height },
      full: fullScale({ natural, fit: at.width, dpr: window.devicePixelRatio || 1 }),
    });
    const moved = step.state.view !== state.view || step.state.level !== state.level;
    state = step.state;
    if (step.effect === 'open') build();
    if (overlay && moved) write(glide);
    const press = state.press;
    overlay?.loupe.toggleAttribute('data-dragging', Boolean(press?.dragged && press.down));
    return step;
  };

  const reset = () => {
    state = LOUPE_AT_FIT;
    pointers.clear();
    spread = 0;
    gestureScale = 0;
    takeDown();
  };

  // A drag, and a pinch from two pointers, over the photograph.
  const distance = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const middle = (): LoupePoint => {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  stage.addEventListener('pointerdown', (event) => {
    if (!live() || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const at = photo();
    const point = pointIn(event, at);
    if (!inside(point, at)) return;
    pointers.set(event.pointerId, point);
    if (pointers.size === 1) {
      if (overlay && state.level === 'zoomed') overlay.loupe.setPointerCapture(event.pointerId);
      run({ type: 'press', point }, false);
    } else if (pointers.size === 2) {
      run({ type: 'release' }, false); // two fingers pinch; they do not drag
      spread = distance();
    }
  });
  stage.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) {
      // A mouse with no press follows (LOUPE.pan); touch and pen only drag.
      if (event.pointerType === 'mouse' && state.level === 'zoomed' && live())
        run({ type: 'hover', point: pointIn(event) }, false);
      return;
    }
    const point = pointIn(event);
    pointers.set(event.pointerId, point);
    if (pointers.size === 1) run({ type: 'move', point }, false);
    else if (pointers.size === 2) {
      const now = distance();
      if (spread > 0 && now > 0)
        run({ type: 'pinch', point: middle(), ratio: now / spread }, false);
      spread = now;
    }
  });
  const lift = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return;
    if (pointers.size === 0) run({ type: 'release' }, false);
    spread = pointers.size === 2 ? distance() : 0;
  };
  stage.addEventListener('pointerup', lift);
  stage.addEventListener('pointercancel', lift);

  // The wheel zooms over the photograph, and only there keeps the page
  // from scrolling — so the listener cannot be passive. A line or a page
  // of delta is read in pixels.
  stage.addEventListener(
    'wheel',
    (event) => {
      if (!live()) return;
      const at = photo();
      const point = pointIn(event, at);
      if (!inside(point, at)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? at.height : 1;
      run({ type: 'wheel', point, deltaY: event.deltaY * unit }, false);
    },
    { passive: false },
  );

  // Safari reports a trackpad pinch as gesturestart / gesturechange /
  // gestureend, not as a ctrl+wheel: the ratio of successive `scale`
  // values is the pinch, and over the photograph each of the three is
  // cancelled, so the page does not zoom instead. GestureEvent is
  // Safari's alone, so it is typed here as far as it is read.
  type Gesture = Event & { scale: number; clientX: number; clientY: number };
  stage.addEventListener(
    'gesturestart',
    (event) => {
      if (!live()) return;
      const at = photo();
      if (!inside(pointIn(event as Gesture, at), at)) return;
      event.preventDefault();
      gestureScale = 1;
    },
    { passive: false },
  );
  stage.addEventListener(
    'gesturechange',
    (event) => {
      if (gestureScale <= 0 || !live()) return;
      event.preventDefault();
      const gesture = event as Gesture;
      if (!(gesture.scale > 0)) return;
      run({ type: 'pinch', point: pointIn(gesture), ratio: gesture.scale / gestureScale }, false);
      gestureScale = gesture.scale;
    },
    { passive: false },
  );
  stage.addEventListener(
    'gestureend',
    (event) => {
      if (gestureScale <= 0) return;
      event.preventDefault();
      gestureScale = 0;
    },
    { passive: false },
  );

  return {
    refresh: () => {
      reset();
      if (!stage.isConnected || !quiet()) return;
      const { width } = photo();
      ready =
        width > 0 &&
        fullScale({ natural, fit: width, dpr: window.devicePixelRatio || 1 }) >= LOUPE.minGain;
      stage.toggleAttribute('data-loupe-ready', ready);
    },
    reset,
    click: (event) => {
      const at = photo();
      const point = pointIn(event, at);
      const on = ready && inside(point, at) ? 'photo' : 'around';
      return run({ type: 'click', point, on }, true).effect;
    },
    key: (event) => {
      if (!ready && state.level === 'fit') return null;
      const before = state;
      const step = run({ type: 'key', key: event.key }, true);
      return step.state === before && step.effect === 'none' ? null : step.effect;
    },
  };
}
