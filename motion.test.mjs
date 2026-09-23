import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { blocks, uncomment } from './src/lib/ground.ts';

// The motion grammar (spec 018, T1600): three durations, two curves,
// and the flags and numbers the tuning envelope names — twenty custom
// properties on :root, declared once, read by every transition and
// animation on the site. The rule: motion answers the reader.
//
// Three kinds of guard here (a fourth, the literal scan, is T1601's
// case (b)), because three different things can go wrong:
//
// (a) The single source. `EXPECTED` below is the grammar's one other
//     copy: a round that retunes a value moves it in :root and in its
//     row here, and nowhere else. A value retyped in :root alone fails
//     against the table; a token dropped or a new one of the family
//     added without a row fails the name set; and a second
//     declaration anywhere — a rule in global.css or in any `.astro`
//     file's <style> "just overriding the duration" — would make the
//     dev switch's one number stop being one number, so the walk over
//     every declaration fails naming the rule. A walk, not a grep:
//     the motion module and the dev panel carry the names as strings.
//     Two readings are allowed, and only two: the reduced-motion
//     block's `:root { --arrive-rise: 0px; --hero-enter: 0 }`, and the
//     covers rule pointing `--motion-appear` / `--motion-arrive` at the
//     two `*-covers` tokens.
//
// (c) The inherited motion reads the tokens. The header's slide, the
//     link underline, the button and social hovers and the hero's
//     entrance, pinned by string — a literal restored on any of them
//     fails naming the rule — with keel-enter's keyframes unchanged;
//     and the page change's rules (the two group rules, the old/new
//     timing-function inherit, the covers' switch), each by string.
//     Whitespace-normalised, because Prettier wraps long lists.
//
// (d) Reduced motion keeps the fades and drops the movement. The
//     one-millisecond blanket is gone and the block holds exactly the
//     four rules plan.md names: a `*` prelude, a `1ms`, a
//     `scroll-behavior`, a fifth rule or a changed one fails, and so
//     does a zero laid on a fade — an opacity transition or the
//     appearance animation — other than the --rm-appear product.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** The grammar, verbatim as :root carries it. To retune: move the value
 *  in global.css and here, together. */
const EXPECTED = {
  '--dur-state': '180ms',
  '--dur-move': '480ms',
  '--dur-appear': '400ms',
  '--ease-state': 'ease',
  '--ease-move': 'cubic-bezier(0.22, 1, 0.36, 1)',
  '--motion-appear': '1',
  '--motion-arrive': '1',
  '--motion-travel': '1',
  '--motion-quiet': '1',
  '--motion-appear-covers': '1',
  '--motion-arrive-covers': '1',
  '--arrive-rise': '0px',
  '--arrive-threshold': '0.15',
  '--arrive-stagger': '0ms',
  '--wait-fill': 'var(--color-surface)',
  '--hero-enter': '1',
  '--hero-stagger': '90ms',
  '--arrows-slide': '0px',
  '--rm-appear': '1',
  '--rm-quiet': '1',
};

/** The family the grammar owns: a name of this shape in :root is the
 *  grammar's, so it has a row in `EXPECTED` or it is an error. */
const FAMILY = /^--(dur-|ease-|motion-|arrive-|hero-|rm-)|^--wait-fill$|^--arrows-slide$/;

/** The covers' own switch (the Motion section): the only rule outside
 *  :root that declares one of the twenty, and only these two readings. */
const COVERS = '.note-cover, .gallery-card .image-link';
const COVERS_BODY = {
  '--motion-appear': 'var(--motion-appear-covers)',
  '--motion-arrive': 'var(--motion-arrive-covers)',
};

const REDUCED = '@media (prefers-reduced-motion: reduce)';

/** The reduced-motion block's :root: the arrival loses its rise, the
 *  hero lands on its end state through its flag. */
const REDUCED_ROOT = { '--arrive-rise': '0px', '--hero-enter': '0' };

