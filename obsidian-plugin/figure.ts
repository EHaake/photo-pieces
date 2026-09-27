// The figure a block is drawn as, in both views: one builder, two callers.
// `figureTree` returns a plain tree rather than DOM, so Live Preview and
// Reading view share it and the site's test suite (obsidian-plugin.test.mjs)
// reads it with no DOM library; `toDom` turns it into elements with
// standard DOM calls, handing each `{ markdown }` node to the caller's
// Markdown renderer. Kept free of the `obsidian` import, as blocks.ts is.
//
// The breakout (wide, full, bleed) sits on `.photo-pieces-frames`, never on
// the root, so a caption and the method line stay at the text's width
// beneath a wide or full frame. A beside block's prose is inside its
// figure, so its float is contained in one element. The classes are the
// stylesheet's (styles.css); the test pins that it names no other.

import { PLUGIN_BLOCKS } from './blocks';
import type { Image, ParsedBlock, Width } from './blocks';

export type FigureElement = {
  tag: string;
  classes: string[];
  attrs?: Record<string, string>;
  children: FigureNode[];
};
export type FigureNode = FigureElement | { text: string } | { markdown: string };

const el = (
  tag: string,
  classes: string[],
  children: FigureNode[],
  attrs?: Record<string, string>,
): FigureElement => (attrs ? { tag, classes, attrs, children } : { tag, classes, children });

const leftOrRight = (value: string | undefined): string | null =>
  value === 'left' || value === 'right' ? value : null;

/** The figure for `block`; `resolve` maps an image's src to a URL, or
 *  `null` when it names no file — drawn as the dashed "not found" box. */
export function figureTree(
  block: ParsedBlock,
  resolve: (src: string) => string | null,
): FigureElement {
  const { layout, width: tableWidth } = PLUGIN_BLOCKS[block.name];
  const { attrs } = block;

  let width: Width = 'column';
  if (layout === 'frame' || layout === 'beside') width = tableWidth ?? 'column';
  else if (layout === 'pair')
    width = attrs.width === 'wide' ? 'wide' : attrs.width === 'fullbleed' ? 'full' : 'column';
  else if (layout === 'strip') width = 'full';

  const classes = ['photo-pieces-block', `photo-pieces-${layout}`, `photo-pieces-w-${width}`];
  if (layout === 'beside') classes.push(`photo-pieces-side-${leftOrRight(attrs.side) ?? 'left'}`);
  const bleed = layout === 'frame' ? leftOrRight(attrs.bleed) : null;
  if (bleed) classes.push(`photo-pieces-bleed-${bleed}`);
  const weight = layout === 'pair' ? leftOrRight(attrs.weight) : null;
  if (weight) classes.push(`photo-pieces-weight-${weight}`);

  const picture = ({ src, alt }: Image): FigureElement => {
    const url = resolve(src);
    return url === null
      ? el('div', ['photo-pieces-missing'], [{ text: `[${block.name}: image not found — ${src}]` }])
      : el('img', [], [], { src: url, alt });
  };
  const frames = block.images.map((image) =>
    image.label === undefined
      ? picture(image)
      : el(
          'div',
          ['photo-pieces-stage'],
          [picture(image), el('div', ['photo-pieces-stage-label'], [{ text: image.label }])],
        ),
  );

  const children: FigureNode[] = [el('div', ['photo-pieces-frames'], frames)];
  if (block.caption !== '')
    children.push(el('div', ['photo-pieces-caption'], [{ markdown: block.caption }]));
  if (block.method !== null)
    children.push(el('div', ['photo-pieces-method'], [{ text: block.method }]));
  if (layout === 'beside')
    children.push(el('div', ['photo-pieces-prose'], [{ markdown: block.prose }]));

  return el('div', classes, children, { 'data-block': block.name });
}

/** The elements for `node`; each `{ markdown }` child is rendered into its
 *  parent element by `renderMarkdown`. */
export function toDom(
  node: FigureElement,
  renderMarkdown: (markdown: string, into: HTMLElement) => void,
): HTMLElement {
  const element = document.createElement(node.tag);
  for (const name of node.classes) element.classList.add(name);
  for (const name of Object.keys(node.attrs ?? {})) element.setAttribute(name, node.attrs![name]);
  for (const child of node.children) {
    if ('tag' in child) element.appendChild(toDom(child, renderMarkdown));
    else if ('text' in child) element.appendChild(document.createTextNode(child.text));
    else renderMarkdown(child.markdown, element);
  }
  return element;
}
