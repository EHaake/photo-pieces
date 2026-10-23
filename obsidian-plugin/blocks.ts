// The plugin's reading of a note: one table of every block in the site's
// vocabulary, and one scanner that claims each block's lines and reads
// what the block shows — its images, its caption, its prose, its method.
// Both renderers read what the scanner returns. Kept free of the
// `obsidian` import so the site's test suite can read it
// (obsidian-plugin.test.mjs at the repo root), which pins the table equal
// to the transform's vocabulary (remark-pieces-blocks.mjs) and the scanner
// against the transform's own reading of the sampler and the fog piece.
// The plugin never imports the transform; the site build stays the judge,
// and what the scanner cannot read stays raw text.

import { IMAGE_PATTERN, parseCompareBody } from './compare';

export type Width = 'column' | 'wide' | 'full' | 'tall' | 'inset' | 'side' | 'held';
export type Layout = 'frame' | 'pair' | 'grid' | 'strip' | 'beside' | 'stages';
export type PluginBlock = {
  forms: 'container' | 'both'; // = BLOCKS[name].forms
  body: 'caption' | 'prose' | 'images+caption' | 'stages'; // = BLOCKS[name].body
  layout: Layout;
  width?: Width; // frame: fixed; beside: the floated frame's share
  slots?: readonly (readonly [src: string, alt: string])[]; // attribute images, in order
  method?: string; // side and slider: the fixed method line
};

const ONE = [['src', 'alt']] as const;

/** Every block of the vocabulary, in the transform's order. */
export const PLUGIN_BLOCKS: Record<string, PluginBlock> = {
  single: { forms: 'both', body: 'caption', layout: 'frame', width: 'column', slots: ONE },
  fullbleed: { forms: 'both', body: 'caption', layout: 'frame', width: 'full', slots: ONE },
  wide: { forms: 'both', body: 'caption', layout: 'frame', width: 'wide', slots: ONE },
  tall: { forms: 'both', body: 'caption', layout: 'frame', width: 'tall', slots: ONE },
  inset: { forms: 'both', body: 'caption', layout: 'frame', width: 'inset', slots: ONE },
  diptych: {
    forms: 'both',
    body: 'caption',
    layout: 'pair',
    slots: [
      ['left', 'leftAlt'],
      ['right', 'rightAlt'],
    ],
  },
  triptych: {
    forms: 'both',
    body: 'caption',
    layout: 'pair',
    slots: [
      ['left', 'leftAlt'],
      ['center', 'centerAlt'],
      ['right', 'rightAlt'],
    ],
  },
  grid: { forms: 'container', body: 'images+caption', layout: 'grid' },
  strip: { forms: 'container', body: 'images+caption', layout: 'strip' },
  aside: { forms: 'container', body: 'prose', layout: 'beside', width: 'side', slots: ONE },
  row: { forms: 'container', body: 'prose', layout: 'beside', width: 'side', slots: ONE },
  held: { forms: 'container', body: 'prose', layout: 'beside', width: 'held', slots: ONE },
  compare: { forms: 'container', body: 'stages', layout: 'stages' },
  side: { forms: 'container', body: 'stages', layout: 'stages', method: 'side' },
  slider: { forms: 'container', body: 'stages', layout: 'stages', method: 'slider' },
};

/** A compare's method line, by its `mode` — the site's words, pinned equal. */
export const METHOD_WORDS: Record<string, string> = {
  slider: 'Slider',
  side: 'Side by side',
  switch: 'Switch',
  filmstrip: 'Filmstrip',
};
export const DEFAULT_MODE = 'slider';

// `label` is set for stages only (the three blocks that take stages):
// shown beneath the image.
export type Image = { src: string; alt: string; label?: string };
export type ParsedBlock = {
  name: string;
  from: number;
  to: number; // offsets: opener line's start, closer line's end
  startLine: number;
  endLine: number; // 0-based, inclusive
  attrs: Record<string, string>;
  images: Image[]; // slots, body images, or stages (label set)
  caption: string; // Markdown, '' when none
  prose: string; // Markdown, '' unless body is 'prose'
  method: string | null;
};

