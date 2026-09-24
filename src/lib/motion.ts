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

/** The twenty-one tokens of the grammar, in :root's order, each with what
 *  kind of value it takes and a short label for the dev panel. */
export const MOTION_TOKENS: readonly { name: string; kind: MotionKind; label: string }[] = [
  { name: '--dur-state', kind: 'time', label: 'state change' },
  { name: '--dur-move', kind: 'time', label: 'movement' },
  { name: '--dur-appear', kind: 'time', label: 'appearance' },
  { name: '--ease-state', kind: 'curve', label: 'state curve' },
  { name: '--ease-move', kind: 'curve', label: 'movement curve' },
  { name: '--ease-appear', kind: 'curve', label: 'appearance curve' },
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
  { name: '--arrows-slide', kind: 'flag', label: 'arrows slide' },
  { name: '--rm-appear', kind: 'flag', label: 'reduced: appearance fade' },
  { name: '--rm-quiet', kind: 'flag', label: 'reduced: quiet fade' },
];

/** The view-transition name a moving photograph wears for the duration. */
export const NAME = 'photograph';

/** The names the arrows' slide gives the old and the new stage figure —
 *  two, so neither group morphs; the stylesheet's slide rules spell the same. */
export const SLIDE_NAMES = { out: 'photograph-out', in: 'photograph-in' } as const;

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

declare global {
  interface Window {
    /** Set by `appear()` the moment it binds; the layout's inline gate
     *  reads it at `load` and releases the hidden state when it is not
     *  set (the module never ran). */
    __motion?: boolean;
    /** The dev motion switch's once-only guard (DevMotion.astro's inline
     *  applier), declared here beside `__motion` so the checker knows it. */
    __devMotion?: boolean;
  }
}

/** A motion flag as a surface sees it: off when **either** the host's
 *  computed value or the root's is `0`. The covers rule points a
 *  cover's `--motion-appear` / `--motion-arrive` at the `*-covers`
 *  tokens, so the host read is what gives the covers their own switch;
 *  the root read keeps the root's toggle reaching them too. */
function on(hostStyle: CSSStyleDeclaration, name: string): boolean {
  return hostStyle.getPropertyValue(name).trim() !== '0' && token(name) !== '0';
}

/** Whether a box intersects the viewport now. */
export function inViewport(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
}

/** A travel record: how the reader reached a history entry (spec 018,
 *  T1606f). The layout writes one on the entry of every push its travel
 *  classifies — `kind` settled, `from` the pathname left, `nth` which of
 *  a page's links to one photograph (in: the clicked link on the page
 *  left; out: the landing on the page reached), `dir` for a step. */
export type Travel = {
  kind: 'in' | 'out' | 'step';
  from: string;
  nth?: number;
  dir?: 'prev' | 'next';
};

const REVERSE = { in: 'out', out: 'in', step: 'step' } as const;
const FLIP = { prev: 'next', next: 'prev' } as const;

/** A traverse's kind, from the record of the step between its two
 *  pages: on **back**, the record of the entry being left, reversed (in
 *  → out, out → in, step → step with `dir` flipped); on **forward**, the
 *  record of the entry reached, replayed as it was. Each keeps the
 *  record's `nth`. The record is that step only when it is well-formed
 *  (a known kind, a string `from`, `nth` a non-negative integer or
 *  absent, `dir` `prev|next` or absent) and its `from` is the other end
 *  — `toPath` on back, `fromPath` on forward; otherwise null, and the
 *  layout falls back to what the pages alone allow. */
export function traverseKind(
  record: unknown,
  direction: string | undefined,
  fromPath: string,
  toPath: string,
): Omit<Travel, 'from'> | null {
  if (!record || typeof record !== 'object') return null;
  const { kind, from, nth, dir } = record as Record<string, unknown>;
  if (kind !== 'in' && kind !== 'out' && kind !== 'step') return null;
  if (typeof from !== 'string') return null;
  if (nth !== undefined && !(typeof nth === 'number' && Number.isInteger(nth) && nth >= 0))
    return null;
  if (dir !== undefined && dir !== 'prev' && dir !== 'next') return null;
  const keep = typeof nth === 'number' ? { nth } : {};
  if (direction === 'back' && from === toPath)
    return { kind: REVERSE[kind], ...keep, ...(dir ? { dir: FLIP[dir] } : {}) };
  if (direction === 'forward' && from === fromPath)
    return { kind, ...keep, ...(dir ? { dir } : {}) };
  return null;
}

