import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { blocks, uncomment } from './src/lib/ground.ts';
import {
  FRAME_HOSTS,
  FRAME_IMG,
  MOTION_TOKENS,
  arrivalSteps,
  arrives,
  edge,
  holdShown,
  ms,
  shown,
  shownKey,
} from './src/lib/motion.ts';
import { scanMotion } from './src/lib/motion-scan.mjs';

// The motion grammar (spec 018, T1600): three durations, two curves,
// and the flags and numbers the tuning envelope names — twenty custom
// properties on :root, declared once, read by every transition and
// animation on the site. The rule: motion answers the reader.
//
// Nine kinds of guard here, (a)–(i), because nine different things can
// go wrong (the literal scan (b) and the built-output barrier (e) are
// T1601's, the module (f) T1602's, the hidden state (g) T1603's, the
// way back (h) T1604b's, the quiet view (i) T1605's):
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
//     and the page change's rules (the three group rules — the header's
//     own among them — the old/new timing-function inherit, the covers'
//     switch), each by string.
//     Whitespace-normalised, because Prettier wraps long lists.
//
// (d) Reduced motion keeps the fades and drops the movement. The
//     one-millisecond blanket is gone and the block holds exactly the
//     five rules plan.md names: a `*` prelude, a `1ms`, a
//     `scroll-behavior`, a sixth rule or a changed one fails, and so
//     does a zero laid on a fade — an opacity transition or the
//     appearance animation — other than the --rm-appear product. The
//     fifth (D1604, Q1) is pinned by name: every view-transition group
//     loses its animation, and no duration is declared on the old and
//     new images there, so each cross-fade keeps its length.
//
// (b) No literal duration or curve outside the token block. scanMotion
//     (src/lib/motion-scan.mjs) over global.css and every .astro <style>
//     block finds nothing — a literal names its file and line — and no
//     .astro file uses Astro's `transition:` directives (Astro would
//     inject its own literal-duration animations for one) or `autoplay`.
//
// (e) The barrier fails on the built output. scripts/check-motion.mjs
//     over fixture directories: a literal in a built stylesheet or a
//     page's <style>, a motion attribute, `autoplay`, or an inline
//     view-transition-name each exit 1 naming the file; the same names in
//     rule and script text only, and pagefind's own stylesheet, do not.
//
// (f) The module (T1602). src/lib/motion.ts's `ms` reads a CSS time
//     as milliseconds; its `MOTION_TOKENS` — what the dev panel builds
//     its rows from — names exactly the grammar's twenty; `FRAME_IMG` is
//     each frame host's direct `img`. And the arrival rule (T1605a): a
//     unit arrives when the threshold's share of it is in view, or, too
//     tall for that, the threshold's share of the viewport's height —
//     never at its first pixel — and the observer's steps keep a tall
//     unit reporting. And the edge a unit crossed (T1606b, D1606b):
//     `bottom` or `top` by the one edge of the viewport clipping it, and
//     for a unit wholly in view (a jump) the side it was last seen off
//     on — never a "side", so a fullbleed clipped sideways by a
//     scrollbar still rises from where it came (D1606 follow-up, 2).
//
// (g) The hidden state is the script's (T1603). Every rule in global.css
//     that sets `opacity: 0` sits under `html[data-motion]` — the root
//     attribute only the layout's inline script writes — or inside a
//     @keyframes block, so without script no photograph is hidden. The
//     gate's `:is(...)` list is `FRAME_HOSTS`, the one list spelled
//     twice. No markup the site ships writes the motion attributes, and
//     the markup hooks the script leans on — the transform's two class
//     literals, the piece row's cover box — are still there. The
//     travel's understudy and slide rules (T1604) sit under their
//     transient attributes, which no markup writes either. The layout
//     binds the appearance's after-swap hook after the way back's
//     scroll and before the lastY line (T1605a), so appear() reads
//     where the page lands.
//
// (h) The way back holds what the reader saw (T1604b). A frame shown
//     with its file is keyed on its page, the viewport and the three
//     attributes a candidate is chosen from; holdShown makes eager only
//     a frame in the new document on a held key — the same photograph
//     at another `sizes`, page or viewport stays lazy.
//
// (i) The quiet view's resting rules are `main`'s (T1605). The image
//     page's chrome-hiding list and its dark ground equal `main`'s
//     strings, pasted; the page's <style> declares no transition at all
//     — the quiet view moves as one view change now, and a background
//     fade beneath it would fight the snapshot cross-fade.

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

