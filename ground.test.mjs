import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  blocks,
  CANDIDATES,
  contrast,
  contrastRgb,
  CONTROL,
  declarations,
  deepenMuted,
  deriveFamily,
  FLOOR,
  formatOklch,
  GROUND_TOKENS,
  MAT,
  MUTED,
  oklchToRgb255,
  PAIRS,
  parseOklch,
  readout,
  rootTokens,
  selects,
  STEPS,
  TEXT,
  TODAY,
  uncomment,
} from './src/lib/ground.ts';

// The ground: its derived copies (spec 013, T1102) and its family
// (spec 014, T1200).
//
// (1) The copies. `--color-bg` in global.css is the ground; two copies
// of it are derived by hand and cannot update themselves:
//
//   (a) COLOR.bg in the Open Graph route — Satori has no oklch(), so the
//       route carries a hex the author recomputes after retuning the
//       token. Spec 001's pre-merge review already caught one of these
//       left stale (the accent, still terracotta after the token went
//       teal), and nothing but a human eye would have.
//   (b) public/og.jpg — the static social image, generated once against
//       the ground of the day.
//
// Neither is imported by anything that would fail if it drifted, which
// is exactly why they drift. This file makes "the copies match the
// ground" falsifiable in both directions: it reads the token from the
// CSS rather than hardcoding it, so it keeps holding after the ground
// moves and starts failing the moment one copy moves without the
// others.
//
// (2) The family. The four fills and hairlines that sit on the ground
// are fixed steps from it (`STEPS` in src/lib/ground.ts), and the
// stylesheet keeps the resolved literals — so the rule and its output
// are two things that can disagree. They are pinned here, byte for
// byte, together with the module's fixed tones (`TEXT`, `MUTED`, `MAT`,
// `CANDIDATES.today`), the spread the sampler must offer, the tokens
// being declared in `:root` and nowhere else, and the contrast floor at
// the committed values — the floor is a fact before the gate, not a
// hope after it.
//
// The oklch → sRGB conversion and the contrast arithmetic live in
// src/lib/ground.ts (the sampler and the OG generator need them too);
// they are still pinned here against published values they did not
// produce, because a matrix row transposed still returns plausible
// near-greys for a ground.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** `#rrggbb` -> [r, g, b]. */
function parseHex(hex) {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) throw new Error(`not a six-digit hex colour: ${hex}`);
  const digits = match[1];
  return [0, 2, 4].map((at) => Number.parseInt(digits.slice(at, at + 2), 16));
}

/** Every text file under src/, path -> contents. Markdown is in the
 *  net on purpose (a piece is a file under src/ like any other), so a
 *  piece that quotes a token declaration in a code fence would fail the
 *  declared-once case below — move the example to prose, or name the
 *  token without its colon. */
async function sources(dir = here('./src'), out = {}) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await sources(path, out);
    else if (/\.(astro|css|ts|tsx|mjs|js|json|md|svg|html)$/.test(entry.name))
      out[path.slice(here('./').length)] = await readFile(path, 'utf8');
  }
  return out;
}

const CHANNELS = ['red', 'green', 'blue'];

/** The five tokens the family is committed as, sorted — the form the
 *  per-file scan below compares against. */
const GROUND_NAMES = Object.values(GROUND_TOKENS).sort();

/** A declaration of any of them, built from the names rather than
 *  respelled — longest first, so `--color-line-strong` is not read as
 *  `--color-line` with a suffix. */
const DECLARES = new RegExp(
  `(${[...GROUND_NAMES].sort((a, b) => b.length - a.length).join('|')})\\s*:`,
  'g',
);

let root;
let top;
let nested;
let src;
let ground;
let routeBg;
let jpegPixel;