/** A shown frame's key: the page it was shown on, the viewport it was
 *  shown at (width, height and pixel ratio) and its `src`, `srcset` and
 *  `sizes` attributes — exactly the inputs the browser picks a candidate
 *  from, so an image made eager on a held key asks for the very file
 *  that was shown: a memory-cache hit, never a new request. (The same
 *  photograph placed twice at different `sizes` is two keys.) */
export function shownKey(pathname: string, img: Element): string {
  const src = img.getAttribute('src') ?? '';
  const srcset = img.getAttribute('srcset') ?? '';
  const sizes = img.getAttribute('sizes') ?? '';
  return `${pathname}|${innerWidth}x${innerHeight}x${devicePixelRatio}|${src}|${srcset}|${sizes}`;
}

/** The frames this document has shown, by `shownKey`, for its life —
 *  the way back holds what the reader saw (spec 018, D1604 Q2). */
const held = new Set<string>();

/** Before a swap: every frame image in the new document `doc` (at
 *  `pathname`) that this document has shown, at this viewport, is made
 *  `loading="eager"`. A lazy image in an adopted document is not
 *  fetched until the next rendering step's intersection check, so it
 *  would never be `complete` at the hook and every frame the reader saw
 *  would fade again; its file is in the memory cache, so eager is a
 *  cache hit, and the `complete` short-cut and the early-`load` rule
 *  show it at once. A frame never shown, or shown at another viewport,
 *  is left as it is — eager would fetch a candidate the page would not
 *  request. */
export function holdShown(doc: Document, pathname: string): void {
  for (const img of doc.querySelectorAll(FRAME_IMG)) {
    if (held.has(shownKey(pathname, img))) img.setAttribute('loading', 'eager');
  }
}

/** The observer's threshold list: the arrival threshold plus every step
 *  of 0.05 from 0 to 1, so a unit keeps getting callbacks as more of it
 *  comes into view — a unit too tall ever to reach the threshold's share
 *  of itself still reports its visible height. Exported for the unit
 *  test. */
export function arrivalSteps(threshold: number): number[] {
  const steps = Array.from({ length: 21 }, (_, i) => i / 20);
  return [...new Set([...steps, threshold])].sort((a, b) => a - b);
}

/** Whether an observed unit has arrived (spec 018, Phase 1 review B1):
 *  the threshold's share of the unit is in view, or — only for a unit
 *  too tall ever to show that share (its height times the threshold
 *  above the viewport's) — its visible height is the threshold's share
 *  of the viewport's. Never at its first pixel: `isIntersecting`
 *  alone turns true there whatever the threshold. Exported for the unit
 *  test. */
export function arrives(
  entry: Pick<
    IntersectionObserverEntry,
    | 'isIntersecting'
    | 'intersectionRatio'
    | 'intersectionRect'
    | 'boundingClientRect'
    | 'rootBounds'
  >,
  threshold: number,
): boolean {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= threshold) return true;
  const root = entry.rootBounds;
  // Too tall: even filling the viewport, less than the share of it shows.
  return (
    root !== null &&
    entry.boundingClientRect.height * threshold > root.height &&
    entry.intersectionRect.height >= threshold * root.height
  );
}

/** The edge a unit crossed to arrive (spec 018, T1606b; D1606b): `top`
 *  when its box is clipped at the root's top only, `bottom` when
 *  clipped at the root's foot only, else `last` — the side it was on
 *  when last seen wholly off screen — so a jump that lands a unit
 *  wholly in view (Page Down without smooth scrolling, find in page, a
 *  hash link) still comes in from the edge it crossed. The arrival
 *  rises from that edge. There is no geometric "side": a
 *  `100vw` fullbleed is wider than the viewport by a classic scrollbar
 *  and would read as clipped sideways, and a strip's snap step takes a
 *  frame from wholly out to wholly in — a strip's frames fade by
 *  membership instead (D1606 follow-up, 2). Exported for the unit
 *  test. */
export function edge(
  entry: Pick<IntersectionObserverEntry, 'boundingClientRect' | 'rootBounds'>,
  last: 'top' | 'bottom',
): 'top' | 'bottom' {
  const box = entry.boundingClientRect;
  const root = entry.rootBounds;
  if (root === null) return last;
  const atTop = box.top < root.top;
  const atFoot = box.top + box.height > root.top + root.height;
  if (atTop && !atFoot) return 'top';
  if (atFoot && !atTop) return 'bottom';
  return last;
}

