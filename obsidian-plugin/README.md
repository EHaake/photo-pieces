# photo-pieces-blocks (Obsidian plugin)

Renders the site's image block directives as actual images while
writing in Obsidian's Live Preview, instead of raw directive text.
Deliberately approximate, not styled to match the real site — see
`DECISIONS.md` at the repo root for the reasoning. The site build is
the source of truth for how anything actually renders.

## What renders, what stays raw

| Syntax                                               | In Live Preview                    |
| ---------------------------------------------------- | ---------------------------------- |
| `::single` `::fullbleed` `::wide` `::tall` `::inset` | the image                          |
| `::diptych` `::triptych`                             | the images side by side            |
| `:::compare`                                         | its stages' images, labels beneath |
| `:::name … :::` other container forms (captions)     | raw text                           |
| `:::grid` `:::strip` `:::aside` `:::row` `:::held`   | raw text                           |
| any directive typed mid-paragraph                    | raw text (the site rejects it too) |

Attribute values may be quoted or unquoted, as on the site. Captions
are not shown — `alt` is accessibility text, not a caption,
so it is no longer displayed under the image. A `:::compare` is the
exception by design: a stage's image text is its label, which the site
shows too, so each stage's label sits beneath its image; the notes,
the slider and the other ways to compare are the site's alone. Put the
cursor anywhere in the block and it turns back into its text. Missing
images show a dashed "not found" box, which is telling the truth about
what the build would do (it fails).

A `src` that names a folder — `../other-piece/x.jpg`,
`../../gallery-images/x.jpg` — is resolved from the note's own folder
the way the site build resolves it, so a wrong path shows "not found"
rather than a same-named file from another folder. A bare `./x.jpg`
still uses Obsidian's own lookup. Borrowing from the gallery root
needs the vault root at or above `src/content/` (the layout in
`AUTHORING.md` puts it at the repo root): a vault opened at `src/content/pieces/` cannot reach
`../../gallery-images/`, and the plugin shows "not found" for a path
the build accepts.

## Build and install

`main.js` is a build artifact and is not committed. Build it, then copy
the three files into your vault:

```sh
cd obsidian-plugin
npm install --legacy-peer-deps
npm run build
mkdir -p "<vault>/.obsidian/plugins/photo-pieces-blocks"
cp manifest.json main.js styles.css "<vault>/.obsidian/plugins/photo-pieces-blocks/"
```

Then in Obsidian: Settings → Community plugins → enable
"Photo Pieces Blocks". After rebuilding, disable and re-enable the
plugin (or reload Obsidian) to pick up the new `main.js`.

`--legacy-peer-deps` is required — the `obsidian` types package pins
an older peer version of `@codemirror/state` than `@codemirror/view`
itself wants. Both packages are dev-only (type declarations); Obsidian
provides the real CodeMirror instance at runtime, which is why
`@codemirror/*` is marked external in `esbuild.config.mjs`.

## Extending

The vocabulary lives in `LEAF_BLOCKS` in `main.ts`: one entry per block
name mapping its attributes to the images to show. Adding a leaf block
on the Astro side means adding one entry here.

The compare is the one container parsed. `compare.ts` holds its
pattern — the whole block, fence to fence, anchored to whole lines —
and `parseCompareBody`, which reads the body by the site transform's
rule: an image opens a stage, its text is the label, and the text up
to the next image is the note. A compare's span is claimed whether or
not it renders, so no line inside it is read as a leaf block; one with
no stages stays raw. Every other container form would need a parser of
its own rather than a line regex — a deliberate non-goal for now.
