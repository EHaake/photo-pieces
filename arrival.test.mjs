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

// ---- (c)'s extractor and stub browser ----------------------------------
// The head script is plain JS inside an .astro file, so the test runs the
// page's own text rather than a copy: the rule is written once and this
// is the reader. matte.test.mjs and ground.test.mjs already read .astro
// files as text; this one also evaluates what it reads.

/** The head script's body — between the opening tag and `</script>`. */
function scriptBody(page) {
  const open = '<script is:inline data-arrival>';
  const from = page.indexOf(open);
  const to = page.indexOf('</script>', from);
  // Not `toBeGreaterThan`: a rename of the tag should say what it broke.
  expect([open, from > -1, to > from]).toEqual([open, true, true]);
  return page.slice(from + open.length, to);
}

/** A stub browser with the five things the script touches: <html>'s
 *  inline style and attributes, its clientHeight, a switchable
 *  `.image-page`, `scrollY`, and listener registries on window and
 *  document. Not jsdom — a recording stub is the only thing that can
 *  answer "what did the script do BEFORE any event fired", which is the
 *  whole of the no-flash rule. */
function stubBrowser({ vh = 800, imagePage = true, state = null, hash = '' } = {}) {
  const props = new Map();
  const attrs = new Map();
  const windowListeners = {};
  const documentListeners = {};
  const on = (registry) => (type, fn) => (registry[type] ??= []).push(fn);
  const root = {
    style: {
      setProperty: (name, value) => props.set(name, String(value)),
      getPropertyValue: (name) => props.get(name) ?? '',
    },
    clientHeight: vh,
    hasAttribute: (name) => attrs.has(name),
    setAttribute: (name, value) => attrs.set(name, String(value)),
  };
  const win = { scrollY: 0, addEventListener: on(windowListeners) };
  const doc = {
    documentElement: root,
    querySelector: (selector) =>
      selector === '.image-page' && stub.imagePage ? { className: 'image-page' } : null,
    addEventListener: on(documentListeners),
  };
  const stub = {
    vh,
    imagePage,
    window: win,
    history: { state },
    location: { hash },
    /** The three-decimal string on <html>, or undefined if never written. */
    lights: () => props.get('--arrival-lights'),
    /** The arrival attribute, the gate every page-wide rule begins with. */
    gated: () => attrs.has('data-arrival'),
    listeners: (registry, type) =>
      (registry === 'window' ? windowListeners : documentListeners)[type]?.length ?? 0,
    fade: (value) => props.set('--arrival-fade', value),
    /** What the router does to <html> on every navigation. */
    swapClearsRoot: () => {
      attrs.clear();
      props.clear();
    },
    fire: (registry, type) => {
      const list = (registry === 'window' ? windowListeners : documentListeners)[type] ?? [];
      for (const listener of list) listener();
    },
    scrollTo: (y) => {
      win.scrollY = y;
      stub.fire('window', 'scroll');
    },
    run: () =>
      new Function('window', 'document', 'history', 'location', body)(
        win,
        doc,
        stub.history,
        stub.location,
      ),
  };
  return stub;
}

// ------------------------------------------------------------------------

let css;
let top;
let nested;
let root;
let src;
let arrival;
let body;

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
  body = scriptBody(src['src/pages/images/[...id].astro']);
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
    // token for the same reason, but by the WALL's share — lights ×
    // depth — and not by the chrome's ink: it is a line on the wall,
    // not a word on it, so the chrome knob never moves it and it is
    // exactly --color-line at lights 0 (T1401a).
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
      'color-mix(in oklch, var(--color-line), var(--color-quiet) calc(var(--arrival-lights, 0) * var(--arrival-depth) * 100%))',
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

