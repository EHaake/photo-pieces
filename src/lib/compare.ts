/**
 * The compare block's state (spec 019, T1707): the tunables the tuning
 * envelope names, the block's words, and the pure rules the enhanced
 * block reads — no DOM — and, after them, the enhanced block itself
 * (T1708), which builds its chrome and runs its views on those rules. A
 * round is a value here and its row in compare.test.mjs's `EXPECTED`;
 * the slider's geometry is `sliderView` and its table.
 */

import { COMPARE_CLASSES as C } from './image-meta.mjs';
import { reducedMotion } from './motion';

/** The block's tunables, each one value in one place (plan, "The tuning envelope, placed"). */
export const COMPARE = {
  defaultMode: 'slider', // the method a block opens in when its author wrote none
  remember: 'visit', // the reader's choice: 'visit' (sessionStorage), 'always' (localStorage) or 'none'
  restAt: 0.5, // the slider's rest position on its track, 0–1 — which pair shows at rest
  snap: false, // on release the handle settles on the nearest stop
  sliderStep: 0.02, // an arrow key's step along the track (Page Up/Down: five steps)
  sideMinPx: 280, // the narrowest a stage may be shown side by side
  sideNarrow: 'stack', // where two won't fit: 'stack' them, or yield to 'switch'
  switchWraps: true, // the last stage advances to the first
  switchOnClick: true, // a click or a tap on the frame advances
  switchKeys: [' ', 'Enter', 'ArrowRight'], // the keys that advance the switch
  switchBackKeys: ['ArrowLeft'], // the keys that step the switch back
  legend: 'below', // 'below' or 'above' the frame
  control: 'with-legend', // the method control: 'with-legend' (the legend's row) or 'above'
  cornerTags: false, // spec 006's corner tags, returned on the showing stages
} as const;

/** The block's words; `modes`' keys are the three methods. */
export const COMPARE_WORDING = {
  modes: { slider: 'Slider', side: 'Side by side', switch: 'Switch' },
  control: 'How to compare',
  legend: 'Stages',
  handle: 'Move between the stages',
} as const;

/** Storage key for the reader's chosen method (per `COMPARE.remember`). */
export const COMPARE_MODE_KEY = 'compare-mode';

export type CompareMode = keyof typeof COMPARE_WORDING.modes;
/** Two neighbouring stages, the earlier on the left. */
export type ComparePair = { left: number; right: number };
/** The slider's pair and the divider's position, 0–100. */
export type SliderView = ComparePair & { split: number };
/** The switch's one showing stage. */
export type SwitchView = { stage: number };
export type CompareView = SliderView | ComparePair | SwitchView;

/** A string that names one of the three methods. */
const isMode = (value: unknown): value is CompareMode =>
  typeof value === 'string' && Object.hasOwn(COMPARE_WORDING.modes, value);

/** The method a block opens in: the stored choice if remembering and valid, else the author's, else the default. */
export function openingMode(
  authored: string | null | undefined,
  stored: string | null | undefined,
  remember: string = COMPARE.remember,
): CompareMode {
  if (remember !== 'none' && isMode(stored)) return stored;
  if (isMode(authored)) return authored;
  return COMPARE.defaultMode;
}

/** The slider at `p` ∈ [0, 1] over `n` stages: segments indexed from the right, an interior stop in the segment to its right. */
export function sliderView(p: number, n: number): SliderView {
  const at = Math.min(1, Math.max(0, p));
  const left = n - 2 - Math.min(Math.floor(at * (n - 1)), n - 2);
  return { left, right: left + 1, split: 100 * at };
}

/** The nearest stop to `p`, the stops at `k / (n − 1)`. */
export function snapTo(p: number, n: number): number {
  const at = Math.min(1, Math.max(0, p));
  return Math.round(at * (n - 1)) / (n - 1);
}

/** Side by side from stage `k`: it and the next, the last with the one before. */
export function sidePair(k: number, n: number): ComparePair {
  const left = Math.min(k, n - 2);
  return { left, right: left + 1 };
}

