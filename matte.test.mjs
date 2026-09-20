import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { galleryCell, GALLERY_STRETCH } from './src/lib/gallery-layout.ts';
import { blocks, uncomment } from './src/lib/ground.ts';

// The mat rule (spec 013, T1101; a hero treatment since spec 015,
// T1301): one rule, declared once, resolved per geometry. A frame's mat
// is m = clamp(--mat-min, --mat-share × σ, --mat-max) over the
// photograph's RENDERED SHORT SIDE σ — and because CSS cannot measure a
// rendered height, each geometry solves for m algebraically from the
// frame's ratio and publishes --mat, which the surface applies as
// `padding: var(--mat)`.
//
// TWO SURFACES WEAR ONE, since spec 015: the image page's stage
// (form V+H) and the pause frame (form W, on a selector list of one),
// which keeps its mat until the pause gets a spec of its own. Every
// other surface is off, and off has two shapes — `--mat: 0px` where a
// layout formula still reads the mat (the held figure, the packed
// cell), and nothing at all where only the padding did. Both shapes are
// pinned below, so a padding that grows back on a surface, or a formula
// that loses its term, fails a case that names it.
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
// (b) The strings, pinned: the two forms that remain, the zeros that
//     replaced the other three, and the absence of everything else. A
//     form is algebra that renders; a typo in it renders too, just
//     wrong. Whitespace-normalised, because Prettier wraps long calc()
//     values. The walk over every rule in the file is what makes "off"
//     a fact about the stylesheet rather than about the rules this file
//     happens to name.
//
// (c) The geometry, evaluated. The strings are pinned against the plan,
//     but a pinned string can pin a wrong formula, so the forms are
//     also RUN: a small evaluator substitutes var()s from :root and the
//     case, turns CSS math into JS, and checks each form against the
//     rule it claims to implement over a grid of ratios, shares, clamps
//     and viewports — including the plan's central identity (form W at
//     a height-bound frame's width returns that frame's mat), the
//     CSS/srcset agreement for packed rows, and the off identity: at any
//     tokens at all, the unmatted surfaces resolve to zero.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** The one selector form W and the padding/background rule are left with
 *  (spec 015): the pause frame's anchor, or the bare img an alt="" image
 *  gets instead. */
const PAUSE_ANCHOR = '.piece-pause-frame > :is(a.image-link, img)';

