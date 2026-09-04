# Spec: The Held Image and the Pause

**Status**: Approved (product owner, 2026-09-03) — plan.md and tasks.md
follow, signed off by the skeptical-reviewer
**Depends on**: 003 (the block vocabulary; `row` is the precedent for a
container whose body is prose beside an image), 006 (the quiet ground
token, the header's hide-on-scroll, page-level enhancement over the
transform's HTML). The shapes were chosen on the exploration branch
`explore/held-block` (`/held-demo/`, 2026-09-02/03).

## Summary

Two new treatments in the closed vocabulary, both about pacing rather
than layout — a vocabulary for time, which the site did not have:

- **`held`** — a photograph that stays fixed in the viewport while the
  paragraphs written for it pass beside it or beneath it, never over
  it, and lets go the moment the words are spent. The hold lasts
  exactly as long as the writing outlasts the frame: no timer, no
  script, plain sticky positioning. Two shapes: beside at the content
  width (the frame left or right), and beside and bled to the viewport
  edge. Where no column can sit beside the frame there is no hold —
  the frame is an ordinary figure and the words follow it (the "words
  passing under a parked frame" shape was tried and dropped: on a
  portrait desktop it "looks wrong" — photographer, 2026-09-03).
- **`pause`** — for the frame too wide to hold beside words. The
  photograph arrives in the flow right after the words, as any figure
  does; when it reaches the centre of the screen it stops, and as the
  reader keeps scrolling the lights go down — the whole page, the
  words on it fading into the dark — and the frame comes a little
  closer; it holds; then the lights come back up, it settles, and the
  page moves on. Nothing to read for a moment, only the photograph.
  The header stays away for the whole of it, whichever way the reader
  scrolls.

The photographer kept both from the exploration ("honestly I love
it"), asked for the margin and the header behaviour, and judged the
pause's scroll length "a tiny bit too much" — a knob this spec sets
shorter.

## Goals

1. **Authored in Obsidian like every block.** A held image is a
   container directive whose body is the prose that passes beside it:

   ```markdown
   :::held{src="./land-b.jpg" alt="The ridgeline emerging" side="right"}
   The paragraphs that pass beside the frame.

   As many as the frame deserves.
   :::
   ```

   with `side="left"` (default) or `"right"`, and a `bleed` flag that
   runs the frame to the viewport edge. A pause is a leaf directive:

   ```markdown
   ::pause{src="./pano.jpg" alt="The full sweep of coastline"}
   ```

2. **Words never cover the photograph.** Beside or beneath, in a
   column narrow enough to read down rather than across.
3. **The hold is the writing's length — exactly.** The frame lets go
   as the last line passes beside it, never after (no trailing air in
   the column, none in the scene: photographer, 2026-09-03, "the text
   keeps scrolling up for a while" past the frame). A tall vertical
   beside three short paragraphs never holds; that is the block's
   honesty, and `AUTHORING.md` says so plainly rather than the site
   padding the hold out.
4. **The pause needs no words and no timer.** Its progress is the
   reader's own scrolling through the scene; a small page-level script
   turns that into the dim and the approach (constitution: interactive
   blocks are enhancement over the transform's HTML). Without script
   the frame still pins, on the light ground.
5. **The chrome stays out of the way.** During a pause, and while a
   below-hold is parked, the header does not return on a scroll back
   up.
6. **Everything an image gets elsewhere.** Mats, a link to the image's
   page, responsive sizes per shape, alt text, the registry's rules.
7. **Graceful everywhere.** Where no column fits beside the frame — a
   landscape frame on a portrait viewport, anything on a phone — the
   block renders as an ordinary figure followed by its words, and
   nothing is held; reduced motion keeps the pause's dim and drops
   the approach; the vocabulary stays closed and the Obsidian plugin's
   approximation stands.

## Non-goals

- **Text over images**, in any shape, ever.
- **Timed or automatic motion.** Nothing moves unless the reader
  scrolls; nothing plays.
- **The slow view** (`ROADMAP.md`) — a whole piece or gallery frame by
  frame is its own thing; this spec is two blocks inside a piece.
- **The `sequence` block** stays reserved; the processing showcase is
  its own spec.
- **A held pair or triptych.** One frame per hold.
- **Tuning attributes** beyond `side` and `bleed`: the margin, the
  approach, the pause's length are site knobs, not per-block choices,
  so every pause on the site reads the same.
- **A caption during a pause.** The pause is the one moment with
  nothing to read. (Open question 2 asks about a caption after.)

## Entities

- **`held`** — container form only (its body is the point). Attributes:
  `src`, `alt` (required); `side` in `left | right` (default `left`);
  `bleed` (flag). Body: prose paragraphs only — a directive or an
  image in the body fails the build, as nesting does everywhere.
- **`pause`** — leaf form only (a body would be words during the
  pause, which there are none of; the container form fails saying
  so). Attributes: `src`, `alt` (required).
- **Site knobs** (CSS tokens or one module, not attributes): the hold's
  margin from the top edge (the pause's margin, decision 5); the held column's measure; the pause's
  margin (about five percent of the smaller screen dimension), its
  approach (five percent), its ramps (the first and last 28 percent of
  the pinned stretch), its ground (`--color-quiet`), and its length
  (the pinned scroll distance — shorter than the exploration's, see
  Design requirements).

## Key user flows

### Reading a held image

The reader scrolls into a held scene. The frame reaches its resting
place below the header and stays there while the paragraphs beside or
beneath it pass. When the last paragraph has passed, the frame travels
away with the end of the scene and the piece resumes its ordinary
rhythm. Scrolling back up reverses it exactly.

### Reading a pause

The reader scrolls into a pause. The photograph arrives below the last
paragraph as any figure does, with no empty stage between them, and
travels up until it sits centred in the screen; there it stops. As the
reader keeps scrolling, the whole page darkens — the words above fade
into the dark with it — and the frame comes closer; it holds; then the
page lightens and the frame settles; then it releases and the next
paragraph arrives. The header is away for the whole of it. Escape does
nothing here — it is not a mode, only a scene.

### Writing

In Obsidian, the photographer writes `:::held{…}` with the paragraphs
inside, or `::pause{…}` on its own line, as with every block. Live
Preview shows the container as raw text (the accepted approximation
for container forms) and may render the pause leaf as an image, as it
does the other leaf blocks. The dev server shows the real thing.

## Design requirements

- **Held, beside**: the frame in a column about three-fifths of the
  content width, matted, its top resting a small margin below the top edge (the header is
  away while it is held); the prose in a column of about 44 characters at a slightly
  larger reading size, its first paragraph meeting the top of the
  frame. `side` chooses the frame's side. `bleed` runs the frame to
  the viewport edge, the prose keeping its column on the other side —
  the most immersive shape.
- **Orientation, not width alone** (photographer, 2026-09-03: "the
  designs really depend on the format"; a 16:10 laptop and a portrait
  desktop each flattered the other's frames). Three rules, verified on
  the exploration at 1440×900, 1080×1920, and 375×812:
  1. A held frame rests a small margin from the top edge and may use
     the whole height; the header stays away while any frame is held,
     as during a pause. A portrait frame on a landscape screen is as
     large as that screen allows — and its hold is only as long as the
     words outlast it, which at full height is many words.
  2. A hold exists only where a column can sit beside the frame. On a
     portrait viewport wider than a phone a landscape frame is not
     held — it renders as an ordinary figure at the full width with
     its words after it — while a portrait frame keeps its side, the
     height being plentiful; on a phone nothing is held. The
     transform marks each frame's orientation from the image's
     dimensions; no script.
  3. The geometry pass runs at three viewports — a 16:10 laptop, a
     phone, and a portrait desktop — as a standing check.
- **The frame's size is the layout's decision**, from the frame's own
  ratio and the height available to it, never from the image's
  responsive `sizes` hint (found on the exploration: with `width:
auto` a responsive image takes its natural width from `sizes`, and a
  3:2 was sized to a hint rather than the space). The image fills the
  figure; the mat hugs it exactly.
- **The pause**: the frame in the flow with an ordinary figure's
  margin to the words before and after it — no empty stage; the
  largest frame that fits the viewport inside a margin of about 5vmin,
  with room reserved so the approach never eats it; it pins at the
  centre of the viewport, and the scene is taller than the frame by
  the pinned stretch; the approach is five percent; the lights — the
  whole page's ground, and the words on it — go from the page ground
  to `--color-quiet` over the first 28 percent of the pinned stretch,
  hold, and return over the last 28 percent, on a smooth curve; the
  header stays away for the pinned stretch. The pinned stretch is **1.2 screens of
  scroll** (the exploration's 1.6 read as slightly too much; the
  exploration now runs at 1.2 for the photographer to confirm); a site
  knob, judged at the visual gate.
- **Reduced motion**: the pause keeps its dim and drops the approach;
  the holds are unchanged (nothing animates in them).
- **Without script**: a pause pins on the light ground with no dim and
  no approach; the holds are pure CSS and unaffected.
- **Mats, links, sizes**: as every block — the mat on the anchor, the
  anchor to the image's page, `sizes` matched to each shape's width.
- **The exploration page is deleted** when the real blocks exist.

## Authoring requirements

- `AUTHORING.md` documents both directives, the shapes, the honesty of
  the hold's length (write enough for the frame, or don't hold it),
  and the pause's "nothing to read" rule.
- `README.md`'s vocabulary table gains both rows.
- The Obsidian plugin renders the `pause` leaf as an image if the
  change is small; the `held` container stays raw text like the other
  containers (the accepted approximation, `DECISIONS.md`).
- Fixtures: the vocabulary sampler piece gains one of each shape and a
  pause; the fog piece gains one held image and turns its panorama
  strip into a pause, so a real reading rhythm can be judged.

## Acceptance criteria

- [ ] `held` and `pause` are in the transform's descriptor table; the
      vocabulary suite covers both: every allowed combination (`held`
      with `side` left or right, each with and without `bleed`; the
      `pause`), and each that is not (`held` leaf form, `pause`
      container form, `side="up"`, `bleed` with a value, an image or a
      directive in a held body, a missing `alt`), each failing with
      file and line and a message naming the rule
- [ ] The transform's HTML for a held image is a figure with the frame
      and the prose as siblings carrying the shape classes; for a
      pause a figure with a stage and the frame; both images linked to
      their pages with the mat on the anchor and `--ar` where the CSS
      needs it; `sizes` per shape
- [ ] The holds are pure CSS: in the browser the frame's top stays at
      its resting offset while the prose passes (measured at several
      scroll positions) and travels away at the scene's end; a frame
      taller than its prose does not hold; where no column fits (a
      landscape frame on a portrait viewport, anything on a phone) the
      frame is static at the full width with its words after it
- [ ] The pause arrives an ordinary figure's margin below the last
      paragraph and pins at the centre; with script the page's ground
      and the words compute to `--color-quiet` and the frame to the
      approach at the middle of the pinned stretch, and to the page
      ground and scale 1 at both ends; the margin survives the
      approach; the header stays translated away on a scroll back up
      within the scene and returns outside it, and the same while any
      frame is held; without script the frame pins on the light
      ground; reduced motion drops the approach only
- [ ] The pinned stretch is the site knob's value (about 1.2 screens)
      and is judged at the visual gate
- [ ] At each of the three viewports (16:10 laptop, phone, portrait
      desktop) every hold shape and the pause are measured: the frame
      at its resting place, its share of the height, the shape chosen
      by orientation, the park line, the header away while held
- [ ] Every 003 and 006 geometry check still holds; 173 tests green
      plus the new ones; build green with the post-build barriers
- [ ] Fixtures render in the sampler and the fog piece; the exploration
      page and branch are gone; `AUTHORING.md`, `README.md`, and
      `DECISIONS.md` updated

## Resolved decisions

- **Kept from the exploration** (photographer, 2026-09-03): all three
  held shapes and the pause; the margin; the header away during a
  pause.
- **The pause is script-driven, one mechanism everywhere.** CSS
  scroll-driven animations would need no script but are absent in
  Safari before 26 and older Firefox, and the photographer's own
  browser scrolled straight past the first cut; one mechanism that
  works everywhere rather than two that drift. The pin itself is
  always CSS.
- **Words beside or beneath, never over** — the photographer's
  condition when the idea was first raised.
- **The hold's length is the writing's.** No minimum, no padding out.
- **Site knobs, not attributes**, for margin, approach, ramps, ground,
  and length: every pause reads the same.

## Resolved at the spec gate (product owner, 2026-09-03)

1. **Names**: `held` and `pause`.
2. **No caption on a pause.** The words before and after it are the
   ordinary paragraphs.
3. **Fixtures**: Claude's call ("not every piece or pano needs it").
   The vocabulary sampler gets both hold shapes and a pause; the fog
   piece turns its wide ridgeline frame into a held image and its
   panorama strip into a pause, so a real reading rhythm exists.
4. **The pause's length**: 1.2 screens of pinned scroll.
5. **A held frame keeps a margin.** Not the full screen: the hold's
   top and bottom margin is the pause's margin, about 5vmin, so the
   two blocks share one sense of air.
6. **No hold where no column fits.** A landscape frame on a portrait
   viewport, and everything on a phone, renders as an ordinary figure
   with its words after it.
