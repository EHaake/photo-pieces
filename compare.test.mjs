import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  COMPARE,
  COMPARE_WORDING,
  noteIndex,
  openingMode,
  restView,
  sideFits,
  sidePair,
  sliderView,
  snapTo,
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
// (d) The state (T1707). `EXPECTED` below is the tunables' one other
//     copy: every COMPARE key and value and COMPARE_WORDING, so a value
//     retyped in compare.ts alone fails naming its key, and a key added
//     or dropped fails the name set. The pure rules the enhanced block
//     reads, each case named for what fails it: the slider's geometry as
//     a table — the track is the frame's width, the stops at k / (n − 1),
//     the segments indexed from the right so the right edge shows the
//     first stage whole and the left edge the last, an interior stop in
//     the segment to its right, two stages the pair (0, 1) throughout
//     (spec 006's compare) — and the snap, the side pair, the switch's
//     step with and without wrapping, the view at rest per method, whose
//     note shows, the side-by-side fit, and the method a block opens in.

/** The tunables and the words, verbatim as src/lib/compare.ts carries
 *  them: to retune, move the value in src/lib/compare.ts and here. */
const EXPECTED = {
  COMPARE: {
    defaultMode: 'slider',
    remember: 'visit',
    restAt: 0.5,
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
  },
  COMPARE_WORDING: {
    modes: { slider: 'Slider', side: 'Side by side', switch: 'Switch' },
    control: 'How to compare',
    legend: 'Stages',
    handle: 'Move between the stages',
  },
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

let page;
let css;

beforeAll(async () => {
  page = await readFile(here(`./${PAGE}`), 'utf8');
  css = uncomment(await readFile(here('./src/styles/global.css'), 'utf8'));
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

  // [p, pair, split]: the pair the frame shows with the handle at p;
  // the split to six places, so a third of the track reads 33.333333.
  const view = (p, n) => {
    const { left, right, split } = sliderView(p, n);
    return [p, [left, right], Math.round(split * 1e6) / 1e6];
  };

  it('two stages show the pair (0, 1) at every p, the split following the handle (spec 006)', () => {
    expect([0, 0.5, 1].map((p) => view(p, 2))).toEqual([
      [0, [0, 1], 0],
      [0.5, [0, 1], 50],
      [1, [0, 1], 100],
    ]);
  });

  it('three stages: segments from the right, the last stage whole at 0, the first at 1, the interior stop in the segment on its right', () => {
    expect([0, 0.25, 0.5, 0.75, 1].map((p) => view(p, 3))).toEqual([
      [0, [1, 2], 0],
      [0.25, [1, 2], 25],
      [0.5, [0, 1], 50],
      [0.75, [0, 1], 75],
      [1, [0, 1], 100],
    ]);
  });

  it('four stages: the last whole at 0, the first at 1, each interior stop the pair to its right', () => {
    expect([0, 1 / 3, 2 / 3, 1].map((p) => view(p, 4))).toEqual([
      [0, [2, 3], 0],
      [1 / 3, [1, 2], 33.333333],
      [2 / 3, [0, 1], 66.666667],
      [1, [0, 1], 100],
    ]);
  });

  it('snapTo settles on the nearest stop', () => {
    expect([0, 0.2, 0.3, 0.6, 0.8, 1].map((p) => snapTo(p, 3))).toEqual([0, 0, 0.5, 0.5, 1, 1]);
    expect([0.1, 0.4, 0.9].map((p) => snapTo(p, 2))).toEqual([0, 0, 1]);
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

  it('restView: the slider at restAt, side by side on the pair it shows, the switch on the first stage', () => {
    expect(restView('slider', 3)).toEqual(sliderView(COMPARE.restAt, 3));
    expect(restView('side', 4)).toEqual(sidePair(sliderView(COMPARE.restAt, 4).left, 4));
    expect(restView('switch', 3)).toEqual({ stage: 0 });
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
