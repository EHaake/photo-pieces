/**
 * The arrival's tuning bar (spec 016, T1403) — a DEV-ONLY module, the
 * body of the second script src/components/DevArrival.astro carries.
 *
 * It lives in a file of its own because the component SERVES it rather
 * than bundling it: the tag is
 * `<script is:inline type="module" src="/src/components/dev-arrival.ts">`,
 * which Astro leaves alone and the dev server transforms on request, so
 * nothing about it enters the client bundle. A hoisted (non-inline)
 * `<script>` cannot do that — once its chunk passes Vite's 4 KB inline
 * limit Astro emits it under dist/_astro/, which ships. plan.md records
 * the decision as "A dev fixture's script is served, never bundled", and
 * ground.test.mjs case (h) pins it over every src/components/Dev* file.
 *
 * What it does: on an image page, at astro:page-load, it builds a fixed
 * bottom-right bar — three sliders (depth, chrome, fade), a live lights
 * readout, the line the photographer pastes into :root, and a reset. A
 * slider writes its custom property inline on <html> and the three
 * values into localStorage['dev-arrival'], so DevArrival.astro's head
 * applier has them back before the first paint of the next load.
 *
 * THE BAR SHOWS NUMBERS, NOT COLOURS. The values it prints are the
 * values on <html>; the arrival's colour is the browser's own mix, and
 * judging it is the eye's job at the gate. The only computed read in
 * this file is the reset's — the stylesheet's own defaults, read back
 * from :root once the overrides are off, which is why :root declares an
 * arrival fade at all.
 *
 * The sliders stop short of the open ends arrival.test.mjs (a) rejects
 * (a depth of 1 would reach the quiet tone, a chrome of 0 would put the
 * dimmed chrome at the wall), so the bar cannot offer a value the
 * landing would refuse.
 */

const KEY = 'dev-arrival';

type Field = 'depth' | 'chrome' | 'fade';
type Tuning = Record<Field, string>;

/** The three knobs, in the order the bar shows them and the line prints
 *  them. `property` is never written next to a colon in this file — the
 *  pasteable line is assembled from these names at runtime, so the
 *  module declares none of the arrival's tokens as source text. */
const KNOBS: { field: Field; property: string; min: string; max: string; step: string }[] = [
  { field: 'depth', property: '--arrival-depth', min: '0.5', max: '0.99', step: '0.01' },
  { field: 'chrome', property: '--arrival-chrome', min: '0.01', max: '1', step: '0.01' },
  { field: 'fade', property: '--arrival-fade', min: '0.25', max: '2', step: '0.05' },
];

const root = document.documentElement;

const storedTuning = (): Partial<Tuning> | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Partial<Tuning>) : null;
  } catch {
    /* no storage, or a malformed key: the stylesheet's arrival */
    return null;
  }
};

const save = (values: Tuning) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(values));
  } catch {
    /* a private window with no storage still tunes, it just forgets */
  }
};

/** The stylesheet's own values. THE ONE COMPUTED READ IN THIS FILE, and
 *  only ever with no override in the way — on load with no key, and
 *  right after a reset has removed the three inline properties. */
const defaults = (): Tuning => {
  const computed = getComputedStyle(root);
  const values = {} as Tuning;
  for (const { field, property } of KNOBS)
    values[field] = computed.getPropertyValue(property).trim();
  return values;
};

/** The bar's rules, injected rather than written as a component <style>
 *  (which would be bundled whether or not the component renders). The
 *  banner geometry is src/pages/dev/matte/[...surface].astro's
 *  `.sampler-banner`; the typography is the site's own `.meta`. */
const BAR_CSS = `
[data-dev-arrival-bar] {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 200;
  max-width: 24rem;
  max-height: 80vh;
  overflow: auto;
  padding: 0.6rem 0.8rem;
  border: var(--hairline);
  background: var(--color-surface);
}
[data-dev-arrival-bar] p {
  margin: 0 0 0.35rem;
}
[data-dev-arrival-bar] strong {
  color: var(--color-text);
}
[data-dev-arrival-bar] label {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  margin-right: 0.5rem;
}
[data-dev-arrival-bar] input[type='range'] {
  width: 6rem;
}
[data-dev-arrival-bar] button {
  padding: 0.2rem 0.5rem;
  border: var(--hairline);
  background: var(--color-bg);
  color: var(--color-muted);
  font: inherit;
  cursor: pointer;
}
/* The quiet view is the frame alone on the wall — the bar goes with the
   rest of the chrome. */
html[data-quiet] [data-dev-arrival-bar] {
  display: none;
}
`;

