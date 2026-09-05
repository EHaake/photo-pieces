# Plan: The Held Image and the Pause

**Status**: Implemented (2026-09-05) — signed off by the skeptical-reviewer
2026-09-03 (sixth pass), amended and re-signed at the visual gate
2026-09-04 (four passes)
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
  `div.piece-block.piece-pause` with `--ar` on it, holding a
  `div.piece-pause-stage` with the paragraph before the directive
  (when it is a plain paragraph), the matted, linked image inside a
  `div.piece-pause-frame`, and the paragraph after (likewise) — the
  stage is what pins, so the words stay anchored to the frame (visual
  gate, decision 7). The wrapper is a `div`, not a `figure`, once
  the piece's own prose lives inside it.
- **CSS**: the hold (sticky figure sized from `--ar` and the hold
  height, the prose column beside it, side and bleed variants,
  orientation and phone collapses to a static figure), the pause (a
  scene taller than its frame by the pinned stretch, the frame pinned
  at the centre, ground and words mixing toward `--color-quiet` by
  `--pause-lights`, the approach), the header rule, and the knobs as
  tokens (three at the spec gate, `--pause-depth` from the visual gate,
  and `--block-margin` / `--para-gap` folded in at T504a).
- **Script** (`src/pages/pieces/[slug].astro`): the pause's progress
  and the "held" state, as on the exploration.
