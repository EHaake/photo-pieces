import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  COMPARE,
  COMPARE_WORDING,
  noteIndex,
  openingMode,
  pickSlot,
  restView,
  sideFits,
  sidePair,
  sliderView,
  switchNext,
} from './src/lib/compare.ts';
import { blocks, uncomment } from './src/lib/ground.ts';
import { COMPARE_CLASSES, COMPARE_WIDTHS } from './src/lib/image-meta.mjs';
import { FRAME_HOSTS } from './src/lib/motion.ts';

// The compare block (spec 019). Two builders make its markup — the
// `:::compare` transform and the image page's "Raw to finished" section
// — and the build's barrier (scripts/check-private-files.mjs, scan 3)
// checks every built compare against one shape. These guards keep the
// sources honest between builds:
//
// (a) One shape, spelled once. The page builds every compare element
//     through COMPARE_CLASSES — no `class="compare…"` literal to drift —
//     and takes its width and `sizes` from COMPARE_WIDTH.page; every
//     COMPARE_CLASSES value and every width class has a rule in
//     global.css, the names' one other spelling (CSS cannot import); the
//     page's own <style> holds no compare rule, since a piece could not
//     reach it; and no compare class is a frame host, so the stage
//     images stay outside the appearance hooks.
//
// (b) The handle's tokens (T1708). `TOKENS` below is the handle's size
//     and shape, the tuning envelope's one place for them: each declared
//     once, in global.css's :root, at its value, and nowhere else in any
//     stylesheet; and the handle's rule reads both, so a token left
//     declared but unread fails too.
//
// (c) The compare's motion (T1708). Three rules and nothing else, each
//     by its string: the switch's arriving stage fading in over the
//     leaving one, a mode change's fade, and a snap's glide — spec 018's
//     state duration and curve and its motion-appear keyframes; no other
//     rule in the compare's section animates or transitions; `--split` is
//     registered as a number so the glide can run; and the script writes
//     `data-settling` only when motion is not reduced (the settle is a
//     movement), the two fades kept. And the legend and control rule by
//     its exact body (T1708a): the legend's shape is that rule.
//
// (d) The state (T1707). `EXPECTED` below is the tunables' one other
//     copy: every COMPARE key and value and COMPARE_WORDING, so a value
//     retyped in compare.ts alone fails naming its key, and a key added
//     or dropped fails the name set. The pure rules the enhanced block
//     reads, each case named for what fails it: the slider two-way
//     (T1709a) — one pair at every p, the divider at p — and the pair a
//     legend click picks as a table, every click on three and four
//     stages (a stage in the pair leaves it; another replaces the member
//     picked longer ago and becomes the newer; shown in stage order), and
//     every pair within two clicks of rest — and the side
//     pair, the switch's step with and without wrapping, the view at rest
//     per method and per rest pair, whose note shows, the side-by-side
//     fit, and the method a block opens in.
//     And the page's own words (T1708a): WORDING.compare, the section's
//     heading and the two labels, read from the page's source as literal
//     strings, and the template reading them from there.

/** The tunables and the words, verbatim as src/lib/compare.ts carries
 *  them: to retune, move the value in src/lib/compare.ts and here. */
const EXPECTED = {
  COMPARE: {
    defaultMode: 'slider',
    remember: 'visit',
    restAt: 0.5,
    restPair: 'ends',
    snap: false,
    sliderStep: 0.02,
    sideMinPx: 280,
    sideNarrow: 'stack',
    switchWraps: true,
    switchOnClick: true,
    switchKeys: [' ', 'Enter', 'ArrowRight'],
    switchBackKeys: ['ArrowLeft'],
    legend: 'below',
    control: 'with-legend',
    cornerTags: false,
    sideWidth: 'wide',
  },
  COMPARE_WORDING: {
    modes: { slider: 'Slider', side: 'Side by side', switch: 'Switch' },
    control: 'How to compare',
    legend: 'Stages',
    handle: 'Move between the stages',
    slots: { left: 'left', right: 'right' },
    next: 'next pick:',
  },
};

