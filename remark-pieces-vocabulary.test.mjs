import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { remarkPiecesBlocks } from './remark-pieces-blocks.mjs';

// Spec 003's vocabulary suite — companion to remark-pieces-blocks.test.mjs,
// which holds the 001/002-era contracts and stays untouched. Same harness:
// the real Astro pipeline, so assertions cover the collector/optimizer
// handshake, not just the transform in isolation.
//
// Known limit (as in the companion file): the plugin list is a copy of
// astro.config.mjs's, not an import of it — config drift breaks production
// with a green suite. Config and tests are kept in step by hand.

const fileURL = new URL('./tests/fixtures/piece.md', import.meta.url);

let processor;
beforeAll(async () => {
  processor = await createMarkdownProcessor({
    remarkPlugins: [remarkDirective, remarkPiecesBlocks],
    syntaxHighlight: false,
  });
});

const render = (content) => processor.render(content, { fileURL });

const renderExpectingFailure = async (content) => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    return await render(content);
  } finally {
    spy.mockRestore();
  }
};

describe('closed attribute validation (T202)', () => {
  it('an unknown attribute fails naming the offender and the allowed set', async () => {
    await expect(
      renderExpectingFailure('::fullbleed{src="./photo.jpg" alt="x" caption="hi"}'),
    ).rejects.toThrow(/unknown attribute "caption" on fullbleed — allowed: src, alt/);
  });

  it('a case-typo attribute fails naming the offender', async () => {
    await expect(
      renderExpectingFailure(
        '::diptych{left="./photo.jpg" right="./photo.jpg" leftalt="l" rightAlt="r"}',
      ),
    ).rejects.toThrow(/unknown attribute "leftalt" on diptych/);
  });

  it('the {#id} shorthand is rejected as a style-variant backdoor', async () => {
    await expect(
      renderExpectingFailure('::fullbleed{#hero src="./photo.jpg" alt="x"}'),
    ).rejects.toThrow(/\{#id \.class\} shorthand is not supported on fullbleed/);
  });

  it('the {.class} shorthand is rejected too', async () => {
    await expect(
      renderExpectingFailure('::fullbleed{.fancy src="./photo.jpg" alt="x"}'),
    ).rejects.toThrow(/shorthand is not supported/);
  });
});

const imageMarkers = (code) =>
  [...code.matchAll(/__ASTRO_IMAGE_="([^"]*)"/g)].map((m) =>
    JSON.parse(m[1].replaceAll('&#x22;', '"')),
  );

// The inline style of each image-link anchor in document order (spec
// 004 moved --ar from the img to its anchor — the flex item).
const anchorStyles = (code) =>
  [...code.matchAll(/<a href="[^"]*" class="image-link"(?: style="([^"]*)")?>/g)].map((m) => m[1]);

describe('single directive form and captions (T203)', () => {
  it('leaf single renders a classed figure with constrained responsive sizing', async () => {
    const { code, metadata } = await render('::single{src="./photo.jpg" alt="dawn"}');
    expect(code).toContain('<figure class="piece-block piece-single">');
    expect(metadata.localImagePaths).toEqual(['./photo.jpg']);
    const [marker] = imageMarkers(code);
    expect(marker).toMatchObject({ src: './photo.jpg', alt: 'dawn', layout: 'constrained' });
    expect(marker.sizes).toContain('680px');
  });

  it('container single renders the body as a figcaption with inline markdown', async () => {
    const { code } = await render(
      ':::single{src="./photo.jpg" alt="dawn"}\nShot at *first light*, tripod low.\n:::',
    );
    expect(code).toContain('<figure class="piece-block piece-single">');
    expect(code).toMatch(/<figcaption>Shot at <em>first light<\/em>, tripod low\.<\/figcaption>/);
  });

  it('a one-paragraph caption unwraps (no <p> inside figcaption)', async () => {
    const { code } = await render(':::single{src="./photo.jpg" alt="x"}\nCaption.\n:::');
    expect(code).not.toMatch(/<figcaption><p>/);
  });

  it('a multi-paragraph caption keeps its paragraphs', async () => {
    const { code } = await render(
      ':::single{src="./photo.jpg" alt="x"}\nFirst line.\n\nSecond thought.\n:::',
    );
    expect(code).toMatch(
      /<figcaption><p>First line\.<\/p>\s*<p>Second thought\.<\/p><\/figcaption>/,
    );
  });

  it('an empty container body means no figcaption', async () => {
    const { code } = await render(':::single{src="./photo.jpg" alt="x"}\n:::');
    expect(code).toContain('<figure class="piece-block piece-single">');
    expect(code).not.toContain('<figcaption');
  });

  it('the figcaption follows the image inside the figure', async () => {
    const { code } = await render(':::single{src="./photo.jpg" alt="x"}\nBelow.\n:::');
    const figure = code.match(/<figure[^>]*>([\s\S]*?)<\/figure>/)[1];
    expect(figure.indexOf('__ASTRO_IMAGE_')).toBeLessThan(figure.indexOf('<figcaption'));
  });

  it('a [label] on the container form fails loudly', async () => {
    await expect(
      renderExpectingFailure(':::single[my caption]{src="./photo.jpg" alt="x"}\n:::'),
    ).rejects.toThrow(/captions go in the body, not the \[label\]/);
  });

  it('a [label] on a leaf directive fails instead of being silently eaten', async () => {
    await expect(
      renderExpectingFailure('::single[my caption]{src="./photo.jpg" alt="x"}'),
    ).rejects.toThrow(/unexpected \[label\] on ::single/);
  });

  it('a block directive nested in a body fails loudly', async () => {
    await expect(
      renderExpectingFailure(
        ':::single{src="./photo.jpg" alt="x"}\n::fullbleed{src="./photo.jpg" alt="y"}\n:::',
      ),
    ).rejects.toThrow(/cannot be nested inside :::single/);
  });

  it('missing src and alt keep the family error contract', async () => {
    await expect(renderExpectingFailure('::single{alt="x"}')).rejects.toThrow(
      /single requires a src attribute/,
    );
    await expect(renderExpectingFailure('::single{src="./photo.jpg"}')).rejects.toThrow(
      /single requires an alt attribute/,
    );
  });
});

describe('standalone treatments: wide, tall, inset, fullbleed captions (T204)', () => {
  it.each([
    ['wide', '(min-width: 1240px) 1160px'],
    ['tall', '94vw'],
    ['inset', '440px'],
  ])('%s leaf renders a classed figure with its sizing', async (name, sizeFragment) => {
    const { code } = await render(`::${name}{src="./photo.jpg" alt="x"}`);
    expect(code).toContain(`<figure class="piece-block piece-${name}">`);
    const [marker] = imageMarkers(code);
    expect(marker.layout).toBe('constrained');
    expect(marker.sizes).toContain(sizeFragment);
  });

  it.each(['wide', 'tall', 'inset', 'fullbleed'])(
    '%s container form carries a figcaption',
    async (name) => {
      const { code } = await render(`:::${name}{src="./photo.jpg" alt="x"}\nA caption.\n:::`);
      expect(code).toContain(`piece-${name}`);
      expect(code).toContain('<figcaption>A caption.</figcaption>');
    },
  );

  it('wide with bleed=left gets the bleed class', async () => {
    const { code } = await render('::wide{src="./photo.jpg" alt="x" bleed="left"}');
    expect(code).toContain('<figure class="piece-block piece-wide bleed-left">');
  });

  it('wide with an invalid bleed value fails naming the enum', async () => {
    await expect(
      renderExpectingFailure('::wide{src="./photo.jpg" alt="x" bleed="up"}'),
    ).rejects.toThrow(/invalid value "up" for bleed on wide — allowed: left \| right/);
  });

  it('bleed is not accepted on other blocks', async () => {
    await expect(
      renderExpectingFailure('::inset{src="./photo.jpg" alt="x" bleed="left"}'),
    ).rejects.toThrow(/unknown attribute "bleed" on inset/);
  });

  it.each(['wide', 'tall', 'inset'])('%s keeps the family alt contract', async (name) => {
    await expect(renderExpectingFailure(`::${name}{src="./photo.jpg"}`)).rejects.toThrow(
      new RegExp(`${name} requires an alt attribute`),
    );
  });

  it('missing files still fail with the piece-relative message', async () => {
    await expect(renderExpectingFailure('::tall{src="./nope.jpg" alt="x"}')).rejects.toThrow(
      /image not found: \.\/nope\.jpg/,
    );
  });
});

describe('diptych/triptych upgrades: match, weight, captions (T205)', () => {
  // Fixtures: photo.jpg is 8x5 (ar 1.6); portrait.jpg is 400x600 (ar 0.667);
  // rotated.jpg is a 600x400 pixel buffer with EXIF orientation 6 — a camera
  // portrait as cameras write them, rendering 400x600 (ar 0.667).

  it('match="height" emits normalized --ar styles (smallest ratio = 1)', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" match="height"}',
    );
    expect(code).toContain('<figure class="piece-block piece-diptych match-height">');
    // Since spec 004 the anchor is the flex item, so --ar rides on it
    // (T310); the values are unchanged.
    const styles = anchorStyles(code);
    expect(styles[1]).toBe('--ar: 1'); // portrait is smallest
    expect(styles[0]).toBe('--ar: 2.4'); // 1.6 / 0.6667
  });

  it('an EXIF-rotated camera portrait gets the rendered (swapped) ratio', async () => {
    // If the probe ignored orientation, rotated.jpg would read as ar 1.5
    // (landscape) and the pair would come out ~1.0667/1 — the swap is the
    // difference between correct and silently broken equal heights.
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./rotated.jpg" leftAlt="l" rightAlt="r" match="height"}',
    );
    const styles = anchorStyles(code);
    expect(styles[1]).toBe('--ar: 1');
    expect(styles[0]).toBe('--ar: 2.4');
  });

  it('match mode derives per-image sizes from the ratios', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" match="height"}',
    );
    const markers = imageMarkers(code);
    // shares of 680px: 1.6/(1.6+0.6667)≈0.706 → 480px; 0.294 → 200px
    expect(markers[0].sizes).toContain('480px');
    expect(markers[1].sizes).toContain('200px');
  });

  it('default (no match) emits no --ar styles and keeps equal-width sizes', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r"}',
    );
    const markers = imageMarkers(code);
    expect(markers[0].style).toBeUndefined();
    expect(markers[0].sizes).toBe('(min-width: 720px) 340px, 94vw');
  });

  it('weight="left" makes the left frame dominant in sizes and class', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" weight="left"}',
    );
    expect(code).toContain('piece-diptych weight-left');
    const markers = imageMarkers(code);
    expect(markers[0].sizes).toContain('453px');
    expect(markers[1].sizes).toContain('227px');
  });

  it('weight + match="height" fails as contradictory', async () => {
    await expect(
      renderExpectingFailure(
        '::diptych{left="./photo.jpg" right="./photo.jpg" leftAlt="l" rightAlt="r" weight="left" match="height"}',
      ),
    ).rejects.toThrow(/cannot combine weight with match="height"/);
  });

  it('invalid match value fails naming the enum', async () => {
    await expect(
      renderExpectingFailure(
        '::diptych{left="./photo.jpg" right="./photo.jpg" leftAlt="l" rightAlt="r" match="width"}',
      ),
    ).rejects.toThrow(/invalid value "width" for match on diptych — allowed: height/);
  });

  it('weight is not accepted on triptych', async () => {
    await expect(
      renderExpectingFailure(
        '::triptych{left="./photo.jpg" center="./photo.jpg" right="./photo.jpg" leftAlt="a" centerAlt="b" rightAlt="c" weight="left"}',
      ),
    ).rejects.toThrow(/unknown attribute "weight" on triptych/);
  });

  it('triptych match="height" normalizes across three ratios', async () => {
    const { code } = await render(
      '::triptych{left="./photo.jpg" center="./portrait.jpg" right="./rotated.jpg" leftAlt="a" centerAlt="b" rightAlt="c" match="height"}',
    );
    expect(anchorStyles(code)).toEqual(['--ar: 2.4', '--ar: 1', '--ar: 1']);
  });

  it('diptych and triptych container forms carry figcaptions now', async () => {
    const { code } = await render(
      ':::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r"}\nTwo frames, minutes apart.\n:::',
    );
    expect(code).toContain('<figcaption>Two frames, minutes apart.</figcaption>');
  });
});

