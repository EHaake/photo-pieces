import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename as folderOf, dirname, resolve } from 'node:path';
import { imageMetadata } from 'astro/assets/utils';
import { visit } from 'unist-util-visit';
import {
  IMAGE_EXTENSIONS,
  ImageIdError,
  imageIdFor,
  imageUrlFor,
  isPrivateRaster,
  parseReference,
  privateMessage,
  privateTargetOf,
} from './src/lib/image-meta.mjs';

// Turns the closed set of piece image-treatment directives (parsed by
// `remark-directive`) into figure-wrapped images. The vocabulary is closed
// by design — see CLAUDE.md — so an unrecognized `::name` / `:::name`, an
// unknown attribute, or the `{#id .class}` shorthand (the syntactic door
// to per-block style variants, banned by spec 003) fails the build with
// the offending file and line rather than silently rendering as nothing.
//
// Each block is a descriptor (spec 003's block-descriptor model):
//
//   forms:   'container' | 'both'
//   body:    'caption' | 'prose' | 'images+caption'
//   attrs:   { required: [...], optional: [...], enums: { name: [...] },
//              flags: [...] }  — a flag is valid only bare: {bleed}
//   images:  (attrs, fail) => [{ src, alt }]  — validates and extracts
//   classes: (attrs, ratios) => [...]  — ratios present when needsRatios
//   sizing:  (attrs, imageIndex, ratios) => ({ layout, sizes })
//            — ratios come from the probe; an entry the probe could not
//            read is null, which only a needsRatios block is spared (below)
//   needsRatios: (attrs) => boolean — the block's layout cannot be drawn
//            without the measurements (classes/sizing read ratios), so
//            a frame the probe cannot read fails the build
//            there. The probe itself runs for EVERY block (spec 013):
//            each frame carries its raw ratio in --ar, because the mat's
//            width is a share of the frame's short side.
//   emitsAr: (attrs) => boolean — the anchors' --ar is normalized so the
//            smallest is 1 (match="height"'s flex-grow factors) and the
//            container carries --ar-sum and --n; everything else gets the
//            raw ratio. rawAr puts the raw ratio on the wrapper too.
//   probeAsker: what the probe's failure names (default: the block)
//   rejectBodyImages: the body is prose only — set to the message an
//            image in it fails with
//   proseClass: the split structure's prose cell class
//
// Which blocks are matted is a CSS decision (global.css's matte section),
// not descriptor data — one source of truth.
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
// Spec 004: every image links to its page (`/images/<folder>/<basename>/`,
// derived by the same rule the image registry uses, from
// src/lib/image-meta.mjs). The mdast `link` wrapping an image carries
// class `image-link` and the frame's `--ar` — the anchor is the layout
// item now, and the mat sits on it (global.css).
// Exceptions: alt="" (decorative; a link with no accessible name fails
// WCAG 2.4.4), remote and root-absolute srcs (no page exists), formats
// outside the registry (gif, svg), and images an author already linked.
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

// The held image's orientation boundary, decided once for the class and
// the `sizes` hint: a square counts as landscape (width-starved beside
// a column on a portrait screen the same way).
const isLandscape = (ratio) => ratio >= 1;

