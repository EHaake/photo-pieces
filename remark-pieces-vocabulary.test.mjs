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
    const markers = imageMarkers(code);
    expect(markers[1].style).toBe('--ar: 1'); // portrait is smallest
    expect(markers[0].style).toBe('--ar: 2.4'); // 1.6 / 0.6667
  });

  it('an EXIF-rotated camera portrait gets the rendered (swapped) ratio', async () => {
    // If the probe ignored orientation, rotated.jpg would read as ar 1.5
    // (landscape) and the pair would come out ~1.0667/1 — the swap is the
    // difference between correct and silently broken equal heights.
    const { code } = await render(
      '::diptych{left="./photo.jpg" right="./rotated.jpg" leftAlt="l" rightAlt="r" match="height"}',
    );
    const markers = imageMarkers(code);
    expect(markers[1].style).toBe('--ar: 1');
    expect(markers[0].style).toBe('--ar: 2.4');
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
    const markers = imageMarkers(code);
    expect(markers.map((m) => m.style)).toEqual(['--ar: 2.4', '--ar: 1', '--ar: 1']);
  });

  it('diptych and triptych container forms carry figcaptions now', async () => {
    const { code } = await render(
      ':::diptych{left="./photo.jpg" right="./portrait.jpg" leftAlt="l" rightAlt="r"}\nTwo frames, minutes apart.\n:::',
    );
    expect(code).toContain('<figcaption>Two frames, minutes apart.</figcaption>');
  });
});

describe('text directive restoration round-trips attributes (T202)', () => {
  it('a bare text directive with attributes comes back verbatim', async () => {
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
