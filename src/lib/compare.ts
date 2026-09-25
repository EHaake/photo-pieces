/**
 * The compare block's state (spec 019, T1707): the tunables the tuning
 * envelope names, the block's words, and the pure rules the enhanced
 * block reads — no DOM. A round is a value here and its row in
 * compare.test.mjs's `EXPECTED`; the slider's geometry is `sliderView`
 * and its table.
 */

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
 * The image page's compare (spec 006; moved here at spec 018, T1604c):
 * overlay the frames and reveal the range input. The overlay is one box
 * where the static page stacks two frames, so it must land before the
 * page settles: the initial astro:page-load fires on window's load,
 * after every image, and collapsing the stack there moved everything
 * below the figure ~555px (T1603c). So the layout's script runs it at
 * its module's evaluation (after the parse, before DOMContentLoaded),
 * beside the appearance hooks, and in astro:before-swap on the new
 * document for a page the router swaps in; a figure already overlaid is
 * skipped, so the first load binds its range once. The image page's own
 * script cannot do the second: the router runs a new page's scripts
 * after the swap's update callback is done (router.js), so a first
 * swap into a compare page would be overlaid after the view
 * transition's new snapshot, the router's scroll and the first layout.
 */
export const enhanceCompare = (scope: Document) => {
  for (const figure of scope.querySelectorAll<HTMLElement>('.compare')) {
    const range = figure.querySelector<HTMLInputElement>('.compare-range');
    if (!range || 'js' in figure.dataset) continue;
    figure.dataset.js = '';
    range.hidden = false;
    const apply = () => figure.style.setProperty('--split', range.value);
    range.addEventListener('input', apply);
    apply();
  }
};
