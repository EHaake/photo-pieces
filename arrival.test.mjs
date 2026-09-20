import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { blocks, declarations, parseOklch, uncomment } from './src/lib/ground.ts';

// The arrival (spec 016, T1401): the image page's first screen — the
// stage in a dark field, the chrome dimmed, both fading to the ordinary
// page as the stage scrolls away. The mechanism is the pause's lights
// borrowed whole: a number on <html> and a block of color-mix() rules,
// each mixing from ITS OWN token toward the quiet dark.
//
// Two kinds of guard here, because two different things can go wrong:
//
// (a) The knobs. Four custom properties in :root and nowhere else —
//     three numbers the photographer moves at the gate, and the dark
//     they derive. The dark is DERIVED, not a second literal, so
//     "lighter than the quiet dark" (AC 3) is arithmetic rather than
//     two colours compared by eye; this case does the arithmetic.
//
// (b) The rules. Every page-wide rule gated on script AND on
//     not-quiet, so the quiet view's rules are never in competition;
//     colour and nothing else declared, so nothing is hidden from
//     assistive technology and no layout can shift (AC 8, AC 10); and
//     each dimmed element's SOURCE token pinned as a string. That last
//     pin is the one a browser cannot replace: at chrome 1 and lights
//     1 every dimmed element computes to exactly --color-quiet
//     whichever token it started from, so a read at the top cannot
//     tell a wrong source and only the string can.
//
// The script itself, and the FADE constant pinned to --arrival-fade,
// are T1402's case (c).

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** The gate every rule in the block begins with: script present, and
 *  not in quiet view. */
const GATE = 'html[data-arrival]:not([data-quiet])';

/** The block's rules, in file order — the dimmed set, pinned. An
 *  addition here is deliberate (the spec's list), never incidental. */
const PRELUDES = [
  `${GATE},\n${GATE} body`,
  `${GATE} .image-stage`,
  `${GATE} .site-header`,
  `${GATE} .site-header :is(.brand, .site-nav a[aria-current='page']),\n${GATE} .image-head h1`,
  `${GATE} :is(.frame-nav, .frame-nav a, .quiet-toggle),\n${GATE} .site-nav a:not([aria-current='page'])`,
  `${GATE} .image-head :is(.eyebrow, .eyebrow a)`,
  `${GATE} :is(.site-nav a, .frame-nav a, .image-head .eyebrow a)`,
  `${GATE} :is(.site-header .site-nav a[aria-current='page'], .site-header a, .frame-nav a, .quiet-toggle, .image-head .eyebrow a):focus-visible`,
];

const [
  GROUND_RULE,
  STAGE_RULE,
  HEADER_RULE,
  TEXT_RULE,
  MUTED_RULE,
  ACCENT_RULE,
  LINK_RULE,
  FOCUS_RULE,
] = PRELUDES;

/** Colour only, plus the two mixes written once and read by the rest.
 *  No display, no visibility, no opacity, no box property. */
const ALLOWED = [
  '--arrival-ground',
  '--arrival-ink',
  'background',
  'border-bottom-color',
  'color',
  'transition',
];

/** The four tokens :root owns. --arrival-lights is the script's, put on
 *  the element, and is not declared in the stylesheet at all. */
const TOKENS = ['--arrival-chrome', '--arrival-depth', '--arrival-fade', '--color-arrival'];

// ---- helpers, copied from matte.test.mjs -------------------------------
// `splitTop`, `norm`, `selects`, `indexOf`/`ruleFor` and the `sources`
// walk are that file's, unchanged: a selector list and a color-mix()
// value both carry commas inside parentheses, and ground.ts's plainer
// `selects` splits on every comma. Two readers of the same stylesheet
// should read it the same way.

/** Split on `sep` at paren depth 0. */
function splitTop(text, sep = ',') {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') depth -= 1;
    else if (text[i] === sep && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }
  out.push(text.slice(start));
  return out;
}

/** One line, one space, no padding inside parens — Prettier wraps long
 *  values and selector lists, and none of that is meaning. */
const norm = (text) =>
  text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();

const selects = (prelude, selector) =>
  splitTop(prelude).some((one) => norm(one) === norm(selector));

/** The index of the one rule in `list` whose selector is exactly
 *  `selector`. Fails if it isn't unique. */
function indexOf(list, selector) {
  const found = list
    .map((block, at) => ({ block, at }))
    .filter(
      ({ block }) => norm(block.prelude) === norm(selector) || selects(block.prelude, selector),
    );
  expect(found).toHaveLength(1);
  return found[0].at;
}

const ruleFor = (list, selector) => list[indexOf(list, selector)];

