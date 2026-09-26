import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { galleryCell, GALLERY_STRETCH } from './src/lib/gallery-layout.ts';
import { blocks, uncomment } from './src/lib/ground.ts';
import { PHONE, stageSizes } from './src/lib/stage-sizes.ts';

// The mat rule (spec 013, T1101; a hero treatment since spec 015,
// T1301; the quiet view's alone since spec 017, T1502): one rule,
// declared once, resolved per geometry. A frame's mat is
// m = clamp(--mat-min, --mat-share × σ, --mat-max) over the
// photograph's RENDERED SHORT SIDE σ — and because CSS cannot measure a
// rendered height, each geometry solves for m algebraically from the
// frame's ratio and publishes --mat, which the surface applies as
// `padding: var(--mat)`.
//
// ONE SURFACE WEARS ONE, since spec 017: the image page's quiet view
// (form V+H on `html[data-quiet] .image-frame`), where the ground goes
// dark. Every other surface is off, and off has two shapes —
// `--mat: 0px` where a layout formula still reads the mat (the held
// figure, the packed cell, and the stage's frame on paper, whose
// image's height cap reads it), and nothing at all where only the
// padding did. Both shapes are pinned below, so a padding that grows
// back on a surface, or a formula that loses its term, fails a case
// that names it.
//
// Four kinds of guard, because four different things can go wrong:
//
// (a) The single source. Three tokens in :root and nowhere else: a
//     second declaration anywhere (a surface "just overriding the
//     floor") would make the gate's one number stop being one number,
//     and nothing else would fail. The dead `.gallery-grid > li >
//     a.image-link` rules go with it — they matched no markup after
//     spec 009 moved the cards' mat to the span, so "cards off" is one
//     edit.
//
// (b) The strings, pinned: the one form that remains, the zeros that
//     replaced the others, and the absence of everything else. A form
//     is algebra that renders; a typo in it renders too, just wrong.
//     Whitespace-normalised, because Prettier wraps long calc() values.
//     The walk over every rule in the file is what makes "off" a fact
//     about the stylesheet rather than about the rules this file
//     happens to name.
//
// (c) The geometry, evaluated. The strings are pinned against the plan,
//     but a pinned string can pin a wrong formula, so the forms are
//     also RUN: a small evaluator substitutes var()s from :root and the
//     case, turns CSS math into JS, and checks each form against the
//     rule it claims to implement over a grid of ratios, shares, clamps
//     and viewports — including the plan's central identity (the
//     column-bound form at a height-bound frame's width returns that
//     frame's mat), the CSS/srcset agreement for packed rows, and the
//     off identity: at any tokens at all, the unmatted surfaces resolve
//     to zero.
//
// (d) Where it is worn. The mat is the quiet view's because the quiet
//     view is where the ground goes dark: the one matted rule and the
//     one dark ground in global.css sit under the same attribute.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** The one surface that still wears a mat (spec 017): the quiet view's frame. */
const MATTED = ['html[data-quiet] .image-frame'];

/** Form V+H's two branches — V column-bound over --avail-w, H
 *  height-bound over --avail-h — the one form left (spec 017). */
const FORM_H =
  'clamp(var(--mat-min), calc(var(--avail-h) * var(--mat-share) * var(--q) / (1 + 2 * var(--mat-share) * var(--q))), var(--mat-max))';
const FORM_V =
  'clamp(var(--mat-min), calc(var(--avail-w) * var(--mat-share) / (var(--r) + 2 * var(--mat-share))), var(--mat-max))';

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

/** The stage's quiet rule and the image's rule, byte for byte as `main`
 *  had them before spec 017 (the body `blocks()` returns, pasted): the
 *  refit may not change the quiet view by a character. */
const QUIET_STAGE_BODY =
  '\n  --stage-pad: clamp(0.5rem, 1.5vh, 1rem);\n  --avail-w: calc(100vw - 2 * var(--stage-pad));\n  --avail-h: calc(100svh - 2 * var(--stage-pad));\n  min-height: 100vh;\n  min-height: 100svh;\n  padding-inline: var(--stage-pad);\n  background: var(--color-quiet);\n  cursor: zoom-out;\n';
const FRAME_IMG_BODY =
  '\n  display: block;\n  width: auto;\n  max-width: 100%;\n  height: auto;\n  max-height: calc(var(--avail-h) - 2 * var(--mat));\n';

