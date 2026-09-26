import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { blocks, uncomment } from './src/lib/ground.ts';
import {
  LOUPE,
  LOUPE_AT_FIT,
  clampPan,
  fullScale,
  loupeImageOptions,
  loupeReduce,
  zoomAbout,
} from './src/lib/loupe.ts';

// The loupe (spec 019).
//
// (a) The file (T1710). `EXPECTED` below is the tunables' one other
//     copy: every LOUPE key and value, so a value retyped in loupe.ts
//     alone fails naming its key, and a key added or dropped fails the
//     name set. And the loupe's file: webp at the source's full size — a
//     format change, so a real transform that strips metadata — capped at
//     WebP's 16383px edge on the longer side, and one pixel less when the
//     source is already webp, the one request Astro's service would pass
//     through as the original. The build's side (the page's
//     `data-loupe-*`, the detail's original pruned, its transform kept)
//     is the barrier's scan 1, scripts/check-private-files.mjs.
//
// (b) The state (T1711). Full detail over the fit and the ready
//     threshold; a zoom keeps the point under the pointer where it was;
//     the pan clamp at each edge; and every transition of the plan's
//     "The loupe's state" a case of its own — Escape twice from zoomed
//     (close, then leave-quiet), ← at the fit (step-prev) against ←
//     zoomed (a pan, no effect), a movement under `dragSlop` then a
//     click (a click) against one over it (a drag), `opensOn: 'gesture'`
//     leaving on a click on the photograph while the wheel, a pinch and
//     + still open, the wheel reaching 1 (close).
//
// (c) The loupe's rules (T1712). The loupe's section of global.css holds
//     exactly its seven rules, each by its string: the ready
//     photograph's cursor and touch hand-off, the overlay, the drag's
//     cursor, the layer's origin, the glide on spec 018's move duration
//     and curve, the two images filling the layer, and the detail file's
//     appearance on the appearance duration and curve — so a literal, a
//     new token or a changed curve fails, and no other rule there
//     animates or transitions. And the script writes `data-glide` only
//     when motion is not reduced (the zoom is a movement); the detail's
//     fade under reduced motion is motion.test.mjs (d)'s sixth rule.

/** The tunables, verbatim as src/lib/loupe.ts carries them: to retune,
 *  move the value in src/lib/loupe.ts and here. */
const EXPECTED = {
  LOUPE: {
    withoutDetail: true,
    pixelRatio: 1,
    minGain: 1.05,
    opensOn: 'click',
    pinch: true,
    wheelStep: 0.002,
    keyStep: 1.5,
    panStep: 0.15,
    dragSlop: 4,
    pan: 'follow',
    mat: 'off',
    zoomInKeys: ['+', '='],
    zoomOutKeys: ['-', '_'],
  },
};

const meta = (width, height, format) => ({ src: '/x', width, height, format });

describe('(a) the file (T1710)', () => {
  it('LOUPE holds exactly EXPECTED — every key, every value, none missing or extra', () => {
    expect(Object.keys(LOUPE).sort()).toEqual(Object.keys(EXPECTED.LOUPE).sort());
    for (const [key, value] of Object.entries(EXPECTED.LOUPE)) {
      expect([key, LOUPE[key]]).toEqual([key, value]);
    }
  });

  it('a jpg source is asked for as webp at its full width — a format change, so a real transform', () => {
    expect(loupeImageOptions(meta(5400, 3600, 'jpg'))).toEqual({
      src: meta(5400, 3600, 'jpg'),
      width: 5400,
      format: 'webp',
      layout: 'none',
    });
  });

  it('a webp source at its own width would pass the original through, so it asks for one pixel less', () => {
    expect(loupeImageOptions(meta(2400, 1600, 'webp'))).toEqual({
      src: meta(2400, 1600, 'webp'),
      width: 2399,
      format: 'webp',
      layout: 'none',
    });
  });

  it("a source past WebP's 16383px edge is scaled until its longer edge fits", () => {
    expect(loupeImageOptions(meta(20000, 10000, 'jpg')).width).toBe(16383);
    expect(loupeImageOptions(meta(10000, 20000, 'jpg')).width).toBe(8191);
  });
});

