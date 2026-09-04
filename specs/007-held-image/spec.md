# Spec: The Held Image and the Pause

**Status**: Draft — for photographer review (spec gate)
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
  script, plain sticky positioning. Three shapes: beside at the
  content width (the frame left or right), beside and bled to the
  viewport edge, and below (the frame holds the top of the screen, the
  words pass under it — the shape for wide frames and every shape on a
  narrow screen).
- **`pause`** — for the frame too wide to hold beside words. The page
  stops: the photograph pins centered with a margin around it, comes a
  little closer, and the lights go down to the quiet ground; it holds;
  then the lights come back up, it settles, and the page moves on.
  Nothing to read for a moment, only the photograph. The header stays
  away for the whole of it, whichever way the reader scrolls.

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

   with `side="left"` (default), `"right"`, or `"below"`, and a
   `bleed` flag for the beside shapes that runs the frame to the
   viewport edge. A pause is a leaf directive:

   ```markdown
   ::pause{src="./pano.jpg" alt="The full sweep of coastline"}
   ```

2. **Words never cover the photograph.** Beside or beneath, in a
   column narrow enough to read down rather than across.
3. **The hold is the writing's length.** A tall vertical beside three
   short paragraphs never holds; that is the block's honesty, and
   `AUTHORING.md` says so plainly rather than the site padding the
   hold out.
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
7. **Graceful everywhere.** Narrow screens collapse every held shape to
   below with the frame under half the height; reduced motion keeps
   the pause's dim and drops the approach; the vocabulary stays closed
   and the Obsidian plugin's approximation stands.

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
  `src`, `alt` (required); `side` in `left | right | below` (default
  `left`); `bleed` (flag; only with `left` or `right`; a `below` hold
  with `bleed` fails naming the rule). Body: prose paragraphs only —
  a directive or an image in the body fails the build, as nesting
  does everywhere.
- **`pause`** — leaf form only (a body would be words during the
  pause, which there are none of; the container form fails saying
  so). Attributes: `src`, `alt` (required).
- **Site knobs** (CSS tokens or one module, not attributes): the hold's
  top offset below the header; the held column's measure; the pause's
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

The reader scrolls into a pause. The photograph reaches the top of the
screen and pins, centered, with a margin around it. As the reader keeps
scrolling, the ground darkens and the frame comes closer; it holds;
then the ground lightens and the frame settles; then the scene
releases and the piece goes on. The header is away for the whole of
it. Escape does nothing here — it is not a mode, only a scene.

### Writing

In Obsidian, the photographer writes `:::held{…}` with the paragraphs
inside, or `::pause{…}` on its own line, as with every block. Live
Preview shows the container as raw text (the accepted approximation
for container forms) and may render the pause leaf as an image, as it
does the other leaf blocks. The dev server shows the real thing.

## Design requirements

- **Held, beside**: the frame in a column about three-fifths of the
  content width, matted, its top resting a little below the header's
  height; the prose in a column of about 44 characters at a slightly
  larger reading size, its first paragraph meeting the top of the
  frame. `side` chooses the frame's side. `bleed` runs the frame to
  the viewport edge, the prose keeping its column on the other side —
  the most immersive shape.
- **Held, below**: one column; the frame parks just under the top
  edge of the viewport at under half its height (the exploration's
  centered park left too little room beneath — photographer,
  2026-09-03), and while it is parked the header stays away so the
  frame can sit that high; the prose gets the rest of the screen
  beneath it.
- **Narrow screens**: every held shape becomes below, parked the same
  way, the words beneath.
- **The pause**: a scene tall enough to scroll through with a stage
  pinned to the viewport; a margin of about 5vmin around the frame,
  with room reserved so the approach never eats it; the approach is
  five percent; the lights go from the page ground to `--color-quiet`
  over the first 28 percent of the pinned stretch, hold, and return
  over the last 28 percent, on a smooth curve; the header stays away
  for the pinned stretch. The pinned stretch is **1.2 screens of
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
      vocabulary suite covers both: every attribute combination that
      is allowed, and each that is not (`held` leaf form, `pause`
      container form, `side="below"` with `bleed`, an image or a
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
      taller than its prose does not hold; narrow screens collapse to
      below with the frame under half the height
- [ ] The pause pins with the margin; with script the ground computes
      to `--color-quiet` and the frame to the approach at the middle
      of the pinned stretch, and to the page ground and scale 1 at
      both ends; the margin survives the approach; the header stays
      translated away on a scroll back up within the scene and
      returns outside it, and the same while a below-hold is parked;
      without script the frame pins on the light ground; reduced
      motion drops the approach only
- [ ] The pinned stretch is the site knob's value (about 1.2 screens)
      and is judged at the visual gate
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

## Open questions

1. **The names.** `held` and `pause` are the working names. `hold`,
   `stay`, or `still` would do as well; the photographer's words win.
2. **A caption after a pause?** The pause itself has no words; the
   ordinary paragraph after it is where the words go in the
   exploration. A caption line under the frame as it releases is
   possible but unproven — recommend no.
3. **Which fog-piece frames.** The spec proposes the wide `land-b` as
   the held image and the panorama strip as the pause; the
   photographer may prefer otherwise.
4. **The pause's length.** About 1.2 screens of scroll is the
   proposal; it is one number, judged at the gate.
