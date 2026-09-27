import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { readFileSync } from 'node:fs';
import remarkDirective from 'remark-directive';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  DEFAULT_MODE,
  METHOD_WORDS,
  PLUGIN_BLOCKS,
  parseBlocks,
  resolveRelative,
} from './obsidian-plugin/blocks.ts';
import { STAGES_PATTERN, parseCompareBody } from './obsidian-plugin/compare.ts';
import { BLOCKS, remarkPiecesBlocks } from './remark-pieces-blocks.mjs';
import { COMPARE, COMPARE_WORDING } from './src/lib/compare.ts';
import { COMPARE_MODES } from './src/lib/image-meta.mjs';

// The plugin's reading of a :::compare body (spec 019, T1714), and of a
// :::side and a :::slider, which it shows as it shows a compare (T1727). Live
// Preview itself is attested by the photographer; this is the parse.

const flow = [
  '![Camera](./_land-b.jpg) Straight out of the camera, flat profile.',
  "![Tones](./_land-b.tones.jpg) Shadows lifted on the ridge, the fog's highlights held.",
  '![Finished](./land-b.jpg) A touch of warmth over the whole frame.',
].join('\n');

const expected = [
  { src: './_land-b.jpg', label: 'Camera', note: 'Straight out of the camera, flat profile.' },
  {
    src: './_land-b.tones.jpg',
    label: 'Tones',
    note: "Shadows lifted on the ridge, the fog's highlights held.",
  },
  { src: './land-b.jpg', label: 'Finished', note: 'A touch of warmth over the whole frame.' },
];

describe('parseCompareBody', () => {
  it("reads the flow's three lines as three stages, each image's text its label and the rest of the line its note", () => {
    expect(parseCompareBody(flow)).toEqual(expected);
  });

  it('reads stages separated by blank lines as it reads one stage per line', () => {
    const spaced = flow.split('\n').join('\n\n');
    expect(parseCompareBody(spaced)).toEqual(expected);
  });

  it('skips a stray line before the first image rather than making it a stage or a note', () => {
    const stray = `A line that belongs to no stage.\n${flow}`;
    expect(parseCompareBody(stray)).toEqual(expected);
  });
});

describe('STAGES_PATTERN', () => {
  it("matches the flow's whole block, attributes and all, and captures the body between the fences", () => {
    const doc = `Before.\n\n:::compare{mode="slider"}\n${flow}\n:::\n\nAfter.`;
    const match = new RegExp(STAGES_PATTERN, 'gm').exec(doc);
    expect(match?.[0]).toBe(`:::compare{mode="slider"}\n${flow}\n:::`);
    expect(match?.[2]).toBe(flow);
  });

  it.each(['side', 'slider'])('matches a :::%s block whole and captures its body', (name) => {
    const doc = `Before.\n\n:::${name}\n${flow}\n:::\n\nAfter.`;
    const match = new RegExp(STAGES_PATTERN, 'gm').exec(doc);
    expect(match?.[0]).toBe(`:::${name}\n${flow}\n:::`);
    expect(match?.[2]).toBe(flow);
  });

  it('does not match a :::sidebar block', () => {
    const doc = `Before.\n\n:::sidebar\n${flow}\n:::\n\nAfter.`;
    expect(new RegExp(STAGES_PATTERN, 'gm').exec(doc)).toBeNull();
  });
});

// The plugin's block table and scanner (spec 019, amendment 2, T1730):
// the table pinned equal to the transform's vocabulary, and the scanner
// pinned against the transform's own reading of the sampler and the fog
// piece — the judge, not a hand list — then by hand, then at its edges.

