import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  INDEX_NARROW_SHORT_PX,
  INDEX_SHORT_PX,
  byIndexOrder,
  indexFlowStyle,
} from './src/lib/gallery-layout.ts';
import { FOOTER_LINKS, NAV_ITEMS, SITE } from './src/consts.ts';
import { en } from './src/i18n/en.ts';

// The lexicon's tunable envelope (spec 019): each knob in its one place,
// pinned here by name and value, so a change to one is a deliberate edit
// of this file too.

const ids = (list) => [...list].sort(byIndexOrder).map((x) => x.id);

describe('the photographs index (spec 019, T1747)', () => {
  it('the frame size: INDEX_SHORT_PX is 88 and INDEX_NARROW_SHORT_PX 72, both in the clamp', () => {
    expect(INDEX_SHORT_PX).toBe(88);
    expect(INDEX_NARROW_SHORT_PX).toBe(72);
    expect(indexFlowStyle).toContain('--gallery-short: clamp(72px, 11vw, 88px)');
  });

  it('the order ignores case: "bank" before "Dock, late"', () => {
    expect(
      ids([
        { id: 'dock-a', title: 'Dock, late' },
        { id: 'bank', title: 'bank' },
      ]),
    ).toEqual(['bank', 'dock-a']);
  });

  it('the order reads numbers as numbers: "Frame 2" before "Frame 10"', () => {
    expect(
      ids([
        { id: 'f10', title: 'Frame 10' },
        { id: 'f2', title: 'Frame 2' },
      ]),
    ).toEqual(['f2', 'f10']);
  });

  it('equal titles order by id', () => {
    expect(
      ids([
        { id: 'fog/land-b', title: 'Fog' },
        { id: 'fog/land-a', title: 'Fog' },
      ]),
    ).toEqual(['fog/land-a', 'fog/land-b']);
  });
});

describe('the footer and the nav (spec 019, T1747)', () => {
  it('the footer holds one link to /photographs/, "Index of photographs", after Contact; the nav none', () => {
    const index = FOOTER_LINKS.filter((l) => l.href === '/photographs/');
    expect(index).toEqual([{ href: '/photographs/', label: 'Index of photographs' }]);
    expect(FOOTER_LINKS.map((l) => l.href)).toEqual(['/contact/', '/photographs/']);
    expect(NAV_ITEMS.filter((i) => i.href === '/photographs/')).toEqual([]);
  });
});

describe('the words (spec 019, T1742)', () => {
  const navLabel = (item) => item.label ?? en[item.labelKey];

  it('the nav reads Home, Journal, Places, Galleries, About, Search; the sections are Journal, Places, Galleries with their hrefs', () => {
    expect(NAV_ITEMS.map(navLabel)).toEqual([
      'Home',
      'Journal',
      'Places',
      'Galleries',
      'About',
      'Search',
    ]);
    expect(NAV_ITEMS.filter((i) => i.label !== undefined)).toEqual([
      { href: '/journal/', label: 'Journal' },
      { href: '/places/', label: 'Places' },
      { href: '/galleries/', label: 'Galleries' },
    ]);
  });

  it('no "piece" or "pieces" in a nav label, SITE.description or SITE.rssDescription', () => {
    const words = [...NAV_ITEMS.map(navLabel), SITE.description, SITE.rssDescription];
    for (const text of words) expect(text).not.toMatch(/\bpieces?\b/i);
  });
});

