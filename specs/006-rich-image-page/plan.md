# Plan: The Rich Image Detail Page

**Status**: Draft — pending the photographer's review (skeptical
reviewer: sound with changes, all incorporated — see "Review
amendments" at the end)
**Implements**: spec.md in this directory

## Shape of the change

Everything grows from 004's registry and page; nothing moves.

- **The sidecar grows** — nine optional frontmatter fields (place,
  time, format, filters, support, processing, edition, sizes, paper)
  and its body, until now ignored, becomes the story. Same file, same
  loader, same id mapping.
- **The camera's frame** — a private raster beside the photograph,
  found by name, never an image of the site (convention below).
- **The registry** (`src/lib/images.ts`) learns four derived things per
  image: its camera's frame, its **sets** (each gallery holding it and
  its piece's frame order, with neighbours), its **related frames**
  (the nearest frames of the same outing), and the **passage** of the
  piece it sits in. The pure rules live in `image-meta.mjs` with tests,
  as in 004.
- **The page** (`src/pages/images/[...id].astro`) renders the new
  sections in the spec's order, each conditionally, and gains three
  page-level enhancements over its static HTML: quiet view, the
  compare slider, and set selection by route in.
- **Search**: image pages with something to find join the Pagefind
  index built in the existing `postbuild`.
- **The mock-up** (`src/pages/image-review/`) is the visual reference
  until the real page matches it, then deleted (the 004 latest-review
  pattern).
- **No directive.** The compare is a page section fed by the private
  raster; the `sequence` block stays reserved in the transform, its
  reserved-message contract untouched. (The spec's first draft called
  the compare "the sequence block's first presentation"; corrected at
  plan review — it is the seed of the showcase, not the block.)

## Data model

### Sidecar schema (`imageMeta` in `content.config.ts`)

All optional strings, added beside the 004 fields:

```
place, time                          // label rows, at its head
format, filters, support, processing // "How it was made"
edition, sizes, paper                // "The print"
```

`processing` is prose (a sentence or three); the rest are short. A
section renders only if at least one of its fields exists. The story
is the entry body; the registry keeps the entry so the page can
`render()` it.

### The camera's frame — a private raster, by name

Convention: **a raster whose basename starts with `_` is private**. It
extends the sidecar rule — `_land-b.md` describes `land-b.jpg`, and
`_land-b.jpg` is its camera's frame — with a different relation under
the same prefix ("about X" vs "the raw of X"); `AUTHORING.md` and
`DECISIONS.md` say so plainly. `_<basename>.<ext>` beside
`<basename>.<ext>`, any accepted extension in either case; the two
extensions need not match, so the target check compares basenames,
not filenames. Enforced:

- The registry never gives a private raster an id or a page.
  `classifyContentImage` returns a private classification (target,
  folder, path) for it before `parseImagePath` would run; the discovery loop
  gets an explicit private branch that collects them into their own
  map (their `ImageMetadata` is needed for `<Image>`), separate from
  the nested-file warning whose message would be wrong for them.
- A private raster whose target basename does not exist **among the
  discovered files of its folder** — published, draft, or unowned
  alike, so a frame in a draft piece's folder is fine — **fails the
  build** naming the file: the orphan-sidecar rule. The spec's flow
  said the sidecar "names" the frame; with a convention there is
  nothing to name and no second mechanism to drift. Spec amended at
  plan review.