export const BLOCKS = {
  single: {
    // The directive form of the column-width image — exists so a single
    // can carry a caption; plain ![alt](./img.jpg) stays the captionless
    // shorthand. 680px is coupled to --prose-width (68ch) — see the
    // coupling comment in global.css.
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
    sizing: (attrs) => ({
      layout: 'constrained',
      // half-bleed renders at 50vw + half the column; plain wide caps at
      // the content width.
      sizes: attrs.bleed
        ? `${COLLAPSE} calc(50vw + 340px), 96vw`
        : '(min-width: 1240px) 1160px, 96vw',
    }),
  },

  tall: {
    // The vertical counterpart to fullbleed: capped at viewport height,
    // width follows — but never wider than the column (no breakout), so
    // the column width is a correct upper bound for sizes.
    forms: 'both',
    body: 'caption',
    attrs: { required: ['src', 'alt'], optional: [], enums: {} },
    images(attrs, fail) {
      if (!attrs.src) fail('tall requires a src attribute');
      if (attrs.alt === undefined)
        fail('tall requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    sizing: () => ({ layout: 'constrained', sizes: `${COLLAPSE} 680px, 94vw` }),
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
      optional: ['match', 'weight', 'width'],
      enums: {
        match: ['height'],
        weight: ['left', 'right'],
        width: ['wide', 'fullbleed'],
      },
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
      ...(attrs.width ? [`width-${attrs.width}`] : []),
    ],
    needsRatios: (attrs) => Boolean(attrs.match),
    emitsAr: (attrs) => Boolean(attrs.match),
    probeAsker: 'match="height"',
    sizing: (attrs, i, ratios) =>
      pairSizing(attrs, i, ratios, { shares: 2, dominant: 453, companion: 227 }),
  },

  triptych: {
    forms: 'both',
    body: 'caption',
    attrs: {
      required: ['left', 'center', 'right', 'leftAlt', 'centerAlt', 'rightAlt'],
      optional: ['match', 'width'],
      enums: { match: ['height'], width: ['wide', 'fullbleed'] },
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
    classes: (attrs) => [
      ...(attrs.match ? ['match-height'] : []),
      ...(attrs.width ? [`width-${attrs.width}`] : []),
    ],
    needsRatios: (attrs) => Boolean(attrs.match),
    emitsAr: (attrs) => Boolean(attrs.match),
    probeAsker: 'match="height"',
    sizing: (attrs, i, ratios) => pairSizing(attrs, i, ratios, { shares: 3 }),
  },

  grid: {
    // Uniform multi-image cluster. Images live in the body as plain
    // markdown images (the syntax authors already know); any trailing
    // non-image paragraphs are the caption.
    forms: 'container',
    body: 'images+caption',
    count: { min: 2, max: 6 },
    attrs: { required: [], optional: [], enums: {} },
    sizing: () => ({ layout: 'constrained', sizes: `${COLLAPSE} 340px, 94vw` }),
  },

  strip: {
    // Fixed-height, horizontally scrollable band: one panorama or several
    // uniform-height frames. Native scroll only. Per-image sizes derive
    // from the probed ratio at the band's max height (420px — the
    // --strip-h clamp ceiling), erring toward over-delivery.
    forms: 'container',
    body: 'images+caption',
    count: { min: 1, max: 8 },
    structure: 'scroll',
    attrs: { required: [], optional: [], enums: {} },
    needsRatios: () => true,
    sizing: (_attrs, i, ratios) => ({
      layout: 'constrained',
      sizes: `${Math.round(420 * (ratios?.[i] ?? 1.5))}px`,
    }),
  },

  aside: {
    // Image floated to one side with the body prose wrapping around it.
    // The container UNWRAPS: figure + prose splice into the parent so the
    // paragraphs stay ordinary column prose.
    forms: 'container',
    body: 'prose',
    structure: 'unwrap',
    attrs: {
      required: ['src', 'alt', 'side'],
      optional: [],
      enums: { side: ['left', 'right'] },
    },
    validate(attrs, fail) {
      if (!attrs.side) fail('aside requires side="left" or side="right"');
    },
    images(attrs, fail) {
      if (!attrs.src) fail('aside requires a src attribute');
      if (attrs.alt === undefined)
        fail('aside requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    classes: (attrs) => [`side-${attrs.side}`],
    sizing: () => ({ layout: 'constrained', sizes: `${COLLAPSE} 300px, 94vw` }),
  },

  row: {
    // Image and prose as two side-by-side columns, no wrap.
    forms: 'container',
    body: 'prose',
    structure: 'split',
    attrs: {
      required: ['src', 'alt', 'side'],
      optional: [],
      enums: { side: ['left', 'right'] },
    },
    validate(attrs, fail) {
      if (!attrs.side) fail('row requires side="left" or side="right"');
    },
    images(attrs, fail) {
      if (!attrs.src) fail('row requires a src attribute');
      if (attrs.alt === undefined)
        fail('row requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    classes: (attrs) => [`side-${attrs.side}`],
    sizing: () => ({ layout: 'constrained', sizes: `${COLLAPSE} 340px, 94vw` }),
  },

  held: {
    // Spec 007: the frame stays fixed while the body's prose passes
    // beside it (never over or under it) and lets go when the words are
    // spent — pure CSS (sticky), sized from the real ratio, so the
    // wrapper carries --ar and an orientation class: a landscape frame
    // has no column beside it on a portrait screen and collapses to a
    // static figure (a square counts as landscape — it is width-starved
    // the same way). The body is prose only.
    forms: 'container',
    body: 'prose',
    structure: 'split',
    proseClass: 'piece-held-prose',
    rejectBodyImages: "a held image's body is prose — no images beside the frame",
    attrs: {
      required: ['src', 'alt'],
      optional: ['side', 'bleed'],
      enums: { side: ['left', 'right'] },
      flags: ['bleed'],
    },
    images(attrs, fail) {
      if (!attrs.src) fail('held requires a src attribute');
      if (attrs.alt === undefined)
        fail('held requires an alt attribute (use alt="" only for a truly decorative image)');
      return [{ src: attrs.src, alt: attrs.alt }];
    },
    classes: (attrs, ratios) => [
      `side-${attrs.side ?? 'left'}`,
      ...(attrs.bleed !== undefined ? ['bleed'] : []),
      isLandscape(ratios[0]) ? 'frame-landscape' : 'frame-portrait',
    ],
    needsRatios: () => true,
    emitsAr: () => true,
    rawAr: true,
    // Hints for the srcset choice only — the layout sizes the frame from
    // --ar and the hold's height, never from these (global.css). The
    // numbers assume the grid global.css draws: the frame's column 58%
    // of the 1160px content width (measured 643px at 1440×900 — the
    // hint over-delivers by the gap); bled, half the viewport. Where no
    // column fits, a landscape frame collapses to the full content
    // width on a portrait viewport (global.css's collapse) — so its
    // hint says so first, or it would fall 40% under there (T504
    // review). Kept in step by hand, like COLLAPSE.
    sizing: (attrs, i, ratios) => {
      const collapsed = isLandscape(ratios[i])
        ? `(orientation: portrait) and ${COLLAPSE} 96vw, `
        : '';
      return {
        layout: 'constrained',
        sizes:
          collapsed +
          (attrs.bleed !== undefined
            ? `${COLLAPSE} 50vw, 94vw`
            : `(min-width: 1240px) 670px, ${COLLAPSE} 58vw, 94vw`),
      };
    },
  },
};

// Sizing for the pair blocks across their width variants (added at the
// sampler review): base rendered width is the prose column (680px), the
// content width (1160px) for width="wide", or the viewport for
// width="fullbleed" (vw units). Mobile branches match the collapsed
// stacked layout.
function pairSizing(attrs, i, ratios, { shares, dominant, companion }) {
  const width = attrs.width;
  const mobile = width === 'fullbleed' ? '100vw' : width === 'wide' ? '96vw' : '94vw';
  const basePx = width === 'wide' ? 1160 : 680;
  if (attrs.weight && dominant) {
    const isDominant = i === (attrs.weight === 'left' ? 0 : 1);
    if (width === 'fullbleed') {
      return { layout: 'constrained', sizes: `${COLLAPSE} ${isDominant ? 67 : 33}vw, ${mobile}` };
    }
    const scale = basePx / 680;
    const px = Math.round((isDominant ? dominant : companion) * scale);
    return { layout: 'constrained', sizes: `${COLLAPSE} ${px}px, ${mobile}` };
  }
  if (attrs.match && ratios) {
    const sum = ratios.reduce((a, b) => a + b, 0);
    if (width === 'fullbleed') {
      const vw = Math.round((100 * ratios[i]) / sum);
      return { layout: 'constrained', sizes: `${COLLAPSE} ${vw}vw, ${mobile}` };
    }
    const px = Math.round((basePx * ratios[i]) / sum);
    return { layout: 'constrained', sizes: `${COLLAPSE} ${px}px, ${mobile}` };
  }
  if (width === 'fullbleed') {
    const vw = Math.round(100 / shares);
    return { layout: 'constrained', sizes: `${COLLAPSE} ${vw}vw, ${mobile}` };
  }
  const px = { 2: { 680: 340, 1160: 560 }, 3: { 680: 227, 1160: 373 } }[shares][basePx];
  return { layout: 'constrained', sizes: `${COLLAPSE} ${px}px, ${mobile}` };
}

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
      // Continue AT index, not past the insertion: the restored label
      // children may hold further text directives. No loop risk — the
      // node now at index is a text node.
      return index;
    });

    const directives = [];
    visit(tree, ['leafDirective', 'containerDirective'], (node, _index, parent) => {
      directives.push({ node, parent });
    });

    for (const { node, parent } of directives) {
      const failHere = (message) => fail(file, node, message);
      const block = BLOCKS[node.name];
      if (!block) {
        failHere(
          `unknown block directive "${node.name}" — the block vocabulary is closed; ` +
            `known blocks: ${Object.keys(BLOCKS).join(', ')}`,
        );
      }

      let caption = null;
      let bodyProse = null;
      let bodyImages = null;
      if (node.type === 'containerDirective') {
        rejectLabel(node, failHere);
        rejectNestedBlocks(node, failHere);
        if (block.body === 'caption') caption = captionNode(node.children);
        if (block.body === 'prose') {
          if (block.rejectBodyImages) rejectBodyImages(node, block.rejectBodyImages, failHere);
          bodyProse = node.children;
        }
        if (block.body === 'images+caption') {
          const partitioned = partitionBody(node.children, node.name, failHere);
          bodyImages = partitioned.images;
          caption = captionNode(partitioned.caption);
        }
      } else {
        if (block.forms === 'container') {
          failHere(
            `::${node.name} is written as a container — :::${node.name}{...} … ::: with its content in the body`,
          );
        }
        if (node.children.length > 0) {
          // A leaf directive's children are its [label] — silently
          // discarding it would eat authored text (the caption mistake
          // this vocabulary makes likely).
          failHere(
            `unexpected [label] on ::${node.name} — captions go in the body of the :::${node.name} container form`,
          );
        }
      }

      const attrs = node.attributes ?? {};
      validateAttributes(block, node.name, attrs, failHere);
      block.validate?.(attrs, failHere);

      let images;
      if (block.body === 'images+caption') {
        const { min, max } = block.count;
        if (bodyImages.length < min || bodyImages.length > max) {
          failHere(
            `${node.name} takes ${min}–${max} images (one markdown image per line in the body); got ${bodyImages.length}`,
          );
        }
        images = bodyImages;
      } else {
        images = block.images(attrs, failHere);
      }
      for (const image of images) {
        checkReferenceShape(file, image.src, failHere);
        rejectPrivateSrc(image.src, failHere);
        checkSrcExists(file, node, image.src);
      }
      // Spec 004: every image links to its page — the URL derives from
      // the piece folder + basename, the same rule the registry uses.
      const pageUrls = images.map((image) => imagePageUrl(file, image.src, failHere));

      // Every block probes each image's dimensions (orientation-aware —
      // Astro swaps width/height for EXIF orientations 5–8, so a camera
      // portrait stored as rotated landscape gets the correct ratio):
      // spec 013 sizes the mat from the frame's short side, so every
      // frame carries its raw ratio. A frame the probe cannot read — a
      // remote or root-absolute src, or a render with no file.path —
      // measures null and carries no --ar (the CSS falls back to 1);
      // where the block's own layout needs the numbers (needsRatios:
      // match="height", strip, held) that is still a failure.
      const needsRatios = Boolean(block.needsRatios?.(attrs));
      const dims = await probeDimensions(
        images,
        file,
        block.probeAsker ?? node.name,
        failHere,
        needsRatios,
      );
      const ratios = dims.map((dim) => (dim ? dim.width / dim.height : null));
      // match="height" emits normalized --ar on the anchors — flex-grow
      // factors summing below 1 would under-fill the row — and the raw
      // ratios' sum and count on the container, which is where the row's
      // height (and so the mat's width) is worked out. Every other block
      // emits the raw ratio: a single frame normalized would always be 1.
      const normalized =
        !block.rawAr && block.emitsAr?.(attrs) ? ratios.map((r) => r / Math.min(...ratios)) : null;
      // The raw ratio also rides on the wrapper: custom properties
      // inherit downward and the frame's width formula reads it there.
      // The first image's — a rawAr block holds one frame (spec 007).
      const wrapperStyle = block.rawAr
        ? ratios[0] === null
          ? {}
          : { style: `--ar: ${trimNumber(ratios[0])}` }
        : normalized
          ? {
              style: `--ar-sum: ${trimNumber(ratios.reduce((a, b) => a + b, 0))}; --n: ${images.length}`,
            }
          : {};

      const imageNodes = images.map(({ src, alt }, imageIndex) => {
        const ar = (normalized ?? ratios)[imageIndex];
        const arStyle = ar === null ? {} : { style: `--ar: ${trimNumber(ar)}` };
        const image = {
          type: 'image',
          url: src,
          alt,
          // Marked as a block's own frame: the shorthand pass below
          // measures every OTHER image the piece wrote, and a decorative
          // one is a bare img there as it is here — without the mark it
          // would overwrite this block's --ar (normalized, for a matched
          // pair) with the raw ratio.
          data: {
            pieceFrame: true,
            hProperties: { ...block.sizing(attrs, imageIndex, ratios) },
          },
        };
        // The anchor becomes the layout item, so --ar rides on it (the
        // CSS flexes the figure's direct child). An image with alt=""
        // is decorative: no link (a link with no accessible name fails
        // WCAG 2.4.4), so it stays the item itself and keeps --ar.
        const url = alt === '' ? null : pageUrls[imageIndex];
        if (!url) {
          image.data.hProperties = { ...image.data.hProperties, ...arStyle };
          return image;
        }
        return wrapInLink(image, url, arStyle);
      });
      const className = [
        'piece-block',
        `piece-${node.name}`,
        ...(block.classes?.(attrs, ratios) ?? []),
      ];

      if (block.structure === 'unwrap') {
        // aside: the figure floats; the body prose must be SIBLINGS in the
        // column for text to wrap around it — so the container unwraps.
        const figure = wrapNode('figure', className, imageNodes);
        const index = parent.children.indexOf(node);
        parent.children.splice(index, 1, figure, ...bodyProse);
        continue;
      }

      if (block.structure === 'split') {
        // row, held: figure and prose as the two cells of the wrapper.
        node.children = [
          wrapNode('figure', [], imageNodes),
          wrapNode('div', [block.proseClass ?? 'piece-row-prose'], bodyProse),
        ];
        node.data = {
          ...node.data,
          hName: 'div',
          hProperties: { className, ...wrapperStyle },
        };
        continue;
      }

      if (block.structure === 'scroll') {
        // strip: images live in a scrolling band inside the figure.
        node.children = [
          // tabIndex: WebKit doesn't make scrollers focusable on its own;
          // without it a keyboard user can't reach the off-screen part of
          // a panorama (WCAG 2.1.1). The site's :focus-visible rule styles
          // the ring.
          wrapNode('div', ['piece-strip-scroll'], imageNodes, { tabIndex: 0 }),
          ...(caption ? [caption] : []),
        ];
        node.data = { ...node.data, hName: 'figure', hProperties: { className } };
        continue;
      }

      node.children = [...imageNodes, ...(caption ? [caption] : [])];
      node.data = {
        ...node.data,
        hName: 'figure',
        hProperties: { className, ...wrapperStyle },
      };
    }

    // Shorthand images (`![alt](./x.jpg)` in prose) link to their pages
    // too — the same rule, the same exceptions (alt="", remote or
    // root-absolute src, an author's own surrounding link).
    // Collected first, then measured: the visit is synchronous and the
    // probe is not, and the frame carries its --ar like every other frame
    // (spec 013). A decorative image gets no link (a link with no
    // accessible name fails WCAG 2.4.4), but it is measured too and
    // wears --ar itself — the block path's alt="" case, which puts
    // arStyle on the image node.
    const shorthand = [];
    visit(tree, 'image', (node, index, parent) => {
      if (!parent || parent.type === 'link' || node.data?.pieceFrame) return;
      const failHere = (message) => fail(file, node, message);
      checkReferenceShape(file, node.url, failHere);
      rejectPrivateSrc(node.url, failHere);
      const decorative = node.alt === '';
      const url = decorative ? null : imagePageUrl(file, node.url, failHere);
      if (!url && !decorative) return;
      shorthand.push({ node, index, parent, url });
      return index + 1;
    });
    await Promise.all(
      shorthand.map(async ({ node, index, parent, url }) => {
        const [dim] = await probeDimensions(
          [{ src: node.url }],
          file,
          'the image',
          (message) => fail(file, node, message),
          false,
        );
        const arStyle = dim ? { style: `--ar: ${trimNumber(dim.width / dim.height)}` } : {};
        if (url) {
          parent.children.splice(index, 1, wrapInLink(node, url, arStyle));
        } else if (dim) {
          // Decorative and measurable: the image itself is the frame.
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, ...arStyle } };
        }
      }),
    );
  };
}