/** The frame's sizing on paper (spec 017): one rule, gated off the quiet view. */
const PAPER_FRAME = 'html:not([data-quiet]) .image-frame';

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

  it('no file under src/ declares one', () => {
    for (const [path, text] of Object.entries(src)) {
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

  it('no rule selects .gallery-grid > li > a.image-link — the grid’s cards wear no mat', () => {
    expect(css).not.toContain('.gallery-grid > li > a.image-link');
    for (const block of [...top, ...nested])
      expect(splitTop(block.prelude).map(norm)).not.toContain('.gallery-grid > li > a.image-link');
  });
});

describe('(b) every form pinned (T1101, spec 013)', () => {
  it('form V+H is declared once, under html[data-quiet] .image-frame, and every other --mat in the file is 0px', () => {
    const quiet = ruleFor(top, MATTED[0], '--mat');
    expect(norm(quiet.prelude)).toBe(MATTED[0]);
    expect(norm(declarations(quiet.body)['--mat'])).toBe(`min(${FORM_V}, ${FORM_H})`);
    // A rule of its own: the mat and nothing else — the cursor list
    // after it exists to out-specify the zoom-in rule, and merging the
    // two fails the prelude above.
    expect(Object.keys(declarations(quiet.body))).toEqual(['--mat', 'padding', 'background']);
    // "Once", and every other --mat a zero: the walk over every rule in
    // the file, nested ones included, finds that one form and otherwise
    // only 0px — the held figure, the packed cell and the stage's frame
    // on paper. A form put back on any surface fails here by name.
    const declaring = [...top, ...nested]
      .filter((block) => '--mat' in declarations(block.body))
      .map((block) => [norm(block.prelude), norm(declarations(block.body)['--mat'])]);
    expect(declaring.filter(([, value]) => value !== '0px')).toEqual([
      [MATTED[0], `min(${FORM_V}, ${FORM_H})`],
    ]);
    expect(
      declaring
        .filter(([, value]) => value === '0px')
        .map(([prelude]) => prelude)
        .sort(),
    ).toEqual(['.gallery-flow > li', '.image-frame', '.piece-held figure']);
  });

  it('the one matted surface reads --mat as a padding — the quiet view’s frame — and no other rule applies --mat or --color-matte', () => {
    const quiet = declarations(ruleFor(top, MATTED[0], 'padding').body);
    expect(quiet['padding']).toBe('var(--mat)');
    expect(quiet['background']).toBe('var(--color-matte)');
    // The walk, over every rule in the file, nested ones included: a
    // padding that reads --mat or a background that reads --color-matte
    // may sit on that one selector and nowhere else. This is what makes
    // "off" a fact about the stylesheet — a surface that grows its
    // padding back (the stage's frame on paper included) shows up here
    // by name.
    const applying = [];
    for (const block of [...top, ...nested])
      for (const [property, value] of Object.entries(declarations(block.body))) {
        const mat = /^padding/.test(property) && /var\(--mat\s*[,)]/.test(value);
        const matte = /^background/.test(property) && /--color-matte\b/.test(value);
        if (mat || matte) applying.push(`${norm(block.prelude)} { ${property} }`);
      }
    expect(applying.sort()).toEqual([`${MATTED[0]} { background }`, `${MATTED[0]} { padding }`]);
    // ...and nothing reads the tokens: outside :root the three are read
    // only inside a --mat value, so every surface goes through the forms
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

  it('the held figure at zero: --mat 0px, no --q, the box formula unchanged', () => {
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    // The zero is the rule's value, from the same property the box
    // formula always read; --q was form H's and went with it.
    expect(norm(held['--mat'])).toBe('0px');
    expect(Object.keys(held)).not.toContain('--q');
    expect(norm(held['--avail-h'])).toBe('calc(100svh - 2 * var(--hold-margin))');
    expect(norm(held['max-width'])).toBe(
      'calc((var(--avail-h) - 2 * var(--mat)) * var(--ar, 1) + 2 * var(--mat))',
    );
  });

  it('the stage on paper is bare and the quiet view wears form V+H — in global.css, not on the page', () => {
    // The box hugs the frame (spec 017): the piece's spacing as the pad,
    // the page's width less its side pads (no column cap), the first
    // screen less the header, the two spacings and the nav's token — and
    // no min-height at all (the quiet rule carries its own pair). These
    // seven declarations and nothing else.
    const stageRule = ruleFor(top, '.image-stage');
    const stage = declarations(stageRule.body);
    expect(Object.fromEntries(Object.entries(stage).map(([k, v]) => [k, norm(v)]))).toEqual({
      '--stage-pad': 'var(--block-margin)',
      '--avail-w': 'calc(100vw - 2 * var(--page-pad))',
      '--avail-h':
        'calc(100svh - var(--header-h, 4.75rem) - 2 * var(--stage-pad) - var(--frame-nav-h))',
      position: 'relative',
      display: 'grid',
      'place-items': 'center',
      padding: 'var(--stage-pad) var(--page-pad)',
    });
    // declarations() keeps the last of a repeated property, so the raw
    // body is what proves both min-height lines are gone.
    expect(stageRule.body.match(/min-height:/g)).toBeNull();
    // The quiet stage, byte for byte as main had it: it redeclares every
    // property the base changed, so the quiet box is still the viewport.
    const quietStageRule = ruleFor(top, 'html[data-quiet] .image-stage');
    expect(quietStageRule.body).toBe(QUIET_STAGE_BODY);
    expect(quietStageRule.body).not.toContain('--frame-nav-h');
    expect(
      [...quietStageRule.body.matchAll(/min-height:\s*([^;]+);/g)].map((m) => norm(m[1])),
    ).toEqual(['100vh', '100svh']);
    // The frame on paper: the ratio helpers, a declared zero (the image's
    // cap below reads it), no column cap, and no padding or field — a
    // mat that grows back on paper fails here.
    const frame = declarations(ruleFor(top, '.image-frame').body);
    expect(Object.keys(frame)).toEqual(['--r', '--q', '--mat', 'max-width', 'margin']);
    expect(norm(frame['--r'])).toBe('max(var(--ar, 1), 1)');
    expect(norm(frame['--q'])).toBe('min(var(--ar, 1), 1)');
    expect(norm(frame['--mat'])).toBe('0px');
    expect(norm(frame['max-width'])).toBe('100%');
    expect(norm(frame['margin'])).toBe('0');
    // One rectangle, turned: the L × S box, gated off the quiet view.
    const paperRule = ruleFor(top, PAPER_FRAME);
    expect(norm(paperRule.prelude)).toBe(PAPER_FRAME);
    const paper = declarations(paperRule.body);
    expect(Object.fromEntries(Object.entries(paper).map(([k, v]) => [k, norm(v)]))).toEqual({
      '--L': 'min(var(--avail-w), var(--avail-h))',
      '--S': 'calc(var(--L) * 2 / 3)',
      width: 'min(calc(var(--L) * var(--q)), calc(var(--S) * var(--r)))',
    });
    const paperImg = ruleFor(top, `${PAPER_FRAME} img`);
    expect(norm(paperImg.prelude)).toBe(`${PAPER_FRAME} img`);
    expect(declarations(paperImg.body)).toEqual({ width: '100%' });
    // The image's own rule, byte for byte as main had it.
    expect(ruleFor(top, '.image-frame img').body).toBe(FRAME_IMG_BODY);
    expect(norm(declarations(ruleFor(top, '.image-frame img').body)['max-height'])).toBe(
      'calc(var(--avail-h) - 2 * var(--mat))',
    );
    const quiet = declarations(quietStageRule.body);
    expect(norm(quiet['--stage-pad'])).toBe('clamp(0.5rem, 1.5vh, 1rem)');
    expect(norm(quiet['--avail-w'])).toBe('calc(100vw - 2 * var(--stage-pad))');
    expect(norm(quiet['--avail-h'])).toBe('calc(100svh - 2 * var(--stage-pad))');
    // Quiet view redeclares the stage's limits, and the frame's mat
    // under the same attribute: the base `.image-frame img` max-height
    // above reads --avail-h and --mat, so a quiet copy of it is
    // byte-identical duplication (T1101b deleted it, on both the page
    // and here). These four rules, the mat's between the stage's and
    // the cursor list, the loupe's ready photograph after them (spec 019,
    // T1712: a deliberate fourth), and no fifth.
    const QUIET_RULE = /html\[data-quiet\] \.image-/;
    // The paper frame's `:not` preludes are not quiet rules: the list
    // below gains nothing from them.
    expect(QUIET_RULE.test(PAPER_FRAME)).toBe(false);
    expect(QUIET_RULE.test(`${PAPER_FRAME} img`)).toBe(false);
    const quietStage = [...top, ...nested]
      .map((block) => norm(block.prelude))
      .filter((prelude) => QUIET_RULE.test(prelude));
    expect(quietStage).toEqual([
      'html[data-quiet] .image-stage',
      'html[data-quiet] .image-frame',
      'html[data-quiet] .image-frame, html[data-quiet] .image-stage[data-quiet-ready] .image-frame',
      'html[data-quiet] .image-stage[data-loupe-ready] .image-frame img',
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
    // Two rules now select html[data-quiet] .image-frame — the mat and
    // the cursor list — so each is found by what it declares. The
    // zoom-in rule comes before both; the mat's rule sits after the
    // quiet stage and before the cursor list.
    const zoomIn = indexOf(top, '.image-stage[data-quiet-ready] .image-frame');
    const quietMat = indexOf(top, 'html[data-quiet] .image-frame', '--mat');
    const quietCursor = indexOf(top, 'html[data-quiet] .image-frame', 'cursor');
    expect(zoomIn).toBeLessThan(quietMat);
    expect(zoomIn).toBeLessThan(quietCursor);
    expect(indexOf(top, 'html[data-quiet] .image-stage')).toBeLessThan(quietMat);
    expect(quietMat).toBeLessThan(quietCursor);
  });

  it("--frame-nav-h is :root's at both widths — the reserve the stage's height takes out and the nav claims", () => {
    // One row of the nav's 0.78rem mono plus its half-baseline bottom
    // padding; two rows and the 1rem gap below the nav's own wrap.
    expect(norm(root['--frame-nav-h'])).toBe('calc(0.78rem * 1.362 + var(--baseline) * 0.5)');
    const phoneQuery = top.filter((block) => norm(block.prelude) === `@media ${PHONE}`);
    const phoneRoots = phoneQuery
      .flatMap((block) => blocks(block.body))
      .filter((block) => selects(block.prelude, ':root'));
    expect(phoneRoots).toHaveLength(1);
    expect(norm(declarations(phoneRoots[0].body)['--frame-nav-h'])).toBe(
      'calc(0.78rem * 1.362 * 2 + 1rem + var(--baseline) * 0.5)',
    );
    // Declared on :root twice — the base and the phone query — and on no
    // other selector: a stage or a nav that set its own would drift.
    const declaring = [...top, ...nested]
      .filter((block) => '--frame-nav-h' in declarations(block.body))
      .map((block) => norm(block.prelude));
    expect(declaring).toEqual([':root', ':root']);
    expect(norm(ruleFor(top, '.image-stage').prelude)).toBe('.image-stage');
    // The nav claims the token, at the font size the token was measured
    // at, and puts the piece's spacing between itself and the title; the
    // head adds no top padding above the title. Each declaration by name.
    const page = uncomment(src['src/pages/images/[...id].astro']);
    const scoped = blocks(page.slice(page.indexOf('<style>'), page.indexOf('</style>')));
    const nav = declarations(ruleFor(scoped, '.frame-nav').body);
    const head = declarations(ruleFor(scoped, '.image-head').body);
    for (const [label, value, expected] of [
      ['.frame-nav { min-height }', nav['min-height'], 'var(--frame-nav-h)'],
      ['.frame-nav { margin-block-end }', nav['margin-block-end'], 'var(--block-margin)'],
      ['.frame-nav { font-size }', nav['font-size'], '0.78rem'],
      ['.image-head { padding-block-start }', head['padding-block-start'], '0'],
    ])
      expect([label, value && norm(value)]).toEqual([label, expected]);
    // The nav's own wrap sits at the query the phone token mirrors.
    const wraps = scoped
      .filter((block) => norm(block.prelude) === `@media ${PHONE}`)
      .flatMap((block) => blocks(block.body))
      .filter((block) => selects(block.prelude, '.frame-nav'));
    expect(['the nav wraps at', PHONE, wraps.length]).toEqual(['the nav wraps at', PHONE, 1]);
  });

  it('the image page reads --mat nowhere: the compare is unmatted, and its section reads --color-matte nowhere (none, D1708)', async () => {
    // The compare figure lost its mat with every other non-hero surface
    // (spec 015). Since spec 019 (T1706) the compare's rules live in
    // global.css's "The compare (spec 019)" section, where a piece's
    // compare can reach them, and the page's scoped <style> holds none:
    // so the page's own rules read neither --mat nor --color-matte, and
    // the section reads no --mat and --color-matte only in the rules
    // listed below. The prose spacing between stages was never the mat
    // (T1104a): --mat carries 100%, and a percentage resolves against
    // the READER's containing block.
    const reads = (list) => {
      const all = [
        ...list,
        ...list.filter((one) => one.prelude.startsWith('@')).flatMap((one) => blocks(one.body)),
      ];
      const reading = [];
      const matte = [];
      for (const block of all)
        for (const [property, value] of Object.entries(declarations(block.body))) {
          if (/var\(--mat\s*[,)]/.test(value)) reading.push(`${norm(block.prelude)} { ${property} }`);
          if (/--color-matte\b/.test(value)) matte.push(norm(block.prelude));
        }
      return { all, reading, matte };
    };

    const page = uncomment(src['src/pages/images/[...id].astro']);
    const scoped = reads(blocks(page.slice(page.indexOf('<style>'), page.indexOf('</style>'))));
    expect(scoped.all.length).toBeGreaterThan(0);
    expect(scoped.reading).toEqual([]);
    expect(scoped.matte).toEqual([]);

    const raw = await readFile(here('./src/styles/global.css'), 'utf8');
    const from = raw.indexOf('/* ---- The compare (spec 019)');
    const to = raw.indexOf('/* ---- Motion (spec 018)');
    expect([from > -1, to > from]).toEqual([true, true]);
    const section = reads(blocks(uncomment(raw.slice(from, to))));
    expect(section.all.length).toBeGreaterThan(0);
    expect(section.reading).toEqual([]);
    // The section reads --color-matte nowhere, by decision D1708: the
    // mat's white is the quiet frame's alone (spec 017); the letterbox,
    // the divider and the handle read --color-bg.
    expect(section.matte.sort()).toEqual([]);
    const compare = declarations(ruleFor(section.all, ':where(.compare)').body);
    expect(Object.keys(compare)).not.toContain('padding');
    expect(Object.keys(compare)).not.toContain('background');
  });

  it('the cover card’s span reads no mat: a block box, the cover’s ratio, nothing else', () => {
    const card = src['src/components/CoverCards.astro'];
    const style = uncomment(card);
    const scoped = blocks(style.slice(style.indexOf('<style>'), style.indexOf('</style>')));
    const all = [
      ...scoped,
      ...scoped.filter((one) => one.prelude.startsWith('@')).flatMap((one) => blocks(one.body)),
    ];
    expect(declarations(ruleFor(all, '.gallery-card .image-link').body)).toEqual({
      display: 'block',
    });
    // Nothing in the file reads the mat or its colour at all — the span
    // stays only to carry the cover's --ar, as every frame does.
    expect(/var\(--mat\s*[,)]|--color-matte\b/.test(card)).toBe(false);
    expect(card).toContain('--ar: ');
  });

  it('form R at zero: the constant term is 0px and the packed row’s formulas keep it', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    expect(norm(cell['--mat'])).toBe('0px');
    // The basis and both caps keep their `+ 2 * var(--mat)` term — that
    // constant term is what makes the packing and the srcset exact, at
    // zero as at the gate's share (AC 3), and a mat here one edit. These
    // pinned strings are the guarantee that the term is still read: at
    // zero it contributes nothing, but it is still in the string.
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
    expect(declarations(ruleFor(top, '.gallery-flow > li > a.image-link').body)).toEqual({
      display: 'block',
    });
  });

  it('form P is gone: no rule gives the matched members a --mat or a padding, and --pair-gap stays', () => {
    const members = [...top, ...nested].filter((block) =>
      selects(block.prelude, '.piece-diptych.match-height > :is(a.image-link, img)'),
    );
    // The members' own rules still exist (the flex item, and the
    // collapse below 720px) — what is gone is any mat on them. With no
    // padding their base size is the image alone and the heights are
    // equal by algebra, so there is nothing left here to evaluate.
    expect(members.length).toBeGreaterThan(0);
    for (const block of members) {
      const declared = Object.keys(declarations(block.body));
      expect([norm(block.prelude), declared.filter((one) => /^(--mat|padding)/.test(one))]) //
        .toEqual([norm(block.prelude), []]);
    }
    // ...and form P's string is published nowhere: it read --ar-sum and
    // --n, which the transform still emits and nothing now reads.
    const declaringP = [...top, ...nested].filter((block) =>
      /--ar-sum/.test(declarations(block.body)['--mat'] ?? ''),
    );
    expect(declaringP.map((block) => norm(block.prelude))).toEqual([]);
    // The gap stays, declared once on the block and read once in `gap`.
    const gaps = [...top, ...nested].filter((block) => '--pair-gap' in declarations(block.body));
    expect(gaps.map((block) => norm(block.prelude))).toEqual([
      '.piece-diptych.match-height, .piece-triptych.match-height',
    ]);
    const block = declarations(gaps[0].body);
    expect(norm(block['--pair-gap'])).toBe('calc(var(--baseline) / 3)');
    expect(norm(block['gap'])).toBe('var(--pair-gap)');
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

  /** --frame-nav-h at a viewport: :root's, or the phone query's :root
   *  below 720px — the nav's own wrap. */
  const navAt = ([width]) => {
    if (width > 719.98) return root['--frame-nav-h'];
    const phone = top
      .filter((block) => norm(block.prelude) === `@media ${PHONE}`)
      .flatMap((block) => blocks(block.body))
      .filter((block) => selects(block.prelude, ':root'));
    return declarations(phone[0].body)['--frame-nav-h'];
  };

  it('the held frame at zero mat fits its height exactly', () => {
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    for (const one of grid()) {
      const env = envFor(one, { '--avail-h': held['--avail-h'], '--mat': held['--mat'] });
      const at = { env, viewport: one.viewport };
      const m = px(held['--mat'], at);
      const H = px(held['--avail-h'], at);
      const boxW = px(held['max-width'], at);
      // Off is off whatever the tokens say: the surface declares the
      // zero, so no ratio, share or clamp can put a mat back on it.
      expect([where('held mat', one), m]).toEqual([where('held mat', one), 0]);
      // The box formula still reads --mat, and at zero it is H × ar —
      // the frame is exactly the height it is allowed (AC 3).
      expect([where('held box', one), close(boxW, H * one.ratio)]) //
        .toEqual([where('held box', one), true]);
      expect([where('held fit', one), close((boxW - 2 * m) / one.ratio + 2 * m, H)]) //
        .toEqual([where('held fit', one), true]);
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
    // The central identity: form V with the container's width named —
    // --avail-w set to the frame's own width — returns the frame's mat.
    // (Form W, column-bound on its own, was that same algebra over a
    // percentage basis; its surface went at spec 017.)
    const fromW = px(FORM_V, {
      env: { ...envFor(one), '--avail-w': `${boxW}px`, '--r': 'max(var(--ar, 1), 1)' },
      viewport: one.viewport,
    });
    expect([where(`${label} identity`, one), close(fromW, m)]).toEqual([
      where(`${label} identity`, one),
      true,
    ]);
  };

  it('form V+H: the quiet view’s frame takes the smaller mat, fits both limits and is tight on one', () => {
    const quietStage = declarations(ruleFor(top, 'html[data-quiet] .image-stage').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const quiet = declarations(ruleFor(top, MATTED[0], '--mat').body);
    for (const one of grid()) {
      const env = envFor(one, {
        '--stage-pad': quietStage['--stage-pad'],
        '--avail-w': quietStage['--avail-w'],
        '--avail-h': quietStage['--avail-h'],
        '--r': frame['--r'],
        '--q': frame['--q'],
        '--mat': quiet['--mat'],
      });
      const at = { env, viewport: one.viewport };
      const m = px(quiet['--mat'], at);
      const availW = px(quietStage['--avail-w'], at);
      const availH = px(quietStage['--avail-h'], at);
      // The stage centres a shrink-to-fit frame: the image is as large as
      // both limits allow (max-width 100%, max-height the image's rule).
      const boxW = Math.min(availW, (availH - 2 * m) * one.ratio + 2 * m);
      expect([
        where('quiet img height', one),
        close(
          px(declarations(ruleFor(top, '.image-frame img').body)['max-height'], at),
          availH - 2 * m,
        ),
      ]).toEqual([where('quiet img height', one), true]);
      fitsBothTight('quiet', { m, boxW, availW, availH, one });
    }
  });

  it('the stage on paper is bare: --mat is 0 at every grid point and the image’s cap is the whole of --avail-h', () => {
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const cap = declarations(ruleFor(top, '.image-frame img').body)['max-height'];
    for (const one of grid()) {
      const env = envFor(one, {
        '--stage-pad': stage['--stage-pad'],
        '--avail-w': stage['--avail-w'],
        '--avail-h': stage['--avail-h'],
        '--r': frame['--r'],
        '--q': frame['--q'],
        '--mat': frame['--mat'],
        '--frame-nav-h': navAt(one.viewport),
      });
      const at = { env, viewport: one.viewport };
      // Off whatever the tokens say: the frame declares the zero, so no
      // ratio, share or clamp can put a mat back on paper. Without the
      // declaration the cap's calc has no --mat and does not resolve.
      expect([where('paper mat', one), px(frame['--mat'], at)]).toEqual([
        where('paper mat', one),
        0,
      ]);
      expect([where('paper cap', one), close(px(cap, at), px(stage['--avail-h'], at))]).toEqual([
        where('paper cap', one),
        true,
      ]);
    }
  });

  /** The paper frame's env at a point: the stage's limits, the ratio
   *  helpers, the L × S rule's own strings, --header-h absent (its
   *  4.75rem fallback) and the nav's token at the viewport's width. */
  const paperEnv = (one, ratio = one.ratio) => {
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const paper = declarations(ruleFor(top, PAPER_FRAME).body);
    const env = envFor(one, {
      '--ar': ratio,
      '--stage-pad': stage['--stage-pad'],
      '--avail-w': stage['--avail-w'],
      '--avail-h': stage['--avail-h'],
      '--r': frame['--r'],
      '--q': frame['--q'],
      '--mat': frame['--mat'],
      '--frame-nav-h': navAt(one.viewport),
      '--L': paper['--L'],
      '--S': paper['--S'],
    });
    expect('--header-h' in env).toBe(false);
    const at = { env, viewport: one.viewport };
    const width = px(paper['width'], at);
    // The test's own box: L the smaller limit, S two-thirds of it.
    const L = Math.min(px(stage['--avail-w'], at), px(stage['--avail-h'], at));
    return { at, width, height: width / ratio, L, S: (2 * L) / 3 };
  };

  it('one rectangle, turned: every frame fits the L × S box turned to suit it and touches a side', () => {
    const cap = declarations(ruleFor(top, '.image-frame img').body)['max-height'];
    for (const one of grid()) {
      const { at, width, height, L, S } = paperEnv(one);
      const [long, short] = one.ratio >= 1 ? [width, height] : [height, width];
      expect([where('fits the box', one), long <= L + 1e-6 && short <= S + 1e-6]).toEqual([
        where('fits the box', one),
        true,
      ]);
      expect([where('touches a side', one), close(long, L) || close(short, S)]).toEqual([
        where('touches a side', one),
        true,
      ]);
      if (one.ratio === 1)
        expect([where('square is S × S', one), close(width, S) && close(height, S)]).toEqual([
          where('square is S × S', one),
          true,
        ]);
      if (one.ratio === 3)
        expect([where('3:1 is L × L/3', one), close(width, L) && close(height, L / 3)]).toEqual([
          where('3:1 is L × L/3', one),
          true,
        ]);
      if (one.ratio === 0.8)
        expect([where('4:5 is S wide', one), close(width, S)]).toEqual([
          where('4:5 is S wide', one),
          true,
        ]);
      // Spec 013's cap on the image never binds on paper.
      expect([where('max-height never binds', one), px(cap, at) >= height - 1e-6]).toEqual([
        where('max-height never binds', one),
        true,
      ]);
      // The exact pair, evaluated here rather than at the grid's 0.667:
      // a 3:2 is L × S and a 2:3 is S × L — the reference rectangle, turned.
      const landscape = paperEnv(one, 1.5);
      const portrait = paperEnv(one, 1 / 1.5);
      expect([
        where('3:2 is L × S', one),
        close(landscape.width, landscape.L) && close(landscape.height, landscape.S),
      ]).toEqual([where('3:2 is L × S', one), true]);
      expect([
        where('2:3 is S × L', one),
        close(portrait.width, portrait.S) && close(portrait.height, portrait.L),
      ]).toEqual([where('2:3 is S × L', one), true]);
    }
  });

  it('the sizes hint agrees with the rule: stageSizes(ar), at the branch the viewport selects, is the CSS width', () => {
    expect(PHONE).toBe('(max-width: 719.98px)');
    for (const one of grid()) {
      const sizes = stageSizes(one.ratio);
      expect([where('sizes query', one), sizes.startsWith('(max-width: 719.98px) ')]).toEqual([
        where('sizes query', one),
        true,
      ]);
      const [phone, wide] = splitTop(sizes.slice(`${PHONE} `.length)).map((part) => part.trim());
      const branch = one.viewport[0] <= 719.98 ? phone : wide;
      // px() reads vh as svh: the hint says 100vh where the rule says 100svh.
      const hinted = px(branch, { env: {}, viewport: one.viewport });
      const { width } = paperEnv(one);
      expect([where('sizes = width', one), close(hinted, width)]).toEqual([
        where('sizes = width', one),
        true,
      ]);
    }
  });

  it('form R at zero: the photograph’s width is the row’s math, at any growth', () => {
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
          // The cell is unmatted (spec 015): zero at every point of the
          // grid, so form R restored here — or any other mat — fails.
          expect([where(`form R mat ratio ${c.ratio}`, one), c.m]).toEqual([
            where(`form R mat ratio ${c.ratio}`, one),
            0,
          ]);
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

  it('the off identity: at share 0 with floor = ceiling the quiet view’s frame gives the mat and the paper stage, the held figure and the packed cell give 0', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const quiet = declarations(ruleFor(top, MATTED[0], '--mat').body);
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const quietStage = declarations(ruleFor(top, 'html[data-quiet] .image-stage').body);
    const basisOf = (flex) => splitTop(norm(flex), ' ').slice(2).join(' ');
    // Share 0 with floor = ceiling is the one setting where every form
    // collapses to a single constant, so it separates the surface that
    // reads the rule from the surfaces that are off: with the tokens
    // saying "16.8px everywhere", the quiet view's frame wears 16.8 and
    // the unmatted ones still wear nothing, because their zero is
    // declared, not derived.
    const MAT = 16.8;
    for (const ratio of RATIOS) {
      const base = {
        ...root,
        '--mat-share': 0,
        '--mat-min': `${MAT}px`,
        '--mat-max': `${MAT}px`,
        '--ar': ratio,
      };
      const at = (extra) => ({ env: { ...base, ...extra }, viewport: [1512, 982], basis: 666 });
      // Matted: the quiet view's frame (form V+H), over the quiet limits.
      expect(
        px(
          quiet['--mat'],
          at({
            '--r': frame['--r'],
            '--q': frame['--q'],
            '--stage-pad': quietStage['--stage-pad'],
            '--avail-w': quietStage['--avail-w'],
            '--avail-h': quietStage['--avail-h'],
          }),
        ),
      ).toBe(MAT);
      // Off: the stage on paper, whatever the tokens.
      expect(
        px(
          frame['--mat'],
          at({
            '--stage-pad': stage['--stage-pad'],
            '--avail-w': stage['--avail-w'],
            '--avail-h': stage['--avail-h'],
          }),
        ),
      ).toBe(0);
      // Off: the held figure and the packed cell, whatever the tokens.
      expect(px(held['--mat'], at({ '--avail-h': held['--avail-h'] }))).toBe(0);
      const short = 460;
      const cellAt = at({ '--gallery-short': `${short}px`, '--w': Math.max(ratio, 1) });
      expect(px(cell['--mat'], cellAt)).toBe(0);
      // And form R's basis is the row's target width with no constant
      // left in it — the term contributes nothing at zero. That it is
      // still in the string at all is case (b)'s pin, not this one.
      expect(
        px(basisOf(cell['flex']), {
          ...cellAt,
          env: { ...cellAt.env, '--mat': cell['--mat'] },
        }),
      ).toBe(short * Math.max(ratio, 1));
    }
  });

  it("the gate identity: at :root's tokens the quiet view's frame wears the 40px ceiling, the paper stage's wears 0, and the reading-width single wears nothing", () => {
    // The gate's number, kept: at 1512×982 the quiet view's 3:2 frame
    // sits on the ceiling on both of form V+H's branches (T1502's read,
    // Firefox 156: 40). Run against :root itself, so a move in the
    // ceiling moves this number — it is the ceiling the frame sits on
    // here; drift in the other two tokens is caught by case (a). Specs
    // 015 and 017 re-derived none of the three.
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const quietStage = declarations(ruleFor(top, 'html[data-quiet] .image-stage').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const quiet = declarations(ruleFor(top, MATTED[0], '--mat').body);
    const m = px(quiet['--mat'], {
      env: {
        ...root,
        '--ar': 1.5,
        '--r': frame['--r'],
        '--q': frame['--q'],
        '--stage-pad': quietStage['--stage-pad'],
        '--avail-w': quietStage['--avail-w'],
        '--avail-h': quietStage['--avail-h'],
      },
      viewport: [1512, 982],
    });
    expect(m).toBe(40);
    // The same frame on paper, at the same tokens, wears nothing.
    const paper = px(frame['--mat'], {
      env: {
        ...root,
        '--ar': 1.5,
        '--stage-pad': stage['--stage-pad'],
        '--avail-w': stage['--avail-w'],
        '--avail-h': stage['--avail-h'],
      },
      viewport: [1512, 982],
    });
    expect(paper).toBe(0);
    // And the frame the same gate judged at 24.667px — the 3:2 single in
    // the reading column — has no --mat reader at all since spec 015: no
    // rule in the file applies a mat-bearing padding to a piece's
    // reading-flow frame or to a prose shorthand image.
    const onPieces = [...top, ...nested]
      .filter((block) =>
        Object.entries(declarations(block.body)).some(
          ([property, value]) => /^padding/.test(property) && /var\(--mat\s*[,)]/.test(value),
        ),
      )
      .map((block) => norm(block.prelude))
      .filter((prelude) =>
        /piece-(single|inset|wide|diptych|triptych|grid|aside|row|held)|\.prose/.test(prelude),
      );
    expect(onPieces).toEqual([]);
  });
});

describe('(d) worn where the ground is dark (T1502, spec 017)', () => {
  it('worn where the ground is dark — in global.css, one dark ground (spec 017)', () => {
    // Scoped to global.css by name: the image page's scoped style has
    // its own `:global(html[data-quiet]) { background }` for the page
    // ground behind the stage — the same dark under the same attribute,
    // outside this file.
    const DARK = 'html[data-quiet] .image-stage';
    // Every background in the file that reads --color-quiet sits on the
    // quiet stage and nowhere else: one dark ground.
    const dark = [];
    for (const block of [...top, ...nested])
      for (const [property, value] of Object.entries(declarations(block.body)))
        if (/^background/.test(property) && /--color-quiet\b/.test(value))
          dark.push(`${norm(block.prelude)} { ${property} }`);
    expect(dark).toEqual([`${DARK} { background }`]);
    // --avail-w, the limit form V reads, is published by the stage and
    // its quiet view only — no other box offers the form a width.
    const publishing = [...top, ...nested]
      .filter((block) => '--avail-w' in declarations(block.body))
      .map((block) => norm(block.prelude));
    expect(publishing).toEqual(['.image-stage', DARK]);
    // And the matted selector is gated by the same attribute as the dark
    // ground: every selector of every rule that applies the mat starts
    // with it, so a mat cannot be worn where the ground is paper.
    const gate = (selector) => norm(selector).split(' ')[0];
    expect(gate(MATTED[0])).toBe('html[data-quiet]');
    expect(gate(MATTED[0])).toBe(gate(DARK));
    const ungated = [];
    for (const block of [...top, ...nested]) {
      const decl = declarations(block.body);
      const applies =
        /var\(--mat\s*[,)]/.test(decl['padding'] ?? '') ||
        /--color-matte\b/.test(decl['background'] ?? '');
      if (!applies) continue;
      for (const selector of splitTop(block.prelude))
        if (gate(selector) !== gate(DARK)) ungated.push(norm(selector));
    }
    expect(ungated).toEqual([]);
  });
});
