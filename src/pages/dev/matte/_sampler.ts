/**
 * The matte sampler's toolbars (spec 013's mat bar, spec 014's ground bar) —
 * a DEV-ONLY module, the body of the script that src/pages/dev/matte/
 * [...surface].astro used to carry inline.
 *
 * It lives in a file of its own because the page SERVES it rather than
 * bundling it: the page tag is
 * `<script is:inline type="module" src="/src/pages/dev/matte/_sampler.ts">`,
 * which Astro leaves alone and the dev server transforms on request, so
 * nothing about it enters the client bundle. A hoisted (non-inline)
 * `<script>` cannot do that: once its bundled chunk reaches Vite's
 * `build.assetsInlineLimit` (4 KB) Astro stops inlining it into the HTML and
 * emits it as a chunk in dist/_astro/ — which ships even for a route whose
 * getStaticPaths() returns [] and whose pages are therefore never built.
 * That is how a dev fixture's script reached the built site and tripped
 * check-no-dev-routes; plan.md records the decision as "A dev fixture's
 * script is served, never bundled", and ground.test.mjs pins it.
 *
 * The leading underscore keeps this file out of Astro's routing: everything
 * under src/pages/ is a route except names beginning with `_`.
 */

// The sampler's toolbars — page-level progressive enhancement, the only
// script this fixture carries.
//
// Per surface: the five mat candidates set --mat-share / --mat-min /
// --mat-max on that surface's wrapper <section> (the frames inherit
// them), with two rem inputs that replace the floor and ceiling on the
// share candidates. That state is this page's, in sessionStorage.
//
// The GROUND is the site-wide switch's (spec 014). This bar writes
// localStorage['dev-ground'] = { id, bg, muted, tokens } and sets the same
// tokens on <html> here, so the readout and the page move together;
// src/components/DevGround.astro re-applies the key in the head of every
// other dev page, so the candidate carries across the site. All the
// arithmetic — the family's steps, the contrast, the muted deepening, the
// candidate table — is src/lib/ground.ts, the module the tests pin, so the
// numbers shown here are the numbers the suite guarantees. The gate's
// recorded values live in specs/014-ground-tone/.
//
// NO COLOUR TOKEN IS EVER READ OFF A COMPUTED STYLE here: on a reload with
// a deepened candidate stored, the head applier has already put the deeper
// --color-muted on <html>, and a DOM read would grade the tone against that
// instead of against the stylesheet's muted — a failing ground would read
// as passing. The readout's fixed ends are the module's TEXT/MUTED/MAT.
import {
  CANDIDATES,
  FLOOR,
  GROUND_TOKENS,
  MAT,
  TODAY,
  contrast,
  formatOklch,
  parseOklch,
  readout,
  tokensFor,
  type Tone,
} from '../../../lib/ground';

const KEY = 'matte-sampler';
type State = { candidates: Record<string, string>; floor: string; ceil: string };
const read = (): State => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { candidates: {}, floor: '0.25', ceil: '2.5', ...JSON.parse(raw) };
  } catch {
    /* a private window with no storage still switches, it just forgets */
  }
  return { candidates: {}, floor: '0.25', ceil: '2.5' };
};
let state = read();
const save = () => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* as above */
  }
};

const applySurface = (section: HTMLElement) => {
  const name = section.dataset.surface ?? '';
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-candidate]')];
  if (buttons.length === 0) return;
  const wanted = state.candidates[name];
  // No stored choice yet: the surface opens where the server rendered it
  // (the `share-60` candidate — the mat rule that ships), not on the first
  // button in the table.
  const button =
    buttons.find((b) => b.dataset.candidate === wanted) ??
    buttons.find((b) => b.dataset.start !== undefined) ??
    buttons[0];
  const tunable = button.dataset.tunable === 'yes';
  const min = tunable ? `${state.floor}rem` : (button.dataset.min ?? '0px');
  const max = tunable ? `${state.ceil}rem` : (button.dataset.max ?? '0px');
  const share = button.dataset.share ?? '0';
  section.style.setProperty('--mat-share', share);
  section.style.setProperty('--mat-min', min);
  section.style.setProperty('--mat-max', max);
  for (const b of buttons) b.classList.toggle('is-active', b === button);
  const label = section.querySelector<HTMLElement>('[data-label]');
  const note = section.querySelector<HTMLElement>('.sampler-bar-head');
  if (label) {
    label.textContent = `${name} — ${button.dataset.note ?? ''} — ${button.dataset.candidate}: share ${share} / floor ${min} / ceiling ${max}`;
  }
  if (note) note.textContent = name;
};

