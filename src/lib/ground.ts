/**
 * The ground and the family that sits on it (spec 014).
 *
 * The page ground is one oklch tone. The four fills and hairlines that
 * live on it are not independent choices: each is a fixed step from the
 * ground in L and C, at the ground's hue. `STEPS` is that rule, and it
 * is the only place it is written — `global.css` keeps five resolved
 * literals (Satori, the sampler and the tests all want plain numbers,
 * and AC 7 wants the committed tokens byte for byte on the keep
 * branch), and `ground.test.mjs` pins them to what `deriveFamily`
 * derives. Retuning a step means editing `STEPS`; the test then demands
 * the same of `:root`.
 *
 * The same module carries the contrast arithmetic the gate is judged
 * by — WCAG 2 for normal text, computed on the 8-bit sRGB the browser
 * paints, so the number here is the number a checker given the hex
 * would give — and the candidate table the sampler shows.
 *
 * Pure and import-free on purpose: the `.mjs` tests import it directly,
 * an Astro `<script>` can bundle it, and a Node script reads it under
 * type stripping. Erasable TypeScript only — no enums, no parameter
 * properties.
 */

export type Tone = { L: number; C: number; h: number };
export type Step = { L: number; C: number };
export type Family = { bg: Tone; surface: Tone; soft: Tone; line: Tone; lineStrong: Tone };

/** The family's four steps from the ground — today's steps, so today's
 *  ground derives today's `:root` exactly and the control is the
 *  identity. The chroma rises as the lightness falls: a flat chroma
 *  reads greyer on the darker fills. */
export const STEPS: { surface: Step; soft: Step; line: Step; lineStrong: Step } = {
  surface: { L: -0.023, C: 0.001 },
  soft: { L: -0.048, C: 0.002 },
  line: { L: -0.108, C: 0.002 },
  lineStrong: { L: -0.248, C: 0.006 },
};

/** Family key -> the custom property it is committed as. */
export const GROUND_TOKENS: { [K in keyof Family]: string } = {
  bg: '--color-bg',
  surface: '--color-surface',
  soft: '--color-soft',
  line: '--color-line',
  lineStrong: '--color-line-strong',
};

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

/** A tone at three decimals, chroma never negative, lightness never
 *  over 1 — the two ends a free tune can be dragged past. */
const settle = (tone: Tone): Tone => ({
  L: Math.min(1, round3(tone.L)),
  C: Math.max(0, round3(tone.C)),
  h: tone.h,
});

const stepped = (ground: Tone, step: Step): Tone =>
  settle({ L: ground.L + step.L, C: ground.C + step.C, h: ground.h });

/** The five tones a ground implies, `STEPS` applied. */
export function deriveFamily(bg: Tone): Family {
  const ground = settle(bg);
  return {
    bg: ground,
    surface: stepped(ground, STEPS.surface),
    soft: stepped(ground, STEPS.soft),
    line: stepped(ground, STEPS.line),
    lineStrong: stepped(ground, STEPS.lineStrong),
  };
}

/** `0.92` not `0.920`, `95` not `95.000` — the stylesheet's own spelling. */
const shortest = (value: number): string => value.toFixed(3).replace(/\.?0+$/, '');

/** `oklch(L C h)`, trailing zeros trimmed, so a derived tone prints the
 *  literal `:root` carries byte for byte. */
export const formatOklch = (tone: Tone): string =>
  `oklch(${shortest(tone.L)} ${shortest(tone.C)} ${shortest(tone.h)})`;

