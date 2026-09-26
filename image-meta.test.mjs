import { describe, expect, it } from 'vitest';
import { BLOCKS } from './remark-pieces-blocks.mjs';
import {
  attachPrivates,
  BLOCK_BODIES,
  classifyContentImage,
  COMPARE_WIDTH,
  COMPARE_WIDTHS,
  compareSizes,
  compareStages,
  crossReferences,
  findIdCollisions,
  firstAltFor,
  formatCollision,
  groupByPlace,
  hasBlock,
  humanizeBasename,
  imageIdFor,
  imageUrlFor,
  isPrivateRaster,
  nearest,
  neighbours,
  parseImagePath,
  parseReference,
  passageFor,
  pieceFrames,
  placeNameProblem,
  placeOf,
  placeProblems,
  placeSummary,
  privateRole,
  privateTargetOf,
  referenceProblems,
  referencesImage,
  resolveStages,
  sectionsFor,
  validateGalleries,
} from './src/lib/image-meta.mjs';

// Spec 004's pure core. The registry (`src/lib/images.ts`) and the
// remark transform both derive ids through these functions; the tests
// below feed each caller's input form to the same rule so the two can't
// drift.

describe('image ids (T302)', () => {
  const globKey = '/src/content/pieces/where-the-fog-lets-go/land-b.jpg';
  const fsPath = '/Users/someone/photo-pieces/src/content/pieces/where-the-fog-lets-go/land-b.jpg';

  it('the registry (glob key) and the transform (resolved path) derive the same id', () => {
    expect(imageIdFor(globKey)).toBe('where-the-fog-lets-go/land-b');
    expect(imageIdFor(fsPath)).toBe('where-the-fog-lets-go/land-b');
  });

  it('the gallery root maps to the `gallery/` folder segment', () => {
    expect(imageIdFor('/src/content/gallery-images/harbour-01.jpg')).toBe('gallery/harbour-01');
  });

  it("the transform's test fixture derives from its parent folder name", () => {
    expect(imageIdFor('/repo/tests/fixtures/photo.jpg')).toBe('fixtures/photo');
  });

  it('parses the parts the registry needs and lowercases the extension', () => {
    expect(parseImagePath('/src/content/pieces/a-piece/Frame.JPG')).toEqual({
      id: 'a-piece/Frame',
      folder: 'a-piece',
      basename: 'Frame',
      ext: 'jpg',
      file: 'Frame.JPG',
    });
  });

  it('the page URL has one definition', () => {
    expect(imageUrlFor('a-piece/land-b')).toBe('/images/a-piece/land-b/');
  });

  it('a folder that is not a slug fails with a rename hint', () => {
    expect(() => imageIdFor('/src/content/pieces/Jetty Dawn/jetty.jpg')).toThrow(
      /folder "Jetty Dawn" is not a slug — rename it .* \(e\.g\. "jetty-dawn"\)/,
    );
  });

  it('a non-image extension fails naming the accepted set', () => {
    expect(() => imageIdFor('/src/content/pieces/a-piece/notes.txt')).toThrow(
      /"notes.txt" is not an accepted image — expected one of jpg, jpeg, png, webp, avif, tiff/,
    );
    expect(() => imageIdFor('/src/content/pieces/a-piece/anim.gif')).toThrow(
      /not an accepted image/,
    );
  });

  it('a bare file name with no parent folder cannot be an id', () => {
    expect(() => imageIdFor('photo.jpg')).toThrow(/no parent folder/);
  });

  it('a file name that cannot be a URL segment fails with a rename hint', () => {
    expect(() => imageIdFor('/src/content/pieces/a-piece/Fog 01.jpg')).toThrow(
      /file name "Fog 01.jpg" can't be a URL segment .* \(e\.g\. "fog-01\.jpg"\)/,
    );
    expect(() => imageIdFor('/src/content/pieces/a-piece/été.jpg')).toThrow(/URL segment/);
    // Camera-style names are fine.
    expect(imageIdFor('/src/content/pieces/a-piece/DSC_0001.JPG')).toBe('a-piece/DSC_0001');
  });
});

