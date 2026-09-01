# Plan: Block Vocabulary

**Status**: Draft — pending review
**Implements**: spec.md in this directory

## Shape of the change

One transform (`remark-pieces-blocks.mjs`) grows from a leaf-only,
attribute-only model to a block-descriptor model; `global.css` grows a
matte token pair and per-treatment layout rules; the Obsidian plugin
gains leaf-form rendering for the new standalone blocks; a sampler
fixture piece and doc updates close it out. No new routes, no page
changes — the reading page renders whatever the transform emits.

## The block-descriptor model

Each vocabulary entry becomes a descriptor:

```
{
  forms: 'leaf' | 'container' | 'both',
  images: 'attributes' | 'body',   // where its images come from
  body:   'caption' | 'prose' | 'images+caption' | null,
  sizing: { layout, sizes },       // per-image hProperties
  matted: boolean,                 // default matte on/off
}
```

- **single, fullbleed, wide, tall, inset** — images from `src`/`alt`
  attributes; `both` forms; container body = caption.
- **diptych, triptych** — images from `left/center/right` (+alts)
  attributes; `both` forms; body = caption. Attributes: `match="height"`
  (equal-heights mode), `weight="left|right"` (diptych only, 2:1).
- **grid, strip** — container only; images from the body (paragraphs
  that contain only markdown images, one image per paragraph, in
  order); any trailing non-image paragraphs = the caption. Grid
  validates 2–6 images; strip 1–8.
- **aside, row** — container only; image from `src`/`alt` attributes;
  body = prose; `side="left|right"` required. No caption (the prose
  is the accompanying text).
- **wide** additionally takes `bleed="left|right"` (half-bleed).
- Unknown names, wrong form (e.g. leaf `::grid`), unknown attributes
  of the _closed_ attribute set, missing files, and missing alts all
  keep the fail-loudly contract with file + line.

Body parsing notes:

- A container body is mdast children. Partition rule: leading
  paragraphs whose only children are `image` nodes are the block's
  images; everything after is caption (or prose, for aside/row).
  A block directive _inside_ any body fails loudly — no nesting.
- Caption content renders as `<figcaption>` (inline markdown
  preserved — the children pass through remark-rehype untouched).
- Astro's image collection already visits the whole mdast tree, so
  body-sourced images (grid/strip) ride the same optimization path as
  attribute-sourced ones — verified mechanism from 001, no new
  machinery.

## Output structures

- Standalone blocks: `<figure class="piece-block piece-<name>">` +
  img children + optional `<figcaption>`.
- **aside** — the one structural exception: prose must wrap _around_
  the figure, so the container **unwraps**: the transform splices
  `[figure.piece-aside.side-left|right, ...bodyProse]` into the
  parent, replacing the directive node. The float is on the figure;
  the prose stays ordinary paragraphs in the column. A `clear` comes
  from CSS on the next block-level sibling type (plan: `.piece-block`
  and headings clear floats).
- **row** — stays wrapped: `<div class="piece-block piece-row
side-*">` containing the figure and a `<div class="piece-row-prose">`
  with the body.
- **strip** — `<figure class="piece-block piece-strip">` containing a
  scroll div (`overflow-x: auto`) with the images at a fixed
  responsive height (`clamp`-based, design detail), native scroll,
  scroll-snap optional CSS.

## Equal-heights mode and the dimension probe

`match="height"` needs aspect ratios at build time. New dependency:
**`image-size`** (justified per policy: reads dimensions from file
headers synchronously, zero transitive deps, ~tiny; `sharp` could do
it but is async and heavyweight inside a sync visitor). The transform
already resolves each image path for the existence check — the probe
happens at the same spot, only for blocks that need it.

