import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { visit } from 'unist-util-visit';

// Turns the closed set of piece image-treatment directives (parsed by
// `remark-directive`) into figure-wrapped images. The vocabulary is closed
// by design — see CLAUDE.md — so an unrecognized `::name` / `:::name` fails
// the build with the offending file and line rather than silently rendering
// as nothing. Single-colon text directives (`:word` mid-prose) are
// restored to the literal text the author typed: none of the vocabulary
// uses them, failing on them would make ordinary prose a build hazard, and
// leaving them *unhandled* is not safe either — an unhandled directive
// node renders as an empty <div> that splits the paragraph.
//
// Each directive's images are emitted as real mdast `image` nodes (the
// node's children), NOT prebuilt hast <img> elements. Astro's own
// `remarkCollectImages` runs after user plugins and only collects mdast
// image nodes; anything it collects is later resolved through the
// `astro:assets` pipeline — hashed src, intrinsic dimensions, srcset,
// lazy loading — identically to a plain `![alt](./photo.jpg)`. Prebuilt
// hast children would skip optimization entirely.
//
// The `layout`/`sizes` entries below ride each image node's hProperties
// into that same pipeline as per-image getImage() options, giving each
// treatment responsive variants matched to how wide it actually renders.
// diptych/triptych sizes are conservative upper bounds for halves/thirds
// of the reading column — never blurry, occasionally over-delivering;
// tighten them if those treatments ever get a bespoke design pass.

const BLOCKS = {
  fullbleed: {
    sizing: { layout: 'full-width', sizes: '100vw' },
    images(node, file) {
      const { src, alt } = node.attributes ?? {};
      if (!src) fail(file, node, 'fullbleed requires a src attribute');
      if (alt === undefined)
        fail(
          file,
          node,
          'fullbleed requires an alt attribute (use alt="" only for a truly decorative image)',
        );
      return [{ src, alt }];
    },
  },

  diptych: {
    sizing: { layout: 'constrained', sizes: '50vw' },
    images(node, file) {
      const { left, right, leftAlt, rightAlt } = node.attributes ?? {};
      if (!left || !right)
        fail(file, node, 'diptych requires left and right attributes');
      if (leftAlt === undefined || rightAlt === undefined)
        fail(
          file,
          node,
          'diptych requires leftAlt and rightAlt attributes (empty allowed for truly decorative images)',
        );
      return [
        { src: left, alt: leftAlt },
        { src: right, alt: rightAlt },
      ];
    },
  },

  triptych: {
    sizing: { layout: 'constrained', sizes: '33vw' },
    images(node, file) {
      const { left, center, right, leftAlt, centerAlt, rightAlt } =
        node.attributes ?? {};
      if (!left || !center || !right)
        fail(file, node, 'triptych requires left, center, and right attributes');
      if (
        leftAlt === undefined ||
        centerAlt === undefined ||
        rightAlt === undefined
      )
        fail(
          file,
          node,
          'triptych requires leftAlt, centerAlt, and rightAlt attributes (empty allowed for truly decorative images)',
        );
      return [
        { src: left, alt: leftAlt },
        { src: center, alt: centerAlt },
        { src: right, alt: rightAlt },
      ];
    },
  },

  sequence: {
    // Reserved in the content model; presentation undecided (ROADMAP.md).
    images(node, file) {
      fail(
        file,
        node,
        'the sequence block is reserved but not implemented yet — see ROADMAP.md',
      );
    },
  },
};

export function remarkPiecesBlocks() {
  return (tree, file) => {
    // Restore text directives to the prose the author typed. `:hover` and
    // `:word[label]` come back verbatim (label content as ordinary inline
    // children between the brackets). Attributes (`{...}`) don't survive —
    // no plausible prose contains them, and the block vocabulary never
    // uses text directives at all.
    visit(tree, 'textDirective', (node, index, parent) => {
      const restored =
        node.children.length > 0
          ? [
              { type: 'text', value: `:${node.name}[` },
              ...node.children,
              { type: 'text', value: ']' },
            ]
          : [{ type: 'text', value: `:${node.name}` }];
      parent.children.splice(index, 1, ...restored);
      return index + restored.length;
    });

    visit(tree, ['leafDirective', 'containerDirective'], (node) => {
      const block = BLOCKS[node.name];
      if (!block) {
        fail(
          file,
          node,
          `unknown block directive "${node.name}" — the block vocabulary is closed; ` +
            `known blocks: ${Object.keys(BLOCKS).join(', ')}`,
        );
      }
      if (node.type === 'containerDirective') {
        // The container body has no defined meaning for image blocks yet
        // (a figcaption is a plausible future); failing beats silently
        // discarding whatever the author wrote inside.
        fail(
          file,
          node,
          `the :::${node.name} container form is not supported — use ::${node.name}{...} on its own line`,
        );
      }
      const images = block.images(node, file);
      for (const image of images) checkSrcExists(file, node, image.src);
      node.children = images.map(({ src, alt }) => ({
        type: 'image',
        url: src,
        alt,
        data: { hProperties: { ...block.sizing } },
      }));
      node.data = {
        ...node.data,
        hName: 'figure',
        hProperties: { className: ['piece-block', `piece-${node.name}`] },
      };
    });
  };
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