// ---- the ground bar ----------------------------------------------------

const GROUND_KEY = 'dev-ground';
type Stored = { id: string; bg: string; muted: string; tokens: Record<string, string> };

/** Every property a candidate can put on <html> — the family's five plus
 *  the deepened muted — so `today` and reset can take them all off again,
 *  and a ground that needs no deepening clears a previous one's. */
const OVERRIDES = [...Object.values(GROUND_TOKENS), '--color-muted'];

const storedGround = (): Stored | null => {
  try {
    const raw = localStorage.getItem(GROUND_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null; /* no storage: the stylesheet's ground */
  }
};

/** Two decimals, ROUNDED DOWN — 4.499 must never read as 4.50 on a row
 *  the floor fails. */
const floor2 = (value: number): string => (Math.floor(value * 100) / 100).toFixed(2);

const showTokens = (tokens: Record<string, string> | null) => {
  const line = document.querySelector<HTMLElement>('[data-ground-tokens]');
  if (!line) return;
  const entries = Object.entries(tokens ?? {});
  line.textContent =
    entries.length === 0
      ? 'no override — the stylesheet'
      : entries.map(([name, value]) => `${name}: ${value}`).join('\n');
};

/** Fill the bar from a tone: the tone line, the seven rows, the muted line,
 *  the active button. Reads nothing from the page and writes nothing to it
 *  beyond the bar — selectGround does the storing and the applying. */
const showGround = (tone: Tone, id: string, reading = readout(tone)) => {
  const toneLine = document.querySelector<HTMLElement>('[data-ground-tone]');
  if (toneLine) toneLine.textContent = formatOklch(tone);
  const idLine = document.querySelector<HTMLElement>('[data-ground-id]');
  if (idLine) idLine.textContent = id;

  const rows = document.querySelector<HTMLElement>('[data-ground-rows]');
  if (rows) {
    // The mat row is information, not a floor: it carries the ratio and the
    // lightness step from the ground to the mat's white.
    const dL = Math.round((MAT.L - reading.family.bg.L) * 1000) / 1000;
    rows.replaceChildren(
      ...reading.pairs.map((pair) => {
        const row = document.createElement('tr');
        if (pair.passes === false) row.classList.add('is-fail');
        const name = document.createElement('th');
        name.scope = 'row';
        name.textContent = pair.id;
        const value = document.createElement('td');
        const shipped =
          pair.ink === 'muted' && reading.deepened
            ? contrast(reading.muted, reading.family[pair.on])
            : null;
        if (shipped === null) {
          value.textContent = pair.floored
            ? floor2(pair.ratio)
            : `${floor2(pair.ratio)} — ΔL ${dL}`;
        } else {
          // Both numbers, as the plan requires: the row fails at the muted the
          // stylesheet carries today — that is what made it deepen — and passes
          // at the muted this ground would ship. The second number is marked on
          // its own; the row's is-fail is about the first.
          const at = document.createElement('span');
          at.textContent = `${floor2(shipped)} ${shipped >= FLOOR ? '✓' : '✗'}`;
          if (shipped < FLOOR) at.classList.add('is-fail');
          value.append(`${floor2(pair.ratio)} → `, at, ' at the shipped muted');
        }
        row.append(name, value);
        return row;
      }),
    );
  }

  const muted = document.querySelector<HTMLElement>('[data-ground-muted]');
  if (muted) {
    // The rows are graded at the committed muted, so a deepening names the
    // pairs that made it happen and the line says what would ship.
    const failing = reading.pairs
      .filter((pair) => pair.ink === 'muted' && pair.passes === false)
      .map((pair) => pair.id);
    muted.textContent = reading.deepened
      ? `muted ships at ${formatOklch(reading.deepened)} — deepened for ${failing.join(', ')}`
      : 'muted unchanged';
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ground]')) {
    button.classList.toggle('is-active', button.dataset.ground === id);
  }
};

const seedTune = (tone: Tone) => {
  const axes: Record<string, number> = { l: tone.L, c: tone.C, h: tone.h };
  for (const input of document.querySelectorAll<HTMLInputElement>('[data-tune]')) {
    const axis = input.dataset.tune ?? '';
    if (axes[axis] === undefined) continue;
    input.value = String(axes[axis]);
    const out = document.querySelector<HTMLOutputElement>(`[data-tune-out="${axis}"]`);
    if (out) out.value = input.value;
  }
};