Mechanics: each image in a `match="height"` block gets
`style="--ar: <w/h>"` via hProperties; CSS switches the block to flex
with `img { flex: var(--ar) 1 0; min-width: 0; height: auto; }` —
widths distribute proportionally to aspect ratio, so heights equalize
exactly, no cropping. Default (no attribute) stays the grid with
`align-items: center` — the midline centering decided at spec review
(a one-line change from today's `start`).

## Sizes table (initial values; tuned during implementation)

| Treatment           | layout      | sizes                                                                   |
| ------------------- | ----------- | ----------------------------------------------------------------------- |
| single (both forms) | constrained | `(min-width: 720px) 680px, 94vw`                                        |
| inset               | constrained | `(min-width: 720px) 440px, 80vw`                                        |
| wide                | constrained | `(min-width: 1240px) 1160px, 96vw`                                      |
| fullbleed           | full-width  | `100vw`                                                                 |
| tall                | constrained | `(min-width: 720px) 60vw, 94vw` (conservative; height-capped rendering) |
| diptych half        | constrained | `(min-width: 720px) 340px, 47vw`                                        |
| weighted 2:1        | constrained | 453px / 227px approximations                                            |
| triptych third      | constrained | `(min-width: 720px) 227px, 31vw`                                        |
| grid cell           | constrained | as diptych half                                                         |
| strip frame         | constrained | `70vw` (height-driven; conservative)                                    |
| aside image         | constrained | `(min-width: 720px) 300px, 94vw`                                        |
| row image           | constrained | `(min-width: 720px) 340px, 94vw`                                        |

The plain-markdown single keeps its current no-srcset behavior until
the global `image.layout` decision (unchanged 002 limitation) — the
_directive_ form gets the full treatment, which the docs will note as
one more reason to reach for it.

## Mattes

Two tokens in `global.css`: `--matte` (width; `clamp()`-based so it
tightens on mobile) and `--color-matte` (initial value: pure white
`oklch(1 0 0)` against the warm off-white page — reads as a matte
without any rule; tunable one line). Application:

- Matted (spec's working assumption): single (both forms), inset,
  wide, diptych, triptych, grid, aside, row — via
  `background + padding` on the figure (multi-image blocks: one
  shared matte around the group, gutters show matte color).
- Unmatted: fullbleed, tall, strip, and the bled edge of half-bleed
  (implementation detail: half-bleed keeps matte on the column side
  only if visually coherent — decided at the visual check, not
  guessed here).
- The markdown shorthand single is matted too, via a `.prose img`
  rule scoped to exclude `.piece-block img`.
- `figcaption` sits on the matte (inside the padded field) — museum
  convention; checked visually with the photographer at the sampler
  review.

## Obsidian plugin (authoring-side)

Extend the existing regex+widget pattern to all _leaf_ image blocks
(single/fullbleed/wide/tall/inset/diptych/triptych): one regex per
name, a shared multi-image widget rendering side-by-side thumbnails.
Container forms (captions, grid, strip, aside, row) stay raw text in
Live Preview — recorded in DECISIONS.md as the accepted approximation,
consistent with the plugin's original scoping. Reading view remains
out of scope. Plugin version bumps; its README updated.

## Sampler piece + docs

- `src/content/pieces/vocabulary-sampler/` — one fixture piece using
  every treatment, both forms where both exist, captions, all
  attributes. Fixture status: listed alongside the jetty piece in
  spec 005's unpublish-before-launch criterion.
- README: full syntax reference table (name, forms, attributes,
  caption support, matted or not, Obsidian rendering honesty).
- AUTHORING.md: unmatted-exports rule (already present for masters;
  extend with "no baked mattes"), body-image syntax for grid/strip,
  the no-nesting rule.
- DECISIONS.md: plugin approximation addendum.

## Testing strategy

- Unit suite (same real-pipeline harness): per block — leaf happy
  path, container/caption happy path, every fail-loudly case, sizing
  hProperties, `--ar` styles in match mode, aside's unwrap structure,
  grid/strip body partition (images vs caption), no-nesting failure.
  Expect the suite to roughly triple; split into
  `remark-pieces-blocks.test.mjs` (existing contracts) plus a second
  file for the new vocabulary if one file gets unwieldy.
- Build + browser geometry checks (the established pattern): midline
  centering, equal-heights equality, aside wrap, strip scrollability,
  matte presence/absence per treatment, mobile collapse — measured
  via JS, plus screenshots for the photographer at the sampler
  review.
- `astro build` green per task; existing pages unchanged.

## Dependencies

- `image-size` (new, runtime-at-build): dimension probe for
  equal-heights mode. Named here per the constitution's policy.

## Known limitations / deferred

- `sequence` unchanged, reserved.
- Equal-heights mode requires probe-able files; SVG or exotic formats
  fail loudly rather than guessing.
- Strip uses native scroll only — no arrows, no snap-paging JS.
- Obsidian Live Preview approximations as above.
- Exact matte width/color, tall's height cap, and strip's band height
  are visual-review knobs, not spec constants — settled with the
  photographer at the sampler review.