describe('(c) the script’s behaviour, and the no-flash rule (T1402, spec 016)', () => {
  it('first paint at the top: the attribute and 1.000 are both set before any event fires', () => {
    // One synchronous head step, not two: the attribute alone would
    // paint light (--arrival-lights falls back to 0 and the gated stage
    // is transparent) and then snap dark when the number arrived.
    const stub = stubBrowser();
    stub.run();
    expect([stub.gated(), stub.lights()]).toEqual([true, '1.000']);
  });

  it('the router’s fresh entry is still the top — { scrollY: 0 } and no hash reads 1.000', () => {
    // The first client-side arrival at an image page: runScripts() runs
    // this block after moveToLocation has pushed { scrollX: 0, scrollY: 0 },
    // so the head-time branch sees a state object rather than null and
    // must read the same answer as a cold load.
    const stub = stubBrowser({ state: { index: 3, scrollX: 0, scrollY: 0 } });
    stub.run();
    expect([stub.gated(), stub.lights()]).toEqual([true, '1.000']);
  });

  it('a restored position paints light first — the destination decides, not scrollY (AC 5)', () => {
    // scrollY is 0 at head time on every hard load; deciding from it
    // would paint the full dark and snap to paper a frame later, which
    // is exactly the dark frame AC 5 forbids. The attribute goes on
    // here too: without it the stage's own field paints the dark box.
    const stub = stubBrowser({ vh: 900, state: { index: 1, scrollX: 0, scrollY: 2700 } });
    stub.run();
    expect([stub.gated(), stub.lights()]).toEqual([true, '0.000']);
  });

  it('a fragment lands below the stage — a hash reads 0.000 before any event', () => {
    const stub = stubBrowser({ hash: '#wall-label' });
    stub.run();
    expect([stub.gated(), stub.lights()]).toEqual([true, '0.000']);
  });

  it('a restored position inside the fade is computed, not guessed — vh/2 and vh/4', () => {
    // A guess would have to be one of the two ends; these are neither.
    for (const [scrollY, expected] of [
      [400, '0.500'],
      [200, '0.844'],
    ]) {
      const stub = stubBrowser({ vh: 800, state: { index: 1, scrollX: 0, scrollY } });
      stub.run();
      expect([scrollY, stub.lights()]).toEqual([scrollY, expected]);
    }
  });

  it('the curve: 1.000 at the top, 0.500 at half a screen, 0.000 at a screen and beyond', () => {
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    for (const [y, expected] of [
      [0, '1.000'],
      [400, '0.500'],
      [800, '0.000'],
      [8000, '0.000'],
    ]) {
      stub.scrollTo(y);
      expect([y, stub.lights()]).toEqual([y, expected]);
    }
  });

  it('the curve is monotone non-increasing across the fade — scrolling down never brightens', () => {
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    const read = [];
    for (let step = 0; step <= 20; step += 1) {
      stub.scrollTo((step * 800) / 20);
      read.push(Number.parseFloat(stub.lights()));
    }
    expect(read).toEqual([...read].sort((a, b) => b - a));
    expect([read[0], read[20]]).toEqual([1, 0]);
  });

  it('the curve is the pause’s smoothstep — symmetric about the middle of the fade', () => {
    // t²(3 − 2t) descending: a linear ramp would pass the monotone case
    // and the three pinned values above, and fail here only at the
    // quarter points if the shape were wrong in an asymmetric way.
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    stub.scrollTo(200);
    const quarter = Number.parseFloat(stub.lights());
    stub.scrollTo(600);
    const threeQuarters = Number.parseFloat(stub.lights());
    expect(Math.abs(quarter + threeQuarters - 1)).toBeLessThan(1e-9);
    // Rounded to the written three decimals: smoothstep'''s 0.84375. A
    // linear ramp would read 0.750 here and still satisfy the symmetry
    // above, so this line is the one that tells the two apart.
    expect(quarter).toBe(0.844);
  });

  it('scrolling back up runs the same function backwards', () => {
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    stub.scrollTo(1200);
    expect(stub.lights()).toBe('0.000');
    stub.scrollTo(400);
    expect(stub.lights()).toBe('0.500');
    stub.scrollTo(0);
    expect(stub.lights()).toBe('1.000');
  });

  it('the dev control’s --arrival-fade overrides the length — two screens halves the rate', () => {
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    stub.fade('2');
    stub.scrollTo(800);
    expect(stub.lights()).toBe('0.500');
  });

  it('a missing or nonsense --arrival-fade falls back to FADE, never to zero or a negative', () => {
    // A fade of 0 would divide by zero and a negative would invert the
    // curve; both have to read as "no override".
    for (const override of ['', '0', '-1', 'abc']) {
      const stub = stubBrowser({ vh: 800 });
      stub.run();
      stub.fade(override);
      stub.scrollTo(800);
      expect([override, stub.lights()]).toEqual([override, '0.000']);
    }
  });

  it('astro:after-swap re-applies both after the router wipes <html>', () => {
    // The router replaces <html>'s attributes and inline style on every
    // navigation. The cached last value has to be cleared with them, or
    // the write is skipped as unchanged and the page arrives ungated
    // with no number on it.
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    expect(stub.lights()).toBe('1.000');
    stub.swapClearsRoot();
    expect([stub.gated(), stub.lights()]).toEqual([false, undefined]);
    stub.fire('document', 'astro:after-swap');
    expect([stub.gated(), stub.lights()]).toEqual([true, '1.000']);
  });

  it('a swap to a page that is not an image page writes nothing', () => {
    // .image-page is the whole guard: the arrival's rules are the image
    // page's, and a piece or a gallery must arrive with <html> clean.
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    stub.swapClearsRoot();
    stub.imagePage = false;
    stub.fire('document', 'astro:after-swap');
    expect([stub.gated(), stub.lights()]).toEqual([false, undefined]);
  });

  it('astro:page-load corrects from the real scrollY — a fragment that matched nothing goes dark', () => {
    // The head cannot know the target is missing, so it paints light for
    // the hash; load finds the page still at the top and darkens. A
    // light-then-dark step in a broken-link case, and the only thing
    // that pins the page-load listener.
    const stub = stubBrowser({ vh: 800, hash: '#not-here' });
    stub.run();
    expect(stub.lights()).toBe('0.000');
    stub.fire('document', 'astro:page-load');
    expect(stub.lights()).toBe('1.000');
  });

  it('the listeners are bound once — a second run of the same script adds none', () => {
    // The router re-runs nothing it has already run, but the guard makes
    // that irrelevant: without it, a page that somehow evaluated the
    // block twice would run every scroll handler twice for ever.
    const stub = stubBrowser({ vh: 800 });
    stub.run();
    stub.run();
    expect([
      stub.listeners('window', 'scroll'),
      stub.listeners('window', 'resize'),
      stub.listeners('document', 'astro:after-swap'),
      stub.listeners('document', 'astro:page-load'),
    ]).toEqual([1, 1, 1, 1]);
  });

  it('the script’s FADE is :root’s --arrival-fade — the dev control shows the default in force', () => {
    // The script cannot read the stylesheet before the first paint, so
    // the fade's default is written twice. This is the only thing
    // holding the two copies together (global.css's comment says so).
    const match = /const FADE = ([\d.]+);/.exec(body);
    expect([Boolean(match), match?.[1]]).toEqual([true, root['--arrival-fade'].trim()]);
  });
});