// The lexicon barrier (spec 019, T1743), run for real against temporary
// trees, as private-files.test.mjs runs its own: the barrier takes
// optional [dist] and [content], so neither dist/ nor src/content/ is
// touched. Each case starts from a clean tree that passes and changes one
// thing.
describe('the lexicon barrier (spec 019, T1743)', () => {
  const barrier = fileURLToPath(new URL('./scripts/check-lexicon.mjs', import.meta.url));
  let root;
  let count = 0;

  const HEADER =
    '<header class="site-header"><nav class="site-nav" aria-label="Main navigation">' +
    '<a href="/">Home</a><a href="/journal/">Journal</a><a href="/places/">Places</a><a href="/galleries/">Galleries</a></nav></header>';
  const FOOTER =
    '<footer class="site-footer"><p>© Erik Haake</p><div class="footer-links"><a href="/contact/">Contact</a>' +
    '<a href="/photographs/">Index of photographs</a></div></footer>';
  /** A page in the layout: the header, `body` in <main>, the footer. */
  const page = (body, { title = 'Erik Haake', header = HEADER, footer = FOOTER } = {}) =>
    `<!doctype html><html><head><title>${title}</title></head><body>${header}<main>${body}</main>${footer}</body></html>`;
  const FEED = (links) => `<section class="section index-feed" aria-labelledby="latest-pieces"><ul>${links}</ul></section>`;
  /** A category page's main: its galleries' group, then its journal entries'. */
  const CATEGORY = (galleries, journal) =>
    '<section class="page-head section"><p class="eyebrow">Category</p><h1>Landscape</h1></section>' +
    `<section class="section category-group" aria-labelledby="category-galleries">${galleries}</section>` +
    `<section class="section category-group" aria-labelledby="category-pieces">${journal}</section>`;
  const INDEX = (ids) =>
    `<ul class="gallery-flow photographs-index">${ids.map((id) => `<li><a href="/photographs/${id}/"><img src="/_astro/x.webp" alt="x"></a></li>`).join('')}</ul>`;

  /** The clean tree: dist and content, each `path → text`, with overrides. */
  const clean = () => ({
    dist: {
      'index.html': page(FEED('<li><a href="/journal/fog/">Fog</a></li><li><a href="/photographs/dock-b/">Dock, late</a></li>')),
      'photographs/index.html': page(INDEX(['dock-b', 'fog/land-a'])),
      'photographs/dock-b/index.html': page('<h1>Dock, late</h1>'),
      'photographs/fog/land-a/index.html': page('<h1>Land</h1>'),
      'journal/fog/index.html': page('<h1>Fog</h1>'),
      'categories/landscape/index.html': page(
        CATEGORY('<ul class="gallery-cards"><li><a href="/galleries/fog/">Fog</a></li></ul>', '<ul><li><a href="/journal/fog/">Fog</a></li></ul>'),
      ),
      'rss.xml': '<rss><channel><item><link>https://erikhaakephoto.com/journal/fog/</link></item></channel></rss>',
      'sitemap-0.xml': '<urlset><url><loc>https://erikhaakephoto.com/photographs/dock-b/</loc></url></urlset>',
    },
    content: {
      'photographs/_dock-b.md': '---\ntitle: Dock, late\npublished: 2026-08-31\n---\n',
      'photographs/_draft-fixture.md': '---\ntitle: Draft fixture\ndraft: true\n---\n',
      'journal/fog/index.md': '---\ntitle: Fog\n---\n\nText.\n',
    },
  });

  /** A fresh tree from the clean one, `dist` and `content` merged in (null deletes). */
  const tree = ({ dist = {}, content = {} } = {}) => {
    count += 1;
    const dir = join(root, `tree-${count}`);
    const base = clean();
    for (const [part, extra] of [['dist', dist], ['content', content]]) {
      for (const [path, text] of Object.entries({ ...base[part], ...extra })) {
        const target = join(dir, part, path);
        mkdirSync(dirname(target), { recursive: true });
        if (text !== null) writeFileSync(target, text);
      }
    }
    return dir;
  };
  const run = (dir) => {
    try {
      return {
        status: 0,
        stdout: execFileSync(process.execPath, [barrier, join(dir, 'dist'), join(dir, 'content')], {
          encoding: 'utf8',
          stdio: 'pipe',
        }),
        stderr: '',
      };
    } catch (error) {
      return { status: error.status, stdout: error.stdout, stderr: error.stderr };
    }
  };
  const passes = (options) => {
    const result = run(tree(options));
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    return result;
  };
  const fails = (options, line) => {
    const dir = tree(options);
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(line.replaceAll('<dist>', join(dir, 'dist')));
    return result;
  };
  /** A page at `path` whose main holds `body`, beside the clean tree. */
  const withPage = (body, options = {}, path = 'journal/fog/index.html') => ({ dist: { [path]: page(body, options) } });

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'lexicon-'));
  });
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('the clean tree passes, with the summary line', () => {
    expect(passes().stdout).toContain(
      '[check-lexicon] 6 pages read, 0 authored regions set aside, 0 authored strings excused; 0 old addresses; 1 draft photographs, none published; 1 front-door photographs, each dated; the index lists 2 photographs, each once; 1 category pages, no photograph listed',
    );
  });

  describe('scan 1: the old addresses', () => {
    it('a dist/images/ folder fails', () => {
      fails({ dist: { 'images/x/index.html': page('') } }, '[check-lexicon] <dist>/images/ exists — a photograph is at /photographs/');
    });

    it('an href="/pieces/x/" fails, naming the file', () => {
      fails(withPage('<a href="/pieces/x/">x</a>'), '[check-lexicon] <dist>/journal/fog/index.html: links to /pieces/… — a journal entry is at /journal/…');
    });

    it('a sitemap <loc> on the site\'s origin under /images/ fails', () => {
      fails(
        { dist: { 'sitemap-0.xml': '<urlset><url><loc>https://erikhaakephoto.com/images/a/</loc></url></urlset>' } },
        '[check-lexicon] <dist>/sitemap-0.xml: links to /images/… — a photograph is at /photographs/…',
      );
    });

    it("an authored link to another host's /images/ passes", () => {
      passes(withPage('<div class="prose"><a href="https://example.com/images/x.jpg">x</a></div>'));
    });
  });

  describe('scan 2: the words', () => {
    const page_ = '<dist>/journal/fog/index.html';

    it('"Pieces" in a nav\'s text fails, with its context', () => {
      fails(
        { dist: { 'journal/fog/index.html': page('', { header: HEADER.replace('>Journal<', '>Pieces<') }) } },
        `[check-lexicon] ${page_}: "Pieces" in the page's words — "…Home Pieces Places Galleries ©`,
      );
    });

    it('"Piece" in a chrome <title> fails', () => {
      fails(withPage('', { title: 'Piece — Erik Haake' }), `[check-lexicon] ${page_}: "Piece" in the page's words`);
    });

    it('aria-label="All pieces" on a chrome element fails', () => {
      fails(withPage('<a href="/journal/" aria-label="All pieces">All</a>'), `[check-lexicon] ${page_}: "pieces" in the page's words — "…All pieces…"`);
    });

    it('the word in .prose, figcaption, blockquote and .image-caption passes: authored regions', () => {
      const result = passes(
        withPage(
          '<div class="prose piece-column"><p>This piece <em>is</em> written.</p><div><p>A nested piece.</p></div></div>' +
            '<figure><img src="/a.webp" alt=""><figcaption>A piece of it</figcaption></figure>' +
            '<blockquote>pieces quoted</blockquote><p class="image-caption">The piece again</p>',
        ),
      );
      expect(result.stdout).toContain('4 authored regions set aside');
    });

    it('a harvested title passes', () => {
      passes({
        dist: { 'photographs/dock-b/index.html': page('<h1>Dock, last piece</h1>') },
        content: { 'photographs/_dock-b.md': '---\ntitle: "Dock, last piece"\npublished: 2026-08-31\n---\n' },
      });
    });

    it('a harvested folded description (description: >- over two lines) printed in a p.lead passes', () => {
      passes({
        dist: { 'galleries/fog/index.html': page('<p class="lead">The frames from that piece in the order they were made.</p>') },
        content: {
          'galleries/fog.md': '---\ntitle: Fog\ndescription: >-\n  The frames from that piece in\n  the order they were made.\ndate: 2026-08-28\n---\n',
        },
      });
    });

    it('a harvested alt passes: ![…] and a directive\'s …Alt="…"', () => {
      passes({
        dist: { 'journal/fog/index.html': page('<p>The last piece of light</p><p>A piece on the left</p>') },
        content: {
          'journal/fog/index.md':
            '---\ntitle: Fog\n---\n\n![The last piece of light](./a.jpg)\n\n::diptych{left="./a.jpg" leftAlt="A piece on the left" right="./b.jpg"}\n',
        },
      });
    });

    it('the word in a class name, an href, a <script> and "masterpiece" passes', () => {
      passes(
        withPage(
          '<div class="piece-column"><a href="/journal/a-piece/">A masterpiece</a></div>' +
            '<script>const piece = "pieces";</script>',
        ),
      );
    });
  });

  describe('scan 3: the drafts', () => {
    it('a draft sidecar with a page fails', () => {
      fails(
        { dist: { 'photographs/draft-fixture/index.html': page('<h1>Draft fixture</h1>') } },
        '[check-lexicon] draft photograph "draft-fixture" has a page',
      );
    });

    it('a draft named in rss.xml fails, naming the file', () => {
      fails(
        { dist: { 'rss.xml': '<rss><channel><item><link>https://erikhaakephoto.com/photographs/draft-fixture/</link></item></channel></rss>' } },
        '[check-lexicon] draft photograph "draft-fixture" is named in <dist>/rss.xml',
      );
    });
  });

  describe('scan 4: the front door', () => {
    const feed = (name) => ({
      'index.html': page(FEED(`<li><a href="/photographs/${name}/">x</a></li>`)),
    });

    it('a front-door link to an undated photograph fails', () => {
      fails(
        { dist: feed('dock-a'), content: { 'photographs/_dock-a.md': '---\ntitle: Dock\n---\n' } },
        '[check-lexicon] the front door lists "dock-a", which has no published: date',
      );
    });

    it('a front-door link to a draft fails', () => {
      fails({ dist: feed('draft-fixture') }, '[check-lexicon] the front door lists "draft-fixture", which is a draft');
    });
  });

  describe('scan 5: the photographs index, the footer and the nav', () => {
    it("an index missing a photograph page's id fails", () => {
      fails({ dist: { 'photographs/index.html': page(INDEX(['dock-b'])) } }, '[check-lexicon] the photographs index misses "fog/land-a"');
    });

    it('an index listing an id twice fails', () => {
      fails(
        { dist: { 'photographs/index.html': page(INDEX(['dock-b', 'fog/land-a', 'dock-b'])) } },
        '[check-lexicon] the photographs index lists "dock-b" twice',
      );
    });

    it('an index listing an id with no page fails', () => {
      fails(
        { dist: { 'photographs/index.html': page(INDEX(['dock-b', 'fog/land-a', 'gone'])) } },
        '[check-lexicon] the photographs index lists "gone", which has no page',
      );
    });

    it('a footer without the link fails', () => {
      fails(
        withPage('', { footer: FOOTER.replace('<a href="/photographs/">Index of photographs</a>', '') }),
        '[check-lexicon] <dist>/journal/fog/index.html: the footer has 0 links to /photographs/ (one expected)',
      );
    });

    it('a footer with two links fails', () => {
      fails(
        withPage('', { footer: FOOTER.replace('</div>', '<a href="/photographs/">Again</a></div>') }),
        '[check-lexicon] <dist>/journal/fog/index.html: the footer has 2 links to /photographs/ (one expected)',
      );
    });

    it('a nav with the link fails', () => {
      fails(
        withPage('', { header: HEADER.replace('</nav>', '<a href="/photographs/">Photographs</a></nav>') }),
        '[check-lexicon] <dist>/journal/fog/index.html: the nav links to /photographs/',
      );
    });

    it("a <footer> inside .prose does not count as the site's", () => {
      passes(withPage('<div class="prose"><footer class="site-footer"><a href="/photographs/">All of them</a></footer></div>'));
    });
  });

  describe('scan 6: the category pages (T1751)', () => {
    const category = '<dist>/categories/landscape/index.html';
    const GALLERIES = '<ul class="gallery-cards"><li><a href="/galleries/fog/">Fog</a></li></ul>';
    const JOURNAL = '<ul><li><a href="/journal/fog/">Fog</a></li></ul>';
    const withCategory = (body) => ({ dist: { 'categories/landscape/index.html': page(body) } });

    it('a group holding a link to /photographs/dock-b/ fails, naming the file', () => {
      fails(
        withCategory(CATEGORY(GALLERIES, JOURNAL.replace('</ul>', '<li><a href="/photographs/dock-b/">Dock, late</a></li></ul>'))),
        `[check-lexicon] ${category}: a category page lists a photograph (/photographs/dock-b/) — category pages list galleries and journal entries`,
      );
    });

    it("a group holding a link to a journal folder's /photographs/fog/land-a/ fails", () => {
      fails(
        withCategory(CATEGORY(GALLERIES.replace('</ul>', '<li><a href="/photographs/fog/land-a/">Land</a></li></ul>'), JOURNAL)),
        `[check-lexicon] ${category}: a category page lists a photograph (/photographs/fog/land-a/)`,
      );
    });

    it('a link to /photographs/dock-b/ in a section of another class fails: the whole body is read', () => {
      fails(
        withCategory(CATEGORY(GALLERIES, JOURNAL) + '<section class="section category-photographs"><a href="/photographs/dock-b/">Dock, late</a></section>'),
        `[check-lexicon] ${category}: a category page lists a photograph (/photographs/dock-b/)`,
      );
    });

    it("the footer's bare /photographs/ passes", () => {
      const result = passes();
      expect(result.stdout).toContain('1 category pages, no photograph listed');
    });

    it('no category page fails: the guard against reading nothing', () => {
      fails(
        { dist: { 'categories/landscape/index.html': null } },
        '[check-lexicon] no page under <dist>/categories/ — the category pages are where scan 6 reads',
      );
    });
  });
});