describe('registry classification (T302)', () => {
  it('a piece image carries its owning slug', () => {
    expect(classifyContentImage('/src/content/pieces/a-piece/land-a.jpg')).toMatchObject({
      root: 'pieces',
      pieceSlug: 'a-piece',
      nested: false,
      id: 'a-piece/land-a',
    });
  });

  it('a gallery-root image has no owning piece', () => {
    expect(classifyContentImage('/src/content/gallery-images/harbour-01.jpg')).toMatchObject({
      root: 'gallery-images',
      pieceSlug: null,
      nested: false,
      id: 'gallery/harbour-01',
    });
  });

  it('a file nested below an image home is flagged, not given a sub-folder id', () => {
    expect(classifyContentImage('/src/content/pieces/a-piece/detail/img.jpg')).toEqual({
      path: '/src/content/pieces/a-piece/detail/img.jpg',
      root: 'pieces',
      pieceSlug: 'a-piece',
      nested: true,
    });
    expect(classifyContentImage('/src/content/gallery-images/sets/img.jpg')).toMatchObject({
      root: 'gallery-images',
      nested: true,
    });
  });

  it('an image directly in pieces/ (no piece folder) is rejected, not minted', () => {
    expect(() => classifyContentImage('/src/content/pieces/stray.jpg')).toThrow(
      /sits directly in \/src\/content\/pieces\/ — a piece lives in its own folder/,
    );
  });

  it('files outside the two roots are rejected', () => {
    expect(() => classifyContentImage('/src/content/galleries/cover.jpg')).toThrow(
      /images live in pieces\/<slug>\/ or gallery-images\//,
    );
    expect(() => classifyContentImage('/src/assets/hero.jpg')).toThrow(/outside \/src\/content\//);
  });
});

describe('id collisions (T302)', () => {
  it('two files differing only by extension are reported together', () => {
    const collisions = findIdCollisions([
      '/src/content/pieces/a-piece/shot.jpg',
      '/src/content/pieces/a-piece/other.jpg',
      '/src/content/pieces/a-piece/shot.webp',
    ]);
    expect(collisions).toEqual([
      {
        id: 'a-piece/shot',
        files: ['/src/content/pieces/a-piece/shot.jpg', '/src/content/pieces/a-piece/shot.webp'],
      },
    ]);
    expect(formatCollision(collisions[0])).toBe(
      'image id "a-piece/shot" is claimed by 2 files (shot.jpg, shot.webp) — one image per basename per folder',
    );
  });

  it('the same basename in different folders is not a collision', () => {
    expect(
      findIdCollisions([
        '/src/content/pieces/a-piece/land-a.jpg',
        '/src/content/pieces/b-piece/land-a.jpg',
        '/src/content/gallery-images/land-a.jpg',
      ]),
    ).toEqual([]);
  });
});

describe('first alt in a piece body (T302)', () => {
  it('shorthand image', () => {
    expect(firstAltFor('Text\n\n![Crates at dawn](./land-c.jpg)\n', 'land-c')).toBe(
      'Crates at dawn',
    );
  });

  it('directive src + alt, in either directive form', () => {
    expect(
      firstAltFor('::wide{src="./land-b.jpg" alt="The market edge" bleed="right"}', 'land-b'),
    ).toBe('The market edge');
    expect(
      firstAltFor(':::tall{src="./port-b.jpg" alt="A stall, shot low"}\nCaption.\n:::', 'port-b'),
    ).toBe('A stall, shot low');
  });

  it('pair and triptych slots use their own alt attribute', () => {
    const body =
      '::triptych{left="./land-a.jpg" center="./port-a.jpg" right="./land-b.jpg" leftAlt="First stall" centerAlt="The vertical" rightAlt="Third stall" match="height"}';
    expect(firstAltFor(body, 'land-a')).toBe('First stall');
    expect(firstAltFor(body, 'port-a')).toBe('The vertical');
    expect(firstAltFor(body, 'land-b')).toBe('Third stall');
  });

  it('the first non-empty alt in document order wins', () => {
    const body = [
      '::single{src="./square.jpg" alt=""}',
      '![Second mention](./square.jpg)',
      '::inset{src="./square.jpg" alt="Third mention"}',
    ].join('\n\n');
    expect(firstAltFor(body, 'square')).toBe('Second mention');
  });

  it('accepts unquoted attribute values and a bare file name without ./', () => {
    expect(firstAltFor('::single{src=land-a.jpg alt="Bare"}', 'land-a')).toBe('Bare');
  });

  it('references into other folders never match, and no reference means undefined', () => {
    expect(firstAltFor('![Elsewhere](../other/land-a.jpg)', 'land-a')).toBeUndefined();
    expect(firstAltFor('![Nested](./detail/land-a.jpg)', 'land-a')).toBeUndefined();
    expect(firstAltFor('Nothing here.', 'land-a')).toBeUndefined();
    expect(firstAltFor('![Similar](./land-ab.jpg)', 'land-a')).toBeUndefined();
  });

  it("a compare's stage label is not the title: the held block's alt wins over a compare written first (T1701, spec 019)", () => {
    const body = [
      ':::compare\n![Camera](./_land-b.jpg)\nStraight from the card.\n![Finished](./land-b.jpg)\nThe print.\n:::',
      ':::held{src="./land-b.jpg" alt="The ridgeline at dawn"}\nWords beside it.\n:::',
    ].join('\n\n');
    expect(firstAltFor(body, 'land-b')).toBe('The ridgeline at dawn');
  });

  it('a compare as the only reference gives no title (T1701, spec 019)', () => {
    const body =
      ':::compare\n![Camera](./_land-b.jpg)\nStraight from the card.\n![Finished](./land-b.jpg)\nThe print.\n:::';
    expect(firstAltFor(body, 'land-b')).toBeUndefined();
  });
});

describe('humanized filename (T302)', () => {
  it('turns separators into spaces and capitalizes the first letter', () => {
    expect(humanizeBasename('land-a')).toBe('Land a');
    expect(humanizeBasename('IMG_1234')).toBe('IMG 1234');
    expect(humanizeBasename('harbour--dawn')).toBe('Harbour dawn');
  });
});

// Spec 006 — one reference rule, and private rasters.

describe('one reference rule (T401)', () => {
  it('finds a shorthand reference, with or without ./', () => {
    expect(referencesImage('Text\n\n![The bank](./land-b.jpg)', 'land-b')).toBe(true);
    expect(referencesImage('![](land-b.jpg)', 'land-b')).toBe(true);
  });

  it('finds a directive src and a pair/triptych slot', () => {
    expect(referencesImage('::wide{src="./land-b.jpg" alt="x"}', 'land-b')).toBe(true);
    expect(
      referencesImage(':::diptych{left="./land-c.jpg" right="./port-b.jpg"}\nCap.\n:::', 'port-b'),
    ).toBe(true);
    expect(referencesImage('::triptych{left=a.jpg center=land-b.jpg right=c.jpg}', 'land-b')).toBe(
      true,
    );
  });

  it('a near-miss basename, another folder, or no reference is not a reference', () => {
    expect(referencesImage('![x](./land-bb.jpg)', 'land-b')).toBe(false);
    expect(referencesImage('![x](./land-b.jpg)', 'land-bb')).toBe(false);
    expect(referencesImage('![x](../other/land-b.jpg)', 'land-b')).toBe(false);
    expect(referencesImage('Prose that mentions land-b.jpg in passing.', 'land-b')).toBe(false);
    expect(referencesImage('', 'land-b')).toBe(false);
  });

  it('the title fallback uses the same rule (alt="" is a reference without a title)', () => {
    const body = '::single{src="./land-b.jpg" alt=""}';
    expect(referencesImage(body, 'land-b')).toBe(true);
    expect(firstAltFor(body, 'land-b')).toBeUndefined();
  });
});

describe('private rasters (T401)', () => {
  it('a leading underscore marks a raster private, naming its target', () => {
    expect(isPrivateRaster('_land-b')).toBe(true);
    expect(privateTargetOf('_land-b')).toBe('land-b');
    expect(isPrivateRaster('land-b')).toBe(false);
    expect(isPrivateRaster('DSC_0001')).toBe(false);
  });

  it('is classified as private before an id would be minted, in either root and case', () => {
    expect(classifyContentImage('/src/content/pieces/a-piece/_land-b.jpg')).toEqual({
      path: '/src/content/pieces/a-piece/_land-b.jpg',
      root: 'pieces',
      pieceSlug: 'a-piece',
      nested: false,
      private: true,
      folder: 'a-piece',
      basename: '_land-b',
      target: 'land-b',
      ext: 'jpg',
      file: '_land-b.jpg',
    });
    expect(classifyContentImage('/src/content/pieces/a-piece/_land-b.JPG')).toMatchObject({
      private: true,
      target: 'land-b',
      ext: 'jpg',
    });
    expect(classifyContentImage('/src/content/gallery-images/_x.webp')).toMatchObject({
      private: true,
      folder: 'gallery',
      target: 'x',
      pieceSlug: null,
    });
    expect(classifyContentImage('/src/content/pieces/a-piece/land-a.jpg')).toMatchObject({
      private: false,
      id: 'a-piece/land-a',
    });
  });

  it('parseImagePath refuses to mint an id for a private raster (the transform checks earlier, with the same sentence)', () => {
    expect(() => imageIdFor('/src/content/pieces/a-piece/_land-b.jpg')).toThrow(
      `"_land-b.jpg" is private — a file of "land-b" (its camera's frame, a stage, or the loupe's export), not an image of the site: it has no page and can't be placed in a piece or a gallery`,
    );
    expect(() => parseImagePath('/src/content/gallery-images/_dock-b.png')).toThrow(/is private/);
  });
});

describe('piece order (T402)', () => {
  const body = [
    'Opening prose.',
    '![First](./land-a.jpg)',
    ':::wide{src="./land-b.jpg" alt="Second"}\nCaption.\n:::',
    '::diptych{left="./land-c.jpg" right="./port-b.jpg" leftAlt="l" rightAlt="r"}',
    '![Again](./land-a.jpg)',
  ].join('\n\n');

  it('is first-reference order, then the unreferenced by name', () => {
    const basenames = ['square', 'port-b', 'land-c', 'pano', 'land-b', 'land-a', 'port-a'];
    expect(pieceFrames(body, 'a-piece', basenames)).toEqual([
      'a-piece/land-a',
      'a-piece/land-b',
      'a-piece/land-c',
      'a-piece/port-b',
      'a-piece/pano',
      'a-piece/port-a',
      'a-piece/square',
    ]);
  });

  it('a body with no references is name order; no frames is empty', () => {
    expect(pieceFrames('Just words.', 'a-piece', ['b', 'a'])).toEqual(['a-piece/a', 'a-piece/b']);
    expect(pieceFrames(body, 'a-piece', [])).toEqual([]);
  });
});

describe('neighbours and nearest (T402)', () => {
  const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

  it('neighbours at the start, in the middle, at the end, and absent', () => {
    expect(neighbours(list, 'a')).toEqual({ index: 0, next: 'b' });
    expect(neighbours(list, 'e')).toEqual({ index: 4, prev: 'd', next: 'f' });
    expect(neighbours(list, 'i')).toEqual({ index: 8, prev: 'h' });
    expect(neighbours(list, 'zz')).toEqual({ index: -1 });
    expect(neighbours(['only'], 'only')).toEqual({ index: 0 });
  });

  it('nearest takes half a side each in the middle, and the balance from the other side at an end', () => {
    expect(nearest(list, 'e', 6)).toEqual(['b', 'c', 'd', 'f', 'g', 'h']);
    expect(nearest(list, 'a', 6)).toEqual(['b', 'c', 'd', 'e', 'f', 'g']);
    expect(nearest(list, 'i', 6)).toEqual(['c', 'd', 'e', 'f', 'g', 'h']);
    expect(nearest(list, 'b', 4)).toEqual(['a', 'c', 'd', 'e']);
  });

  it('nearest never exceeds the list, never includes the id, and is empty when absent', () => {
    expect(nearest(['a', 'b', 'c'], 'b', 6)).toEqual(['a', 'c']);
    expect(nearest(['a'], 'a', 6)).toEqual([]);
    expect(nearest(list, 'zz', 6)).toEqual([]);
    expect(nearest(list, 'e', 0)).toEqual([]);
  });
});

describe('the passage an image sits in (T402)', () => {
  const body = [
    '# Heading',
    'The forecast said the fog would burn off by eight.',
    '![The trail](./land-a.jpg)',
    'By half past, the first seams opened.',
    ':::wide{src="./land-b.jpg" alt="The ridgeline"}\nThe ten minutes.\n:::',
    'I worked fast.',
    ':::diptych{left="./land-c.jpg" right="./port-b.jpg" leftAlt="l" rightAlt="r"}\nSame cove, three minutes apart.\n:::',
    'From the top of the bluff:',
    ':::strip\n![The full sweep](./pano.jpg)\n\nDrag sideways — the pano keeps its height.\n:::',
    '::fullbleed{src="./land-b.jpg" alt="Again"}',
  ].join('\n\n');

  it('a shorthand reference takes the nearest earlier prose block', () => {
    expect(passageFor(body, 'land-a')).toEqual({
      prose: 'The forecast said the fog would burn off by eight.',
    });
  });

  it('a container block gives its prose and its caption; a pair slot counts', () => {
    expect(passageFor(body, 'land-b')).toEqual({
      prose: 'By half past, the first seams opened.',
      caption: 'The ten minutes.',
    });
    expect(passageFor(body, 'port-b')).toEqual({
      prose: 'I worked fast.',
      caption: 'Same cove, three minutes apart.',
    });
  });

  it("a strip's caption is its caption line, never the image line, even after a blank line", () => {
    expect(passageFor(body, 'pano')).toEqual({
      prose: 'From the top of the bluff:',
      caption: 'Drag sideways — the pano keeps its height.',
    });
  });

  it('image-bearing blocks and headings are skipped on the way back to prose', () => {
    const skipping = ['# Title', '![Other](./other.jpg)', '::single{src="./x.jpg" alt="x"}'].join(
      '\n\n',
    );
    expect(passageFor(skipping, 'x')).toBeNull();
    const withProse = ['Words first.', '![Other](./other.jpg)', '![Mine](./x.jpg)'].join('\n\n');
    expect(passageFor(withProse, 'x')).toEqual({ prose: 'Words first.' });
  });

  it('the first reference wins, and no reference is null', () => {
    // land-b is referenced twice; the wide block (first) is the passage,
    // not the closing fullbleed.
    expect(passageFor(body, 'land-b').caption).toBe('The ten minutes.');
    expect(passageFor(body, 'square')).toBeNull();
    expect(passageFor('', 'land-a')).toBeNull();
  });
});

describe('the passage by body kind (T502, spec 007)', () => {
  it("BLOCK_BODIES agrees with the transform's descriptor table — names and kinds", () => {
    // One source of truth: the transform's descriptors declare their
    // body; this module (Astro-free, so it can't import them) mirrors
    // the declaration. Every descriptor's `body ?? 'none'` must equal
    // the map's entry, and the two name sets must be equal.
    const fromTransform = Object.fromEntries(
      Object.entries(BLOCKS).map(([name, block]) => [name, block.body ?? 'none']),
    );
    expect(BLOCK_BODIES).toEqual(fromTransform);
    expect(Object.keys(BLOCK_BODIES).sort()).toEqual(Object.keys(BLOCKS).sort());
    // And the kinds stay within the ones the descriptor model documents:
    // a new kind added in step on both sides would otherwise fall
    // silently into passageFor's "no caption" default. `stages` (spec
    // 019, the compare) is added deliberately — it contributes no
    // caption, pinned below.
    for (const kind of Object.values(BLOCK_BODIES)) {
      expect(['caption', 'prose', 'images+caption', 'stages', 'none']).toContain(kind);
    }
  });

  it("a grid's caption line is its caption, like a strip's", () => {
    const body = [
      'Four corners:',
      ':::grid\n![a](./g-a.jpg)\n![b](./g-b.jpg)\n\nThe same morning, four ways.\n:::',
    ].join('\n\n');
    expect(passageFor(body, 'g-b')).toEqual({
      prose: 'Four corners:',
      caption: 'The same morning, four ways.',
    });
  });

  it('a prose-bodied block (row, aside, held) gives the prose before it and no caption', () => {
    const body = [
      'Before the row.',
      ':::row{src="./r.jpg" alt="r" side="left"}\nWords beside the row.\n\nMore words.\n:::',
      'Before the aside.',
      ':::aside{src="./a.jpg" alt="a" side="right"}\nWords wrapping the aside.\n:::',
      'Before the held frame.',
      ':::held{src="./h.jpg" alt="h" side="right" bleed}\nFirst paragraph beside the frame.\n\nSecond paragraph beside the frame.\n:::',
    ].join('\n\n');
    expect(passageFor(body, 'r')).toEqual({ prose: 'Before the row.' });
    expect(passageFor(body, 'a')).toEqual({ prose: 'Before the aside.' });
    expect(passageFor(body, 'h')).toEqual({ prose: 'Before the held frame.' });
  });

  it('a prose-bodied block with nothing before it has no passage at all', () => {
    // Its own body must not be quoted as a caption in the absence of
    // prose — the whole point of the body-kind rule.
    const body = ':::held{src="./h.jpg" alt="h"}\nOnly the body.\n:::';
    expect(passageFor(body, 'h')).toBeNull();
  });

  it("a compare's stage notes are not the photograph's caption (T1701, spec 019)", () => {
    const body = [
      'Before the compare.',
      ':::compare\n![Camera](./_land-b.jpg)\nStraight from the card.\n![Finished](./land-b.jpg)\nThe print.\n:::',
    ].join('\n\n');
    expect(passageFor(body, 'land-b')).toEqual({ prose: 'Before the compare.' });
  });

  it('a stages body (the compare, T1705) contributes no caption', () => {
    // The notes sit on their own lines, so a caption-bodied reading would
    // quote them: only the body kind keeps them out.
    expect(BLOCK_BODIES.compare).toBe('stages');
    const body = [
      'Before the compare.',
      ':::compare{mode="side"}\n![Camera](./_land-b.jpg)\nStraight from the card.\n\n![Finished](./land-b.jpg)\nThe print.\n:::',
    ].join('\n\n');
    expect(passageFor(body, 'land-b')).toEqual({ prose: 'Before the compare.' });
    expect(passageFor(body, '_land-b')).toEqual({ prose: 'Before the compare.' });
  });
});

describe('the sections a page renders (T402)', () => {
  const empty = {
    hasStory: false,
    record: {},
    print: {},
    before: null,
    passage: null,
    related: [],
  };

  it('an empty sidecar is the label alone', () => {
    expect(sectionsFor(empty)).toEqual(['label']);
    expect(sectionsFor({})).toEqual(['label']);
  });

  it('a story alone adds only the story, ahead of the label', () => {
    expect(sectionsFor({ ...empty, hasStory: true })).toEqual(['story', 'label']);
  });

  it('fields alone add their sections, in spec order', () => {
    expect(
      sectionsFor({ ...empty, print: { sizes: '12 × 18' }, record: { filters: 'None' } }),
    ).toEqual(['label', 'record', 'print']);
    expect(sectionsFor({ ...empty, record: { format: '  ' } })).toEqual(['label']);
  });

  it('everything, in spec order', () => {
    expect(
      sectionsFor({
        hasStory: true,
        record: { format: 'Digital', processing: 'Lifted the shadows.' },
        print: { edition: 'Open' },
        before: { src: 'x' },
        passage: { prose: 'p' },
        related: ['a'],
      }),
    ).toEqual(['story', 'label', 'record', 'compare', 'passage', 'related', 'print']);
  });

  it('the processing note has one home: the compare when the frame exists, the record otherwise', () => {
    const note = { ...empty, record: { processing: 'Lifted the shadows.' } };
    expect(sectionsFor(note)).toEqual(['label', 'record']);
    expect(sectionsFor({ ...note, before: { src: 'x' } })).toEqual(['label', 'compare']);
  });

  it('declared stages alone show the compare, and it takes the processing note (T1701, spec 019)', () => {
    const staged = {
      ...empty,
      record: { processing: 'Lifted the shadows.' },
      stages: [{ key: 'k', label: 'Tones' }],
    };
    expect(sectionsFor(staged)).toEqual(['label', 'compare']);
  });

  it("a story that writes its own compare suppresses the page's and hands the note to the record (T1701, spec 019)", () => {
    const own = {
      ...empty,
      hasStory: true,
      storyHasCompare: true,
      record: { processing: 'Lifted the shadows.' },
      before: { src: 'x' },
      stages: [{ key: 'k', label: 'Tones' }],
    };
    expect(sectionsFor(own)).toEqual(['story', 'label', 'record']);
  });
});

// Spec 008 — cross-piece references: a src may leave the piece's folder
// for another piece's or the gallery root, and the frame keeps its home.

describe('cross-piece references (T601, spec 008)', () => {
  const notAccepted = (src) =>
    `image src "${src}" is not a path this site accepts — a piece places its own images as ./<file>, another piece's as ../<slug>/<file>, and a gallery-root image as ../../gallery-images/<file>`;

  it('the three accepted shapes give their kind, folder, and file parts', () => {
    expect(parseReference('./land-b.jpg')).toEqual({
      kind: 'local',
      folder: null,
      file: 'land-b.jpg',
      basename: 'land-b',
      ext: 'jpg',
    });
    expect(parseReference('land-b.JPG')).toEqual({
      kind: 'local',
      folder: null,
      file: 'land-b.JPG',
      basename: 'land-b',
      ext: 'jpg',
    });
    expect(parseReference('../where-the-fog-lets-go/land-b.jpg')).toEqual({
      kind: 'piece',
      folder: 'where-the-fog-lets-go',
      file: 'land-b.jpg',
      basename: 'land-b',
      ext: 'jpg',
    });
    expect(parseReference('../../gallery-images/dock-a.jpg')).toEqual({
      kind: 'gallery',
      folder: 'gallery',
      file: 'dock-a.jpg',
      basename: 'dock-a',
      ext: 'jpg',
    });
  });

  it('every other shape is invalid, with the message naming all three shapes', () => {
    for (const src of [
      './detail/land-a.jpg',
      'detail/land-a.jpg',
      '../beta/detail/land-a.jpg',
      '../../../land-a.jpg',
      '../gallery-images/dock-a.jpg',
      '../../elsewhere/dock-a.jpg',
      '../../x.jpg',
      '../Beta/land-a.jpg',
      '..',
      '../beta/',
    ]) {
      expect(parseReference(src).kind, src).toBe('invalid');
      expect(parseReference(src).message, src).toBe(notAccepted(src));
    }
  });

  it('a remote or root-absolute src is not this rule to judge', () => {
    expect(parseReference('https://example.com/land-a.jpg').kind).toBe('external');
    expect(parseReference('/land-a.jpg').kind).toBe('external');
  });

  it('a non-string src is external too — there is no path here to judge', () => {
    expect(parseReference(undefined).kind).toBe('external');
    expect(parseReference(null).kind).toBe('external');
  });

  it('a piece frames its own images, borrowed ones in place, unreferenced after', () => {
    const body = [
      'Opening prose.',
      '![First](./land-a.jpg)',
      '::single{src="../where-the-fog-lets-go/land-b.jpg" alt="Borrowed"}',
      ':::wide{src="../../gallery-images/dock-a.jpg" alt="From the root"}\nCaption.\n:::',
      '![Not in this folder](./ghost.jpg)',
      '![Again](./land-a.jpg)',
    ].join('\n\n');
    expect(pieceFrames(body, 'a-piece', ['square', 'land-a', 'pano'])).toEqual([
      'a-piece/land-a',
      'where-the-fog-lets-go/land-b',
      'gallery/dock-a',
      'a-piece/pano',
      'a-piece/square',
    ]);
  });

  it('a local src that is not an accepted raster seats no frame of its own', () => {
    // `land-a` lives in this folder as a jpg, but the body names an
    // `.svg`: that file is not an image the site pages, so it seats
    // nothing — `a-piece/land-a` may only appear in the unreferenced
    // tail, behind the borrowed frame the body really does place.
    const body = ['![Vector](./land-a.svg)', '![Borrowed](../beta/port-b.jpg)'].join('\n\n');
    expect(pieceFrames(body, 'a-piece', ['land-a'])).toEqual(['beta/port-b', 'a-piece/land-a']);
  });

  it("a pair's slots keep their order, and a frame written twice keeps its first place", () => {
    const body = [
      '::diptych{left="./land-c.jpg" right="../beta/port-b.jpg" leftAlt="l" rightAlt="r"}',
      '![Again](./land-c.jpg)',
      '::single{src="../beta/port-b.jpg" alt="Again"}',
    ].join('\n\n');
    expect(pieceFrames(body, 'a-piece', ['land-c'])).toEqual(['a-piece/land-c', 'beta/port-b']);
  });

  it("the long shape into the piece's own folder is the same frame as the local one", () => {
    // The transform refuses this shape (only it knows its own folder);
    // here it must not double the frame, whichever comes first.
    const localFirst = '![Its own](./x.jpg)\n\n::single{src="../own/x.jpg" alt="The long way"}';
    const longFirst = '::single{src="../own/x.jpg" alt="The long way"}\n\n![Its own](./x.jpg)';
    expect(pieceFrames(localFirst, 'own', ['x'])).toEqual(['own/x']);
    expect(pieceFrames(longFirst, 'own', ['x'])).toEqual(['own/x']);
  });

  it('the borrowed ids a body places, deduplicated, in document order', () => {
    const body = [
      '![Local](./land-a.jpg)',
      '::single{src="../../gallery-images/dock-a.jpg" alt="g"}',
      ':::diptych{left="../beta/port-b.jpg" right="./land-c.jpg"}\nCap.\n:::',
      '![Again](../../gallery-images/dock-a.jpg)',
      '![Wrong](./detail/land-d.jpg)',
    ].join('\n\n');
    expect(crossReferences(body)).toEqual(['gallery/dock-a', 'beta/port-b']);
    expect(crossReferences('Just words.')).toEqual([]);
  });

  it('a borrowed file the site does not page is no reference at all', () => {
    expect(crossReferences('::single{src="../beta/diagram.svg" alt="d"}')).toEqual([]);
  });

  it('a borrowed src that is not an accepted raster seats no frame and borrows nothing', () => {
    // `beta/land-a` is a photograph the site pages — as a jpg. A `.tif`
    // of that basename is not it, and not a raster this site accepts,
    // so it mints no id in either direction.
    const body = '::single{src="../beta/land-a.tif" alt="Not a photograph"}';
    expect(pieceFrames(body, 'a-piece', ['land-c'])).toEqual(['a-piece/land-c']);
    expect(crossReferences(body)).toEqual([]);
  });

  const known = new Map([
    ['where-the-fog-lets-go/land-b', 'published'],
    ['gallery/dock-a', 'published'],
    ['a-draft/land-a', 'draft'],
    ['no-piece/land-a', 'unowned'],
  ]);

  it('a draft target fails, naming the home piece to publish first', () => {
    expect(referenceProblems('the-sampler', ['a-draft/land-a'], known)).toEqual([
      '[images] the-sampler places a-draft/land-a from a-draft, which is a draft — publish a-draft first, or place a photograph that has a page',
    ]);
  });

  it('a folder with no index.md is not a piece yet', () => {
    expect(referenceProblems('the-sampler', ['no-piece/land-a'], known)).toEqual([
      '[images] the-sampler places no-piece/land-a, but src/content/pieces/no-piece/ has no index.md — it is not a piece yet',
    ]);
  });

  it('an id the registry does not list is not an image this site pages', () => {
    expect(referenceProblems('the-sampler', ['beta/diagram'], known)).toEqual([
      '[images] the-sampler places beta/diagram, which is not an image this site pages',
    ]);
  });

  it('a published image, in a piece folder or the gallery root, is no problem', () => {
    expect(
      referenceProblems('the-sampler', ['where-the-fog-lets-go/land-b', 'gallery/dock-a'], known),
    ).toEqual([]);
    expect(referenceProblems('the-sampler', [], known)).toEqual([]);
  });

  it("a borrowed frame's alt is never a local title, and its src is not a local reference", () => {
    const body = [
      'The retrospective opens.',
      '::single{src="../where-the-fog-lets-go/land-b.jpg" alt="The bank"}',
      'Then its own frame.',
      '![Its own](./land-b.jpg)',
    ].join('\n\n');
    expect(firstAltFor(body, 'land-b')).toBe('Its own');
    expect(passageFor(body, 'land-b')).toEqual({ prose: 'Then its own frame.' });
    expect(referencesImage('![The bank](../where-the-fog-lets-go/land-b.jpg)', 'land-b')).toBe(
      false,
    );
    expect(referencesImage('![Dock](../../gallery-images/dock-a.jpg)', 'dock-a')).toBe(false);
  });
});

describe('places (T701, spec 009)', () => {
  it("a frame's own line always wins over its piece's default", () => {
    expect(placeOf('sombrio-beach', 'jetty')).toBe('sombrio-beach');
  });

  it('`none` under a default puts the frame at no place', () => {
    expect(placeOf('none', 'jetty')).toBe(null);
  });

  it('a frame with no line of its own takes the piece default', () => {
    expect(placeOf(undefined, 'jetty')).toBe('jetty');
  });

  it('a piece default of `none` is no default — the word means the same on a piece', () => {
    expect(placeOf(undefined, 'none')).toBe(null);
    expect(placeOf('', 'none')).toBe(null);
  });

  it('a frame with no line and no default is at no place', () => {
    expect(placeOf(undefined, undefined)).toBe(null);
    expect(placeOf(null, null)).toBe(null);
  });

  it('blanks are unset, on the frame and on the piece, and values are trimmed', () => {
    expect(placeOf('   ', 'jetty')).toBe('jetty');
    expect(placeOf('  sombrio-beach  ', '')).toBe('sombrio-beach');
    expect(placeOf('  ', '   ')).toBe(null);
  });

  it("a place file's name is a slug, or it is not a URL", () => {
    expect(placeNameProblem('sombrio-beach', 'src/content/places/sombrio-beach.md')).toBe(null);
    expect(placeNameProblem('Sombrio Beach', 'src/content/places/Sombrio Beach.md')).toBe(
      "[places] src/content/places/Sombrio Beach.md: a place's file name is its URL — lowercase letters, digits, and hyphens only",
    );
    expect(placeNameProblem('sombrio.beach', 'src/content/places/sombrio.beach.md')).toBe(
      "[places] src/content/places/sombrio.beach.md: a place's file name is its URL — lowercase letters, digits, and hyphens only",
    );
  });

  it('`none` is the word for no place, so no place may be named it', () => {
    expect(placeNameProblem('none', 'src/content/places/none.md')).toBe(
      '[places] src/content/places/none.md: "none" is the word for no place — a place needs another name',
    );
  });

  it('an unknown slug names the file and lists the declared places, sorted', () => {
    expect(
      placeProblems(
        [{ file: 'src/content/pieces/alpha/index.md', slug: 'jety' }],
        ['sombrio-beach', 'jetty', 'botanical-beach'],
      ),
    ).toEqual([
      '[places] src/content/pieces/alpha/index.md: no place named "jety" — the places are: botanical-beach, jetty, sombrio-beach',
    ]);
  });

  it('with no place declared at all, the message says how to declare one', () => {
    expect(
      placeProblems([{ file: 'src/content/pieces/alpha/_land-a.md', slug: 'jetty' }], []),
    ).toEqual([
      '[places] src/content/pieces/alpha/_land-a.md: no place named "jetty" — none is declared yet: add src/content/places/jetty.md',
    ]);
  });

  it('a known slug and `none` are no problem, on a piece or on a sidecar', () => {
    expect(
      placeProblems(
        [
          { file: 'src/content/pieces/alpha/index.md', slug: 'none' },
          { file: 'src/content/pieces/alpha/_land-a.md', slug: 'jetty' },
          { file: 'src/content/pieces/alpha/_land-b.md', slug: 'none' },
          { file: 'src/content/pieces/beta/index.md', slug: '' },
        ],
        ['jetty'],
      ),
    ).toEqual([]);
  });

  it('every problem comes back at once, in the order the refs came', () => {
    expect(
      placeProblems(
        [
          { file: 'src/content/pieces/alpha/index.md', slug: 'jety' },
          { file: 'src/content/pieces/alpha/_land-a.md', slug: 'jetty' },
          { file: 'src/content/pieces/beta/_port-b.md', slug: 'sombrio' },
        ],
        ['jetty', 'sombrio-beach'],
      ),
    ).toEqual([
      '[places] src/content/pieces/alpha/index.md: no place named "jety" — the places are: jetty, sombrio-beach',
      '[places] src/content/pieces/beta/_port-b.md: no place named "sombrio" — the places are: jetty, sombrio-beach',
    ]);
  });

  it('a borrowed frame is never counted under the borrower', () => {
    const grouped = groupByPlace(
      new Map([
        ['alpha', ['alpha/land-a', 'beta/port-b', 'gallery/dock-a']],
        ['beta', ['beta/port-b']],
      ]),
      new Map([
        ['alpha/land-a', 'jetty'],
        ['beta/port-b', 'jetty'],
        ['gallery/dock-a', 'jetty'],
      ]),
      ['alpha', 'beta'],
    );
    expect(grouped.get('jetty')).toEqual({
      outings: [
        { piece: 'alpha', frames: ['alpha/land-a'] },
        { piece: 'beta', frames: ['beta/port-b'] },
      ],
      frames: ['alpha/land-a', 'beta/port-b'],
    });
  });

  it('a frame at another place lands under its own piece in that other place', () => {
    const grouped = groupByPlace(
      new Map([['alpha', ['alpha/land-a', 'alpha/land-b']]]),
      new Map([
        ['alpha/land-a', 'jetty'],
        ['alpha/land-b', 'sombrio-beach'],
      ]),
      ['alpha'],
    );
    expect(grouped.get('sombrio-beach')).toEqual({
      outings: [{ piece: 'alpha', frames: ['alpha/land-b'] }],
      frames: ['alpha/land-b'],
    });
    expect(grouped.get('jetty').frames).toEqual(['alpha/land-a']);
  });

  it('outings follow the piece order given, oldest first', () => {
    const framesByPiece = new Map([
      ['alpha', ['alpha/land-a']],
      ['beta', ['beta/port-b']],
    ]);
    const placeOfId = new Map([
      ['alpha/land-a', 'jetty'],
      ['beta/port-b', 'jetty'],
    ]);
    expect(groupByPlace(framesByPiece, placeOfId, ['beta', 'alpha']).get('jetty').outings).toEqual([
      { piece: 'beta', frames: ['beta/port-b'] },
      { piece: 'alpha', frames: ['alpha/land-a'] },
    ]);
    expect(groupByPlace(framesByPiece, placeOfId, ['beta', 'alpha']).get('jetty').frames).toEqual([
      'beta/port-b',
      'alpha/land-a',
    ]);
  });

  it("within an outing the piece's own order is kept", () => {
    const grouped = groupByPlace(
      new Map([['alpha', ['alpha/pano', 'alpha/land-a', 'alpha/square']]]),
      new Map([
        ['alpha/pano', 'jetty'],
        ['alpha/land-a', 'jetty'],
        ['alpha/square', 'jetty'],
      ]),
      ['alpha'],
    );
    const order = ['alpha/pano', 'alpha/land-a', 'alpha/square'];
    expect(grouped.get('jetty').outings[0].frames).toEqual(order);
    expect(grouped.get('jetty').frames).toEqual(order);
  });

  it('a place with no frame is absent, and a piece with no frames contributes nothing', () => {
    const grouped = groupByPlace(
      new Map([['alpha', ['alpha/land-a']]]),
      new Map([['alpha/land-a', null]]),
      ['alpha', 'ghost'],
    );
    expect(grouped.has('jetty')).toBe(false);
    expect([...grouped.keys()]).toEqual([]);
  });

  it("the card line counts outings and frames, and names the place's years", () => {
    const dates = new Map([
      ['alpha', new Date(Date.UTC(2019, 4, 2))],
      ['beta', new Date(Date.UTC(2026, 7, 30))],
    ]);
    expect(placeSummary([{ piece: 'beta', frames: ['beta/port-b'] }], dates)).toBe(
      '1 outing · 1 frame · 2026',
    );
    expect(
      placeSummary(
        [
          { piece: 'alpha', frames: ['alpha/a', 'alpha/b', 'alpha/c', 'alpha/d'] },
          { piece: 'beta', frames: ['beta/a', 'beta/b', 'beta/c'] },
        ],
        dates,
      ),
    ).toBe('2 outings · 7 frames · 2019–2026');
  });
});

describe('the private-file family (T1701, spec 019)', () => {
  const folder = ['land-b', 'land.b', 'land'];

  it("_X beside X is the camera's frame", () => {
    expect(privateRole('_land-b', folder)).toEqual({ role: 'frame', target: 'land-b' });
  });

  it('_X.word beside X is a stage of X', () => {
    expect(privateRole('_land-b.tones', folder)).toEqual({
      role: 'stage',
      target: 'land-b',
      word: 'tones',
    });
  });

  it("_X.detail beside X is the loupe's detail export", () => {
    expect(privateRole('_land-b.detail', new Set(folder))).toEqual({
      role: 'detail',
      target: 'land-b',
      word: 'detail',
    });
  });

  it('_land.b beside land.b is its frame, not stage b of land (frame first)', () => {
    expect(privateRole('_land.b', folder)).toEqual({ role: 'frame', target: 'land.b' });
  });

  it('a _ file whose photograph is not beside it is an orphan', () => {
    expect(privateRole('_land-b.tones', ['land-c'])).toEqual({ role: 'orphan', target: 'land-b' });
    expect(privateRole('_land-b.tones', undefined)).toEqual({ role: 'orphan', target: 'land-b' });
  });

  it('privateTargetOf strips the _ and a trailing .word (messages only)', () => {
    expect(privateTargetOf('_land-b.tones')).toBe('land-b');
    expect(privateTargetOf('_land-b.detail')).toBe('land-b');
    expect(privateTargetOf('_land-b')).toBe('land-b');
  });

  const priv = (folderName, file) => ({
    key: `/src/content/pieces/${folderName}/${file}`,
    folder: folderName,
    basename: file.slice(0, file.lastIndexOf('.')),
    file,
  });

  it('attachPrivates gives the frame, the detail and the stages in file-name order', () => {
    const out = attachPrivates(
      [
        priv('x', '_land-b.tones.jpg'),
        priv('x', '_land-b.jpg'),
        priv('x', '_land-b.detail.png'),
        priv('x', '_land-b.dodge.jpg'),
      ],
      new Map([['x', new Set(['land-b'])]]),
    );
    expect(out.problems).toEqual([]);
    expect(out.frame).toEqual(new Map([['x/land-b', '/src/content/pieces/x/_land-b.jpg']]));
    expect(out.detail).toEqual(new Map([['x/land-b', '/src/content/pieces/x/_land-b.detail.png']]));
    expect(out.stages).toEqual(
      new Map([
        [
          'x/land-b',
          [
            { file: '_land-b.dodge.jpg', key: '/src/content/pieces/x/_land-b.dodge.jpg' },
            { file: '_land-b.tones.jpg', key: '/src/content/pieces/x/_land-b.tones.jpg' },
          ],
        ],
      ]),
    );
  });

  it('attachPrivates reports an orphan, a second frame and a second detail, one line each', () => {
    const out = attachPrivates(
      [
        priv('x', '_land-b.jpg'),
        priv('x', '_land-b.png'),
        priv('x', '_land-b.detail.jpg'),
        priv('x', '_land-b.detail.png'),
        priv('x', '_land-c.tones.jpg'),
      ],
      new Map([['x', new Set(['land-b'])]]),
    );
    expect(out.problems).toEqual([
      'src/content/pieces/x/_land-b.png is a second camera\'s frame for "x/land-b" — keep one (any accepted extension)',
      'src/content/pieces/x/_land-b.detail.png is a second detail export for "x/land-b" — keep one',
      'src/content/pieces/x/_land-c.tones.jpg has no photograph: a "_" file belongs to the photograph it names, so "land-c.<ext>" should sit beside it (its camera\'s frame is _land-c.<ext>, a stage _land-c.<word>.<ext>, the loupe\'s export _land-c.detail.<ext>)',
    ]);
    expect(out.frame.get('x/land-b')).toBe('/src/content/pieces/x/_land-b.jpg');
    expect(out.detail.get('x/land-b')).toBe('/src/content/pieces/x/_land-b.detail.jpg');
  });

  const where = 'src/content/pieces/x/_land-b.md';
  const own = [
    { file: '_land-b.dodge.jpg', key: 'k-dodge' },
    { file: '_land-b.tones.jpg', key: 'k-tones' },
  ];

  it("resolveStages keeps the sidecar's order, not the file order", () => {
    expect(
      resolveStages(
        [
          { file: '_land-b.tones.jpg', label: 'Tones', note: 'The curve.' },
          { file: '_land-b.dodge.jpg', label: 'Dodge' },
        ],
        own,
        where,
      ),
    ).toEqual({
      stages: [
        { key: 'k-tones', label: 'Tones', note: 'The curve.' },
        { key: 'k-dodge', label: 'Dodge' },
      ],
      problems: [],
    });
  });

  it('resolveStages fails a non-stage, the frame, the detail export and a name listed twice, each with its line', () => {
    const out = resolveStages(
      [
        { file: '_land-b.tone.jpg', label: 'Typo' },
        { file: '_land-b.jpg', label: 'Camera' },
        { file: '_land-b.detail.jpg', label: 'Detail' },
        { file: '_land-b.tones.jpg', label: 'Tones' },
        { file: '_land-b.tones.jpg', label: 'Tones again' },
      ],
      own,
      where,
    );
    expect(out.problems).toEqual([
      'src/content/pieces/x/_land-b.md: stages lists "_land-b.tone.jpg", which is not a stage of "land-b" — a stage is _land-b.<word>.<ext> beside the photograph',
      'src/content/pieces/x/_land-b.md: stages lists "_land-b.jpg", the camera\'s frame — it is always the first stage; leave it out',
      'src/content/pieces/x/_land-b.md: stages lists "_land-b.detail.jpg", the loupe\'s export — not a stage',
      'src/content/pieces/x/_land-b.md: stages lists "_land-b.tones.jpg" twice',
    ]);
    expect(out.stages).toEqual([{ key: 'k-tones', label: 'Tones' }]);
  });

  it('a gallery listing a detail export is refused, naming its photograph', () => {
    const problems = validateGalleries(
      [
        {
          id: 'g',
          filePath: 'g.md',
          source: 'images:\n  - x/_land-b.detail\n',
          images: ['x/_land-b.detail'],
        },
      ],
      new Map([['x/land-b', 'published']]),
    );
    expect(problems.map((p) => p.reason)).toEqual([
      '"x/_land-b.detail" is private — a file of "land-b" (its camera\'s frame, a stage, or the loupe\'s export), not an image of the site: list "x/land-b" instead',
    ]);
  });

  const words = { camera: 'Camera', finished: 'Finished' };

  it("compareStages puts the camera's frame first and the photograph last with the processing note", () => {
    expect(
      compareStages(
        {
          before: 'raw',
          stages: [{ src: 'tones', label: 'Tones', note: 'The curve.' }],
          image: 'final',
          processing: 'Lifted the shadows.',
        },
        words,
      ),
    ).toEqual([
      { src: 'raw', label: 'Camera' },
      { src: 'tones', label: 'Tones', note: 'The curve.' },
      { src: 'final', label: 'Finished', note: 'Lifted the shadows.' },
    ]);
  });

  it("compareStages gives the camera's frame the camera note when one is given (T1709f)", () => {
    expect(
      compareStages(
        { before: 'raw', stages: [], image: 'final', processing: 'Lifted the shadows.' },
        { ...words, cameraNote: 'Straight out of camera.' },
      ),
    ).toEqual([
      { src: 'raw', label: 'Camera', note: 'Straight out of camera.' },
      { src: 'final', label: 'Finished', note: 'Lifted the shadows.' },
    ]);
  });

  it('compareStages omits the frame when there is none', () => {
    expect(
      compareStages(
        { before: null, stages: [{ src: 'tones', label: 'Tones' }], image: 'final' },
        words,
      ),
    ).toEqual([
      { src: 'tones', label: 'Tones' },
      { src: 'final', label: 'Finished' },
    ]);
  });

  it('hasBlock finds a :::compare container, not a ::compare leaf or the word in prose', () => {
    expect(hasBlock('Words.\n\n:::compare\n![A](./_a.jpg)\n![B](./a.jpg)\n:::', 'compare')).toBe(
      true,
    );
    expect(hasBlock('::compare{src="./a.jpg"}', 'compare')).toBe(false);
    expect(hasBlock('I would compare the two.\n\ncompare', 'compare')).toBe(false);
    expect(hasBlock(':::held{src="./a.jpg"}\nWords.\n:::', 'compare')).toBe(false);
  });

  it("the compare's widths: every surface's width is an allowed one, and each has its sizes hint", () => {
    for (const width of Object.values(COMPARE_WIDTH)) {
      expect(COMPARE_WIDTHS).toContain(width);
    }
    expect(compareSizes('column')).toBe('(min-width: 720px) 680px, 94vw');
    expect(compareSizes('wide')).toBe('(min-width: 1240px) 1160px, 96vw');
    expect(compareSizes('stage')).toBe('100vw');
  });
});
