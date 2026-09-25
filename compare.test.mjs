import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
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
