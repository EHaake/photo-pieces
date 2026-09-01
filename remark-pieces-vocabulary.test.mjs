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