describe('pair width variants (sampler review)', () => {
  it('width="wide" scales the pair sizes and adds the class', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" width="wide"}',
    );
    expect(code).toContain('piece-diptych width-wide');
    expect(imageMarkers(code)[0].sizes).toBe('(min-width: 720px) 560px, 96vw');
  });

  it('width="fullbleed" uses viewport units and the class', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" width="fullbleed"}',
    );
    expect(code).toContain('piece-diptych width-fullbleed');
    expect(imageMarkers(code)[0].sizes).toBe('(min-width: 720px) 50vw, 100vw');
  });

  it('triptych width="wide" scales thirds', async () => {
    const { code } = await render(
      '::triptych{left="./photo.jpg" center="./photo.jpg" right="./photo.jpg" leftAlt="a" centerAlt="b" rightAlt="c" width="wide"}',
    );
    expect(imageMarkers(code)[0].sizes).toBe('(min-width: 720px) 373px, 96vw');
  });

  it('width combines with weight (scaled px) and with match (vw shares)', async () => {
    const weighted = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" weight="left" width="wide"}',
    );
    expect(imageMarkers(weighted.code)[0].sizes).toBe('(min-width: 720px) 773px, 96vw');
    const matched = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" match="height" width="fullbleed"}',
    );
    // shares of 100vw: 1.6/(1.6+0.6667) → 71vw; remainder → 29vw
    expect(imageMarkers(matched.code)[0].sizes).toBe('(min-width: 720px) 71vw, 100vw');
    expect(imageMarkers(matched.code)[1].sizes).toBe('(min-width: 720px) 29vw, 100vw');
  });

  it('an invalid width value fails naming the enum', async () => {
    await expect(
      renderExpectingFailure(
        '::diptych{left="./photo.jpg" right="./photo.jpg" leftAlt="l" rightAlt="r" width="huge"}',
      ),
    ).rejects.toThrow(/invalid value "huge" for width on diptych — allowed: wide \| fullbleed/);
  });

  it('width is not accepted on single-image blocks', async () => {
    await expect(
      renderExpectingFailure('::single{src="./photo.jpg" alt="x" width="wide"}'),
    ).rejects.toThrow(/unknown attribute "width" on single/);
  });
});

