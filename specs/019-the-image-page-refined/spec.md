# Spec: The image page, refined

**Status**: Approved (2026-09-24), **experimental** — see "The tuning
envelope" below: this spec expects to be tuned at its pauses, and says
what may change there without re-planning. Written in the spec
conversation with the product owner, who chose it over the roadmap's
mobile pass and front door: "I'd like to do a mobile pass later once
we have some real content. I'd like to instead focus on expanding and
refining the image detail page."
**Depends on**: 004 (the image registry, the wall label from EXIF, the
sidecar), 006 (the rich image page: the story, "How it was made", the
compare against the camera's frame, the quiet view, the sets and
arrows), 003 and 017 (the block vocabulary and the transform that is
its single source of truth; the stage that hugs its frame), 018 (the
motion grammar every movement here draws from), 008 (what a piece may
place and from where).

## Summary

The image page is the site's signature element, and spec 006 gave it
everything the mock-up showed. Three things about it are now wrong or
thin, and the photographer wants a fourth.

**The gear reads as the camera wrote it.** The wall label prints the
EXIF strings raw: `SONY ILCE-7RM5` for an α7R V, `FE 16-35mm F2.8 GM
II` with no maker, `100-400mm F5-6.3 DG DN OS | Contemporary 020` for a
Sigma, `E 50-400mm F4.5-6.3 A067` for a Tamron, and `RICOH IMAGING
COMPANY, LTD. PENTAX K-1` for a K-1. Across the sixty-four images in
the repo there are four cameras and six lenses, every one of them
misnamed or half-named. This spec adds one small, hand-edited table
that turns each string into the name a reader knows, and a build that
says when it meets a string the table doesn't.

**The compare is one thin line.** Spec 006's raw-to-finished slider is
a divider with nothing to grab, two corner tags, and one way of
looking. The photographer wants a handle, a legend, and a choice of
methods — the slider, the two side by side, and a click that switches
— and he wants to write it where the writing needs it, not only where
the page builds it: "Maybe we should set this up as its own block so
that we can have it rendered easily with simple syntax." So the compare
becomes a **block in the vocabulary**, `compare`, the image page's
section becomes that same block fed from the sidecar, and the block
takes **stages**: not only the camera's frame and the finished
photograph but the steps between, each with a label and a note. This is
the processing showcase's first real step and the answer to the
`sequence` block the content model has reserved since spec 003: an
ordered list of image and label pairs for processing narratives is
exactly what a compare with stages is, so the reservation is retired
by this spec and the vocabulary gains `compare` instead.

**Detail is lost on a screen.** "I shoot with high resolution cameras
and detail gets absolutely lost when viewing the images on a screen."
The page shows a 2560-pixel export at half that or less. This spec
adds a **loupe**: in the quiet view the reader zooms into the
photograph to its full detail and moves around it, and a photograph
may carry a larger private export beside it for the loupe alone,
loaded only when the loupe opens.

**And a real photograph to judge it on.** Every image page so far has
been judged on fixtures and ten gallery exports with no writing. The
photographer will write a real piece in parallel with this spec, with
a photograph's camera frame, its stages and its detail export, and the
last pause is judged on it: "I'll be working on this in parallel to
developing the spec and imagine incorporating it at the end for final
tweaks and modifications."

Everything here is additive and optional per image, as spec 006's
sections are. A photograph with nothing but its file renders the page
it renders today, with better gear names.

## Goals

