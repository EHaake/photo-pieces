import {
  Component,
  MarkdownRenderChild,
  MarkdownRenderer,
  MarkdownView,
  Plugin,
  TFile,
  editorInfoField,
  editorLivePreviewField,
} from 'obsidian';
import type { App } from 'obsidian';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { StateField, EditorState, RangeSetBuilder } from '@codemirror/state';
import { blockSignature, parseBlocks, resolveRelative, sectionPieces } from './blocks';
import type { ParsedBlock } from './blocks';
import { figureTree, toDom } from './figure';

// Draws every block of the site's vocabulary (remark-pieces-blocks.mjs) as
// its figure while writing: the block's lines are replaced by the figure
// while the cursor is outside them, and come back as text when it enters.
// Both views draw a block as the same figure — the tree built in figure.ts
// from what the scanner in blocks.ts reads — styled by styles.css.
//
// Reading view has no cursor: every block always renders. Obsidian hands
// the post-processor one section at a time (split at blank lines), so a
// block is read from the whole note and drawn by the section it begins
// in; that section is rebuilt around it, its other lines rendered as
// Markdown, and the block's later sections are hidden. A section that
// touches no block is left as Obsidian drew it, and so is a section with
// no source to read (a note embedded in another, a hover preview, an
// export). Since Obsidian re-runs only the sections whose text changed,
// any edit that changes a note's blocks re-renders its Reading view whole.
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
    // A render that fails leaves its caption or prose empty; say so once
    // rather than leaving the rejection unhandled (T1734a).
    if (rendering.length > 0)
      Promise.all(rendering)
        .then(() => view.requestMeasure())
        .catch((error) => console.error('photo-pieces: a caption or prose did not render', error));
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
  // The last note parsed: Reading view calls once per section, each with
  // the whole note's text.
  private parsed: { text: string; blocks: ParsedBlock[] } | null = null;
  // Each document's blocks as last seen, by docId and path, and the notes
  // (by path) whose Reading view is due a full re-render this tick.
  private signatures = new Map<string, string>();
  private rerendering = new Set<string>();

  async onload() {
    this.registerEditorExtension(directiveField(this));
    this.registerMarkdownPostProcessor((el, ctx) => {
      const info = ctx.getSectionInfo(el);
      if (!info) return; // no source to read: leave it as Obsidian drew it

      const blocks = this.parse(info.text);
      this.noteSignature(ctx.docId, ctx.sourcePath, blockSignature(blocks, info.text));

      const pieces = sectionPieces(blocks, info.lineStart, info.lineEnd);
      if (!pieces) return;
      el.empty();
      if (pieces.length === 0) {
        el.addClass('photo-pieces-hidden'); // drawn whole by its first section
        return;
      }
      el.removeClass('photo-pieces-hidden');

      const { app } = this;
      const child = new MarkdownRenderChild(el);
      ctx.addChild(child);
      const md = (markdown: string, into: HTMLElement) => {
        void MarkdownRenderer.render(app, markdown, into, ctx.sourcePath, child);
      };
      const lines = info.text.split('\n');
      for (const piece of pieces) {
        if (piece.kind === 'markdown') {
          // Its own element, so a render that finishes later keeps its place.
          md(lines.slice(piece.startLine, piece.endLine + 1).join('\n'), el.createDiv());
        } else {
          el.appendChild(toDom(figureTree(piece.block, resolver(app, ctx.sourcePath)), md));
        }
      }
    });
  }

  private parse(text: string): ParsedBlock[] {
    if (this.parsed?.text !== text) this.parsed = { text, blocks: parseBlocks(text) };
    return this.parsed.blocks;
  }

  // Stored on every call, so the re-render it schedules sees it equal and
  // does not loop; the first render of a document stores it without
  // comparing.
  //
  // Keyed by the document, not the path alone (T1734a): the plugin's own
  // MarkdownRenderer.render calls (captions, prose, Reading view's runs)
  // run this post-processor again with the note's sourcePath, and if their
  // section info holds the fragment, not the note, the fragment's
  // signature would differ from the note's and re-render it, again and
  // again. A sub-render is another document, with its own docId, so it
  // only ever compares against itself. The typings give docId on every
  // context; the other guard — accept a call only when the info's text is
  // the note's whole text — has no synchronous source for that text in
  // them (the vault's read is async).
  private noteSignature(docId: string, path: string, signature: string) {
    const key = `${docId}\u0000${path}`;
    const previous = this.signatures.get(key);
    this.signatures.set(key, signature);
    if (previous === undefined || previous === signature || this.rerendering.has(path)) return;
    this.rerendering.add(path);
    window.setTimeout(() => {
      this.rerendering.delete(path);
      for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
        const view = leaf.view;
        if (
          view instanceof MarkdownView &&
          view.file?.path === path &&
          view.getMode() === 'preview'
        ) {
          view.previewMode.rerender(true);
        }
      }
    }, 0);
  }
}