describe('grid and strip: body-sourced images (T206)', () => {
  it('grid takes consecutive image lines (one mdast paragraph) in order', async () => {
    const { code } = await render(
      ':::grid\n![a](./photo.jpg)\n![b](./portrait.jpg)\n![c](./rotated.jpg)\n:::',
    );
    expect(code).toContain('<figure class="piece-block piece-grid">');
    const markers = imageMarkers(code);
    expect(markers.map((m) => m.alt)).toEqual(['a', 'b', 'c']);
    expect(markers[0].sizes).toBe('(min-width: 720px) 340px, 94vw');
  });

  it('blank-line-separated images work identically', async () => {
    const { code } = await render(':::grid\n![a](./photo.jpg)\n\n![b](./portrait.jpg)\n:::');
    expect(imageMarkers(code)).toHaveLength(2);
  });

  it('two images on one line work', async () => {
    const { code } = await render(':::grid\n![a](./photo.jpg) ![b](./portrait.jpg)\n:::');
    expect(imageMarkers(code)).toHaveLength(2);
  });

  it('a trailing paragraph after a blank line is the caption', async () => {
    const { code } = await render(
      ':::grid\n![a](./photo.jpg)\n![b](./portrait.jpg)\n\nFour corners of the same morning.\n:::',
    );
    expect(code).toContain('<figcaption>Four corners of the same morning.</figcaption>');
    expect(imageMarkers(code)).toHaveLength(2);
  });

  it('a hard line break (trailing double space) between images is fine', async () => {
    const { code } = await render(':::grid\n![a](./photo.jpg)  \n![b](./portrait.jpg)\n:::');
    expect(imageMarkers(code)).toHaveLength(2);
  });

  it('mixing images and text in one paragraph fails with the blank-line hint', async () => {
    await expect(
      renderExpectingFailure(':::grid\n![a](./photo.jpg)\nThe caption right here\n:::'),
    ).rejects.toThrow(/mixes images and text — separate the caption .* blank line/);
  });

  it('grid count is validated (1 too few, 7 too many)', async () => {
    await expect(renderExpectingFailure(':::grid\n![a](./photo.jpg)\n:::')).rejects.toThrow(
      /grid takes 2–6 images .*got 1/,
    );
    const seven = Array(7).fill('![x](./photo.jpg)').join('\n');
    await expect(renderExpectingFailure(`:::grid\n${seven}\n:::`)).rejects.toThrow(/got 7/);
  });

  it('leaf ::grid fails pointing at the container form', async () => {
    await expect(renderExpectingFailure('::grid{}')).rejects.toThrow(
      /::grid is written as a container/,
    );
  });

  it('strip renders the scroll band with probe-derived per-image sizes', async () => {
    const { code } = await render(':::strip\n![p](./photo.jpg)\n![q](./portrait.jpg)\n:::');
    expect(code).toContain('<figure class="piece-block piece-strip">');
    const markers = imageMarkers(code);
    // photo.jpg ar 1.6 → 420*1.6 = 672px; portrait 0.6667 → 280px
    expect(markers[0].sizes).toBe('672px');
    expect(markers[1].sizes).toBe('280px');
    // The probe drives sizes only — no --ar style (that's equal-heights).
    expect(markers[0].style).toBeUndefined();
    expect(code).toContain('<div class="piece-strip-scroll" tabindex="0">');
  });

  it('a single panorama is a valid strip and its caption lands after the band', async () => {
    const { code } = await render(':::strip\n![pano](./photo.jpg)\n\nThe whole ridge.\n:::');
    const figure = code.match(/<figure[^>]*piece-strip[^>]*>([\s\S]*?)<\/figure>/)[1];
    expect(figure.indexOf('piece-strip-scroll')).toBeLessThan(figure.indexOf('<figcaption'));
    expect(figure).toContain('<figcaption>The whole ridge.</figcaption>');
  });

  it('an empty strip fails count validation', async () => {
    await expect(renderExpectingFailure(':::strip\n:::')).rejects.toThrow(/strip takes 1–8 images/);
  });
});