/** The switch's next stage from `i` in direction `dir`, wrapping per `COMPARE.switchWraps`. */
export function switchNext(
  i: number,
  n: number,
  dir: 1 | -1,
  wraps: boolean = COMPARE.switchWraps,
): number {
  const next = i + dir;
  if (wraps) return (next + n) % n;
  return Math.min(n - 1, Math.max(0, next));
}

/** A block's view at rest: the slider at `restAt`, side by side on the pair it shows, the switch on the first stage. */
export function restView(mode: 'slider', n: number): SliderView;
export function restView(mode: 'side', n: number): ComparePair;
export function restView(mode: 'switch', n: number): SwitchView;
export function restView(mode: CompareMode, n: number): CompareView;
export function restView(mode: CompareMode, n: number): CompareView {
  if (mode === 'switch') return { stage: 0 };
  const slider = sliderView(COMPARE.restAt, n);
  return mode === 'slider' ? slider : sidePair(slider.left, n);
}

/** The stage whose note is shown: the pair's later stage (the step being shown), or the switch's stage. */
export function noteIndex(mode: CompareMode, view: CompareView): number {
  return mode === 'switch' ? (view as SwitchView).stage : (view as ComparePair).right;
}

/** Whether a frame `width` px wide holds two stages side by side. */
export function sideFits(width: number): boolean {
  return width >= 2 * COMPARE.sideMinPx;
}

/**
 * The compare, enhanced (spec 006's compare, grown into the block at spec
 * 019, T1708). The static HTML — from the `:::compare` transform or the
 * image page's "Raw to finished" — is only the stages stacked as figures,
 * each with its label and note: the page without script, with nothing
 * dead in it. Everything else is built here, per `.compare` with two or
 * more stages: the method control (three buttons), the legend (one stop
 * per stage — spans in the slider, which marks the showing pair; buttons
 * in side by side and switch, which choose), the divider and the handle
 * (an ARIA slider), the live note, and the corner tags when
 * `COMPARE.cornerTags`; and the state the CSS reads — `data-js`,
 * `data-view`, `data-narrow`, each stage's `data-part`, `--split`, and the
 * two motion attributes (`data-settling` for a snap's glide, only when
 * motion is not reduced; `data-fresh` on every mode change, until the
 * panes' fade ends). The views are T1707's pure functions above.
 *
 * Where it runs (moved here at spec 018, T1604c): the enhanced block is
 * one box where the static page stacks the stages, so it must land
 * before the page settles: the initial astro:page-load fires on window's
 * load, after every image, and collapsing the stack there moved
 * everything below the figure ~555px (T1603c). So the layout's script
 * runs it at its module's evaluation (after the parse, before
 * DOMContentLoaded), beside the appearance hooks, and in
 * astro:before-swap on the new document for a page the router swaps in;
 * a figure already enhanced is skipped, so the first load binds its
 * handlers once. The image page's own script cannot do the second: the
 * router runs a new page's scripts after the swap's update callback is
 * done (router.js), so a first swap into a compare page would be
 * enhanced after the view transition's new snapshot, the router's scroll
 * and the first layout. A document not yet swapped in has no layout, so
 * the side-by-side fit is read on the next frame, once it is; after that
 * the one `resize` listener below re-reads it.
 */
export const enhanceCompare = (scope: Document) => {
  for (const root of scope.querySelectorAll<HTMLElement>(`.${C.root}`)) {
    if ('js' in root.dataset) continue;
    const frames = root.querySelector<HTMLElement>(`:scope > .${C.frames}`);
    const stages = frames ? [...frames.querySelectorAll<HTMLElement>(`:scope > .${C.stage}`)] : [];
    if (!frames || stages.length < 2) continue;
    enhance(root, frames, stages);
  }
};