/** The handle's size and shape, verbatim as global.css's :root carries
 *  them: to retune, move the value there and here. */
const TOKENS = {
  '--compare-handle': '2.75rem',
  '--compare-handle-radius': '50%',
};

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const PAGE = 'src/pages/images/[...id].astro';

/** The CSS of a component's <style> blocks (as motion.test.mjs reads them). */
const styleBlocks = (text) =>
  [...text.matchAll(/^<style\b[^>]*>([\s\S]*?)^<\/style>/gm)].map((m) => uncomment(m[1]));
/** Every selector in `css` at any depth: the preludes of its brace blocks. */
const preludes = (css) =>
  blocks(css).flatMap(({ prelude, body }) =>
    prelude.startsWith('@') ? preludes(body) : [prelude],
  );
/** A class token in a selector, not a prefix of a longer one. */
const classIn = (name) => new RegExp(`\\.${name}(?![\\w-])`);
/** One line, one space, no padding inside parens. */
const norm = (text) =>
  text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
/** Every rule in `css`, @-blocks opened, with the @-preludes it sits
 *  under and its declarations as [name, value] pairs, in order. */
const rulesIn = (css, within = []) =>
  blocks(css).flatMap(({ prelude, body }) => {
    const rule = { prelude: norm(prelude), within, body };
    const nested = prelude.startsWith('@') ? rulesIn(body, [...within, norm(prelude)]) : [];
    return [rule, ...nested];
  });
const declarationPairs = (body) =>
  body
    .replace(/\{[^{}]*\}/g, '')
    .split(';')
    .filter((part) => part.includes(':'))
    .map((part) => [
      part.slice(0, part.indexOf(':')).trim(),
      norm(part.slice(part.indexOf(':') + 1)),
    ]);
/** The one top-level rule whose prelude is exactly `prelude`. */
const ruleAt = (rules, prelude) => {
  const found = rules.filter((rule) => rule.within.length === 0 && rule.prelude === prelude);
  expect([prelude, found.length]).toEqual([prelude, 1]);
  return Object.fromEntries(declarationPairs(found[0].body));
};
/** The compare's section of global.css, from its header to the Motion section's. */
const compareSection = (raw) => {
  const from = raw.indexOf('/* ---- The compare (spec 019)');
  const to = raw.indexOf('/* ---- Motion (spec 018)');
  expect([from > -1, to > from]).toEqual([true, true]);
  return uncomment(raw.slice(from, to));
};
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

let page;
let css;
let raw;
let script;

beforeAll(async () => {
  page = await readFile(here(`./${PAGE}`), 'utf8');
  raw = await readFile(here('./src/styles/global.css'), 'utf8');
  css = uncomment(raw);
  script = await readFile(here('./src/lib/compare.ts'), 'utf8');
});