/** The two surfaces that still wear a mat. */
const MATTED = [PAUSE_ANCHOR, '.image-frame'];

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

  it('form W is declared once, on the pause’s anchor alone (spec 015)', () => {
    const formW = ruleFor(top, PAUSE_ANCHOR, '--mat');
    expect(norm(formW.prelude)).toBe(PAUSE_ANCHOR);
    expect(norm(declarations(formW.body)['--mat'])).toBe(FORM_W);
    expect(Object.keys(declarations(formW.body))).toEqual(['--mat']);
    // "Once", and on that one surface: no second rule anywhere in the
    // file publishes the same string, and the one that does selects the
    // pause's anchor and nothing beside it — a piece's frame, a cover
    // card or the compare figure put back on this list fails here.
    const declaringW = [...top, ...nested].filter(
      (block) => norm(declarations(block.body)['--mat'] ?? '') === FORM_W,
    );
    expect(declaringW.map((block) => norm(block.prelude))).toEqual([PAUSE_ANCHOR]);
  });

  it('the two matted surfaces read --mat as a padding — the pause’s anchor and the stage’s frame — and no other rule applies --mat or --color-matte', () => {
    const anchor = declarations(ruleFor(top, PAUSE_ANCHOR, 'padding').body);
    expect(anchor['padding']).toBe('var(--mat)');
    expect(anchor['background']).toBe('var(--color-matte)');
    const stage = declarations(ruleFor(top, '.image-frame').body);
    expect(stage['padding']).toBe('var(--mat)');
    expect(stage['background']).toBe('var(--color-matte)');
    // The walk, over every rule in the file, nested ones included: a
    // padding that reads --mat or a background that reads --color-matte
    // may sit on those two selectors and nowhere else. This is what
    // makes spec 015's "off" a fact about the stylesheet — a surface
    // that grows its padding back shows up here by name.
    const applying = [];
    for (const block of [...top, ...nested])
      for (const [property, value] of Object.entries(declarations(block.body))) {
        const mat = /^padding/.test(property) && /var\(--mat\s*[,)]/.test(value);
        const matte = /^background/.test(property) && /--color-matte\b/.test(value);
        if (mat || matte) applying.push(`${norm(block.prelude)} { ${property} }`);
      }
    expect(applying.sort()).toEqual([
      `${MATTED[1]} { background }`,
      `${MATTED[1]} { padding }`,
      `${MATTED[0]} { background }`,
      `${MATTED[0]} { padding }`,
    ]);
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
    // Source order is the pause's mat now (sign-off N1). Narrowed to one
    // selector both rules are (0,2,1) — a tie with `.piece-block
    // a.image-link`, whose `background: none` drops the theme's
    // underline — so the white wins by coming later in the file and by
    // nothing else. Move either rule above that one and the pause frame
    // silently loses its mat.
    const underline = indexOf(top, '.piece-block a.image-link');
    expect(indexOf(top, PAUSE_ANCHOR, 'padding')).toBeGreaterThan(underline);
    expect(indexOf(top, PAUSE_ANCHOR, '--mat')).toBeGreaterThan(underline);
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

  it('the image page reads --mat nowhere: the compare is unmatted, and --color-matte is its letterbox and divider only', () => {
    // The compare figure lost its mat with every other non-hero surface
    // (spec 015). What keeps --color-matte is the compare's own device
    // inside its box — the letterbox fill behind a camera frame whose
    // crop differs, and the slider's divider — neither of which is a
    // field around a photograph. The gap and the note's margin were
    // already prose spacing, not the mat (T1104a): --mat carries 100%,
    // and a percentage resolves against the READER's containing block,
    // so they would have rendered a fraction of the figure's mat.
    const page = uncomment(src['src/pages/images/[...id].astro']);
    const scoped = blocks(page.slice(page.indexOf('<style>'), page.indexOf('</style>')));
    const all = [
      ...scoped,
      ...scoped.filter((one) => one.prelude.startsWith('@')).flatMap((one) => blocks(one.body)),
    ];
    const reading = [];
    const matte = [];
    for (const block of all)
      for (const [property, value] of Object.entries(declarations(block.body))) {
        if (/var\(--mat\s*[,)]/.test(value)) reading.push(`${norm(block.prelude)} { ${property} }`);
        if (/--color-matte\b/.test(value)) matte.push(norm(block.prelude));
      }
    expect(reading).toEqual([]);
    const compare = declarations(ruleFor(all, '.compare').body);
    expect(Object.keys(compare)).not.toContain('padding');
    expect(Object.keys(compare)).not.toContain('background');
    expect(matte.sort()).toEqual([
      '.compare[data-js] .compare-frame :global(img)',
      '.compare[data-js] .compare-line',
    ]);
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
    // zero as at the gate's share (AC 3), and a mat here one edit.
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

  const formW = () => norm(declarations(ruleFor(top, PAUSE_ANCHOR, '--mat').body)['--mat']);

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

  it('the off identity: at any tokens the matted forms give the mat and the unmatted surfaces give 0', () => {
    const cell = declarations(ruleFor(top, '.gallery-flow > li').body);
    const held = declarations(ruleFor(top, '.piece-held figure').body);
    const pause = declarations(ruleFor(top, '.piece-pause').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const basisOf = (flex) => splitTop(norm(flex), ' ').slice(2).join(' ');
    // Share 0 with floor = ceiling is the one setting where every form
    // collapses to a single constant, so it separates the surfaces that
    // read the rule from the surfaces that are off: with the tokens
    // saying "16.8px everywhere", the two matted surfaces wear 16.8 and
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
      // Matted: the pause's anchor (form W), the pause's own box and the
      // stage (form V+H).
      expect(px(formW(), at({}))).toBe(MAT);
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
      // Off: the held figure and the packed cell, whatever the tokens.
      expect(px(held['--mat'], at({ '--avail-h': held['--avail-h'] }))).toBe(0);
      const short = 460;
      const cellAt = at({ '--gallery-short': `${short}px`, '--w': Math.max(ratio, 1) });
      expect(px(cell['--mat'], cellAt)).toBe(0);
      // And form R's basis is the row's target width with no constant
      // left in it: the term is still read, and it contributes nothing.
      expect(
        px(basisOf(cell['flex']), {
          ...cellAt,
          env: { ...cellAt.env, '--mat': cell['--mat'] },
        }),
      ).toBe(short * Math.max(ratio, 1));
    }
  });

  it("the gate identity: at :root's tokens the stage wears the 40px ceiling and the reading-width single wears nothing", () => {
    // The gate's number, kept: at 1512×982 the stage's 3:2 frame sits on
    // the ceiling on both of form V+H's branches (T1104's record, Firefox
    // 155: 40.0). Run against :root itself, so moving any of the three
    // tokens moves this number — spec 015 re-derived none of them.
    const stage = declarations(ruleFor(top, '.image-stage').body);
    const frame = declarations(ruleFor(top, '.image-frame').body);
    const m = px(frame['--mat'], {
      env: {
        ...root,
        '--ar': 1.5,
        '--r': frame['--r'],
        '--q': frame['--q'],
        '--stage-pad': stage['--stage-pad'],
        '--avail-w': stage['--avail-w'],
        '--avail-h': stage['--avail-h'],
      },
      viewport: [1512, 982],
    });
    expect(m).toBe(40);
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