/** Each enhanced block's fit re-read, for the one `resize` listener. */
const refits = new WeakMap<HTMLElement, () => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    for (const root of document.querySelectorAll<HTMLElement>(`.${C.root}[data-js]`))
      refits.get(root)?.();
  });
}

// The settings compared against more than their one value today, read
// as strings so a retuned value needs no other change here.
const REMEMBER: string = COMPARE.remember;
const SIDE_NARROW: string = COMPARE.sideNarrow;
const LEGEND_AT: string = COMPARE.legend;
const CONTROL_AT: string = COMPARE.control;
const SWITCH_KEYS: readonly string[] = COMPARE.switchKeys;
const SWITCH_BACK_KEYS: readonly string[] = COMPARE.switchBackKeys;
const MODES = Object.keys(COMPARE_WORDING.modes) as CompareMode[];
/** A click that travelled further than this was a drag, not a click. */
const CLICK_SLOP_PX = 4;

/** A number as written to `--split` and `aria-valuenow`: two places, no float noise. */
const round = (value: number) => Math.round(value * 100) / 100;

/** Where the reader's choice is kept, per `COMPARE.remember`. */
function modeStore(): Storage | null {
  try {
    if (REMEMBER === 'visit') return window.sessionStorage;
    if (REMEMBER === 'always') return window.localStorage;
  } catch {
    // Storage refused (a private window's policy): the choice is not kept.
  }
  return null;
}

