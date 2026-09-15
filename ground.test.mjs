import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';

// The ground and its derived copies (spec 013, T1102). `--color-bg` in
// global.css is the ground; two copies of it are derived by hand and
// cannot update themselves:
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
// moves (spec 013's gate may land a new white in T1105) and starts
// failing the moment one copy moves without the others.
//
// The conversion is in-test on purpose: oklch → sRGB is thirty lines of
// published matrix math, and pulling a colour library in for it would
// buy a dependency this project has to keep alive for years.

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
  for (const part of flat.split(';')) {
    const at = part.indexOf(':');
    if (at === -1) continue;
    out[part.slice(0, at).trim()] = part.slice(at + 1).trim();
  }
  return out;
}

const selects = (prelude, selector) => prelude.split(',').some((one) => one.trim() === selector);

/** `oklch(L C H)` -> { L, C, h }. L and C accept the percentage forms. */
function parseOklch(value) {
  const match = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([-\d.]+)(?:deg)?\s*\)$/.exec(value);
  if (!match) throw new Error(`not a plain oklch() value: ${value}`);
  const scaled = (text, full) =>
    text.endsWith('%') ? (Number.parseFloat(text) / 100) * full : Number.parseFloat(text);
  return {
    L: scaled(match[1], 1),
    C: scaled(match[2], 0.4),
    h: Number.parseFloat(match[3]),
  };
}

// Björn Ottosson's OKLab constants, from "A perceptual color space for
// image processing" (2020), https://bottosson.github.io/posts/oklab/ —
// the inverse pair of the matrices in the "oklab_to_linear_srgb" and
// "linear_srgb_to_oklab" reference implementations there. Same numbers
// as the CSS Color 4 sample code.
function oklchToRgb255({ L, C, h }) {
  const radians = (h * Math.PI) / 180;
  const a = C * Math.cos(radians);
  const b = C * Math.sin(radians);

  // OKLab -> nonlinear LMS (M2 inverse), then cube to linear LMS.
  const lCube = L + 0.3963377774 * a + 0.2158037573 * b;
  const mCube = L - 0.1055613458 * a - 0.0638541728 * b;
  const sCube = L - 0.0894841775 * a - 1.291485548 * b;
  const l = lCube ** 3;
  const m = mCube ** 3;
  const s = sCube ** 3;

  // Linear LMS -> linear sRGB (M1 inverse).
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  // The sRGB transfer function, clamped, to 8-bit.
  return linear.map((channel) => {
    const encoded =
      channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  });
}

/** `#rrggbb` -> [r, g, b]. */
function parseHex(hex) {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) throw new Error(`not a six-digit hex colour: ${hex}`);
  const digits = match[1];
  return [0, 2, 4].map((at) => Number.parseInt(digits.slice(at, at + 2), 16));
}

const CHANNELS = ['red', 'green', 'blue'];

let ground;
let routeBg;
let jpegPixel;

beforeAll(async () => {
  const css = uncomment(await readFile(here('./src/styles/global.css'), 'utf8'));
  const roots = blocks(css).filter((block) => selects(block.prelude, ':root'));
  const rootDecls = Object.assign({}, ...roots.map((block) => declarations(block.body)));
  ground = oklchToRgb255(parseOklch(rootDecls['--color-bg']));

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
