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
    const { code, metadata } = await render('::fullbleed{src="./photo.jpg" alt="dawn"}');
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
      // sizes updated by spec 003 (plan B3): narrow branch matches the
      // collapsed stacked layout instead of under-serving phones.
      expect(marker).toMatchObject({
        layout: 'constrained',
        sizes: '(min-width: 720px) 340px, 94vw',
      });
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
      expect(marker).toMatchObject({
        layout: 'constrained',
        sizes: '(min-width: 720px) 227px, 94vw',
      });
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

// The ratio on every frame (T1100, spec 013): the mat's width is a share
// of the frame's rendered short side, so every frame the transform places
// carries its RAW ratio in --ar — on the anchor, or on the bare img of a
// decorative one (where it rides in the __ASTRO_IMAGE_ marker's props,
// which the asset pipeline puts back on the <img>).
describe('the ratio on every frame (T1100)', () => {
  // tests/fixtures: photo.jpg is 8x5 (1.6), portrait.jpg is 400x600
  // (0.6667 — trimNumber's four decimals), square.jpg is 200x200 (1),
  // rotated.jpg is a 600x400 buffer with EXIF orientation 6, so it
  // renders 400x600 (0.6667) like a camera portrait.
  const anchorStyles = (code) =>
    [...code.matchAll(/<a href="[^"]*" class="image-link"(?: style="([^"]*)")?>/g)].map(
      (m) => m[1],
    );
  const wrapperStyle = (code) =>
    /<(?:figure|div) class="piece-block[^"]*"(?: style="([^"]*)")?>/.exec(code)?.[1];

  const cases = [
    ['single, leaf form', '::single{src="./photo.jpg" alt="a"}', ['--ar: 1.6']],
    [
      'single, container form',
      ':::single{src="./portrait.jpg" alt="a"}\nA caption.\n:::',
      ['--ar: 0.6667'],
    ],
    ['fullbleed', '::fullbleed{src="./photo.jpg" alt="a"}', ['--ar: 1.6']],
    ['wide', '::wide{src="./rotated.jpg" alt="a"}', ['--ar: 0.6667']],
    ['tall', '::tall{src="./portrait.jpg" alt="a"}', ['--ar: 0.6667']],
    ['inset', '::inset{src="./square.jpg" alt="a"}', ['--ar: 1']],
    [
      'grid',
      ':::grid\n![a](./photo.jpg)\n![b](./portrait.jpg)\n![c](./square.jpg)\n:::',
      ['--ar: 1.6', '--ar: 0.6667', '--ar: 1'],
    ],
    ['aside', ':::aside{src="./portrait.jpg" alt="a" side="left"}\nWords.\n:::', ['--ar: 0.6667']],
    ['row', ':::row{src="./square.jpg" alt="a" side="left"}\nWords.\n:::', ['--ar: 1']],
    [
      'diptych, default',
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r"}',
      ['--ar: 1.6', '--ar: 0.6667'],
    ],
    [
      'diptych, weighted',
      '::diptych{left="./photo.jpg" right="./square.jpg" leftAlt="l" rightAlt="r" weight="left"}',
      ['--ar: 1.6', '--ar: 1'],
    ],
    [
      'triptych',
      '::triptych{left="./photo.jpg" center="./portrait.jpg" right="./square.jpg" leftAlt="a" centerAlt="b" rightAlt="c"}',
      ['--ar: 1.6', '--ar: 0.6667', '--ar: 1'],
    ],
    ['strip', ':::strip\n![a](./photo.jpg)\n![b](./square.jpg)\n:::', ['--ar: 1.6', '--ar: 1']],
    ['held', ':::held{src="./photo.jpg" alt="a"}\nWords.\n:::', ['--ar: 1.6']],
    ['pause', '::pause{src="./portrait.jpg" alt="a"}', ['--ar: 0.6667']],
  ];

  it.each(cases)("%s carries each frame's true ratio", async (_name, content, expected) => {
    const { code } = await render(content);
    expect(anchorStyles(code)).toEqual(expected);
  });

  it('a decorative frame carries it on the bare img, which is the frame itself', async () => {
    const { code } = await render('::fullbleed{src="./portrait.jpg" alt=""}');
    expect(code).not.toContain('image-link');
    expect(imageMarkers(code)[0].style).toBe('--ar: 0.6667');
  });

  it('the shorthand image carries it too', async () => {
    const { code } = await render('Text.\n\n![a](./square.jpg)\n');
    expect(anchorStyles(code)).toEqual(['--ar: 1']);
  });

  it('match="height" keeps the normalized --ar and adds the raw sum and count', async () => {
    // The anchors are flex-grow factors (smallest 1); the row's height —
    // and so the mat's width — comes from the raw ratios on the figure.
    const { code } = await render(
      '::triptych{left="./photo.jpg" center="./portrait.jpg" right="./square.jpg" leftAlt="a" centerAlt="b" rightAlt="c" match="height"}',
    );
    expect(anchorStyles(code)).toEqual(['--ar: 2.4', '--ar: 1', '--ar: 1.5']);
    // 1.6 + 0.6667 + 1, to trimNumber's four decimals.
    expect(wrapperStyle(code)).toBe('--ar-sum: 3.2667; --n: 3');
  });

  it('held and pause keep the raw --ar on the wrapper as well as the frame', async () => {
    const held = await render(':::held{src="./photo.jpg" alt="a"}\nWords.\n:::');
    expect(wrapperStyle(held.code)).toBe('--ar: 1.6');
    const pause = await render('::pause{src="./portrait.jpg" alt="a"}');
    expect(wrapperStyle(pause.code)).toBe('--ar: 0.6667');
  });

  it('a frame the probe cannot read carries none — the CSS falls back to 1', async () => {
    // A remote and a root-absolute src are Astro's business, not the
    // probe's; a render with no file path cannot resolve them at all.
    const remote = await render('::single{src="https://example.com/p.jpg" alt="a"}');
    expect(remote.code).not.toContain('--ar');
    const rooted = await render('::single{src="/p.jpg" alt="a"}');
    expect(rooted.code).not.toContain('--ar');
    const noPath = await processor.render('::single{src="./photo.jpg" alt="a"}');
    expect(noPath.code).not.toContain('--ar');
    const noPathShorthand = await processor.render('![a](./photo.jpg)');
    expect(noPathShorthand.code).not.toContain('--ar');
  });
});

describe('fail-loudly cases', () => {
  const cases = [
    ['unknown directive', '::mystery{}', /the block vocabulary is closed/],
    // The 001-era "container form of a known block fails" case was
    // deliberately retired by spec 003, which makes the container form the
    // caption mechanism (flagged and approved at the Phase 0 review, not
    // weakened-to-pass). Its replacement coverage lives in
    // remark-pieces-vocabulary.test.mjs: captions, [label] rejection,
    // no-nesting, and wrong-form errors.
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
    await expect(renderExpectingFailure('::mystery{}')).rejects.toThrow(expectedPath);
  });
});