beforeAll(async () => {
  const css = await readFile(here('./src/styles/global.css'), 'utf8');
  root = rootTokens(css);
  top = blocks(uncomment(css));
  nested = top
    .filter((block) => block.prelude.startsWith('@'))
    .flatMap((block) => blocks(block.body));
  src = await sources();
  ground = oklchToRgb255(parseOklch(root['--color-bg']));

  // Parsed from the source text, not imported: the route is an Astro
  // endpoint whose module graph the test has no business booting.
  const route = await readFile(here('./src/pages/og/pieces/[slug].png.ts'), 'utf8');
  const declared = /\bbg:\s*'(#[0-9a-fA-F]{6})'/.exec(route);
  expect(declared, "COLOR.bg's hex in the OG route").not.toBeNull();
  routeBg = parseHex(declared[1]);

  const { data, info } = await sharp(here('./public/og.jpg'))
    .raw()
    .toBuffer({ resolveWithObject: true });
  // (10, 10) is inside the image's flat background margin, clear of the
  // card and of JPEG ringing along the edge.
  const at = (10 * info.width + 10) * info.channels;
  jpegPixel = [data[at], data[at + 1], data[at + 2]];
});

describe("the ground's derived copies (T1102, spec 013)", () => {
  it("the OG route's COLOR.bg is :root's --color-bg, within 2/255 per channel", () => {
    for (const [index, name] of CHANNELS.entries()) {
      expect(
        Math.abs(routeBg[index] - ground[index]),
        `${name}: route ${routeBg[index]} vs ground ${ground[index]}`,
      ).toBeLessThanOrEqual(2);
    }
  });

  it("public/og.jpg's background pixel is the ground, within 3/255 per channel", () => {
    for (const [index, name] of CHANNELS.entries()) {
      expect(
        Math.abs(jpegPixel[index] - ground[index]),
        `${name}: og.jpg ${jpegPixel[index]} vs ground ${ground[index]}`,
      ).toBeLessThanOrEqual(3);
    }
  });

  it('the conversion reproduces published oklch → sRGB values', () => {
    // Ottosson's own worked examples, via the CSS Color 4 conversions:
    // white, mid grey and pure sRGB red. A conversion that has a matrix
    // row transposed still returns plausible near-greys for the ground,
    // so the maths is pinned against values it did not produce.
    expect(oklchToRgb255(parseOklch('oklch(1 0 0)'))).toEqual([255, 255, 255]);
    expect(oklchToRgb255(parseOklch('oklch(0 0 0)'))).toEqual([0, 0, 0]);
    expect(oklchToRgb255(parseOklch('oklch(0.627955 0.257683 29.2339)'))).toEqual([255, 0, 0]);
    expect(oklchToRgb255(parseOklch('oklch(0.8664396 0.2948272 142.4953)'))).toEqual([0, 255, 0]);
    expect(oklchToRgb255(parseOklch('oklch(0.4520137 0.3132143 264.0520)'))).toEqual([0, 0, 255]);
  });
});

describe('(a) the family is one number (T1200, spec 014)', () => {
  it("the four derived tokens are STEPS from :root's ground, byte for byte", () => {
    // Not "close enough": the stylesheet's literal is the string the
    // rule prints, so a retuned step or a hand-edited fill is a failure
    // that names the token it happened to.
    const family = deriveFamily(parseOklch(root['--color-bg']));
    for (const key of Object.keys(STEPS)) {
      const token = GROUND_TOKENS[key];
      expect([token, root[token]]).toEqual([token, formatOklch(family[key])]);
    }
  });
});

describe("(b) the module's fixed tones are :root's (T1200, spec 014)", () => {
  it('the control candidate and the three ends of the readout are the committed literals', () => {
    // The readout's ends are literals, never a computed style — the dev
    // applier may already carry a deepened --color-muted on <html>. The
    // price of that is drift, and this is the check that forbids it.
    expect([TODAY, CANDIDATES[TODAY].bg]).toEqual([TODAY, parseOklch(root['--color-bg'])]);
    expect(['--color-text', TEXT]).toEqual(['--color-text', parseOklch(root['--color-text'])]);
    expect(['--color-muted', MUTED]).toEqual(['--color-muted', parseOklch(root['--color-muted'])]);
    expect(['--color-matte', MAT]).toEqual(['--color-matte', parseOklch(root['--color-matte'])]);
  });
});

