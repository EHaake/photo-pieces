import { describe, expect, it } from 'vitest';
import { BLOCKS } from './remark-pieces-blocks.mjs';
import {
  BLOCK_BODIES,
  classifyContentImage,
  crossReferences,
  findIdCollisions,
  firstAltFor,
  formatCollision,
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
  privateTargetOf,
  referenceProblems,
  referencesImage,
  sectionsFor,
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
      /"_land-b\.jpg" is private — the camera's frame of "land-b", not an image of the site/,
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
    // And the kinds stay within the four the descriptor model documents:
    // a fifth kind added in step on both sides would otherwise fall
    // silently into passageFor's "no caption" default.
    for (const kind of Object.values(BLOCK_BODIES)) {
      expect(['caption', 'prose', 'images+caption', 'none']).toContain(kind);
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

  it('a pause leaf gives the paragraph before it and no caption', () => {
    const body = [
      'The paragraph before the pause.',
      '::pause{src="./pano.jpg" alt="The full sweep"}',
      'The paragraph after.',
    ].join('\n\n');
    expect(passageFor(body, 'pano')).toEqual({ prose: 'The paragraph before the pause.' });
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