/** plan.md's "Reduced motion": the five rules, preludes and bodies. */
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
  // D1604, Q1: a deliberate fifth — the groups land at once.
  { prelude: '::view-transition-group(*)', body: { 'animation-name': 'none' } },
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

/** The first `:is(...)` list of a prelude, from `:is(` to its matching
 *  `)`, split at depth 0 and each entry normalised. */
function isList(prelude) {
  const text = norm(prelude);
  const at = text.indexOf(':is(');
  expect(at).toBeGreaterThan(-1);
  let depth = 0;
  let end = at + 3;
  for (; end < text.length; end += 1) {
    if (text[end] === '(') depth += 1;
    else if (text[end] === ')' && --depth === 0) break;
  }
  return splitTop(text.slice(at + 4, end)).map(norm);
}

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
      'html[data-moving]::view-transition-group(site-header)',
      {
        'animation-duration': 'var(--dur-state)',
        'animation-timing-function': 'var(--ease-state)',
      },
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

  it('the block holds exactly the five rules — a sixth, a missing one or a changed one fails', () => {
    expect(
      blocks(reduced().body).map((rule) => ({
        prelude: preludeOf(rule.prelude),
        body: declarations(rule.body),
      })),
    ).toEqual(REDUCED_RULES);
  });

  it('every view-transition group loses its animation, and no old/new duration is declared — the cross-fades keep their length (D1604, Q1)', () => {
    const inBlock = blocks(reduced().body);
    const group = inBlock.filter(
      (rule) => preludeOf(rule.prelude) === '::view-transition-group(*)',
    );
    expect(group.map((rule) => declarations(rule.body)['animation-name'])).toEqual(['none']);
    const oldNew = inBlock.flatMap((rule) =>
      splitTop(rule.prelude)
        .map(norm)
        .filter((selector) => /::view-transition-(old|new)\(/.test(selector))
        .flatMap((selector) =>
          ['animation', 'animation-duration']
            .filter((name) => name in declarations(rule.body))
            .map((name) => `${selector} { ${name} }`),
        ),
    );
    expect(oldNew).toEqual([]);
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

describe('(b) no literal duration or curve outside the token block (T1601, spec 018)', () => {
  const cases = [
    ['transition: color 180ms ease', ['180ms', 'ease']],
    ['transition: color var(--dur-state) var(--ease-state)', []],
    ['animation: k calc(var(--dur-move) * var(--hero-enter)) var(--ease-state) both', []],
    ['animation: k var(--d) infinite', ['infinite']],
    ['animation-iteration-count: 3', ['3']],
    ['animation-delay: 90ms', ['90ms']],
    ['transition-duration: 0s', []],
  ];
  for (const [declaration, findings] of cases)
    it(`\`${declaration}\` -> ${JSON.stringify(findings)}`, () => {
      expect(scanMotion(`a {\n  ${declaration};\n}`).map((one) => one.findings)).toEqual(
        findings.length > 0 ? [findings] : [],
      );
    });

  it('minified `a{transition:color 180ms}` -> ["180ms"], on line 1', () => {
    expect(scanMotion('a{transition:color 180ms}', 'x.css')).toEqual([
      { file: 'x.css', line: 1, declaration: 'transition: color 180ms', findings: ['180ms'] },
    ]);
  });

  it('global.css scans clean', async () => {
    const path = 'src/styles/global.css';
    expect(scanMotion(await readFile(here(`./${path}`), 'utf8'), path)).toEqual([]);
  });

  it('every <style> block of every src/**/*.astro scans clean — a literal names its file and line', async () => {
    const found = [];
    let scanned = 0;
    for (const [path, text] of Object.entries(await astroFiles()))
      for (const match of text.matchAll(/^<style\b[^>]*>([\s\S]*?)^<\/style>/gm)) {
        scanned += 1;
        // The line the block's contents start on, within the .astro file.
        const start = text.slice(0, match.index).split('\n').length;
        for (const one of scanMotion(match[1], path))
          found.push(
            `${one.file}:${start + one.line - 1}: ${one.declaration} — ${one.findings.join(', ')}`,
          );
      }
    expect(scanned).toBeGreaterThan(10);
    expect(found).toEqual([]);
  });

  it('no .astro file uses a transition: directive or autoplay', async () => {
    const found = Object.entries(await astroFiles()).flatMap(([path, text]) => [
      ...(/\stransition:(name|animate|persist)\b/.test(text) ? [`${path}: transition:`] : []),
      ...(text.includes('autoplay') ? [`${path}: autoplay`] : []),
    ]);
    expect(found).toEqual([]);
  });
});

describe('(e) the barrier fails on the built output (T1601, spec 018)', () => {
  const barrier = here('./scripts/check-motion.mjs');
  let root;

  const run = (dir) => {
    try {
      return {
        status: 0,
        stdout: execFileSync(process.execPath, [barrier, dir], { encoding: 'utf8' }),
        stderr: '',
      };
    } catch (error) {
      return { status: error.status, stdout: error.stdout, stderr: error.stderr };
    }
  };

  /** A fixture dir under `root`: `files` maps a relative path to its text. */
  const fixture = (name, files) => {
    const dir = join(root, name);
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), text);
    }
    return dir;
  };

  const page = (head, body) =>
    `<!doctype html>\n<html><head>${head}</head><body>${body}</body></html>\n`;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'motion-barrier-'));
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('a built stylesheet carrying 220ms exits 1 naming the file and "220ms"', () => {
    const dir = fixture('css', {
      '_astro/x.css': 'a{color:red}.b{transition:transform 220ms var(--ease-state)}',
      'index.html': page('', '<p>x</p>'),
    });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `[check-motion] literal motion in ${join(dir, '_astro', 'x.css')}`,
    );
    expect(result.stderr).toContain('"220ms"');
  });

  it('a page with data-shown on an img exits 1 naming the file', () => {
    const dir = fixture('shown', {
      'pieces/x/index.html': page('', '<img src="a.jpg" data-shown="">'),
    });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `[check-motion] a frame hidden by default in ${join(dir, 'pieces', 'x', 'index.html')}: data-shown`,
    );
  });

  it('a page with <video autoplay> exits 1 naming the file', () => {
    const dir = fixture('autoplay', {
      'index.html': page('', '<video autoplay src="a.mp4"></video>'),
    });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(join(dir, 'index.html'));
    expect(result.stderr).toContain(': autoplay');
  });

  it('a page whose <style> carries ease exits 1 naming the file', () => {
    const dir = fixture('inline', {
      'index.html': page('<style>a{transition:color var(--dur-state) ease}</style>', '<p>x</p>'),
    });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`[check-motion] literal motion in ${join(dir, 'index.html')}`);
    expect(result.stderr).toContain('"ease"');
  });

  it('a figure with an inline view-transition-name exits 1 naming the file', () => {
    const dir = fixture('named', {
      'index.html': page(
        '',
        '<figure style="view-transition-name: photograph"><img src="a.jpg"></figure>',
      ),
    });
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `[check-motion] an inline transition name in ${join(dir, 'index.html')}: view-transition-name`,
    );
  });

  it('data-shown and view-transition-name in <style> and <script> text only exit 0', () => {
    const dir = fixture('text-only', {
      'index.html': page(
        "<style>img[data-shown='fade']{animation:appear var(--dur-appear) var(--ease-state) both}.stage{view-transition-name:photograph}</style>",
        '<p>x</p><script>img.setAttribute("data-shown", "fade"); el.style="view-transition-name: photograph"; const autoplay = 0;</script>',
      ),
    });
    const result = run(dir);
    expect([result.status, result.stderr]).toEqual([0, '']);
  });

  it("a clean dir exits 0 with the summary line — pagefind's stylesheet and pages, full of literals, are not read", () => {
    const dir = fixture('clean', {
      '_astro/site.css': 'a{transition:color var(--dur-state) var(--ease-state)}',
      'index.html': page('<style>.x{transition-duration:0s}</style>', '<img src="a.jpg">'),
      'pagefind/pagefind-ui.css':
        '.pagefind-ui__result{transition:opacity .3s ease-in-out;animation:spin 1s linear infinite}',
      'pagefind/index.html': page(
        '<style>.p{transition:opacity 300ms ease}</style>',
        '<img data-shown="" src="a.jpg"><video autoplay></video>',
      ),
    });
    const result = run(dir);
    expect([result.status, result.stderr]).toEqual([0, '']);
    expect(result.stdout).toContain(
      '[check-motion] no literal duration or curve in 2 stylesheets; no hidden frame, inline transition name or autoplay in 1 pages.',
    );
  });
});

