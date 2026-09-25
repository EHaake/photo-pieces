import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, truncateSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// The private-files barrier (spec 019, T1703), run for real against
// temporary fixture directories, as gps-barrier.test.mjs runs its own:
// the barrier takes an optional [dir], so no dist/ is touched.

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
// The barrier's per-file limit (scripts/check-private-files.mjs).
const MAX_BYTES = 25 * 1024 * 1024;

const DETAIL = '/_astro/land-b.detail.webp';
const OWN = '/_astro/land-b.own.webp';
const PAGE = 'images/where-the-fog-lets-go/land-b/index.html';
const html = (body) => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;
const stage = (url, detail = true) =>
  `<figure class="stage" data-loupe-src="${url}"${detail ? ' data-loupe-detail' : ''}><img src="/_astro/land-b.small.webp" alt=""></figure>`;

const part = (label, note) =>
  `<div class="compare-stage"><div class="compare-pane"><img src="/_astro/${label}.webp" alt="" class="astro-img"></div>` +
  `<figcaption class="compare-caption"><span class="compare-label">${label}</span>${note ? `<span class="compare-note">${note}</span>` : ''}</figcaption></div>`;
const compare = (inner) => `<figure class="compare" data-mode="slider"><div class="compare-frames">${inner}</div></figure>`;