/** `oklch(L C H)` -> { L, C, h }. L and C accept the percentage forms. */
export function parseOklch(value: string): Tone {
  const match = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([-\d.]+)(?:deg)?\s*\)$/.exec(value);
  if (!match) throw new Error(`not a plain oklch() value: ${value}`);
  const scaled = (text: string, full: number): number =>
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
// as the CSS Color 4 sample code. Pinned in ground.test.mjs against
// published values the maths did not produce.
export function oklchToRgb255({ L, C, h }: Tone): number[] {
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

/** [r, g, b] -> `#rrggbb` — the form a contrast checker is given. */
export const toHex = (rgb: readonly number[]): string =>
  `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;

// ---- reading the stylesheet -------------------------------------------
// One parser, shared by the test and by the Node script that copies the
// ground into the social image: a second reader of `:root` would be a
// second thing to keep true.

/** Strip CSS comments — they carry braces and colons in this file. */
export const uncomment = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every brace block at the top level of `css`, as { prelude, body }. */
export function blocks(css: string): { prelude: string; body: string }[] {
  const found: { prelude: string; body: string }[] = [];
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
export function declarations(body: string): Record<string, string> {
  const flat = body.replace(/\{[^{}]*\}/g, '');
  const out: Record<string, string> = {};
  for (const part of flat.split(';')) {
    const at = part.indexOf(':');
    if (at === -1) continue;
    out[part.slice(0, at).trim()] = part.slice(at + 1).trim();
  }
  return out;
}

export const selects = (prelude: string, selector: string): boolean =>
  prelude.split(',').some((one) => one.trim() === selector);

/** Every declaration `:root` carries in a stylesheet, name -> value. */
export function rootTokens(css: string): Record<string, string> {
  const clean = uncomment(css);
  return Object.assign(
    {},
    ...blocks(clean)
      .filter((block) => selects(block.prelude, ':root'))
      .map((block) => declarations(block.body)),
  );
}

// ---- contrast ----------------------------------------------------------

/** WCAG 2's relative luminance of an 8-bit sRGB colour. */
export function relativeLuminance(rgb: readonly number[]): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The contrast ratio of two 8-bit colours, lighter over darker. */
export function contrastRgb(a: readonly number[], b: readonly number[]): number {
  const one = relativeLuminance(a);
  const two = relativeLuminance(b);
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

/** The contrast ratio of two tones — both ends rounded to the 8-bit
 *  sRGB the browser paints first, so this is the number a checker given
 *  the hex would report. */
export const contrast = (a: Tone, b: Tone): number =>
  contrastRgb(oklchToRgb255(a), oklchToRgb255(b));

/** WCAG 2's floor for normal text. Compared unrounded: a pass is a pass. */
export const FLOOR = 4.5;

/** The fixed ends of the readout — the literal tones `:root` carries for
 *  `--color-text`, `--color-muted` and `--color-matte`, pinned to the
 *  stylesheet by the test. Never read off a computed style: the dev
 *  applier may already have put a deepened muted on `<html>`, and a DOM
 *  read would grade a failing tone as passing. */
export const TEXT: Tone = { L: 0.25, C: 0.01, h: 250 };
export const MUTED: Tone = { L: 0.5, C: 0.012, h: 250 };
export const MAT: Tone = { L: 1, C: 0, h: 0 };

export type Ink = 'text' | 'muted' | 'mat';
export type Ground = 'bg' | 'surface' | 'soft';
export type Pair = { id: string; ink: Ink; on: Ground; floored: boolean };

/** What the gate is judged on. Headings and the nav read `--color-text`;
 *  the prose, the lead, the cards' copy and the captions read
 *  `--color-muted`, inline code puts it on the soft fill and the note
 *  rows on the surface — so the muted row is the reading floor. The mat
 *  pair is information: a mat is not text and has no floor, but the
 *  gate is partly about whether white still reads as a mat. */
export const PAIRS: Pair[] = [
  { id: 'text/bg', ink: 'text', on: 'bg', floored: true },
  { id: 'text/surface', ink: 'text', on: 'surface', floored: true },
  { id: 'text/soft', ink: 'text', on: 'soft', floored: true },
  { id: 'muted/bg', ink: 'muted', on: 'bg', floored: true },
  { id: 'muted/surface', ink: 'muted', on: 'surface', floored: true },
  { id: 'muted/soft', ink: 'muted', on: 'soft', floored: true },
  { id: 'mat/bg', ink: 'mat', on: 'bg', floored: false },
];

const mutedPairs = PAIRS.filter((pair) => pair.ink === 'muted');

const mutedPasses = (family: Family, muted: Tone): boolean =>
  mutedPairs.every((pair) => contrast(muted, family[pair.on]) >= FLOOR);

/**
 * The spec's least step: if the muted text fails any of its three pairs
 * on this family, lower its L by 0.01 — the stylesheet's visible
 * quantum for the token, and a number the person can read at the gate —
 * until all three pass, and ship the first L that does. `null` when
 * nothing fails, which is the answer for a tone that needs no change.
 * The starting tone is a parameter so the sampler steps from what ships
 * while the test can pin the rule from a fixed point.
 */
export function deepenMuted(family: Family, from: Tone = MUTED): Tone | null {
  if (mutedPasses(family, from)) return null;
  for (let L = round3(from.L - 0.01); L >= 0; L = round3(L - 0.01)) {
    const candidate = { L, C: from.C, h: from.h };
    if (mutedPasses(family, candidate)) return candidate;
  }
  // Unreachable for any ground the tune can reach: black passes every
  // pair above L 0.5. Loud rather than silently wrong if it ever is.
  throw new Error(`no muted lightness passes on ${formatOklch(family.bg)}`);
}

export type Reading = {
  id: string;
  ink: Ink;
  on: Ground;
  /** Whether this pair is held to `FLOOR` — false on the mat pair. */
  floored: boolean;
  ratio: number;
  /** Whether the pair meets `FLOOR`, on the six text pairs. `null` on
   *  the mat pair: it is information, not a pass or a fail, and a
   *  `false` there would read as a failing site. */
  passes: boolean | null;
};
export type Readout = {
  family: Family;
  /** The muted tone that would ship on this ground. */
  muted: Tone;
  /** The deepened tone, or `null` when the committed muted holds. */
  deepened: Tone | null;
  /** The seven ratios at the readout's FIXED ends — `TEXT`, `MUTED`
   *  and `MAT` as the stylesheet carries them, the muted one
   *  UNDEEPENED. That is the row the gate has to see fail: graded
   *  against the deepened tone a failing ground would read as passing
   *  and the number that made it deepen would be nowhere. The pass
   *  flag is on the six text pairs; the mat pair carries `null`. */
  pairs: Reading[];
  /** Every floored pair meets `FLOOR` at the tones that would ship —
   *  so a ground whose muted row fails undeepened still passes here if
   *  the deeper muted it ships with clears the floor. */
  passes: boolean;
};

/** Everything the gate needs about one candidate ground: the family it
 *  implies, the seven ratios at the committed tones (the muted one as
 *  it stands today, so a failing row is visible), the muted tone that
 *  would actually ship, and whether every floored pair clears the floor
 *  once it does. The sampler prints both — the row failing at the
 *  undeepened value and the muted line at the shipped L. */
export function readout(bg: Tone): Readout {
  const family = deriveFamily(bg);
  const deepened = deepenMuted(family);
  const shipped = deepened ?? MUTED;
  const inks: { [K in Ink]: Tone } = { text: TEXT, muted: MUTED, mat: MAT };
  const pairs = PAIRS.map((pair) => {
    const ratio = contrast(inks[pair.ink], family[pair.on]);
    return {
      id: pair.id,
      ink: pair.ink,
      on: pair.on,
      floored: pair.floored,
      ratio,
      passes: pair.floored ? ratio >= FLOOR : null,
    };
  });
  return {
    family,
    muted: shipped,
    deepened,
    pairs,
    // Measured at the tones that would ship, not concluded from the
    // fact that a deepening happened: the muted pairs are re-read
    // against `shipped`, the rest stand as read.
    passes: pairs.every((reading) => {
      if (!reading.floored) return true;
      if (reading.ink === 'muted') return contrast(shipped, family[reading.on]) >= FLOOR;
      return reading.passes === true;
    }),
  };
}

/** The custom properties a ground would be applied as: the family's
 *  five, plus `--color-muted` only when this ground needs the deeper
 *  one — what the sampler sets, and what the stylesheet would land. */
export function tokensFor(bg: Tone): Record<string, string> {
  const family = deriveFamily(bg);
  const tokens: Record<string, string> = {};
  for (const key of Object.keys(GROUND_TOKENS) as (keyof Family)[]) {
    tokens[GROUND_TOKENS[key]] = formatOklch(family[key]);
  }
  const deepened = deepenMuted(family);
  if (deepened) tokens['--color-muted'] = formatOklch(deepened);
  return tokens;
}

// ---- the switch --------------------------------------------------------

export type Candidate = { id: string; bg: Tone; why: string };

/** The control's id: selecting it removes the override, so the control
 *  is the committed stylesheet itself and a stale override cannot pose
 *  as it. */
export const TODAY = 'today';

/**
 * The tone `:root` carried at spec 014's gate, as a literal the gate
 * never moves. `CANDIDATES.today` follows the landed ground; the
 * required spread is measured against this fixed point, so the test
 * stays true whichever tone lands.
 */
export const CONTROL: Tone = { L: 0.968, C: 0.006, h: 95 };

/** The fixed set on the sampler's switch, beside the free tune. */
export const CANDIDATES: Record<string, Candidate> = {
  paper: {
    id: 'paper',
    bg: { L: 0.99, C: 0.003, h: 100 },
    why: "the pre-003 paper-white, spec 013's white — its companions now by the rule",
  },
  light: {
    id: 'light',
    bg: { L: 0.98, C: 0.005, h: 95 },
    why: 'one step lighter than today',
  },
  today: {
    id: TODAY,
    bg: { L: 0.968, C: 0.006, h: 95 },
    why: 'the control — selecting it removes the override, so it is the stylesheet itself',
  },
  'deep-1': {
    id: 'deep-1',
    bg: { L: 0.95, C: 0.007, h: 95 },
    why: 'one step darker',
  },
  'deep-2': {
    id: 'deep-2',
    bg: { L: 0.93, C: 0.008, h: 95 },
    why: 'two steps darker',
  },
  'deep-3': {
    id: 'deep-3',
    bg: { L: 0.9, C: 0.009, h: 95 },
    why: 'the far bracket, where muted-on-ground itself fails',
  },
  cool: {
    id: 'cool',
    bg: { L: 0.968, C: 0.008, h: 250 },
    why: "today's lightness at the text's hue — a cool grey",
  },
  warm: {
    id: 'warm',
    bg: { L: 0.968, C: 0.012, h: 75 },
    why: "today's lightness, warmer and more coloured",
  },
};
