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

  it('a decorative shorthand image carries its ratio on the img', async () => {
    // No link (a link with no accessible name fails WCAG 2.4.4), but the
    // column mats a bare img in prose like any frame — so the ratio has
    // to ride on the image itself or the mat would be sized at 1.
    const { code } = await render('Text.\n\n![](./photo.jpg)\n');
    expect(code).not.toContain('image-link');
    expect(imageMarkers(code)[0].style).toBe('--ar: 1.6');
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

  it('held keeps the raw --ar on the wrapper as well as the frame', async () => {
    const held = await render(':::held{src="./photo.jpg" alt="a"}\nWords.\n:::');
    expect(wrapperStyle(held.code)).toBe('--ar: 1.6');
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

// Spec 019 (T1705): the compare block. One photograph's stages, stacked
// as figures without script (AC 3); below the root, the image page's
// markup class for class. tests/fixtures holds photo.jpg (8x5), its
// camera's frame _photo.jpg and a stage _photo.tones.jpg, and
// portrait.jpg (400x600) for a last stage whose ratio differs.
describe('the compare block (T1705, spec 019)', () => {
  const three = [
    ':::compare',
    '![Camera](./_photo.jpg) Straight out of the camera, flat profile.',
    '![Tones](./_photo.tones.jpg) Shadows lifted, the _highlights_ held.',
    '![Finished](./portrait.jpg) A touch of warmth.',
    ':::',
  ].join('\n');

  // Each stage as { pane, label, note } in document order, read from the
  // markup — the pane's content must be exactly one img.
  const stagesOf = (code) =>
    [
      ...code.matchAll(
        /<figure class="compare-stage"><span class="compare-pane">(<img [^>]*>)<\/span><figcaption class="compare-caption"><span class="compare-label">([^<]*)<\/span>(?: <span class="compare-note">(.*?)<\/span>)?<\/figcaption><\/figure>/g,
      ),
    ].map((m) => ({ img: m[1], label: m[2], note: m[3] }));

  // The thrown VFileMessage, so the piece's file and line are pinned.
  const failureOf = async (content, url = fileURL) => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await processor.render(content, { fileURL: url });
    } catch (error) {
      return error;
    } finally {
      spy.mockRestore();
    }
    throw new Error('expected the render to fail');
  };

  it('three stages render as stacked figures, each image in a pane, label and note in order', async () => {
    const { code } = await render(three);
    expect(code).toMatch(
      /^<figure class="piece-block piece-compare compare compare-w-wide" style="--ar: 0\.6667"><div class="compare-frames"><figure class="compare-stage">/,
    );
    expect(code.endsWith('</figure></div></figure>')).toBe(true);
    const stages = stagesOf(code);
    expect(stages.map(({ label, note }) => ({ label, note }))).toEqual([
      { label: 'Camera', note: 'Straight out of the camera, flat profile.' },
      { label: 'Tones', note: 'Shadows lifted, the <em>highlights</em> held.' },
      { label: 'Finished', note: 'A touch of warmth.' },
    ]);
    expect((code.match(/<figure class="compare-stage">/g) ?? []).length).toBe(3);
    // Every stage image is the optimizer's, its label as its alt, sized
    // at the compare's width in a piece.
    expect(imageMarkers(code)).toEqual([
      expect.objectContaining({
        src: './_photo.jpg',
        alt: 'Camera',
        layout: 'constrained',
        sizes: '(min-width: 1240px) 1160px, 96vw',
      }),
      expect.objectContaining({
        src: './_photo.tones.jpg',
        alt: 'Tones',
        sizes: '(min-width: 1240px) 1160px, 96vw',
      }),
      expect.objectContaining({
        src: './portrait.jpg',
        alt: 'Finished',
        sizes: '(min-width: 1240px) 1160px, 96vw',
      }),
    ]);
    // A device, not frames: nothing links to a page.
    expect(code).not.toContain('image-link');
    expect(code).not.toContain('<a ');
    expect(code).not.toContain('data-mode');
  });

  it("the root's --ar is the last stage's, whatever the stages before it measure", async () => {
    const landscapeLast = await render(
      ':::compare\n![Camera](./portrait.jpg) a\n![Finished](./photo.jpg) b\n:::',
    );
    expect(landscapeLast.code).toMatch(/^<figure class="[^"]*" style="--ar: 1\.6">/);
  });

  it('data-mode is written only when the author writes a mode', async () => {
    const { code } = await render(three.replace(':::compare', ':::compare{mode="switch"}'));
    expect(code).toMatch(
      /^<figure class="piece-block piece-compare compare compare-w-wide" style="--ar: 0\.6667" data-mode="switch">/,
    );
  });

  it('stages separated by blank lines parse like consecutive ones', async () => {
    const spaced = await render(
      [
        ':::compare',
        '![Camera](./_photo.jpg) Straight out of the camera, flat profile.',
        '',
        '![Tones](./_photo.tones.jpg) Shadows lifted, the _highlights_ held.',
        '',
        '![Finished](./portrait.jpg) A touch of warmth.',
        ':::',
      ].join('\n'),
    );
    const consecutive = await render(three);
    expect(stagesOf(spaced.code)).toEqual(stagesOf(consecutive.code));
    expect(stagesOf(spaced.code)).toHaveLength(3);
  });

  it('a stage with no note has a label and no note span', async () => {
    const { code } = await render(
      ':::compare\n![Camera](./_photo.jpg)\n![Finished](./photo.jpg) Done.\n:::',
    );
    expect(stagesOf(code).map(({ label, note }) => ({ label, note }))).toEqual([
      { label: 'Camera', note: undefined },
      { label: 'Finished', note: 'Done.' },
    ]);
  });

  describe('the borrowing pair, from tests/pieces/alpha/', () => {
    // Copied from remark-pieces-vocabulary.test.mjs's "cross-piece
    // references (T602, spec 008)": the render's path is a virtual
    // alpha/index.md beside beta/, which holds photo.jpg and _photo.jpg.
    const alphaURL = new URL('./tests/pieces/alpha/index.md', import.meta.url);

    it('a public photograph of another folder may be a stage, resolved like any borrowed frame', async () => {
      const { code } = await processor.render(
        ':::compare\n![Here](./photo.jpg) Ours.\n![There](../beta/photo.jpg) Theirs.\n:::',
        { fileURL: alphaURL },
      );
      expect(stagesOf(code).map((s) => s.label)).toEqual(['Here', 'There']);
      expect(imageMarkers(code).map((m) => m.src)).toEqual(['./photo.jpg', '../beta/photo.jpg']);
      expect(code).not.toContain('image-link');
    });

    it('a private file of another folder fails, though the file exists', async () => {
      const error = await failureOf(
        'Text.\n\n:::compare\n![Here](./photo.jpg) Ours.\n![There](../beta/_photo.jpg) Theirs.\n:::',
        alphaURL,
      );
      expect(error.message).toContain(
        '"../beta/_photo.jpg" is a private file of another folder — a compare may show a private file only from its own folder; a public photograph may be borrowed (../beta/photo.jpg)',
      );
      expect(error.file).toMatch(/tests\/pieces\/alpha\/index\.md$/);
      expect(error.line).toBe(3);
    });
  });

  // Each failure names the piece and the line: the compare opens on
  // line 3 below its paragraph, the shorthand image sits on its own.
  const failures = [
    [
      'one stage',
      ':::compare\n![Camera](./_photo.jpg) Flat.\n:::',
      'compare takes two or more stages (one per line: ![Label](./file.jpg) then its note); got 1',
    ],
    [
      'a missing stage file',
      ':::compare\n![Camera](./_missing.jpg) Flat.\n![Finished](./photo.jpg) Done.\n:::',
      "image not found: ./_missing.jpg (relative to the piece's folder)",
    ],
    [
      'a stage without its label',
      ':::compare\n![](./photo.jpg) Flat.\n![Finished](./photo.jpg) Done.\n:::',
      "a compare stage needs its label as the image's text: ![Camera](./_land-b.jpg)",
    ],
    [
      'text before the first image',
      ':::compare\nBefore the images\n![Camera](./_photo.jpg) Flat.\n![Finished](./photo.jpg) Done.\n:::',
      `a compare's body is its stages, one per line — "Before the images" comes before the first image`,
    ],
    [
      'a list inside',
      ':::compare\n![Camera](./_photo.jpg) Flat.\n![Finished](./photo.jpg) Done.\n\n- a list item\n:::',
      "a compare's body is its stages, one per line — no lists, headings or blocks inside it",
    ],
    [
      'an unknown mode',
      ':::compare{mode="carousel"}\n![Camera](./_photo.jpg) Flat.\n![Finished](./photo.jpg) Done.\n:::',
      'invalid value "carousel" for mode on compare — allowed: slider | side | switch',
    ],
    [
      'a private file placed by another block, with the widened message',
      '::single{src="./_photo.jpg" alt="x"}',
      `"./_photo.jpg" is private — a file of "photo" (its camera's frame, a stage, or the loupe's export), not an image of the site: place "photo.jpg" here, or show it as a stage of a :::compare in this folder`,
    ],
    [
      'a private file placed as a shorthand image',
      '![x](./_photo.jpg)',
      `"./_photo.jpg" is private — a file of "photo" (its camera's frame, a stage, or the loupe's export), not an image of the site: place "photo.jpg" here, or show it as a stage of a :::compare in this folder`,
    ],
    [
      'a private stage inside a grid',
      ':::grid\n![a](./_photo.tones.jpg)\n![b](./photo.jpg)\n:::',
      `"./_photo.tones.jpg" is private — a file of "photo" (its camera's frame, a stage, or the loupe's export), not an image of the site: place "photo.jpg" here, or show it as a stage of a :::compare in this folder`,
    ],
  ];

  it.each(failures)(
    '%s fails the build naming the piece and the line',
    async (_name, content, message) => {
      const error = await failureOf(`Text.\n\n${content}`);
      expect(error.message).toContain(message);
      expect(error.file).toMatch(/tests\/fixtures\/piece\.md$/);
      expect(error.line).toBe(3);
    },
  );
});