1. **Gear names a reader knows.** The wall label's camera and lens rows
   print a display name looked up from the EXIF string in a small table
   the photographer (or a session) edits by hand, one line per string.
   A sidecar's own `camera:` or `lens:` still wins over both. Sony
   cameras take Sony's own mark: `Sony α7R IV`, `Sony α7R V`, `Sony
   α7 V`. A string the table doesn't know prints as it does today, and
   the build warns once per distinct unknown string, naming one file
   that carries it, so new gear is noticed at the next build rather than
   on the page. The fixtures' invented strings get entries, so a clean
   build warns about nothing.

2. **The compare is a block, with stages and three methods.** A
   `compare` block, written in a piece or in a sidecar story, shows an
   ordered list of two or more stages of one photograph — each an
   image, a label and a note — and lets the reader look at them three
   ways, choosing on the block itself:
   - **Slider**: one divider with a handle at its centre, wiped across
     the frame; with more than two stages, one sweep passes through
     them in turn, each stop on the track revealing the next stage,
     and the labels sit as the stops.
   - **Side by side**: two neighbouring stages beside each other at
     the same size; the stops choose which two.
   - **Switch**: one stage at a time, filling the frame; a click, a tap
     or a key advances to the next and the label says which is showing.
   A legend names the stages in every method, and the note of the stage
   (or the pair) showing sits beneath the frame. The author's `mode`
   chooses the method the block opens in; the reader's choice holds for
   the visit. Without script the stages stand stacked as plain figures
   with their labels and notes, as spec 006's compare does today.

3. **The image page's compare is the same block, fed by files.** A
   photograph with a camera's frame beside it (`_land-b.jpg`) keeps
   its "Raw to finished" section with nothing declared, as today. A
   sidecar may declare stages between the camera's frame and the
   finished photograph, each a private file beside the photograph
   (`_land-b.tones.jpg`) with a label and a note, and the section shows
   them in order with the finished photograph last. When the sidecar's
   story writes a `compare` block of its own, the page's automatic
   section steps aside rather than showing the photograph twice.

4. **A loupe in the quiet view.** In the quiet view a click or a tap on
   the photograph zooms to full detail at the point touched; drag moves
   around it; a wheel or a pinch zooms between the fit and full detail;
   Escape, or a click at the fit, steps back out as the quiet view does
   today. A photograph may carry a larger private export beside it for
   the loupe (`_land-b.detail.jpg`, at the size the photographer
   chooses); the loupe shows the page's own file scaled while the
   detail export loads, and the detail export fades in when it has
   decoded. The detail export is never a page's image, never in a
   gallery, never in any `srcset`, and is fetched only when the loupe
   opens. A photograph without one still has the loupe, to its own
   file's full size (tunable; see the envelope). Without script there
   is no loupe and the quiet view is what it is today.

5. **Motion answers the reader, still.** Every movement this spec adds
   — the divider following the hand, a mode change, a stage change,
   the zoom in and out, the detail export's fade — reads spec 018's
   tokens and nothing else, and nothing plays by itself. Reduced
   motion keeps the fades and cuts the movement, as spec 018 decided.

6. **The first real piece.** A piece the photographer writes during
   this spec, with a photograph that carries a camera's frame, at least
   one intermediate stage and a detail export, is published on the
   site and is what the last pause is judged on. The invented fixtures
   stay marked as fixtures, as they are.

7. **The vocabulary stays closed and honest.** `compare` is added to the
   constitution's block-vocabulary clause first, in its own commit, and
   the `sequence` reservation is retired there in the same amendment;
   the transform is the single source of truth for the block's shape;
   the site's CSS and the Obsidian plugin mirror it by the existing
   convention. A piece that writes a malformed `compare` fails the build
   naming the piece, as any other block does.

## Non-goals

- **The external image store.** The detail exports make the repo heavier
  per photograph, and the photographer already expects to move images
  out of the repo: "I think moving to an external store will be
  necessary even without this anyways. I plan to have many images."
  That is its own spec; this one commits detail exports beside their
  photographs like every other file, and `ROADMAP.md` notes that the
  day has moved closer.
- **The page's layout beyond the compare.** The story beside the
  photograph on wide screens, a jump line for long pages, and the wall
  label's shape were candidates in this conversation and are left to a
  follow-up roadmap entry, so this spec is judged on the photograph and
  its processing alone. The compare's own width is in scope (Design
  requirements).
- **Gear pages.** The name table is a flat lookup, shaped so that the
  roadmap's gear entry can absorb it later (a gear file "declares the
  strings it answers to"); no page, no link, no slug for gear in this
  spec.
- **A processing piece kind, or the showcase's full design.** A piece
  may already carry as many `compare` blocks as its writing wants; what
  a processing essay looks like as a form is the showcase's to design
  once real ones exist.
- **An interactive compare in Obsidian.** The plugin shows a `compare`
  block's stages as images with their labels in Live Preview, the bar
  the plugin has always set (see the photo, not the raw text); the
  methods, the handle and the loupe are the site's.
- **The mobile pass.** Touch works here where the spec says it does
  (the handle, the switch, the pinch); how the page reads on a phone is
  the roadmap's mobile pass, after real content exists.
- **Zoom on the piece page or in a gallery.** The loupe lives in the
  quiet view of the image page only.
- **Any change to the front door, the galleries, the place wall, the
  stage on paper, the mat rule, the sets or the arrows.**

## Entities

- **Gear name table** — one hand-edited file in the repo, keyed by the
  exact EXIF string (a camera's `Model`, a lens's `LensModel`), giving
  the display name. Two sections, cameras and lenses. The plan places
  the file and the README names it.
- **Stage** — one step of a photograph's processing: a raster, a label
  (a word or two), a note (a sentence or a short paragraph). A stage's
  raster is a **private file** of its photograph:
  `_<basename>.<stage>.<ext>` beside `<basename>.<ext>`, so
  `_land-b.jpg` (the camera's frame, spec 006), `_land-b.tones.jpg` (a
  stage) and `_land-b.detail.jpg` (the loupe's export, below) are all
  one family, all private, none an image of the site.
- **Compare** — an ordered list of two or more stages of one
  photograph, a method (slider, side by side, switch) and the method it
  opens in. In a body it is the `compare` block; on the image page it is
  built from the sidecar's stages, the camera's frame first and the
  finished photograph last.
- **Detail export** — `_<basename>.detail.<ext>`: a larger private
  export of the photograph, for the loupe alone, found automatically
  like the camera's frame. Its size is the photographer's call per
  photograph.
- **The private-file rule, widened.** Today a raster whose name starts
  with `_` is the camera's frame of the photograph with the same
  basename, and nothing else; placing one in a piece fails the build. Now
  a private file is the camera's frame (`_land-b.jpg`), a stage or the
  detail export (`_land-b.<word>.jpg`), and it may be placed in exactly
  one place: as a stage of a `compare` block in its own folder. A private
  file whose photograph does not exist beside it still fails the build
  naming the file; a `_` file placed in any other block, or by any other
  piece, still fails.

## Key user flows

### Reading the label

The reader scrolls to the wall label and reads `Sony α7R V` and `Sony FE
16-35mm f/2.8 GM II` where the camera wrote `SONY ILCE-7RM5` and `FE
16-35mm F2.8 GM II`. Nothing else about the label changes.

### Looking at the processing

Under "Raw to finished" the reader sees the photograph with a divider
and a handle at its centre, and beneath it a legend of stages — Camera,
Tones, Finished — with a note for the stage showing. They drag the
handle across: the camera's flat frame gives way to the toned frame,
then to the finished photograph, the note changing as each stop passes.
They pick "Side by side" from the block's small control and the two
neighbouring stages sit beside each other; they pick "Switch" and one
stage fills the frame, a click advancing to the next. On a phone the
handle follows a finger and a tap switches.

### Looking closer

In the quiet view — photograph alone on the dark ground, matted — the
reader clicks a corner of the frame. The photograph grows to full
detail around that point, the page's own file first, then sharper as
the detail export arrives. They drag to move, pinch or scroll to zoom
in and out, and press Escape (or click once at the fit) to step back to
the quiet view, then again to the page. The arrow keys still step to
the next photograph when the loupe is at the fit.

### Writing a compare in a piece

The photographer, in Obsidian, writes:

```markdown
:::compare{mode="slider"}
![Camera](./_land-b.jpg) Straight out of the camera, flat profile.
![Tones](./_land-b.tones.jpg) Shadows lifted on the ridge, the fog's highlights held.
![Finished](./land-b.jpg) A touch of warmth over the whole frame.
:::
```

One stage per line: the image, its label as the image's text, its note
after it. Live Preview shows the three images with their labels; the
site shows the compare. The same block in a sidecar's story puts the
compare in the writing and the page's automatic section steps aside.

### Declaring stages for the page

Without writing a block, the photographer adds to a photograph's
sidecar:

```yaml
stages:
  - file: _land-b.tones.jpg
    label: Tones
    note: Shadows lifted on the ridge, the fog's highlights held.