function wrapInLink(imageNode, url, extraProps = {}) {
  return {
    type: 'link',
    url,
    children: [imageNode],
    data: { hProperties: { className: ['image-link'], ...extraProps } },
  };
}

// An image lives in one folder — its own piece's, or the gallery root —
// and that is what gives it an id and a page. A piece may place its own
// images (`./<file>`) or borrow one from that other home (spec 008):
// `../<slug>/<file>`, `../../gallery-images/<file>`. `parseReference` is
// the single definition of those shapes; the transform adds the two
// rules only it can check.
function checkReferenceShape(file, src, fail) {
  const shape = parseReference(src);
  // Remote and root-absolute srcs are Astro's business, as before; a
  // local src is the rule as it always was.
  if (shape.kind === 'external' || shape.kind === 'local') return;
  if (shape.kind === 'invalid') {
    fail(shape.message);
    return;
  }
  // The long way round to the piece's own folder would build to the same
  // id and the same place in the frames list, but the alt and passage
  // lookups read local references only, so the frame would lose the alt
  // the piece wrote (its page's title falling back to the humanized
  // filename, absent a sidecar) and its passage.
  // (A piece kind only: a gallery reference's folder is the id's
  // `gallery` sentinel, not a path segment.)
  if (
    shape.kind === 'piece' &&
    typeof file.path === 'string' &&
    shape.folder === folderOf(dirname(file.path))
  ) {
    fail(`image src "${src}" is the piece's own folder — write ./${shape.file}`);
    return;
  }
  // A borrowed non-raster would mint the id of the accepted raster
  // beside it (`../beta/land-a.tif` → `beta/land-a`) and seat a frame
  // linking to another file's page. A local non-raster (an svg diagram)
  // stays allowed and unlinked.
  if (!IMAGE_EXTENSIONS.includes(shape.ext)) {
    fail(
      `borrowed image "${src}" is not a photograph this site pages — a piece may borrow only an accepted raster (${IMAGE_EXTENSIONS.join(', ')})`,
    );
  }
}

