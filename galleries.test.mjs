import { describe, expect, it } from 'vitest';
import { formatGalleryProblems, sidecarImageId, validateGalleries } from './src/lib/image-meta.mjs';

// Spec 004's gallery rules — the pure half of the registry
// (src/lib/images.ts), which feeds these the collection data and fails
// the build on what they return.

describe('sidecar → image id (T305)', () => {
  it('maps both roots', () => {
    expect(sidecarImageId('pieces/where-the-fog-lets-go/_land-b')).toBe(
      'where-the-fog-lets-go/land-b',
    );
    expect(sidecarImageId('gallery-images/_dock-b')).toBe('gallery/dock-b');
  });

  it('rejects any other shape', () => {
    expect(() => sidecarImageId('pieces/_stray')).toThrow(/is not an _<basename>\.md beside/);
    expect(() => sidecarImageId('pieces/a-piece/deeper/_x')).toThrow(/is not an _<basename>/);
    expect(() => sidecarImageId('galleries/_x')).toThrow(/is not an _<basename>/);
  });
});

describe('gallery validation (T305)', () => {
  const known = new Map([
    ['a-piece/land-a', 'published'],
    ['a-piece/land-b', 'published'],
    ['gallery/dock-a', 'published'],
    ['drafted/land-a', 'draft'],
    ['half-done/frame', 'unowned'],
  ]);
  const source = (...ids) =>
    [
      '---',
      'title: G',
      'category: landscape',
      'images:',
      ...ids.map((id) => `  - ${id}`),
      '---',
      '',
    ].join('\n');
  const gallery = (id, ...images) => ({
    id,
    filePath: `src/content/galleries/${id}.md`,
    source: source(...images),
    images,
  });

  it('a clean gallery has no problems', () => {
    expect(validateGalleries([gallery('ok', 'a-piece/land-a', 'gallery/dock-a')], known)).toEqual(
      [],
    );
  });

  it('a missing id is reported with file and line, and a nearby id as a hint', () => {
    const problems = validateGalleries(
      [gallery('typo', 'a-piece/land-a', 'a-peice/land-b')],
      known,
    );
    expect(problems).toEqual([
      {
        galleryId: 'typo',
        filePath: 'src/content/galleries/typo.md',
        line: 6,
        imageId: 'a-peice/land-b',
        reason: '"a-peice/land-b" is not an image on the site — did you mean "a-piece/land-b"?',
      },
    ]);
    expect(formatGalleryProblems(problems)).toBe(
      'src/content/galleries/typo.md:6 — gallery "typo": "a-peice/land-b" is not an image on the site — did you mean "a-piece/land-b"?',
    );
  });

  it('a duplicate is reported on its second occurrence', () => {
    const problems = validateGalleries(
      [gallery('dup', 'a-piece/land-a', 'gallery/dock-a', 'a-piece/land-a')],
      known,
    );
    expect(problems).toMatchObject([
      { line: 7, reason: '"a-piece/land-a" is listed more than once' },
    ]);
  });

  it('draft-owned and ownerless images are refused with their reason', () => {
    const problems = validateGalleries(
      [gallery('unpub', 'drafted/land-a', 'half-done/frame')],
      known,
    );
    expect(problems.map((p) => [p.line, p.reason])).toEqual([
      [5, '"drafted/land-a" belongs to a draft piece — publish the piece or drop the image'],
      [6, '"half-done/frame" sits in a piece folder with no index.md, so it is unpublished'],
    ]);
  });

  it("a camera's frame is refused for what it is, not as an unknown id (T401)", () => {
    // Private rasters are never in `known`, so the generic unknown-id
    // branch would fire without this rule — the reason names the frame's
    // photograph instead of guessing at a typo.
    const problems = validateGalleries([gallery('raw', 'a-piece/_land-b')], known);
    expect(problems.map((p) => [p.line, p.reason])).toEqual([
      [
        5,
        '"a-piece/_land-b" is private — a file of "land-b" (its camera\'s frame, a stage, or the loupe\'s export), not an image of the site: list "a-piece/land-b" instead',
      ],
    ]);
  });

  it('finds the line for quoted ids and falls back to any mention', () => {
    const quoted = {
      id: 'q',
      filePath: 'q.md',
      source: '---\nimages:\n  - "nope/x"\n---\n',
      images: ['nope/x'],
    };
    expect(validateGalleries([quoted], known)[0].line).toBe(3);
    const flow = {
      id: 'f',
      filePath: 'f.md',
      source: '---\nimages: [nope/x]\n---\n',
      images: ['nope/x'],
    };
    expect(validateGalleries([flow], known)[0].line).toBe(2);
    const noSource = { id: 'n', filePath: 'n.md', images: ['nope/x'] };
    expect(validateGalleries([noSource], known)[0].line).toBeUndefined();
    expect(formatGalleryProblems(validateGalleries([noSource], known))).toMatch(
      /^n\.md — gallery "n"/,
    );
  });

  it('reports every problem across galleries in file order', () => {
    const problems = validateGalleries(
      [gallery('one', 'nope/a', 'a-piece/land-a'), gallery('two', 'drafted/land-a')],
      known,
    );
    expect(problems.map((p) => `${p.galleryId}:${p.line}`)).toEqual(['one:5', 'two:5']);
  });
});