describe('the block table equals the vocabulary (T1730)', () => {
  it("names exactly the transform's blocks, in the transform's order", () => {
    expect(Object.keys(PLUGIN_BLOCKS)).toEqual(Object.keys(BLOCKS));
  });

  it.each(Object.keys(BLOCKS))("%s: forms and body are the transform descriptor's", (name) => {
    const { forms, body } = PLUGIN_BLOCKS[name] ?? {};
    expect({ forms, body }).toEqual({ forms: BLOCKS[name].forms, body: BLOCKS[name].body });
  });

  it.each(Object.keys(PLUGIN_BLOCKS))(
    "%s: every slot's attributes are ones the transform requires",
    (name) => {
      const required = BLOCKS[name].attrs.required;
      for (const [src, alt] of PLUGIN_BLOCKS[name].slots ?? []) {
        expect(required).toContain(src);
        expect(required).toContain(alt);
      }
    },
  );

  it("METHOD_WORDS are the site's methods and words, and DEFAULT_MODE its default", () => {
    expect(Object.keys(METHOD_WORDS)).toEqual([...COMPARE_MODES]);
    expect(METHOD_WORDS).toEqual(COMPARE_WORDING.modes);
    expect(DEFAULT_MODE).toBe(COMPARE.defaultMode);
  });
});

const pieces = (slug) => new URL(`./src/content/pieces/${slug}/index.md`, import.meta.url);
const readPiece = (slug) => readFileSync(pieces(slug), 'utf8');

// The shorthand images: lines starting `![` outside every block's span.
const shorthandLines = (text, blocks) =>
  text
    .split('\n')
    .map((line, i) => (line.startsWith('![') ? i : -1))
    .filter((i) => i !== -1 && !blocks.some((b) => b.startLine <= i && i <= b.endLine));

// The vocabulary test's harness and its image-marker helper, copied
// (remark-pieces-vocabulary.test.mjs).
let processor;
beforeAll(async () => {
  processor = await createMarkdownProcessor({
    remarkPlugins: [remarkDirective, remarkPiecesBlocks],
    syntaxHighlight: false,
  });
});

const imageMarkers = (code) =>
  [...code.matchAll(/__ASTRO_IMAGE_="([^"]*)"/g)].map((m) =>
    JSON.parse(m[1].replaceAll('&#x22;', '"')),
  );

