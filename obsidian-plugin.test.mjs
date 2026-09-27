import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { readdirSync, readFileSync } from 'node:fs';
import remarkDirective from 'remark-directive';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  DEFAULT_MODE,
  METHOD_WORDS,
  PLUGIN_BLOCKS,
  blockSignature,
  parseBlocks,
  resolveRelative,
  sectionPieces,
} from './obsidian-plugin/blocks.ts';
import { parseCompareBody } from './obsidian-plugin/compare.ts';
import { figureTree } from './obsidian-plugin/figure.ts';
import { BLOCKS, remarkPiecesBlocks } from './remark-pieces-blocks.mjs';
import { COMPARE, COMPARE_WORDING } from './src/lib/compare.ts';
import { blocks, uncomment } from './src/lib/ground.ts';
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

  it("a grid's images are its leading run: an image line after the caption is caption, as the transform reads it", () => {
    const [block] = parseBlocks(
      ':::grid\n![One](./a.jpg)\n![Two](./b.jpg)\n\nA caption.\n\n![Three](./c.jpg)\n:::',
    );
    expect(block.images).toEqual([
      { src: './a.jpg', alt: 'One' },
      { src: './b.jpg', alt: 'Two' },
    ]);
    expect(block.caption).toBe('A caption.\n\n![Three](./c.jpg)');
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

// The figure (spec 019, amendment 2, T1731): the tree both views draw,
// read without a DOM. Every src resolves to `app://<src>` but one.
const MISSING = './gone.jpg';
const resolve = (src) => (src === MISSING ? null : `app://${src}`);
const figureOf = (doc) => {
  const found = parseBlocks(doc);
  expect(found).toHaveLength(1);
  return figureTree(found[0], resolve);
};
const img = (src, alt) => ({
  tag: 'img',
  classes: [],
  attrs: { src: `app://${src}`, alt },
  children: [],
});
const div = (classes, children) => ({ tag: 'div', classes, children });

describe('the figure (T1731)', () => {
  it.each([
    [
      'a wide pair',
      '::diptych{left="./a.jpg" leftAlt="a" right="./b.jpg" rightAlt="b" width="wide"}',
      ['photo-pieces-block', 'photo-pieces-pair', 'photo-pieces-w-wide'],
    ],
    [
      'a fullbleed pair at full',
      '::triptych{left="./a.jpg" leftAlt="a" center="./b.jpg" centerAlt="b" right="./c.jpg" rightAlt="c" width="fullbleed"}',
      ['photo-pieces-block', 'photo-pieces-pair', 'photo-pieces-w-full'],
    ],
    [
      'a weighted diptych, at column',
      '::diptych{left="./a.jpg" leftAlt="a" right="./b.jpg" rightAlt="b" weight="right"}',
      [
        'photo-pieces-block',
        'photo-pieces-pair',
        'photo-pieces-w-column',
        'photo-pieces-weight-right',
      ],
    ],
    [
      'a bleed-left wide',
      '::wide{src="./a.jpg" alt="a" bleed="left"}',
      [
        'photo-pieces-block',
        'photo-pieces-frame',
        'photo-pieces-w-wide',
        'photo-pieces-bleed-left',
      ],
    ],
    [
      'a fullbleed',
      '::fullbleed{src="./a.jpg" alt="a"}',
      ['photo-pieces-block', 'photo-pieces-frame', 'photo-pieces-w-full'],
    ],
    [
      'a right aside',
      ':::aside{src="./a.jpg" alt="a" side="right"}\nWords.\n:::',
      [
        'photo-pieces-block',
        'photo-pieces-beside',
        'photo-pieces-w-side',
        'photo-pieces-side-right',
      ],
    ],
    [
      'a held with no side, on the left',
      ':::held{src="./a.jpg" alt="a"}\nWords.\n:::',
      [
        'photo-pieces-block',
        'photo-pieces-beside',
        'photo-pieces-w-held',
        'photo-pieces-side-left',
      ],
    ],
    [
      'a grid at column',
      ':::grid\n![a](./a.jpg)\n:::',
      ['photo-pieces-block', 'photo-pieces-grid', 'photo-pieces-w-column'],
    ],
    [
      'a strip at full',
      ':::strip\n![a](./a.jpg)\n:::',
      ['photo-pieces-block', 'photo-pieces-strip', 'photo-pieces-w-full'],
    ],
    [
      'a compare at column',
      `:::compare\n${flow}\n:::`,
      ['photo-pieces-block', 'photo-pieces-stages', 'photo-pieces-w-column'],
    ],
  ])("%s: the root's classes exactly, and its block by name", (_, doc, classes) => {
    const root = figureOf(doc);
    expect(root.tag).toBe('div');
    expect(root.classes).toEqual(classes);
    expect(root.attrs).toEqual({ 'data-block': parseBlocks(doc)[0].name });
  });

  it('a container single: its frame, then its caption as Markdown', () => {
    const root = figureOf(':::single{src="./a.jpg" alt="An alt"}\nA _caption_.\n:::');
    expect(root.children).toEqual([
      div(['photo-pieces-frames'], [img('./a.jpg', 'An alt')]),
      div(['photo-pieces-caption'], [{ markdown: 'A _caption_.' }]),
    ]);
  });

  it("a leaf's empty caption draws no caption node", () => {
    const root = figureOf('::single{src="./a.jpg" alt="a"}');
    expect(root.children).toEqual([div(['photo-pieces-frames'], [img('./a.jpg', 'a')])]);
  });

  it("a pair's frames in order, then its caption", () => {
    const root = figureOf(
      ':::diptych{left="./a.jpg" leftAlt="l" right="./b.jpg" rightAlt="r"}\nTwo.\n:::',
    );
    expect(root.children).toEqual([
      div(['photo-pieces-frames'], [img('./a.jpg', 'l'), img('./b.jpg', 'r')]),
      div(['photo-pieces-caption'], [{ markdown: 'Two.' }]),
    ]);
  });

  it('a beside block: its frame, then its prose as Markdown, inside the figure', () => {
    const root = figureOf(':::row{src="./a.jpg" alt="a" side="left"}\nThe prose.\n:::');
    expect(root.children).toEqual([
      div(['photo-pieces-frames'], [img('./a.jpg', 'a')]),
      div(['photo-pieces-prose'], [{ markdown: 'The prose.' }]),
    ]);
  });

  it('an unresolved src draws the missing box with its exact text', () => {
    const root = figureOf(`::diptych{left="./a.jpg" leftAlt="l" right="${MISSING}" rightAlt="r"}`);
    expect(root.children[0].children).toEqual([
      img('./a.jpg', 'l'),
      div(['photo-pieces-missing'], [{ text: `[diptych: image not found — ${MISSING}]` }]),
    ]);
  });

  it('a compare with no mode: stage nodes carrying their labels, then the method line Slider', () => {
    const root = figureOf(`:::compare\n${flow}\n:::`);
    const stage = (src, label) =>
      div(
        ['photo-pieces-stage'],
        [img(src, label), div(['photo-pieces-stage-label'], [{ text: label }])],
      );
    expect(root.children).toEqual([
      div(
        ['photo-pieces-frames'],
        [
          stage('./_land-b.jpg', 'Camera'),
          stage('./_land-b.tones.jpg', 'Tones'),
          stage('./land-b.jpg', 'Finished'),
        ],
      ),
      div(['photo-pieces-method'], [{ text: 'Slider' }]),
    ]);
  });

  it("a :::side's method line is its own name, and a missing stage keeps its label", () => {
    const two = `![Camera](${MISSING}) Note.\n![Finished](./land-b.jpg)`;
    const root = figureOf(`:::side\n${two}\n:::`);
    expect(root.children[0].children[0]).toEqual(
      div(
        ['photo-pieces-stage'],
        [
          div(['photo-pieces-missing'], [{ text: `[side: image not found — ${MISSING}]` }]),
          div(['photo-pieces-stage-label'], [{ text: 'Camera' }]),
        ],
      ),
    );
    expect(root.children.slice(1)).toEqual([div(['photo-pieces-method'], [{ text: 'side' }])]);
  });
});

// The plugin never imports the transform (T1734a): its sources import
// only Obsidian, CodeMirror and each other, so the vocabulary it mirrors
// is pinned by the cases above, not shared by an import.
const pluginSources = readdirSync(new URL('./obsidian-plugin/', import.meta.url)).filter((name) =>
  name.endsWith('.ts'),
);

describe('the plugin imports only obsidian, @codemirror/* and itself (T1734a)', () => {
  it('has sources to read', () => {
    expect(pluginSources).toEqual(expect.arrayContaining(['blocks.ts', 'figure.ts', 'main.ts']));
  });

  it.each(pluginSources)('%s imports nothing else', (name) => {
    const source = readFileSync(new URL(`./obsidian-plugin/${name}`, import.meta.url), 'utf8');
    const imported = [...source.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g)].map(
      (m) => m[1],
    );
    expect(
      imported.filter(
        (spec) => spec !== 'obsidian' && !spec.startsWith('@codemirror/') && !spec.startsWith('./'),
      ),
    ).toEqual([]);
  });
});

// The stylesheet (T1731): every rule the plugin writes wins over
// Obsidian's (the Phase 3a collapse), stays inside the plugin's classes,
// and carries the tuning envelope's tokens at their values.
const PLUGIN_TOKENS = {
  '--photo-pieces-inset': '0.65',
  '--photo-pieces-wide': '1.7',
  '--photo-pieces-wide-cap': '0.96',
  '--photo-pieces-full': '1',
  '--photo-pieces-side': '0.45',
  '--photo-pieces-held': '0.5',
  '--photo-pieces-tall': '0.8',
  '--photo-pieces-grid-columns': '2',
  '--photo-pieces-gap': '0.5em',
  '--photo-pieces-strip-height': '14em',
  '--photo-pieces-stage-min': '12em',
  '--photo-pieces-caption-size': '0.85em',
  '--photo-pieces-caption-color': 'var(--text-muted)',
  '--photo-pieces-method-display': 'block',
};
const PANE_HOSTS = ['.markdown-source-view.mod-cm6 .cm-scroller', '.markdown-preview-view'];

const pluginCss = uncomment(
  readFileSync(new URL('./obsidian-plugin/styles.css', import.meta.url), 'utf8'),
);
const rules = blocks(pluginCss).map(({ prelude, body }) => ({
  prelude,
  selectors: prelude.split(',').map((one) => one.trim().replace(/\s+/g, ' ')),
  declarations: body
    .split(';')
    .filter((part) => part.includes(':'))
    .map((part) => [
      part.slice(0, part.indexOf(':')).trim(),
      part
        .slice(part.indexOf(':') + 1)
        .trim()
        .replace(/\s+/g, ' '),
    ]),
}));

describe('the stylesheet (T1731)', () => {
  it('has rules to read', () => {
    expect(rules.length).toBeGreaterThan(10);
  });

  it('every declaration but a custom property ends in !important', () => {
    const without = rules.flatMap(({ prelude, declarations }) =>
      declarations
        .filter(([name, value]) => !name.startsWith('--') && !/!important$/.test(value))
        .map(([name]) => `${prelude.replace(/\s+/g, ' ')} { ${name} }`),
    );
    expect(without).toEqual([]);
  });

  it("every selector is the plugin's, but body (custom properties only) and the two pane hosts (container only)", () => {
    const outside = rules.flatMap(({ selectors, declarations }) =>
      selectors
        .filter((selector) => {
          if (selector.includes('.photo-pieces-')) return false;
          const names = declarations.map(([name]) => name);
          if (selector === 'body') return !names.every((name) => name.startsWith('--'));
          if (PANE_HOSTS.includes(selector)) return names.join() !== 'container';
          return true;
        })
        .map((selector) => `${selector} { ${declarations.map(([name]) => name).join('; ')} }`),
    );
    expect(outside).toEqual([]);
    for (const host of PANE_HOSTS) expect(rules.some((r) => r.selectors.includes(host))).toBe(true);
  });

  it("the widget root lifts Obsidian's contain: paint and restores its block margin with a selector that outranks both, so a breakout is not clipped to the column", () => {
    // Obsidian's app.css: important rules on every uneditable widget in
    // Live Preview, which CodeMirror makes the figure's root, and on every
    // child of .cm-content (margin: 0).
    const obsidian = '.markdown-source-view.mod-cm6 .cm-content > [contenteditable=false]';
    const obsidianMargin = '.markdown-source-view.mod-cm6 .cm-content > *';
    const classesAndAttributes = (selector) =>
      (selector.match(/\.[\w-]+|\[[^\]]+\]/g) ?? []).length;
    const lifting = rules.flatMap(({ selectors, declarations }) =>
      declarations.some(([name, value]) => name === 'contain' && value === 'none !important')
        ? selectors
        : [],
    );
    expect(lifting.length).toBeGreaterThan(0);
    for (const selector of lifting) {
      expect(selector).toMatch(
        /^\.markdown-source-view\.mod-cm6 \.cm-content > \.photo-pieces-block\[contenteditable=/,
      );
      expect(classesAndAttributes(selector)).toBeGreaterThan(classesAndAttributes(obsidian));
      expect(classesAndAttributes(selector)).toBeGreaterThan(classesAndAttributes(obsidianMargin));
    }
    // The root's own block margin, at the root rule's value, on the same selector.
    const rootMargin = rules
      .find(({ selectors }) => selectors.includes('.photo-pieces-block'))
      .declarations.find(([name]) => name === 'margin-block')[1];
    const restoring = rules.flatMap(({ selectors, declarations }) =>
      declarations.some(([name, value]) => name === 'margin-block' && value === rootMargin)
        ? selectors.filter((selector) => lifting.includes(selector))
        : [],
    );
    expect(rootMargin).toBe('var(--photo-pieces-gap) !important');
    expect(restoring).toEqual(lifting);
  });

  it('the grid centres each row on the midline (T1735b)', () => {
    // The site's .piece-grid sets align-items: center; a row's shorter
    // frame sits on the taller one's midline, not at its top.
    const grid = rules.find(({ selectors }) =>
      selectors.includes('.photo-pieces-grid > .photo-pieces-frames'),
    );
    expect(grid.declarations).toContainEqual(['align-items', 'center !important']);
  });

  it('has no at-rule', () => {
    expect(pluginCss.match(/@[\w-]+/g) ?? []).toEqual([]);
  });

  it('PLUGIN_TOKENS: each declared once, in body, at its value', () => {
    const declared = rules.flatMap(({ prelude, declarations }) =>
      declarations
        .filter(([name]) => name in PLUGIN_TOKENS)
        .map(([name, value]) => [prelude, name, value]),
    );
    expect(declared).toEqual(Object.entries(PLUGIN_TOKENS).map(([n, v]) => ['body', n, v]));
  });

  it("body's custom properties are exactly PLUGIN_TOKENS", () => {
    const onBody = rules
      .filter(({ selectors }) => selectors.includes('body'))
      .flatMap(({ declarations }) => declarations.map(([name]) => name))
      .filter((name) => name.startsWith('--'));
    expect(onBody).toEqual(Object.keys(PLUGIN_TOKENS));
  });

  it('every var(--photo-pieces-…) the stylesheet uses is declared', () => {
    const declared = new Set(rules.flatMap(({ declarations }) => declarations.map(([n]) => n)));
    const used = [...pluginCss.matchAll(/var\((--photo-pieces-[\w-]+)/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((name) => !declared.has(name))).toEqual([]);
  });

  it('every class it names is one the figure emits over the sampler and the fog piece, or photo-pieces-hidden', () => {
    const emitted = new Set(['photo-pieces-hidden']);
    const collect = (node) => {
      if (!node.tag) return;
      for (const name of node.classes) emitted.add(name);
      node.children.forEach(collect);
    };
    for (const slug of ['vocabulary-sampler', 'where-the-fog-lets-go'])
      for (const block of parseBlocks(readPiece(slug))) collect(figureTree(block, resolve));
    collect(figureOf(`::single{src="${MISSING}" alt="gone"}`));
    const named = [
      ...new Set([...pluginCss.matchAll(/\.(photo-pieces-[\w-]+)/g)].map((m) => m[1])),
    ];
    expect(named.length).toBeGreaterThan(10);
    expect(named.filter((name) => !emitted.has(name))).toEqual([]);
  });
});

// Reading view's sections (spec 019, amendment 2, T1733): Obsidian hands
// the post-processor one section at a time, split at blank lines, with its
// 0-based inclusive lines in the whole note. A block is drawn by the
// section it begins in, its later sections hidden, and a section touching
// no block left alone; the signature decides when the note re-renders.

describe("Reading view's sections (T1733)", () => {
  const text = readPiece('vocabulary-sampler');
  const lines = text.split('\n');
  const blocks = parseBlocks(text);

  // The section Obsidian would hand over whose first line starts `prefix`:
  // from that line to the last before a blank one.
  const section = (prefix) => {
    const start = lines.findIndex((line) => line.startsWith(prefix));
    expect(start).toBeGreaterThan(-1);
    let end = start;
    while (end + 1 < lines.length && lines[end + 1].trim() !== '') end++;
    return [start, end];
  };
  const pieces = (prefix) => sectionPieces(blocks, ...section(prefix));
  const held = blocks.find((b) => b.name === 'held');

  it("the held's first section, its opener and first paragraph, is one figure: the whole held", () => {
    const [start, end] = section(':::held{src="./land-b.jpg"');
    expect(end).toBe(start + 4);
    expect(pieces(':::held{src="./land-b.jpg"')).toEqual([{ kind: 'figure', block: held }]);
  });

  it("the held's third paragraph is no pieces: its first section drew it", () => {
    expect(pieces('The first paragraph meets the top')).toEqual([]);
  });

  it("the held's last section, its paragraph and closer, is no pieces", () => {
    const [, end] = section('The last line is the release.');
    expect(end).toBe(held.endLine);
    expect(pieces('The last line is the release.')).toEqual([]);
  });

  it('a section of plain prose touches no block: null, left as drawn', () => {
    expect(pieces('The held image: the frame stays fixed')).toBeNull();
  });

  it("a section with the grid's caption is no pieces", () => {
    expect(pieces('A four-image cluster with a caption')).toEqual([]);
  });

  it('a paragraph line with a leaf on the next line: a Markdown run of that line, then the figure', () => {
    const doc = 'Text\n::single{src="./photo.jpg" alt="x"}';
    const [single] = parseBlocks(doc);
    expect(sectionPieces([single], 0, 1)).toEqual([
      { kind: 'markdown', startLine: 0, endLine: 0 },
      { kind: 'figure', block: single },
    ]);
  });

  const signature = (note) => blockSignature(parseBlocks(note), note);
  const edit = (from, to) => {
    expect(text).toContain(from);
    return text.replace(from, to);
  };

  it('the signature is equal for two texts differing outside every block', () => {
    const edited = edit('The held image: the frame stays fixed', 'The held picture: it stays put');
    expect(edited).not.toBe(text);
    expect(signature(edited)).toBe(signature(text));
  });

  it("the signature differs for an edit inside the held's third paragraph", () => {
    const edited = edit('The first paragraph meets the top', 'The opening paragraph meets the top');
    expect(signature(edited)).not.toBe(signature(text));
  });

  it("the signature differs when a block's closer is deleted", () => {
    const edited = edit(
      'A four-image cluster with a caption spanning the grid.\n:::\n',
      'A four-image cluster with a caption spanning the grid.\n',
    );
    expect(signature(edited)).not.toBe(signature(text));
  });

  it('the signature differs when fences are typed around an existing image paragraph', () => {
    const image = '![A 3:2 placeholder](./land-a.jpg)';
    const edited = edit(`\n${image}\n`, `\n:::grid\n${image}\n:::\n`);
    expect(parseBlocks(edited).length).toBe(blocks.length + 1);
    expect(signature(edited)).not.toBe(signature(text));
  });
});
