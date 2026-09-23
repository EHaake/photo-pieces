import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { blocks, uncomment } from './src/lib/ground.ts';
import { FRAME_IMG, MOTION_TOKENS, ms } from './src/lib/motion.ts';
import { scanMotion } from './src/lib/motion-scan.mjs';

// The motion grammar (spec 018, T1600): three durations, two curves,
// and the flags and numbers the tuning envelope names — twenty custom
// properties on :root, declared once, read by every transition and
// animation on the site. The rule: motion answers the reader.
//
// Six kinds of guard here, because six different things can go wrong
// (the literal scan (b) and the built-output barrier (e) are T1601's,
// the module (f) T1602's):
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
//     each frame host's direct `img`.

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
});
