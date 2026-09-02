# Spec: Block Vocabulary

**Status**: Implemented (Phases 0–5); pending the pre-merge review
**Depends on**: 001 (transform pipeline, fullbleed/diptych/triptych),
002 (pieces-only site). Feeds 004 (galleries) and 005 (going live).

## Summary

Broaden the closed image-treatment vocabulary from the built set
(single, fullbleed, diptych, triptych) to the full range a photo essay
plausibly needs — deliberately broader than proven need, per the
photographer's direction: better to have the vocabulary ready as real
writing starts than to interrupt writing to build it. Unused
treatments cost little (each is a transform handler + CSS + tests);
missing ones interrupt authoring. The vocabulary stays _closed_ — this
spec widens the set once, deliberately; it doesn't open the door to ad
hoc layouts.

Two structural changes come with the breadth:

1. **Captions.** No current block can carry one. The `:::name ... :::`
   container form — deliberately rejected as unsupported in 001 —
   becomes the caption mechanism: the container body is the caption,
   markdown allowed. This is the planned re-opening the 001 review
   anticipated, not a reversal.
2. **Prose-bearing blocks.** Two treatments contain prose alongside an
   image (float-wrap and side-by-side row). These are container
   directives whose body is real markdown prose — a new _kind_ of
   block, previously absent from the model.

## Goals

1. The photographer can express every layout they currently
   anticipate, in plain Markdown, without leaving Obsidian.