describe('aside and row: prose-bearing blocks (T207)', () => {
  it('aside unwraps: floated figure + sibling prose, no wrapper element', async () => {
    const { code } = await render(
      ':::aside{src="./portrait.jpg" alt="detail" side="left"}\nThe prose that wraps around the image, staying ordinary column text.\n\nA second paragraph too.\n:::',
    );
    expect(code).toContain('<figure class="piece-block piece-aside side-left">');
    // The prose is NOT inside the figure and there is no extra wrapper div:
    const afterFigure = code.split('</figure>')[1];
    expect(afterFigure).toContain('<p>The prose that wraps around the image');
    expect(afterFigure).toContain('<p>A second paragraph too.</p>');
    expect(code).not.toContain('piece-aside-body');
  });

  it('row wraps: div grid with figure and prose cells', async () => {
    const { code } = await render(
      ':::row{src="./photo.jpg" alt="scene" side="right"}\nProse that sits *beside* the image.\n:::',
    );
    expect(code).toContain('<div class="piece-block piece-row side-right">');
    expect(code).toMatch(/<figure>[\s\S]*__ASTRO_IMAGE_[\s\S]*<\/figure>/);
    expect(code).toMatch(
      /<div class="piece-row-prose"><p>Prose that sits <em>beside<\/em> the image\.<\/p><\/div>/,
    );
  });

  it('side is required and enum-checked on both', async () => {
    await expect(
      renderExpectingFailure(':::aside{src="./photo.jpg" alt="x"}\nText.\n:::'),
    ).rejects.toThrow(/aside requires side="left" or side="right"/);
    await expect(
      renderExpectingFailure(':::row{src="./photo.jpg" alt="x" side="top"}\nText.\n:::'),
    ).rejects.toThrow(/invalid value "top" for side on row/);
  });

  it('leaf ::aside fails pointing at the container form', async () => {
    await expect(
      renderExpectingFailure('::aside{src="./photo.jpg" alt="x" side="left"}'),
    ).rejects.toThrow(/::aside is written as a container/);
  });

  it('a nested block directive inside aside prose fails', async () => {
    await expect(
      renderExpectingFailure(
        ':::aside{src="./photo.jpg" alt="x" side="left"}\nText.\n\n::single{src="./photo.jpg" alt="y"}\n:::',
      ),
    ).rejects.toThrow(/cannot be nested inside :::aside/);
  });
});