- **`sequence`** stays reserved; `row` is untouched, and `aside` only
  marks the prose it unwraps (T501a) so a pause leaves it alone.

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
58vw, 94vw` (measured at T504 on the grid as drawn: the frame's
  column is 643px at 1440×900 — 1.4 of 2.4 shares of the content width
  less the gap — so the 670px hint over-delivers by 4% and is kept, a
  hint must never fall under; the 58vw band over-delivers the same
  way); with `bleed` — `(min-width: 720px) 50vw, 94vw`; and for a
  **landscape frame** either string is prefixed with
  `(orientation: portrait) and (min-width: 720px) 96vw` — the collapse
  (below) renders it at the content width there, and without the
  prefix the hint fell 40% under at 1080×1920 (T504 review; a portrait
  frame keeps its column, so its hint has no prefix). `pause` — from
  the ratio the probe already produced, as `strip` does, written as
  the frame's geometry in the viewport: the margin is `5vmin` (the
  clamp's middle band: below its floor the real margin is larger and
  the hint over-delivers; above its cap — vmin past 1280px — the real
  margin is smaller and the hint falls under, 0.66% at 2560×1440 and
  about 2.4% at 3840×2160, inside Astro's width ladder), not a share
  of the limiting dimension, so the hint is a `calc()`:
  `(min-aspect-ratio: <width>/<height>) calc(<95.238 × ratio>vh − <9.524 × ratio>vmin), calc(95.24vw − 9.52vmin)`
  — `(100vh − 10vmin) ÷ 1.05 × ratio` where the height limits the frame,
  `(100vw − 10vmin) ÷ 1.05` where the width does — with the positive
  coefficient rounded up and the subtracted one down, so the hint
  never falls under (the earlier `<ceil(85.7 × ratio)>vh, 86vw` pair
  treated the margin as a share and fell 3.7% under at the measured
  1440×900 — T504 review; the height branch ignores the mat's two
  edges — the true width is `2 × --matte × (1 − ratio)` less — which
  over-delivers for a landscape frame and falls under by that much for
  a portrait one, 2.1% at 2:3 on 1440×900, accepted: a pause is for
  the wide frame).
  The condition is written as the frame's **raw pixel dimensions** (a
  decimal ratio is legal in CSS Values 4 but not everywhere it should
  be, and an unparseable condition fails silently; raw pixels need no
  reduction and can't be wrong). The exact-string tests pin both
  strings.
  The hint uses `vh` where the CSS uses `svh`; a token change leaves
  the hint stale but safe, since the layout never sizes from it. This needs the probe to expose dimensions: `probeRatios`
  becomes `probeDimensions`, returning each image's orientation-
  corrected `{ width, height }`; the existing call site derives the
  ratios from it, and `sizing(attrs, i, ratios, dims)` gains the
  dimensions as a fourth argument that existing blocks ignore.
  These are hints for the srcset choice only: the layout never sizes
  from them (see the CSS).
- **`--ar` in two places, deliberately.** The wrapper's copy is what
  the new CSS reads; the anchor keeps its copy because every linked
  image on the site carries the same shape (the match-height rules
  read it there), and both come from the one probe — no second
  computation to drift.
- **The pause's stage (T501a, from the visual gate).** After the
  frame is built, the transform looks at the directive's siblings in
  the parent: a previous sibling that is an mdast `paragraph` with no
  `image` descendant, no `directiveLabel`, and not marked as unwrapped
  prose is moved into the stage before the frame with class
  `piece-pause-before`; a next sibling that qualifies the same way is
  moved after it with `piece-pause-after`; the wrapper gains
  `with-before` / `with-after` so the CSS can set the scene's outer
  margins. Headings, lists, images, other blocks, and directives stay
  where they are — then the stage is just the frame. Two edge cases
  are pinned by tests: two pauses with one paragraph between them (the
  first, in document order, claims it as its after-paragraph; the
  second finds a directive beside it and takes nothing), and a pause
  right after an `:::aside`, whose unwrapped body paragraphs are
  spliced into the parent as plain paragraphs before the pause is
  processed — the unwrap now marks them (`data.pieceUnwrapped`), and
  the pause leaves them, so what it anchors is always the piece's own
  paragraph — the same exclusion `passageFor` makes (it reads the
  markdown source and skips containers; after an aside it reaches
  further back to an earlier paragraph, while the stage anchors
  nothing before). The moved paragraphs are ordinary
  mdast nodes, so their inline links, emphasis, and shorthand handling
  are untouched. `BLOCK_BODIES` is unchanged: the pause has no body;
  the neighbours are the piece's, not the block's.
- **`probeDimensions`' failure messages** name the block that asked
  (`held`, `pause`, `strip` — which used to blame `match="height"` —
  or `match="height"` for the pairs, declared on the descriptor as
  `probeAsker`), not the attribute a `held` author never wrote.

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
`min(100%, 44ch)` at 1.05rem / 1.85, its first paragraph starting at
the top of the frame (a small optical offset below its edge — the
exploration's value, which the visual gate confirms — and no paragraph
margin), **no trailing air** — the scene ends where the prose
ends, and the space around the block is margin, which a sticky frame
doesn't hold through (spec goal 3). Hence the hold's scroll is exactly
the prose's height beyond the frame's.

**No hold where no column fits.** `@media (orientation: portrait) and
(min-width: 720px)`: `.piece-held.frame-landscape` collapses to one
column with a static, full-width figure and the prose after it;
`frame-portrait` keeps its side. `@media (max-width: 719.98px)`: every
held collapses the same way — both resets name `side-right`'s figure
explicitly, since its `order: 2` (0,2,1) out-specifies a bare reset
and would put the words before the frame (T504 review; the row's
collapse does the same). The collapsed figure is an ordinary matted
single, the words after it.

**The pause.** `.piece-pause` is a block at the column's width with
`.piece-block`'s margin, its height by layout: the stage, then a
`::after` pseudo-element `--pause-stretch` tall — so the scene is
always stage + stretch whatever the stage measures (the T501a
sign-off: a height computed from a measured stage went stale when the
body font swapped in). Only the frame breaks out: `--frame-w` is the
largest frame that fits the viewport inside `--hold-margin` with room
for the approach, from `--ar` (the exploration's formula, in
`vw`/`svh`); `--frame-h` follows; the frame is `width: var(--frame-w);
margin-inline: calc(50% - var(--frame-w) / 2)` like `width-wide`'s
breakout, centred on the viewport-centred column. **The stage (T504a,
visual gate decision 7)**: `.piece-pause-stage` is `position: sticky;
display: flow-root` (sticky makes no block formatting context, so
without it the stage's last child's bottom margin would collapse out
of the stage and into the scene, lengthening the sticky range — the
sign-off's catch); `top: calc((100svh - var(--stage-h, var(--frame-h))) / 2)` — the
script keeps `--stage-h` on the scene equal to the stage's measured
height (a `ResizeObserver` on the stage, so a font swap or a re-wrap
updates it; the value feeds the centring only, never a height, so
there is no feedback loop); without script the fallback centres the
frame's height, which parks the stage low by half the difference
between the stage's height and the frame's — an estimate, a couple of
hundred pixels at the laptop for the sampler, measured nowhere — the
light pin's tolerance. The anchored paragraphs are plain column
paragraphs: no width of their own (they never leave the column); inside
the stage the paragraph's `1em` gap collapses into the frame's block
margin, so the frame sits a block margin from its words.
The scene's outer margin follows the same rule: on a side where a
paragraph rides (`with-before` / `with-after`) the scene's margin is
the paragraph gap, so paragraph N → anchored paragraph reads as two
paragraphs; where the stage is the frame alone it is the block
margin. `.piece-pause-frame` is a plain matted block, centred,
`transform: scale(calc(1 + (var(--pause-scale) - 1) * var(--pause-t)))`
— the approach is the frame's alone; the words do not scale. The
lights: `html[data-pause-active]` and its `body` mix their background
toward `--color-quiet` by `--pause-lights × --pause-depth`
(`--pause-depth: 0.85`, a token beside the other three — visual gate
decision 8: the ground goes to a dark grey, oklch L 0.315 from the
page's 0.968, not to the quiet ground's 0.2); under the same
attribute the piece's prose, headings, captions, the page head, and
the footer mix **all the way** toward `--color-quiet` by
`--pause-lights` alone — the words reach L 0.2 and sit a shade darker
than the 0.315 ground (about 1.4:1), faintly there; one knob means
"how dark is the ground" (the sign-off's arithmetic: scaling the
words' mix by the same depth would have moved them toward the ground,
0.245 on 0.315, not away from it) — **each rule mixing from that
element's own token** (`--color-muted` for `.prose p` and captions,
`--color-text` for headings), never from a shared start. **The mats
do not mix** (decision 9: "the matte goes away") — the matte rule
reads `--color-matte` plainly again and `--matte-fill` is gone, the
hold's mat included (it only ever mixed while a pause was active on
the same screen, and the reason applies to any mat on the dark
ground); a white mat on the dark grey is what quiet view already
does. Before the gate the rule was:
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
pinned stretch (`(park - top) / (height - stageHeight)`, the stage
being the pinned element since T505c — its measured height kept on
the scene as `--stage-h` by a `ResizeObserver` per stage, so a font
swap or a re-wrap re-centres it (the value feeds the centring only); shaped up / hold / down with a smoothstep
over 28 percent ramps) into `--pause-t` on the scene and the maximum
into `--pause-lights` on `<html>`; a hold
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
  with a paragraph before and after — the one after carrying an inline
  link, and a heading following it, so the lights list's standing
  limitation has something to check. Sample prose, marked.
- `where-the-fog-lets-go`: the `:::wide{src="./land-b.jpg"}` block
  becomes `:::held{src="./land-b.jpg" alt="…" side="right"}` with a
  **new body of fixture prose long enough to outlast the frame at the
  laptop viewport** — five paragraphs, the sampler's calibration for
  the same shape — absorbing the wide's caption line ("The ten minutes. Ridgeline out, ocean still
  undecided.") — the one paragraph that follows the block today ends
  in the colon that introduces the diptych, so it must stay where it
  is, and one paragraph beside a frame would not outlast it (nothing
  would hold, which defeats decision 3's reason for the fixture); the `:::strip` of the
  panorama becomes `::pause{src="./pano.jpg" alt="…"}` with a new
  paragraph after it, in addition to the existing "By ten the light…"
  paragraph — not the strip's "Drag sideways" line, which is false of
  a pause (spec decision 3). The fog's hold is measured at T504, once
  the CSS exists. Its sidecar and
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
  `pause` — the leaf renders `div.piece-pause` with `--ar`, a
  `piece-pause-stage`, and the linked image inside `piece-pause-frame`;
  a plain paragraph before and after the directive are moved into the
  stage as `p.piece-pause-before` / `p.piece-pause-after` with their
  inline markup intact, and a heading, a list, an image paragraph, or
  another block beside it stays outside (T501a); with `sizes` asserted as an
  exact string on photo.jpg — which is literally 8 × 5 pixels, so the
  raw-dimension condition reads `(min-aspect-ratio: 8/5) calc(152.39vh - 15.23vmin), calc(95.24vw - 9.52vmin)`
  — so the dimension form and the geometry arithmetic fail loudly if
  changed; the container form fails
  naming the rule; `alt=""` keeps the frame unlinked as everywhere.
  Each new test shown to fail with its rule broken.
- `image-meta.test.mjs`: `BLOCK_BODIES` agrees with the transform's
  table (names and body kinds); `passageFor` for a `row`, an `aside`,
  and a `held` body (prose before, no caption) and for a `pause` leaf
  (prose before, no caption), beside the existing caption cases.
- `pause-shape.test.mjs`: the script's one piece of pure logic, the
  0 → 1 → 0 shape with 28-percent smoothstep ramps, lives in
  `src/lib/pause-shape.ts` so it can have a test — the ends, the held
  middle, half-way at half a ramp, smooth not linear, monotone on each
  ramp (T505a, from the T505 review). The rest of the script is
  measurement, verified in the browser.
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
src/content/galleries/fog-frames.md   a stale description (T509)
remark-pieces-vocabulary.test.mjs, image-meta.test.mjs, pause-shape.test.mjs
src/lib/pause-shape.ts            shape(): the pause's 0 → 1 → 0 with 28% ramps (T505a)
                                  (visual gate: the stage in the transform, --pause-depth
                                  and the stage rules in the CSS, --stage-h in the script)
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
- The pause's stage is the frame plus up to two paragraphs; the frame
  still sizes itself to the viewport inside the margin, so a tall
  pause frame on a short viewport can push an anchored paragraph
  partly off-screen while pinned. A pause is for the wide frame; the
  fixtures' panoramas leave room at all three viewports (measured at
  T508a, after the sampler's anchored intro was written: stages of 794
  and 654px in 900, 672 and 532 in 1920, 714 and 406 in 812 — the
  sampler's is the larger, and an earlier draft of its intro put it at
  826 in 812, so the anchored paragraph's length is part of the
  fixture's calibration; the T504a review's arithmetic for a 3:2
  frame, 1035px in 900, is the case this limitation names).
- A pause needs about half a screen of content after it: the sticky
  stage releases only when the scene's bottom reaches the stage's
  bottom, which needs `(100svh − stage) / 2` of document below the
  scene. A pause within that distance of the piece's end cannot finish
  on a tall viewport — the page ends with the lights part-way up
  (T506b: the sampler's, on the portrait desktop). An authoring rule,
  not a mechanism: `AUTHORING.md` says leave words after a pause.
- The lights mix the colours of the elements the rules name (`.prose`
  text, headings, captions, the piece's page head, the footer's
  text, links, and hairlines — not the mats, since the spec's visual-gate decision 9); an element outside that list would
  stay light on a dark ground — or, at text colour, vanish into it.
  The sampler is the check, and T506 looks at the footer and the head
  specifically.
- While a scene is active the header's `data-scene-active` rule
  out-specifies its `data-hidden` rule, so the base layout's
  focus-reveal (focus entering the header brings it back) has no
  visible effect: a keyboard user tabbing into the nav mid-pause
  focuses links that are off-screen. The spec asks for the header to
  be away for the whole of a pause; the affordance is overridden
  knowingly (T505 review). T506 looks at it.
- A `held` or `pause` written inside a sidecar story (the image page
  renders the story through the same pipeline) gets the CSS but not
  the script: the script looks only inside the piece's column, so this
  holds however the reader arrived (T505 review). Also, the breakout arithmetic assumes the piece page's
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
  on a dark ground — all the way to the quiet colour, a shade darker
  than the ground, which stops at the depth (decision 8).
- **A collapsed hold keeps the held reading size** (1.05rem / 1.85):
  on a phone, or a landscape frame on a portrait screen, the passage
  reads a little larger than its neighbours rather than changing size
  with the window (T504, recorded at the T506 review; the visual gate
  is where it gets judged).
- **The words anchor to the frame** (visual gate decision 7): the
  paragraph before and after a pause ride in the pinned stage, so the
  reader never sees the words scroll away above or arrive out of an
  empty space below; the transform moves the two neighbouring
  paragraphs into the scene, and only paragraphs — a heading or
  another block stays put.
- **The dark is a depth, not the quiet ground** (decision 8):
  `--pause-depth: 0.85` scales the ground's mix (L 0.968 → 0.315) while
  the words go all the way to the quiet colour (L 0.2), a shade darker
  than the ground and faintly readable — one knob for how dark the
  ground gets; the mats do not mix at all (decision 9), as in quiet
  view.
- **The scene's height is by layout, the centring by measurement**:
  the stage then a `--pause-stretch` pseudo-element, and `--stage-h`
  from a `ResizeObserver` for the sticky `top` only — a measured
  height fed into the scene's height went stale on the font swap
  (sign-off).
