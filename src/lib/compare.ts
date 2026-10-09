/**
 * The compare block's state (spec 019, T1707): the tunables the tuning
 * envelope names, the block's words, and the pure rules the enhanced
 * block reads — no DOM — and, after them, the enhanced block itself
 * (T1708), which builds its chrome and runs its views on those rules. A
 * round is a value here and its row in compare.test.mjs's `EXPECTED`;
 * the pair the slider and side by side show is `pickSlot` and its table.
 */

import { COMPARE_CLASSES as C } from './image-meta.mjs';
import { reducedMotion } from './motion';

/** The block's tunables, each one value in one place (plan, "The tuning envelope, placed"). */
export const COMPARE = {
  defaultMode: 'slider', // the method a block opens in when its author wrote none
  remember: 'visit', // the reader's choice: 'visit' (sessionStorage), 'always' (localStorage) or 'none'
  restAt: 0.5, // the slider's rest position on its track, 0–1
  restPair: 'ends', // the pair at rest: 'ends' (the first and last stage) or 'neighbours' (the pair the old three-way slider showed at restAt)
  snap: false, // on release the handle settles on the nearer end of the track
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
  sideWidth: 'wide', // the width class side by side swaps onto the block (compare-w-<this>), the surface's back on leaving
  stripWraps: false, // the filmstrip's last stage pages on to the first
  stripEnds: 'hide', // an arrow with nowhere to go: 'hide' it, or 'quiet' (muted, aria-disabled)
  stripKeys: { back: ['ArrowLeft'], next: ['ArrowRight'], first: ['Home'], last: ['End'] }, // the filmstrip's keys while the block has focus
  stripWheel: 'page', // a horizontal wheel or trackpad scroll: false (the page's own), 'follow' (the strip follows it, settling on the nearest) or 'page' (one gesture pages one stage)
  stripWheelIdleMs: 150, // a wheel gesture's end: this long without a wheel event ('follow' settles then; 'page' takes the next gesture)
  stripWheelStepPx: 4, // 'page': the least sideways delta, in pixels, in one wheel event that pages — below it, a jitter
  stripWheelGateMaxMs: 800, // 'page': the longest a paged gesture stays spent under an unbroken stream of wheel events (T1729c) — past a normal momentum tail, whose deltas are under the step by then, and short of a second deliberate gesture a second later
  stripWidth: 'surface', // the width class the filmstrip wears: 'surface' (the block's own, as the switch) or one of COMPARE_WIDTHS
} as const;

/** The block's words; `modes`' keys are the four methods. */
export const COMPARE_WORDING = {
  modes: { slider: 'Slider', side: 'Side by side', switch: 'Switch', filmstrip: 'Filmstrip' }, // the control's words, in its order
  control: 'How to compare',
  legend: 'Stages',
  handle: 'Move between the stages',
  slots: { left: 'left', right: 'right' }, // the tag on a picked legend button, naming its side
  next: 'next pick:', // the hint after the legend, before the side the next pick takes
  strip: { back: 'Previous stage', next: 'Next stage' }, // the filmstrip's arrows' names
} as const;

/** Storage key for the reader's chosen method (per `COMPARE.remember`). */
export const COMPARE_MODE_KEY = 'compare-mode';

export type CompareMode = keyof typeof COMPARE_WORDING.modes;
/** Two stages, one each side. */
export type ComparePair = { left: number; right: number };
/** The two sides as the legend leaves them: a side may be empty (`null`) until a pick fills it. */
export type CompareSides = { left: number | null; right: number | null };
/** A side of the pair. */
export type CompareSlot = keyof typeof COMPARE_WORDING.slots;
/** The sides as the legend picked them, left and right, and the side the next pick takes. */
export type CompareSlots = CompareSides & { next: CompareSlot };
/** The slider's sides and the divider's position, 0–100. */
export type SliderView = CompareSides & { split: number };
/** The switch's (and the filmstrip's) one showing stage. */
export type SwitchView = { stage: number };
export type CompareView = SliderView | CompareSides | SwitchView;