/** Every text file under src/, path -> contents. */
async function sources(dir = here('./src'), out = {}) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await sources(path, out);
    else if (/\.(astro|css|ts|tsx|mjs|js|json|md|svg|html)$/.test(entry.name))
      out[path.slice(here('./').length)] = await readFile(path, 'utf8');
  }
  return out;
}

// ------------------------------------------------------------------------

let css;
let top;
let nested;
let root;
let src;
let arrival;

beforeAll(async () => {
  css = uncomment(await readFile(here('./src/styles/global.css'), 'utf8'));
  top = blocks(css);
  nested = top
    .filter((block) => block.prelude.startsWith('@'))
    .flatMap((block) => blocks(block.body));
  root = Object.assign(
    {},
    ...top
      .filter((block) => selects(block.prelude, ':root'))
      .map((block) => declarations(block.body)),
  );
  src = await sources();
  arrival = [...top, ...nested].filter((block) => block.prelude.includes('[data-arrival]'));
});

describe('(a) the arrival’s knobs (T1401, spec 016)', () => {
  it('the three numbers are in range — depth and chrome are shares, the fade a length in screens', () => {
    const depth = Number.parseFloat(root['--arrival-depth']);
    const chrome = Number.parseFloat(root['--arrival-chrome']);
    const fade = Number.parseFloat(root['--arrival-fade']);
    // Depth strictly inside (0, 1): at 0 there is no wall, at 1 the
    // arrival IS the quiet view and AC 3's "deepens" has nowhere to go.
    expect(depth).toBeGreaterThan(0);
    expect(depth).toBeLessThan(1);
    // Chrome may be all the way (the pause's rule for words), never none.
    expect(chrome).toBeGreaterThan(0);
    expect(chrome).toBeLessThanOrEqual(1);
    // A fade of zero would be a switch, not a fade.
    expect(fade).toBeGreaterThan(0);
  });

  it('--color-arrival is the mix, derived from the depth — not a second colour literal', () => {
    // Retyped as an oklch() literal the dark stops following the ground
    // and the depth knob stops meaning anything; the next case, and
    // matte.test.mjs's (d), then fail too.
    expect(norm(root['--color-arrival'])).toBe(
      'color-mix(in oklch, var(--color-bg), var(--color-quiet) calc(var(--arrival-depth) * 100%))',
    );
  });

  it('the arrival’s dark is lighter than the quiet dark — entering quiet view from the top still goes somewhere (AC 3)', () => {
    // The mix is linear in L, so the arrival's lightness is the ground's
    // lightness walked `depth` of the way to the quiet dark. Computed,
    // not eyeballed: at depth 1 the two are equal and this fails.
    const bg = parseOklch(norm(root['--color-bg']));
    const quiet = parseOklch(norm(root['--color-quiet']));
    const depth = Number.parseFloat(root['--arrival-depth']);
    const L = bg.L + (quiet.L - bg.L) * depth;
    expect(L).toBeGreaterThan(quiet.L);
    expect(L).toBeLessThan(bg.L);
  });

  it('one source: no second declaration of the four, in global.css or under src/', () => {
    for (const token of TOKENS) {
      // Counted across every block, :root included, rather than by
      // excluding :root and expecting nothing left: the file already
      // has a second :root inside a media query, so "not in a :root"
      // would let a redeclaration there through under the same name.
      // Exactly one block declares each token, and it is :root.
      const declaring = [...top, ...nested]
        .filter((block) => token in declarations(block.body))
        .map((block) => norm(block.prelude));
      expect([token, declaring]).toEqual([token, [':root']]);
    }
    // ...and no other file writes one either. The dev control (spec
    // 016's own, and the ground switch beside it) is the one exception:
    // it overrides on <html> so the photographer can move the knob at
    // the gate, which is the point of a knob.
    for (const [path, text] of Object.entries(src)) {
      if (path.startsWith('src/pages/dev/') || /^src\/components\/Dev/.test(path)) continue;
      const found = [
        ...uncomment(text).matchAll(
          /(--arrival-depth|--arrival-chrome|--arrival-fade|--color-arrival)\s*:/g,
        ),
      ].map((match) => match[1]);
      const allowed = path === 'src/styles/global.css' ? TOKENS : [];
      expect([path, [...new Set(found)].sort()]).toEqual([path, allowed]);
    }
  });
});