// Spec 006: a `_`-prefixed raster is private — the camera's frame of the
// image with the same basename, shown only on that image's page. A piece
// must not place it (it has no page to link to, and it isn't a
// photograph the site presents), whatever the alt — so this runs before
// the alt="" exemption, not inside imagePageUrl.
function rejectPrivateSrc(src, fail) {
  // The basename comes from the parser (spec 008): a borrowed
  // `../beta/_land-b.jpg` must be caught too, and stripping a leading
  // `./` was only ever enough while every `/` was refused. A src with no
  // basename is remote, root-absolute, or a shape checkReferenceShape
  // has already failed.
  const { basename: name, ext } = parseReference(src);
  if (!name) return;
  if (IMAGE_EXTENSIONS.includes(ext) && isPrivateRaster(name)) {
    fail(
      privateMessage(
        src,
        name,
        `place "${privateTargetOf(name)}.${ext}" here and the frame shows on its page`,
      ),
    );
  }
}

// The page URL for a local image, or null when it gets no page: remote
// and root-absolute srcs are left to Astro as before; a non-photograph
// format (gif, svg) isn't in the registry. Note `withBase` can't apply
// inside a remark plugin; BASE_URL is `/` and imageUrlFor is the one
// definition of the shape.
function imagePageUrl(file, src, fail) {
  if (typeof file.path !== 'string') return null;
  if (URL.canParse(src) || src.startsWith('/')) return null;
  const ext = src.slice(src.lastIndexOf('.') + 1).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return null;
  const folder = dirname(file.path);
  if (folder.endsWith('/src/content/pieces')) {
    // A flat pieces/foo.md: its images sit in the pieces root, where the
    // registry refuses them — linking would point at a page nobody makes.
    fail(
      `"${src}" sits directly in src/content/pieces/ — a piece lives in its own folder (pieces/<slug>/index.md) so its images can have pages`,
    );
  }
  try {
    return imageUrlFor(imageIdFor(resolve(folder, src)));
  } catch (error) {
    if (error instanceof ImageIdError) fail(error.message);
    throw error;
  }
}