describe('(c) the switch offers the spread the gate needs (T1200, spec 014)', () => {
  // Measured against CONTROL, the tone :root carried at the gate and a
  // literal nothing moves: `today` follows the landed ground, and a
  // spread measured against it would break on most landings.
  const candidates = () => Object.values(CANDIDATES);

  it('two candidates are lighter than the control, one of them the paper white', () => {
    const lighter = candidates().filter((one) => one.bg.L > CONTROL.L);
    expect(lighter.length, lighter.map((one) => one.id).join(', ')).toBeGreaterThanOrEqual(2);
    expect(lighter.map((one) => formatOklch(one.bg))).toContain('oklch(0.99 0.003 100)');
  });

  it('two are darker, one is within 0.01 of it at a cool hue, one is warmer and more coloured', () => {
    const darker = candidates().filter((one) => one.bg.L < CONTROL.L);
    expect(darker.length, darker.map((one) => one.id).join(', ')).toBeGreaterThanOrEqual(2);

    const cool = candidates().filter(
      (one) => Math.abs(one.bg.L - CONTROL.L) <= 0.01 && one.bg.h >= 200,
    );
    expect(cool.length, cool.map((one) => one.id).join(', ')).toBeGreaterThanOrEqual(1);

    const warm = candidates().filter((one) => one.bg.h < CONTROL.h && one.bg.C > CONTROL.C);
    expect(warm.length, warm.map((one) => one.id).join(', ')).toBeGreaterThanOrEqual(1);
  });

  it('the ids are unique and the control is the ground at the gate', () => {
    const ids = candidates().map((one) => one.id);
    expect(ids).toEqual([...new Set(ids)]);
    expect(Object.keys(CANDIDATES)).toEqual(ids);

    // Before the gate the control IS today's candidate; after a change
    // lands, today is the new ground and the control is kept as
    // `warm-003`, the tone that was re-judged.
    const kept = CANDIDATES['warm-003'];
    expect(formatOklch(CONTROL)).toBe(formatOklch(kept ? kept.bg : CANDIDATES[TODAY].bg));
  });
});

