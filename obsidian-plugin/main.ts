import { Plugin, TFile } from 'obsidian';
import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Decoration,
  DecorationSet,
  WidgetType,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// Deliberately a plain regex, not a full remark-directive parser — this
// only needs to recognize the one block type actually built so far
// (fullbleed). Extend the pattern here as diptych/triptych get built on
// the Astro side.
const DIRECTIVE_RE = /::fullbleed\{([^}]*)\}/g;

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
      this.src,
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

function buildDecorations(
  view: EditorView,
  plugin: Plugin,
  sourcePath: string,
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const cursorRanges = view.state.selection.ranges.map((r) => [r.from, r.to]);

  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to);
    DIRECTIVE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = DIRECTIVE_RE.exec(text))) {
      const start = from + match.index;
      const end = start + match[0].length;

      // Leave the raw syntax visible and editable while the cursor is
      // actually on this directive — same convention Obsidian's own
      // live preview uses for bold/links/embeds.
      const cursorInside = cursorRanges.some(([cf, ct]) => cf <= end && ct >= start);
      if (cursorInside) continue;

      const attrs = parseAttrs(match[1]);
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
  }
  return builder.finish();
}

export default class PhotoPiecesBlocksPlugin extends Plugin {
  async onload() {
    const plugin = this;

    this.registerEditorExtension(
      ViewPlugin.fromClass(
        class {
          decorations: DecorationSet;

          constructor(view: EditorView) {
            const sourcePath = plugin.app.workspace.getActiveFile()?.path ?? '';
            this.decorations = buildDecorations(view, plugin, sourcePath);
          }

          update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
              const sourcePath = plugin.app.workspace.getActiveFile()?.path ?? '';
              this.decorations = buildDecorations(update.view, plugin, sourcePath);
            }
          }
        },
        {
          decorations: (v) => v.decorations,
        },
      ),
    );
  }
}
