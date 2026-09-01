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