/** Drop the travel's stand-in from an image's host: `data-understudy`
 *  and `--understudy`. */
function dropUnderstudy(img: HTMLImageElement): void {
  const host = img.parentElement;
  if (host && 'understudy' in host.dataset) {
    delete host.dataset.understudy;
    host.style.removeProperty('--understudy');
  }
}

/** Mark a photograph shown for good: `data-shown=""`, which lifts the
 *  gate and the waiting fill. The one writer of the empty value — the
 *  animation's end, the `complete` short-cut, the early-`load` rule and
 *  the appearance-off case all come here — and so the one place a
 *  host's `data-understudy` (the travel's) and its `--understudy` leave
 *  with the fill, so a second visit to a stage never keeps the previous
 *  rendering under a live photograph. A frame that has its file
 *  (`complete`, with a `naturalWidth`) is remembered for `holdShown`;
 *  one shown without it (the appearance off, before its load) is not.
 *  Exported for the unit test. */
export function shown(img: HTMLImageElement): void {
  img.dataset.shown = '';
  if (img.complete && img.naturalWidth > 0) held.add(shownKey(location.pathname, img));
  dropUnderstudy(img);
}

/** The appearance and the arrival (spec 018). Every frame image in
 *  `scope` (`FRAME_IMG`) waits, hidden by the stylesheet's gate while
 *  <html> carries `data-motion`, and is shown one of three ways:
 *
 *  - at once (`data-shown=""`, no animation) when it is `complete` at
 *    the hook, when its `load` fires before the first animation frame
 *    after the hook (the browser already held the file; only the event
 *    was late), or when `--motion-appear` is off on its host;
 *  - as `"fade"` when its unit has decoded and the unit was in view at
 *    the hook (or `--motion-arrive` is off on a host in it);
 *  - off screen at the hook, when its unit has decoded and the one
 *    IntersectionObserver has seen it arrive (`arrives`: the
 *    `--arrive-threshold` share of it in view, or of the viewport's
 *    height for a unit too tall to show that share): `"rise"` when
 *    `--arrive-rise` is above zero, reduced motion is off and the unit
 *    is not in a strip's band — with `--rise-sign` set inline from the
 *    edge it crossed (`edge`), `1` from below and `-1` from above —
 *    else `"fade"`. A strip frame always fades: its band scrolls
 *    sideways and snaps.
 *
 *  Inside the quiet view's growth the kind is none: a unit revealed
 *  while <html> carries `data-moving="quiet"`, or revealed by its
 *  arrival while it carries `data-quiet`, is shown at once — the growth
 *  is that photograph's movement (the stage, reset further down the
 *  page, arrives as the view scrolls to the top). A unit whose decode
 *  ends after the growth fades as usual. A page change's transition is
 *  not the quiet view: the stage still fades over its understudy.
 *
 *  A unit is the image's `.piece-block` when that block holds more than
 *  one `img` (a diptych, triptych, grid, row with a pair), else the
 *  image's host; its images flip together. A strip is not a unit: its
 *  band scrolls sideways, and a lazy frame past the band's edge is never
 *  fetched until the reader scrolls to it — so a strip waiting for every
 *  frame would stay blank, and fetching those frames early would add
 *  requests the page does not make today (spec 018, AC 13). Inside the
 *  band each image is its own unit: its `a.image-link` host when
 *  linked, or the `img` itself when not (the band would otherwise be
 *  the shared host). `load` comes before
 *  `decode()` — a `decode()` on a lazy image not yet loaded would fetch
 *  it early. `animationend` writes `""`.
 *
 *  Re-entry (T1606b, D1606 Q1): a unit **replays** — appears each time
 *  it comes on screen — when every image in it has the appearance on,
 *  every host in it the arrival on, and the fade has a duration for
 *  this reader (not reduced motion with `--rm-appear: 0`, where a
 *  hidden frame would snap in at the threshold: a pop). A replaying
 *  unit is observed for the page's life, complete, in view or waiting.
 *  When it is wholly off screen its images lose `data-shown` (hidden by
 *  the gate, so no fade-out) and it reads as not in view, not arrived,
 *  not revealed — so it arrives again at the threshold, never "in view
 *  at the hook". Not while <html> carries `data-quiet`: the quiet view
 *  hides the page's other frames, which is not leaving the screen. It
 *  does run while `data-moving` is set: a page change's transition is
 *  when the first report arrives, and a held frame off screen at the
 *  landing is really off screen (D1606 follow-up, 1). At the quiet
 *  view's exit every replaying unit is observed afresh, so one the exit
 *  left off screen is reset (T1606b review B1). A reset also records
 *  the side the unit left by, for `edge`, and drops a host's stand-in.
 *  The gap between wholly off (the reset) and the threshold
 *  (the arrival) keeps a frame straddling an edge from replaying. A
 *  unit that does not replay is watched only when off screen and
 *  waiting at the hook, and let go on arrival.
 *
 *  Every read comes before the first write. A throw anywhere removes
 *  <html>'s `data-motion`, which shows every photograph — the one
 *  failure that could hide one. Returns the teardown. */