function readMode(): string | null {
  try {
    return modeStore()?.getItem(COMPARE_MODE_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeMode(mode: CompareMode) {
  try {
    modeStore()?.setItem(COMPARE_MODE_KEY, mode);
  } catch {
    // As above: the choice lasts this page.
  }
}

function enhance(root: HTMLElement, frames: HTMLElement, stages: HTMLElement[]) {
  const doc = root.ownerDocument;
  const n = stages.length;
  const words = stages.map((stage) => ({
    label: stage.querySelector(`.${C.label}`)?.textContent?.trim() ?? '',
    note: stage.querySelector(`.${C.note}`),
  }));
  const make = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string,
  ) => {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  // The state: the method, and each method's own view.
  let mode = openingMode(root.dataset.mode, readMode());
  let p = COMPARE.restAt;
  let pair: ComparePair = restView('side', n);
  let stage = restView('switch', n).stage;
  /** The switch's leaving stage while the arriving one fades in over it. */
  let leaving: number | null = null;
  let fits = true;
  let noted = -1;
  let legendKind: 'span' | 'button' | null = null;

  // The chrome.
  const line = make('span', 'compare-line');
  line.setAttribute('aria-hidden', 'true');
  const handle = make('span', 'compare-handle');
  handle.setAttribute('role', 'slider');
  handle.tabIndex = 0;
  handle.setAttribute('aria-label', COMPARE_WORDING.handle);
  handle.setAttribute('aria-valuemin', '0');
  handle.setAttribute('aria-valuemax', '100');
  frames.append(line, handle);

  const legend = make('ol', 'compare-legend');
  legend.setAttribute('aria-label', COMPARE_WORDING.legend);
  const control = make('div', 'compare-control');
  control.setAttribute('role', 'group');
  control.setAttribute('aria-label', COMPARE_WORDING.control);
  const modeButtons = MODES.map((one) => {
    const button = make('button', undefined, COMPARE_WORDING.modes[one]);
    button.type = 'button';
    button.addEventListener('click', () => choose(one));
    return button;
  });
  control.append(...modeButtons);
  const now = make('p', 'compare-now');
  now.setAttribute('aria-live', 'polite');

  // The legend's row: below the frame or above it; the control in that
  // row, or above the frame on its own.
  const above: HTMLElement[] = [];
  const below: HTMLElement[] = [];
  (LEGEND_AT === 'above' ? above : below).push(legend);
  (CONTROL_AT === 'above' || LEGEND_AT === 'above' ? above : below).push(control);
  if (CONTROL_AT === 'above' && LEGEND_AT === 'above') above.reverse();
  frames.before(...above);
  frames.after(...below, now);

  if (COMPARE.cornerTags)
    stages.forEach((one, i) => one.append(make('span', 'compare-tag', words[i].label)));

  // The method the frame shows: side by side yields to the switch where
  // two won't fit and `sideNarrow` says so.
  const view = (): CompareMode =>
    mode === 'side' && !fits && SIDE_NARROW === 'switch' ? 'switch' : mode;

  const setPart = (element: HTMLElement, part: string) => {
    if (element.dataset.part !== part) element.dataset.part = part;
  };

  const buildLegend = (kind: 'span' | 'button') => {
    legendKind = kind;
    legend.replaceChildren(
      ...words.map(({ label }, i) => {
        const item = make('li', 'compare-stop');
        const inner = make(kind, undefined, label);
        if (inner instanceof HTMLButtonElement) {
          inner.type = 'button';
          inner.addEventListener('click', () => pick(i));
        }
        item.append(inner);
        return item;
      }),
    );
  };

  const render = () => {
    const showing = view();
    if (root.dataset.view !== showing) root.dataset.view = showing;
    let shown: number[];
    let note: number;
    if (showing === 'slider') {
      const at = sliderView(p, n);
      const split = String(round(at.split));
      root.style.setProperty('--split', split);
      handle.setAttribute('aria-valuenow', split);
      handle.setAttribute('aria-valuetext', `${words[at.left].label} | ${words[at.right].label}`);
      stages.forEach((one, i) =>
        setPart(one, i === at.left ? 'left' : i === at.right ? 'right' : 'off'),
      );
      shown = [at.left, at.right];
      note = noteIndex('slider', at);
    } else if (showing === 'side') {
      stages.forEach((one, i) =>
        setPart(one, i === pair.left ? 'left' : i === pair.right ? 'right' : 'off'),
      );
      shown = [pair.left, pair.right];
      note = noteIndex('side', pair);
    } else {
      stages.forEach((one, i) =>
        setPart(
          one,
          i === stage ? (leaving === null ? 'on' : 'in') : i === leaving ? 'under' : 'off',
        ),
      );
      shown = [stage];
      note = noteIndex('switch', { stage });
    }
    // The frames take focus in the switch, where a key advances them.
    if (showing === 'switch') frames.tabIndex = 0;
    else frames.removeAttribute('tabindex');

    const kind = showing === 'slider' ? 'span' : 'button';
    if (legendKind !== kind) buildLegend(kind);
    [...legend.children].forEach((item, i) => {
      const inner = item.firstElementChild as HTMLElement;
      const on = String(shown.includes(i));
      if (kind === 'span') inner.setAttribute('aria-current', on);
      else inner.setAttribute('aria-pressed', on);
    });
    modeButtons.forEach((button, i) =>
      button.setAttribute('aria-pressed', String(MODES[i] === mode)),
    );

    if (note !== noted) {
      noted = note;
      const { label, note: from } = words[note];
      const parts: (string | HTMLElement)[] = [make('span', C.label, label)];
      if (from?.textContent?.trim()) {
        // The note's children, cloned: its emphasis or link survives (T1708a).
        const copy = make('span', C.note);
        copy.append(...Array.from(from.childNodes, (child) => child.cloneNode(true)));
        parts.push(' ', copy);
      }
      now.replaceChildren(...parts);
    }
  };

  /** The slider at `to`, the divider following directly. */
  const slide = (to: number) => {
    p = Math.round(Math.min(1, Math.max(0, to)) * 1e6) / 1e6;
    render();
  };

  /** The switch to stage `to`: it fades in over the one it leaves. */
  const go = (to: number) => {
    if (to === stage) return;
    leaving = stage;
    stage = to;
    render();
  };

  /** A legend button: side by side shows the pair from it, the switch goes to it. */
  const pick = (i: number) => {
    if (view() === 'switch') go(i);
    else {
      pair = sidePair(i, n);
      render();
    }
  };

  /** A method from the control: remembered, the view built at once and faded in. */
  const choose = (next: CompareMode) => {
    if (next === mode) return;
    mode = next;
    leaving = null;
    writeMode(mode);
    render();
    delete root.dataset.fresh;
    void root.offsetWidth; // restart the fade if a change is still fading
    root.dataset.fresh = '';
  };

  root.addEventListener('animationend', (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains(C.pane)) delete root.dataset.fresh;
    else if (target.dataset.part === 'in' && event.animationName === 'motion-appear') {
      leaving = null;
      render();
    }
  });

  // The side-by-side fit: read where the block has a layout — a document
  // the router has not swapped in yet has none, so it is read on the
  // next frame, by when it has been.
  const refit = () => {
    if (root.ownerDocument !== document) {
      requestAnimationFrame(() => {
        if (root.ownerDocument === document) refit();
      });
      return;
    }
    const next = sideFits(frames.clientWidth);
    const narrow = !next && SIDE_NARROW === 'stack';
    if (narrow !== 'narrow' in root.dataset) {
      if (narrow) root.dataset.narrow = '';
      else delete root.dataset.narrow;
    }
    if (next !== fits) {
      fits = next;
      render();
    }
  };
  refits.set(root, refit);

  // The slider: the frame follows the hand; a vertical swipe still
  // scrolls the page (touch-action in the stylesheet).
  let dragging: number | null = null;
  let downAt: { x: number; y: number } | null = null;
  const follow = (event: PointerEvent) => {
    const box = frames.getBoundingClientRect();
    if (box.width > 0) slide((event.clientX - box.left) / box.width);
  };
  frames.addEventListener('dragstart', (event) => event.preventDefault());
  frames.addEventListener('pointerdown', (event) => {
    downAt = { x: event.clientX, y: event.clientY };
    if (view() !== 'slider' || event.button !== 0) return;
    delete root.dataset.settling;
    dragging = event.pointerId;
    frames.setPointerCapture(event.pointerId);
    follow(event);
  });
  frames.addEventListener('pointermove', (event) => {
    if (event.pointerId === dragging) follow(event);
  });
  const release = (event: PointerEvent) => {
    if (event.pointerId !== dragging) return;
    dragging = null;
    if (!COMPARE.snap) return;
    const to = snapTo(p, n);
    if (to === p) return;
    // The settle is a movement: instant under reduced motion.
    if (!reducedMotion()) root.dataset.settling = '';
    slide(to);
  };
  frames.addEventListener('pointerup', release);
  frames.addEventListener('pointercancel', release);
  root.addEventListener('transitionend', (event) => {
    if (event.target === root && event.propertyName === '--split') delete root.dataset.settling;
  });

  // The handle's keys: ←/→ a step, Page Up/Down five, Home/End the ends.
  handle.addEventListener('keydown', (event) => {
    const step = COMPARE.sliderStep;
    const to = (
      {
        ArrowLeft: p - step,
        ArrowRight: p + step,
        PageDown: p - 5 * step,
        PageUp: p + 5 * step,
        Home: 0,
        End: 1,
      } as Record<string, number>
    )[event.key];
    if (to === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    delete root.dataset.settling;
    slide(to);
  });

  // The switch: a click or a tap without movement, or a key, advances.
  frames.addEventListener('click', (event) => {
    if (view() !== 'switch' || !COMPARE.switchOnClick) return;
    const moved =
      downAt !== null &&
      Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > CLICK_SLOP_PX;
    if (!moved) go(switchNext(stage, n, 1));
  });
  frames.addEventListener('keydown', (event) => {
    if (view() !== 'switch' || event.target !== frames) return;
    const dir = SWITCH_KEYS.includes(event.key) ? 1 : SWITCH_BACK_KEYS.includes(event.key) ? -1 : 0;
    if (dir === 0) return;
    event.preventDefault();
    event.stopPropagation();
    go(switchNext(stage, n, dir));
  });

  root.dataset.js = '';
  render();
  refit();
}