describe('failure positions (spec: file + line)', () => {
  it('a failure carries the directive line and column, not just the path', async () => {
    let caught;
    try {
      await renderExpectingFailure('first line\n\n::mystery{}');
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({ line: 3, column: 1 });
  });
});

describe('text directive restoration round-trips attributes (T202)', () => {
  it('a text directive nested in a label is restored too', async () => {
    const { code } = await render('Press :kbd[Enter :now] to publish.');
    expect(code).toContain('<p>Press :kbd[Enter :now] to publish.</p>');
    expect(code).not.toContain('<div');
  });

  it('a bare text directive keeps its attributes (normalized key="value" form)', async () => {
    const { code } = await render('Set the :hover{delay="80ms"} state carefully.');
    expect(code).toContain('<p>Set the :hover{delay="80ms"} state carefully.</p>');
    expect(code).not.toContain('<div');
  });

  it('a labeled text directive with attributes round-trips fully', async () => {
    const { code } = await render('Press :kbd[Enter]{width="wide"} to publish.');
    expect(code).toContain('<p>Press :kbd[Enter]{width="wide"} to publish.</p>');
  });

  it('a valueless attribute round-trips without ="" noise', async () => {
    const { code } = await render('The :toggle{on} flag.');
    expect(code).toContain('<p>The :toggle{on} flag.</p>');
  });
});

describe('image links (T310, spec 004)', () => {
  // Every anchor the transform emits, in document order, with its
  // inline style (the --ar variable rides on the anchor now).
  const links = (code) =>
    [...code.matchAll(/<a href="([^"]*)" class="image-link"(?: style="([^"]*)")?>/g)].map((m) => ({
      href: m[1],
      style: m[2],
    }));

  it('a block image is wrapped in a link to its page, derived from the piece folder', async () => {
    const { code } = await render('::single{src="./photo.jpg" alt="A photo"}');
    expect(links(code)).toEqual([{ href: '/images/fixtures/photo/', style: undefined }]);
    // The image inside is still the optimizer's — the marker is intact.
    expect(code).toMatch(
      /<a href="\/images\/fixtures\/photo\/" class="image-link"><img[^>]*__ASTRO_IMAGE_/,
    );
  });

  it('every image in a pair, a grid body, and a strip is wrapped', async () => {
    const pair = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r"}',
    );
    expect(links(pair.code).map((l) => l.href)).toEqual([
      '/images/fixtures/photo/',
      '/images/fixtures/portrait/',
    ]);
    const grid = await render(
      ':::grid\n![a](./photo.jpg)\n![b](./portrait.jpg)\n![c](./rotated.jpg)\n:::',
    );
    expect(links(grid.code)).toHaveLength(3);
    const strip = await render(':::strip\n![a](./photo.jpg)\n![b](./portrait.jpg)\n:::');
    expect(strip.code).toMatch(
      /<div class="piece-strip-scroll" tabindex="0"><a href="\/images\/fixtures\/photo\/" class="image-link">/,
    );
    expect(links(strip.code)).toHaveLength(2);
  });

  it('the shorthand image in prose is wrapped too', async () => {
    const { code } = await render('Text.\n\n![A photo](./photo.jpg)\n');
    expect(code).toMatch(/<p><a href="\/images\/fixtures\/photo\/" class="image-link"><img/);
  });

  it('alt="" is not wrapped — a decorative image is not a destination', async () => {
    const block = await render('::fullbleed{src="./photo.jpg" alt=""}');
    expect(links(block.code)).toEqual([]);
    expect(block.code).toMatch(/<figure class="piece-block piece-fullbleed"><img/);
    const shorthand = await render('![](./photo.jpg)');
    expect(links(shorthand.code)).toEqual([]);
  });

  it('match="height" puts --ar on the anchor, not the image', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" match="height"}',
    );
    expect(links(code).map((l) => l.style)).toEqual(['--ar: 2.4', '--ar: 1']);
    expect(imageMarkers(code).map((m) => m.style)).toEqual([undefined, undefined]);
  });

  it('an alt="" image in a matched pair stays the flex item and keeps --ar itself', async () => {
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="" rightAlt="r" match="height"}',
    );
    expect(links(code).map((l) => l.style)).toEqual(['--ar: 1']);
    expect(imageMarkers(code)[0].style).toBe('--ar: 2.4');
  });

  it('a src into a sub-folder or a sibling folder fails naming the rule', async () => {
    await expect(
      renderExpectingFailure('::single{src="./detail/photo.jpg" alt="x"}'),
    ).rejects.toThrow(/points outside the piece's own folder/);
    await expect(renderExpectingFailure('![x](../other/photo.jpg)')).rejects.toThrow(
      /points outside the piece's own folder/,
    );
  });

  it('remote, root-absolute, and non-photograph srcs are left to Astro, unwrapped', async () => {
    const remote = await render('![x](https://example.com/p.jpg)');
    expect(links(remote.code)).toEqual([]);
    const rooted = await render('![x](/p.jpg)');
    expect(links(rooted.code)).toEqual([]);
    const gif = await render('![x](./anim.gif)');
    expect(links(gif.code)).toEqual([]);
  });

  it("an author's own link around an image is left alone", async () => {
    const { code } = await render('[![x](./photo.jpg)](https://example.com/)');
    expect(links(code)).toEqual([]);
    expect(code).toMatch(/<a href="https:\/\/example.com\/"><img/);
  });

  it("a private raster (a camera's frame) placed in a piece fails, whatever the alt (T401, spec 006)", async () => {
    // tests/fixtures/_photo.jpg exists, so the failure is the private
    // rule, not the missing-file check.
    await expect(
      renderExpectingFailure('::single{src="./_photo.jpg" alt="The raw frame"}'),
    ).rejects.toThrow(
      /"\.\/_photo\.jpg" is private — the camera's frame of "photo", not an image of the site: place "photo\.jpg" here/,
    );
    await expect(renderExpectingFailure('![x](./_photo.jpg)')).rejects.toThrow(/is private/);
    // alt="" would skip the link (no page to link to) — the private rule
    // still applies, since the frame is not a photograph to present.
    await expect(renderExpectingFailure('![](./_photo.jpg)')).rejects.toThrow(/is private/);
    await expect(
      renderExpectingFailure(
        '::diptych{left="./photo.jpg" right="./_photo.jpg" leftAlt="l" rightAlt=""}',
      ),
    ).rejects.toThrow(/is private/);
  });

  it('an image beside a flat pieces/foo.md fails — the registry would never make its page', async () => {
    const flat = new URL('./src/content/pieces/flat.md', import.meta.url);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(processor.render('![x](./photo.jpg)', { fileURL: flat })).rejects.toThrow(
        /sits directly in src\/content\/pieces\/ — a piece lives in its own folder/,
      );
    } finally {
      spy.mockRestore();
    }
  });
});

