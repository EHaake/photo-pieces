import { describe, expect, it } from 'vitest';
import {
  classifyContentImage,
  findIdCollisions,
  firstAltFor,
  formatCollision,
  humanizeBasename,
  imageIdFor,
  imageUrlFor,
  parseImagePath,
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