describe('(f) the module (T1602, spec 018)', () => {
  it('ms: `480ms` -> 480, `.5s` -> 500, anything else -> 0', () => {
    expect([ms('480ms'), ms('.5s'), ms('ease')]).toEqual([480, 500, 0]);
  });

  it("MOTION_TOKENS names exactly EXPECTED's twenty — a token missing from the panel or a stray one fails", () => {
    expect(MOTION_TOKENS.map((entry) => entry.name).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it('FRAME_IMG is the six hosts, each `> img`, comma-joined', () => {
    expect(FRAME_IMG).toBe(
      '.image-link > img, .image-frame > img, .piece-block > img, .piece-block figure > img, .piece-strip-scroll > img, .note-cover > img',
    );
  });

  // An entry as IntersectionObserver reports it, over an 800px viewport.
  const entry = (ratio, visible, height = visible / ratio, root = { height: 800 }) => ({
    isIntersecting: ratio > 0,
    intersectionRatio: ratio,
    intersectionRect: { height: visible },
    boundingClientRect: { height },
    rootBounds: root,
  });

  it('arrives: not at the first pixel — a 400px unit 5% in view has not arrived at 0.15 (T1605a, B1)', () => {
    expect(arrives(entry(0.05, 20), 0.15)).toBe(false);
    expect(arrives(entry(0.15, 60), 0.15)).toBe(true);
  });

  it('arrives: a higher threshold arrives later — 30% in view has arrived at 0.15, not at 0.5', () => {
    expect([arrives(entry(0.3, 120), 0.15), arrives(entry(0.3, 120), 0.5)]).toEqual([true, false]);
  });

  it('arrives: a unit too tall to reach the share arrives at the share of the viewport height', () => {
    // A 3000px unit at 0.5: at most 800/3000 of it can show. 399px in view
    // (0.133 of it) is short of half the viewport; 400px is not.
    expect(arrives(entry(399 / 3000, 399, 3000), 0.5)).toBe(false);
    expect(arrives(entry(400 / 3000, 400, 3000), 0.5)).toBe(true);
  });

  it('arrives: a tall unit that can reach the share waits for it — not the viewport-height rule', () => {
    // A 1300px unit at 0.5 can show 650px of itself in 800: 500px in view
    // (0.385 of it) is past half the viewport but short of half the unit.
    expect(arrives(entry(500 / 1300, 500, 1300), 0.5)).toBe(false);
    expect(arrives(entry(0.5, 650, 1300), 0.5)).toBe(true);
  });

  it('arrives: never when not intersecting, even at a zero threshold', () => {
    expect(arrives(entry(0, 0), 0)).toBe(false);
  });

  it('arrivalSteps: 0 to 1 by 0.05, plus the threshold, sorted, once each', () => {
    const steps = arrivalSteps(0.33);
    expect(steps).toHaveLength(22);
    expect([steps[0], steps[1], steps[7], steps[8], steps.at(-1)]).toEqual([
      0, 0.05, 0.33, 0.35, 1,
    ]);
    // A threshold on a step is not listed twice.
    expect(arrivalSteps(0.15)).toHaveLength(21);
    expect(arrivalSteps(0.15)).toContain(0.15);
  });

  // A 400px-tall, 1000px-wide unit over an 800px viewport, `top` its
  // box's top edge and `seen` the intersection's width and height.
  const crossing = (top, seen) => ({
    boundingClientRect: { top, height: 400, width: 1000 },
    intersectionRect: seen,
    rootBounds: { top: 0, height: 800 },
  });

  it("edge: a 400px unit 25% in at the viewport's foot crossed the bottom, whatever side it was last on (T1606b)", () => {
    expect(edge(crossing(700, { height: 100, width: 1000 }), 'top')).toBe('bottom');
  });

  it("edge: the same unit 25% in at the viewport's head crossed the top, whatever side it was last on", () => {
    expect(edge(crossing(-300, { height: 100, width: 1000 }), 'bottom')).toBe('top');
  });

  it('edge: a unit wholly in view, its width clipped by 15px (a scrollbar), comes from where it was last — bottom, never a side', () => {
    expect(edge(crossing(350, { height: 400, width: 985 }), 'bottom')).toBe('bottom');
  });

  it("edge: a unit wholly in view after a jump comes from where it was last — last 'top' gives top (D1606b)", () => {
    expect(edge(crossing(350, { height: 400, width: 985 }), 'top')).toBe('top');
  });
});

describe("(g) the hidden state is the script's (T1603, spec 018)", () => {
  const GATE = /^html\[data-motion\]/;

  it('every rule setting opacity: 0 has a prelude beginning html[data-motion], or sits in @keyframes', () => {
    const hiding = all.filter((rule) =>
      declarationList(rule.body).some(([name, value]) => name === 'opacity' && norm(value) === '0'),
    );
    // The gate and the two keyframes' `from` at least — the walk is not
    // vacuous.
    expect(hiding.length).toBeGreaterThanOrEqual(3);
    const stray = hiding
      .filter(
        (rule) =>
          !rule.within.some((at) => at.startsWith('@keyframes')) &&
          !splitTop(rule.prelude).every((selector) => GATE.test(norm(selector))),
      )
      .map((rule) => rule.where);
    expect(stray).toEqual([]);
  });

  it("the gate rule's :is(...) list, split and normalised, equals FRAME_HOSTS", () => {
    const gate = top.filter(
      (rule) =>
        GATE.test(norm(rule.prelude)) &&
        declarationList(rule.body).some(([name, value]) => name === 'opacity' && value === '0'),
    );
    expect(gate).toHaveLength(1);
    expect(isList(gate[0].prelude)).toEqual(FRAME_HOSTS);
  });

  it("the waiting fill's hosts equal FRAME_HOSTS, and it paints only while an image waits or fades — never under a rise (T1606d)", () => {
    const fill = top.filter(
      (rule) => declarations(rule.body)['background-color'] === 'var(--wait-fill)',
    );
    expect(fill).toHaveLength(1);
    const prelude = norm(fill[0].prelude);
    expect(prelude.startsWith('html[data-motion]:not([data-quiet]) :is(')).toBe(true);
    expect(isList(prelude)).toEqual(FRAME_HOSTS);
    // `)` then `:has(` with no space: the fill is on the host itself, not
    // on a descendant of one.
    expect(prelude.endsWith("):has(> img:is(:not([data-shown]), [data-shown='fade']))")).toBe(
      true,
    );
  });

  it('no .astro file, the transform, or content file writes a motion attribute in markup', async () => {
    // The allowed spellings are the scripts' writes, through `dataset`:
    // the layout's inline gate (`document.documentElement.dataset.motion
    // = ''`), and src/lib/motion.ts's `dataset.shown`, `dataset.motion`,
    // `dataset.moving` and `dataset.understudy`, and the layout's travel
    // (`dataset.moving`, `dataset.understudy`, `dataset.slide`) — none
    // of which is the hyphenated attribute this scan looks for.
    const ATTR = /data-(motion|shown|moving|understudy|slide)\b/;
    const texts = { ...(await astroFiles()) };
    texts['remark-pieces-blocks.mjs'] = await readFile(here('./remark-pieces-blocks.mjs'), 'utf8');
    const content = async (dir) => {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) await content(path);
        else if (!/\.(jpe?g|png|webp|avif|gif|tiff?|heic)$/i.test(entry.name))
          texts[path.slice(here('./').length)] = await readFile(path, 'utf8');
      }
    };
    await content(here('./src/content'));
    expect(Object.keys(texts).some((path) => path.startsWith('src/content/'))).toBe(true);
    expect(Object.keys(texts).filter((path) => ATTR.test(texts[path]))).toEqual([]);
    // The gate itself is there, in its allowed spelling.
    expect(texts['src/layouts/BaseLayout.astro']).toContain(
      "document.documentElement.dataset.motion = '';",
    );
  });

  it('the understudy and the slide rules sit under their transient attributes (T1604)', () => {
    // The two attributes the travel's script writes for the length of a
    // transition — never in markup, which the walk above proves — so
    // without script neither rule can apply.
    const understudy = top.filter((rule) => 'background-image' in declarations(rule.body));
    const painting = understudy.filter(
      (rule) => declarations(rule.body)['background-image'] === 'var(--understudy)',
    );
    expect(painting).toHaveLength(1);
    expect(
      splitTop(painting[0].prelude).every((one) => norm(one).includes('[data-understudy]')),
    ).toBe(true);
    const sliding = top.filter((rule) => /motion-slide-(in|out)\b/.test(rule.body));
    const directed = top.filter((rule) => '--dir' in declarations(rule.body));
    expect(sliding).toHaveLength(2);
    expect(directed).toHaveLength(2);
    const stray = [...sliding, ...directed]
      .filter((rule) => !splitTop(rule.prelude).every((one) => norm(one).includes('[data-slide')))
      .map((rule) => rule.where);
    expect(stray).toEqual([]);
  });

  it("the appearance's after-swap hook is bound after the way back's scroll and before lastY (T1605a, B3)", async () => {
    const source = await readFile(here('./src/layouts/BaseLayout.astro'), 'utf8');
    const at = (text) => {
      const found = source.split(text).length - 1;
      expect([text, found]).toEqual([text, 1]);
      return source.indexOf(text);
    };
    // The hook, the way back's scroll and the lastY line, each once, as
    // after-swap listeners — and the hook bound nowhere else.
    const hook = at("'astro:after-swap', () => {\n        teardown = appear(document);");
    const scroll = at("landing.scrollIntoView({ block: 'center', behavior: 'instant' });");
    const last = at("'astro:after-swap', () => {\n        lastY = window.scrollY;");
    expect(source.split('teardown = appear(document)').length - 1).toBe(2);
    expect([scroll < hook, hook < last]).toEqual([true, true]);
  });

  it("the transform's source still carries the two class literals the hooks lean on", async () => {
    const source = await readFile(here('./remark-pieces-blocks.mjs'), 'utf8');
    expect(source).toContain("'image-link'");
    expect(source).toContain("'piece-block'");
  });

  it("PieceList.astro wraps its cover in span.note-cover — the row cover's waiting box", async () => {
    const source = await readFile(here('./src/components/PieceList.astro'), 'utf8');
    expect(source).toContain('class="note-cover"');
  });
});

describe('(h) the way back holds what the reader saw (T1604b, spec 018)', () => {
  // No DOM in this suite: the fixture is parsed into minimal elements —
  // each `<img>` tag's attributes, readable and writable — and the
  // document's querySelectorAll answers only FRAME_IMG, so holdShown
  // asking for anything else fails here.
  const parse = (html) => {
    const images = [...html.matchAll(/<img\b([^>]*)>/g)].map(([, attrs]) => {
      const map = new Map([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]));
      return {
        dataset: {},
        parentElement: null,
        complete: false,
        naturalWidth: 0,
        getAttribute: (name) => map.get(name) ?? null,
        setAttribute: (name, value) => map.set(name, String(value)),
      };
    });
    return {
      images,
      doc: {
        querySelectorAll(selector) {
          if (selector !== FRAME_IMG) throw new Error(`unexpected selector ${selector}`);
          return images;
        },
      },
    };
  };
  const SET = '/_astro/a-640.webp 640w, /_astro/a-1080.webp 1080w';
  const FIXTURE = `
    <a class="image-link" href="/images/g/a/"><img src="/_astro/a.jpg" srcset="${SET}" sizes="50vw" loading="lazy"></a>
    <a class="image-link" href="/images/g/b/"><img src="/_astro/b.jpg" srcset="" sizes="50vw" loading="lazy"></a>
    <a class="image-link" href="/images/g/c/"><img src="/_astro/c.jpg" srcset="" sizes="50vw" loading="lazy"></a>
    <a class="image-link" href="/images/g/d/"><img src="/_astro/d.jpg" srcset="" sizes="50vw" loading="lazy"></a>`;
  const at = (pathname, width, height, ratio) => {
    vi.stubGlobal('location', { pathname });
    vi.stubGlobal('innerWidth', width);
    vi.stubGlobal('innerHeight', height);
    vi.stubGlobal('devicePixelRatio', ratio);
  };
  const loading = (html, pathname) => {
    const { images, doc } = parse(html);
    holdShown(doc, pathname);
    return images.map((img) => img.getAttribute('loading'));
  };
  const loaded = (img) => Object.assign(img, { complete: true, naturalWidth: 1600 });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('the key is `<pathname>|<innerWidth>x<innerHeight>x<devicePixelRatio>|<src>|<srcset>|<sizes>`', () => {
    at('/elsewhere/', 1512, 982, 2);
    const [a] = parse(FIXTURE).images;
    expect(shownKey('/galleries/g/', a)).toBe(`/galleries/g/|1512x982x2|/_astro/a.jpg|${SET}|50vw`);
    // An absent attribute reads as empty, not "null".
    const [bare] = parse('<img src="/_astro/z.jpg">').images;
    expect(shownKey('/p/', bare)).toBe('/p/|1512x982x2|/_astro/z.jpg||');
  });

  it('holdShown makes eager only a frame shown with its file, on that pathname, at that viewport', () => {
    at('/galleries/g/', 1512, 982, 2);
    const [a, , c, d] = parse(FIXTURE).images;
    // a: loaded and shown; b: never shown; c: shown before its load (the
    // appearance off); d: complete with no naturalWidth (a broken file).
    loaded(a);
    Object.assign(d, { complete: true, naturalWidth: 0 });
    for (const img of [a, c, d]) shown(img);
    expect([a, c, d].map((img) => img.dataset.shown)).toEqual(['', '', '']);

    // The same page at the same viewport: the one held frame is eager.
    expect(loading(FIXTURE, '/galleries/g/')).toEqual(['eager', 'lazy', 'lazy', 'lazy']);
    // Another pathname: untouched.
    expect(loading(FIXTURE, '/pieces/p/')).toEqual(['lazy', 'lazy', 'lazy', 'lazy']);
    // Another width, height or pixel ratio: untouched.
    for (const [w, h, r] of [
      [1280, 982, 2],
      [1512, 1440, 2],
      [1512, 982, 1],
    ]) {
      at('/galleries/g/', w, h, r);
      expect(loading(FIXTURE, '/galleries/g/')).toEqual(['lazy', 'lazy', 'lazy', 'lazy']);
    }
  });

  // The fog piece's case: one photograph, a block frame and a full-bleed
  // frame, the same src and srcset at different sizes.
  const TWICE = (second) => `
    <a class="image-link" href="/images/f/x/"><img src="/_astro/x.jpg" srcset="/_astro/x-750.webp 750w, /_astro/x-1668.webp 1668w" sizes="(min-width: 1240px) 670px, 94vw" loading="lazy"></a>
    <a class="image-link" href="/images/f/x/"><img src="/_astro/x.jpg" srcset="/_astro/x-750.webp 750w, /_astro/x-1668.webp 1668w" sizes="${second}" loading="lazy"></a>`;

  it('same src, different sizes: only the placement shown is held', () => {
    at('/pieces/twice/', 1512, 982, 1);
    const [block] = parse(TWICE('100vw')).images;
    shown(loaded(block));
    expect(loading(TWICE('100vw'), '/pieces/twice/')).toEqual(['eager', 'lazy']);
  });

  it('identical attributes: both held', () => {
    at('/pieces/twice-again/', 1512, 982, 1);
    const [block] = parse(TWICE('(min-width: 1240px) 670px, 94vw')).images;
    shown(loaded(block));
    expect(loading(TWICE('(min-width: 1240px) 670px, 94vw'), '/pieces/twice-again/')).toEqual([
      'eager',
      'eager',
    ]);
  });
});