describe('held and pause: the durational blocks (T501, spec 007)', () => {
  const HELD =
    ':::held{src="./photo.jpg" alt="ridge"}\nFirst paragraph beside the frame.\n\nSecond paragraph.\n:::';

  it('held wraps: a div with side, orientation, and the raw --ar; figure and prose cells', async () => {
    const { code } = await render(HELD);
    expect(code).toContain(
      '<div class="piece-block piece-held side-left frame-landscape" style="--ar: 1.6">',
    );
    // The figure's anchor to the image page carries the same raw ratio
    // (not normalized to 1 — a single frame normalized says nothing).
    expect(code).toMatch(
      /<figure><a href="\/images\/fixtures\/photo\/" class="image-link" style="--ar: 1\.6"><img[^>]*__ASTRO_IMAGE_/,
    );
    expect(code).toMatch(
      /<div class="piece-held-prose"><p>First paragraph beside the frame\.<\/p>\n?<p>Second paragraph\.<\/p><\/div>/,
    );
    expect(code).not.toContain('piece-row-prose');
    expect(code).not.toContain('<figcaption');
  });

  it('side="right" and the {bleed} flag add their classes; sizes follow the shape', async () => {
    const plain = await render(HELD);
    expect(imageMarkers(plain.code)[0].sizes).toBe(
      '(min-width: 1240px) 670px, (min-width: 720px) 58vw, 94vw',
    );
    const right = await render(':::held{src="./photo.jpg" alt="r" side="right"}\nText.\n:::');
    expect(right.code).toContain('class="piece-block piece-held side-right frame-landscape"');
    const bled = await render(':::held{src="./photo.jpg" alt="b" side="right" bleed}\nText.\n:::');
    expect(bled.code).toContain('class="piece-block piece-held side-right bleed frame-landscape"');
    expect(imageMarkers(bled.code)[0].sizes).toBe('(min-width: 720px) 50vw, 94vw');
    // The fourth combination: bleed is independent of the side.
    const bledLeft = await render(
      ':::held{src="./photo.jpg" alt="b" side="left" bleed}\nText.\n:::',
    );
    expect(bledLeft.code).toContain(
      'class="piece-block piece-held side-left bleed frame-landscape"',
    );
    expect(imageMarkers(bledLeft.code)[0].sizes).toBe('(min-width: 720px) 50vw, 94vw');
  });

  it('a portrait frame is frame-portrait; a square is frame-landscape (the boundary)', async () => {
    const portrait = await render(':::held{src="./portrait.jpg" alt="p"}\nText.\n:::');
    expect(portrait.code).toContain(
      '<div class="piece-block piece-held side-left frame-portrait" style="--ar: 0.6667">',
    );
    // square.jpg is 200×200: a ratio of exactly 1 is width-starved on a
    // portrait screen like a landscape, so it collapses with them.
    const square = await render(':::held{src="./square.jpg" alt="s"}\nText.\n:::');
    expect(square.code).toContain(
      '<div class="piece-block piece-held side-left frame-landscape" style="--ar: 1">',
    );
  });

  it('an EXIF-rotated camera portrait is frame-portrait by its rendered shape', async () => {
    const { code } = await render(':::held{src="./rotated.jpg" alt="r"}\nText.\n:::');
    expect(code).toContain('frame-portrait" style="--ar: 0.6667"');
  });

  it('alt="" keeps the frame unlinked and the --ar on the image itself', async () => {
    const { code } = await render(':::held{src="./photo.jpg" alt=""}\nText.\n:::');
    expect(code).not.toContain('image-link');
    expect(code).toContain('style="--ar: 1.6"><figure><img');
    expect(imageMarkers(code)[0].style).toBe('--ar: 1.6');
  });

  it('the leaf form fails pointing at the container form', async () => {
    await expect(renderExpectingFailure('::held{src="./photo.jpg" alt="x"}')).rejects.toThrow(
      /::held is written as a container/,
    );
  });

  it('bleed with a value fails as a flag, naming the bare form', async () => {
    await expect(
      renderExpectingFailure(':::held{src="./photo.jpg" alt="x" bleed="left"}\nText.\n:::'),
    ).rejects.toThrow(/bleed is a flag on held: write \{bleed\}, not bleed="left"/);
  });

  it('side is enum-checked', async () => {
    await expect(
      renderExpectingFailure(':::held{src="./photo.jpg" alt="x" side="up"}\nText.\n:::'),
    ).rejects.toThrow(/invalid value "up" for side on held — allowed: left \| right/);
  });

  it('an image in the body fails — the body is prose', async () => {
    await expect(
      renderExpectingFailure(
        ':::held{src="./photo.jpg" alt="x"}\nText.\n\n![another](./portrait.jpg)\n:::',
      ),
    ).rejects.toThrow(/a held image's body is prose — no images beside the frame/);
  });

  it('a nested block directive in the body fails', async () => {
    await expect(
      renderExpectingFailure(
        ':::held{src="./photo.jpg" alt="x"}\nText.\n\n::single{src="./photo.jpg" alt="y"}\n:::',
      ),
    ).rejects.toThrow(/cannot be nested inside :::held/);
  });

  it('missing src and alt keep the family error contract', async () => {
    await expect(renderExpectingFailure(':::held{alt="x"}\nText.\n:::')).rejects.toThrow(
      /held requires a src attribute/,
    );
    await expect(renderExpectingFailure(':::held{src="./photo.jpg"}\nText.\n:::')).rejects.toThrow(
      /held requires an alt attribute/,
    );
  });

  it('pause renders a figure with the raw --ar and the linked image in its frame', async () => {
    const { code } = await render('::pause{src="./photo.jpg" alt="sweep"}');
    expect(code).toMatch(
      /^<figure class="piece-block piece-pause" style="--ar: 1\.6"><div class="piece-pause-frame"><a href="\/images\/fixtures\/photo\/" class="image-link" style="--ar: 1\.6"><img[^>]*__ASTRO_IMAGE_[^>]*><\/a><\/div><\/figure>/,
    );
    expect(code).not.toContain('<figcaption');
  });

  it("pause sizes come from the frame's raw pixel dimensions and its share × ratio", async () => {
    // photo.jpg is literally 8 × 5 pixels: the condition is the raw pair;
    // the share is (100 − 2 × 5) ÷ 1.05 = 85.71, so the height branch is
    // 85.71 × 1.6 = 137.1 → 138vh (rounded up, never under) and the
    // width branch 86vw.
    const { code } = await render('::pause{src="./photo.jpg" alt="sweep"}');
    expect(imageMarkers(code)[0]).toMatchObject({
      layout: 'constrained',
      sizes: '(min-aspect-ratio: 8/5) 138vh, 86vw',
    });
    // An EXIF-rotated frame measures as it renders (400 × 600, 0.6667):
    // 85.71 × 0.6667 = 57.1 → 58vh.
    const rotated = await render('::pause{src="./rotated.jpg" alt="r"}');
    expect(imageMarkers(rotated.code)[0].sizes).toBe('(min-aspect-ratio: 400/600) 58vh, 86vw');
  });

  it('the container form fails naming the rule', async () => {
    await expect(
      renderExpectingFailure(':::pause{src="./photo.jpg" alt="x"}\nA caption.\n:::'),
    ).rejects.toThrow(/the :::pause container form is not supported — use ::pause\{\.\.\.\}/);
  });

  it('alt="" keeps a pause unlinked, --ar on the image', async () => {
    const { code } = await render('::pause{src="./photo.jpg" alt=""}');
    expect(code).not.toContain('image-link');
    expect(code).toContain('<div class="piece-pause-frame"><img');
    expect(imageMarkers(code)[0].style).toBe('--ar: 1.6');
  });

  it('pause keeps the family error contract and the closed attribute set', async () => {
    await expect(renderExpectingFailure('::pause{src="./photo.jpg"}')).rejects.toThrow(
      /pause requires an alt attribute/,
    );
    await expect(
      renderExpectingFailure('::pause{src="./photo.jpg" alt="x" side="left"}'),
    ).rejects.toThrow(/unknown attribute "side" on pause — allowed: src, alt/);
  });

  it('the probe failure names the block that asked, not match="height"', async () => {
    // No file path: the probe cannot resolve the image at all.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(processor.render('::pause{src="./photo.jpg" alt="x"}')).rejects.toThrow(
        /pause needs piece-relative image files to measure/,
      );
      await expect(
        processor.render(':::held{src="./photo.jpg" alt="x"}\nText.\n:::'),
      ).rejects.toThrow(/held needs piece-relative image files to measure/);
      await expect(
        processor.render(
          '::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r" match="height"}',
        ),
      ).rejects.toThrow(/match="height" needs piece-relative image files to measure/);
      // strip's probe used to blame match="height" too; it names itself now.
      await expect(processor.render(':::strip\n![p](./photo.jpg)\n:::')).rejects.toThrow(
        /strip needs piece-relative image files to measure/,
      );
    } finally {
      spy.mockRestore();
    }
  });
});
