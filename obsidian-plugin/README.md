# photo-pieces-blocks (Obsidian plugin)

Renders `::fullbleed{src="..." alt="..."}` as an actual image while
writing in Obsidian's Live Preview, instead of raw directive text.
Deliberately approximate, not styled to match the real site — see
`DECISIONS.md` at the repo root for the reasoning.

## Install (prebuilt)

Copy `manifest.json`, `main.js`, and `styles.css` into a new folder
inside your vault:

```
<vault>/.obsidian/plugins/photo-pieces-blocks/
```

Then in Obsidian: Settings → Community plugins → enable
"Photo Pieces Blocks".

## Rebuild from source

```sh
npm install --legacy-peer-deps
npm run build
```

`--legacy-peer-deps` is required — the `obsidian` types package pins
an older peer version of `@codemirror/state` than `@codemirror/view`
itself wants. Both packages are dev-only (type declarations); Obsidian
provides the real CodeMirror instance at runtime, which is why
`@codemirror/*` is marked external in `esbuild.config.mjs`.

## Extending to diptych/triptych

Once those exist as real directives on the Astro side, follow the same
pattern already in `main.ts`: a regex to recognize the syntax, a
`WidgetType` subclass to render it, both wired into `buildDecorations`.