function wrapNode(hName, className, children, extraProps = {}) {
  const hProperties = {
    ...(className.length > 0 ? { className } : {}),
    ...extraProps,
  };
  return {
    type: 'pieceWrap',
    children,
    data: {
      hName,
      ...(Object.keys(hProperties).length > 0 ? { hProperties } : {}),
    },
  };
}

function partitionBody(children, name, fail) {
  // Inline-level partition (spec 003 plan B1): consecutive image lines
  // parse as ONE paragraph with "\n" text nodes between the images, so
  // the rule works per inline node — image nodes and whitespace-only text
  // contribute images; the first paragraph containing anything else ends
  // the image run and starts the caption. Mixing images and text in one
  // paragraph fails: the caption needs a blank line before it.
  const images = [];
  let i = 0;
  for (; i < children.length; i++) {
    const para = children[i];
    if (para.type !== 'paragraph') break;
    const imageChildren = para.children.filter((c) => c.type === 'image');
    if (imageChildren.length === 0) break;
    const stray = para.children.find(
      (c) =>
        c.type !== 'image' && c.type !== 'break' && !(c.type === 'text' && c.value.trim() === ''),
    );
    if (stray) {
      fail(
        `a paragraph in :::${name} mixes images and text — separate the caption from the images with a blank line`,
      );
    }
    images.push(...imageChildren.map((img) => ({ src: img.url, alt: img.alt ?? '' })));
  }
  return { images, caption: children.slice(i) };
}

