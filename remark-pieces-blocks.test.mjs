import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { remarkPiecesBlocks } from './remark-pieces-blocks.mjs';

// Runs the real Astro markdown pipeline (createMarkdownProcessor), not a
// hand-assembled unified chain, so these tests cover the handshake the whole
// design rests on: the transform's mdast image children must be collected by
// Astro's remarkCollectImages and rewritten by rehypeImages into
// __ASTRO_IMAGE_ markers — the shape the asset pipeline optimizes. If an
// Astro upgrade ever reorders user plugins after image collection, these
// tests fail even though the transform itself is unchanged. That is the
// point of them.
//
// Known limit: the plugin list below is a copy of astro.config.mjs's, not
// an import of it — drift in the config itself (dropping remarkDirective,
// reordering it after the transform) breaks production with a green suite.
// Config and tests must be kept in step by hand.

// The fixture file doesn't exist; only its directory must, so relative image
// paths in test content resolve against tests/fixtures/ (which holds
// photo.jpg) for the transform's existence check.
const fileURL = new URL('./tests/fixtures/piece.md', import.meta.url);

let processor;
beforeAll(async () => {
  processor = await createMarkdownProcessor({
    remarkPlugins: [remarkDirective, remarkPiecesBlocks],
    syntaxHighlight: false,
  });
});

const render = (content) => processor.render(content, { fileURL });

// Astro's pipeline console.error()s a failure before rethrowing it; keep
// expected-failure noise out of the test output without hiding real errors.
const renderExpectingFailure = async (content) => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    return await render(content);
  } finally {
    spy.mockRestore();
  }
};

// The __ASTRO_IMAGE_ marker rehypeImages leaves for the asset pipeline,
// parsed back out of the rendered HTML.
const imageMarkers = (code) =>
  [...code.matchAll(/__ASTRO_IMAGE_="([^"]*)"/g)].map((m) =>
    JSON.parse(m[1].replaceAll('&#x22;', '"')),
  );

describe('happy paths', () => {
  it('fullbleed renders a classed figure with one collected, optimizable image', async () => {
    const { code, metadata } = await render(
      '::fullbleed{src="./photo.jpg" alt="dawn"}',
    );
    expect(code).toContain('<figure class="piece-block piece-fullbleed">');
    expect(metadata.localImagePaths).toEqual(['./photo.jpg']);
    const markers = imageMarkers(code);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      src: './photo.jpg',
      alt: 'dawn',
      layout: 'full-width',
      sizes: '100vw',
    });
  });

  it('diptych renders two images in order with constrained sizing', async () => {
    const { code, metadata } = await render(
      '::diptych{left="./photo.jpg" right="./photo.jpg" leftAlt="l" rightAlt="r"}',
    );
    expect(code).toContain('<figure class="piece-block piece-diptych">');
    expect(metadata.localImagePaths).toEqual(['./photo.jpg']);
    const markers = imageMarkers(code);
    expect(markers).toHaveLength(2);
    expect(markers.map((m) => m.alt)).toEqual(['l', 'r']);
    for (const marker of markers)
      expect(marker).toMatchObject({ layout: 'constrained', sizes: '50vw' });
    // Duplicate srcs must stay distinguishable for the asset pipeline.
    expect(markers.map((m) => m.index)).toEqual([0, 1]);
  });

  it('triptych renders three images in order', async () => {
    const { code } = await render(
      '::triptych{left="./photo.jpg" center="./photo.jpg" right="./photo.jpg" leftAlt="a" centerAlt="b" rightAlt="c"}',
    );
    expect(code).toContain('<figure class="piece-block piece-triptych">');
    const markers = imageMarkers(code);
    expect(markers.map((m) => m.alt)).toEqual(['a', 'b', 'c']);
    for (const marker of markers)
      expect(marker).toMatchObject({ layout: 'constrained', sizes: '33vw' });
  });

  it('empty alt is accepted as an explicit decorative declaration', async () => {
    const { code } = await render('::fullbleed{src="./photo.jpg" alt=""}');
    expect(imageMarkers(code)[0].alt).toBe('');
  });

  it('plain markdown images are untouched and still optimized (the dominant case)', async () => {
    const { code, metadata } = await render('![dawn](./photo.jpg)');
    expect(metadata.localImagePaths).toEqual(['./photo.jpg']);
    expect(imageMarkers(code)).toHaveLength(1);
    expect(code).not.toContain('<figure');
  });

  it('single-colon text directives in prose come back as the literal text typed', async () => {
    // Without handling, remark-directive's textDirective node renders as an
    // empty <div> that splits the paragraph — the sentence must survive
    // verbatim in one piece.
    const { code } = await render('The spec defines :hover states for links.');
    expect(code).toContain('<p>The spec defines :hover states for links.</p>');
    expect(code).not.toContain('<div');
  });

  it('a labeled text directive round-trips brackets and label', async () => {
    const { code } = await render('Press :kbd[Enter] to publish.');
    expect(code).toContain('<p>Press :kbd[Enter] to publish.</p>');
    expect(code).not.toContain('<div');
  });
});

describe('fail-loudly cases', () => {
  const cases = [
    ['unknown directive', '::mystery{}', /the block vocabulary is closed/],
    [
      'container form of a known block',
      ':::fullbleed{src="./photo.jpg" alt="x"}\ncaption\n:::',
      /container form is not supported/,
    ],
    ['reserved sequence block', '::sequence{}', /reserved but not implemented/],
    ['fullbleed without src', '::fullbleed{alt="x"}', /requires a src/],
    ['fullbleed without alt', '::fullbleed{src="./photo.jpg"}', /requires an alt/],
    [
      'diptych missing an image',
      '::diptych{left="./photo.jpg" leftAlt="l" rightAlt="r"}',
      /requires left and right/,
    ],
    [
      'diptych missing an alt',
      '::diptych{left="./photo.jpg" right="./photo.jpg" leftAlt="l"}',
      /requires leftAlt and rightAlt/,
    ],
    [
      'triptych missing attributes',
      '::triptych{left="./photo.jpg" right="./photo.jpg"}',
      /requires left, center, and right/,
    ],
    [
      'triptych missing an alt',
      '::triptych{left="./photo.jpg" center="./photo.jpg" right="./photo.jpg" leftAlt="a" centerAlt="b"}',
      /requires leftAlt, centerAlt, and rightAlt/,
    ],
    [
      'missing image file',
      '::fullbleed{src="./no-such-photo.jpg" alt="x"}',
      /image not found: \.\/no-such-photo\.jpg/,
    ],
  ];

  it.each(cases)('%s fails the build', async (_name, content, message) => {
    await expect(renderExpectingFailure(content)).rejects.toThrow(message);
  });

  it('failures carry the file path for the author', async () => {
    const expectedPath = fileURLToPath(fileURL);
    await expect(renderExpectingFailure('::mystery{}')).rejects.toThrow(
      expectedPath,
    );
  });
});