describe('the scanner against the transform (T1730)', () => {
  it.each([
    ['vocabulary-sampler', 33],
    ['where-the-fog-lets-go', 8],
  ])('%s: finds the %i blocks the transform renders, by name and in order', async (slug, count) => {
    const text = readPiece(slug);
    const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
    const { code } = await processor.render(body, { fileURL: pieces(slug) });
    const rendered = [...code.matchAll(/class="piece-block piece-([a-z]+)/g)].map((m) => m[1]);
    const scanned = parseBlocks(text).map((b) => b.name);
    expect(rendered).toHaveLength(count);
    expect(scanned).toEqual(rendered);
  });

  it.each([
    ['vocabulary-sampler', 2],
    ['where-the-fog-lets-go', 1],
  ])(
    "%s: reads the transform's image srcs in order, stages included (%i shorthand images aside)",
    async (slug, shorthand) => {
      const text = readPiece(slug);
      const blocks = parseBlocks(text);
      const skip = new Set(shorthandLines(text, blocks));
      expect(skip.size).toBe(shorthand);
      const withoutShorthand = text
        .split('\n')
        .filter((_, i) => !skip.has(i))
        .join('\n');
      const body = withoutShorthand.replace(/^---\n[\s\S]*?\n---\n/, '');
      const { code } = await processor.render(body, { fileURL: pieces(slug) });
      const rendered = imageMarkers(code).map((m) => m.src);
      expect(rendered.length).toBeGreaterThan(0);
      expect(blocks.flatMap((b) => b.images.map((i) => i.src))).toEqual(rendered);
    },
  );
});

// What a block read, in the terms the hand tables below are written in:
// its images' srcs (a stage as [src, label]), its caption, the drawn
// attributes where written, its method, and its prose's first five words.
const summary = (b) => {
  const out = {
    name: b.name,
    images: b.images.map((i) => (i.label === undefined ? i.src : [i.src, i.label])),
  };
  if (b.caption !== '') out.caption = b.caption;
  for (const key of ['side', 'bleed', 'width', 'weight'])
    if (key in b.attrs) out[key] = b.attrs[key];
  if (b.method !== null) out.method = b.method;
  if (b.prose !== '') out.prose = b.prose.trim().split(/\s+/).slice(0, 5).join(' ');
  return out;
};

const SAMPLER = [
  { name: 'single', images: ['./land-b.jpg'] },
  {
    name: 'single',
    images: ['./land-c.jpg'],
    caption: 'A caption with _inline markdown_ — the container body.',
  },
  { name: 'inset', images: ['./square.jpg'] },
  {
    name: 'inset',
    images: ['./square.jpg'],
    caption: 'Narrower than the text, centered. For detail shots.',
  },
  { name: 'wide', images: ['./land-a.jpg'] },
  {
    name: 'wide',
    images: ['./land-b.jpg'],
    caption: 'The centered breakout — wider than the prose, short of the viewport.',
  },
  { name: 'wide', images: ['./land-c.jpg'], bleed: 'left' },
  { name: 'wide', images: ['./land-a.jpg'], bleed: 'right' },
  { name: 'fullbleed', images: ['./land-a.jpg'] },
  {
    name: 'fullbleed',
    images: ['./land-b.jpg'],
    caption: 'Viewport edge to edge; the caption returns to the column.',
  },
  { name: 'tall', images: ['./port-b.jpg'] },
  {
    name: 'tall',
    images: ['./port-a.jpg'],
    caption: "Capped below the viewport's height — the vertical counterpart to\nfullbleed.",
  },
  { name: 'diptych', images: ['./land-a.jpg', './port-a.jpg'] },
  {
    name: 'diptych',
    images: ['./land-b.jpg', './land-c.jpg'],
    caption: 'Two matched frames, each on its own mat.',
  },
  { name: 'diptych', images: ['./land-a.jpg', './port-b.jpg'] },
  { name: 'diptych', images: ['./land-b.jpg', './port-45.jpg'], weight: 'left' },
  { name: 'diptych', images: ['./port-45.jpg', './land-c.jpg'], weight: 'right' },
  { name: 'diptych', images: ['./land-a.jpg', './land-b.jpg'], width: 'wide' },
  { name: 'diptych', images: ['./land-c.jpg', './port-a.jpg'], width: 'fullbleed' },
  { name: 'triptych', images: ['./land-a.jpg', './port-a.jpg', './land-b.jpg'] },
  { name: 'triptych', images: ['./land-c.jpg', './port-b.jpg', './square.jpg'] },
  { name: 'triptych', images: ['./land-a.jpg', './port-b.jpg', './land-c.jpg'], width: 'wide' },
  {
    name: 'triptych',
    images: ['./land-b.jpg', './port-a.jpg', './land-a.jpg'],
    width: 'fullbleed',
  },
  {
    name: 'grid',
    images: ['./land-a.jpg', './port-45.jpg', './square.jpg', './land-b.jpg'],
    caption: 'A four-image cluster with a caption spanning the grid.',
  },
  {
    name: 'strip',
    images: ['./pano.jpg'],
    caption: 'The band scrolls sideways; the pano keeps its height.',
  },
  {
    name: 'strip',
    images: ['./land-a.jpg', './port-a.jpg', './land-b.jpg', './square.jpg', './land-c.jpg'],
  },
  { name: 'aside', images: ['./port-45.jpg'], side: 'left', prose: 'The prose wraps around the' },
  {
    name: 'aside',
    images: ['./port-45.jpg'],
    side: 'right',
    prose: 'The same treatment mirrored. Floats',
  },
  { name: 'row', images: ['./port-a.jpg'], side: 'left', prose: 'The row keeps image and' },
  { name: 'row', images: ['./land-a.jpg'], side: 'right', prose: 'Mirrored, image on the right.' },
  { name: 'held', images: ['./land-b.jpg'], prose: 'Sample prose, to give the' },
  { name: 'held', images: ['./port-a.jpg'], side: 'right', prose: 'Sample prose, for a held' },
  { name: 'single', images: ['../where-the-fog-lets-go/land-b.jpg'] },
];

const FOG = [
  {
    name: 'held',
    images: ['./land-b.jpg'],
    side: 'right',
    prose: 'The ten minutes. Ridgeline out,',
  },
  {
    name: 'diptych',
    images: ['./land-c.jpg', './port-b.jpg'],
    caption: 'Same cove, three minutes apart. The vertical earns its height.',
  },
  {
    name: 'tall',
    images: ['./port-a.jpg'],
    caption: 'The sea stack, top to bottom — the frame that needed to stand up.',
  },
  { name: 'fullbleed', images: ['./pano.jpg'] },
  { name: 'fullbleed', images: ['./land-b.jpg'] },
  {
    name: 'compare',
    images: [
      ['./_land-b.jpg', 'Camera'],
      ['./_land-b.tones.jpg', 'Tones'],
      ['./land-b.jpg', 'Finished'],
    ],
    method: 'Switch',
  },
  {
    name: 'side',
    images: [
      ['./_land-b.jpg', 'Camera'],
      ['./_land-b.tones.jpg', 'Tones'],
    ],
    method: 'side',
  },
  {
    name: 'slider',
    images: [
      ['./_land-b.jpg', 'Camera'],
      ['./land-b.jpg', 'Finished'],
    ],
    method: 'slider',
  },
];

describe('what the scanner reads, by hand (T1730)', () => {
  it.each([
    ['vocabulary-sampler', SAMPLER, [20, 259]],
    ['where-the-fog-lets-go', FOG, [17]],
  ])(
    '%s: every block with its images, caption, attributes, method and prose; the shorthand images are not blocks',
    (slug, expected, shorthand) => {
      const text = readPiece(slug);
      const blocks = parseBlocks(text);
      expect(blocks.map(summary)).toEqual(expected);
      expect(shorthandLines(text, blocks)).toEqual(shorthand);
    },
  );
});

describe('the scanner at its edges (T1730)', () => {
  const leaf = '::single{src="./a.jpg" alt="x"}';

  it('a directive with text before it on its line is not a block', () => {
    expect(parseBlocks(`Text ${leaf} more.`)).toEqual([]);
  });

  it('a leaf inside a code fence is not a block, with ``` or ~~~', () => {
    expect(parseBlocks(`Before.\n\n\`\`\`\n${leaf}\n\`\`\`\n\nAfter.`)).toEqual([]);
    expect(parseBlocks(`Before.\n\n~~~md\n${leaf}\n~~~\n\nAfter.`)).toEqual([]);
  });

  it('a leaf after a closed fence is a block again', () => {
    expect(parseBlocks(`\`\`\`\ncode\n\`\`\`\n${leaf}`).map((b) => b.name)).toEqual(['single']);
  });

  it('a :::sidebar is not a block, and a leaf inside it is', () => {
    const blocks = parseBlocks(`:::sidebar\n${leaf}\n:::`);
    expect(blocks.map((b) => [b.name, b.startLine])).toEqual([['single', 1]]);
  });

  const stages = [
    { src: './_land-b.jpg', alt: 'Camera', label: 'Camera' },
    { src: './_land-b.tones.jpg', alt: 'Tones', label: 'Tones' },
    { src: './land-b.jpg', alt: 'Finished', label: 'Finished' },
  ];

  it("claims a :::compare whole, attributes and all, and reads the flow's stages from its body", () => {
    const whole = `:::compare{mode="slider"}\n${flow}\n:::`;
    const doc = `Before.\n\n${whole}\n\nAfter.`;
    const [block, ...more] = parseBlocks(doc);
    expect(more).toEqual([]);
    expect(doc.slice(block.from, block.to)).toBe(whole);
    expect([block.startLine, block.endLine]).toEqual([2, 6]);
    expect(block.images).toEqual(stages);
    expect(block.method).toBe('Slider');
  });

  it.each(['side', 'slider'])(
    "claims a :::%s whole and reads the flow's two stages from its body",
    (name) => {
      const two = flow.split('\n').slice(0, 2).join('\n');
      const whole = `:::${name}\n${two}\n:::`;
      const doc = `Before.\n\n${whole}\n\nAfter.`;
      const [block, ...more] = parseBlocks(doc);
      expect(more).toEqual([]);
      expect(block.name).toBe(name);
      expect(doc.slice(block.from, block.to)).toBe(whole);
      expect(block.images).toEqual(stages.slice(0, 2));
      expect(block.method).toBe(name);
    },
  );

  it('does not claim a :::sidebar holding the flow', () => {
    expect(parseBlocks(`Before.\n\n:::sidebar\n${flow}\n:::\n\nAfter.`)).toEqual([]);
  });

  it("reads a :::compare's stages separated by blank lines as one per line", () => {
    const [block] = parseBlocks(`:::compare\n${flow.split('\n').join('\n\n')}\n:::`);
    expect(block.images).toEqual(stages);
  });

  it('a known opener with no closer is not a block, and swallows nothing after it', () => {
    const blocks = parseBlocks(`:::grid\n![One](./a.jpg)\n\n${leaf}`);
    expect(blocks.map((b) => [b.name, b.startLine])).toEqual([['single', 3]]);
  });

  it('a container-only name in leaf form is not a block', () => {
    expect(parseBlocks('::grid{}')).toEqual([]);
  });

  it('a :::grid with no images is not a block, and the leaf inside it is not read', () => {
    expect(parseBlocks(`:::grid\n${leaf}\n:::`)).toEqual([]);
  });

  it("a container single's two-paragraph caption is both paragraphs", () => {
    const [block] = parseBlocks(
      ':::single{src="./a.jpg" alt="x"}\nFirst line.\n\nSecond thought.\n:::',
    );
    expect(block.caption).toBe('First line.\n\nSecond thought.');
  });

  it('a leaf with its src missing is not a block', () => {
    expect(parseBlocks('::single{alt="x"}')).toEqual([]);
  });

  it("a compare with a mode the site doesn't know shows the default method", () => {
    const [block] = parseBlocks(`:::compare{mode="nope"}\n${flow}\n:::`);
    expect(block.method).toBe('Slider');
  });

  it('a leaf directly under a paragraph line is a block — and the site renders it as one', async () => {
    const doc = 'Text\n::single{src="./photo.jpg" alt="x"}';
    expect(parseBlocks(doc).map((b) => [b.name, b.startLine])).toEqual([['single', 1]]);
    const { code } = await processor.render(doc, {
      fileURL: new URL('./tests/fixtures/piece.md', import.meta.url),
    });
    expect(code).toContain('piece-single');
  });
});

describe('resolveRelative (T1730)', () => {
  const note = 'src/content/pieces/alpha/index.md';

  it('a bare or ./ name is a name, for Obsidian to look up', () => {
    expect(resolveRelative('./a.jpg', note)).toEqual({ kind: 'name' });
  });

  it("a sibling piece's path resolves from the note's folder", () => {
    expect(resolveRelative('../beta/a.jpg', note)).toEqual({
      kind: 'path',
      path: 'src/content/pieces/beta/a.jpg',
    });
  });

  it('the gallery root resolves from the note', () => {
    expect(resolveRelative('../../gallery-images/a.jpg', note)).toEqual({
      kind: 'path',
      path: 'src/content/gallery-images/a.jpg',
    });
  });

  it('a climb past the vault root is unreachable', () => {
    expect(resolveRelative('../../../../../a.jpg', note)).toEqual({ kind: 'unreachable' });
  });
});