```

and drops `_land-b.tones.jpg` beside the photograph. The camera's frame
(`_land-b.jpg`) is still found by itself and is still the first stage;
the finished photograph is the last; the section shows all three. The
existing `processing:` line stays the note of the finished stage when
no note is given for it, so every page with a compare today reads as it
did.

### Adding the loupe's export

The photographer exports the photograph larger — the size is theirs to
choose — as `_land-b.detail.jpg` beside `land-b.jpg`. Nothing to
declare: the loupe finds it. Location metadata is stripped from it as
from any export; the build's GPS scan covers it like every image in the
output.

## Design requirements

- **The block's presentation.** The handle is visible at rest, centred
  on the divider, large enough for a finger, and reads as the site's:
  flat, the ground's family, no shadow, no bevel. The legend sits
  beneath the frame with the stops marked along it, the current stage
  named; the corner tags of spec 006 go. The method control is small,
  three words, near the legend; it is not a toolbar. The note is the
  compare's caption, in the caption style the blocks already use.
- **Width.** The compare block takes one of the vocabulary's existing
  widths, judged at the pause on the real piece: the content column (as
  today), the `wide` block's width, or on the image page the stage's
  width. Whatever is chosen, the three methods share it, and side by
  side never shows the two stages at less than a useful size — where
  the column is too narrow for two, side by side stacks them or yields
  to switch (decided at the pause).
- **The slider with stages.** One track, N−1 wipes laid end to end,
  the stops evenly spaced; the frame under the divider at any moment
  shows two neighbouring stages, the earlier on the left. Dragging past
  a stop is continuous, not a snap, unless the pause chooses snapping.
- **Switch.** A click or tap on the frame, or a key (space, enter, the
  right arrow when the block has focus), advances; the label changes
  with the stage; a cross-fade on the state duration, or a cut under
  reduced motion.
- **The loupe.** Zooming is a movement on the move duration, from the
  fit to full detail around the point touched; the ground stays the
  quiet dark and the mat is not zoomed with the photograph. Full detail
  is one image pixel to one device pixel of the largest file the
  photograph has (the detail export, else its own file). Between the
  fit and full detail the wheel and pinch are continuous. The cursor
  says what a click will do. The detail export's arrival is an
  appearance (the appearance duration) over the scaled page file,
  never a pop. The arrow keys pan while zoomed and step the set at the
  fit.
- **The loupe's cost.** The detail export is fetched only when the
  loupe opens, once, and is not in the page's `<img>`, its `srcset`,
  the OG image or the RSS. The quiet view and the page weigh what they
  weigh today until the reader zooms.
- **Focus and keyboard.** The handle is a focusable control with arrow
  keys, as spec 006's range is; the method control and the switch are
  reachable by keyboard; the loupe's zoom in and out have keys (plus and
  minus, or the pause's choice), and Escape always steps back one
  level.
- **Motion.** Every movement above reads `--dur-state`, `--dur-move` or
  `--dur-appear` and their curves; the spec 018 source scan and build
  barrier apply to the new styles unchanged. Nothing autoplays; a
  compare never advances its own stages.
- **The label.** The gear name replaces the value in the camera and
  lens rows only; the rows' place, order and styling are spec 006's.

## Authoring requirements

- **The name table** is one file, plain text, two lists (cameras,
  lenses), each line an EXIF string and its display name; edited by
  hand, no build step to regenerate it. Seeded with every string in the
  repo today, resolved as the photographer read them in this
  conversation (the Decided section), plus `ILCE-7M5` → `Sony α7 V`.
- **The `compare` block**: container form only; one stage per line as
  the flow above shows; `mode` optional (`slider` default, `side`,
  `switch`); two stages at minimum; every stage in the block's own
  folder (a private file may not be borrowed across pieces; a public
  photograph may, by spec 008's paths). A block with one stage, a stage
  whose file is missing, or a private file placed outside a `compare`
  fails the build naming the piece and the file.
- **The sidecar**: an optional `stages:` list, each with `file`,
  `label` and `note` (`note` optional); the camera's frame and the
  finished photograph are never listed, they are implied; a listed
  file that is not a private file of this photograph fails the build.
- **The detail export**: `_<basename>.detail.<ext>`, found
  automatically; at most one per photograph.
- **`AUTHORING.md` and the README** gain the block, the stages, the
  detail export and the name table, in the register the rest of those
  documents use. The plugin's README notes what Live Preview shows for
  a `compare`.
- **The constitution** is amended before the first task: the
  block-vocabulary clause names `compare` and retires the `sequence`
  reservation; the images paragraph names the private-file family
  (camera's frame, stages, detail export).

## The tuning envelope

This spec is experimental, at the product owner's word — of the block:
"I tentatively agree, since I'll need to actually see it to be
confident. But we'll go with your recommendation for now and tweak it
when we get there"; of the stages: "this is something … I'll definitely
need to demo and make tweaks and modifications to, so make sure that is
noted in the spec." The workflow's ordinary rule — a change to what the
spec promises is a spec amendment, re-planned and re-signed — is
relaxed here, deliberately and within a stated boundary, so that a
look at a pause can end in "try it this way" as often as it needs to.

**What may change at a pause, without re-planning or a new sign-off.**
Any of the following, decided by the product owner on the real pages,
is recorded by the orchestrating session as one line in this spec's
Decided section and one sub-lettered task in `tasks.md`, and dispatched
as a routine task:

- the handle's size and shape; the legend's shape and placement; the
  method control's words and placement; the corner tags' return;
- the compare's width, per surface, among the vocabulary's widths;
- the slider's behaviour across stages (continuous or snapping; which
  pair shows at rest); which method is the default; whether the
  reader's choice is remembered and for how long; what side by side
  does where two won't fit;
- the switch's gestures and keys; whether it wraps from the last stage
  to the first;
- the loupe's gestures, keys, zoom range and how it opens (a click, a
  double click, a pinch only); whether the loupe exists for a
  photograph without a detail export; the recommended size of the
  detail export written in `AUTHORING.md`;
- every duration's choice among spec 018's three tokens, and the
  reduced-motion split for any one movement within spec 018's rule;
- the section's heading and the words on the block, which live in the
  page's wording block and the block's own;
- the sidecar's field names (`stages`, `file`, `label`, `note`) and the
  note's fallback to `processing:`, before the real piece is written
  against them.

**As many rounds as it takes.** A pause may run several looks; each
round is a sub-lettered task, reviewed with the phase, and the phase's
review checks the code against the outcome recorded in this spec, not
against the first draft of it.

**What still needs the ordinary path** — a spec amendment, the planner
re-dispatched on the changed section, and a sign-off:

- a fourth method, or a second new block;
- a change to the private-file rule beyond what Entities states, or a
  private file placed by any block but `compare`;
- the loupe on any surface but the quiet view;
- a new dependency; the external store; any generated tiles;
- a change to the wall label beyond the two rows' values;
- anything the orchestrating session or the reviewer judges to reach
  beyond this list — "deemed absolutely necessary" is theirs to raise
  and the product owner's to decide.

**What the plan owes this section.** Every tunable above must be one
value in one place — a token, a constant in the wording block, a flag
the block's script reads — with a test pinning it by name, so that a
round is one value and the test's expectation beside it, never a
re-implementation. The plan says where each lives.

## Acceptance criteria

- [ ] The wall label prints `Sony α7R V` for an image whose EXIF model
      is `ILCE-7RM5`, and the display name for every camera and lens
      string in the repo today; a sidecar's `camera:` or `lens:` still
      wins — pinned by tests on the name lookup and on a built page
- [ ] A build over an image whose camera or lens string has no entry
      prints one warning per distinct string naming a file, and the
      label prints the string as today; a build over the repo as
      committed prints none — pinned
- [ ] `:::compare` with two or more stages renders, without script, the
      stages stacked as figures with their labels and notes, in order —
      pinned by a transform test
- [ ] With script the block offers slider, side by side and switch; the
      slider has a visible centred handle that drags with mouse, touch
      and arrow keys; with three stages one sweep passes through all
      three with the labels as stops; side by side shows two
      neighbouring stages; switch shows one and advances on click, tap
      and key; the note beneath is the showing stage's — the mechanics
      pinned by page tests, the feel judged at the pause
- [ ] The image page's "Raw to finished" is the `compare` block: a
      photograph with only a camera's frame shows two stages as today;
      a sidecar with `stages:` shows the camera's frame, the declared
      stages in order, and the finished photograph last; a sidecar story
      that writes its own `compare` suppresses the automatic section —
      pinned
- [ ] A `compare` with one stage, a missing stage file, a private stage borrowed
      from another folder, or a private file placed by any other block
      fails the build naming the piece and the file; a private file
      with no photograph beside it still fails — pinned
- [ ] `_<basename>.detail.<ext>` has no page, appears in no gallery, no
      `srcset`, no OG image and no feed, and is requested only when the
      loupe opens — pinned by tests on the registry and on `dist/`, and
      by a network check at the pause
- [ ] In the quiet view a click zooms to one image pixel per device
      pixel of the largest file around the point clicked; drag pans;
      wheel and pinch zoom; Escape steps back to the quiet view and
      again to the page; the arrow keys step the set only at the fit;
      the detail export fades in over the scaled page file — the states
      pinned by page tests, the feel judged at the pause
- [ ] Without script, the quiet view is what it is today and no page
      ships a loupe state — pinned on `dist/`
- [ ] Every new transition and animation reads spec 018's tokens; the
      source scan and the build barrier pass unchanged; nothing added
      autoplays — pinned by the existing tests
- [ ] The Obsidian plugin shows a `compare` block's stages as images
      with their labels in Live Preview — checked by the photographer
      at a pause
- [ ] The constitution's block-vocabulary clause names `compare` and no
      longer reserves `sequence`, amended in its own commit before the
      first implementation task; `AUTHORING.md`, the README and the
      plugin's README describe the block, the stages, the detail
      export and the name table
- [ ] The photographer's real piece is published, its photograph
      carrying a camera's frame, at least one stage and a detail
      export, and the last pause is judged on it; the invented fixtures
      remain marked as fixtures
- [ ] The build's GPS scan finds no GPS block in any image in `dist/`,
      the detail exports included — the existing barrier, re-run

## Decided (in this conversation, 2026-09-24)

- **This spec over the mobile pass and the front door** — the
  photographer: "I'd like to do a mobile pass later once we have some
  real content."
- **The gear table is a dictionary, hand-edited** — "It should be an
  easily editable dictionary that either I or you can update when
  necessary."
- **Sony's own mark** — "it should be Sony's own naming: 'α7R IV'."
  `ILCE-7RM4` → Sony α7R IV, `ILCE-7RM5` → Sony α7R V, `ILCE-7M5` →
  Sony α7 V (pre-seeded; not yet in the repo).
- **The lens readings, confirmed** ("The rest of your reads so far are
  good"): `100-400mm F5-6.3 DG DN OS | Contemporary 020` → Sigma
  100-400mm f/5-6.3 DG DN OS Contemporary; `FE 16-35mm F2.8 GM II` →
  Sony FE 16-35mm f/2.8 GM II; `FE 16-35mm F4 ZA OSS` → Sony Zeiss FE
  16-35mm f/4 ZA OSS; `FE 24-105mm F4 G OSS` → Sony FE 24-105mm f/4 G
  OSS; `E 50-400mm F4.5-6.3 A067` → Tamron 50-400mm f/4.5-6.3 Di III
  VC VXD; `HD PENTAX-D FA 15-30mm F2.8ED SDM WR` → HD Pentax-D FA
  15-30mm f/2.8 ED SDM WR; `PENTAX K-1` (make `RICOH IMAGING COMPANY,
  LTD.`) → Pentax K-1.
- **A handle and a legend** — "there should be a handle in the center
  of the divider line so that it's clear that it's draggable. There
  should also be a label/legend indicating which is which."
- **Three methods, the reader's choice** — "multiple, user selectable
  methods such as additionally a side by side (2 images side by side)
  as well as a 'click to switch' setup."
- **A block** — "Maybe we should set this up as its own block so that
  we can have it rendered easily with simple syntax." Taken as the
  session recommended: `compare` in the vocabulary, the page's section
  the same block fed from the sidecar, the `sequence` reservation
  retired, the private-file rule widened for it alone; accepted
  tentatively, to be seen.
- **Stages in the sidecar** — "I like the sidecar setup as well",
  with the demand that it be tunable: "this is something … I'll
  definitely need to demo and make tweaks and modifications to."
- **The slider across three stages is one sweep** with the labels as
  stops — the session's answer to "I'm not sure how a 3 image slider
  would work?", to be judged.
- **The loupe, with a detail export** — "I do like the idea of
  including a detail loupe. I shoot with high resolution cameras and
  detail gets absolutely lost." Option 2 of three: a larger private
  export beside the photograph, loaded on zoom; not the page's own file
  alone, not build-time tiles. The external store is a separate spec
  he already expects: "I plan to have many images, so even without full
  size ones, we'll need an external store."
- **Pan-and-zoom, not a magnifying glass** — the session's
  recommendation, accepted with the loupe.
- **The layout candidates leave** — the story beside the photograph, a
  jump line, the wall label's shape: "we may decide to spec them out
  separately later too. I'd be fine with that if this is already too
  large of a scope." The session's call: they go to the roadmap; the
  compare's width stays.
- **The real piece arrives at the end** — "It will be a different image
  than what I've already uploaded. I'll be working on this in parallel
  to developing the spec and imagine incorporating it at the end for
  final tweaks and modifications." The last phase is his piece and its
  pause; the fixtures stand in until then.
- **Round T1709a (2026-09-25)** — the slider is two-way, wiping
  between one pair; the legend picks the pair in the slider and side
  by side alike (a click on a stage outside the pair replaces the
  member picked longer ago, so every pair is reachable); at rest the pair is the first
  and last stage, Camera | Finished — "Yes, that sounds right to me."
- **Round T1709b (2026-09-25)** — the compare is `wide` on both
  surfaces: "It also needs to be larger (maybe allow it beyond the
  text margins)."
- **Rounds T1709c–f (2026-09-25)** — only side by side is wide, the
  slider and switch stay in the column; the pair is picked in order
  (first click left, second right), the picked stages bold and tagged
  left / right with a hint for the next pick; every showing stage
  carries its corner caption; the camera stage's note reads "The RAW
  file straight out of camera — no edits, no adjustments".
- **Round T1709g (2026-09-25)** — a picked stage may be picked again
  for the other side; the side it leaves stays empty (the bare ground)
  until the next pick fills it; the left / right tags sit beneath their
  buttons with space reserved, so the legend never shifts.
- **Round T1709h (2026-09-25)** — any stage may be picked at any step:
  picking the stage already on the next side keeps it there and moves
  the next pick to the other side.
- **Round T1709i (2026-09-25)** — the handle is a small 24px circle
  outlined in the accent colour with a "=" inside.
- **Phase 1 keeps (2026-09-25)** — the gear names as the table reads;
  the method control's words and placement; the rest pair Camera |
  Finished; no snapping; the method remembered for the tab's session;
  side by side stacks on the phone (to revisit); the switch's keys and
  wrap; the heading, the hint's words; the 1px ground-white divider;
  the switch's bold legend. The fade's duration is open: 250ms was
  asked for, and the choice is among spec 018's three tokens.
- **Round T1709j (2026-09-25)** — a muted middle dot with space on
  both sides between a stage's label and its note.
- **Phase 1 closed (2026-09-25)** — the fade stays at 180ms; "the
  design on this is settled." Several compares through one piece,
  each a subset of the same stages, are expected in his writing.
- **Phase 2 keeps (2026-09-26)** — a click on the photograph at the
  fit zooms, a click around it leaves; a photograph without a larger
  export keeps its loupe where its own file has detail to add; full
  detail is one image pixel per screen pixel; the gestures and keys;
  480ms glide, 950ms fade; the recommended larger export is 4000px on
  the long edge, limited by the camera's resolution.
- **Rounds T1713a–b (2026-09-26)** — when zoomed, the loupe follows
  the mouse, tracking the pointer's place on the unzoomed photograph;
  a click without movement zooms back out; touch keeps the drag. The
  mat goes while the loupe is open, the loupe filling the frame.
- **Round T1713c (2026-09-26)** — while zoomed, the mat goes and the
  photograph grows into the freed space with its shape kept (the
  largest box of its shape the stage allows: it matches the mat's box
  on one axis only); nothing of the unzoomed photograph shows around
  it. The Phase 1 rounds T1709a, d and g supersede AC 4's three-stage
  sweep and neighbouring pairs: the slider is two-way on a picked
  pair.
- **Phase 2 closed (2026-09-26)** — "Looks good, continue."