type Resolved =
  | { kind: 'name' } // bare name: Obsidian's own linkpath lookup
  | { kind: 'path'; path: string } // vault-relative path, resolved here
  | { kind: 'unreachable' }; // climbs above the vault root: nothing can match

/** Where a `src` points, seen from the note at `sourcePath`. A src with a
 *  folder in it is resolved the way the site build resolves it — never by
 *  name — so a wrong path is not found rather than found elsewhere. */
export function resolveRelative(src: string, sourcePath: string): Resolved {
  const rest = src.replace(/^\.\//, '');
  if (!rest.includes('/')) return { kind: 'name' };

  const lastSlash = sourcePath.lastIndexOf('/');
  const folder = lastSlash === -1 ? '' : sourcePath.slice(0, lastSlash);

  const out: string[] = [];
  for (const segment of (folder ? `${folder}/${rest}` : rest).split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      if (out.length === 0) return { kind: 'unreachable' };
      out.pop();
      continue;
    }
    out.push(segment);
  }
  if (out.length === 0) return { kind: 'unreachable' };
  return { kind: 'path', path: out.join('/') };
}

export function parseAttrs(raw: string): Record<string, string> {
  // Quoted or unquoted values, as remark-directive accepts both.
  const attrs: Record<string, string> = {};
  const attrRe = /(\w+)=(?:"([^"]*)"|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw))) {
    attrs[m[1]] = m[2] ?? m[3];
  }
  return attrs;
}

// The transform's grammar for our blocks is two line shapes: a leaf of one
// line, and a container from its opener to the first closer after it. A
// directive with text before it on its line matches neither — it stays raw
// in both views, as the site does not treat it as a block either.
const LEAF_LINE = /^::([a-z]+)(\{[^}]*\})?[ \t]*$/;
const OPENER_LINE = /^:::([a-z]+)(\{[^}]*\})?[ \t]*$/;
const CLOSER_LINE = /^:::[ \t]*$/;
const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})/;

const has = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

/** Every block in `text`, in order. A line scanner that claims spans, not
 *  a Markdown parser: a container claims its lines up to its closer, and
 *  its body is not scanned for blocks (the transform refuses nesting); a
 *  known opener with no closer is not a block, so the rest of a note is
 *  never swallowed; lines in a code fence outside any claimed span are
 *  skipped. A block that yields no image — a slot's `src` missing, an
 *  empty grid, a compare with no stages — is not a block, but a
 *  container's span stays claimed. */
export function parseBlocks(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const starts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1;
  }

  const blocks: ParsedBlock[] = [];
  let fence: RegExp | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (fence) {
      if (fence.test(line)) fence = null;
      continue;
    }
    const opensFence = FENCE_LINE.exec(line);
    if (opensFence) {
      const [char] = opensFence[1];
      fence = new RegExp(`^ {0,3}${char}{${opensFence[1].length},}[ \\t]*$`);
      continue;
    }

    const leaf = LEAF_LINE.exec(line);
    if (leaf) {
      if (has(PLUGIN_BLOCKS, leaf[1]) && PLUGIN_BLOCKS[leaf[1]].forms === 'both') {
        const read = readBlock(leaf[1], leaf[2], '');
        if (read) {
          const span = { from: starts[i], to: starts[i] + line.length, startLine: i, endLine: i };
          blocks.push({ name: leaf[1], ...span, ...read });
        }
      }
      continue;
    }

    const opener = OPENER_LINE.exec(line);
    if (!opener || !has(PLUGIN_BLOCKS, opener[1])) continue;
    let close = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (CLOSER_LINE.test(lines[j])) {
        close = j;
        break;
      }
    }
    if (close === -1) continue;
    const read = readBlock(opener[1], opener[2], lines.slice(i + 1, close).join('\n'));
    if (read) {
      const span = {
        from: starts[i],
        to: starts[close] + lines[close].length,
        startLine: i,
        endLine: close,
      };
      blocks.push({ name: opener[1], ...span, ...read });
    }
    i = close;
  }
  return blocks;
}

type Read = Pick<ParsedBlock, 'attrs' | 'images' | 'caption' | 'prose' | 'method'>;

/** What a block shows, by the transform's rules for its body; `null` when
 *  it shows no image. `braces` is the attribute braces as written, if any. */
