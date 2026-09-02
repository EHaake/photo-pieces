# Plan: Block Vocabulary

**Status**: Implemented as revised after skeptical review (verdict:
sound-with-changes; all blockers incorporated); amended at the
sampler review (per-image mattes, pair widths, warmed ground,
full-width hiding header)
**Implements**: spec.md in this directory

## Shape of the change

One transform (`remark-pieces-blocks.mjs`) grows from a leaf-only,
attribute-only model to a block-descriptor model; `global.css` grows a
matte token pair and per-treatment layout rules; the Obsidian plugin
gains leaf-form rendering for the new standalone blocks (and absorbs
two known fixes); a sampler fixture piece, two essay demos, and doc
updates close it out. No new routes. Added at the sampler review: pair
`width="wide|fullbleed"` variants, the warmed ground, and a full-width
header that hides on scroll down (BaseLayout script + CSS). **Pre-implementation step, own commit**: amend
CLAUDE.md's closed-vocabulary enumeration (constitution rule — it
currently names only the 001 set).

## The block-descriptor model

```
{
  forms: 'leaf' | 'container' | 'both' | 'reserved',
  images: 'attributes' | 'body',
  body:   'caption' | 'prose' | 'images+caption' | null,
  sizing: (attrs, imageIndex, ratios) => ({ layout, sizes }),
  matted: boolean,
}
```

- `sizing` is a function, not a static pair (review S1): weighted
  pairs and equal-heights mode give different images different
  rendered widths.
- `sequence` keeps its descriptor as `reserved` with its bespoke
  fail-loudly message — the existing test asserting that message must
  keep passing unmodified (review S8).

Per block: **single, fullbleed, wide, tall, inset** — src/alt
attributes, both forms, body = caption. **diptych, triptych** —
left/center/right (+alts), both forms, body = caption; attributes
`match="height"`, `weight="left|right"` (diptych only). **grid,
strip** — container only, images from body, trailing body = caption.
**aside, row** — container only, src/alt attributes, body = prose,
`side="left|right"` required, no caption. **wide** takes
`bleed="left|right"`.

### Body partition — at the inline level (review B1)

mdast puts consecutive image lines in **one paragraph** with `"\n"`
text nodes between them, so the rule is stated per inline node, not
per paragraph: walk leading paragraphs; a paragraph whose children
are only `image` nodes and whitespace-only `text` nodes contributes
its images (in order); the first paragraph containing any
non-whitespace non-image content ends the image run and starts the
caption. A paragraph _mixing_ images and real text fails loudly. The
directive label form (`:::grid[text]` — mdast marks it
`data.directiveLabel`) fails loudly on both leaf and container forms
("captions go in the body, not the [label]") — today's leaf transform
silently discards labels, which 003's caption emphasis makes an
actual hazard. Blank-line-separated images, same-line multiple
images, and caption-without-blank-line all get tests.

