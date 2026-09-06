import { Plugin, TFile, editorInfoField, editorLivePreviewField } from 'obsidian';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { StateField, EditorState, RangeSetBuilder } from '@codemirror/state';

// Live Preview rendering for the LEAF form of the site's standalone image
// blocks: while writing, `::single{src="./a.jpg" alt="…"}` shows the image
// instead of raw directive text. Deliberately approximate — not styled to
// match the site (see DECISIONS.md at the repo root).
//
// Mirrors the vocabulary in remark-pieces-blocks.mjs by convention. What
// stays raw text on purpose: the `:::name … :::` container forms (captions),
// grid, strip, aside, row, held — multi-line bodies are out of scope for this
// plugin's regex approach. Raw text is honest: the site build is the
// source of truth for what those render as.
//
// The regex is anchored to a whole line (`m` flag): a directive typed
// mid-paragraph does NOT render here, because the real pipeline does not
// treat it as a block either.
//
// A `src` with a folder in it is resolved from the note's own folder,
// exactly as the site build resolves it, with no name-based fallback: a
// wrong path shows "image not found" here too, rather than a same-named
// file from some other folder.

type Image = { src: string; alt: string };
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
  pause: one,
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
        (img, i) => img.src === this.images[i].src && img.alt === this.images[i].alt,
      )
    );
  }

  toDOM() {
    const wrapper = document.createElement('div');
    wrapper.addClass('photo-pieces-preview');
    wrapper.dataset.block = this.block;
    if (this.images.length > 1) wrapper.addClass('photo-pieces-preview-row');

    for (const { src, alt } of this.images) {
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
        wrapper.appendChild(missing);
        continue;
      }
      const img = document.createElement('img');
      img.src = this.plugin.app.vault.getResourcePath(file);
      // alt is accessibility text, not a caption — captions live in the
      // container form, which this plugin leaves as raw text.
      img.alt = alt;
      wrapper.appendChild(img);
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

  const builder = new RangeSetBuilder<Decoration>();
  const text = state.doc.toString(); // whole doc — fine at piece scale
  const re = new RegExp(DIRECTIVE_PATTERN, 'gm');
  const sel = state.selection.ranges;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index;
    const end = start + m[0].length;

    // Leave raw syntax visible and editable while the cursor is on it —
    // same convention Obsidian's own live preview uses for embeds.
    const cursorInside = sel.some((r) => r.from <= end && r.to >= start);
    if (cursorInside) continue;

    const images = LEAF_BLOCKS[m[1]](parseAttrs(m[2]));
    if (!images) continue; // required attributes missing: stay raw

    builder.add(
      start,
      end,
      Decoration.replace({
        widget: new BlockWidget(m[1], images, sourcePath, plugin),
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
