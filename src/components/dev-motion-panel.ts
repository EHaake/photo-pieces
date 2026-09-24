/**
 * The motion switch's panel (spec 018, T1602) — a DEV-ONLY module.
 *
 * It lives in a file of its own because src/components/DevMotion.astro
 * SERVES it rather than bundling it: the tag is
 * `<script is:inline type="module" src="/src/components/dev-motion-panel.ts">`,
 * which Astro leaves alone and the dev server transforms on request, so
 * nothing about it enters the client bundle — a hoisted `<script>` over
 * Vite's 4 KB inline limit is emitted as a chunk in dist/_astro/ whether
 * or not its page renders (the matte sampler's reason; plan.md's "A dev
 * fixture's script is served, never bundled"; ground.test.mjs (h) pins
 * the form). Its styles are set from here (`style.cssText`), never a
 * `<style>` block, for the same reason.
 *
 * This file is the controls, not the override: DevMotion.astro's inline
 * applier is what runs before first paint and after every swap. The panel
 * writes the same key, localStorage['dev-motion'] = { tokens, rise }, and
 * the same properties on <html> — ONLY the tokens the person changed, so
 * the stylesheet's reduced-motion :root still shows through everything
 * else. `rise` is the rise field's length, kept so the shape toggle can
 * restore it after a fade. Reset is the absence of an override: the key
 * and every inline motion property go, and the fields re-read the
 * committed stylesheet.
 *
 * Three parts (amended at the Phase 1 pause, decision review D1606 Q2):
 * the appearance — one select of named settings from
 * dev-motion-presets.ts, each writing its four tokens together, showing
 * "custom" when the effective four match none; the behaviours — the four
 * on/off switches and the waiting fill; and every value — a nested
 * <details>, collapsed by default, with a row per `MOTION_TOKENS` entry.
 * A control on one token can sit in two parts, so every control
 * re-reads the effective values after any change.
 */
import { MOTION_TOKENS, token } from '../lib/motion';
import { APPEARANCE_PRESETS, APPEARANCE_TOKENS } from './dev-motion-presets';

const KEY = 'dev-motion';
type Stored = { tokens: Record<string, string>; rise?: string };

/** The waiting fill's two choices. */
const FILLS: Record<string, string> = {
  surface: 'var(--color-surface)',
  ground: 'var(--color-bg)',
};

/** The rise field's length when neither the key nor the stylesheet has one. */
const DEFAULT_RISE = '0.5rem';

const RISE = '--arrive-rise';

/** Whether the panel, and its every-value part, were open, so a rebuild
 *  after a swap keeps them as they were. */
let open = false;
let valuesOpen = false;

/** Each control's re-read of the effective values, run after any change. */
let refreshers: (() => void)[] = [];

const read = (): Stored => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Stored>) : null;
    if (parsed && parsed.tokens && typeof parsed.tokens === 'object')
      return { tokens: parsed.tokens, rise: parsed.rise };
  } catch {
    /* no storage or a malformed key: no override */
  }
  return { tokens: {} };
};

const save = (stored: Stored) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable: the override lasts this page */
  }
};

/** One token changed: on <html> and in the key, nothing else. */
const set = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value);
  const stored = read();
  stored.tokens[name] = value;
  save(stored);
  showEffective();
};

const showEffective = () => {
  for (const out of document.querySelectorAll<HTMLElement>('.dev-motion [data-effective]')) {
    out.textContent = token(out.dataset.effective ?? '');
  }
  for (const refresh of refreshers) refresh();
};

/** A length reads as zero: the fade alone. */
const isZero = (value: string) => value === '' || Number.parseFloat(value) === 0;

/** One spelling of a value, so `cubic-bezier(0.33,1,…)` matches `cubic-bezier(0.33, 1, …)`. */
const same = (value: string) => value.replace(/\s+/g, '').toLowerCase();

/** The named setting whose four values are the effective ones, else custom. */
const CUSTOM = 'custom';
const currentPreset = (): string =>
  APPEARANCE_PRESETS.find((preset) =>
    APPEARANCE_TOKENS.every((name) => same(token(name)) === same(preset.tokens[name])),
  )?.name ?? CUSTOM;

const cell = (...children: (Node | string)[]) => {
  const td = document.createElement('td');
  td.style.cssText = 'padding: 0.1rem 0.4rem; vertical-align: middle;';
  td.append(...children);
  return td;
};

const select = (options: string[], value: string) => {
  const el = document.createElement('select');
  for (const option of options) el.append(new Option(option, option, false, option === value));
  return el;
};

const field = (value: string) => {
  const el = document.createElement('input');
  el.type = 'text';
  el.value = value;
  el.size = 14;
  el.style.cssText = 'font: inherit;';
  return el;
};

/** A field is left alone while the person is typing in it. */
const refill = (input: HTMLInputElement, value: string) => {
  if (document.activeElement !== input) input.value = value;
};

const fillChoice = () => (read().tokens['--wait-fill'] === FILLS.ground ? 'ground' : 'surface');

