import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

// Spec 012, T1002 — two standing guards on the place page's wall.
//
// The first: the template must carry none of its own packing values. The
// wall consumes `galleryFlowStyle`, `galleryCell(image)` and
// `gallery-wide` from src/lib/gallery-layout.ts, and renders from the
// registry's flat `place.frames` — which is what makes "the wall's order
// is the arrows' order" true by construction. A reintroduced local
// density (spec 011's `PLACE_SHORT_PX`/`placeFlowStyle`) or a per-outing
// map would otherwise fail nothing.
//
// The second: the writing-to-wall transition is a visual-gate decision
// (2026-09-13, candidate `wall-section`) that lives only in CSS —
// spec 010's reason verbatim. Retuning the token, or deleting either of
// the two rules that make the token the distance that renders, would
// otherwise fail nothing. Source order is load-bearing too:
// `.section.place-wall` and `.reading-head + .section` are both (0,2,0),
// and `.place-writing` and `.section` are both (0,1,0), so only the
// later rule wins.

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

/** The index of the one top-level rule whose selector is exactly `selector`
 *  (and, where given, which declares `declares`). Fails if it isn't unique. */
function indexOf(top, selector, declares) {
  const found = top
    .map((block, at) => ({ block, at }))
    .filter(
      ({ block }) =>
        selects(block.prelude, selector) &&
        (declares === undefined || declares in declarations(block.body)),
    );
  expect(found).toHaveLength(1);
  return found[0].at;
}

/** The template with its comment lines and JSX/CSS comments removed, so a
 *  word in a comment can neither satisfy nor break an assertion. */
const uncommentSource = (source) =>
  source
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');

let code;
let css;
let top;

beforeAll(async () => {
  code = uncommentSource(await readFile(here('./src/pages/places/[slug].astro'), 'utf8'));
  css = uncomment(await readFile(here('./src/styles/global.css'), 'utf8'));
  top = blocks(css);
});

describe("the place page consumes the galleries' knobs (T1002, spec 012)", () => {
  it('imports and uses galleryFlowStyle and the gallery-wide breakout', () => {
    expect(code).toMatch(
      /import\s*\{[^}]*\bgalleryFlowStyle\b[^}]*\}\s*from\s*'\.\.\/\.\.\/lib\/gallery-layout'/,
    );
    expect(code).toContain('style={galleryFlowStyle}');
    expect(code).toContain('gallery-wide');
  });

  it('carries no place-local packing value: no --gallery- literal, no placeFlowStyle, no PLACE_SHORT_PX', () => {
    expect(code).not.toMatch(/--gallery-/);
    expect(code).not.toMatch(/placeFlowStyle/);
    expect(code).not.toMatch(/PLACE_SHORT_PX/);
  });

  it("every galleryCell( call takes one argument — the default short is the galleries'", () => {
    const calls = [...code.matchAll(/galleryCell\(([^)]*)\)/g)].map((match) => match[1]);
    expect(calls.length).toBeGreaterThan(0);
    for (const args of calls) expect(args).not.toContain(',');
  });
});

describe('the place page renders one wall from place.frames (T1002, spec 012)', () => {
  it('maps place.frames and never touches place.outings', () => {
    expect(code).toContain('place.frames.map(');
    expect(code).not.toMatch(/place\.outings/);
  });

  it('holds exactly one gallery-flow list and names no outing', () => {
    expect(code.match(/class="gallery-flow/g)).toHaveLength(1);
    expect(code).not.toMatch(/outing/i);
  });

  it("still renders the head's summary line (AC 5: the place page's own summary unchanged)", () => {
    expect(code).toContain('{place.summary}');
  });
});

describe('the writing-to-wall gap in global.css (T1002, spec 012 gate)', () => {
  it("the gate's value: :root declares --place-wall-gap at one .section padding", () => {
    const roots = top.filter((block) => selects(block.prelude, ':root'));
    const rootDecls = Object.assign({}, ...roots.map((block) => declarations(block.body)));
    expect(rootDecls['--place-wall-gap']).toBe('clamp(3.5rem, 5.5vw, 5.5rem)');
  });

  it('the writing drops its bottom padding and its last block its margin, so the token is the distance', () => {
    const writing = top[indexOf(top, '.place-writing')];
    expect(declarations(writing.body)['padding-block-end']).toBe('0');
    const last = top[indexOf(top, '.place-writing .prose > :last-child')];
    expect(declarations(last.body)['margin-bottom']).toBe('0');
  });

  it('the wall section reads the token for its top padding', () => {
    const wall = top[indexOf(top, '.section.place-wall')];
    expect(declarations(wall.body)['padding-block-start']).toBe('var(--place-wall-gap)');
  });

  it('the gate took the same value after the head, so there is no head-case override', () => {
    const override = top.filter((block) =>
      selects(block.prelude, '.reading-head + .section.place-wall'),
    );
    expect(override).toHaveLength(0);
  });

  it('the wall rule comes later in source than .reading-head + .section (equal specificity)', () => {
    expect(indexOf(top, '.section.place-wall')).toBeGreaterThan(
      indexOf(top, '.reading-head + .section'),
    );
  });

  it('.place-writing comes later in source than .section (equal specificity)', () => {
    expect(indexOf(top, '.place-writing')).toBeGreaterThan(
      indexOf(top, '.section', 'padding-block'),
    );
  });
});
