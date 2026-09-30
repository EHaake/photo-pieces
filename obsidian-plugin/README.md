# photo-pieces-blocks (Obsidian plugin)

Draws every block of the site's vocabulary as a representative figure,
in Live Preview and in Reading view alike, so a piece read through in
Obsidian gives a good sense of its layout and flow. Representative,
not identical: the frames sit at widths that read as the site's for
each block, but the site's typography, ground, mat, motion and every
interaction stay the site's — see `DECISIONS.md` at the repo root on
the accepted approximation. The site build is the source of truth for
how anything actually renders.

## What each block shows

Both views draw a block as the same figure. In Live Preview, put the
cursor anywhere in a block and it turns back into its text for editing;
in Source mode everything is text, as asked. Widths are shares — of the
text column, of the pane, or of the window's height — not the site's
pixels.

| Syntax                                              | In Live Preview and Reading view                                                                                                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `::single` `:::single`                              | the image at the text's width                                                                                                                                                                                                     |
| `::inset` `:::inset`                                | the image at 65% of the text's width, centred                                                                                                                                                                                     |
| `::wide` `:::wide`                                  | the image past the text's edges: 1.7 times its width, at most 96% of the pane; `bleed=left\|right` runs it to that edge of the pane                                                                                               |
| `::fullbleed` `:::fullbleed`                        | the image across the whole pane                                                                                                                                                                                                   |
| `::tall` `:::tall`                                  | the image at most 80% of the window's height, centred                                                                                                                                                                             |
| `::diptych` `:::diptych` `::triptych` `:::triptych` | the images side by side at equal widths; `weight=left\|right` doubles that side's; `match=height` sizes each by its image's shape so all end at one height, once the images load; `width=wide\|fullbleed` widens the row as named |
| `:::grid`                                           | its images in two columns                                                                                                                                                                                                         |
| `:::strip`                                          | its images at one height in one row across the pane, scrolling sideways                                                                                                                                                           |
| `:::aside` `:::row`                                 | the image at 45% of the text's width on its `side` (left by default), the prose wrapping beside it                                                                                                                                |
| `:::held`                                           | the image at half the text's width on its `side`, the paragraphs flowing past it — without the site's hold                                                                                                                        |
| `:::compare`                                        | its stages' images in a row that wraps, each label beneath, then its method named (its `mode`'s word; Slider when none or unknown)                                                                                                |
| `:::side` `:::slider`                               | as a compare, the method line naming the block                                                                                                                                                                                    |
| any directive with text before it on its line       | raw text (the site does not treat it as a block either)                                                                                                                                                                           |

A caption — the body of a container form, or the text after a grid's
or a strip's images — sits beneath the frame in a smaller, muted face,
at the text's width even under a wide or full-width frame. `alt` is
accessibility text, not a caption, and is not displayed. A compare's
notes, the slider, the loupe and the other ways to compare are the
site's alone. A missing image shows a dashed "image not found" box,
which is telling the truth about what the build would do (it fails).

Raw text by design is the one case in the table's last row. Beyond it,
what the plugin cannot read as a block stays text rather than drawing
a guess: a block with a required `src` missing, a container with no
closing `:::`, a grid with no images or a compare with no stages, and a
name not in the vocabulary. The build is the judge of each.
In Reading view, a note embedded in another note, a hover preview
and an export are left as Obsidian draws them.

A `src` that names a folder — `../other-entry/x.jpg`,
`../../photographs/x.jpg` — is resolved from the note's own folder
the way the site build resolves it, so a wrong path shows "not found"
rather than a same-named file from another folder. A bare `./x.jpg`
still uses Obsidian's own lookup. Borrowing from the photographs folder
needs the vault root at or above `src/content/` (the layout in
`AUTHORING.md` puts it above the repo): a vault opened at
`src/content/journal/` cannot reach `../../photographs/`, and the
plugin shows "not found" for a path the build accepts.

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

## How to check it

Open the sampler entry, `src/content/journal/vocabulary-sampler/index.md`,
in Live Preview: every block in it is a figure, none raw text. Switch to
Reading view and it is the same page. The sampler carries no compare;
`where-the-fog-lets-go` has a compare, a side and a slider. With
Settings → Editor → Readable line length on, the widths read as the
site's.

What a test can pin, `sh scripts/verify.sh` runs from
`obsidian-plugin.test.mjs` at the repo root: the block table against
the transform, the scanner against the transform's own reading of the
sampler and the fog entry, the figure each block builds, the
stylesheet, and how Reading view's sections are rebuilt. The views
themselves are checked by eye.

## Extending

The vocabulary is `PLUGIN_BLOCKS` in `blocks.ts`: one line per block,
giving its forms and its body as the transform's descriptor gives them,
its layout, its width, and the attributes that name its images. A block
added to the transform (`BLOCKS` in `remark-pieces-blocks.mjs`) is a
line here, and the equality test demands it — it fails until the two
name the same blocks, in the same order, with the same forms and body.
A block that needs a layout the table doesn't have yet also needs its
figure in `figure.ts` and its rules in `styles.css`. A compare's method
words, `METHOD_WORDS` and `DEFAULT_MODE`, are pinned equal to the
site's.

Every width, gap and face is one token in `styles.css`'s `body` rule,
pinned by name and value in the test's `PLUGIN_TOKENS`; tuning one means
changing both:

| Token                                                         | Value                         | What it sets                                             |
| ------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------- |
| `--photo-pieces-inset`                                        | `0.65`                        | `inset`'s width, of the text column                      |
| `--photo-pieces-wide`, `--photo-pieces-wide-cap`              | `1.7`, `0.96`                 | `wide`'s width, of the column, capped of the pane        |
| `--photo-pieces-full`                                         | `1`                           | `fullbleed`'s width, of the pane                         |
| `--photo-pieces-side`, `--photo-pieces-held`                  | `0.45`, `0.5`                 | the frame beside the prose, of the column                |
| `--photo-pieces-tall`                                         | `0.8`                         | `tall`'s height cap, of the window's height              |
| `--photo-pieces-grid-columns`                                 | `2`                           | the grid's columns                                       |
| `--photo-pieces-gap`                                          | `0.5em`                       | the gaps                                                 |
| `--photo-pieces-strip-height`, `--photo-pieces-stage-min`     | `14em`, `12em`                | the strip's height; a stage's width before the row wraps |
| `--photo-pieces-caption-size`, `--photo-pieces-caption-color` | `0.85em`, `var(--text-muted)` | the caption's, label's and method line's face            |
| `--photo-pieces-method-display`                               | `block`                       | whether the method line shows (`none` hides it)          |

`--photo-pieces-tall` is 0.8 where the site's cap is 85svh: Obsidian's
tab header and status bar take roughly the difference from the window.

Every declaration in `styles.css` but a custom property carries
`!important`. Obsidian's own stylesheet outranked the plugin's
`display: flex`, and every row collapsed to a stack; an important
declaration outranks every normal one whatever its specificity, so no
normal rule of Obsidian's can undo a layout here. The stylesheet test
refuses a declaration without it, a selector outside the plugin's
`.photo-pieces-` classes (but for `body`'s tokens and the two pane
hosts), and any at-rule.