- `validateGalleries` gets a private-raster branch with its own reason
  ("`where-the-fog-lets-go/_land-b` is a camera's frame, not an image
  of the site") — the generic unknown-id rejection would already fire,
  so the test asserts this message, not the failure.
- The transform fails a piece that references a private raster
  (`./_land-b.jpg`): `parseImagePath` throws a distinct message for
  `_`-prefixed basenames, and the transform's existing `ImageIdError`
  path reports it with file and line.
- The frame goes through `<Image>` like every image and the 004
  barriers cover it. Its EXIF is never read. The fixture frame carries
  GPS not to exercise the scan on the happy path — the pruner deletes
  its unreferenced original before the scan runs — but to guard the
  one leak shape 004 found: a request at source width and source
  format passes the original through, referenced, and the scan would
  then fail the build. The compare requests webp (Astro's default
  output), so that shape can't occur; the GPS fixture is the tripwire
  if someone changes that.

### Registry types

`SiteImage` gains:

```ts
hasStory: boolean                      // sidecar body has content
record: { format?, filters?, support?, processing? }
print:  { edition?, sizes?, paper? }
before: ImageMetadata | null           // the camera's frame
sets:   ImageSet[]                     // ids, not objects — see below
related: string[]                      // ids, nearest in piece order, ≤ 6
passage: { prose: string; caption?: string } | null   // markdown source
```

`label` gains `place` and `time` (sidecar-only).

`ImageSet = { kind: 'gallery' | 'piece', id, title, url, index, count,
prev?: string, next?: string }` — **ids, resolved on the page through
`registry.byId`**, so the graph stays acyclic (the reviewer's point:
objects here would make every image reference every sibling).
`sets[0]` is the default set: the newest gallery holding the image
(`image.galleries` is already newest-first), else the piece order. A
gallery-root image in no gallery has no set and no neighbour line.

**Related** is only for piece folders — the outing. The gallery root is
a flat pool, not an outing (24 fixtures there today would make a
23-frame strip); gallery-root images have no related frames. Capped at
six: the nearest in piece order, three each side where possible.

### Pure rules (`image-meta.mjs`, tested)

- `referencesImage(text, basename)` — **one** definition of "this text
  references this file" (shorthand, directive attribute, with or
  without `./`), used by `firstAltFor`, `pieceOrder`, and `passageFor`.
  The mock had a third, looser definition; three rules for one fact is
  the drift the constitution forbids.
- `isPrivateRaster(basename)`, `privateTargetOf(basename)`.
- `pieceOrder(body, basenames)`: the folder's frames in the order the
  piece body first references them, then the unreferenced by name.
- `neighbours(list, id)` → `{ index, prev?, next? }`; ends absent.
- `nearest(list, id, limit)` for related.
- `passageFor(body, basename)`: the nearest earlier block that is prose
  (no image reference, no directive) before the first reference, plus a
  container block's caption — the caption extraction skips image and
  directive lines too (the mock returned a raw `![…]` line as the
  caption for the strip block). Null with no reference.
- `sectionsFor(image)`: which sections render, in spec order. Shared by
  the page and its unit test — but the unit test cannot catch the
  page disagreeing with it, so the built-HTML check in T406 is the
  real assertion of "when and only when".

## The page

Order (spec, story first): stage → neighbour line → eyebrow + title →
story → wall label (place, time, then the exposure rows) → caption →
piece and gallery links → How it was made → Raw to finished → In the
piece → Related frames → The print.

- **Story**: `const { Content } = await render(image.sidecar)` — the
  site's own pipeline, so the story is a piece body in miniature: the
  block vocabulary works in it and links to pages as anywhere; plain
  prose is the expectation. Rendered in the reading column with
  `.prose` at text colour (one scoped rule un-mutes it — it is the
  photograph's text, not a caption). `imagePageUrl` takes
  `dirname(file.path)`, so `pieces/<slug>/_land-b.md` and
  `gallery-images/_dock-b.md` both resolve; the gallery-root fixture
  story carries a diptych of gallery-root images so that path is
  rendered, not only unit-tested.
- **Description for sharing**: the story's first paragraph as plain
  text when there is one, else the caption, else the 004 fallbacks.
- **Label**: place and time rows prepend the 004 candidates list; same
  `<dl>`, same styles.
- **How it was made / The print**: the mock's single-column `<dl>`
  variant; print adds `mailto:${CONTACT_EMAIL}?subject=Print enquiry:
  <title>`. Wording in one `const` block at the top of the page.
- **Raw to finished**: `<figure class="compare">` with two `<Image>`s
  in the photograph's box; the before frame is **letterboxed**
  (`object-fit: contain` on the mat colour) when its ratio differs —
  a camera's frame is often a different crop, and the fixture frame is
  deliberately 4:3 against a 3:2 photograph so the path is exercised.
  Real alt texts ("The camera's frame", "The finished photograph") and
  visible labels, not `aria-hidden` — without script the two frames
  stack, before above after, each labelled, and a screen reader hears
  both. The page script sets `data-js`, which overlays them with the
  before frame clipped at `--split` (unitless 0–100) and reveals a
  full-area `<input type=range>` for pointer and keyboard, with a
  visible focus ring drawn on the figure (`:has(:focus-visible)`).
  The divider is a hairline in the mat colour. The processing note
  sits with the compare when present, else under How it was made —
  one home.
- **In the piece**: `renderMarkdown()` for both the prose and the
  caption (a `_word_` in a piece caption must not print as
  underscores) in a `<blockquote>` with the accent rule; "Read it in
  place →" to the piece. The two-processor split (site pipeline for
  bodies, the caption processor for inline prose) is 004's, documented
  in `markdown.ts`; the passage is directive-free by construction.
