import {
  Component,
  MarkdownRenderer,
  Plugin,
  TFile,
  editorInfoField,
  editorLivePreviewField,
} from 'obsidian';
import type { App } from 'obsidian';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { StateField, EditorState, RangeSetBuilder } from '@codemirror/state';
import { parseBlocks, resolveRelative } from './blocks';
import type { ParsedBlock } from './blocks';
import { figureTree, toDom } from './figure';

// Draws every block of the site's vocabulary (remark-pieces-blocks.mjs) as
// its figure while writing: the block's lines are replaced by the figure
// while the cursor is outside them, and come back as text when it enters.
// Both views draw a block as the same figure — the tree built in figure.ts
// from what the scanner in blocks.ts reads — styled by styles.css.
//
// Representative, not the site: frames at the site's widths, rows, grids,
// strips, a frame beside its prose, stages with their labels and method
// named; not the site's methods, handle, loupe or hold (see DECISIONS.md at
// the repo root on the accepted approximation). The site build is the
// judge, and what the scanner cannot read stays raw text: a directive with
// text before it on its line (the site does not treat it as a block
// either), a block with a required src missing, a container with no
// closer, and a name that is not in the vocabulary.
//
// A `src` with a folder in it is resolved from the note's own folder,
// exactly as the site build resolves it, with no name-based fallback: a
// wrong path shows "image not found" here too, rather than a same-named
// file from some other folder.

/** A block's image src, seen from the note at `sourcePath`, as a URL the
 *  view can load, or `null` when it names no file. */
function resolver(app: App, sourcePath: string): (src: string) => string | null {
  return (src) => {
    const resolved = resolveRelative(src, sourcePath);
    const file =
      resolved.kind === 'name'
        ? app.metadataCache.getFirstLinkpathDest(src.replace(/^\.\//, ''), sourcePath)
        : resolved.kind === 'path'
          ? app.vault.getAbstractFileByPath(resolved.path)
          : null;
    return file instanceof TFile ? app.vault.getResourcePath(file) : null;
  };
}

// The Component that owns a figure's rendered Markdown, by the figure's
// element: CodeMirror keeps an equal widget's DOM and destroys it through
// the newer widget, so the element, not the widget, carries it.
const components = new WeakMap<HTMLElement, Component>();

const sameBlock = (a: ParsedBlock, b: ParsedBlock) => {
  const keys = Object.keys(a.attrs);
  return (
    a.name === b.name &&
    keys.length === Object.keys(b.attrs).length &&
    keys.every((key) => a.attrs[key] === b.attrs[key]) &&
    a.images.length === b.images.length &&
    a.images.every(
      (img, i) =>
        img.src === b.images[i].src &&
        img.alt === b.images[i].alt &&
        img.label === b.images[i].label,
    ) &&
    a.caption === b.caption &&
    a.prose === b.prose &&
    a.method === b.method
  );
};

class FigureWidget extends WidgetType {
  constructor(
    private block: ParsedBlock,
    private sourcePath: string,
    private plugin: Plugin,
  ) {
    super();
  }

  // By content and path, not offsets, so a selection change or an edit
  // elsewhere in the note does not rebuild the images.
  eq(other: FigureWidget) {
    return other.sourcePath === this.sourcePath && sameBlock(other.block, this.block);
  }

  toDOM(view: EditorView) {
    const { app } = this.plugin;
    const component = new Component();
    component.load();
    const rendering: Promise<void>[] = [];
    const figure = toDom(
      figureTree(this.block, resolver(app, this.sourcePath)),
      (markdown, into) => {
        rendering.push(MarkdownRenderer.render(app, markdown, into, this.sourcePath, component));
      },
    );
    components.set(figure, component);
    // The rendered caption and prose change the figure's height after
    // layout; CodeMirror measures it again once they are in.
    if (rendering.length > 0) Promise.all(rendering).then(() => view.requestMeasure());
    return figure;
  }

  destroy(dom: HTMLElement) {
    components.get(dom)?.unload();
    components.delete(dom);
  }

  ignoreEvent() {
    return false;
  }
}

function buildDecorations(state: EditorState, plugin: Plugin): DecorationSet {
  // Only decorate in Live Preview — in strict Source mode, raw text is
  // what the user asked for.
  if (!state.field(editorLivePreviewField, false)) {
    return Decoration.none;
  }

  const info = state.field(editorInfoField, false);
  const sourcePath = info?.file?.path ?? '';

  const sel = state.selection.ranges;
  const builder = new RangeSetBuilder<Decoration>();
  // One pass, in order: the scanner returns the note's blocks as they
  // stand, and the builder needs its ranges in order.
  for (const block of parseBlocks(state.doc.toString())) {
    // Leave raw syntax visible and editable while the cursor is on it —
    // same convention Obsidian's own live preview uses for embeds.
    if (sel.some((r) => r.from <= block.to && r.to >= block.from)) continue;
    builder.add(
      block.from,
      block.to,
      Decoration.replace({ widget: new FigureWidget(block, sourcePath, plugin), block: true }),
    );
  }
  return builder.finish();
}

// Block decorations must come from a StateField, not a ViewPlugin —
// CodeMirror enforces this at runtime (view plugins run after layout,
// and block decorations change layout). This was the cause of the
// editor crash in 0.1.0.
function directiveField(plugin: Plugin) {
  return StateField.define<DecorationSet>({
    create(state) {
      return buildDecorations(state, plugin);
    },
    update(deco, tr) {
      if (tr.docChanged || tr.selection) {
        return buildDecorations(tr.state, plugin);
      }
      return deco.map(tr.changes);
    },
    provide: (field) => EditorView.decorations.from(field),
  });
}

export default class PhotoPiecesBlocksPlugin extends Plugin {
  async onload() {
    this.registerEditorExtension(directiveField(this));
  }
}