const BOX = { width: 1000, height: 600 };
const CTX = { box: BOX, full: 4 };
const at = (x, y) => ({ x, y });
/** The screen position of image point `p` (fit-box coordinates at scale 1) under `view`. */
const onScreen = (view, p) => ({ x: view.tx + p.x * view.s, y: view.ty + p.y * view.s });
/** Runs `actions` from `state` and returns the last step. */
const run = (state, actions, ctx = CTX) =>
  actions.reduce((step, action) => loupeReduce(step.state, action, ctx), {
    state,
    effect: 'none',
  });
/** Zoomed to full detail about the box's centre. */
const ZOOMED = loupeReduce(
  LOUPE_AT_FIT,
  { type: 'click', point: at(500, 300), on: 'photo' },
  CTX,
).state;

describe('(b) the state (T1711)', () => {
  it('fullScale: 5400 over a 1400px fit at dpr 2 is 1.93, ready', () => {
    const gain = fullScale({ natural: 5400, fit: 1400, dpr: 2 });
    expect(gain).toBeCloseTo(1.93, 2);
    expect(gain >= LOUPE.minGain).toBe(true);
  });

  it('fullScale: 1800 over a 1400px fit at dpr 2 is 0.64, not ready', () => {
    const gain = fullScale({ natural: 1800, fit: 1400, dpr: 2 });
    expect(gain).toBeCloseTo(0.64, 2);
    expect(gain >= LOUPE.minGain).toBe(false);
  });

  it('fullScale reads pixelRatio: two image pixels per device pixel halves the gain', () => {
    expect(fullScale({ natural: 5400, fit: 1400, dpr: 2 }, 2)).toBeCloseTo(0.96, 2);
  });

  it('zoomAbout keeps the point under the pointer where it was', () => {
    const cases = [
      [{ s: 1, tx: 0, ty: 0 }, at(200, 150), 3],
      [{ s: 2, tx: -300, ty: -200 }, at(700, 450), 3.5],
      [{ s: 3, tx: -900, ty: -500 }, at(400, 300), 2],
    ];
    for (const [view, point, scale] of cases) {
      const image = { x: (point.x - view.tx) / view.s, y: (point.y - view.ty) / view.s };
      const after = zoomAbout(view, point, scale, BOX);
      expect(after.s).toBe(scale);
      expect(onScreen(after, image).x).toBeCloseTo(point.x, 9);
      expect(onScreen(after, image).y).toBeCloseTo(point.y, 9);
    }
  });

  it('clampPan keeps the photograph covering its box at each edge', () => {
    const s = 2; // the layer is 2000 × 1200 over a 1000 × 600 box
    expect(clampPan({ s, tx: 50, ty: -100 }, BOX)).toEqual({ s, tx: 0, ty: -100 }); // left
    expect(clampPan({ s, tx: -1200, ty: -100 }, BOX)).toEqual({ s, tx: -1000, ty: -100 }); // right
    expect(clampPan({ s, tx: -400, ty: 30 }, BOX)).toEqual({ s, tx: -400, ty: 0 }); // top
    expect(clampPan({ s, tx: -400, ty: -700 }, BOX)).toEqual({ s, tx: -400, ty: -600 }); // bottom
    expect(clampPan({ s, tx: -400, ty: -100 }, BOX)).toEqual({ s, tx: -400, ty: -100 }); // inside
    expect(clampPan({ s: 1, tx: -5, ty: 5 }, BOX)).toEqual({ s: 1, tx: 0, ty: 0 }); // at the fit
  });

  describe('loupeReduce at the fit', () => {
    it('a click on the photograph (opensOn click) opens to full detail about the point', () => {
      const point = at(200, 150);
      const step = loupeReduce(LOUPE_AT_FIT, { type: 'click', point, on: 'photo' }, CTX);
      expect(step.effect).toBe('open');
      expect(step.state.level).toBe('zoomed');
      expect(step.state.view.s).toBe(CTX.full);
      expect(onScreen(step.state.view, point)).toEqual(point);
    });

    it("opensOn: 'gesture' — a click on the photograph leaves the quiet view; the wheel, a pinch and + still open", () => {
      const ctx = { ...CTX, tune: { opensOn: 'gesture' } };
      const click = loupeReduce(
        LOUPE_AT_FIT,
        { type: 'click', point: at(200, 150), on: 'photo' },
        ctx,
      );
      expect(click).toEqual({ state: LOUPE_AT_FIT, effect: 'leave-quiet' });
      const opens = [
        { type: 'wheel', point: at(200, 150), deltaY: -100 },
        { type: 'pinch', point: at(200, 150), ratio: 1.5 },
        { type: 'key', key: '+' },
      ].map((action) => {
        const step = loupeReduce(LOUPE_AT_FIT, action, ctx);
        return [action.type, step.effect, step.state.level];
      });
      expect(opens).toEqual([
        ['wheel', 'open', 'zoomed'],
        ['pinch', 'open', 'zoomed'],
        ['key', 'open', 'zoomed'],
      ]);
    });

    it('a wheel zooms continuously from 1 about the pointer (open)', () => {
      const point = at(300, 200);
      const step = loupeReduce(LOUPE_AT_FIT, { type: 'wheel', point, deltaY: -100 }, CTX);
      expect(step.effect).toBe('open');
      expect(step.state.level).toBe('zoomed');
      expect(step.state.view.s).toBeCloseTo(Math.exp(100 * LOUPE.wheelStep), 12);
      expect(onScreen(step.state.view, point).x).toBeCloseTo(point.x, 9);
      expect(onScreen(step.state.view, point).y).toBeCloseTo(point.y, 9);
    });

    it('a wheel outward at the fit stays at the fit', () => {
      const step = loupeReduce(LOUPE_AT_FIT, { type: 'wheel', point: at(1, 1), deltaY: 100 }, CTX);
      expect(step).toEqual({ state: LOUPE_AT_FIT, effect: 'none' });
    });

    it('a pinch zooms continuously from 1 about the fingers (open); pinch off, nothing', () => {
      const point = at(300, 200);
      const step = loupeReduce(LOUPE_AT_FIT, { type: 'pinch', point, ratio: 1.25 }, CTX);
      expect([step.effect, step.state.level, step.state.view.s]).toEqual(['open', 'zoomed', 1.25]);
      const off = { ...CTX, tune: { pinch: false } };
      expect(loupeReduce(LOUPE_AT_FIT, { type: 'pinch', point, ratio: 1.25 }, off)).toEqual({
        state: LOUPE_AT_FIT,
        effect: 'none',
      });
    });

    it('a zoom-in key zooms by keyStep about the centre (open); a zoom-out key does nothing', () => {
      for (const key of LOUPE.zoomInKeys) {
        const step = loupeReduce(LOUPE_AT_FIT, { type: 'key', key }, CTX);
        expect([key, step.effect, step.state.view.s]).toEqual([key, 'open', LOUPE.keyStep]);
        expect(onScreen(step.state.view, at(500, 300))).toEqual(at(500, 300));
      }
      for (const key of LOUPE.zoomOutKeys) {
        expect([key, loupeReduce(LOUPE_AT_FIT, { type: 'key', key }, CTX)]).toEqual([
          key,
          { state: LOUPE_AT_FIT, effect: 'none' },
        ]);
      }
    });

    it('Escape leaves the quiet view', () => {
      expect(loupeReduce(LOUPE_AT_FIT, { type: 'key', key: 'Escape' }, CTX)).toEqual({
        state: LOUPE_AT_FIT,
        effect: 'leave-quiet',
      });
    });

    it('← steps to the previous photograph, → to the next; ↑ and ↓ do nothing', () => {
      const effect = (key) => loupeReduce(LOUPE_AT_FIT, { type: 'key', key }, CTX).effect;
      expect(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].map(effect)).toEqual([
        'step-prev',
        'step-next',
        'none',
        'none',
      ]);
    });

    it('a click on the mat or the ground leaves the quiet view', () => {
      expect(
        loupeReduce(LOUPE_AT_FIT, { type: 'click', point: at(-20, 10), on: 'around' }, CTX),
      ).toEqual({ state: LOUPE_AT_FIT, effect: 'leave-quiet' });
    });

    it('a press and a move at the fit pan nothing', () => {
      const step = run(LOUPE_AT_FIT, [
        { type: 'press', point: at(100, 100) },
        { type: 'move', point: at(200, 200) },
      ]);
      expect(step).toEqual({ state: LOUPE_AT_FIT, effect: 'none' });
    });
  });

  describe('loupeReduce zoomed', () => {
    it('Escape twice from zoomed: back to the fit (close), then out of the quiet view (leave-quiet)', () => {
      const first = loupeReduce(ZOOMED, { type: 'key', key: 'Escape' }, CTX);
      expect(first).toEqual({ state: LOUPE_AT_FIT, effect: 'close' });
      const second = loupeReduce(first.state, { type: 'key', key: 'Escape' }, CTX);
      expect(second).toEqual({ state: LOUPE_AT_FIT, effect: 'leave-quiet' });
    });

    it('← zoomed pans by panStep of the box and steps nothing (against step-prev at the fit)', () => {
      const step = loupeReduce(ZOOMED, { type: 'key', key: 'ArrowLeft' }, CTX);
      expect(step.effect).toBe('none');
      expect(step.state.level).toBe('zoomed');
      expect(step.state.view).toEqual({
        ...ZOOMED.view,
        tx: ZOOMED.view.tx + LOUPE.panStep * BOX.width,
      });
    });

    it('→ ↑ ↓ zoomed pan by panStep of the box, no effect', () => {
      const pan = (key) => {
        const step = loupeReduce(ZOOMED, { type: 'key', key }, CTX);
        return [
          key,
          step.effect,
          step.state.view.tx - ZOOMED.view.tx,
          step.state.view.ty - ZOOMED.view.ty,
        ];
      };
      expect(['ArrowRight', 'ArrowUp', 'ArrowDown'].map(pan)).toEqual([
        ['ArrowRight', 'none', -LOUPE.panStep * BOX.width, 0],
        ['ArrowUp', 'none', 0, LOUPE.panStep * BOX.height],
        ['ArrowDown', 'none', 0, -LOUPE.panStep * BOX.height],
      ]);
    });

    it('an arrow pan stops at the edge', () => {
      const atLeft = { ...ZOOMED, view: { ...ZOOMED.view, tx: 0 } };
      expect(loupeReduce(atLeft, { type: 'key', key: 'ArrowLeft' }, CTX).state.view.tx).toBe(0);
    });

    it('a drag past dragSlop pans with the pointer, and the click after it keeps the zoom', () => {
      const move = LOUPE.dragSlop + 6;
      const step = run(ZOOMED, [
        { type: 'press', point: at(500, 300) },
        { type: 'move', point: at(500 + move, 300) },
        { type: 'release' },
      ]);
      expect(step.effect).toBe('none');
      expect(step.state.view).toEqual({ ...ZOOMED.view, tx: ZOOMED.view.tx + move });
      const click = loupeReduce(
        step.state,
        { type: 'click', point: at(500 + move, 300), on: 'photo' },
        CTX,
      );
      expect(click.effect).toBe('none');
      expect([click.state.level, click.state.view, click.state.press]).toEqual([
        'zoomed',
        step.state.view,
        null,
      ]);
    });

    it('a click after a movement under dragSlop is a click: back to the fit (close)', () => {
      const move = LOUPE.dragSlop - 1;
      const step = run(ZOOMED, [
        { type: 'press', point: at(500, 300) },
        { type: 'move', point: at(500 + move, 300) },
        { type: 'release' },
        { type: 'click', point: at(500 + move, 300), on: 'photo' },
      ]);
      expect(step).toEqual({ state: LOUPE_AT_FIT, effect: 'close' });
    });

    it('a move after the release pans nothing', () => {
      const step = run(ZOOMED, [
        { type: 'press', point: at(500, 300) },
        { type: 'release' },
        { type: 'move', point: at(600, 300) },
      ]);
      expect(step.state.view).toEqual(ZOOMED.view);
    });

    it("pan 'follow': a hover at the box's centre shows the centre, at a corner that corner", () => {
      const s = ZOOMED.view.s;
      const hover = (x, y) => loupeReduce(ZOOMED, { type: 'hover', point: at(x, y) }, CTX);
      const centre = hover(500, 300);
      expect(centre.effect).toBe('none');
      expect(centre.state.view).toEqual({
        s,
        tx: (BOX.width * (1 - s)) / 2,
        ty: (BOX.height * (1 - s)) / 2,
      });
      expect(hover(1000, 600).state.view).toEqual({
        s,
        tx: BOX.width * (1 - s),
        ty: BOX.height * (1 - s),
      });
      const topLeft = hover(0, 0).state.view;
      expect([topLeft.s, topLeft.tx + 0, topLeft.ty + 0]).toEqual([s, 0, 0]);
      const offCentre = hover(250, 450).state.view; // a quarter across, three quarters down
      expect(offCentre).toEqual({
        s,
        tx: 0.25 * BOX.width * (1 - s),
        ty: 0.75 * BOX.height * (1 - s),
      });
    });

    it("pan 'follow': a hover outside the box is clamped to its edge", () => {
      const s = ZOOMED.view.s;
      const hover = (x, y) => loupeReduce(ZOOMED, { type: 'hover', point: at(x, y) }, CTX);
      expect(hover(1200, 900).state.view).toEqual({
        s,
        tx: BOX.width * (1 - s),
        ty: BOX.height * (1 - s),
      });
      const before = hover(-40, -30).state.view;
      expect([before.tx + 0, before.ty + 0]).toEqual([0, 0]);
    });

    it("pan 'follow': a hover after an arrow pan overrides it", () => {
      const panned = loupeReduce(ZOOMED, { type: 'key', key: 'ArrowLeft' }, CTX).state;
      const step = loupeReduce(panned, { type: 'hover', point: at(1000, 600) }, CTX);
      expect(step.state.view.tx).toBe(BOX.width * (1 - ZOOMED.view.s));
    });

    it("a hover at the fit, or under pan 'drag', stays", () => {
      expect(loupeReduce(LOUPE_AT_FIT, { type: 'hover', point: at(900, 500) }, CTX)).toEqual({
        state: LOUPE_AT_FIT,
        effect: 'none',
      });
      const drag = { ...CTX, tune: { pan: 'drag' } };
      expect(loupeReduce(ZOOMED, { type: 'hover', point: at(900, 500) }, drag)).toEqual({
        state: ZOOMED,
        effect: 'none',
      });
    });

    it("pan 'drag': a mouse drag still pans with the pointer", () => {
      const drag = { ...CTX, tune: { pan: 'drag' } };
      const move = LOUPE.dragSlop + 6;
      const step = run(
        ZOOMED,
        [
          { type: 'press', point: at(500, 300) },
          { type: 'move', point: at(500 + move, 300) },
          { type: 'release' },
        ],
        drag,
      );
      expect(step.state.view).toEqual({ ...ZOOMED.view, tx: ZOOMED.view.tx + move });
    });

    it('the zoom keys zoom about the centre between 1 and full detail; reaching 1 closes', () => {
      const [inKey] = LOUPE.zoomInKeys;
      const [outKey] = LOUPE.zoomOutKeys;
      const half = loupeReduce(
        LOUPE_AT_FIT,
        { type: 'pinch', point: at(500, 300), ratio: 2 },
        CTX,
      ).state;
      const inStep = loupeReduce(half, { type: 'key', key: inKey }, CTX);
      expect([inStep.effect, inStep.state.view.s]).toEqual(['none', 2 * LOUPE.keyStep]);
      expect(onScreen(inStep.state.view, at(500, 300))).toEqual(at(500, 300));
      const capped = loupeReduce(ZOOMED, { type: 'key', key: inKey }, CTX);
      expect([capped.effect, capped.state.view.s]).toEqual(['none', CTX.full]);
      const outStep = loupeReduce(half, { type: 'key', key: outKey }, CTX);
      expect([outStep.effect, outStep.state.view.s]).toEqual(['none', 2 / LOUPE.keyStep]);
      expect(loupeReduce(outStep.state, { type: 'key', key: outKey }, CTX)).toEqual({
        state: LOUPE_AT_FIT,
        effect: 'close',
      });
    });

    it('the wheel zooms between 1 and full detail about the pointer, no effect', () => {
      const half = loupeReduce(
        LOUPE_AT_FIT,
        { type: 'pinch', point: at(500, 300), ratio: 2 },
        CTX,
      ).state;
      const point = at(600, 350);
      const step = loupeReduce(half, { type: 'wheel', point, deltaY: -50 }, CTX);
      expect(step.effect).toBe('none');
      expect(step.state.view.s).toBeCloseTo(2 * Math.exp(50 * LOUPE.wheelStep), 12);
      const image = { x: (point.x - half.view.tx) / 2, y: (point.y - half.view.ty) / 2 };
      expect(onScreen(step.state.view, image).x).toBeCloseTo(point.x, 9);
      expect(onScreen(step.state.view, image).y).toBeCloseTo(point.y, 9);
      const capped = loupeReduce(ZOOMED, { type: 'wheel', point, deltaY: -500 }, CTX);
      expect(capped.state.view.s).toBe(CTX.full);
    });

    it('the wheel reaching 1 closes', () => {
      const step = run(ZOOMED, [{ type: 'wheel', point: at(500, 300), deltaY: 2000 }]);
      expect(step).toEqual({ state: LOUPE_AT_FIT, effect: 'close' });
    });

    it('the pinch zooms between 1 and full detail; pinching to 1 closes', () => {
      const step = loupeReduce(ZOOMED, { type: 'pinch', point: at(500, 300), ratio: 0.5 }, CTX);
      expect([step.effect, step.state.view.s]).toEqual(['none', 2]);
      expect(
        loupeReduce(step.state, { type: 'pinch', point: at(500, 300), ratio: 0.5 }, CTX),
      ).toEqual({
        state: LOUPE_AT_FIT,
        effect: 'close',
      });
    });

    it('a zoom out keeps the photograph covering its box', () => {
      const corner = loupeReduce(
        LOUPE_AT_FIT,
        { type: 'click', point: at(0, 0), on: 'photo' },
        CTX,
      ).state;
      const step = loupeReduce(corner, { type: 'pinch', point: at(1000, 600), ratio: 0.5 }, CTX);
      expect(step.state.view).toEqual(clampPan(step.state.view, BOX));
    });
  });
});

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
/** One line, one space, no padding inside parens. */
const norm = (text) =>
  text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