- **Related frames**: the gallery rule, not a new one — the strip is a
  `.gallery-flow` with a smaller target short side, supplied like the
  gallery's through `gallery-layout.ts` (`RELATED_SHORT_PX`,
  `relatedFlowStyle`, and `galleryCell()` for widths and `sizes`), so
  equal short sides, the stretch cap, and the srcset math stay one
  source of truth. (The mock used the match-height rule — equal
  heights — which is the treatment the gallery rule replaced.)
- **Neighbour line**: one `<nav class="frame-nav">` per set, all
  rendered, the default visible, the others `hidden`; each carries
  `data-set` and its links carry the same `data-set`. Titles truncated;
  arrows as text; a two-column stack below 720px.
- **Quiet view**: a `<button hidden data-quiet-toggle>` under the frame
  that the script un-hides; `html[data-quiet]` hides header, footer,
  navs, and body sections and sets the stage to `100svh`; Escape or a
  ground click exits. The attribute persists across `ClientRouter`
  swaps by design **between image pages** — stepping through a set
  with the arrow keys stays quiet — and the script clears it on any
  page that is not an image page.
- **Arrow keys** step through the visible nav by activating its link
  (`link.click()`, so the set-tracking click handler fires) — never
  while an input has focus, so the compare slider keeps its own arrow
  keys.
- **Search**: `data-pagefind-body` on the article **only when the page
  has something to find** (a story, a caption, or a place); the
  exposure rows, the from-lines, the navs, and the related strip carry
  `data-pagefind-ignore`. Otherwise thirty label-only fixture pages
  would swamp four pieces with junk excerpts.

### Set selection by route in (page-level enhancement)

Static pages can't know the referrer, so the HTML shows the default
set. One writer, one reader, no ordering race (the first draft had
both scripts writing and reading at the same event, and the layout's
listener — registered first on every journey — would have overwritten
the value before the page read it):

- **Writer**: a delegated click handler in `BaseLayout`'s script. When
  a link to `/images/…` is activated, it stores in `sessionStorage`
  the link's own `data-set` if it has one (neighbour links), else a set
  derived from the current path (`/galleries/<slug>/` →
  `gallery:<slug>`, `/pieces/<slug>/` → `piece:<slug>`), else nothing
  (clears).
- **Reader**: the image page script at `astro:page-load` shows the nav
  whose `data-set` matches the stored value if this image has it, else
  the default.

Failure mode at every step: the default set. An arrival that was not a
click (typed URL, a link from outside, back/forward) shows the default
or the last clicked set — accepted, and recorded in `DECISIONS.md`.

## Fixtures

- `where-the-fog-lets-go/_land-b.jpg`: the camera's frame for the demo
  hero — generated by `gen-placeholders.mjs` as a flat, desaturated
  **4:3** variant of `land-b` (a different crop, for the letterbox
  path) carrying GPS (the passthrough tripwire above).
- `_land-b.md` grows every new field and a three-paragraph fixture
  story (invented, marked as such in the piece's tradition — never
  adopted as content; on the 005 unpublish list).
- `gallery-images/_dock-b.md` gains a story with a diptych of `dock-a`
  and `dock-b` (the gallery-root render path, blocks in a story, and
  "story with nothing else").
- An orphan private raster and a piece referencing `./_x.jpg` are
  build-failure checks in tasks, not checked-in fixtures.

## Testing strategy

- Vitest, `image-meta.test.mjs`: `referencesImage` (four reference
  forms, and a near-miss basename); private-raster detection, target,
  mixed-case extension; `parseImagePath` rejects `_`-prefixed
  basenames with the private message; `validateGalleries` reports the
  private-raster reason for a private id; `pieceOrder`; `neighbours`
  at start, middle, end, absent; `nearest` with the cap at both ends;
  `passageFor` (shorthand, container with caption, image-bearing block
  skipped, strip block's caption is not the image line, no reference →
  null); `sectionsFor` for empty, story-only, fields-only, everything.
  Each shown to fail with its rule broken, per the constitution.
- Vocabulary suite: a piece referencing `./_land-b.jpg` fails with file
  and line and the private message.