/** plan.md's "Reduced motion": the four rules, preludes and bodies. */
const REDUCED_RULES = [
  { prelude: ':root', body: REDUCED_ROOT },
  {
    prelude: 'a:not(.brand, .button, .social-links *)',
    body: { 'transition-property': 'color' },
  },
  { prelude: '.site-header', body: { 'transition-duration': '0s' } },
  {
    prelude: "img[data-shown='fade'], img[data-shown='rise']",
    body: { 'animation-duration': 'calc(var(--dur-appear) * var(--rm-appear))' },
  },
];

/** A rule body's declarations in order, as [name, value] pairs — a list,
 *  not a map, so a name declared twice in one rule is seen twice.
 *  Nested rules are ignored. */
function declarationList(body) {
  const flat = body.replace(/\{[^{}]*\}/g, '');
  const out = [];
  for (const part of splitTop(flat, ';')) {
    const at = part.indexOf(':');
    if (at === -1) continue;
    out.push([part.slice(0, at).trim(), part.slice(at + 1).trim()]);
  }
  return out;
}

/** The declarations of a rule body, as name -> normalised value. */
const declarations = (body) =>
  Object.fromEntries(declarationList(body).map(([name, value]) => [name, norm(value)]));

/** Split on `sep` at paren depth 0 — `a:not(.brand, .button)` and a
 *  cubic-bezier() both carry commas inside parentheses. */
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

/** A prelude as its selector list, each normalised, joined by ', '. */
const preludeOf = (prelude) => splitTop(prelude).map(norm).join(', ');

const selects = (prelude, selector) =>
  splitTop(prelude).some((one) => norm(one) === norm(selector));

/** Every style rule in `css`, @-blocks opened recursively, each with the
 *  @-preludes it sits under (`within`) — keyframe steps included. */
function rules(css, within = []) {
  return blocks(css).flatMap((block) =>
    block.prelude.startsWith('@')
      ? rules(block.body, [...within, norm(block.prelude)])
      : [{ ...block, within, where: [...within, preludeOf(block.prelude)].join(' ') }],
  );
}

/** The one top-level rule whose selector list contains `selector` and
 *  which declares `declares`. Fails if it isn't unique. */
function ruleFor(list, selector, declares) {
  const found = list.filter(
    (block) =>
      block.within.length === 0 &&
      selects(block.prelude, selector) &&
      declares in declarations(block.body),
  );
  expect([selector, declares, found.length]).toEqual([selector, declares, 1]);
  return found[0];
}

/** Every `.astro` file under src/, path -> contents. */
async function astroFiles(dir = here('./src'), out = {}) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await astroFiles(path, out);
    else if (entry.name.endsWith('.astro'))
      out[path.slice(here('./').length)] = await readFile(path, 'utf8');
  }
  return out;
}

/** The CSS of a component's <style> blocks — only a tag at the start of
 *  a line, so prose that mentions `<style>` in a comment isn't one. */
const styleBlocks = (text) =>
  [...text.matchAll(/^<style\b[^>]*>([\s\S]*?)^<\/style>/gm)].map((m) => uncomment(m[1]));

let css;
let all;
let top;
let styles;

beforeAll(async () => {
  css = uncomment(await readFile(here('./src/styles/global.css'), 'utf8'));
  all = rules(css);
  top = all.filter((rule) => rule.within.length === 0);
  styles = Object.entries(await astroFiles()).flatMap(([path, text]) =>
    styleBlocks(text).flatMap((block) =>
      rules(block).map((rule) => ({ ...rule, where: `${path}: ${rule.where}` })),
    ),
  );
});