/** The three sliders as a tone, each axis falling back to the control's. */
const tunedTone = (): Tone => {
  const today = CANDIDATES[TODAY].bg;
  const at = (axis: string, fallback: number) => {
    const input = document.querySelector<HTMLInputElement>(`[data-tune="${axis}"]`);
    const value = input ? Number(input.value) : Number.NaN;
    return Number.isFinite(value) ? value : fallback;
  };
  return { L: at('l', today.L), C: at('c', today.C), h: at('h', today.h) };
};

/** Apply a tone site-wide: the key, the tokens on <html>, the bar.
 *  `today` is the ABSENCE of an override — the key and every inline
 *  property go, so the control is the committed stylesheet itself and a
 *  stale override cannot pose as it. */
const selectGround = (tone: Tone, id: string) => {
  const root = document.documentElement;
  if (id === TODAY) {
    try {
      localStorage.removeItem(GROUND_KEY);
    } catch {
      /* as above */
    }
    for (const name of OVERRIDES) root.style.removeProperty(name);
    showGround(tone, id);
    showTokens(null);
    return;
  }
  const reading = readout(tone);
  const tokens = tokensFor(tone);
  for (const name of OVERRIDES) {
    const value = tokens[name];
    if (value) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  }
  try {
    localStorage.setItem(
      GROUND_KEY,
      JSON.stringify({
        id,
        bg: formatOklch(tone),
        muted: formatOklch(reading.muted),
        tokens,
      }),
    );
  } catch {
    /* as above */
  }
  showGround(tone, id, reading);
  showTokens(tokens);
};

/** On load the bar follows the stored key — the button it names, the
 *  sliders at its tone — and the readout is recomputed FROM THAT TONE, not
 *  from the page the head applier has already dressed. No key means the
 *  control: today's tone, no override, the stylesheet. */
const initGround = () => {
  if (!document.querySelector('[data-ground-bar]')) return;
  const stored = storedGround();
  if (stored && typeof stored.bg === 'string') {
    try {
      const tone = parseOklch(stored.bg);
      seedTune(tone);
      showGround(tone, stored.id ?? '');
      showTokens(stored.tokens ?? null);
      return;
    } catch {
      /* a malformed key: fall through to the control */
    }
  }
  const today = CANDIDATES[TODAY].bg;
  seedTune(today);
  showGround(today, TODAY);
  showTokens(null);
};

const init = () => {
  const sections = [...document.querySelectorAll<HTMLElement>('.sampler-surface')];
  if (sections.length === 0) return;
  for (const section of sections) {
    for (const input of section.querySelectorAll<HTMLInputElement>('[data-floor]')) {
      input.value = state.floor;
    }
    for (const input of section.querySelectorAll<HTMLInputElement>('[data-ceil]')) {
      input.value = state.ceil;
    }
    applySurface(section);
  }
  initGround();
};

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const candidate = target.closest<HTMLButtonElement>('[data-candidate]');
  if (candidate) {
    const section = candidate.closest<HTMLElement>('.sampler-surface');
    if (!section) return;
    state.candidates[section.dataset.surface ?? ''] = candidate.dataset.candidate ?? '';
    save();
    applySurface(section);
    return;
  }
  const ground = target.closest<HTMLButtonElement>('[data-ground]');
  if (ground) {
    const tone = {
      L: Number(ground.dataset.l),
      C: Number(ground.dataset.c),
      h: Number(ground.dataset.h),
    };
    seedTune(tone);
    selectGround(tone, ground.dataset.ground ?? TODAY);
    return;
  }
  if (target.closest('[data-ground-reset]')) {
    const today = CANDIDATES[TODAY].bg;
    seedTune(today);
    selectGround(today, TODAY);
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  // A slider move is a ground of its own — id `tune`, so it is never
  // mistaken for a candidate.
  if (target.dataset.tune !== undefined) {
    const out = document.querySelector<HTMLOutputElement>(
      `[data-tune-out="${target.dataset.tune}"]`,
    );
    if (out) out.value = target.value;
    selectGround(tunedTone(), 'tune');
    return;
  }
  if (target.dataset.floor === undefined && target.dataset.ceil === undefined) return;
  if (target.dataset.floor !== undefined) state.floor = target.value;
  else state.ceil = target.value;
  save();
  for (const section of document.querySelectorAll<HTMLElement>('.sampler-surface')) {
    for (const input of section.querySelectorAll<HTMLInputElement>('[data-floor]')) {
      input.value = state.floor;
    }
    for (const input of section.querySelectorAll<HTMLInputElement>('[data-ceil]')) {
      input.value = state.ceil;
    }
    applySurface(section);
  }
});

document.addEventListener('astro:page-load', () => {
  state = read();
  init();
});