function readBlock(name: string, braces: string | undefined, body: string): Read | null {
  const block = PLUGIN_BLOCKS[name];
  const attrs = braces ? parseAttrs(braces.slice(1, -1)) : {};
  let images: Image[] = [];
  let caption = '';
  let prose = '';

  for (const [src, alt] of block.slots ?? []) {
    if (!attrs[src]) return null; // a slot's src missing: stay raw
    images.push({ src: attrs[src], alt: attrs[alt] ?? '' });
  }

  if (block.body === 'caption') {
    caption = body.trim();
  } else if (block.body === 'prose') {
    prose = body;
  } else if (block.body === 'images+caption') {
    const read = readImagesAndCaption(body);
    images = read.images;
    caption = read.caption;
  } else {
    images = parseCompareBody(body).map(({ src, label }) => ({ src, alt: label, label }));
  }
  if (images.length === 0) return null;

  let method: string | null = null;
  if (block.body === 'stages') {
    const mode = has(METHOD_WORDS, attrs.mode ?? '') ? attrs.mode : DEFAULT_MODE;
    method = block.method ?? METHOD_WORDS[mode];
  }
  return { attrs, images, caption, prose, method };
}

/** A grid's or a strip's body, as the transform partitions it: the leading
 *  run of paragraphs (blank-line separated) made only of images are its
 *  images; from the first paragraph that is not, everything, joined, is its
 *  caption — an image line after the caption included. */
function readImagesAndCaption(body: string): { images: Image[]; caption: string } {
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of body.split('\n')) {
    if (line.trim() === '') {
      if (current.length > 0) paragraphs.push(current.join('\n'));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current.join('\n'));

  const images: Image[] = [];
  let i = 0;
  for (; i < paragraphs.length; i++) {
    const found: Image[] = [];
    const image = new RegExp(IMAGE_PATTERN, 'g');
    let m: RegExpExecArray | null;
    while ((m = image.exec(paragraphs[i]))) found.push({ src: m[2], alt: m[1] });
    const imagesOnly = found.length > 0 && paragraphs[i].replace(image, '').trim() === '';
    if (!imagesOnly) break;
    images.push(...found);
  }
  return { images, caption: paragraphs.slice(i).join('\n\n') };
}

/** What Reading view draws for one section: a run of the section's own
 *  lines, as Markdown, or a block, as its figure. Lines are 0-based and
 *  inclusive, as `getSectionInfo` gives them. */
export type Piece =
  | { kind: 'markdown'; startLine: number; endLine: number }
  | { kind: 'figure'; block: ParsedBlock };

/** A Reading view section's pieces, lines `lineStart`–`lineEnd` of the
 *  note whose blocks are `blocks`; `null` when the section touches no
 *  block, to be left as Obsidian drew it. Lines outside every block are
 *  Markdown runs; a block that begins in the section is a figure, drawn
 *  from its whole source whatever sections it spans; the lines of a block
 *  that began above the section are dropped — its first section drew it.
 *  An empty list: the section is all later lines of blocks. */
export function sectionPieces(
  blocks: ParsedBlock[],
  lineStart: number,
  lineEnd: number,
): Piece[] | null {
  const touching = blocks.filter((b) => b.startLine <= lineEnd && b.endLine >= lineStart);
  if (touching.length === 0) return null;

  const pieces: Piece[] = [];
  let next = lineStart; // the first line not yet placed
  for (const block of touching) {
    if (block.startLine >= lineStart) {
      if (block.startLine > next) {
        pieces.push({ kind: 'markdown', startLine: next, endLine: block.startLine - 1 });
      }
      pieces.push({ kind: 'figure', block });
    }
    next = Math.max(next, block.endLine + 1);
  }
  if (next <= lineEnd) pieces.push({ kind: 'markdown', startLine: next, endLine: lineEnd });
  return pieces;
}

/** The note's blocks as written — their source slices, joined — so that
 *  an edit inside any block, or one that makes or unmakes a block, changes
 *  it, and an edit outside every block does not. */
export function blockSignature(blocks: ParsedBlock[], text: string): string {
  return blocks.map((b) => text.slice(b.from, b.to)).join('\u0000');
}