- Build: no `/images/…/_land-b/` page; an orphan `_nothing.jpg` fails
  naming the file; a frame in a draft piece's folder does not fail; the
  GPS scan passes; the gallery-root story renders its diptych with
  links to `/images/gallery/…/`; existing 149 tests green.
- Content equivalence for a no-sidecar image (the spec's "baseline"
  criterion, restated at plan review from "byte-for-byte", which the
  restructured markup makes impossible): same URL, same stage markup,
  same label rows in the same order, same caption and piece/gallery
  links, no empty section elements — asserted over the built HTML by
  a small script in the task, not judged from a diff.
- Browser (geometry, not screenshots): section order; story-only page;
  compare clip at 20 and 50 and the letterboxed before frame; quiet
  view hides the header, fits the frame, exits on Escape, survives an
  arrow-key step, clears on leaving; the nav swaps after arriving from
  a gallery vs a piece vs a neighbour link; arrow keys on a focused
  slider move the slider, not the page; related strip short sides
  equal within a row; 375px wraps.

## File structure

```
src/content.config.ts            imageMeta schema + 9 fields
src/lib/image-meta.mjs           referencesImage, private rasters,
                                 pieceOrder, neighbours, nearest,
                                 passageFor, sectionsFor, gallery
                                 private-id reason
src/lib/images.ts                private branch in discovery, before,
                                 sets (ids), related (ids), passage,
                                 record, print, hasStory, place/time
src/lib/gallery-layout.ts        RELATED_SHORT_PX, relatedFlowStyle
src/pages/images/[...id].astro   the rich page + its script and styles
src/layouts/BaseLayout.astro     the set-tracking click handler
remark-pieces-blocks.mjs         private-raster failure (via parseImagePath)
scripts/gen-placeholders.mjs     the 4:3 GPS-bearing camera's frame
src/content/pieces/where-the-fog-lets-go/_land-b.{md,jpg}
src/content/gallery-images/_dock-b.md
image-meta.test.mjs, remark-pieces-vocabulary.test.mjs
AUTHORING.md, README.md, DECISIONS.md
src/pages/image-review/          deleted at close-out
```

## Known limitations

- One camera's frame per photograph, in its folder, by name. The
  showcase spec can generalize (`_land-b.1.jpg`…) under the same rule.
- Set selection needs a click on this site; a reader landing from
  outside sees the default set.
- The passage is the nearest earlier prose block, not a semantic "the
  paragraph about this image"; a piece that introduces an image after
  it quotes the wrong side. The quote links to the piece and the
  preview shows it.
- The story renders through the full pipeline, so it can carry blocks
  the Obsidian plugin doesn't preview — as pieces can.
- The related strip is absent for gallery-root images by decision, not
  limitation; revisit if the gallery root ever gains structure.

## Resolved decisions

- **Private rasters by `_` prefix**, over a sidecar field.
- **Story first**, no heading — spec.
- **Default set = newest gallery, else piece**; route-in selection is
  a click-tracked enhancement, never the only path.
- **Related = the outing only, six nearest**; none at the gallery root.
- **The before frame letterboxes** rather than failing on a ratio
  mismatch — different crops are the normal case.
- **Processing note has one home**: with the compare when present.
- **Index only pages with something to find**; exposure rows and
  chrome ignored.
- **No new dependency.**

## Review amendments (skeptical reviewer, plan gate)

Blocking findings, each resolved above: the set-selection race
(rewritten as one click-handler writer); related frames using the
match-height rule instead of the gallery rule and a second sizing
source (now `.gallery-flow` through `gallery-layout.ts`); an uncapped
related list that would render 23 frames at the gallery root (outing
only, six nearest); the spec's "sequence block's first presentation"
claim with no directive shipping (spec and ROADMAP corrected); the
"byte-for-byte baseline" criterion that the restructured markup makes
unpassable (content equivalence); and a gallery test that passed
before the feature existed (a private-id reason to assert). Second-look
items adopted: one `referencesImage`, the strip-caption bug, letterbox
for mismatched ratios, real alts and a focus ring on the compare,
arrow-key precedence, Pagefind scoping, the GPS fixture's true purpose,
ids instead of a cyclic graph, the explicit private discovery branch,
draft-folder orphans, mixed-case targets, the share description with
a story, the caption through `renderMarkdown`, the two-meanings note
for `_`, and quiet view across navigation decided rather than
discovered.