2. Every image-bearing block can carry an optional caption, styled
   consistently (one caption treatment site-wide, per the design
   brief's restraint).
3. The vocabulary remains closed and fail-loudly: unknown directives,
   malformed attributes, missing files, and missing alts still fail
   the build with file + line.
4. Every new treatment is responsive: correct `srcset`/`sizes` for how
   wide it actually renders, through the existing mdast-image-children
   mechanism — no regression to unoptimized images.
5. Authoring stays honest in Obsidian: the new syntax must not break
   the editing experience; Live Preview rendering extends to new
   blocks where the existing plugin pattern makes that cheap.
6. Demo pieces showcase the whole vocabulary (added at plan review,
   photographer's direction): one **reference sampler** exercising
   every treatment and attribute mechanically (living documentation),
   plus **two essay-style demo pieces** that read like real pieces —
   prose and treatments used naturally, the way actual writing would
   use them — so the vocabulary can be judged as a reading
   experience, not just verified block by block. Placeholder images
   are fine (photographer's call: "it doesn't matter what images you
   use"). All three are fixtures, listed in spec 005's
   unpublish-before-launch criterion alongside the jetty piece.

## The proposed vocabulary

Existing, unchanged in meaning (captions added):

- **single** — fills the prose column, the dominant case. Two
  equivalent forms (resolved at spec review): the plain-markdown
  shorthand `![alt](./img.jpg)` — untouched, fastest to type, no
  caption — and a directive form (`::single{...}` / caption-bearing
  `:::single`) that follows the family pattern exactly. Same rendered
  result at column width; the directive form exists so a column-width
  image can carry a caption without borrowing another treatment's
  name.
- **fullbleed** — viewport edge to edge.
- **diptych** — two up, side by side.
- **triptych** — three up.

Mixed-orientation behavior for diptych/triptych (resolved at spec
review, visualized and discussed): images render at **equal widths,
center-aligned on a shared midline** — a portrait beside a landscape
extends above and below it, deliberately. The photographer expects
this most in triptychs (horizontal–vertical–horizontal and the
inverse). A `width="wide|fullbleed"` attribute (added at the
sampler review — column-only pairs felt too restrictive) breaks the
pair out to the content width or the viewport, with mats dropped at
fullbleed. An opt-in attribute switches a block to **equal heights**
(widths follow aspect ratio, forming one clean rectangle; requires
build-time knowledge of image dimensions — plan detail). Cropping is
never a behavior, in any mode. For same-orientation sets both modes
render identically. Captions sit below the tallest image, spanning
the block.

New standalone treatments:

- **wide** — the centered breakout: wider than the prose column,
  _not_ full-bleed (roughly the site's content width; exact width is
  design/plan detail). For images that deserve emphasis without the
  full-stop weight of a fullbleed.
- **inset** — narrower than the prose column, centered. Detail shots,
  gear photos, anything that shouldn't dominate the scroll.
- **grid** — a uniform multi-image grid (2 columns; 2–6 images) for
  clusters that belong together but don't warrant one-per-row
  pacing. Syntax sketch: a container whose body is plain markdown
  images, one per line — reusing the image syntax authors already
  know rather than inventing `img1=…imgN=` attributes.

Added at spec review (the "even esoteric" pass — all four chosen):

- **tall** — the vertical counterpart to fullbleed: capped at viewport
  height (~90–100vh, exact value a design detail), centered, width
  follows. Closes a real gap — a portrait image in `fullbleed` renders
  ~1.5 screens tall. The full-stop pause moment for vertical frames.
- **weighted pair** — not a new block: an attribute on `diptych`
  (`weight="left|right"`, 2:1 split) for one dominant frame and one
  companion. Photobook asymmetric pairing.
- **strip** — a fixed-height, horizontally scrollable band. One very
  wide image (panorama — the other aspect-ratio casualty of
  column layouts) or several uniform-height frames. Native scroll
  only, pure CSS, no JS — consistent with the no-islands constraint.
- **half-bleed** — an attribute on `wide` (`bleed="left|right"`): the
  image runs to one viewport edge while the other side respects the
  column. The most magazine-styled of the set, chosen with eyes open.

New prose-bearing treatments:

- **aside** — image floated left or right at partial column width,
  prose wrapping around it. For commentary tied to one image.
- **row** — image and prose as two side-by-side columns, no wrap;
  prose top-aligned beside the image. For longer text that should sit
  _next to_ an image rather than flow around it. Collapses to stacked
  on narrow viewports (as do diptych/triptych/grid — responsive
  behavior is plan detail, but collapsing is the expectation).

Captions: optional on **every** named image block — single, fullbleed,
wide, tall, inset, diptych, triptych, grid, strip — via the container
body (corrected at plan review: the list originally omitted tall and
strip). The prose-bearing blocks (aside, row) take no caption — their
prose is the accompanying text. For blocks with a leaf form, the leaf
form stays valid — captions are opt-in; grid and strip are
container-only by nature (their images live in the body).

Reserved, still excluded: **sequence** (interactive; needs its own
design pass — unchanged from ROADMAP).

## Mattes

Decided at spec review, with a matching design-brief amendment (the
flat matte is the photographer's presentation style on every channel,
carved out of the skeuomorphism ban — frames, shadows, textures stay
banned): images on this site are presented **matted** — a flat,
uniform color field around the frame.

- **Per-image, not per-container** (resolved at the sampler review):
  every frame carries its own mat; gutters in multi-image blocks show
  the page between mats; captions sit below the mats on the page —
  the wall label sits on the wall, not the mat.
- **Applied by the site's CSS, never baked into image files.**
  Compared directly and decided: site-applied means one token retunes
  every matte (width, color in `global.css`); source files stay clean
  unmatted exports; mattes hold sensible proportion responsively;
  srcset pixels and aspect-ratio math stay honest (including the
  centered-pair alignment); and per-treatment intelligence is
  possible. Baked-in fails all five. AUTHORING.md gains the rule:
  upload unmatted exports.
- Which treatments matte by default is a plan/design detail — the
  working assumption: column-flow treatments (single, inset, wide,
  diptych, triptych, grid, aside, row) matted; edge-to-edge
  treatments (fullbleed, tall, strip, the bled edge of half-bleed)
  not, since the bleed is the point.
- Matte color/width are theme tokens; no shadow, bevel, or texture
  ever.

## Non-goals

- **No interactivity.** Everything here is static HTML + CSS. The
  sequence block, lightboxes, and the gallery image detail page
  (design brief's signature element) stay out — the last belongs to
  spec 004.
- **No pull quotes, callouts, or prose-only blocks.** Markdown already
  covers prose; this vocabulary is image treatments only.
- **No text-over-image treatments** (chapter cards, type on
  photographs) — contrast and accessibility landmines, and against
  the images-as-interface principle. Considered at review, rejected.
- **No frames** — the matte carve-out is exactly a flat color field;
  rendered frames, shadows, bevels, and textures remain banned.
- **No masonry/justified layouts.** The grid is uniform; editorial
  sequencing over algorithmic packing (brief: galleries are
  editorial). Revisit with 004 if real use demands it.
- **No per-block style variants** (borders, tones, hover effects) —
  flat, token-styled, one way to render each treatment.

## Authoring requirements

- All syntax writable and readable as plain text in Obsidian; no
  treatment may require anything Obsidian's editor would mangle.
- Alt text stays required-and-explicit on every image (empty allowed,
  silent omission not).
- The Obsidian plugin: must not corrupt or misrender the new syntax
  (raw text is acceptable); Live Preview image rendering extends to
  the new _standalone_ blocks where the existing regex+widget pattern
  applies. Prose-bearing/container forms may stay raw text in Live
  Preview for now — recorded as an accepted approximation in
  DECISIONS.md like the original plugin scoping.

## Acceptance criteria

- [ ] Each new treatment (single's directive form, wide, tall, inset,
      grid, strip, aside, row, and the weighted-pair and half-bleed
      attributes) renders
      correctly in `astro dev` and in built output, with optimized
      responsive images (hashed src, srcset/sizes appropriate to its
      rendered width)
- [ ] Captions render on every image block's container form, with
      inline markdown support, styled consistently site-wide
- [ ] Caption-less usage remains valid for every image block (leaf
      form where one exists; empty-trailing-body for grid/strip)
- [ ] All fail-loudly contracts hold for the new blocks (unknown
      directive, missing/malformed attributes, missing image files,
      missing alts), with file + line in the error
- [ ] Multi-image and prose-bearing blocks collapse sensibly on
      narrow viewports (checked in the browser at mobile width)
- [ ] The unit suite covers every new block's happy path, caption
      path, and every fail-loudly case — and still passes for the
      existing blocks
- [ ] The reference sampler exercises every treatment, both forms,
      every attribute, and captions
- [ ] Two essay-style demo pieces use the vocabulary naturally and
      read correctly end to end — reviewed by the photographer as
      reading experiences, not just rendered output
- [ ] README's syntax reference and AUTHORING.md document the full
      vocabulary; the Obsidian plugin's behavior per block is stated
      honestly somewhere an author will look
- [ ] Mattes render per the working assumption (column-flow matted,
      edge-to-edge not), token-driven, flat — retuning width or color
      is a one-token change
- [ ] `astro build` green; no regression on existing pages

## Resolved decisions

- **Broad on purpose.** The photographer chose breadth over
  demand-driven growth, accepting that some treatments may go unused
  and that real writing may still surface a missing one — handled
  then, as vocabulary additions have become cheap.
- **Captions via container body**, not a `caption="..."` attribute:
  captions are prose (markdown, possibly long) and attributes are a
  hostile place for prose. This re-opens `:::` deliberately.
- **Grid body = markdown images**, not numbered attributes — pending
  plan validation that the transform can consume image children from
  a container body cleanly.
- **`single` gets a directive form** (photographer's call at spec
  review): the family pattern applies to every treatment including
  column width, so any image can carry a caption; plain markdown
  remains the captionless shorthand and the docs present it that way.
- **`sequence` stays reserved.** Nothing here forecloses its later
  design; `grid` is not a substitute for it.