const bar = () => document.querySelector<HTMLElement>('[data-dev-arrival-bar]');
const knobInput = (field: Field) =>
  document.querySelector<HTMLInputElement>(`[data-dev-arrival-knob="${field}"]`);

/** Draw the inputs, the outputs and the pasteable line. `override` says
 *  whether a key is stored: with none, the line names the stylesheet
 *  rather than printing a declaration nobody has made. */
const show = (values: Tuning, override: boolean) => {
  for (const { field } of KNOBS) {
    const input = knobInput(field);
    if (input) input.value = values[field];
    const out = document.querySelector<HTMLOutputElement>(`[data-dev-arrival-out="${field}"]`);
    if (out) out.value = values[field];
  }
  const line = document.querySelector<HTMLElement>('[data-dev-arrival-line]');
  if (line) {
    line.textContent = override
      ? KNOBS.map(({ field, property }) => `${property}: ${values[field]}`).join('; ')
      : 'no override — the stylesheet';
  }
};

/** The lights are the arrival script's number, read straight off <html>
 *  — this bar computes nothing about the fade itself. */
const showLights = () => {
  const out = document.querySelector<HTMLOutputElement>('[data-dev-arrival-lights]');
  if (out) out.value = root.style.getPropertyValue('--arrival-lights') || '—';
};

/** What the three inputs currently read, as the key's three strings. */
const fromInputs = (): Tuning => {
  const values = {} as Tuning;
  for (const { field } of KNOBS) values[field] = knobInput(field)?.value ?? '';
  return values;
};

const build = () => {
  if (!document.querySelector('.image-page')) return;
  if (bar()) return;

  if (!document.querySelector('style[data-dev-arrival]')) {
    const style = document.createElement('style');
    style.setAttribute('data-dev-arrival', '');
    style.textContent = BAR_CSS;
    document.head.append(style);
  }

  const panel = document.createElement('aside');
  panel.className = 'meta';
  panel.setAttribute('data-dev-arrival-bar', '');
  panel.innerHTML = `
    <p><strong>arrival</strong></p>
    <p>${KNOBS.map(
      ({ field, min, max, step }) =>
        `<label>${field} <input type="range" data-dev-arrival-knob="${field}" min="${min}" max="${max}" step="${step}"><output data-dev-arrival-out="${field}"></output></label>`,
    ).join('')}</p>
    <p>lights <output data-dev-arrival-lights></output></p>
    <p><code data-dev-arrival-line></code></p>
    <p><button type="button" data-dev-arrival-reset>reset</button></p>
  `;
  document.body.append(panel);

  // On load the bar follows the stored key — the head applier has already
  // put it on <html> — and falls back to the stylesheet's own values,
  // which is also what a reset leaves behind.
  const stored = storedTuning();
  const complete =
    stored && KNOBS.every(({ field }) => typeof stored[field] === 'string' && stored[field] !== '');
  show(complete ? (stored as Tuning) : defaults(), Boolean(complete));
  showLights();
};

document.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const field = target.dataset.devArrivalKnob as Field | undefined;
  if (!field) return;
  const knob = KNOBS.find((one) => one.field === field);
  if (!knob) return;
  root.style.setProperty(knob.property, target.value);
  const values = fromInputs();
  save(values);
  show(values, true);
  // The fade is the one knob the arrival script owns; depth and chrome are
  // CSS's. A scroll event makes it recompute the lights from the new fade.
  window.dispatchEvent(new Event('scroll'));
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.closest('[data-dev-arrival-reset]')) return;
  // The ABSENCE of an override: the key and all three inline properties
  // go, so the control is the committed stylesheet itself and a stale
  // override cannot pose as it.
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* as above */
  }
  for (const { property } of KNOBS) root.style.removeProperty(property);
  window.dispatchEvent(new Event('scroll'));
  show(defaults(), false);
});

window.addEventListener('scroll', showLights, { passive: true });
document.addEventListener('astro:page-load', build);