/** A string that names one of the four methods. */
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

/** The slider at `p` ∈ [0, 1], wiping between `pair`: the divider at `p`, the left side's stage left of it (an empty side the bare ground). */
export function sliderView(p: number, pair: CompareSides): SliderView {
  const at = Math.min(1, Math.max(0, p));
  return { left: pair.left, right: pair.right, split: 100 * at };
}

/**
 * The sides after a legend click on stage `k` (T1709g): it takes the
 * `next` side and `next` flips; if it held the other side, that side
 * empties until a later pick fills it — so a stage moves sides. A click
 * on the stage already on the `next` side keeps the sides and flips
 * `next` all the same (T1709h): no click is a no-op, so a side can be
 * confirmed and the other picked. The picks go left, then right, and
 * every pair, either way round, is two clicks away.
 */
export function pickSlot(pair: CompareSlots, k: number): CompareSlots {
  const { next } = pair;
  const other: CompareSlot = next === 'left' ? 'right' : 'left';
  if (pair[next] === k) return { ...pair, next: other };
  const kept = pair[other] === k ? null : pair[other];
  return next === 'left'
    ? { left: k, right: kept, next: 'right' }
    : { left: kept, right: k, next: 'left' };
}

/** Side by side from stage `k`: it and the next, the last with the one before. */
export function sidePair(k: number, n: number): ComparePair {
  const left = Math.min(k, n - 2);
  return { left, right: left + 1 };
}

/** The switch's next stage from `i` in direction `dir`, wrapping per `COMPARE.switchWraps` (the filmstrip steps by it too, passing `COMPARE.stripWraps`). */
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

/** The filmstrip's position after moving `by` stages from `from`, clamped to the strip, `[0, n − 1]`. */
export function stripAt(from: number, by: number, n: number): number {
  return Math.min(n - 1, Math.max(0, from + by));
}

/** The stage the filmstrip settles on from position `at`: the nearest, clamped to the strip. */
export function stripSettle(at: number, n: number): number {
  return Math.min(n - 1, Math.max(0, Math.round(at)));
}

/**
 * Which way one wheel event pages the filmstrip: 1 on, −1 back, 0 not.
 * Only `'page'` pages, and only an event whose sideways delta `deltaX`,
 * in pixels, is at least `threshold`, and not the way the gesture has
 * already paged (`spent`: 1 or −1, 0 when it has not) — a delta the
 * other way is a new decision and pages back (T1729c).
 */
export function stripWheelStep(
  mode: false | 'follow' | 'page',
  spent: -1 | 0 | 1,
  deltaX: number,
  threshold: number = COMPARE.stripWheelStepPx,
): -1 | 0 | 1 {
  if (mode !== 'page' || Math.abs(deltaX) < threshold) return 0;
  const dir = deltaX > 0 ? 1 : -1;
  return dir === spent ? 0 : dir;
}

/** Whether each of the filmstrip's arrows has somewhere to go from `stage`: nowhere past an end unless it wraps. */
export function stripEnds(
  stage: number,
  n: number,
  wraps: boolean = COMPARE.stripWraps,
): { back: boolean; next: boolean } {
  return { back: wraps || stage > 0, next: wraps || stage < n - 1 };
}

/**
 * A block's view at rest: the slider and side by side on the rest pair
 * (per `COMPARE.restPair`), the slider's divider at `restAt`; the switch
 * and the filmstrip on the first stage. 'neighbours' is the pair the old three-way slider
 * showed with its handle at `restAt` (segments indexed from the right).
 */