describe('(b) the arrival’s rules (T1401, spec 016)', () => {
  it('every rule is gated on script AND on not-quiet — the quiet view’s rules never compete', () => {
    // Drop the :not([data-quiet]) from one selector and the arrival's
    // ground would fight the quiet view's on the same element, decided
    // by source order. This is what makes the quiet block untouchable.
    const ungated = [];
    for (const block of arrival)
      for (const one of splitTop(block.prelude))
        if (!norm(one).startsWith(GATE)) ungated.push(norm(one));
    expect(ungated).toEqual([]);
  });

  it('the dimmed set is exactly the spec’s list, in order — an addition is deliberate', () => {
    expect(arrival.map((block) => norm(block.prelude))).toEqual(PRELUDES.map(norm));
  });

  it('colour only: nothing in the block declares a box property, a display or an opacity', () => {
    // AC 8 and AC 10 at the stylesheet level. A padding, a transform or
    // an opacity added here shows up by rule and by property name.
    const outside = [];
    for (const block of arrival)
      for (const property of Object.keys(declarations(block.body)))
        if (!ALLOWED.includes(property)) outside.push(`${norm(block.prelude)} { ${property} }`);
    expect(outside).toEqual([]);
  });

  it('the ground mixes toward --color-arrival by the lights, and does not ease behind the scroll', () => {
    const ground = declarations(ruleFor(arrival, GROUND_RULE).body);
    expect(norm(ground['--arrival-ground'])).toBe(
      'color-mix(in oklch, var(--color-bg), var(--color-arrival) calc(var(--arrival-lights, 0) * 100%))',
    );
    expect(norm(ground['--arrival-ink'])).toBe(
      'calc(var(--arrival-lights, 0) * var(--arrival-chrome) * 100%)',
    );
    expect(norm(ground['background'])).toBe('var(--arrival-ground)');
    // The image page eases background-color 220ms for the quiet view;
    // left on, that ease would run behind every scroll step.
    expect(norm(ground['transition'])).toBe('none');
  });

  it('the stage’s field is the stylesheet’s without script and the page’s ground with it', () => {
    // AC 6: no script, no attribute on <html>, and the field is the
    // stage's own box — ending at its edge, scrolling away with it.
    expect(norm(declarations(ruleFor(top, '.image-stage').body)['background'])).toBe(
      'var(--color-arrival)',
    );
    // With script the page carries the dark edge to edge, so the stage's
    // own field would be a second, identical box painted over it.
    expect(norm(declarations(ruleFor(arrival, STAGE_RULE).body)['background'])).toBe('transparent');
  });

  it('each dimmed element mixes from ITS OWN token — the source pinned as a string', () => {
    // The pin a browser read cannot replace: at chrome 1 and lights 1
    // every one of these computes to exactly --color-quiet whichever
    // token it started from, so a wrong source is invisible at the top
    // and shows only here. The header's hairline mixes from the line
    // token for the same reason.
    const ink = 'var(--color-quiet) var(--arrival-ink)';
    const colours = Object.fromEntries(
      [TEXT_RULE, MUTED_RULE, ACCENT_RULE, FOCUS_RULE].map((prelude) => [
        norm(prelude),
        norm(declarations(ruleFor(arrival, prelude).body)['color']),
      ]),
    );
    expect(colours).toEqual({
      [norm(TEXT_RULE)]: `color-mix(in oklch, var(--color-text), ${ink})`,
      [norm(MUTED_RULE)]: `color-mix(in oklch, var(--color-muted), ${ink})`,
      [norm(ACCENT_RULE)]: `color-mix(in oklch, var(--color-accent), ${ink})`,
      // Focus goes the other way: toward paper, so the control is
      // readable at every lights value (AC 10).
      [norm(FOCUS_RULE)]:
        'color-mix(in oklch, var(--color-text), var(--color-bg) calc(var(--arrival-lights, 0) * 100%))',
    });
    const header = declarations(ruleFor(arrival, HEADER_RULE).body);
    expect(norm(header['background'])).toBe('var(--arrival-ground)');
    expect(norm(header['border-bottom-color'])).toBe(
      `color-mix(in oklch, var(--color-line), ${ink})`,
    );
  });

  it('the focus rule’s :is() keeps the compound that lifts it above the current page’s link', () => {
    // Specificity, not source order: without
    // `.site-header .site-nav a[aria-current='page']` in the list the
    // focus rule sits below the text rule on exactly one link — the
    // current page's — which would keep its dim colour under focus
    // while every other control lit up. Nothing on the page would look
    // broken; this is the only thing that would say so.
    // Found by :focus-visible, not by the pinned prelude, so a dropped
    // compound fails HERE — on the compound — rather than on the rule
    // having gone missing from the list above.
    const focus = arrival.filter((block) => block.prelude.includes(':focus-visible'));
    expect(focus.map((block) => norm(block.prelude))).toHaveLength(1);
    expect(norm(focus[0].prelude)).toContain(".site-header .site-nav a[aria-current='page']");
  });

  it('the dimmed links keep the underline’s ease and lose the colour’s', () => {
    const link = declarations(ruleFor(arrival, LINK_RULE).body);
    expect(Object.keys(link)).toEqual(['transition']);
    expect(norm(link['transition'])).toBe('background-size 180ms ease');
  });
});
