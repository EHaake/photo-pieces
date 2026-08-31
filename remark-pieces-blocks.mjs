import { visit } from 'unist-util-visit';

// Turns the closed set of piece image-treatment directives (parsed by
// `remark-directive`) into HTML. The vocabulary is closed by design — see
// CLAUDE.md — so an unrecognized `::name` / `:::name` fails the build with
// the offending file and line rather than silently rendering as nothing.
// Single-colon text directives are left alone: none of the vocabulary uses
// them, and failing on them would make ordinary prose containing `:word`
// patterns a build hazard.
//
// Images render as plain `<img>` for now. Routing them through
// `astro:assets` optimization is the next step (plan.md, task T004), not
// part of proving the directive pipeline itself works.

const BLOCKS = {
  fullbleed(node, file) {
    const { src, alt } = node.attributes ?? {};
    if (!src) fail(file, node, 'fullbleed requires a src attribute');
    if (alt === undefined)
      fail(
        file,
        node,
        'fullbleed requires an alt attribute (use alt="" only for a truly decorative image)',
      );
    return figure(node, 'piece-fullbleed', [img(src, alt)]);
  },

  diptych(node, file) {
    const { left, right, leftAlt, rightAlt } = node.attributes ?? {};
    if (!left || !right)
      fail(file, node, 'diptych requires left and right attributes');
    return figure(node, 'piece-diptych', [
      img(left, leftAlt ?? ''),
      img(right, rightAlt ?? ''),
    ]);
  },

  triptych(node, file) {
    const { left, center, right, leftAlt, centerAlt, rightAlt } =
      node.attributes ?? {};
    if (!left || !center || !right)
      fail(file, node, 'triptych requires left, center, and right attributes');
    return figure(node, 'piece-triptych', [
      img(left, leftAlt ?? ''),
      img(center, centerAlt ?? ''),
      img(right, rightAlt ?? ''),
    ]);
  },

  sequence(node, file) {
    // Reserved in the content model; presentation undecided (ROADMAP.md).
    fail(
      file,
      node,
      'the sequence block is reserved but not implemented yet — see ROADMAP.md',
    );
  },
};

export function remarkPiecesBlocks() {
  return (tree, file) => {
    visit(tree, ['leafDirective', 'containerDirective'], (node) => {
      const render = BLOCKS[node.name];
      if (!render) {
        fail(
          file,
          node,
          `unknown block directive "${node.name}" — the block vocabulary is closed; ` +
            `known blocks: ${Object.keys(BLOCKS).join(', ')}`,
        );
      }
      const element = render(node, file);
      node.data = {
        ...node.data,
        hName: element.tagName,
        hProperties: element.properties,
        hChildren: element.children,
      };
    });
  };
}

function fail(file, node, message) {
  // `file.fail` throws a VFileMessage carrying the file path and the
  // directive's line/column, which Astro surfaces in the build error.
  file.fail(message, node);
}

function figure(node, blockClass, children) {
  return {
    tagName: 'figure',
    properties: { className: ['piece-block', blockClass] },
    children,
  };
}

function img(src, alt) {
  return {
    type: 'element',
    tagName: 'img',
    properties: { src, alt },
    children: [],
  };
}