export function restView(mode: 'slider', n: number, rest?: string): SliderView;
export function restView(mode: 'side', n: number, rest?: string): ComparePair;
export function restView(mode: 'switch' | 'filmstrip', n: number, rest?: string): SwitchView;
export function restView(mode: CompareMode, n: number, rest?: string): CompareView;
export function restView(
  mode: CompareMode,
  n: number,
  rest: string = COMPARE.restPair,
): CompareView {
  if (mode === 'switch' || mode === 'filmstrip') return { stage: 0 };
  const pair =
    rest === 'ends'
      ? { left: 0, right: n - 1 }
      : sidePair(n - 2 - Math.min(Math.floor(COMPARE.restAt * (n - 1)), n - 2), n);
  return mode === 'slider' ? sliderView(COMPARE.restAt, pair) : pair;
}

/** The stage whose note is shown: the right side's stage (none while it is empty), or the switch's or the filmstrip's stage. */
export function noteIndex(mode: CompareMode, view: CompareView): number | null {
  return mode === 'switch' || mode === 'filmstrip'
    ? (view as SwitchView).stage
    : (view as CompareSides).right;
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
 * more stages: the method control (four buttons), the legend (one
 * button per stage, marking what shows: in the slider and side by side it
 * picks the sides both show, left then right, by `pickSlot` — a side left
 * empty by a stage that moved shows the bare ground; each button is two
 * lines, its label over its side tag's row, always there and blank while
 * the stage holds no side; a hint after the legend names the side the
 * next pick takes — the first stage left and the last right at rest; in
 * the switch and the filmstrip it goes to the stage, its tag rows blank
 * and no hint), the divider and the handle
 * (an ARIA slider), the filmstrip's two arrows (T1726), the live note,
 * and the corner tags when
 * `COMPARE.cornerTags`; and the state the CSS reads — `data-js`,
 * `data-view`, `data-narrow`, each stage's `data-part` and `--i` (its
 * place in the filmstrip's row), `--split`, `--strip-at` (the strip's
 * position, in stages), and the
 * three motion attributes (`data-settling` for a snap's glide or the
 * strip's settle after a drag or a wheel, and `data-paging` for the
 * strip's slide to a stage, each only when motion is not reduced and
 * only when there is somewhere to go; `data-fresh` on every mode
 * change, until the panes' fade ends). The views are T1707's pure
 * functions above.
 *
 * The pair blocks (spec 019 amendment): the slider block (`.piece-slider`,
 * T1725) is this compare fixed on its slider — the mode 'slider' whatever
 * is stored or authored, nothing read from or written to the store, no
 * method control and no hint, the legend its two labels as text (no
 * buttons, no side tags), the pair the first stage left and the second
 * right, never changing; the handle, the drag, the touch, the keys and
 * the live note the compare's, the note the second stage's. The side
 * block (`.piece-side`, T1723) is final without script and is skipped.
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
    // Side by side is final without script (T1723): no control, no legend, nothing to bind.
    if (root.classList.contains('piece-side')) continue;
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
const STRIP_KEYS: Record<keyof typeof COMPARE.stripKeys, readonly string[]> = COMPARE.stripKeys;
const STRIP_ENDS: string = COMPARE.stripEnds;
const STRIP_WHEEL: false | 'follow' | 'page' = COMPARE.stripWheel;
const STRIP_WIDTH: string = COMPARE.stripWidth;
const MODES = Object.keys(COMPARE_WORDING.modes) as CompareMode[];
/** A click that travelled further than this was a drag, not a click. */
const CLICK_SLOP_PX = 4;

/** A number as written to `--split` and `aria-valuenow`: two places, no float noise. */
const round = (value: number) => Math.round(value * 100) / 100;

/** The side tag's row while its stage holds no side: a blank that keeps the row's height. */
const BLANK = '\u00a0';

/** The stages on the sides, left then right, an empty side skipped. */
const onSides = (pair: CompareSides) =>
  [pair.left, pair.right].filter((one): one is number => one !== null);

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

  // The slider block (T1725): the compare's slider alone, its pair fixed.
  const fixed = root.classList.contains('piece-slider');

  // The state: the method; the one pair the slider and side by side
  // show, left and right, and the side the next pick takes; the
  // divider's position; the switch's stage. The slider block's mode
  // is the slider, the store neither read nor written, its pair the
  // first stage left and the second right.
  let mode: CompareMode = fixed ? 'slider' : openingMode(root.dataset.mode, readMode());
  let p = COMPARE.restAt;
  const rest = fixed ? restView('slider', 2) : restView('side', n);
  let picked: CompareSlots = { left: rest.left, right: rest.right, next: 'left' };
  let stage = restView('switch', n).stage;
  // The filmstrip's position, in stages: it shows the switch's stage, and a drag or a wheel moves it between.
  let at: number = stage;
  /** The switch's leaving stage while the arriving one fades in over it. */
  let leaving: number | null = null;
  let fits = true;
  let noted: number | null = -1;
  // The width class the surface wrote, read once; side by side swaps it for `COMPARE.sideWidth`'s.
  const surfaceWidth = [...root.classList].find((name) => name.startsWith(`${C.root}-w-`)) ?? '';
  const sideWidth = `${C.root}-w-${COMPARE.sideWidth}`;
  const stripWidth = STRIP_WIDTH === 'surface' ? surfaceWidth : `${C.root}-w-${STRIP_WIDTH}`;
  let worn = surfaceWidth;

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

  // The filmstrip's arrows, previous and next, at the frame's sides; each stage's place in its row.
  // The figure's children, just after the frame (below), not the frame's: the filmstrip's frame clips to itself (T1729e).
  const arrows = (['back', 'next'] as const).map((dir) => {
    const arrow = make('button', 'compare-arrow', dir === 'back' ? '←' : '→');
    arrow.type = 'button';
    arrow.dataset.dir = dir;
    arrow.setAttribute('aria-label', COMPARE_WORDING.strip[dir]);
    arrow.addEventListener('click', () => page(switchNext(stage, n, dir === 'back' ? -1 : 1, COMPARE.stripWraps)));
    return arrow;
  });
  stages.forEach((one, i) => one.style.setProperty('--i', String(i)));

  const legend = make('ol', 'compare-legend');
  legend.setAttribute('aria-label', COMPARE_WORDING.legend);
  const control = make('div', 'compare-control');
  control.setAttribute('role', 'group');
  control.setAttribute('aria-label', COMPARE_WORDING.control);
  const modeButtons = (fixed ? [] : MODES).map((one) => {
    const button = make('button', undefined, COMPARE_WORDING.modes[one]);
    button.type = 'button';
    button.addEventListener('click', () => choose(one));
    return button;
  });
  control.append(...modeButtons);
  const now = make('p', 'compare-now');
  now.setAttribute('aria-live', 'polite');

  // The legend's row: below the frame or above it; the control in that
  // row, or above the frame on its own. The slider block has no control.
  const above: HTMLElement[] = [];
  const below: HTMLElement[] = [];
  (LEGEND_AT === 'above' ? above : below).push(legend);
  if (!fixed)
    (CONTROL_AT === 'above' || LEGEND_AT === 'above' ? above : below).push(control);
  if (CONTROL_AT === 'above' && LEGEND_AT === 'above') above.reverse();
  frames.before(...above);
  frames.after(...arrows, ...below, now);
  // The hint follows the legend's row — the legend and, when they share
  // it, the control — on a row of its own beneath. The slider block
  // picks nothing, so it has none.
  const hint = fixed ? null : make('p', 'compare-hint');
  const legendRow = LEGEND_AT === 'above' ? above : below;
  if (hint) legendRow[legendRow.length - 1].after(hint);

  if (COMPARE.cornerTags)
    stages.forEach((one, i) => one.append(make('span', 'compare-tag', words[i].label)));

  // The method the frame shows: side by side yields to the switch where
  // two won't fit and `sideNarrow` says so.
  const view = (): CompareMode =>
    mode === 'side' && !fits && SIDE_NARROW === 'switch' ? 'switch' : mode;

  const setPart = (element: HTMLElement, part: string) => {
    if (element.dataset.part !== part) element.dataset.part = part;
  };

  // Each legend button is two lines: its label, and beneath it the side
  // tag's row, always there — blank while the stage holds no side — so a
  // pick moves nothing; `data-label` lets the stylesheet reserve the
  // label's bold width. The slider block's legend is its two labels as
  // text, left · right: no buttons, no side tags.
  const slotTags = words.map(() => make('span', 'compare-slot', BLANK));
  legend.append(
    ...words.map(({ label }, i) => {
      if (fixed) return make('li', 'compare-stop', label);
      const item = make('li', 'compare-stop');
      const button = make('button', undefined, label);
      button.type = 'button';
      button.dataset.label = label;
      button.append(' ', slotTags[i]);
      button.addEventListener('click', () => pick(i));
      item.append(button);
      return item;
    }),
  );

  const render = () => {
    const showing = view();
    if (root.dataset.view !== showing) {
      root.dataset.view = showing;
      // Side by side wears `COMPARE.sideWidth`, the filmstrip `COMPARE.stripWidth`; every other view the surface's own width.
      const width =
        showing === 'side' ? sideWidth : showing === 'filmstrip' ? stripWidth : surfaceWidth;
      if (width !== worn) {
        if (worn) root.classList.remove(worn);
        if (width) root.classList.add(width);
        worn = width;
      }
    }
    let shown: number[];
    let note: number | null;
    if (showing === 'slider') {
      const at = sliderView(p, picked);
      const split = String(round(at.split));
      root.style.setProperty('--split', split);
      handle.setAttribute('aria-valuenow', split);
      shown = onSides(at);
      // The stages the divider wipes between, or the one alone while a side is empty.
      handle.setAttribute('aria-valuetext', shown.map((i) => words[i].label).join(' | '));
      stages.forEach((one, i) =>
        setPart(one, i === at.left ? 'left' : i === at.right ? 'right' : 'off'),
      );
      note = noteIndex('slider', at);
    } else if (showing === 'side') {
      stages.forEach((one, i) =>
        setPart(one, i === picked.left ? 'left' : i === picked.right ? 'right' : 'off'),
      );
      shown = onSides(picked);
      note = noteIndex('side', picked);
    } else if (showing === 'filmstrip') {
      // The row slid to `at`; the showing stage in the frame, every other beside it, off the frame.
      root.style.setProperty('--strip-at', String(at));
      stages.forEach((one, i) => setPart(one, i === stage ? 'on' : 'strip'));
      shown = [stage];
      note = noteIndex('filmstrip', { stage });
      // An arrow with nowhere to go is hidden or quiet, per `COMPARE.stripEnds`.
      const ends = stripEnds(stage, n);
      arrows.forEach((arrow) => {
        const open = ends[arrow.dataset.dir as 'back' | 'next'];
        if (STRIP_ENDS === 'quiet') {
          if (open) arrow.removeAttribute('aria-disabled');
          else arrow.setAttribute('aria-disabled', 'true');
        } else if (arrow.hidden === open) arrow.hidden = !open;
      });
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
    // The frames take focus in the switch and the filmstrip, where a key moves them.
    const single = showing === 'switch' || showing === 'filmstrip';
    if (single) frames.tabIndex = 0;
    else frames.removeAttribute('tabindex');

    // The slider block's legend is text, and it has no hint: nothing here to mark.
    if (!fixed) {
      [...legend.children].forEach((item, i) => {
        item.firstElementChild?.setAttribute('aria-pressed', String(shown.includes(i)));
        // The side tag's row names the side the stage holds; blank otherwise, and in the switch and the filmstrip.
        const slot =
          single ? null : i === picked.left ? 'left' : i === picked.right ? 'right' : null;
        const tag = slot === null ? BLANK : COMPARE_WORDING.slots[slot];
        if (slotTags[i].textContent !== tag) slotTags[i].textContent = tag;
      });
    }
    // The hint names the side the next pick takes (hidden in the switch and the filmstrip by the stylesheet).
    const next = `${COMPARE_WORDING.next} ${COMPARE_WORDING.slots[picked.next]}`;
    if (hint && hint.textContent !== next) hint.textContent = next;
    modeButtons.forEach((button, i) =>
      button.setAttribute('aria-pressed', String(MODES[i] === mode)),
    );

    if (note !== noted) {
      noted = note;
      // The right side is empty: the note is blank until a pick fills it.
      if (note === null) now.replaceChildren();
      else {
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

  /** The filmstrip at position `to`: the showing stage the nearest, the strip following directly. */
  const strip = (to: number) => {
    at = Math.round(stripAt(to, 0, n) * 1e6) / 1e6;
    stage = stripSettle(at, n);
    render();
  };

  /** The filmstrip paged to stage `to` (an arrow, a key, the legend): a slide on the move duration. */
  const page = (to: number) => {
    if (to === at) return;
    delete root.dataset.settling;
    // The slide is a movement: a cut under reduced motion.
    if (!reducedMotion()) root.dataset.paging = '';
    strip(to);
  };

  /** The filmstrip settled on the nearest stage after a drag or a wheel: a movement on the state duration. */
  const settle = () => {
    const to = stripSettle(at, n);
    if (to === at) return;
    delete root.dataset.paging;
    // The settle is a movement: a cut under reduced motion.
    if (!reducedMotion()) root.dataset.settling = '';
    strip(to);
  };

  /** A legend button: the slider and side by side take the pair it picks, the switch and the filmstrip go to it. */
  const pick = (i: number) => {
    const showing = view();
    if (showing === 'switch') go(i);
    else if (showing === 'filmstrip') page(i);
    else {
      picked = pickSlot(picked, i);
      render();
    }
  };

  /** A method from the control: remembered, the view built at once and faded in. */
  const choose = (next: CompareMode) => {
    if (next === mode) return;
    mode = next;
    leaving = null;
    // A change mid-glide cancels the transition, so no transitionend clears these.
    delete root.dataset.paging;
    delete root.dataset.settling;
    // The filmstrip opens on the switch's stage (and the switch on the filmstrip's).
    at = stage;
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
    const to = Math.round(p);
    if (to === p) return;
    // The settle is a movement: instant under reduced motion.
    if (!reducedMotion()) root.dataset.settling = '';
    slide(to);
  };
  frames.addEventListener('pointerup', release);
  frames.addEventListener('pointercancel', release);
  root.addEventListener('transitionend', (event) => {
    if (event.target !== root) return;
    if (event.propertyName === '--split') delete root.dataset.settling;
    if (event.propertyName === '--strip-at') {
      delete root.dataset.paging;
      delete root.dataset.settling;
    }
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

  // The filmstrip: a drag (touch or mouse) follows the hand and settles
  // on the nearest stage on release; a vertical swipe still scrolls the
  // page (touch-action in the stylesheet). A click on the frame does
  // nothing; the arrows are buttons of their own.
  let pulling: { id: number; x: number; from: number } | null = null;
  frames.addEventListener('pointerdown', (event) => {
    if (view() !== 'filmstrip' || event.button !== 0) return;
    delete root.dataset.paging;
    delete root.dataset.settling;
    pulling = { id: event.pointerId, x: event.clientX, from: at };
    frames.setPointerCapture(event.pointerId);
  });
  frames.addEventListener('pointermove', (event) => {
    if (pulling === null || event.pointerId !== pulling.id) return;
    const width = frames.getBoundingClientRect().width;
    if (width > 0) strip(stripAt(pulling.from, -(event.clientX - pulling.x) / width, n));
  });
  const letGo = (event: PointerEvent) => {
    if (pulling === null || event.pointerId !== pulling.id) return;
    pulling = null;
    settle();
  };
  frames.addEventListener('pointerup', letGo);
  frames.addEventListener('pointercancel', letGo);

  // A horizontal wheel or trackpad scroll moves the strip, and only then
  // keeps the page from scrolling — so the listener cannot be passive. A
  // line or a page of delta is read in pixels. Browsers send no wheel's
  // end: a gesture ends after `stripWheelIdleMs` without a wheel event.
  // 'page': the gesture's first event of `stripWheelStepPx` or more
  // pages one stage its way, and the rest of it (a trackpad's momentum)
  // is ignored until it ends; at an end nothing pages. 'follow': the
  // strip follows the delta and settles on the nearest at the end.
  // T1729c: the spent gesture could stick — any wheel event restarted its
  // end, and macOS keeps a stream going (momentum, and zero-delta events
  // at a phase's end or under resting fingers) — so an event with no
  // delta on either axis is not part of any gesture, the gesture is spent
  // at most `stripWheelGateMaxMs` from its page whatever the stream, and
  // a delta the other way pages back (stripWheelStep).
  let idle: ReturnType<typeof setTimeout> | undefined;
  let cap: ReturnType<typeof setTimeout> | undefined;
  /** 'page': the way the gesture paged (0 when it has not), spent until `stripWheelIdleMs` without a wheel event or `stripWheelGateMaxMs` after the page. */
  let spent: -1 | 0 | 1 = 0;
  const open = () => {
    spent = 0;
    clearTimeout(idle);
    clearTimeout(cap);
  };
  const quiet = () => {
    clearTimeout(idle);
    idle = setTimeout(open, COMPARE.stripWheelIdleMs);
  };
  const spend = (dir: -1 | 1) => {
    spent = dir;
    quiet();
    clearTimeout(cap);
    cap = setTimeout(open, COMPARE.stripWheelGateMaxMs);
  };
  frames.addEventListener(
    'wheel',
    (event) => {
      if (view() !== 'filmstrip' || !STRIP_WHEEL) return;
      if (event.deltaX === 0 && event.deltaY === 0) return;
      if (STRIP_WHEEL === 'page' && spent !== 0) quiet();
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const width = frames.getBoundingClientRect().width;
      if (width <= 0) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
      if (STRIP_WHEEL === 'page') {
        const dir = stripWheelStep(STRIP_WHEEL, spent, event.deltaX * unit);
        if (dir === 0) return;
        spend(dir);
        page(switchNext(stage, n, dir, COMPARE.stripWraps));
        return;
      }
      delete root.dataset.paging;
      delete root.dataset.settling;
      strip(stripAt(at, (event.deltaX * unit) / width, n));
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (view() === 'filmstrip' && pulling === null) settle();
      }, COMPARE.stripWheelIdleMs);
    },
    { passive: false },
  );

  // The filmstrip's keys, while the block or an arrow has focus: a step, the first or the last stage.
  // The arrows sit outside the frame (T1729e), so their keys do not pass through it.
  const stripKey = (event: KeyboardEvent) => {
    if (view() !== 'filmstrip') return;
    const { key } = event;
    const to = STRIP_KEYS.back.includes(key)
      ? switchNext(stage, n, -1, COMPARE.stripWraps)
      : STRIP_KEYS.next.includes(key)
        ? switchNext(stage, n, 1, COMPARE.stripWraps)
        : STRIP_KEYS.first.includes(key)
          ? 0
          : STRIP_KEYS.last.includes(key)
            ? n - 1
            : null;
    if (to === null) return;
    event.preventDefault();
    event.stopPropagation();
    page(to);
  };
  frames.addEventListener('keydown', stripKey);
  arrows.forEach((arrow) => arrow.addEventListener('keydown', stripKey));

  root.dataset.js = '';
  render();
  refit();
}