describe('the private-files barrier (T1703, spec 019)', () => {
  const barrier = here('./scripts/check-private-files.mjs');
  let root;
  let count = 0;

  /** A fresh fixture dir holding `files` (path → text). */
  const site = (files) => {
    count += 1;
    const dir = join(root, `site-${count}`);
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), text);
    }
    return dir;
  };
  const run = (dir) => {
    try {
      return {
        status: 0,
        stdout: execFileSync(process.execPath, [barrier, dir], { encoding: 'utf8', stdio: 'pipe' }),
        stderr: '',
      };
    } catch (error) {
      return { status: error.status, stdout: error.stdout, stderr: error.stderr };
    }
  };
  /** An image page with a detail stage, its file present. */
  const withDetail = (files = {}) =>
    site({ [PAGE]: html(stage(DETAIL)), '_astro/land-b.detail.webp': 'webp', ...files });

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'private-files-'));
  });
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  describe('scan 1: the loupe file', () => {
    it('a detail stage whose file is missing fails, naming the URL and the page', () => {
      const dir = site({ [PAGE]: html(stage(DETAIL)) });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`[check-private-files] a loupe file missing from ${dir}/: ${DETAIL}`);
      expect(result.stderr).toContain(join(dir, PAGE));
    });

    it('a detail export also in an <img srcset> on a gallery page fails', () => {
      const gallery = join('galleries', 'fog-frames', 'index.html');
      const dir = withDetail({ [gallery]: html(`<img src="/a.webp" srcset="/a.webp 400w, ${DETAIL} 4000w" alt="">`) });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`a detail export named outside its loupe in ${join(dir, gallery)}: ${DETAIL}`);
    });

    it('a detail export in an og:image meta fails', () => {
      const other = join('images', 'x', 'index.html');
      const dir = withDetail({
        [other]: html(`<meta property="og:image" content="https://example.com${DETAIL}">`),
      });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`a detail export named outside its loupe in ${join(dir, other)}`);
    });

    it('a detail export in rss.xml fails', () => {
      const dir = withDetail({ 'rss.xml': `<rss><item><enclosure url="https://example.com${DETAIL}"/></item></rss>` });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`a detail export named outside its loupe in ${join(dir, 'rss.xml')}`);
    });

    it('a detail export named only in its own attribute exits 0 with the summary', () => {
      const dir = withDetail({ 'index.html': html('<p>home</p>') });
      const result = run(dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        '[check-private-files] 1 loupe files on 1 image pages, 1 of them detail exports named nowhere else; 0 compares in one shape; no compare or loupe state in 2 pages.',
      );
    });

    it('a loupe file over the per-file limit fails', () => {
      const dir = withDetail();
      truncateSync(join(dir, '_astro/land-b.detail.webp'), MAX_BYTES + 1); // sparse
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`a loupe file over 25.0 MiB: ${join(dir, '_astro/land-b.detail.webp')}`);
    });

    it('an own-file loupe (no data-loupe-detail) may share a srcset candidate', () => {
      const dir = site({
        [PAGE]: html(`${stage(OWN, false)}<img src="/a.webp" srcset="/a.webp 400w, ${OWN} 2400w" alt="">`),
        '_astro/land-b.own.webp': 'webp',
      });
      const result = run(dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('1 loupe files on 1 image pages, 0 of them detail exports');
    });
  });

  describe('scan 2: no script-only state in the markup', () => {
    it('data-js on a figure fails', () => {
      const dir = site({ 'pieces/x/index.html': html('<figure class="stage" data-js><img src="/a.webp" alt=""></figure>') });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        `[check-private-files] a script-only state in the markup of ${join(dir, 'pieces/x/index.html')}: data-js`,
      );
    });

    it('class="loupe" fails', () => {
      const dir = site({ 'index.html': html('<div class="loupe"></div>') });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`a script-only state in the markup of ${join(dir, 'index.html')}: .loupe`);
    });

    it('data-js and .loupe named only inside <script> and <style> exit 0', () => {
      const dir = site({
        'index.html': html(
          `<style>.stage[data-js] .loupe { opacity: 0 }</style><script>el.setAttribute('data-js', ''); el.innerHTML = '<div class="loupe" data-js></div>';</script><p>ok</p>`,
        ),
      });
      const result = run(dir);
      expect(result.status).toBe(0);
    });
  });

  describe('scan 3: one compare shape', () => {
    it('a compare in the shape with two stages, and one with three, exit 0', () => {
      const dir = site({
        'pieces/x/index.html': html(compare(part('camera') + part('finished', 'a note'))),
        [PAGE]: html(compare(part('camera') + part('first', 'n') + part('finished'))),
      });
      const result = run(dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('2 compares in one shape');
    });

    it('a class Astro or the page wrap adds is transparent', () => {
      const wrapped =
        '<div class="compare-stage"><div class="compare-pane"><picture class="astro-x"><img src="/a.webp" alt=""></picture></div>' +
        '<figcaption class="compare-caption"><span class="compare-label">a</span></figcaption></div>';
      const dir = site({ 'index.html': html(compare(wrapped + part('b'))) });
      expect(run(dir).status).toBe(0);
    });

    const outOfShape = (inner, reason) => {
      const dir = site({ 'pieces/x/index.html': html(compare(inner)) });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        `[check-private-files] a compare out of shape in ${join(dir, 'pieces/x/index.html')}: ${reason}`,
      );
    };

    it('a stage without compare-pane fails', () => {
      outOfShape(
        '<div class="compare-stage"><figcaption class="compare-caption"><span class="compare-label">a</span></figcaption></div>' + part('b'),
        'compare-stage > no compare-pane',
      );
    });

    it('a caption before its pane fails', () => {
      outOfShape(
        '<div class="compare-stage"><figcaption class="compare-caption"><span class="compare-label">a</span></figcaption>' +
          '<div class="compare-pane"><img src="/a.webp" alt=""></div></div>' + part('b'),
        'compare-stage > compare-caption before compare-pane',
      );
    });

    it('one stage fails', () => {
      outOfShape(part('a'), 'compare-frames > 1 compare-stage, not two or more');
    });

    it('a stray compare-classed element inside the frames fails', () => {
      outOfShape(part('a') + part('b') + '<div class="compare-frame"></div>', 'compare-frames > compare-frame, not part of the shape');
    });

    it('a note without a label fails', () => {
      outOfShape(
        '<div class="compare-stage"><div class="compare-pane"><img src="/a.webp" alt=""></div>' +
          '<figcaption class="compare-caption"><span class="compare-note">n</span></figcaption></div>' + part('b'),
        'compare-caption > compare-note without compare-label',
      );
    });

    // Spec 006's compare, skipped until T1706 rebuilt the image page's
    // section in the shared shape: now it is out of shape (scan 3) and
    // its tag and divider are script-only states (scan 2).
    it("spec 006's compare (a .compare holding .compare-range) fails both scans", () => {
      const old =
        '<figure class="compare"><div class="compare-frames">' +
        '<div class="compare-frame compare-before"><img src="/a.webp" alt=""><span class="compare-tag">Before</span></div>' +
        '<div class="compare-frame compare-after"><img src="/b.webp" alt=""><span class="compare-tag">After</span></div>' +
        '<span class="compare-line" aria-hidden="true"></span><input class="compare-range" type="range" hidden>' +
        '</div><figcaption class="compare-note">n</figcaption></figure>';
      const dir = site({ [PAGE]: html(old) });
      const result = run(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        `[check-private-files] a compare out of shape in ${join(dir, PAGE)}: compare > compare-note, not part of the shape`,
      );
      expect(result.stderr).toContain(`a script-only state in the markup of ${join(dir, PAGE)}: .compare-tag`);
      expect(result.stderr).toContain(`a script-only state in the markup of ${join(dir, PAGE)}: .compare-line`);
    });
  });
});