const control = (name: string, kind: string, stored: Stored): (Node | string)[] => {
  if (kind === 'flag') {
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = token(name) === '1';
    box.addEventListener('change', () => set(name, box.checked ? '1' : '0'));
    refreshers.push(() => {
      box.checked = token(name) === '1';
    });
    return [box];
  }
  if (kind === 'fill') {
    const fill = document.createElement('select');
    fill.append(
      new Option('surface: a faint tone', 'surface'),
      new Option("ground: the page's own colour", 'ground'),
    );
    fill.value = fillChoice();
    fill.addEventListener('change', () => set(name, FILLS[fill.value]));
    refreshers.push(() => {
      fill.value = fillChoice();
    });
    return [fill];
  }
  if (name === RISE) {
    // The arrival's shape: fade writes 0px, rise writes the rise field.
    const now = token(name);
    const rise = field(stored.rise ?? (isZero(now) ? DEFAULT_RISE : now));
    const shape = select(['fade', 'rise'], isZero(now) ? 'fade' : 'rise');
    const keep = () => {
      const next = read();
      next.rise = rise.value;
      save(next);
    };
    shape.addEventListener('change', () => {
      keep();
      set(name, shape.value === 'rise' ? rise.value : '0px');
    });
    rise.addEventListener('change', () => {
      keep();
      if (shape.value === 'rise') set(name, rise.value);
    });
    refreshers.push(() => {
      const value = token(name);
      shape.value = isZero(value) ? 'fade' : 'rise';
      if (!isZero(value)) refill(rise, value);
    });
    return [shape, ' ', rise];
  }
  const input = field(token(name));
  input.addEventListener('change', () => set(name, input.value.trim()));
  refreshers.push(() => refill(input, token(name)));
  return [input];
};

const heading = (text: string) => {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'font-weight: bold; margin-block: 0.5rem 0.2rem;';
  return el;
};

const note = (text = '') => {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'color: GrayText; max-width: 34em; margin-block: 0.2rem;';
  return el;
};

/** The appearance: one select of named settings, and what the chosen one does. */
const appearance = () => {
  const choice = document.createElement('select');
  choice.className = 'dev-motion-preset';
  for (const preset of APPEARANCE_PRESETS) choice.append(new Option(preset.name, preset.name));
  const custom = new Option(CUSTOM, CUSTOM);
  custom.disabled = true;
  choice.append(custom);
  const describe = note();
  const show = () => {
    choice.value = currentPreset();
    describe.textContent =
      APPEARANCE_PRESETS.find((preset) => preset.name === choice.value)?.description ??
      'Your own values, typed in under "every value" below.';
  };
  choice.addEventListener('change', () => {
    const preset = APPEARANCE_PRESETS.find((each) => each.name === choice.value);
    if (!preset) return;
    for (const name of APPEARANCE_TOKENS) set(name, preset.tokens[name]);
  });
  refreshers.push(show);
  show();
  const label = document.createElement('label');
  label.append('Setting ', choice);
  return [heading('How photographs appear as you scroll'), label, describe];
};

/** The four behaviours, in plain words, and the waiting fill. */
const BEHAVIOURS: [string, string][] = [
  ['--motion-appear', 'Photographs fade in once they have loaded'],
  ['--motion-arrive', 'Photographs further down wait until you scroll to them'],
  ['--motion-travel', 'A clicked photograph grows into its own page, and shrinks back'],
  ['--motion-quiet', 'The quiet view (click the photograph on its page) opens and closes smoothly'],
];

const behaviours = (stored: Stored) => {
  const list = document.createElement('div');
  for (const [name, text] of BEHAVIOURS) {
    const line = document.createElement('label');
    line.style.cssText = 'display: block;';
    line.append(...control(name, 'flag', stored), ' ', text);
    list.append(line);
  }
  const fill = document.createElement('label');
  fill.style.cssText = 'display: block; margin-top: 0.3rem;';
  fill.append('The box a photograph waits in ', ...control('--wait-fill', 'fill', stored));
  list.append(fill);
  return [heading('What moves'), list];
};

/** Every value: the full per-token table, collapsed until asked for. */
const everyValue = (stored: Stored) => {
  const values = document.createElement('details');
  values.className = 'dev-motion-values';
  values.open = valuesOpen;
  values.addEventListener('toggle', () => {
    valuesOpen = values.open;
  });
  values.style.cssText = 'margin-block: 0.5rem;';
  const summary = document.createElement('summary');
  summary.textContent = 'every value';
  summary.style.cssText = 'cursor: pointer;';

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse: collapse; margin-block: 0.3rem;';
  const body = document.createElement('tbody');
  for (const { name, kind, label } of MOTION_TOKENS) {
    const row = document.createElement('tr');
    row.dataset.token = name;
    const effective = document.createElement('output');
    effective.dataset.effective = name;
    effective.style.cssText = 'color: GrayText;';
    const code = document.createElement('code');
    code.textContent = name;
    code.style.cssText = 'color: GrayText;';
    row.append(cell(label), cell(code), cell(...control(name, kind, stored)), cell(effective));
    body.append(row);
  }
  table.append(body);
  values.append(summary, table);
  return values;
};

const reset = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* as above */
  }
  for (const { name } of MOTION_TOKENS) document.documentElement.style.removeProperty(name);
  build();
};

/** Build (or rebuild — the swap replaces the body) the panel. */
const build = () => {
  document.querySelector('.dev-motion')?.remove();
  refreshers = [];
  const stored = read();

  const panel = document.createElement('details');
  panel.className = 'dev-motion';
  panel.open = open;
  panel.addEventListener('toggle', () => {
    open = panel.open;
  });
  panel.style.cssText = [
    'position: fixed',
    'left: 0.5rem',
    'bottom: 0.5rem',
    'z-index: 2147483647',
    'max-height: 85vh',
    'overflow: auto',
    'padding: 0.3rem 0.5rem',
    'font: 12px/1.4 ui-monospace, monospace',
    'color: CanvasText',
    'background: Canvas',
    'border: 1px solid GrayText',
    'border-radius: 4px',
  ].join('; ');

  const summary = document.createElement('summary');
  summary.textContent = 'motion';
  summary.style.cssText = 'cursor: pointer;';

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'reset to the committed values';
  clear.addEventListener('click', reset);

  panel.append(summary, ...appearance(), ...behaviours(stored), everyValue(stored), clear);
  document.body.append(panel);
  showEffective();
};

document.addEventListener('astro:page-load', build);
