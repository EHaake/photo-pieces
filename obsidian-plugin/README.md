# photo-pieces-blocks (Obsidian plugin)

Renders the site's image block directives as actual images while
writing in Obsidian's Live Preview, instead of raw directive text.
Deliberately approximate, not styled to match the real site — see
`DECISIONS.md` at the repo root for the reasoning. The site build is
the source of truth for how anything actually renders.

## What renders, what stays raw

| Syntax                                                         | In Live Preview                    |
| -------------------------------------------------------------- | ---------------------------------- |
| `::single` `::fullbleed` `::wide` `::tall` `::inset` `::pause` | the image                          |
| `::diptych` `::triptych`                                       | the images side by side            |
| `:::name … :::` container forms (captions)                     | raw text                           |
| `:::grid` `:::strip` `:::aside` `:::row` `:::held`             | raw text                           |
| any directive typed mid-paragraph                              | raw text (the site rejects it too) |

Attribute values may be quoted or unquoted, as on the site. Captions
are not shown — `alt` is accessibility text, not a caption,
so it is no longer displayed under the image. Missing images show a
dashed "not found" box, which is telling the truth about what the
build would do (it fails).

A `src` that names a folder — `../other-piece/x.jpg`,
`../../gallery-images/x.jpg` — is resolved from the note's own folder
the way the site build resolves it, so a wrong path shows "not found"
rather than a same-named file from another folder. A bare `./x.jpg`
still uses Obsidian's own lookup.

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
on the Astro side means adding one entry here. Container forms would
need a real parser rather than a line regex — a deliberate non-goal
for now.
