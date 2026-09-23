/**
 * The motion module (spec 018) — the one place the page scripts learn
 * the motion grammar from. Three readers: the layout's script (the
 * appearance, the arrival and the travel), the image page's script (the
 * quiet view as one movement, through `withTransition`), and the dev
 * switch's panel (src/components/dev-motion-panel.ts, which builds one
 * row per `MOTION_TOKENS` entry). The grammar's values live on :root in
 * src/styles/global.css and nowhere else; this module carries only the
 * names, and reads the values off the computed style, so the dev switch's
 * one inline number is the number every reader sees.
 *
 * `FRAME_HOSTS` is the list of boxes a photograph waits in. The
 * stylesheet's gate rule spells the same list in its `:is(...)` — two
 * spellings of one list, because the CSS cannot import — and
 * motion.test.mjs pins the two equal, so a host added here and not there
 * (or there and not here) fails the suite.
 */

export type MotionKind = 'time' | 'curve' | 'flag' | 'length' | 'number' | 'fill';

/** The twenty tokens of the grammar, in :root's order, each with what
 *  kind of value it takes and a short label for the dev panel. */
export const MOTION_TOKENS: readonly { name: string; kind: MotionKind; label: string }[] = [
  { name: '--dur-state', kind: 'time', label: 'state change' },
  { name: '--dur-move', kind: 'time', label: 'movement' },
  { name: '--dur-appear', kind: 'time', label: 'appearance' },
  { name: '--ease-state', kind: 'curve', label: 'state curve' },
  { name: '--ease-move', kind: 'curve', label: 'movement curve' },
  { name: '--motion-appear', kind: 'flag', label: 'appearance' },
  { name: '--motion-arrive', kind: 'flag', label: 'arrival' },
  { name: '--motion-travel', kind: 'flag', label: 'travel' },
  { name: '--motion-quiet', kind: 'flag', label: 'quiet view' },
  { name: '--motion-appear-covers', kind: 'flag', label: 'covers appear' },
  { name: '--motion-arrive-covers', kind: 'flag', label: 'covers arrive' },
  { name: '--arrive-rise', kind: 'length', label: 'rise' },
  { name: '--arrive-threshold', kind: 'number', label: 'arrival threshold' },
  { name: '--arrive-stagger', kind: 'time', label: 'arrival stagger' },
  { name: '--wait-fill', kind: 'fill', label: 'waiting fill' },
  { name: '--hero-enter', kind: 'flag', label: 'hero entrance' },
  { name: '--hero-stagger', kind: 'time', label: 'hero stagger' },
  { name: '--arrows-slide', kind: 'length', label: 'arrows slide' },
  { name: '--rm-appear', kind: 'flag', label: 'reduced: appearance fade' },
  { name: '--rm-quiet', kind: 'flag', label: 'reduced: quiet fade' },
];

/** The view-transition name a moving photograph wears for the duration. */
export const NAME = 'photograph';

/** The boxes a photograph waits in — see the header on the stylesheet's
 *  copy of this list. */
export const FRAME_HOSTS = [
  '.image-link',
  '.image-frame',
  '.piece-block',
  '.piece-block figure',
  '.piece-strip-scroll',
  '.note-cover',
];

/** Every frame image: a host's direct `img` child. */
export const FRAME_IMG = FRAME_HOSTS.map((host) => `${host} > img`).join(', ');

/** A CSS time in milliseconds: `480ms` → 480, `.5s` → 500, anything
 *  else → 0. */
export function ms(value: string): number {
  const m = /^\s*(-?(?:\d+\.?\d*|\.\d+))(ms|s)\s*$/.exec(value);
  if (!m) return 0;
  const n = Number(m[1]);
  return m[2] === 's' ? n * 1000 : n;
}

/** A token's computed value on <html>, trimmed. */
export function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** A flag token: on when it reads `1`. */
export function flag(name: string): boolean {
  return token(name) === '1';
}

/** The reader's reduced-motion preference. */
export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Run `update` as one view transition: `named` (when given) wears
 *  `NAME` and <html> carries `data-moving="<moving>"` until the
 *  transition finishes. Without `animate`, or without the API, `update`
 *  runs synchronously. Both are cleared on `finished` through
 *  `.then(clear, clear)` — never `.finally`, which would re-throw a
 *  skipped transition's rejection. */
export function withTransition(
  update: () => void,
  moving: string,
  named: HTMLElement | null,
  animate: boolean,
): Promise<void> {
  if (!animate || typeof document.startViewTransition !== 'function') {
    update();
    return Promise.resolve();
  }
  const root = document.documentElement;
  if (named) named.style.viewTransitionName = NAME;
  root.dataset.moving = moving;
  const clear = () => {
    if (named) named.style.viewTransitionName = '';
    delete root.dataset.moving;
  };
  return document.startViewTransition(update).finished.then(clear, clear);
}