// Each image's rendered { width, height } — orientation-corrected, so a
// camera portrait stored rotated measures portrait. `asker` names what
// needed the measurement in the failure (the block, or match="height").
// `required` is the block's own layout asking (needsRatios): without it
// a frame the probe cannot resolve at all — a remote or root-absolute
// src, or a render with no file.path — measures null instead of failing,
// and simply carries no --ar. A local file that cannot be READ fails
// either way: it is a broken photograph, not an absent measurement.
async function probeDimensions(images, file, asker, fail, required = true) {
  if (typeof file.path !== 'string') {
    if (required) fail(`${asker} needs piece-relative image files to measure`);
    return images.map(() => null);
  }
  return Promise.all(
    images.map(async ({ src }) => {
      if (!required && parseReference(src).kind === 'external') return null;
      const path = resolve(dirname(file.path), src);
      let meta;
      try {
        meta = await imageMetadata(await readFile(path), src);
      } catch {
        fail(`could not read image dimensions for ${src} (${asker} needs them)`);
      }
      return { width: meta.width, height: meta.height };
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

function rejectBodyImages(node, message, fail) {
  visit(node, 'image', () => {
    fail(`${message} (:::${node.name})`);
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
  // remark-directive parses a bare {flag} as flag: "" — a flag with a
  // value is a mistake (bleed="left" on held reads as wide's enum).
  for (const key of block.attrs.flags ?? []) {
    if (attrs[key] !== undefined && attrs[key] !== '') {
      fail(`${key} is a flag on ${name}: write {${key}}, not ${key}="${attrs[key]}"`);
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
