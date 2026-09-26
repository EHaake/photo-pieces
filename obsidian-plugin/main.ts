import { Plugin, TFile, editorInfoField, editorLivePreviewField } from 'obsidian';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { StateField, EditorState, RangeSetBuilder } from '@codemirror/state';
import { COMPARE_PATTERN, parseCompareBody } from './compare';

// Live Preview rendering for the LEAF form of the site's standalone image
// blocks: while writing, `::single{src="./a.jpg" alt="…"}` shows the image
// instead of raw directive text. Deliberately approximate — not styled to
// match the site (see DECISIONS.md at the repo root).
//
// Mirrors the vocabulary in remark-pieces-blocks.mjs by convention. One
// container renders: `:::compare`, shown as its stages' images with each
// label beneath (its body read by compare.ts); the methods, the handle and
// the loupe are the site's. What stays raw text on purpose: every other
// `:::name … :::` container form (captions), grid, strip, aside, row, held —
// multi-line bodies are otherwise out of scope for this plugin's regex
// approach. Raw text is honest: the site build is the source of truth for
// what those render as.
//
// The regex is anchored to a whole line (`m` flag): a directive typed
// mid-paragraph does NOT render here, because the real pipeline does not
// treat it as a block either.
//
// A `src` with a folder in it is resolved from the note's own folder,
// exactly as the site build resolves it, with no name-based fallback: a
// wrong path shows "image not found" here too, rather than a same-named
// file from some other folder.

// `label` is set for a compare's stages only: shown beneath the image.
type Image = { src: string; alt: string; label?: string };
type Extract = (attrs: Record<string, string>) => Image[] | null;

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

const one: Extract = (a) => (a.src ? [{ src: a.src, alt: a.alt ?? '' }] : null);

const LEAF_BLOCKS: Record<string, Extract> = {
  single: one,
  fullbleed: one,
  wide: one,
  tall: one,
  inset: one,
  diptych: (a) =>
    a.left && a.right
      ? [
          { src: a.left, alt: a.leftAlt ?? '' },
          { src: a.right, alt: a.rightAlt ?? '' },
        ]
      : null,
  triptych: (a) =>
    a.left && a.center && a.right
      ? [
          { src: a.left, alt: a.leftAlt ?? '' },
          { src: a.center, alt: a.centerAlt ?? '' },
          { src: a.right, alt: a.rightAlt ?? '' },
        ]
      : null,
};

const DIRECTIVE_PATTERN = `^::(${Object.keys(LEAF_BLOCKS).join('|')})\\{([^}]*)\\}[ \\t]*$`;

function parseAttrs(raw: string): Record<string, string> {
  // Quoted or unquoted values, as remark-directive accepts both.
  const attrs: Record<string, string> = {};
  const attrRe = /(\w+)=(?:"([^"]*)"|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw))) {
    attrs[m[1]] = m[2] ?? m[3];
  }
  return attrs;
}

class BlockWidget extends WidgetType {
  constructor(
    private block: string,
    private images: Image[],
    private sourcePath: string,
    private plugin: Plugin,
  ) {
    super();
  }

  eq(other: BlockWidget) {
    return (
      other.block === this.block &&
      other.images.length === this.images.length &&
      other.images.every(
        (img, i) =>
          img.src === this.images[i].src &&
          img.alt === this.images[i].alt &&
          img.label === this.images[i].label,
      )
    );
  }

  toDOM() {
    const wrapper = document.createElement('div');
    wrapper.addClass('photo-pieces-preview');
    wrapper.dataset.block = this.block;
    if (this.block === 'compare') wrapper.addClass('photo-pieces-preview-compare');
    else if (this.images.length > 1) wrapper.addClass('photo-pieces-preview-row');

    for (const { src, alt, label } of this.images) {
      // A compare's stage: the image (or its "not found") with its label beneath.
      let parent: HTMLElement = wrapper;
      if (label !== undefined) {
        parent = document.createElement('div');
        parent.addClass('photo-pieces-stage');
        wrapper.appendChild(parent);
      }
      const resolved = resolveRelative(src, this.sourcePath);
      const file =
        resolved.kind === 'name'
          ? this.plugin.app.metadataCache.getFirstLinkpathDest(
              src.replace(/^\.\//, ''),
              this.sourcePath,
            )
          : resolved.kind === 'path'
            ? this.plugin.app.vault.getAbstractFileByPath(resolved.path)
            : null;
      if (!(file instanceof TFile)) {
        const missing = document.createElement('div');
        missing.addClass('photo-pieces-missing');
        missing.setText(`[${this.block}: image not found — ${src}]`);
        parent.appendChild(missing);
      } else {
        const img = document.createElement('img');
        img.src = this.plugin.app.vault.getResourcePath(file);
        // alt is accessibility text, not a caption — captions live in the
        // container form, which this plugin leaves as raw text.
        img.alt = alt;
        parent.appendChild(img);
      }
      if (label !== undefined) {
        const caption = document.createElement('div');
        caption.addClass('photo-pieces-stage-label');
        caption.setText(label);
        parent.appendChild(caption);
      }
    }
    return wrapper;
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

  const text = state.doc.toString(); // whole doc — fine at piece scale
  const sel = state.selection.ranges;
  // Leave raw syntax visible and editable while the cursor is on it —
  // same convention Obsidian's own live preview uses for embeds.
  const cursorInside = (start: number, end: number) =>
    sel.some((r) => r.from <= end && r.to >= start);

  // Two passes, one per pattern; the builder needs its ranges in order.
  const found: { start: number; end: number; block: string; images: Image[] }[] = [];

  // A compare's whole block, fence to fence. Its span is claimed whether
  // or not it renders, so no line inside it is read as a leaf block.
  const compares: { start: number; end: number }[] = [];
  const compareRe = new RegExp(COMPARE_PATTERN, 'gm');
  let m: RegExpExecArray | null;
  while ((m = compareRe.exec(text))) {
    const start = m.index;
    const end = start + m[0].length;
    compares.push({ start, end });
    if (cursorInside(start, end)) continue;

    const stages = parseCompareBody(m[2]);
    if (stages.length === 0) continue; // no stages: stay raw
    const images = stages.map(({ src, label }) => ({ src, alt: label, label }));
    found.push({ start, end, block: 'compare', images });
  }

  const re = new RegExp(DIRECTIVE_PATTERN, 'gm');
  while ((m = re.exec(text))) {
    const start = m.index;
    const end = start + m[0].length;

    if (compares.some((c) => start < c.end && end > c.start)) continue;
    if (cursorInside(start, end)) continue;

    const images = LEAF_BLOCKS[m[1]](parseAttrs(m[2]));
    if (!images) continue; // required attributes missing: stay raw

    found.push({ start, end, block: m[1], images });
  }

  found.sort((a, b) => a.start - b.start);
  const builder = new RangeSetBuilder<Decoration>();
  for (const { start, end, block, images } of found) {
    builder.add(
      start,
      end,
      Decoration.replace({
        widget: new BlockWidget(block, images, sourcePath, plugin),
        block: true,
      }),
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
