import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { imageMetadata } from 'astro/assets/utils';
import { visit } from 'unist-util-visit';

// Turns the closed set of piece image-treatment directives (parsed by
// `remark-directive`) into figure-wrapped images. The vocabulary is closed
// by design — see CLAUDE.md — so an unrecognized `::name` / `:::name`, an
// unknown attribute, or the `{#id .class}` shorthand (the syntactic door
// to per-block style variants, banned by spec 003) fails the build with
// the offending file and line rather than silently rendering as nothing.
//
// Each block is a descriptor (spec 003's block-descriptor model):
//
//   forms:  'leaf' | 'container' | 'both' | 'reserved'
//   attrs:  { required: [...], optional: [...], enums: { name: [...] } }
//   images: (attrs, fail) => [{ src, alt }]  — validates and extracts
//   sizing: (attrs, imageIndex, ratios) => ({ layout, sizes })
//   matted: boolean — consumed by the matte CSS pass (spec 003 Phase 3)
//
// Images are emitted as real mdast `image` nodes (the node's children),
// NOT prebuilt hast — Astro's own `remarkCollectImages` runs after user
// plugins and only collects mdast image nodes; everything it collects is
// resolved through the `astro:assets` pipeline (hashed src, intrinsic
// dimensions, srcset, lazy loading) identically to a plain
// `![alt](./photo.jpg)`. The `layout`/`sizes` from `sizing` ride each
// image node's hProperties into that pipeline as per-image getImage()
// options.
//
// Single-colon text directives (`:word` mid-prose) are restored to the
// literal text the author typed, attributes included: none of the
// vocabulary uses them, failing on them would make ordinary prose a build
// hazard, and leaving them *unhandled* is not safe either — an unhandled
// directive node renders as an empty <div> that splits the paragraph.

// Shared with the CSS media queries: below this width the multi-column
// blocks collapse to stacked and render ~94vw. The same constant appears
// in global.css's piece-block section — keep them in step by hand.
const COLLAPSE = '(min-width: 720px)';