describe('(a) the grammar is declared once (T1600, spec 018)', () => {
  it(':root declares exactly EXPECTED — every name, every value, nothing of the family missing or extra', () => {
    const declared = top
      .filter((rule) => selects(rule.prelude, ':root'))
      .flatMap((rule) => declarationList(rule.body))
      .filter(([name]) => FAMILY.test(name))
      .map(([name, value]) => [name, norm(value)]);
    // Each once: a name declared in two :root rules, or twice in one,
    // would leave one of them dead and the table true of neither.
    const names = declared.map(([name]) => name);
    expect(names.filter((name, at) => names.indexOf(name) !== at)).toEqual([]);
    expect(Object.fromEntries(declared)).toEqual(EXPECTED);
  });

  it('no other rule in global.css or in any .astro <style> declares one — except the two allowed readings', () => {
    const allowed = (rule, name, value) => {
      const prelude = preludeOf(rule.prelude);
      if (rule.within.length === 0 && prelude === ':root') return true;
      if (
        rule.within.length === 1 &&
        rule.within[0] === REDUCED &&
        prelude === ':root' &&
        REDUCED_ROOT[name] === norm(value)
      )
        return true;
      if (rule.within.length === 0 && prelude === COVERS && COVERS_BODY[name] === norm(value))
        return true;
      return false;
    };
    const stray = [...all, ...styles].flatMap((rule) =>
      declarationList(rule.body)
        .filter(([name, value]) => name in EXPECTED && !allowed(rule, name, value))
        .map(([name, value]) => `${rule.where} { ${name}: ${norm(value)} }`),
    );
    expect(stray).toEqual([]);
  });

  it('the .astro walk reads real <style> blocks — the walk above is not vacuous', () => {
    // The pages and components carry a dozen scoped stylesheets; a
    // broken extractor would find no rules and the walk would pass on
    // anything.
    expect(styles.length).toBeGreaterThan(50);
    expect(styles.some((rule) => rule.where.startsWith('src/pages/images/[...id].astro'))).toBe(
      true,
    );
  });
});

describe('(c) the inherited motion reads the tokens (T1600, spec 018)', () => {
  const STATE = 'var(--dur-state) var(--ease-state)';
  const pins = [
    ['a:not(.brand, .button)', 'transition', `background-size ${STATE}, color ${STATE}`],
    ['.site-header', 'transition', `transform ${STATE}`],
    ['.button', 'transition', `background ${STATE}, border-color ${STATE}, color ${STATE}`],
    ['.social-links a', 'transition', `border-color ${STATE}, color ${STATE}`],
    [
      '.hero > *',
      'animation',
      'keel-enter calc(var(--dur-move) * var(--hero-enter)) var(--ease-state) both',
    ],
    [
      '.hero > :nth-child(2)',
      'animation-delay',
      'calc(var(--hero-stagger) * 1 * var(--hero-enter))',
    ],
    [
      '.hero > :nth-child(3)',
      'animation-delay',
      'calc(var(--hero-stagger) * 2 * var(--hero-enter))',
    ],
    [
      '.hero > :nth-child(4)',
      'animation-delay',
      'calc(var(--hero-stagger) * 3 * var(--hero-enter))',
    ],
  ];

  for (const [selector, property, value] of pins)
    it(`${selector} { ${property} } reads the tokens — a literal restored fails naming the rule`, () => {
      const rule = ruleFor(top, selector, property);
      expect([selector, property, declarations(rule.body)[property]]).toEqual([
        selector,
        property,
        value,
      ]);
    });

  it('the header is its own view-transition group — chrome never blends with the page', () => {
    const rule = ruleFor(top, '.site-header', 'transition');
    expect(declarations(rule.body)['view-transition-name']).toBe('site-header');
  });

  it("keel-enter's keyframes are unchanged — the feel is the tokens', not a new motion", () => {
    const keel = blocks(css).filter((block) => norm(block.prelude) === '@keyframes keel-enter');
    expect(keel).toHaveLength(1);
    expect(
      blocks(keel[0].body).map((step) => [norm(step.prelude), declarations(step.body)]),
    ).toEqual([
      ['from', { opacity: '0', transform: 'translateY(0.75rem)' }],
      ['to', { opacity: '1', transform: 'translateY(0)' }],
    ]);
  });

  const exact = [
    [
      '::view-transition-group(*)',
      {
        'animation-duration': 'var(--dur-state)',
        'animation-timing-function': 'var(--ease-state)',
      },
    ],
    [
      'html[data-moving]::view-transition-group(*)',
      { 'animation-duration': 'var(--dur-move)', 'animation-timing-function': 'var(--ease-move)' },
    ],
    [
      '::view-transition-old(*), ::view-transition-new(*)',
      { 'animation-timing-function': 'inherit' },
    ],
    [COVERS, COVERS_BODY],
  ];

  for (const [prelude, body] of exact)
    it(`${prelude} is exactly its plan.md rule, once`, () => {
      const found = top.filter((rule) => preludeOf(rule.prelude) === prelude);
      expect([prelude, found.map((rule) => declarations(rule.body))]).toEqual([prelude, [body]]);
    });
});

