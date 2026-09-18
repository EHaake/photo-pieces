import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { galleryCell, GALLERY_STRETCH } from './src/lib/gallery-layout.ts';

// The mat rule (spec 013, T1101): one rule, declared once, resolved per
// geometry. A frame's mat is m = clamp(--mat-min, --mat-share × σ,
// --mat-max) over the photograph's RENDERED SHORT SIDE σ — and because
// CSS cannot measure a rendered height, each geometry solves for m
// algebraically from the frame's ratio and publishes --mat, which the
// surface applies as `padding: var(--mat)`.
//
// Three kinds of guard, because three different things can go wrong:
//
// (a) The single source. Three tokens in :root and nowhere else: a
//     second declaration anywhere (a surface "just overriding the
//     floor") would make the gate's one number stop being one number,
//     and nothing else would fail. The dead `.gallery-grid > li >
//     a.image-link` rules go with it — they matched no markup after
//     spec 009 moved the cards' mat to the span, so "cards off" is one
//     edit.
//
// (b) The forms' strings, pinned. A form is algebra that renders; a
//     typo in it renders too, just wrong, and the inert landing (share
//     0, floor = ceiling) hides every one of them behind a constant.
//     Whitespace-normalised, because Prettier wraps long calc() values.
//
// (c) The geometry, evaluated. The strings are pinned against the plan,
//     but a pinned string can pin a wrong formula, so the forms are
//     also RUN: a small evaluator substitutes var()s from :root and the
//     case, turns CSS math into JS, and checks each form against the
//     rule it claims to implement over a grid of ratios, shares, clamps
//     and viewports — including the plan's central identity (form W at
//     a height-bound frame's width returns that frame's mat), the
//     CSS/srcset agreement for packed rows, and the inert identity that
//     makes T1101 land changing nothing.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** Strip CSS comments — they carry braces and colons in this file. */
const uncomment = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every brace block at the top level of `css`, as { prelude, body }. */
function blocks(css) {
  const found = [];
  let depth = 0;
  let start = 0;
  let open = -1;
  for (let i = 0; i < css.length; i += 1) {
    if (css[i] === '{') {
      depth += 1;
      if (depth === 1) open = i;
    } else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        found.push({ prelude: css.slice(start, open).trim(), body: css.slice(open + 1, i) });
        start = i + 1;
      }
    }
  }
  return found;
}

/** The declarations of a rule body, as name -> value. Nested rules are ignored. */
function declarations(body) {
  const flat = body.replace(/\{[^{}]*\}/g, '');
  const out = {};
  for (const part of splitTop(flat, ';')) {
    const at = part.indexOf(':');
    if (at === -1) continue;
    out[part.slice(0, at).trim()] = part.slice(at + 1).trim();
  }
  return out;
}

/** Split on `sep` at paren depth 0 — a mat selector list and a min()
 *  value both carry commas inside parentheses. */
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

/** The index of the one rule in `list` whose selector is exactly `selector`
 *  (and, where given, which declares `declares`). Fails if it isn't unique. */
function indexOf(list, selector, declares) {
  const found = list
    .map((block, at) => ({ block, at }))
    .filter(
      ({ block }) =>
        selects(block.prelude, selector) &&
        (declares === undefined || declares in declarations(block.body)),
    );
  expect(found).toHaveLength(1);
  return found[0].at;
}

const ruleFor = (list, selector, declares) => list[indexOf(list, selector, declares)];

// ---- the evaluator (c) -------------------------------------------------

/** Substitute every var() from `env` (whose values may hold var()s of
 *  their own), honouring the fallback where a name is absent. */