A block directive inside any body fails loudly — no nesting — via an
explicit scan of body children (the outer visit never traverses the
replacement nodes, so it can't be relied on for this — review note).

### Attribute validation (review S10)

The attribute set is closed per block: an unknown attribute fails
naming the offender and the allowed set (catches case typos like
`leftalt=`). remark-directive's `{#id .class}` shorthand is rejected
explicitly — it's the syntactic door to per-block style variants,
which the spec bans. Enum values (`side`, `weight`, `bleed`,
`match`) are validated. `weight` + `match="height"` together fail
loudly as contradictory.

## Output structures

- Standalone: `<figure class="piece-block piece-<name>">` + imgs +
  optional `<figcaption>` (caption children pass through untouched —
  inline markdown preserved).
- **aside** unwraps: splice `[figure.piece-aside.side-*,
...bodyProse]` into the parent (return `index + count`, matching
  the textDirective handler's pattern). Float on the figure; prose
  stays ordinary column paragraphs. **Containment (review B5)**:
  `.prose::after` clearfix — chosen over `display: flow-root`, which
  would stop margin-collapsing and change the column's vertical
  rhythm site-wide. `.piece-block` and headings also clear. Mobile:
  `float: none`, full column width.
- **row** stays wrapped: `div.piece-block.piece-row.side-*` > figure
  - `div.piece-row-prose`. Collapses to stacked on mobile.
- **strip**: figure > scroll div (`overflow-x: auto`, native scroll,
  CSS scroll-snap) with images at a `clamp()`-based band height.

## Dimension probe and equal-heights (review B2)

**No new dependency.** The probe uses Astro's own exported
`imageMetadata` (`astro/assets/utils`) — the same code Astro uses for
the `width`/`height` attributes it emits, which **swaps dimensions
for EXIF orientations 5–8**. `image-size` (the draft's choice) does
not, so a camera portrait JPEG (landscape buffer + rotate tag) would
have gotten an inverted `--ar` and equal-heights would have silently
failed on the photographer's most common file type. The transformer
becomes async (collect directive nodes, `await` metadata, apply) —
remark supports async transformers; ordering vs Astro's collector is
unchanged.

Equal-heights mechanics: per-image `style="--ar: <w/h>"` via
hProperties; CSS `flex: var(--ar, 1) 1 0; min-width: 0; height:
auto` — with the emitted ratios **normalized so the smallest is 1**
(grow factors summing below 1 under-fill the row — review S2), and a
fallback in `var()` so a missing value degrades loudly-visible, not
broken. Default mode stays the grid with `align-items: center`
(midline centering — a one-line change from today).

The probe also powers **strip's per-image `sizes`** (band height ×
ratio — a pano can legitimately exceed 100vw of rendered width) and
the orientation-6 unit fixture (generated with sharp, which writes
EXIF orientation) that pins the swap behavior.

## Sizes (review B3)

One shared constant is the **collapse breakpoint (720px)** — the same
value in the CSS media queries and every `sizes` string, stated in a
comment at both ends. Below it, collapsed blocks (diptych, triptych,
grid, row, aside) render stacked at ~94vw, and their narrow `sizes`
branch says `94vw` — the draft's `47vw/31vw` would have served
visibly soft images on phones. Wide-viewport branches stay as
drafted (single 680px¹, inset 440px, wide 1160px, halves 340px,
thirds 227px, weighted 453/227px); `tall` is bounded by the column
(680px); half-bleed declares `calc(50vw + 340px)`; strip is
probe-derived per image. Pair `width` variants scale the bases: wide →
560/373px (weighted 773/387), fullbleed → 50/33vw (weighted 67/33vw,
match shares of 100vw). ¹Coupled to `--prose-width` and `--matte` —
comments at both ends note the coupling (review S4).

**Global `image.layout: 'constrained'`** is set in `astro.config.mjs`
(review S5): the 001-era blocker ("would change /blog/ too") expired
when blog was deleted, and without it the plain-markdown single gets
no srcset — contradicting the spec's "same rendered result" promise
for single's two forms. Remaining `<Image>` components get checked at
implementation for layout interaction.

## Mattes (amended at the sampler review — T209R/T209G)

Tokens `--matte` (clamp-based width) and `--color-matte` (pure white).
**Per image, not per container** (T209R, the photographer's call): every
frame carries its own mat via `background + padding` on the `<img>` —
matted are single (both forms; the shorthand via `.prose > p > img`),
inset, wide, diptych, triptych, grid, and the images in aside/row;
unmatted are fullbleed, tall, strip, `width="fullbleed"` pairs, and
half-bleed's bled edge. Gutters in multi-image blocks show the page
between mats. **Captions sit below the mats on the page**, and on
edge-to-edge treatments they return to the reading column (centered,
or aligned to the column edge for half-bleeds). The matte map is a
CSS decision — the descriptors carry no `matted` flag (the pre-merge
review found the earlier flag drifting from the CSS). Equal-heights
mode survives per-image mats exactly: the padding participates in the
flex-basis floor. The ground itself was warmed one step (T209G) so
white mats read as mats.

`tall`/`strip` override `.piece-block img { width: 100% }` with
`width: auto; max-width: 100%; …` (review S11) — a forced width plus
a height cap would stretch or crop. `inset` instead caps the figure at
`min(440px, 80vw)` and leaves the image at width 100% (no height cap,
so nothing can stretch — a deliberate divergence from the S11 form).
`--tall-max` and `--strip-h` are `:root` tokens.

Known limitation (accepted): the 720px collapse breakpoint and strip's
420px band ceiling are duplicated between the transform's `sizes` math
and the CSS, commented at both ends; retuning one without the other
degrades `sizes` accuracy with a green suite.

## Obsidian plugin

Extends the regex+widget pattern to all leaf image blocks with a
shared multi-image thumbnail widget. Absorbed known fixes (review
S7): the regex anchors to line start (`m` flag) so the plugin stops
rendering mid-paragraph directives the pipeline rejects; the README's
install path gets real build instructions (`main.js` is a build
artifact, not committed). The widget stops rendering `alt` as a
visible caption — real captions exist now and the widget can't show
them, so displaying alt-as-caption becomes a lie; container forms
stay raw text (DECISIONS.md addendum). Reading view still out of
scope.

Related transform fix while in there: the textDirective restoration
re-serializes attributes (`:word{k=v}` currently comes back as
`:word`), and AUTHORING.md's "renders as literal text" claim gets
corrected to match actual behavior.

## Sampler piece + docs

- `src/content/pieces/vocabulary-sampler/`: every treatment, both
  forms, all attributes, captions — the mechanical reference.
- Two essay-style demo pieces (added at plan review): fixture pieces
  written as if real — e.g. a landscape-outing essay leaning on
  fullbleed/wide/diptych/captions, and a street/portrait-flavored one
  leaning on tall/aside/row/grid/strip — so the photographer reviews
  the vocabulary as a reading experience. Invented prose is
  sanctioned for fixtures (jetty-piece precedent); all fixtures
  unpublish before launch.
- Images for all three: **generated placeholders at varied real
  ratios** (3:2, 2:3, pano ~3:1, square, 4:5) via a sharp script — no
  dependency on the photographer's photos; swap in real frames
  anytime. Fixture status: **this spec edits
  `specs/005-going-live/spec.md`** to list the sampler alongside the
  jetty piece in the unpublish-before-launch criterion (the draft
  wrongly asserted that edit as already-existing fact — review B4).
- Docs list (review B4): README syntax table; AUTHORING.md (unmatted
  exports extension, grid/strip body syntax, no-nesting,
  mid-paragraph correction); DECISIONS.md (plugin approximations;
  breadth-first reversal rationale); **ROADMAP.md** (the vocabulary
  entry currently says "not speculatively" — 003 deliberately chose
  breadth, and the entry's Obsidian raw-text claim changes);
  **CLAUDE.md** (pre-implementation amendment, own commit); the
  jetty piece's "full built vocabulary" closing line.

## Testing strategy

- Unit suite via the real pipeline, split into the existing file
  (unchanged contracts, including sequence's bespoke message) + a new
  file for 003 blocks. Per block: leaf/container happy paths, every
  fail-loudly case (incl. label, mixed paragraph, nesting, unknown/
  enum/contradictory attributes), sizing function output, partition
  edge cases, aside unwrap structure, ratio normalization, the
  orientation-6 fixture.
- `--ar` is assertable in unit tests only as an `__ASTRO_IMAGE_`
  marker property; that it survives to a rendered `style` attribute
  is a mechanism claim verified once against built output (review
  S3).
- Browser geometry checks at the sampler: midline centering, equal
  heights (measured equal), aside wrap + clearfix (aside as last
  block), strip scrollability, matte presence/absence map, mobile
  collapse at the breakpoint, and — once, for all four dependents
  (fullbleed, wide, half-bleed, strip) — the viewport-centered-column
  contract.
- `astro build` green per task; screenshots for the photographer at
  the sampler review.

## Dependencies

None new. (`image-size` was in the draft; replaced by Astro's own
`astro/assets/utils` `imageMetadata` — orientation-correct and the
same source of truth as Astro's emitted dimensions.)

## Known limitations / deferred

- `sequence` reserved, unchanged, descriptor-modeled explicitly.
- Equal-heights requires probe-able files; failures are loud.
- Strip: native scroll only, no JS.
- Obsidian: container forms raw; captions not rendered in Live
  Preview.
- Matte width/color, tall's cap, strip's band height: visual-review
  knobs settled with the photographer at the sampler review.
