import { Plugin, TFile, editorInfoField, editorLivePreviewField } from 'obsidian';
import { EditorView, Decoration, DecorationSet, WidgetType } from '@codemirror/view';
import { StateField, EditorState, RangeSetBuilder } from '@codemirror/state';

// Deliberately a plain regex, not a full remark-directive parser — this
// only needs to recognize the one block type actually built so far
// (fullbleed). Extend as diptych/triptych get built on the Astro side.
const DIRECTIVE_PATTERN = '::fullbleed\\{([^}]*)\\}';

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRe = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

class FullbleedWidget extends WidgetType {
  constructor(
    private src: string,
    private alt: string,
    private sourcePath: string,
    private plugin: Plugin,
  ) {
    super();
  }

  eq(other: FullbleedWidget) {
    return other.src === this.src && other.alt === this.alt;
  }

  toDOM() {
    const wrapper = document.createElement('div');
    wrapper.addClass('photo-pieces-fullbleed-preview');

    const file = this.plugin.app.metadataCache.getFirstLinkpathDest(
      this.src.replace(/^\.\//, ''),
      this.sourcePath,
    );

    if (!(file instanceof TFile)) {
      wrapper.addClass('photo-pieces-fullbleed-missing');
      wrapper.setText(`[fullbleed: image not found — ${this.src}]`);
      return wrapper;
    }

    const img = document.createElement('img');
    img.src = this.plugin.app.vault.getResourcePath(file);
    img.alt = this.alt;
    img.style.maxWidth = '100%';
    img.style.display = 'block';
    wrapper.appendChild(img);

    if (this.alt) {
      const caption = document.createElement('div');
      caption.addClass('photo-pieces-fullbleed-caption');
      caption.setText(this.alt);
      wrapper.appendChild(caption);
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
  const re = new RegExp(DIRECTIVE_PATTERN, 'g');
  const sel = state.selection.ranges;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index;
    const end = start + m[0].length;

    // Leave raw syntax visible and editable while the cursor is on it —
    // same convention Obsidian's own live preview uses for embeds.
    const cursorInside = sel.some((r) => r.from <= end && r.to >= start);
    if (cursorInside) continue;

    const attrs = parseAttrs(m[1]);
    if (!attrs.src) continue;

    builder.add(
      start,
      end,
      Decoration.replace({
        widget: new FullbleedWidget(attrs.src, attrs.alt ?? '', sourcePath, plugin),
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