describe('(d) the words stay readable at the committed values (T1200, spec 014)', () => {
  it('the six text pairs meet 4.5:1 on :root’s own tones, each named with its ratio', () => {
    // Read from the stylesheet, not from the module's literals: this is
    // the site as committed. If it ever fails, the floor is not what
    // moves.
    const inks = {
      text: parseOklch(root['--color-text']),
      muted: parseOklch(root['--color-muted']),
      mat: parseOklch(root['--color-matte']),
    };
    const fills = {
      bg: parseOklch(root['--color-bg']),
      surface: parseOklch(root['--color-surface']),
      soft: parseOklch(root['--color-soft']),
    };
    // The table's shape first: a loop over a filtered PAIRS passes
    // vacuously if the filter ever comes back empty.
    expect(PAIRS.map((pair) => pair.id)).toEqual([
      'text/bg',
      'text/surface',
      'text/soft',
      'muted/bg',
      'muted/surface',
      'muted/soft',
      'mat/bg',
    ]);
    const floored = PAIRS.filter((one) => one.floored);
    expect(floored).toHaveLength(6);

    for (const pair of floored) {
      const ratio = contrast(inks[pair.ink], fills[pair.on]);
      expect(ratio, `${pair.id} is ${ratio.toFixed(3)}:1`).toBeGreaterThanOrEqual(FLOOR);
    }
  });

  it('the formula reproduces known contrast pairs either side of the floor', () => {
    // WCAG 2's own worked pair (black on white) and the two greys the
    // standard's checkers are usually demonstrated with: #777 fails the
    // floor by a hair, #767676 passes it by one.
    const white = parseHex('#ffffff');
    expect(contrastRgb(parseHex('#000000'), white)).toBeCloseTo(21, 2);
    expect(contrastRgb(parseHex('#777777'), white)).toBeCloseTo(4.48, 2);
    expect(contrastRgb(parseHex('#767676'), white)).toBeCloseTo(4.54, 2);
  });

  it('a ground that fails the muted pairs deepens the muted text by the least step', () => {
    // Pinned from literals rather than from the candidate table, so the
    // case survives every landing the gate could make.
    const family = deriveFamily(parseOklch('oklch(0.93 0.008 95)'));
    const from = parseOklch('oklch(0.5 0.012 250)');
    const deeper = deepenMuted(family, from);
    expect(deeper).toEqual({ L: 0.48, C: 0.012, h: 250 });
    const mutedPairs = PAIRS.filter((one) => one.ink === 'muted');
    expect(mutedPairs).toHaveLength(3);
    for (const pair of mutedPairs) {
      const ratio = contrast(deeper, family[pair.on]);
      expect(ratio, `${pair.id} at L 0.48 is ${ratio.toFixed(3)}:1`).toBeGreaterThanOrEqual(FLOOR);
    }
    // And it is the LEAST step: one 0.01 short still fails on the soft
    // fill, which is where inline code sits.
    const short = { L: 0.49, C: from.C, h: from.h };
    const shortRatio = contrast(short, family.soft);
    expect(shortRatio, `muted/soft at L 0.49 is ${shortRatio.toFixed(3)}:1`).toBeLessThan(FLOOR);
  });

  it('the committed ground needs no deepening — the muted text ships unchanged', () => {
    expect(deepenMuted(deriveFamily(CANDIDATES[TODAY].bg))).toBeNull();
  });

  it('the readout grades at the committed tones, so a failing row is visible', () => {
    // The gate has to SEE muted-on-soft fail before it accepts the
    // deeper muted that fixes it: graded against the tone that would
    // ship, a darker ground would read as passing and the number that
    // made it deepen would be nowhere on the screen.
    // The tone is written out rather than read from CANDIDATES: the
    // landing drops the entry for whichever candidate was taken, and a
    // case that reads one by id throws on that branch.
    const deep = readout(parseOklch('oklch(0.95 0.007 95)'));
    const soft = deep.pairs.find((one) => one.id === 'muted/soft');
    expect([soft.id, soft.passes]).toEqual(['muted/soft', false]);
    expect(soft.ratio, `muted/soft undeepened is ${soft.ratio.toFixed(3)}:1`).toBeLessThan(FLOOR);
    expect(deep.deepened.L).toBe(0.49);
    // ...and still reports the ground as passing, because the muted it
    // would ship clears the floor.
    expect(deep.passes).toBe(true);

    // The mat pair is information, not a verdict.
    const mat = deep.pairs.find((one) => one.id === 'mat/bg');
    expect([mat.floored, mat.passes]).toEqual([false, null]);

    const today = readout(CANDIDATES[TODAY].bg);
    expect(today.deepened).toBeNull();
    expect(today.muted).toEqual(MUTED);
    for (const reading of today.pairs.filter((one) => one.floored)) {
      expect(reading.passes, `${reading.id} is ${reading.ratio.toFixed(3)}:1`).toBe(true);
    }
  });
});

describe('(g) the ground tokens are declared once (T1200, spec 014)', () => {
  it('no other rule in global.css declares any of the five — one tone moves the family', () => {
    for (const token of GROUND_NAMES) {
      const declaring = [...top, ...nested].filter(
        (block) => token in declarations(block.body) && !selects(block.prelude, ':root'),
      );
      expect([token, declaring.map((block) => block.prelude)]).toEqual([token, []]);
    }
  });

  it('no file under src/ outside src/pages/dev/ declares one — the sampler alone may override', () => {
    for (const [path, text] of Object.entries(src)) {
      if (path.startsWith('src/pages/dev/')) continue;
      const found = [...uncomment(text).matchAll(DECLARES)].map((match) => match[1]);
      const allowed = path === 'src/styles/global.css' ? GROUND_NAMES : [];
      expect([path, found.sort()]).toEqual([path, allowed]);
    }
  });
});