const BLOCKS = {
  single: {
    // The directive form of the column-width image — exists so a single
    // can carry a caption; plain ![alt](./img.jpg) stays the captionless
    // shorthand. 680px is coupled to --prose-width (68ch) minus matte —
    // see the coupling comment in global.css.
    forms: 'both',
    body: 'caption',
    attrs: { required: ['src', 'alt'], optional: [], enums: {} },
    images(attrs, fail) {
      if (!attrs.src) fail('single requires a src attribute');
      if (attrs.alt === undefined)
        fail('single requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    sizing: () => ({ layout: 'constrained', sizes: `${COLLAPSE} 680px, 94vw` }),
    matted: true,
  },

  fullbleed: {
    forms: 'both',
    body: 'caption',
    attrs: { required: ['src', 'alt'], optional: [], enums: {} },
    images(attrs, fail) {
      if (!attrs.src) fail('fullbleed requires a src attribute');
      if (attrs.alt === undefined)
        fail('fullbleed requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    sizing: () => ({ layout: 'full-width', sizes: '100vw' }),
    matted: false,
  },

  wide: {
    // Centered breakout to the content width; `bleed` runs the image to
    // ONE viewport edge while the other side respects the column.
    forms: 'both',
    body: 'caption',
    attrs: {
      required: ['src', 'alt'],
      optional: ['bleed'],
      enums: { bleed: ['left', 'right'] },
    },
    images(attrs, fail) {
      if (!attrs.src) fail('wide requires a src attribute');
      if (attrs.alt === undefined)
        fail('wide requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    classes: (attrs) => (attrs.bleed ? [`bleed-${attrs.bleed}`] : []),
    sizing: () => ({
      layout: 'constrained',
      sizes: '(min-width: 1240px) 1160px, 96vw',
    }),
    matted: true,
  },

  tall: {
    // The vertical counterpart to fullbleed: capped at viewport height,
    // width follows. Sizes err over (94vw) — height-capped rendering
    // width depends on the viewport's aspect ratio.
    forms: 'both',
    body: 'caption',
    attrs: { required: ['src', 'alt'], optional: [], enums: {} },
    images(attrs, fail) {
      if (!attrs.src) fail('tall requires a src attribute');
      if (attrs.alt === undefined)
        fail('tall requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    sizing: () => ({ layout: 'constrained', sizes: '94vw' }),
    matted: false,
  },

  inset: {
    forms: 'both',
    body: 'caption',
    attrs: { required: ['src', 'alt'], optional: [], enums: {} },
    images(attrs, fail) {
      if (!attrs.src) fail('inset requires a src attribute');
      if (attrs.alt === undefined)
        fail('inset requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    sizing: () => ({ layout: 'constrained', sizes: `${COLLAPSE} 440px, 80vw` }),
    matted: true,
  },

  diptych: {
    // Default: equal widths, center-aligned on a shared midline (spec 003
    // review). match="height" equalizes heights instead (widths follow
    // aspect ratio — needs the dimension probe); weight makes one frame
    // dominant at 2:1. The two contradict and cannot combine.
    forms: 'both',
    body: 'caption',
    attrs: {
      required: ['left', 'right', 'leftAlt', 'rightAlt'],
      optional: ['match', 'weight'],
      enums: { match: ['height'], weight: ['left', 'right'] },
    },
    validate(attrs, fail) {
      if (attrs.match && attrs.weight)
        fail(
          'diptych cannot combine weight with match="height" — they specify contradictory widths',
        );
    },
    images(attrs, fail) {
      if (!attrs.left || !attrs.right) fail('diptych requires left and right attributes');
      if (attrs.leftAlt === undefined || attrs.rightAlt === undefined)
        fail(
          'diptych requires leftAlt and rightAlt attributes (empty allowed for truly decorative images)',
        );
      return [
        { src: attrs.left, alt: attrs.leftAlt },
        { src: attrs.right, alt: attrs.rightAlt },
      ];
    },
    classes: (attrs) => [
      ...(attrs.match ? ['match-height'] : []),
      ...(attrs.weight ? [`weight-${attrs.weight}`] : []),
    ],
    needsRatios: (attrs) => Boolean(attrs.match),
    sizing(attrs, i, ratios) {
      if (attrs.weight) {
        const dominant = attrs.weight === 'left' ? 0 : 1;
        const px = i === dominant ? 453 : 227;
        return { layout: 'constrained', sizes: `${COLLAPSE} ${px}px, 94vw` };
      }
      if (attrs.match && ratios) {
        const sum = ratios.reduce((a, b) => a + b, 0);
        const px = Math.round((680 * ratios[i]) / sum);
        return { layout: 'constrained', sizes: `${COLLAPSE} ${px}px, 94vw` };
      }
      return { layout: 'constrained', sizes: `${COLLAPSE} 340px, 94vw` };
    },
    matted: true,
  },

  triptych: {
    forms: 'both',
    body: 'caption',
    attrs: {
      required: ['left', 'center', 'right', 'leftAlt', 'centerAlt', 'rightAlt'],
      optional: ['match'],
      enums: { match: ['height'] },
    },
    images(attrs, fail) {
      if (!attrs.left || !attrs.center || !attrs.right)
        fail('triptych requires left, center, and right attributes');
      if (
        attrs.leftAlt === undefined ||
        attrs.centerAlt === undefined ||
        attrs.rightAlt === undefined
      )
        fail(
          'triptych requires leftAlt, centerAlt, and rightAlt attributes (empty allowed for truly decorative images)',
        );
      return [
        { src: attrs.left, alt: attrs.leftAlt },
        { src: attrs.center, alt: attrs.centerAlt },
        { src: attrs.right, alt: attrs.rightAlt },
      ];
    },
    classes: (attrs) => (attrs.match ? ['match-height'] : []),
    needsRatios: (attrs) => Boolean(attrs.match),
    sizing(attrs, i, ratios) {
      if (attrs.match && ratios) {
        const sum = ratios.reduce((a, b) => a + b, 0);
        const px = Math.round((680 * ratios[i]) / sum);
        return { layout: 'constrained', sizes: `${COLLAPSE} ${px}px, 94vw` };
      }
      return { layout: 'constrained', sizes: `${COLLAPSE} 227px, 94vw` };
    },
    matted: true,
  },

  sequence: {
    // Reserved in the content model; presentation undecided (ROADMAP.md).
    // Modeled explicitly so a refactor can't regress this to the generic
    // unknown-name error — the message is a tested contract.
    forms: 'reserved',
    reservedMessage: 'the sequence block is reserved but not implemented yet — see ROADMAP.md',
  },
};

export function remarkPiecesBlocks() {
  // Async transformer: the dimension probe (match="height") awaits Astro's
  // imageMetadata. Ordering vs Astro's own collector is unchanged — remark
  // awaits a transformer's promise before running the next plugin.
  return async (tree, file) => {
    // Restore text directives to the prose the author typed — name,
    // label, and attributes all round-trip.
    visit(tree, 'textDirective', (node, index, parent) => {
      const attrText = serializeAttributes(node.attributes);
      const restored =
        node.children.length > 0
          ? [
              { type: 'text', value: `:${node.name}[` },
              ...node.children,
              { type: 'text', value: `]${attrText}` },
            ]
          : [{ type: 'text', value: `:${node.name}${attrText}` }];
      parent.children.splice(index, 1, ...restored);
      return index + restored.length;
    });

    const directives = [];
    visit(tree, ['leafDirective', 'containerDirective'], (node) => {
      directives.push(node);
    });

    for (const node of directives) {
      const failHere = (message) => fail(file, node, message);
      const block = BLOCKS[node.name];
      if (!block) {
        failHere(
          `unknown block directive "${node.name}" — the block vocabulary is closed; ` +
            `known blocks: ${Object.keys(BLOCKS).join(', ')}`,
        );
      }
      if (block.forms === 'reserved') failHere(block.reservedMessage);

      let caption = null;
      if (node.type === 'containerDirective') {
        if (block.forms === 'leaf') {
          // Blocks not yet flipped to 'both' keep failing loudly rather
          // than silently discarding their body (flips land in T204/T205).
          failHere(
            `the :::${node.name} container form is not supported — use ::${node.name}{...} on its own line`,
          );
        }
        rejectLabel(node, failHere);
        rejectNestedBlocks(node, failHere);
        if (block.body === 'caption') caption = captionNode(node.children);
      } else if (node.children.length > 0) {
        // A leaf directive's children are its [label] — silently
        // discarding it would eat authored text (the caption mistake
        // this vocabulary makes likely).
        failHere(
          `unexpected [label] on ::${node.name} — captions go in the body of the :::${node.name} container form`,
        );
      }

      const attrs = node.attributes ?? {};
      validateAttributes(block, node.name, attrs, failHere);
      block.validate?.(attrs, failHere);

      const images = block.images(attrs, failHere);
      for (const image of images) checkSrcExists(file, node, image.src);

      // match="height": probe each image's dimensions (orientation-aware —
      // Astro swaps width/height for EXIF orientations 5–8, so a camera
      // portrait stored as rotated landscape gets the correct ratio).
      // Emitted --ar values are normalized so the smallest is 1: flex-grow
      // factors summing below 1 would under-fill the row.
      let ratios = null;
      let normalized = null;
      if (block.needsRatios?.(attrs)) {
        ratios = await probeRatios(images, file, failHere);
        const min = Math.min(...ratios);
        normalized = ratios.map((r) => r / min);
      }

      node.children = [
        ...images.map(({ src, alt }, imageIndex) => ({
          type: 'image',
          url: src,
          alt,
          data: {
            hProperties: {
              ...block.sizing(attrs, imageIndex, ratios),
              ...(normalized ? { style: `--ar: ${trimNumber(normalized[imageIndex])}` } : {}),
            },
          },
        })),
        ...(caption ? [caption] : []),
      ];
      node.data = {
        ...node.data,
        hName: 'figure',
        hProperties: {
          className: ['piece-block', `piece-${node.name}`, ...(block.classes?.(attrs) ?? [])],
        },
      };
    }
  };
}

async function probeRatios(images, file, fail) {
  if (typeof file.path !== 'string') {
    fail('match="height" needs piece-relative image files to measure');
  }
  return Promise.all(
    images.map(async ({ src }) => {
      const path = resolve(dirname(file.path), src);
      let meta;
      try {
        meta = await imageMetadata(await readFile(path), src);
      } catch {
        fail(`could not read image dimensions for ${src} (match="height" needs them)`);
      }
      return meta.width / meta.height;
    }),
  );
}

function trimNumber(n) {
  return Number(n.toFixed(4)).toString();
}

function rejectLabel(node, fail) {
  // mdast-util-directive flags a container's [label] line as a paragraph
  // with data.directiveLabel.
  if (node.children[0]?.data?.directiveLabel) {
    fail(`unexpected [label] on :::${node.name} — captions go in the body, not the [label]`);
  }
}

function rejectNestedBlocks(node, fail) {
  // The outer visit never traverses replacement children, so nesting is
  // checked explicitly: block directives inside a body are not supported.
  visit(node, ['leafDirective', 'containerDirective'], (inner) => {
    if (inner !== node) {
      fail(`a block directive (::${inner.name}) cannot be nested inside :::${node.name}`);
    }
  });
}

function captionNode(children) {
  if (children.length === 0) return null;
  // A one-paragraph caption unwraps to inline content (<figcaption>text)
  // rather than <figcaption><p>text</p>; longer captions keep paragraphs.
  const content =
    children.length === 1 && children[0].type === 'paragraph' ? children[0].children : children;
  return {
    type: 'pieceCaption',
    children: content,
    data: { hName: 'figcaption' },
  };
}

function validateAttributes(block, name, attrs, fail) {
  // remark-directive parses {#x} into `id` and {.y} into `class`.
  if ('id' in attrs || 'class' in attrs) {
    fail(
      `the {#id .class} shorthand is not supported on ${name} — per-block style variants are outside the closed vocabulary`,
    );
  }
  const allowed = new Set([...block.attrs.required, ...block.attrs.optional]);
  for (const key of Object.keys(attrs)) {
    if (!allowed.has(key)) {
      fail(`unknown attribute "${key}" on ${name} — allowed: ${[...allowed].join(', ')}`);
    }
  }
  for (const [key, values] of Object.entries(block.attrs.enums)) {
    if (attrs[key] !== undefined && !values.includes(attrs[key])) {
      fail(`invalid value "${attrs[key]}" for ${key} on ${name} — allowed: ${values.join(' | ')}`);
    }
  }
}

function serializeAttributes(attributes) {
  const entries = Object.entries(attributes ?? {});
  if (entries.length === 0) return '';
  return `{${entries.map(([k, v]) => (v === '' ? k : `${k}="${v}"`)).join(' ')}}`;
}

function fail(file, node, message) {
  // `file.fail` throws a VFileMessage carrying the file path and the
  // directive's line/column, which Astro surfaces in the build error.
  file.fail(message, node);
}

function checkSrcExists(file, node, src) {
  // A missing local image otherwise surfaces as an opaque Vite import
  // error with no piece name or line. Remote URLs and root-absolute
  // paths are out of scope here — Astro's collector handles those.
  if (typeof file.path !== 'string') return;
  if (URL.canParse(src) || src.startsWith('/')) return;
  if (!existsSync(resolve(dirname(file.path), src))) {
    fail(file, node, `image not found: ${src} (relative to the piece's folder)`);
  }
}
