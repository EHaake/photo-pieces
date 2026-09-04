# Plan: The Held Image and the Pause

**Status**: Draft — pending the skeptical-reviewer's sign-off
**Implements**: spec.md in this directory

## Shape of the change

Two descriptors in the transform's closed table, their CSS in the
piece-blocks section of `global.css`, one page-level script on the
piece page, fixtures, tests, docs. Nothing new in the content model.
The exploration page (`src/pages/held-demo.astro`, carried onto this
branch from `explore/held-block`) is the visual reference for every
measurement below; page and branch are deleted at close-out.

- **`held`** — `forms: 'container'`, `body: 'prose'`, the existing
  `split` structure (a wrapper with the figure and the prose as its two
  cells — `row`'s shape), attributes `src`, `alt`, `side=left|right`
  (default left), and a `bleed` flag. Emits
  `div.piece-block.piece-held.side-<side>[.bleed].frame-<orientation>`
  with `--ar` on the wrapper, the figure with the matted, linked image,
  and `div.piece-held-prose` for the body.
- **`pause`** — `forms: 'leaf'`, one image, no body; emits
  `figure.piece-block.piece-pause` with `--ar` on it and the matted,
  linked image inside a `div.piece-pause-frame`.
- **CSS**: the hold (sticky figure sized from `--ar` and the hold
  height, the prose column beside it, side and bleed variants,
  orientation and phone collapses to a static figure), the pause (a
  scene taller than its frame by the pinned stretch, the frame pinned
  at the centre, ground and words mixing toward `--color-quiet` by
  `--pause-lights`, the approach), the header rule, and three knobs as
  tokens.
- **Script** (`src/pages/pieces/[slug].astro`): the pause's progress
  and the "held" state, as on the exploration.
- **`sequence`** stays reserved; `row` and `aside` are untouched.

## The transform (`remark-pieces-blocks.mjs`)

Small generalizations of the descriptor model, each used by both new
blocks:

- **A raw ratio.** `needsRatios` and `emitsAr` exist for `match="height"`,
  where `--ar` is normalized so the smallest is 1. A single frame
  normalized would always be 1, and these blocks need the real ratio:
  a `rawAr: true` descriptor field skips the normalization. The value
  also goes on the **wrapper** (`style="--ar: 1.5"` on the block's own
  hProperties) — custom properties inherit downward, and the figure's
  width formula reads it; the anchor keeps its own copy as everywhere.
- **Classes from ratios.** `classes(attrs)` becomes
  `classes(attrs, ratios)`; `held` returns `frame-landscape` for a
  ratio of 1 or more and `frame-portrait` below it (a square beside a
  column is width-starved on a portrait screen like a landscape).
  Existing blocks ignore the second argument.
- **A flag attribute.** remark-directive parses `{bleed}` as
  `bleed: ""`. `validateAttributes` treats a key listed in a new
  `attrs.flags` array as valid only with an empty value —
  `bleed="left"` fails with "bleed is a flag: write {bleed}". The enum
  check is unchanged for everything else.
- **A prose-only body.** `held` reuses `rejectNestedBlocks` and adds
  `rejectBodyImages`: an mdast `image` anywhere in the body fails with
  "a held image's body is prose — no images beside the frame". (`row`
  and `aside` keep allowing shorthand images in their bodies; the
  rule is `held`'s.)
- **The split structure's prose class** becomes per-block
  (`block.proseClass`, default `piece-row-prose` so `row`'s CSS is
  untouched); `held` uses `piece-held-prose`.
- **Sizing**: `held` — `(min-width: 1240px) 670px, (min-width: 720px)
58vw, 94vw`; with `bleed` — `(min-width: 720px) 50vw, 94vw`; `pause`
  — from the ratio the probe already produced, as `strip` does: on a
  viewport wider than the frame's ratio the frame is height-limited,
  so `(min-aspect-ratio: <width>/<height>) <round(85 × ratio)>vh, 90vw`,
  the ratio written as the probe's integer dimensions (a decimal
  ratio is legal in CSS Values 4 but not everywhere it should be, and
  an unparseable condition fails silently).
  These are hints for the srcset choice only: the layout never sizes
  from them (see the CSS).
- **`--ar` in two places, deliberately.** The wrapper's copy is what
  the new CSS reads; the anchor keeps its copy because every linked
  image on the site carries the same shape (the match-height rules
  read it there), and both come from the one probe — no second
  computation to drift.
- **`probeRatios`' failure messages** name the block that asked
  (`held`, `pause`, or `match="height"`), not the attribute a `held`
  author never wrote.

## What spec 006 needs from this (the passage)

`passageFor` (`image-meta.mjs`) treats every non-image, non-directive
line of a container block's body as the block's caption — right for
the caption-bodied blocks, wrong for the prose-bodied ones (`row`,
`aside`, and now `held`): converting the fog piece's `wide` to a
`held` would have made its two body paragraphs the italic caption in
"In the piece" on `land-b`'s image page (reviewer, sign-off). A
pre-existing latent defect, masked until now because no fixture's
first reference to an image was a prose-bodied container.

The fix keeps one source of truth: `image-meta.mjs` exports
`BLOCK_BODIES`, the map from block name to body kind (`caption`,
`prose`, `images+caption`, or `none` for leaf-only and reserved
blocks), and the transform's `BLOCKS` table is **asserted against it
by a test** (every descriptor's `body ?? 'none'` equals the map's
entry — `pause` declares `body: 'none'` explicitly, the reserved
`sequence` has no body and reads as `none` — and the two name sets are
equal). The map lives in `image-meta.mjs` rather than the transform
because `image-meta.mjs` must stay Astro-free (the transform imports
`astro/assets/utils`; the registry and the tests import the pure
module), and the transform already imports `image-meta.mjs`, so the
map could be consumed from there too — a later task may do that; the
test guards the drift either way. `passageFor` then reads a caption
from bodies of kind `caption` **and** `images+caption` (a `strip`'s or
`grid`'s caption line stays the passage's caption, as the existing
tests assert); a `prose`-bodied one contributes no
caption (its body is the piece's own prose, which the image page must
not quote twice); a leaf reference (`::pause`, `::wide`) has no
caption, as today. Tests cover `row`, `aside`, and `held` bodies.
Consequence for the fixtures: `land-b`'s passage becomes its
preceding paragraph alone, and `pano`'s the paragraph before the
pause — the Phase 0 report says so, since a reader of those image
pages sees the difference.

## The CSS (`global.css`, piece-blocks section)

Tokens in `:root`, beside `--tall-max`: `--hold-margin: clamp(1.5rem,
5vmin, 4rem)` (spec decision 5 — the pause's margin, shared),
`--pause-scale: 1.05`, `--pause-stretch: 120svh`. `--color-quiet`
exists (006).

**The hold.** `.piece-held` is a grid of the figure and the prose,
broken out to the content width like `wide` (the piece column is
viewport-centered — the same breakout arithmetic); `side-right` swaps
the columns; `bleed` widens to the viewport and runs the figure to the
edge, the prose keeping its column. The figure is sticky at the hold
margin, `width: 100%`, and its width is capped from its own ratio and
the hold's height:

```css
.piece-held figure {
  position: sticky;
  top: var(--hold-margin);
  width: 100%;
  max-width: calc(
    (100svh - 2 * var(--hold-margin) - 2 * var(--matte)) * var(--ar) + 2 * var(--matte)
  );
}
```

— never from the image's `sizes` (the exploration's trap: a responsive
image with `width: auto` takes its natural width from `sizes`); the
image fills the figure at `width: 100%`. The prose column is
`min(100%, 44ch)` at 1.05rem / 1.85, its first paragraph meeting the
top of the frame, **no trailing air** — the scene ends where the prose
ends, and the space around the block is margin, which a sticky frame
doesn't hold through (spec goal 3). Hence the hold's scroll is exactly
the prose's height beyond the frame's.

**No hold where no column fits.** `@media (orientation: portrait) and
(min-width: 720px)`: `.piece-held.frame-landscape` collapses to one
column with a static, full-width figure and the prose after it;
`frame-portrait` keeps its side. `@media (max-width: 719.98px)`: every
held collapses the same way. The collapsed figure is an ordinary
matted single.

**The pause.** `.piece-pause` is a block `--frame-h + --pause-stretch`
tall with an ordinary block margin (`.piece-block`'s), full width like
`fullbleed`'s breakout; `--frame-w` is the largest frame that fits the
viewport inside `--hold-margin` with room for the approach, from `--ar`
(the exploration's formula, in `vw`/`svh` so it resolves without a
container); `--frame-h` follows from the ratio. `.piece-pause-frame`
is `position: sticky; top: calc((100svh - var(--frame-h)) / 2)`,
matted, `transform: scale(calc(1 + (var(--pause-scale) - 1) *
var(--pause-t)))`. The lights: `html[data-pause-active]` and its `body`
mix their background toward `--color-quiet` by `--pause-lights`
(0–1, set on `<html>` by the script); under the same attribute the
piece's prose, headings, captions, and mats mix the same way, so the
words fade into the dark — **each rule mixing from that element's own
token** (`--color-muted` for `.prose p` and captions, `--color-text`
for headings, `--color-matte` for mats), never from a shared start:
the exploration mixed everything from `--color-text` and got away
with it only because its demo prose was already at text colour; on
the site that rule would snap every paragraph muted → text the
instant a pause activated. At `--pause-lights: 0` every mixed element
must compute to exactly its unmixed colour. Inline links need no rule
of their own: `a` is `color: inherit`, so a link follows its
paragraph. Reduced motion: the approach off, the dim kept.

**Mats.** The matte rule is an explicit list of block selectors, with
a prose comment enumerating the matted and unmatted blocks; both gain `.piece-held figure > :is(a.image-link, img)` and
`.piece-pause-frame > :is(a.image-link, img)` — nothing is matted for
free.

**The header.** `html[data-scene-active] .site-header { transform:
translateY(-100%) }` beside the existing `[data-hidden]` rule: the
header stays away while a pause is active or any frame is held,
whichever way the reader scrolls.

## The script (piece page)

A `<script>` in `src/pages/pieces/[slug].astro`, the exploration's
logic: on `astro:page-load`, collect `.piece-pause` and `.piece-held`;
on every scroll and resize compute each pause's progress through its
pinned stretch (`(park - top) / (height - frameHeight)`, shaped up /
hold / down with a smoothstep over 28 percent ramps) into `--pause-t`
on the scene and the maximum into `--pause-lights` on `<html>`; a hold
is active while its frame is sticky and parked; `data-pause-active`
and `data-scene-active` on `<html>`. Static frames (a collapsed hold)
never count. One rect read per scene per scroll event, no rAF (scroll
events already throttle to frames). The router wipes `<html>`'s
attributes on every swap, so nothing leaks between pages. Without
script: holds unchanged (pure CSS), a pause pins on the light ground.

## Fixtures

- `vocabulary-sampler`: a `held` left at content width (`land-b`, five
  paragraphs), a `held` right with `bleed` (`port-a`, eight paragraphs
  — a full-height vertical needs that many), and a `pause` (`pano`)
  with a paragraph before and after. Sample prose, marked.
- `where-the-fog-lets-go`: the `:::wide{src="./land-b.jpg"}` block
  becomes `:::held{src="./land-b.jpg" alt="…" side="right"}` with a
  **new body of fixture prose long enough to outlast the frame at the
  laptop viewport** — five paragraphs, the sampler's calibration for
  the same shape — absorbing the wide's caption line ("The ten minutes. Ridgeline out, ocean still
  undecided.") — the one paragraph that follows the block today ends
  in the colon that introduces the diptych, so it must stay where it
  is, and one paragraph beside a frame would not outlast it (nothing
  would hold, which defeats decision 3's reason for the fixture); the `:::strip` of the
  panorama becomes `::pause{src="./pano.jpg" alt="…"}` with its caption
  line as the paragraph after (spec decision 3). Its sidecar and
  galleries are unaffected (same files, same ids).

## Testing strategy

- Vocabulary suite (`remark-pieces-vocabulary.test.mjs`): `held` —
  container renders the wrapper with `piece-held`, `side-left`,
  `frame-landscape` (photo.jpg is 8×5, ratio 1.6 — the suite's `2.4`
  is the diptych's normalized value) and `--ar: 1.6` on the wrapper, the figure's anchor to the image page, `piece-held-prose`
  around the body; `side="right"` and `{bleed}` classes;
  `portrait.jpg` gives `frame-portrait` and a new square fixture
  (`tests/fixtures/square.jpg`, from `gen-placeholders.mjs`'s fixtures
  target) gives `frame-landscape` — the documented boundary has a
  test; the leaf form fails; `bleed="x"`
  fails as a flag; `side="up"` fails; an image in the body fails; a
  nested directive fails; a missing `alt` fails; `sizes` per shape.
  `pause` — the leaf renders `figure.piece-pause` with `--ar` and the
  linked image inside `piece-pause-frame`, with `sizes` asserted as an
  exact string on the 8×5 fixture — `(min-aspect-ratio: 8/5) 136vh,
90vw` — so the integer ratio and the 85 × ratio arithmetic fail
  loudly if changed; the container form fails
  naming the rule; `alt=""` keeps the frame unlinked as everywhere.
  Each new test shown to fail with its rule broken.
- `image-meta.test.mjs`: `BLOCK_BODIES` agrees with the transform's
  table (names and body kinds); `passageFor` for a `row`, an `aside`,
  and a `held` body (prose before, no caption) and for a `pause` leaf
  (prose before, no caption), beside the existing caption cases.
- Existing suites unchanged: 173 tests green.
- Build with the fixtures; the post-build barriers.
- Geometry pass at three viewports (1440×900, 1080×1920, 375×812) on
  the sampler, measured as on the exploration: the frame at its
  resting place and its share of the height; the hold's release when
  the prose's bottom meets the frame's; no hold where no column fits;
  the pause's arrival distance, park at the centre, lights 0 → 1 → 0
  and the words' colour with them, the approach, the margin surviving
  it, the header away and back; with reduced motion emulated the
  approach is off and the dim stays; without script the pause pins
  light.

## File structure

```
remark-pieces-blocks.mjs          held, pause; rawAr, classes(attrs, ratios),
                                  attrs.flags, rejectBodyImages, proseClass;
                                  BLOCKS exported for the agreement test
src/styles/global.css             tokens; .piece-held*, .piece-pause*, the
                                  lights, the header rule, the collapses
src/pages/pieces/[slug].astro     the scenes script
src/content/pieces/vocabulary-sampler/index.md
src/content/pieces/where-the-fog-lets-go/index.md
remark-pieces-vocabulary.test.mjs, image-meta.test.mjs
src/lib/image-meta.mjs            BLOCK_BODIES; passageFor by body kind
scripts/gen-placeholders.mjs      tests/fixtures/square.jpg
obsidian-plugin/main.ts           pause: one (the leaf list)
AUTHORING.md, README.md, DECISIONS.md, ROADMAP.md
src/pages/held-demo.astro         deleted at close-out (with explore/held-block)
```

## Known limitations

- The hold's height uses `100svh` — on a phone browser whose chrome
  hides, the small viewport height is the safe choice (nothing is held
  on phones anyway).
- `orientation: portrait` is the viewport's, not the device's; a
  narrow window on a landscape monitor behaves as a portrait one.
  Correct: it is the space that matters.
- One frame per hold, one per pause; the showcase spec may generalize.
- The lights mix the colours of the elements the rules name (`.prose`
  text, headings, captions, mats); a piece element outside that list
  would stay light on a dark ground. The sampler is the check.
- A `held` or `pause` written inside a sidecar story (the image page
  renders the story through the same pipeline) gets the CSS but not
  the script, and the breakout arithmetic assumes the piece page's
  viewport-centred column — the same standing limitation `wide` and
  `fullbleed` have there. Not addressed here; `AUTHORING.md` says a
  story is prose.

## Resolved decisions

- **Script-driven pause, CSS-only holds.** Spec; the exploration's
  reason (Safari before 26, older Firefox).
- **Frames sized by ratio, never by `sizes`.** The exploration's trap.
- **Margins, not padding, around scenes**, so holds end with the last
  line.
- **The hold's top margin is the pause's** (`--hold-margin`, about
  5vmin), per spec decision 5 — the exploration ran at a smaller
  `clamp(0.75rem, 2vh, 1.25rem)`, so T506's measurements are judged
  against the spec's rule, not the exploration's numbers.
- **`passageFor` learns body kinds** (above) — a 006 correction this
  spec's fixtures forced into the open.
- **No hold where no column fits**; orientation classes from the
  transform, no script.
- **The pause's words fade with the lights**, rather than staying dark
  on a dark ground.