/** Every rule in `css`, @-blocks opened, with the @-preludes it sits
 *  under (as compare.test.mjs reads them). */
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
/** The one top-level rule whose prelude is exactly `prelude`, as a map. */
const ruleAt = (rules, prelude) => {
  const found = rules.filter((rule) => rule.within.length === 0 && rule.prelude === prelude);
  expect([prelude, found.length]).toEqual([prelude, 1]);
  return Object.fromEntries(declarationPairs(found[0].body));
};
/** The loupe's section of global.css, from its header to the compare's. */
const loupeSection = (raw) => {
  const from = raw.indexOf('/* ---- The loupe (spec 019)');
  const to = raw.indexOf('/* ---- The compare (spec 019)');
  expect([from > -1, to > from]).toEqual([true, true]);
  return uncomment(raw.slice(from, to));
};

describe("(c) the loupe's rules (T1712)", () => {
  let raw;
  let css;
  let script;
  beforeAll(async () => {
    raw = await readFile(here('./src/styles/global.css'), 'utf8');
    css = uncomment(raw);
    script = await readFile(here('./src/lib/loupe.ts'), 'utf8');
  });

  const RULES = [
    [
      'html[data-quiet] .image-stage[data-loupe-ready] .image-frame img',
      { cursor: 'zoom-in', 'touch-action': 'none' },
    ],
    ['html[data-quiet] .image-stage[data-loupe-open] .image-frame', { padding: '0' }],
    [
      '.image-stage:has(> .loupe[data-glide]) .image-frame',
      { transition: 'padding var(--dur-move) var(--ease-move)' },
    ],
    [
      '.loupe',
      { position: 'absolute', overflow: 'hidden', cursor: 'zoom-out', 'touch-action': 'none' },
    ],
    ['.loupe[data-dragging]', { cursor: 'grabbing' }],
    ['.loupe-layer', { 'transform-origin': '0 0' }],
    [
      '.loupe[data-glide] .loupe-layer',
      { transition: 'transform var(--dur-move) var(--ease-move)' },
    ],
    [
      '.loupe-base, .loupe-detail',
      { position: 'absolute', inset: '0', width: '100%', height: '100%' },
    ],
    ['.loupe-detail', { animation: 'motion-appear var(--dur-appear) var(--ease-appear) both' }],
  ];

  for (const [prelude, body] of RULES)
    it(`${prelude} is exactly ${JSON.stringify(body)} — a literal, a new token or a changed curve fails`, () => {
      expect(ruleAt(rulesIn(css), prelude)).toEqual(body);
    });

  it("the loupe's section holds exactly the nine rules, in order — a rule added there fails", () => {
    expect(rulesIn(loupeSection(raw)).map((rule) => rule.prelude)).toEqual(
      RULES.map(([prelude]) => prelude),
    );
  });

  it("no other rule in the loupe's section animates or transitions — the glide, the mat's padding under it and the detail's fade are all its motion", () => {
    const moving = rulesIn(loupeSection(raw))
      .filter((rule) =>
        declarationPairs(rule.body).some(([name]) => /^(animation|transition)/.test(name)),
      )
      .map((rule) => rule.prelude);
    expect(moving).toEqual([
      '.image-stage:has(> .loupe[data-glide]) .image-frame',
      '.loupe[data-glide] .loupe-layer',
      '.loupe-detail',
    ]);
  });

  it('the script writes data-glide only behind !reducedMotion() — the zoom is a movement', () => {
    const writes = script.split('\n').filter((line) => /dataset\.glide\s*=/.test(line));
    expect(writes.length).toBeGreaterThan(0);
    expect(writes.filter((line) => !/if \(!reducedMotion\(\)/.test(line))).toEqual([]);
  });

  it("the script sets data-loupe-open only behind LOUPE.mat === 'off' — under 'kept' the mat stays (T1713b)", () => {
    const sets = script.split('\n').filter((line) => /toggleAttribute\('data-loupe-open'/.test(line));
    expect(sets.length).toBeGreaterThan(0);
    expect(sets.filter((line) => !/if \(LOUPE\.mat === 'off'\)/.test(line))).toEqual([]);
  });
});