export function appear(scope: Document | Element): () => void {
  window.__motion = true;
  const root = document.documentElement;
  let live = true;
  let frame = 0;
  let observer: IntersectionObserver | null = null;
  let quietWatch: MutationObserver | null = null;
  const unbind: (() => void)[] = [];
  const teardown = () => {
    live = false;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    observer = null;
    quietWatch?.disconnect();
    quietWatch = null;
    for (const off of unbind) off();
    unbind.length = 0;
  };

  try {
    type Unit = {
      el: Element;
      images: HTMLImageElement[];
      waiting: Set<HTMLImageElement>;
      inView: boolean;
      arrived: boolean;
      revealed: boolean;
      /** Every image's appearance and every host's arrival on. */
      appearOn: boolean;
      arriveOn: boolean;
      replays: boolean;
      /** Inside a strip's band: always a fade. */
      strip: boolean;
      /** The edge the unit last arrived across. */
      edge: 'top' | 'bottom';
      /** The side it was on when last seen wholly off screen. */
      last: 'top' | 'bottom';
    };

    // The reads.
    const threshold = Number(token('--arrive-threshold'));
    const stagger = ms(token('--arrive-stagger')) > 0;
    const reduced = reducedMotion();
    const rise = Number.parseFloat(token('--arrive-rise')) > 0 && !reduced;
    const fadeLasts = !(reduced && token('--rm-appear') === '0');
    const frames = [...scope.querySelectorAll<HTMLImageElement>(FRAME_IMG)];
    const units = new Map<Element, Unit>();
    const reads = frames.map((img) => {
      const host = img.parentElement as Element;
      const block = img.closest('.piece-block');
      const strip = img.closest('.piece-strip-scroll') !== null;
      const el = strip
        ? host.matches('.image-link')
          ? host
          : img
        : block && block.querySelectorAll('img').length > 1
          ? block
          : host;
      const style = getComputedStyle(host);
      let unit = units.get(el);
      if (!unit) {
        const rect = el.getBoundingClientRect();
        unit = {
          el,
          images: [],
          waiting: new Set(),
          inView: inViewport(rect),
          arrived: false,
          revealed: false,
          appearOn: true,
          arriveOn: true,
          replays: false,
          strip,
          edge: 'bottom',
          last: rect.bottom <= 0 ? 'top' : 'bottom',
        };
        units.set(el, unit);
      }
      unit.images.push(img);
      const appearOn = on(style, '--motion-appear');
      if (!appearOn) unit.appearOn = false;
      if (!on(style, '--motion-arrive')) {
        unit.inView = true;
        unit.arriveOn = false;
      }
      return { img, unit, complete: img.complete, appearOn };
    });
    for (const unit of units.values()) unit.replays = fadeLasts && unit.appearOn && unit.arriveOn;

    // The writes.
    let settled = false;
    frame = requestAnimationFrame(() => {
      settled = true;
    });

    // A unit every image of which is already shown — by the `complete`
    // short-cut, the early-`load` rule or the appearance off — counts as
    // revealed, so its first observer callback leaves it alone.
    // `arrival`: the observer's arrival calls it, not a decode.
    const reveal = (unit: Unit, arrival = false) => {
      if (!live || unit.revealed || unit.waiting.size > 0) return;
      if (unit.images.every((img) => img.dataset.shown !== undefined)) {
        unit.revealed = true;
        return;
      }
      if (!(unit.inView || unit.arrived)) return;
      unit.revealed = true;
      // Inside the quiet view's growth: at once, no second movement.
      if (root.dataset.moving === 'quiet' || (arrival && 'quiet' in root.dataset)) {
        for (const img of unit.images) if (img.dataset.shown === undefined) shown(img);
        return;
      }
      const kind = unit.inView || !rise || unit.strip ? 'fade' : 'rise';
      for (const img of unit.images) {
        if (img.dataset.shown !== undefined) continue;
        if (kind === 'rise') img.style.setProperty('--rise-sign', unit.edge === 'top' ? '-1' : '1');
        img.dataset.shown = kind;
      }
    };

    // Wholly off screen: hidden again, without a fade-out, to arrive anew.
    // The side it left by is where it will come back from after a jump,
    // and a stand-in left by a fade cut short never replays under it.
    const leave = (unit: Unit, entry: IntersectionObserverEntry) => {
      if ('quiet' in root.dataset) return;
      const box = entry.boundingClientRect;
      const bounds = entry.rootBounds;
      if (bounds) {
        unit.last = box.top + box.height / 2 < bounds.top + bounds.height / 2 ? 'top' : 'bottom';
      }
      if (unit.images.some((img) => img.dataset.shown !== undefined)) {
        for (const img of unit.images) delete img.dataset.shown;
      }
      for (const img of unit.images) dropUnderstudy(img);
      unit.revealed = false;
      unit.arrived = false;
      unit.inView = false;
    };

    const ready = (unit: Unit, img: HTMLImageElement) => {
      unit.waiting.delete(img);
      reveal(unit);
    };

    const listen = (img: HTMLImageElement, type: string, handler: () => void) => {
      img.addEventListener(type, handler);
      unbind.push(() => img.removeEventListener(type, handler));
    };

    for (const { img, unit, complete, appearOn } of reads) {
      if (stagger) img.style.setProperty('--i', String(unit.images.indexOf(img)));
      // A replaying unit's image may animate on any return, so it hears
      // its animation's end whether or not it waits now.
      if (unit.replays || !(complete || !appearOn)) listen(img, 'animationend', () => shown(img));
      if (complete || !appearOn) {
        shown(img);
        continue;
      }
      unit.waiting.add(img);
      // A broken file does not hold its unit: it is not a photograph to
      // wait for, so its unit goes on without it.
      listen(img, 'error', () => ready(unit, img));
      listen(img, 'load', () => {
        if (!live) return;
        if (!settled) {
          shown(img);
          ready(unit, img);
          return;
        }
        img.decode().then(
          () => ready(unit, img),
          () => ready(unit, img),
        );
      });
    }
    for (const unit of units.values()) reveal(unit);

    // Watched: every replaying unit, for the page's life; of the rest,
    // only a unit off screen and still waiting — one shown whole at the
    // hook has nothing left to arrive — let go as it arrives.
    const watched = [...units.values()].filter(
      (unit) => unit.replays || (!unit.inView && unit.waiting.size > 0),
    );
    if (watched.length > 0) {
      let remaining = watched.filter((unit) => !unit.replays).length;
      const replaying = watched.length > remaining;
      const byEl = new Map(watched.map((unit) => [unit.el, unit]));
      observer = new IntersectionObserver(
        (entries, self) => {
          for (const entry of entries) {
            const unit = byEl.get(entry.target);
            if (!unit) continue;
            if (unit.replays && !entry.isIntersecting) {
              leave(unit, entry);
              continue;
            }
            if (unit.arrived || !arrives(entry, threshold)) continue;
            unit.arrived = true;
            unit.edge = edge(entry, unit.last);
            if (!unit.replays) {
              self.unobserve(entry.target);
              remaining -= 1;
            }
            reveal(unit, true);
          }
          if (remaining === 0 && !replaying) self.disconnect();
        },
        { threshold: arrivalSteps(threshold) },
      );
      for (const unit of watched) observer.observe(unit.el);
      // The quiet view hides the page's other frames without a report
      // that counts (the reset is skipped under data-quiet), and its exit
      // may leave them off screen with no new report to come: at the
      // exit every replaying unit is observed afresh, so its initial
      // report resets one off screen and leaves one on screen alone.
      if (replaying) {
        const io = observer;
        const again = watched.filter((unit) => unit.replays).map((unit) => unit.el);
        quietWatch = new MutationObserver((records) => {
          if (!records.some((record) => record.oldValue !== null) || 'quiet' in root.dataset) return;
          for (const el of again) {
            io.unobserve(el);
            io.observe(el);
          }
        });
        quietWatch.observe(root, { attributes: true, attributeFilter: ['data-quiet'], attributeOldValue: true });
      }
    }
  } catch (error) {
    delete root.dataset.motion;
    teardown();
    console.error(error);
  }
  return teardown;
}