describe("(i) the quiet view's resting rules are main's (T1605, spec 018)", () => {
  // Pasted from `main`'s src/pages/images/[...id].astro: the quiet view
  // moves as one view change now, and the states it moves between are
  // the same states, byte for byte (normalised for Prettier).
  const PAGE = 'src/pages/images/[...id].astro';
  const MAIN = [
    [
      ':global(html[data-quiet]) :global(.site-header), :global(html[data-quiet]) :global(.site-footer), :global(html[data-quiet]) .frame-nav, :global(html[data-quiet]) .image-head, :global(html[data-quiet]) .image-body, :global(html[data-quiet]) .quiet-toggle',
      [['display', 'none']],
    ],
    [
      ':global(html[data-quiet]), :global(html[data-quiet] body)',
      [['background', 'var(--color-quiet)']],
    ],
  ];
  let page;

  beforeAll(async () => {
    const blocks = styleBlocks(await readFile(here(`./${PAGE}`), 'utf8'));
    page = { text: blocks.join('\n'), rules: blocks.flatMap((block) => rules(block)) };
  });

  for (const [prelude, body] of MAIN)
    it(`\`${prelude.slice(0, 48)}…\` is main's rule`, () => {
      const found = page.rules.filter(
        (rule) => rule.within.length === 0 && preludeOf(rule.prelude) === prelude,
      );
      expect(found.length).toBe(1);
      expect(declarationList(found[0].body).map(([name, value]) => [name, norm(value)])).toEqual(
        body,
      );
    });

  it("the page's <style> declares no transition and carries no 220ms", () => {
    expect(page.rules.length).toBeGreaterThan(10);
    const found = page.rules.flatMap((rule) =>
      declarationList(rule.body)
        .filter(([name]) => name.startsWith('transition'))
        .map(([name, value]) => `${rule.where}: ${name}: ${value}`),
    );
    expect(found).toEqual([]);
    expect(page.text).not.toContain('220ms');
  });
});