function substitute(expr, env) {
  for (let pass = 0; pass < 400; pass += 1) {
    const at = expr.indexOf('var(');
    if (at === -1) return expr;
    let depth = 0;
    let end = -1;
    for (let i = at + 3; i < expr.length; i += 1) {
      if (expr[i] === '(') depth += 1;
      else if (expr[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) throw new Error(`unbalanced var(): ${expr}`);
    const parts = splitTop(expr.slice(at + 4, end));
    const name = parts[0].trim();
    const fallback = parts.slice(1).join(',').trim();
    let value;
    if (name in env) value = String(env[name]);
    else if (fallback !== '') value = fallback;
    else throw new Error(`no value for ${name} in: ${expr}`);
    expr = `${expr.slice(0, at)}(${value})${expr.slice(end + 1)}`;
  }
  throw new Error(`var() substitution did not settle: ${expr}`);
}

const CLAMP = (low, value, high) => Math.max(low, Math.min(value, high));

/** A CSS length expression as a number of px, in a context: the custom
 *  properties in scope, the viewport, and the percentage basis. */
function px(expr, { env, viewport, basis = 0 }) {
  const [width, height] = viewport;
  const units = {
    px: 1,
    rem: 16,
    vw: width / 100,
    vh: height / 100,
    svh: height / 100,
    vmin: Math.min(width, height) / 100,
    '%': basis / 100,
  };
  const math = substitute(expr, env)
    .replace(/\bcalc\(/g, '(')
    .replace(/\b(clamp|min|max)\(/g, (_, fn) => (fn === 'clamp' ? 'CLAMP(' : `Math.${fn}(`))
    .replace(/(\d*\.?\d+)(px|rem|svh|vmin|vh|vw|%)/g, (_, number, unit) =>
      String(Number(number) * units[unit]),
    );
  if (/[a-zA-Z]/.test(math.replace(/CLAMP|Math\.min|Math\.max/g, '')))
    throw new Error(`unresolved token in: ${math}`);
  return Function('CLAMP', `return (${math});`)(CLAMP);
}

const RATIOS = [0.5, 0.667, 0.8, 1, 1.5, 1.78, 3];
const SHARES = [0, 0.025, 0.04, 0.06];
const CLAMPS = [
  [0, 0],
  [8, 16.8],
  [4, 40],
];
const VIEWPORTS = [
  [1512, 982],
  [1280, 1440],
  [375, 812],
];
/** Every (ratio, share, floor, ceiling, viewport) the forms are run over. */
function* grid() {
  for (const viewport of VIEWPORTS)
    for (const [floor, ceiling] of CLAMPS)
      for (const share of SHARES)
        for (const ratio of RATIOS) yield { viewport, floor, ceiling, share, ratio };
}
const close = (a, b) => Math.abs(a - b) < 1e-6;
const where = (about, one) =>
  `${about} at ratio ${one.ratio}, share ${one.share}, clamp ${one.floor}–${one.ceiling}, viewport ${one.viewport.join('×')}`;

// ---- the files ---------------------------------------------------------

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

let css;
let top;
let nested;
let root;
let src;

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
});

describe('(a) the rule has one source (T1101, spec 013)', () => {
  it(":root declares the three tokens at the gate's values (T1104: share-60)", () => {
    // The visual gate, 2026-09-17: 6% of the rendered short side, floor
    // 4px, ceiling 40px — the sampler's `share-60`, every surface on.
    expect(norm(root['--mat-share'])).toBe('0.06');
    expect(norm(root['--mat-min'])).toBe('0.25rem');
    expect(norm(root['--mat-max'])).toBe('2.5rem');
  });

  it('no other rule in global.css declares any of them — one number moves every mat', () => {
    for (const token of ['--mat-share', '--mat-min', '--mat-max']) {
      const declaring = [...top, ...nested].filter(
        (block) => token in declarations(block.body) && !selects(block.prelude, ':root'),
      );
      expect(declaring.map((block) => norm(block.prelude))).toEqual([]);
    }
  });

  it('no file under src/ outside src/pages/dev/ declares one — the sampler alone may override', () => {
    for (const [path, text] of Object.entries(src)) {
      if (path.startsWith('src/pages/dev/')) continue;
      const declares = /(--mat-share|--mat-min|--mat-max)\s*:/g;
      const found = [...text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(declares)].map((m) => m[1]);
      const allowed =
        path === 'src/styles/global.css' ? ['--mat-max', '--mat-min', '--mat-share'] : [];
      expect([path, found.sort()]).toEqual([path, allowed]);
    }
  });

  it('--matte is gone: nothing under src/ or in the transform still reads it', async () => {
    const transform = await readFile(here('./remark-pieces-blocks.mjs'), 'utf8');
    const left = Object.entries({ ...src, 'remark-pieces-blocks.mjs': transform })
      .filter(([, text]) => /--matte\b/.test(text))
      .map(([path]) => path);
    expect(left).toEqual([]);
  });

  it('no rule selects .gallery-grid > li > a.image-link — the cards’ mat is one place', () => {
    expect(css).not.toContain('.gallery-grid > li > a.image-link');
    for (const block of [...top, ...nested])
      expect(splitTop(block.prelude).map(norm)).not.toContain('.gallery-grid > li > a.image-link');
  });
});

describe('(b) every form pinned (T1101, spec 013)', () => {
  const FORM_W =
    'clamp(var(--mat-min), calc(100% * var(--mat-share) / (max(var(--ar, 1), 1) + 2 * var(--mat-share))), var(--mat-max))';
  const FORM_H =
    'clamp(var(--mat-min), calc(var(--avail-h) * var(--mat-share) * var(--q) / (1 + 2 * var(--mat-share) * var(--q))), var(--mat-max))';
  const FORM_V =
    'clamp(var(--mat-min), calc(var(--avail-w) * var(--mat-share) / (var(--r) + 2 * var(--mat-share))), var(--mat-max))';
  const MATTED_LIST =
    ':is(.piece-single, .piece-inset, .piece-wide, .piece-diptych, .piece-triptych, .piece-grid, .piece-aside, .piece-row figure, .piece-held figure, .piece-pause-frame) > :is(a.image-link, img), :is(.prose, .piece-row-prose) > p > :is(a.image-link, img), :is(.prose, .piece-row-prose) > p > a:not(.image-link) > img';

  it('form W is declared once, on the matted list plus the cover card and the compare figure', () => {
    const formW = ruleFor(top, '.compare', '--mat');
    expect(norm(formW.prelude)).toBe(
      `${MATTED_LIST}, .gallery-card .image-link, .compare`.replace(/\s+/g, ' '),
    );
    expect(norm(declarations(formW.body)['--mat'])).toBe(FORM_W);
    expect(Object.keys(declarations(formW.body))).toEqual(['--mat']);
    // "Once" literally: no second rule anywhere in the file publishes the
    // same string, so a surface can only be added to, or dropped from,
    // this one selector list.
    const declaringW = [...top, ...nested].filter(
      (block) => norm(declarations(block.body)['--mat'] ?? '') === FORM_W,
    );
    expect(declaringW.map((block) => norm(block.prelude))).toHaveLength(1);
  });

  it('the surfaces read --mat and nothing else: the matted list, the packed row’s anchor, the stage', () => {
    const matted = ruleFor(
      top,
      ':is(.prose, .piece-row-prose) > p > a:not(.image-link) > img',
      'padding',
    );
    expect(norm(matted.prelude)).toBe(MATTED_LIST);
    expect(declarations(matted.body)['padding']).toBe('var(--mat)');
    expect(declarations(ruleFor(top, '.gallery-flow > li > a.image-link').body)['padding']).toBe(
      'var(--mat)',
    );
    expect(declarations(ruleFor(top, '.image-frame').body)['padding']).toBe('var(--mat)');
    // ...and nothing else: outside :root the three tokens are read only
    // inside a --mat value, so every surface goes through the forms
    // rather than reading the share or the clamp for itself.
    const reading = [];
    for (const block of [...top, ...nested]) {
      if (selects(block.prelude, ':root')) continue;
      for (const [property, value] of Object.entries(declarations(block.body)))
        if (/--mat-(share|min|max)/.test(value) && property !== '--mat')
          reading.push(`${norm(block.prelude)} { ${property} }`);
    }
    expect(reading).toEqual([]);
  });

  it('form H: the held figure’s mat and box formula', () => {
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    expect(norm(held['--q'])).toBe('min(var(--ar, 1), 1)');
    expect(norm(held['--avail-h'])).toBe('calc(100svh - 2 * var(--hold-margin))');
    expect(norm(held['--mat'])).toBe(FORM_H);
    expect(norm(held['max-width'])).toBe(
      'calc((var(--avail-h) - 2 * var(--mat)) * var(--ar, 1) + 2 * var(--mat))',
    );
  });

  it('form V+H: the pause’s two limits, its mat, and its frame', () => {
    const pause = declarations(ruleFor(top, '.piece-pause').body);
    expect(norm(pause['--r'])).toBe('max(var(--ar, 1), 1)');
    expect(norm(pause['--q'])).toBe('min(var(--ar, 1), 1)');
    expect(norm(pause['--avail-w'])).toBe(
      'calc((100vw - 2 * var(--hold-margin)) / var(--pause-scale))',
    );
    expect(norm(pause['--avail-h'])).toBe(
      'calc((100svh - 2 * var(--hold-margin)) / var(--pause-scale))',
    );
    expect(norm(pause['--mat'])).toBe(`min(${FORM_V}, ${FORM_H})`);
    expect(norm(pause['--frame-w'])).toBe(
      'min(var(--avail-w), calc((var(--avail-h) - 2 * var(--mat)) * var(--ar, 1) + 2 * var(--mat)))',
    );
    expect(norm(pause['--frame-h'])).toBe(
      'calc((var(--frame-w) - 2 * var(--mat)) / var(--ar, 1) + 2 * var(--mat))',
    );
  });

  it('form V+H: the stage’s limits, its mat, and the image’s height — in global.css, not on the page', () => {
    const stage = declarations(ruleFor(top, '.image-stage').body);
    expect(norm(stage['--avail-w'])).toBe(
      'min(calc(100vw - 2 * var(--page-pad)), var(--content-width))',
    );
    expect(norm(stage['--avail-h'])).toBe(
      'calc(100svh - var(--header-h, 4.5rem) - 2 * var(--stage-pad))',
    );
    const frame = declarations(ruleFor(top, '.image-frame').body);
    expect(norm(frame['--r'])).toBe('max(var(--ar, 1), 1)');
    expect(norm(frame['--q'])).toBe('min(var(--ar, 1), 1)');
    expect(norm(frame['--mat'])).toBe(`min(${FORM_V}, ${FORM_H})`);
    expect(norm(declarations(ruleFor(top, '.image-frame img').body)['max-height'])).toBe(
      'calc(var(--avail-h) - 2 * var(--mat))',
    );
    const quiet = declarations(ruleFor(top, 'html[data-quiet] .image-stage').body);
    expect(norm(quiet['--stage-pad'])).toBe('clamp(0.5rem, 1.5vh, 1rem)');
    expect(norm(quiet['--avail-w'])).toBe('calc(100vw - 2 * var(--stage-pad))');
    expect(norm(quiet['--avail-h'])).toBe('calc(100svh - 2 * var(--stage-pad))');
    // Quiet view redeclares those two limits and nothing else: the base
    // `.image-frame img` max-height above reads --avail-h, so a quiet
    // copy of it is byte-identical duplication (T1101b deleted it, on
    // both the page and here). These two rules, and no third.
    const quietStage = [...top, ...nested]
      .map((block) => norm(block.prelude))
      .filter((prelude) => /html\[data-quiet\] \.image-/.test(prelude));
    expect(quietStage).toEqual([
      'html[data-quiet] .image-stage',
      'html[data-quiet] .image-frame, html[data-quiet] .image-stage[data-quiet-ready] .image-frame',
    ]);
    // And the page's scoped <style> styles the frame not at all — every
    // frame rule is here, the zoom-in cursor included. A scoped copy
    // carries [data-astro-cid] on both compounds, out-specifies the
    // quiet rule above, and quiet view then shows zoom-in over the
    // photograph (measured, T1101b).
    const page = uncomment(src['src/pages/images/[...id].astro']);
    const scoped = blocks(page.slice(page.indexOf('<style>'), page.indexOf('</style>')));
    const frameRules = [
      ...scoped,
      ...scoped.filter((one) => one.prelude.startsWith('@')).flatMap((one) => blocks(one.body)),
    ]
      .map((one) => norm(one.prelude))
      .filter((prelude) => prelude.includes('.image-frame'));
    expect(frameRules).toEqual([]);
    expect(declarations(ruleFor(top, '.image-stage[data-quiet-ready] .image-frame').body)).toEqual({
      cursor: 'zoom-in',
    });
    expect(indexOf(top, '.image-stage[data-quiet-ready] .image-frame')).toBeLessThan(
      indexOf(top, 'html[data-quiet] .image-frame'),
    );
  });

  it('the image page reads --mat only as a padding: the compare figure\u2019s, and nothing else', () => {
    // The mat is a padding and never another property. --mat carries
    // 100%, and a percentage resolves against the READER's containing
    // block: on a child of the padded figure that is its content box,
    // and on a grid's row-gap the height axis \u2014 so `gap: var(--mat)` or
    // `margin: var(--mat)` renders a fraction of the figure's mat, not
    // the mat (measured at T1104: 22.85 against a 24.667 mat). The
    // compare's gap and note margin are prose spacing instead (T1104a).
    const page = uncomment(src['src/pages/images/[...id].astro']);
    const scoped = blocks(page.slice(page.indexOf('<style>'), page.indexOf('</style>')));
    const all = [
      ...scoped,
      ...scoped.filter((one) => one.prelude.startsWith('@')).flatMap((one) => blocks(one.body)),
    ];
    const reading = [];
    for (const block of all)
      for (const [property, value] of Object.entries(declarations(block.body)))
        if (/var\(--mat\s*[,)]/.test(value)) reading.push(`${norm(block.prelude)} { ${property} }`);
    expect(reading).toEqual(['.compare { padding }']);
    expect(declarations(ruleFor(all, '.compare', 'padding').body)['padding']).toBe('var(--mat)');
  });

  it('the latest-work band: one height string, and a mat that is a share of it', () => {
    // The strip is a curated band, not one of the four surfaces; it gets
    // form R's shape because its image IS --avail-h tall (the mat sits
    // around that), so σ = --avail-h × min(--ar, 1) exactly. Its --mat is
    // its own, and it declares none of the three tokens (case (a) pins
    // that for every file under src/).
    const band = uncomment(src['src/components/LatestWork.astro']);
    const rules = blocks(band.slice(band.indexOf('<style>')));
    const link = declarations(ruleFor(rules, '.image-link', '--mat').body);
    expect(norm(link['--avail-h'])).toBe('clamp(180px, 30vh, 260px)');
    expect(norm(link['--mat'])).toBe(
      'clamp(var(--mat-min), calc(var(--avail-h) * var(--mat-share) * min(var(--ar, 1), 1)), var(--mat-max))',
    );
    expect(link['padding']).toBe('var(--mat)');
    expect(norm(declarations(ruleFor(rules, '.image-link img').body)['height'])).toBe(
      'var(--avail-h)',
    );
  });

  it('form R: the mat is the packed row’s constant term, in the basis, the cap and the narrow cap', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    expect(norm(cell['--mat'])).toBe(
      'clamp(var(--mat-min), calc(var(--gallery-short) * var(--mat-share)), var(--mat-max))',
    );
    expect(norm(cell['flex'])).toBe(
      'var(--w) 1 calc(var(--gallery-short) * var(--w) + 2 * var(--mat))',
    );
    expect(norm(cell['max-width'])).toBe(
      'min(100%, calc(var(--gallery-short) * var(--w) * var(--gallery-stretch) + 2 * var(--mat)))',
    );
    const narrow = declarations(ruleFor(nested, '.gallery-flow.related-flow > li').body);
    expect(norm(narrow['max-width'])).toBe(
      'calc(var(--gallery-short) * var(--w) * var(--gallery-stretch) + 2 * var(--mat))',
    );
  });

  it('form P: one mat for the matched block, over the gap the block declares once', () => {
    const member = declarations(
      ruleFor(top, '.piece-diptych.match-height > :is(a.image-link, img)', '--mat').body,
    );
    expect(norm(member['--mat'])).toBe(
      'clamp(var(--mat-min), calc((100% - (var(--n) - 1) * var(--pair-gap)) * var(--mat-share) / (var(--ar-sum) + 2 * var(--n) * var(--mat-share))), var(--mat-max))',
    );
    const block = declarations(ruleFor(top, '.piece-diptych.match-height', '--pair-gap').body);
    expect(norm(block['--pair-gap'])).toBe('calc(var(--baseline) / 3)');
    expect(norm(block['gap'])).toBe('var(--pair-gap)');
  });

  it('form P comes after form W in source (it out-specifies it too: (0,3,1) over (0,2,2))', () => {
    expect(
      indexOf(top, '.piece-diptych.match-height > :is(a.image-link, img)', '--mat'),
    ).toBeGreaterThan(indexOf(top, '.compare', '--mat'));
  });
});

describe('(c) the forms are the rule (T1101, spec 013)', () => {
  /** :root plus the case's three tokens and whatever the form needs. */
  const envFor = (one, extra = {}) => ({
    ...root,
    '--mat-share': one.share,
    '--mat-min': `${one.floor}px`,
    '--mat-max': `${one.ceiling}px`,
    '--ar': one.ratio,
    ...extra,
  });

  const formW = () => norm(declarations(ruleFor(top, '.compare', '--mat').body)['--mat']);

  it('form W: m is the share of the rendered short side, at every width it is given', () => {
    // A phone column, the prose column, the site's widest breakout: the
    // percentage basis is whatever the frame's container happens to be.
    for (const W of [343, 666, 1160]) {
      for (const one of grid()) {
        const env = envFor(one);
        const m = px(formW(), { env, viewport: one.viewport, basis: W });
        const sigma = (W - 2 * m) / Math.max(one.ratio, 1);
        const want = CLAMP(one.floor, one.share * sigma, one.ceiling);
        expect([where(`form W at ${W}px`, one), close(m, want)]).toEqual([
          where(`form W at ${W}px`, one),
          true,
        ]);
      }
    }
  });

  it('form H: the held frame fits its height exactly, and form W inside it agrees', () => {
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    for (const one of grid()) {
      const env = envFor(one, {
        '--q': held['--q'],
        '--avail-h': held['--avail-h'],
        '--mat': held['--mat'],
      });
      const at = { env, viewport: one.viewport };
      const m = px(held['--mat'], at);
      const H = px(held['--avail-h'], at);
      const boxW = px(held['max-width'], at);
      // The mat is the share of the short side the frame actually renders.
      const sigma = (H - 2 * m) * Math.min(one.ratio, 1);
      expect([where('form H mat', one), close(m, CLAMP(one.floor, one.share * sigma, one.ceiling))]) //
        .toEqual([where('form H mat', one), true]);
      // The box fits the height exactly...
      expect([where('form H fit', one), close((boxW - 2 * m) / one.ratio + 2 * m, H)]) //
        .toEqual([where('form H fit', one), true]);
      // ...and form W, which the anchor inside the figure carries, returns
      // the same mat at that width — the plan's central identity.
      const fromW = px(formW(), { env, viewport: one.viewport, basis: boxW });
      expect([where('form H identity', one), close(fromW, m)]).toEqual([
        where('form H identity', one),
        true,
      ]);
    }
  });

  const fitsBothTight = (label, { m, boxW, availW, availH, one }) => {
    const boxH = (boxW - 2 * m) / one.ratio + 2 * m;
    expect([where(`${label} within`, one), boxW <= availW + 1e-6 && boxH <= availH + 1e-6]).toEqual(
      [where(`${label} within`, one), true],
    );
    expect([where(`${label} tight`, one), close(boxW, availW) || close(boxH, availH)]).toEqual([
      where(`${label} tight`, one),
      true,
    ]);
    const fromW = px(formW(), {
      env: { ...envFor(one) },
      viewport: one.viewport,
      basis: boxW,
    });
    expect([where(`${label} identity`, one), close(fromW, m)]).toEqual([
      where(`${label} identity`, one),
      true,
    ]);
  };

  it('form V+H: the pause frame takes the smaller mat, fits both limits and is tight on one', () => {
    const pause = declarations(ruleFor(top, '.piece-pause').body);
    for (const one of grid()) {
      const env = envFor(one, {
        '--r': pause['--r'],
        '--q': pause['--q'],
        '--avail-w': pause['--avail-w'],
        '--avail-h': pause['--avail-h'],
        '--mat': pause['--mat'],
        '--frame-w': pause['--frame-w'],
      });
      const at = { env, viewport: one.viewport };
      fitsBothTight('pause', {
        m: px(pause['--mat'], at),
        boxW: px(pause['--frame-w'], at),
        availW: px(pause['--avail-w'], at),
        availH: px(pause['--avail-h'], at),
        one,
      });
      // --frame-h is the frame's real height: the image plus two mats.
      expect([
        where('pause frame-h', one),
        close(
          px(pause['--frame-h'], at),
          (px(pause['--frame-w'], at) - 2 * px(pause['--mat'], at)) / one.ratio +
            2 * px(pause['--mat'], at),
        ),
      ]).toEqual([where('pause frame-h', one), true]);
    }
  });

  it('form V+H: the stage frame takes the smaller mat, fits both limits and is tight on one', () => {
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    for (const one of grid()) {
      const env = envFor(one, {
        '--stage-pad': stage['--stage-pad'],
        '--avail-w': stage['--avail-w'],
        '--avail-h': stage['--avail-h'],
        '--r': frame['--r'],
        '--q': frame['--q'],
        '--mat': frame['--mat'],
      });
      const at = { env, viewport: one.viewport };
      const m = px(frame['--mat'], at);
      const availW = px(stage['--avail-w'], at);
      const availH = px(stage['--avail-h'], at);
      // The stage centres a shrink-to-fit frame: the image is as large as
      // both limits allow (max-width 100%, max-height the image's rule).
      const boxW = Math.min(availW, (availH - 2 * m) * one.ratio + 2 * m);
      expect([
        where('stage img height', one),
        close(
          px(declarations(ruleFor(top, '.image-frame img').body)['max-height'], at),
          availH - 2 * m,
        ),
      ]).toEqual([where('stage img height', one), true]);
      fitsBothTight('stage', { m, boxW, availW, availH, one });
    }
  });

  it('form R: the mat never enters the photograph’s width, at any growth', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    const basisOf = (flex) => splitTop(norm(flex), ' ').slice(2).join(' ');
    const ROW = [0.667, 1, 1.78]; // a mixed row: portrait, square, landscape
    for (const one of grid()) {
      for (const growth of [1, 1.2, 1.35]) {
        const env = envFor(one, {
          '--gallery-short': root['--gallery-short'] ?? 'clamp(280px, 33vmin, 460px)',
        });
        const at = { env, viewport: one.viewport };
        const short = px('clamp(280px, 33vmin, 460px)', at);
        const cells = ROW.map((ratio) => {
          const cellEnv = { ...env, '--gallery-short': `${short}px`, '--ar': ratio };
          const cellAt = { env: cellEnv, viewport: one.viewport };
          const m = px(cell['--mat'], cellAt);
          return {
            ratio,
            w: Math.max(ratio, 1),
            m,
            basis: px(basisOf(cell['flex']), {
              ...cellAt,
              env: { ...cellEnv, '--w': Math.max(ratio, 1), '--mat': `${m}px` },
            }),
          };
        });
        // Flex distributes free space in proportion to --w (the grow
        // factor), so a row at growth g gives every frame the same short
        // side: pick the row width that makes the growth exactly g.
        const sumW = cells.reduce((total, c) => total + c.w, 0);
        const free = (growth - 1) * short * sumW;
        for (const c of cells) {
          // The magnitude itself: the mat is the share of the row's
          // TARGET short side (form R's stated deviation), so a wrong
          // factor fails here and not only against the pinned string.
          expect([
            where(`form R mat ratio ${c.ratio}`, one),
            close(c.m, CLAMP(one.floor, one.share * short, one.ceiling)),
          ]).toEqual([where(`form R mat ratio ${c.ratio}`, one), true]);
          const width = c.basis + (free * c.w) / sumW;
          const image = width - 2 * c.m;
          expect([
            where(`form R g=${growth} ratio ${c.ratio}`, one),
            close(image, short * c.w * growth),
          ]).toEqual([where(`form R g=${growth} ratio ${c.ratio}`, one), true]);
          // Every frame in the row lands on the same short side.
          expect([
            where(`form R short g=${growth} ratio ${c.ratio}`, one),
            close(image / c.w, short * growth),
          ]).toEqual([where(`form R short g=${growth} ratio ${c.ratio}`, one), true]);
        }
      }
    }
  });

  it('form R: the cap agrees with the srcset — the cell’s widest image is galleryCell’s sizes px', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    for (const one of grid()) {
      for (const short of [120, 280, 460]) {
        const env = envFor(one, {
          '--gallery-short': `${short}px`,
          '--gallery-stretch': GALLERY_STRETCH,
          '--w': Math.max(one.ratio, 1),
        });
        const at = { env, viewport: one.viewport, basis: 1e6 };
        const m = px(cell['--mat'], at);
        const cap = px(cell['max-width'], { ...at, env: { ...env, '--mat': `${m}px` } });
        const widest = galleryCell({ width: 4000 * one.ratio, height: 4000 }, short).sizes;
        expect([
          where(`form R cap short ${short}`, one),
          `(min-width: 720px) ${Math.round(cap - 2 * m)}px, 94vw`,
        ]).toEqual([where(`form R cap short ${short}`, one), widest]);
      }
    }
  });

  it('form P: one mat for the block, equal on every member, and the heights stay matched', () => {
    const member = declarations(
      ruleFor(top, '.piece-diptych.match-height > :is(a.image-link, img)', '--mat').body,
    );
    const block = declarations(ruleFor(top, '.piece-diptych.match-height', '--pair-gap').body);
    const SETS = [
      [1.5, 0.667],
      [0.8, 1.78],
      [1.5, 1, 0.667],
      [3, 0.5, 1],
    ];
    const W = 666;
    let ragged = false;
    for (const one of grid()) {
      for (const set of SETS) {
        const sum = set.reduce((total, r) => total + r, 0);
        const env = envFor(one, {
          '--n': set.length,
          '--ar-sum': sum,
          '--pair-gap': block['--pair-gap'],
        });
        const at = { env, viewport: one.viewport, basis: W };
        // The members carry NORMALIZED --ar (the flex factors), so a mat
        // that read --ar would differ between them: it must not.
        const mats = set.map((ratio) =>
          px(member['--mat'], { ...at, env: { ...env, '--ar': ratio / Math.min(...set) } }),
        );
        expect([
          where(`form P equal n=${set.length}`, one),
          mats.every((m) => close(m, mats[0])),
        ]).toEqual([where(`form P equal n=${set.length}`, one), true]);
        const m = mats[0];
        const gap = px(block['--pair-gap'], at);
        // Each member is a flex item with `flex: var(--ar, 1) 1 0` and
        // border-box padding, so its base size is its OWN two mats and
        // the free space is shared by the normalized ratio. A member's
        // RENDERED height is its image's height plus its own two mats —
        // which is where one mat per block earns its name: mats that
        // differ between members leave the frames ragged even though the
        // images still line up, and the padding is what the reader sees.
        const norms = set.map((ratio) => ratio / Math.min(...set));
        const grow = norms.reduce((total, one) => total + one, 0);
        const memberHeights = (each) => {
          const free = W - (set.length - 1) * gap - each.reduce((total, mi) => total + 2 * mi, 0);
          return set.map((ratio, at2) => ((norms[at2] / grow) * free) / ratio + 2 * each[at2]);
        };
        const heights = memberHeights(mats);
        expect([
          where(`form P heights n=${set.length}`, one),
          heights.every((h) => close(h, heights[0])),
        ]).toEqual([where(`form P heights n=${set.length}`, one), true]);
        const h = heights[0] - 2 * m; // the matched height the mat is a share of
        expect([
          where(`form P share n=${set.length}`, one),
          close(m, CLAMP(one.floor, one.share * h, one.ceiling)),
        ]).toEqual([where(`form P share n=${set.length}`, one), true]);
        // The clause has teeth: the mat the plan rejected — one per
        // member, clamp(F, s·h·q_i, C) — puts the members at different
        // clamp limits over a mixed set, and the same model then returns
        // UNEQUAL heights. Where that variant's mats really do differ,
        // the equality above must be able to tell them apart.
        const perMember = set.map((ratio) =>
          CLAMP(one.floor, one.share * h * Math.min(ratio, 1), one.ceiling),
        );
        if (perMember.some((mi) => !close(mi, perMember[0]))) {
          ragged = true;
          const uneven = memberHeights(perMember);
          expect([
            where(`form P per-member ragged n=${set.length}`, one),
            uneven.every((height) => close(height, uneven[0])),
          ]).toEqual([where(`form P per-member ragged n=${set.length}`, one), false]);
        }
      }
    }
    // ...and the mixed sets really do reach that case, so the check above
    // is not vacuous.
    expect(ragged).toBe(true);
  });

  it('the inert identity: at :root’s literals every form is today’s fixed mat', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    const pause = declarations(ruleFor(top, '.piece-pause').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const member = declarations(
      ruleFor(top, '.piece-diptych.match-height > :is(a.image-link, img)', '--mat').body,
    );
    const block = declarations(ruleFor(top, '.piece-diptych.match-height', '--pair-gap').body);
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const basisOf = (flex) => splitTop(norm(flex), ' ').slice(2).join(' ');
    const MAT = 16.8; // 1.4vw capped at 1.05rem — the laptop's mat, today
    for (const ratio of RATIOS) {
      const one = { viewport: [1512, 982], floor: MAT, ceiling: MAT, share: 0, ratio };
      const base = {
        ...root,
        '--mat-share': 0,
        '--mat-min': `${MAT}px`,
        '--mat-max': `${MAT}px`,
        '--ar': ratio,
      };
      const at = (extra) => ({ env: { ...base, ...extra }, viewport: one.viewport, basis: 666 });
      expect(px(formW(), at({}))).toBe(MAT);
      expect(px(held['--mat'], at({ '--q': held['--q'], '--avail-h': held['--avail-h'] }))).toBe(
        MAT,
      );
      expect(
        px(
          pause['--mat'],
          at({
            '--r': pause['--r'],
            '--q': pause['--q'],
            '--avail-w': pause['--avail-w'],
            '--avail-h': pause['--avail-h'],
          }),
        ),
      ).toBe(MAT);
      expect(
        px(
          frame['--mat'],
          at({
            '--r': frame['--r'],
            '--q': frame['--q'],
            '--stage-pad': stage['--stage-pad'],
            '--avail-w': stage['--avail-w'],
            '--avail-h': stage['--avail-h'],
          }),
        ),
      ).toBe(MAT);
      expect(
        px(member['--mat'], at({ '--n': 2, '--ar-sum': 2.4, '--pair-gap': block['--pair-gap'] })),
      ).toBe(MAT);
      const short = 460;
      const cellAt = at({ '--gallery-short': `${short}px`, '--w': Math.max(ratio, 1) });
      expect(px(cell['--mat'], cellAt)).toBe(MAT);
      // Form R's basis is the row's target width plus two mats — the mat
      // as the constant term is what keeps the packing exact.
      expect(
        px(basisOf(cell['flex']), {
          ...cellAt,
          env: { ...cellAt.env, '--mat': `${MAT}px` },
        }),
      ).toBe(short * Math.max(ratio, 1) + 2 * MAT);
    }
  });

  it("the gate identity: at :root's tokens the reading-width 3:2 single wears the gate's mat", () => {
    // What the product owner judged at the gate (T1103's sampler, Firefox
    // 155, 1512×982): share-60 on the 666px reading column's 3:2 single
    // read 24.667px = 666 × 0.06 / (1.5 + 2 × 0.06). Run against :root
    // itself, so moving any of the three tokens moves this number.
    const m = px(formW(), {
      env: { ...root, '--ar': 1.5 },
      viewport: [1512, 982],
      basis: 666,
    });
    expect(Math.abs(m - 24.667)).toBeLessThan(0.05);
  });
});