describe('(a) one shape, spelled once', () => {
  it('the page builds every compare element through COMPARE_CLASSES, with no class literal', () => {
    const template = page.slice(page.indexOf('\n---', 3));
    for (const key of Object.keys(COMPARE_CLASSES)) {
      expect([key, template.includes(`COMPARE_CLASSES.${key}`)]).toEqual([key, true]);
    }
    expect(page).not.toMatch(/class="compare/);
    expect(page).not.toMatch(/class=\{?['"`]compare/);
  });

  it("the page's width class and sizes come from COMPARE_WIDTH.page", () => {
    expect(page).toContain('${COMPARE_CLASSES.root}-w-${COMPARE_WIDTH.page}');
    expect(page).toContain('sizes={compareSizes(COMPARE_WIDTH.page)}');
  });

  it('every COMPARE_CLASSES value and every width class has a rule in global.css', () => {
    const selectors = preludes(css);
    const names = [
      ...Object.values(COMPARE_CLASSES),
      ...COMPARE_WIDTHS.map((width) => `${COMPARE_CLASSES.root}-w-${width}`),
    ];
    for (const name of names) {
      expect([name, selectors.some((selector) => classIn(name).test(selector))]).toEqual([
        name,
        true,
      ]);
    }
  });

  it("the page's <style> holds no compare rule", () => {
    const styles = styleBlocks(page);
    expect(styles.length).toBeGreaterThan(0);
    const selectors = styles.flatMap(preludes);
    expect(selectors.length).toBeGreaterThan(0);
    expect(
      selectors.filter(
        (selector) => classIn(COMPARE_CLASSES.root).test(selector) || /\.compare-/.test(selector),
      ),
    ).toEqual([]);
  });

  it('no compare class is a frame host, so the stage images stay outside the appearance hooks', () => {
    expect(FRAME_HOSTS.filter((host) => /compare/.test(host))).toEqual([]);
  });
});

describe("(b) the handle's tokens (T1708)", () => {
  it(':root declares each of TOKENS once, at its value', () => {
    const declared = rulesIn(css)
      .filter((rule) => rule.within.length === 0 && rule.prelude === ':root')
      .flatMap((rule) => declarationPairs(rule.body))
      .filter(([name]) => name in TOKENS);
    expect(declared).toEqual(Object.entries(TOKENS));
  });

  it('no other rule in global.css or in any .astro <style> declares one', async () => {
    const styles = Object.entries(await astroFiles()).flatMap(([path, text]) =>
      styleBlocks(text).flatMap((block) =>
        rulesIn(block).map((rule) => ({ ...rule, prelude: `${path}: ${rule.prelude}` })),
      ),
    );
    const stray = [...rulesIn(css), ...styles]
      .filter((rule) => !(rule.within.length === 0 && rule.prelude === ':root'))
      .flatMap((rule) =>
        declarationPairs(rule.body)
          .filter(([name]) => name in TOKENS)
          .map(([name, value]) => `${rule.prelude} { ${name}: ${value} }`),
      );
    expect(stray).toEqual([]);
  });

  it("the handle's rule reads both: its size from --compare-handle, its shape from --compare-handle-radius", () => {
    const handle = ruleAt(rulesIn(css), '.compare[data-js] .compare-handle');
    expect([handle.width, handle.height, handle['border-radius']]).toEqual([
      'var(--compare-handle)',
      'var(--compare-handle)',
      'var(--compare-handle-radius)',
    ]);
  });
});

describe("(c) the compare's motion (T1708)", () => {
  const STATE = 'var(--dur-state) var(--ease-state)';
  const MOTION = [
    [
      ".compare[data-view='switch'] .compare-stage[data-part='in']",
      { 'z-index': '1', animation: `motion-appear ${STATE} both` },
    ],
    ['.compare[data-fresh] .compare-pane', { animation: `motion-appear ${STATE} both` }],
    ['.compare[data-settling]', { transition: `--split ${STATE}` }],
  ];

  for (const [prelude, body] of MOTION)
    it(`${prelude} is exactly ${JSON.stringify(body)} — a literal, a new token or a changed curve fails`, () => {
      expect(ruleAt(rulesIn(css), prelude)).toEqual(body);
    });

  it("no other rule in the compare's section animates or transitions — the three are all its motion", () => {
    const moving = rulesIn(compareSection(raw))
      .filter((rule) =>
        declarationPairs(rule.body).some(([name]) => /^(animation|transition)/.test(name)),
      )
      .map((rule) => rule.prelude);
    expect(moving).toEqual(MOTION.map(([prelude]) => prelude));
  });

  it('--split is registered as a number, inherited, at 50 — so the glide can run', () => {
    const found = rulesIn(css).filter((rule) => rule.prelude === '@property --split');
    expect(found.length).toEqual(1);
    expect(Object.fromEntries(declarationPairs(found[0].body))).toEqual({
      syntax: "'<number>'",
      inherits: 'true',
      'initial-value': '50',
    });
  });

  it('the script writes data-settling only behind !reducedMotion() — the settle is a movement', () => {
    const writes = script.split('\n').filter((line) => /dataset\.settling\s*=/.test(line));
    expect(writes.length).toBeGreaterThan(0);
    expect(writes.filter((line) => !/if \(!reducedMotion\(\)\)/.test(line))).toEqual([]);
  });

  it('the legend, hint and control rule is exactly its shape (T1708a, T1709d) — the legend\'s round edits it and this string', () => {
    expect(
      ruleAt(
        rulesIn(css),
        '.compare[data-js] .compare-legend, .compare[data-js] .compare-hint, .compare[data-js] .compare-control',
      ),
    ).toEqual({
      display: 'flex',
      'flex-wrap': 'wrap',
      gap: '0.25rem 1rem',
      margin: 'calc(var(--baseline) / 3) 0 0',
      padding: '0',
      'list-style': 'none',
      color: 'var(--color-muted)',
      'font-family': 'var(--font-mono)',
      'font-size': '0.68rem',
      'letter-spacing': '0.04em',
      'text-transform': 'uppercase',
    });
  });
});

describe('(d) the state (T1707)', () => {
  it('COMPARE holds exactly EXPECTED — every key, every value, none missing or extra', () => {
    expect(Object.keys(COMPARE).sort()).toEqual(Object.keys(EXPECTED.COMPARE).sort());
    for (const [key, value] of Object.entries(EXPECTED.COMPARE)) {
      expect([key, COMPARE[key]]).toEqual([key, value]);
    }
  });

  it("COMPARE_WORDING holds exactly EXPECTED's words", () => {
    expect(COMPARE_WORDING).toEqual(EXPECTED.COMPARE_WORDING);
  });

  it("the page's WORDING.compare is exactly its heading and two labels, by page source (T1708a)", () => {
    const found = page.match(/^ {2}compare: (\{[^}\n]*\}),$/gm) ?? [];
    expect(found).toEqual([
      "  compare: { heading: 'Raw to finished', camera: 'Camera', finished: 'Finished' },",
    ]);
    expect(page).toContain('{WORDING.compare.heading}');
    expect(page).toContain('WORDING.compare,');
  });

  // [p, pair, split]: the pair the frame shows with the handle at p;
  // the split to six places, so a third of the track reads 33.333333.
  const view = (p, pair) => {
    const { left, right, split } = sliderView(p, pair);
    return [p, [left, right], Math.round(split * 1e6) / 1e6];
  };

  it('the slider is two-way: the pair it is given at every p, the divider at p, clamped to the track', () => {
    const ends = { left: 0, right: 2 };
    expect([-0.5, 0, 0.25, 0.5, 0.75, 1, 1.5].map((p) => view(p, ends))).toEqual([
      [-0.5, [0, 2], 0],
      [0, [0, 2], 0],
      [0.25, [0, 2], 25],
      [0.5, [0, 2], 50],
      [0.75, [0, 2], 75],
      [1, [0, 2], 100],
      [1.5, [0, 2], 100],
    ]);
    expect([0, 1 / 3, 1].map((p) => view(p, { left: 1, right: 3 }))).toEqual([
      [0, [1, 3], 0],
      [1 / 3, [1, 3], 33.333333],
      [1, [1, 3], 100],
    ]);
  });

  // [pair before as [left, right, next], stage clicked, pair after], for
  // every pair, either side next, and every click: a stage in the pair
  // leaves it; another takes the next side, and next flips.
  const picks = (n) => {
    const rows = [];
    for (let left = 0; left < n; left++)
      for (let right = 0; right < n; right++)
        if (left !== right)
          for (const next of ['left', 'right'])
            for (let k = 0; k < n; k++) {
              const after = pickSlot({ left, right, next }, k);
              rows.push([[left, right, next], k, [after.left, after.right, after.next]]);
            }
    return rows;
  };

  it('pickSlot on three stages: every click on every pair, either side next', () => {
    expect(picks(3)).toEqual([
      [[0, 1, 'left'], 0, [0, 1, 'left']],
      [[0, 1, 'left'], 1, [0, 1, 'left']],
      [[0, 1, 'left'], 2, [2, 1, 'right']],
      [[0, 1, 'right'], 0, [0, 1, 'right']],
      [[0, 1, 'right'], 1, [0, 1, 'right']],
      [[0, 1, 'right'], 2, [0, 2, 'left']],
      [[0, 2, 'left'], 0, [0, 2, 'left']],
      [[0, 2, 'left'], 1, [1, 2, 'right']],
      [[0, 2, 'left'], 2, [0, 2, 'left']],
      [[0, 2, 'right'], 0, [0, 2, 'right']],
      [[0, 2, 'right'], 1, [0, 1, 'left']],
      [[0, 2, 'right'], 2, [0, 2, 'right']],
      [[1, 0, 'left'], 0, [1, 0, 'left']],
      [[1, 0, 'left'], 1, [1, 0, 'left']],
      [[1, 0, 'left'], 2, [2, 0, 'right']],
      [[1, 0, 'right'], 0, [1, 0, 'right']],
      [[1, 0, 'right'], 1, [1, 0, 'right']],
      [[1, 0, 'right'], 2, [1, 2, 'left']],
      [[1, 2, 'left'], 0, [0, 2, 'right']],
      [[1, 2, 'left'], 1, [1, 2, 'left']],
      [[1, 2, 'left'], 2, [1, 2, 'left']],
      [[1, 2, 'right'], 0, [1, 0, 'left']],
      [[1, 2, 'right'], 1, [1, 2, 'right']],
      [[1, 2, 'right'], 2, [1, 2, 'right']],
      [[2, 0, 'left'], 0, [2, 0, 'left']],
      [[2, 0, 'left'], 1, [1, 0, 'right']],
      [[2, 0, 'left'], 2, [2, 0, 'left']],
      [[2, 0, 'right'], 0, [2, 0, 'right']],
      [[2, 0, 'right'], 1, [2, 1, 'left']],
      [[2, 0, 'right'], 2, [2, 0, 'right']],
      [[2, 1, 'left'], 0, [0, 1, 'right']],
      [[2, 1, 'left'], 1, [2, 1, 'left']],
      [[2, 1, 'left'], 2, [2, 1, 'left']],
      [[2, 1, 'right'], 0, [2, 0, 'left']],
      [[2, 1, 'right'], 1, [2, 1, 'right']],
      [[2, 1, 'right'], 2, [2, 1, 'right']],
    ]);
  });

  it('pickSlot on four stages: every click on every pair, either side next', () => {
    expect(picks(4)).toEqual([
      [[0, 1, 'left'], 0, [0, 1, 'left']],
      [[0, 1, 'left'], 1, [0, 1, 'left']],
      [[0, 1, 'left'], 2, [2, 1, 'right']],
      [[0, 1, 'left'], 3, [3, 1, 'right']],
      [[0, 1, 'right'], 0, [0, 1, 'right']],
      [[0, 1, 'right'], 1, [0, 1, 'right']],
      [[0, 1, 'right'], 2, [0, 2, 'left']],
      [[0, 1, 'right'], 3, [0, 3, 'left']],
      [[0, 2, 'left'], 0, [0, 2, 'left']],
      [[0, 2, 'left'], 1, [1, 2, 'right']],
      [[0, 2, 'left'], 2, [0, 2, 'left']],
      [[0, 2, 'left'], 3, [3, 2, 'right']],
      [[0, 2, 'right'], 0, [0, 2, 'right']],
      [[0, 2, 'right'], 1, [0, 1, 'left']],
      [[0, 2, 'right'], 2, [0, 2, 'right']],
      [[0, 2, 'right'], 3, [0, 3, 'left']],
      [[0, 3, 'left'], 0, [0, 3, 'left']],
      [[0, 3, 'left'], 1, [1, 3, 'right']],
      [[0, 3, 'left'], 2, [2, 3, 'right']],
      [[0, 3, 'left'], 3, [0, 3, 'left']],
      [[0, 3, 'right'], 0, [0, 3, 'right']],
      [[0, 3, 'right'], 1, [0, 1, 'left']],
      [[0, 3, 'right'], 2, [0, 2, 'left']],
      [[0, 3, 'right'], 3, [0, 3, 'right']],
      [[1, 0, 'left'], 0, [1, 0, 'left']],
      [[1, 0, 'left'], 1, [1, 0, 'left']],
      [[1, 0, 'left'], 2, [2, 0, 'right']],
      [[1, 0, 'left'], 3, [3, 0, 'right']],
      [[1, 0, 'right'], 0, [1, 0, 'right']],
      [[1, 0, 'right'], 1, [1, 0, 'right']],
      [[1, 0, 'right'], 2, [1, 2, 'left']],
      [[1, 0, 'right'], 3, [1, 3, 'left']],
      [[1, 2, 'left'], 0, [0, 2, 'right']],
      [[1, 2, 'left'], 1, [1, 2, 'left']],
      [[1, 2, 'left'], 2, [1, 2, 'left']],
      [[1, 2, 'left'], 3, [3, 2, 'right']],
      [[1, 2, 'right'], 0, [1, 0, 'left']],
      [[1, 2, 'right'], 1, [1, 2, 'right']],
      [[1, 2, 'right'], 2, [1, 2, 'right']],
      [[1, 2, 'right'], 3, [1, 3, 'left']],
      [[1, 3, 'left'], 0, [0, 3, 'right']],
      [[1, 3, 'left'], 1, [1, 3, 'left']],
      [[1, 3, 'left'], 2, [2, 3, 'right']],
      [[1, 3, 'left'], 3, [1, 3, 'left']],
      [[1, 3, 'right'], 0, [1, 0, 'left']],
      [[1, 3, 'right'], 1, [1, 3, 'right']],
      [[1, 3, 'right'], 2, [1, 2, 'left']],
      [[1, 3, 'right'], 3, [1, 3, 'right']],
      [[2, 0, 'left'], 0, [2, 0, 'left']],
      [[2, 0, 'left'], 1, [1, 0, 'right']],
      [[2, 0, 'left'], 2, [2, 0, 'left']],
      [[2, 0, 'left'], 3, [3, 0, 'right']],
      [[2, 0, 'right'], 0, [2, 0, 'right']],
      [[2, 0, 'right'], 1, [2, 1, 'left']],
      [[2, 0, 'right'], 2, [2, 0, 'right']],
      [[2, 0, 'right'], 3, [2, 3, 'left']],
      [[2, 1, 'left'], 0, [0, 1, 'right']],
      [[2, 1, 'left'], 1, [2, 1, 'left']],
      [[2, 1, 'left'], 2, [2, 1, 'left']],
      [[2, 1, 'left'], 3, [3, 1, 'right']],
      [[2, 1, 'right'], 0, [2, 0, 'left']],
      [[2, 1, 'right'], 1, [2, 1, 'right']],
      [[2, 1, 'right'], 2, [2, 1, 'right']],
      [[2, 1, 'right'], 3, [2, 3, 'left']],
      [[2, 3, 'left'], 0, [0, 3, 'right']],
      [[2, 3, 'left'], 1, [1, 3, 'right']],
      [[2, 3, 'left'], 2, [2, 3, 'left']],
      [[2, 3, 'left'], 3, [2, 3, 'left']],
      [[2, 3, 'right'], 0, [2, 0, 'left']],
      [[2, 3, 'right'], 1, [2, 1, 'left']],
      [[2, 3, 'right'], 2, [2, 3, 'right']],
      [[2, 3, 'right'], 3, [2, 3, 'right']],
      [[3, 0, 'left'], 0, [3, 0, 'left']],
      [[3, 0, 'left'], 1, [1, 0, 'right']],
      [[3, 0, 'left'], 2, [2, 0, 'right']],
      [[3, 0, 'left'], 3, [3, 0, 'left']],
      [[3, 0, 'right'], 0, [3, 0, 'right']],
      [[3, 0, 'right'], 1, [3, 1, 'left']],
      [[3, 0, 'right'], 2, [3, 2, 'left']],
      [[3, 0, 'right'], 3, [3, 0, 'right']],
      [[3, 1, 'left'], 0, [0, 1, 'right']],
      [[3, 1, 'left'], 1, [3, 1, 'left']],
      [[3, 1, 'left'], 2, [2, 1, 'right']],
      [[3, 1, 'left'], 3, [3, 1, 'left']],
      [[3, 1, 'right'], 0, [3, 0, 'left']],
      [[3, 1, 'right'], 1, [3, 1, 'right']],
      [[3, 1, 'right'], 2, [3, 2, 'left']],
      [[3, 1, 'right'], 3, [3, 1, 'right']],
      [[3, 2, 'left'], 0, [0, 2, 'right']],
      [[3, 2, 'left'], 1, [1, 2, 'right']],
      [[3, 2, 'left'], 2, [3, 2, 'left']],
      [[3, 2, 'left'], 3, [3, 2, 'left']],
      [[3, 2, 'right'], 0, [3, 0, 'left']],
      [[3, 2, 'right'], 1, [3, 1, 'left']],
      [[3, 2, 'right'], 2, [3, 2, 'right']],
      [[3, 2, 'right'], 3, [3, 2, 'right']],
    ]);
  });

  it('pickSlot: a click outside the pair changes it, the clicked stage on the side that was next, and no two do the same thing', () => {
    for (const n of [3, 4]) {
      const byPair = new Map();
      for (const [before, k, after] of picks(n)) {
        if (before.slice(0, 2).includes(k)) continue;
        expect([before, k, after]).not.toEqual([before, k, before]);
        const side = before[2] === 'left' ? 0 : 1;
        expect([before, k, after[side], after[1 - side]]).toEqual([before, k, k, before[1 - side]]);
        byPair.set(`${before}`, [...(byPair.get(`${before}`) ?? []), `${after}`]);
      }
      for (const [before, after] of byPair) expect([before, new Set(after).size]).toEqual([before, after.length]);
    }
  });

  it('pickSlot at rest: the first stage left, the last right, left next', () => {
    const rest = (n) => ({ ...restView('side', n, 'ends'), next: 'left' });
    expect([rest(3), rest(4)]).toEqual([
      { left: 0, right: 2, next: 'left' },
      { left: 0, right: 3, next: 'left' },
    ]);
  });

  it('pickSlot: from rest every pair of three and of four stages is within two clicks', () => {
    for (const n of [3, 4]) {
      const start = { ...restView('side', n, 'ends'), next: 'left' };
      const reached = new Set();
      const see = ({ left, right }) => reached.add(`${Math.min(left, right)},${Math.max(left, right)}`);
      see(start);
      for (let a = 0; a < n; a++) {
        const one = pickSlot(start, a);
        see(one);
        for (let b = 0; b < n; b++) see(pickSlot(one, b));
      }
      const all = [];
      for (let l = 0; l < n; l++) for (let r = l + 1; r < n; r++) all.push(`${l},${r}`);
      expect([n, [...reached].sort()]).toEqual([n, all]);
    }
  });

  it('pickSlot from rest on three stages: Tones goes left (T | F), then Camera right (T | C), then Finished left (F | C)', () => {
    let pair = { left: 0, right: 2, next: 'left' };
    const seen = [];
    for (const k of [1, 0, 2]) {
      pair = pickSlot(pair, k);
      seen.push([k, pair]);
    }
    expect(seen).toEqual([
      [1, { left: 1, right: 2, next: 'right' }],
      [0, { left: 1, right: 0, next: 'left' }],
      [2, { left: 2, right: 0, next: 'right' }],
    ]);
  });

  it('sidePair is stage k and the next — the last stage with the one before', () => {
    expect(sidePair(0, 4)).toEqual({ left: 0, right: 1 });
    expect(sidePair(1, 4)).toEqual({ left: 1, right: 2 });
    expect(sidePair(3, 4)).toEqual({ left: 2, right: 3 });
  });

  it('switchNext advances, wraps from the last to the first when wrapping, stops at the last when not', () => {
    expect(switchNext(0, 3, 1)).toEqual(1);
    expect(switchNext(2, 3, 1, true)).toEqual(0);
    expect(switchNext(2, 3, 1, false)).toEqual(2);
    // The default is COMPARE.switchWraps.
    expect(switchNext(2, 3, 1)).toEqual(switchNext(2, 3, 1, COMPARE.switchWraps));
  });

  it('switchNext backwards from the first goes to the last when wrapping, stays when not', () => {
    expect(switchNext(0, 3, -1, true)).toEqual(2);
    expect(switchNext(0, 3, -1, false)).toEqual(0);
    expect(switchNext(2, 3, -1)).toEqual(1);
  });

  it("restView: 'ends' — the slider and side by side on the first and last stage, the divider at restAt; the switch on the first stage", () => {
    expect(restView('slider', 3, 'ends')).toEqual({ left: 0, right: 2, split: 100 * COMPARE.restAt });
    expect(restView('side', 4, 'ends')).toEqual({ left: 0, right: 3 });
    expect(restView('side', 2, 'ends')).toEqual({ left: 0, right: 1 });
    expect(restView('switch', 3, 'ends')).toEqual({ stage: 0 });
  });

  it("restView: 'neighbours' — the pair the old three-way slider showed at restAt 0.5", () => {
    expect(restView('side', 3, 'neighbours')).toEqual({ left: 0, right: 1 });
    expect(restView('side', 4, 'neighbours')).toEqual({ left: 1, right: 2 });
    expect(restView('slider', 4, 'neighbours')).toEqual({ left: 1, right: 2, split: 50 });
  });

  it('restView: the default rest pair is COMPARE.restPair', () => {
    expect(restView('side', 4)).toEqual(restView('side', 4, COMPARE.restPair));
    expect(restView('slider', 3)).toEqual(restView('slider', 3, COMPARE.restPair));
  });

  it("noteIndex: the pair's later stage in the slider and side by side, the showing stage in the switch", () => {
    expect(noteIndex('slider', { left: 1, right: 2, split: 20 })).toEqual(2);
    expect(noteIndex('side', { left: 0, right: 1 })).toEqual(1);
    expect(noteIndex('switch', { stage: 2 })).toEqual(2);
  });

  it('sideFits: two stages fit from 2 × sideMinPx, not a pixel under', () => {
    const edge = 2 * COMPARE.sideMinPx;
    expect([edge - 1, edge, edge + 1].map(sideFits)).toEqual([false, true, true]);
  });

  it('openingMode: the stored choice, else the author’s, else the default', () => {
    expect(openingMode('side', 'switch')).toEqual('switch');
    expect(openingMode('side', null)).toEqual('side');
    expect(openingMode(undefined, null)).toEqual(COMPARE.defaultMode);
  });

  it('openingMode: an invalid stored value (or an inherited name) falls to the author, then the default', () => {
    expect(openingMode('side', 'carousel')).toEqual('side');
    expect(openingMode(undefined, 'toString')).toEqual(COMPARE.defaultMode);
    expect(openingMode('carousel', null)).toEqual(COMPARE.defaultMode);
  });

  it("openingMode: when remembering is 'none' the stored choice is ignored", () => {
    expect(openingMode('side', 'switch', 'none')).toEqual('side');
  });
});