describe('(d) reduced motion keeps the fades and drops the movement (T1600, spec 018)', () => {
  const reduced = () => {
    const found = blocks(css).filter((block) => norm(block.prelude) === REDUCED);
    expect(found).toHaveLength(1);
    return found[0];
  };

  it('the block holds exactly the four rules — a fifth, a missing one or a changed one fails', () => {
    expect(
      blocks(reduced().body).map((rule) => ({
        prelude: preludeOf(rule.prelude),
        body: declarations(rule.body),
      })),
    ).toEqual(REDUCED_RULES);
  });

  it('no prelude in it is the * blanket', () => {
    const universal = blocks(reduced().body)
      .flatMap((rule) => splitTop(rule.prelude).map(norm))
      .filter((selector) => selector.startsWith('*'));
    expect(universal).toEqual([]);
  });

  it('no declaration in it carries 1ms or scroll-behavior', () => {
    const body = reduced().body;
    const found = blocks(body).flatMap((rule) =>
      declarationList(rule.body)
        .filter(([name, value]) => /\b1ms\b/.test(value) || name === 'scroll-behavior')
        .map(([name, value]) => `${preludeOf(rule.prelude)} { ${name}: ${norm(value)} }`),
    );
    expect(found).toEqual([]);
  });

  it('no rule in it zeroes a fade — an opacity transition, or the appearance animation save by the --rm-appear product', () => {
    // A selector whose own transition (outside the block) names opacity
    // is a fade; the appearance animation is img[data-shown=…]. Under
    // reduced motion neither may be given a zero duration.
    const fades = top
      .filter((rule) => {
        const own = declarations(rule.body);
        return /\bopacity\b/.test(`${own.transition ?? ''} ${own['transition-property'] ?? ''}`);
      })
      .flatMap((rule) => splitTop(rule.prelude).map(norm));
    const zero = /(^|[\s,(])0(s|ms)?(?=$|[\s,)])/;
    const DURATIONS = ['transition', 'transition-duration', 'animation', 'animation-duration'];
    const found = blocks(reduced().body).flatMap((rule) => {
      const selectors = splitTop(rule.prelude).map(norm);
      const own = declarations(rule.body);
      const zeroed = DURATIONS.filter((name) => name in own && zero.test(own[name]));
      const onFade = selectors.some(
        (selector) => fades.includes(selector) || selector.startsWith('img[data-shown'),
      );
      const appearance = selectors.some((selector) => selector.startsWith('img[data-shown'));
      const problems = [];
      if (onFade && zeroed.length > 0)
        problems.push(`${preludeOf(rule.prelude)} zeroes ${zeroed.join(', ')}`);
      if (
        appearance &&
        'animation-duration' in own &&
        own['animation-duration'] !== 'calc(var(--dur-appear) * var(--rm-appear))'
      )
        problems.push(
          `${preludeOf(rule.prelude)} { animation-duration: ${own['animation-duration']} }`,
        );
      return problems;
    });
    expect(found).toEqual([]);
  });
});
