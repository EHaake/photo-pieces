# Spec: The image page, refined

**Status**: Approved (2026-09-24), **experimental** — see "The tuning
envelope" below: this spec expects to be tuned at its pauses, and says
what may change there without re-planning. Written in the spec
conversation with the product owner, who chose it over the roadmap's
mobile pass and front door: "I'd like to do a mobile pass later once
we have some real content. I'd like to instead focus on expanding and
refining the image detail page." **Amended 2026-09-26**, after the
Phase 3 pause and before the real piece, with three changes the Phase
1 look held for the ordinary path (each beyond the tuning envelope):
the stage's share of the screen, the pair blocks `side` and `slider`,
and the filmstrip as a fourth method — the paragraph "Amended after
Phase 3" in the Summary, Goals 8 and 9, and the sections marked
_(amended 2026-09-26)_. The amended sections were re-planned as
plan.md's "Amendment (2026-09-26)" and tasks.md's Phase 3a
(T1719–T1729), signed off at the top tier the same day. **Amended a
second time, 2026-09-26 (evening)**, at the Phase 3a pause: the
authoring plugin made representative — Goal 10 and the sections marked
_(amended 2026-09-26, plugin)_ — re-planned as plan.md's "Amendment 2
(2026-09-26): the plugin" and tasks.md's Phase 3b (T1730–T1735),
signed off at the top tier the same evening, before the real piece.
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

**Amended after Phase 3 (2026-09-26).** Three things the photographer
asked for at the Phase 1 look reached beyond the envelope and were held
("there may be more amendments to the spec coming so let's get through
the rest first"); with Phases 0–3 signed off they are folded in here,
before his piece, so the last pause judges them on a real photograph
too. **The photograph is too small in the page's normal view.** Spec
017's rule fits every frame to one rectangle turned, its long side the
smaller of the screen's two extents — so on the 16:10 laptop a
horizontal photograph is bound by the screen's height and sits
narrower than the wide compare beneath it, white around it and the
title far below. The stage becomes viewport-aware on both axes: a
photograph takes a set share of the screen whatever its ratio and the
screen's — a landscape large on the 16:10 laptop, a portrait large on
the LG DualUp — with the target share per orientation as tunables.
**Side by side as a block of its own, and the slider alone for one
pair.** He writes several compares through a piece — raw against
finished first, then raw against each stage — and for those a fixed
pair with no method control is what the writing wants: a `side` block
(two stages beside each other, nothing to choose) and a `slider` block
(one wipe between two stages, nothing to choose). **A filmstrip.** A
fourth method of the compare that pages or scrolls through every
stage in order, for the block that carries all of them.

**Amended a second time, at the Phase 3a pause (2026-09-26).** The
photographer installed the rebuilt plugin and looked at a piece that
uses every block. What he saw was a stack of bare images: every
captioned container, `grid`, `strip`, `aside`, `row` and `held` raw
text; `diptych` and `triptych` stacked because an Obsidian rule
outranked the plugin's one layout rule; Reading view showing nothing
at all. The plugin's scoping — "see the photo, not the raw text",
accepted at spec 003 as an approximation — had been read far more
narrowly than he meant it: "the concession was that 'approximation'
would be fine for the authoring plugin. By that I meant that things
wouldn't be exactly the same, be representative. … The goal for the
authoring is that I can look at it in Obsidian and get a pretty good
sense of the layout and flow." The plugin becomes that, before his
piece rather than after it, because the writing surface is what the
piece is written on: "a big part of that is getting all the pieces in
place for authoring and design so we can start to tweak and refine
things as I actually start to use them."

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

2. **The compare is a block, with stages and three methods** — four,
   from the 2026-09-26 amendment. A
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
   - **Filmstrip** _(amended 2026-09-26)_: the stages in one row at the
     frame's size, one in the frame at a time; the reader pages or
     scrolls through every stage in order — arrows at the frame's
     sides, keys, a swipe or a horizontal scroll — and the strip slides
     rather than fades, so the sequence reads as a sequence.
   A legend names the stages in every method, and the note of the stage
   (or the pair) showing sits beneath the frame. The author's `mode`
   chooses the method the block opens in; the reader's choice holds for
   the visit. Without script the stages stand stacked as plain figures
   with their labels and notes, as spec 006's compare does today. (The
   Phase 1 rounds made the slider two-way on a picked pair; see the
   Decided section, which outranks the first draft above where they
   differ.)

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
   naming the piece, as any other block does. _(Amended 2026-09-26.)_
   The same holds for the amendment: the constitution's clause names
   `side` and `slider` and the compare's fourth method, and its images
   paragraph names the three blocks a private file may sit in, in one
   commit before the amendment's first implementation task; a
   malformed `side` or `slider` fails the build naming the piece.

8. **The photograph takes its share of the screen** _(amended
   2026-09-26)_. In the page's normal view the photograph is sized to
   a set share of the first screen, whatever its ratio and the
   screen's: a landscape photograph to a share of the screen's width,
   a portrait (and a square) to a share of its height, each bounded by
   the other axis so the whole photograph shows below the header with
   the nav line under it, as today. The two shares are tunables. The
   nav line and the title follow at the piece's frame-to-prose
   spacing and no further. The quiet view, its mat and the loupe are
   untouched.

9. **A pair, fixed: the `side` and `slider` blocks** _(amended
   2026-09-26)_. Two blocks with the compare's stage syntax and exactly
   two stages, for the writing that wants one look and nothing to
   choose. `side` shows the two beside each other at the same size,
   each with its label and note beneath, and needs no script. `slider`
   shows one wipe between the two, the handle and the divider as the
   compare's, the two labels fixed beneath as its legend, the note of
   the pair beneath that; without script the two stand stacked. Neither
   carries a method control or a picking legend. A private file may sit
   in either, from its own folder, exactly as in a `compare`.

10. **The authoring plugin shows the piece's shape** _(amended
    2026-09-26, plugin)_. In Obsidian, in Live Preview and in Reading
    view alike, every block of the vocabulary renders as a
    representative figure — the photograph at a width that reads as
    the site's for that block, its caption beneath where the block has
    one, beside the prose where the block puts it there — so that a
    piece read through in Obsidian gives a good sense of its layout
    and flow. Representative, not identical: the site's typography,
    ground, mat, motion and every interaction stay the site's. The
    plugin's layout rules outrank Obsidian's own, so what the plugin
    draws is what shows. Put the cursor in a block in Live Preview and
    it turns back into its text, as today.

## Non-goals

- **The external image store.** The detail exports make the repo heavier
  per photograph, and the photographer already expects to move images
  out of the repo: "I think moving to an external store will be
  necessary even without this anyways. I plan to have many images."
  That is its own spec; this one commits detail exports beside their
  photographs like every other file, and `ROADMAP.md` notes that the
  day has moved closer.
- **The page's layout beyond the compare and the stage's size.** The
  story beside the
  photograph on wide screens, a jump line for long pages, and the wall
  label's shape were candidates in this conversation and are left to a
  follow-up roadmap entry, so this spec is judged on the photograph and
  its processing alone. The compare's own width is in scope (Design
  requirements), and from 2026-09-26 so is the stage's size in the
  normal view (Goal 8) — the words' distance from the frame included,
  nothing else of the page's flow.
- **A thumbnail strip, or a fifth method.** The filmstrip's index is
  the legend the compare already has; it draws no thumbnails. Its
  panes are the stages at the frame's size.
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
  methods, the handle and the loupe are the site's. _(Amended
  2026-09-26, plugin: the bar is raised to Goal 10 — every block a
  representative figure, in both views; interaction, motion, the
  site's typography and ground stay out, as does anything the plugin
  would have to compute from the viewport the site has and Obsidian
  does not — the exact pixel widths, the hold's scrolling, the tall
  cap's screen share.)_
- **A second source of truth for the vocabulary** _(amended 2026-09-26,
  plugin)_. The plugin mirrors the transform by convention, as it
  always has; it does not import or run the transform, and a block the
  site rejects is not the plugin's to refuse — it shows what it can
  parse and leaves the rest raw, and the build stays the judge.
- **The mobile pass.** Touch works here where the spec says it does
  (the handle, the switch, the pinch); how the page reads on a phone is
  the roadmap's mobile pass, after real content exists.
- **Zoom on the piece page or in a gallery.** The loupe lives in the
  quiet view of the image page only.
- **Any change to the front door, the galleries, the place wall, the
  mat rule, the sets or the arrows** — and, until the 2026-09-26
  amendment, the stage on paper; its size is Goal 8's now, its
  bareness and its place in the page unchanged.

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
  photograph, a method (slider, side by side, switch, and from
  2026-09-26 filmstrip) and the method it
  opens in. In a body it is the `compare` block; on the image page it is
  built from the sidecar's stages, the camera's frame first and the
  finished photograph last.
- **Filmstrip** _(amended 2026-09-26)_ — the compare's fourth method:
  the stages in one row at the frame's size, the showing stage in the
  frame and its neighbours beyond the frame's edges; paged by arrows,
  keys, a swipe or a horizontal scroll; the legend its index. Written
  as `mode="filmstrip"`.
- **Side block** _(amended 2026-09-26)_ — `:::side`: exactly two
  stages, written as a compare's are, shown beside each other at the
  same size, each with its label and note; no method, no script. Not a
  `diptych`: a diptych places two public images of any ratio under one
  caption; a `side` places two stages of one photograph, private files
  allowed, each captioned by its own label and note.
- **Slider block** _(amended 2026-09-26)_ — `:::slider`: exactly two
  stages, the compare's slider alone — the first stage left of the
  divider, the second right, the two labels fixed as the legend, the
  pair's note beneath. No method control, no picking.
- **The plugin's block table** _(amended 2026-09-26, plugin)_ — one
  entry per block of the vocabulary, in the plugin, naming the block's
  forms (leaf, container, both), the images it shows and from which
  attributes or body lines, and its layout kind: a single figure at a
  named width (`column`, `wide`, `full`, `tall`, `inset`), a row of two
  or three (`diptych`, `triptych`), a grid or a horizontal strip of
  the body's images (`grid`, `strip`), a frame beside prose on a side
  (`aside`, `row`, `held`), or a row of stages (`compare`, `side`,
  `slider`). The table's names are the transform's names, pinned equal
  by a test, so a block added to the site is a line the plugin is
  missing rather than a block it silently ignores.
- **The two renderers** _(amended 2026-09-26, plugin)_ — the Live
  Preview decorator (the CodeMirror field the plugin has) and a Reading
  view post-processor, both building the same figure markup from the
  same block table and styled by the same stylesheet.
- **The stage's shares** _(amended 2026-09-26)_ — two numbers, the
  landscape share (of the first screen's width, for a photograph wider
  than tall) and the portrait share (of the first screen's height, for
  a photograph taller than wide, or square), sizing the photograph in
  the page's normal view. Tunables.
- **Detail export** — `_<basename>.detail.<ext>`: a larger private
  export of the photograph, for the loupe alone, found automatically
  like the camera's frame. Its size is the photographer's call per
  photograph.
- **The private-file rule, widened.** Today a raster whose name starts
  with `_` is the camera's frame of the photograph with the same
  basename, and nothing else; placing one in a piece fails the build. Now
  a private file is the camera's frame (`_land-b.jpg`), a stage or the
  detail export (`_land-b.<word>.jpg`), and it may be placed in exactly
  one kind of place: as a stage of a `compare` block in its own folder
  — from 2026-09-26, of a `compare`, `side` or `slider` block in its
  own folder, the three blocks that take stages. A private
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

### Looking through every stage _(amended 2026-09-26)_

On the block that carries all the stages the reader picks "Filmstrip".
One stage fills the frame; an arrow at either side, the arrow keys, a
swipe on the phone or a two-finger scroll on the trackpad slide the
strip to the next stage, the legend's mark and the note moving with
it. The strip slides, it does not fade: the reader sees the frames go
by in order. It stops at the last stage.

### Arriving at the photograph _(amended 2026-09-26)_

The reader lands on an image page on the laptop: a horizontal
photograph spans most of the screen's width below the header, the nav
line and the title close beneath it; a vertical one stands most of the
screen's height. On the DualUp, turned tall, a vertical photograph
spans most of the height and a horizontal most of the width. On both
the whole photograph is on the first screen with the nav line under
it, as before. In the quiet view nothing is different.

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

### Reading a draft through in Obsidian _(amended 2026-09-26, plugin)_

The photographer opens a piece in Live Preview. The frames sit where
the site will put them: a `wide` past the text's edges, a `fullbleed`
across the whole pane, a `tall` standing at most of the pane's height,
an `inset` small, a diptych and a triptych in a row, a grid in its
columns, a strip in one scrolling row; a captioned block shows its
caption beneath the frame in a smaller face; an `aside` or a `row`
puts its small frame beside the paragraph on the side named; a `held`
puts its frame beside its paragraphs on its side, the words flowing
past it without the site's hold. A compare, side or slider shows its
stages in a row with the labels beneath and its method named. He
switches to Reading view and sees the same page. He puts the cursor
in a block in Live Preview and its text comes back for editing.

### Writing a pair _(amended 2026-09-26)_

Further down the same piece, where the writing wants one fixed look:

```markdown
:::side
![Camera](./_land-b.jpg) Straight out of the camera, flat profile.
![Tones](./_land-b.tones.jpg) Shadows lifted on the ridge, the fog's highlights held.
:::

:::slider
![Camera](./_land-b.jpg) Straight out of the camera, flat profile.
![Finished](./land-b.jpg) A touch of warmth over the whole frame.
:::
```

The `side` shows the two beside each other, each with its label and
note beneath, and nothing to choose; the `slider` shows one wipe
between the two with the handle at its centre, Camera left and
Finished right, the labels fixed beneath, and nothing to choose. Both
take exactly two stages; a third fails the build naming the piece.
Live Preview shows each as it shows a compare. Several blocks over the
same stages ask for the same files, so a reader downloads each stage
once.

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
  to switch (decided at the pause). _(Amended 2026-09-26, after the
  Phase 1 rounds set the width per method — side by side wide, the
  slider and the switch in the column.)_ The filmstrip takes the
  switch's width; the `side` block takes side by side's, the `slider`
  block the slider's; each is one value per surface in the envelope.
- **The stage's size** _(amended 2026-09-26)_. In the page's normal
  view the frame's width is the landscape share of the first screen's
  available width for a photograph wider than tall, and for one taller
  than wide, or square, the frame's height is the portrait share of
  the first screen's available height — "available" as the stage
  already measures it: the page's width less its side pads; the first
  screen below the header less the stage's spacing and the nav line —
  and in either case the frame is then bounded by the other axis, so
  the whole photograph shows with the nav line under it. One rule,
  two numbers, and nothing else of spec 017's fit survives: the
  rectangle turned, and the equal-sides answer, are replaced. The white
  above and below the frame is the piece's frame-to-prose spacing
  (the stage's spacing today) and no more: the nav line and the
  title follow at that distance on both screens. The `sizes` hint
  states the same rule in literals, as it does today, and the mat
  sampler renders the real stage. The quiet view's box, its mat and
  the loupe read none of this. The shares open at one — the whole
  available extent along the photograph's long axis, so no frame is
  smaller than under spec 017's rule and the laptop's landscape grows —
  and are tuned at the pause.
- **The filmstrip** _(amended 2026-09-26)_. One row of panes at the
  frame's size, the frame showing one stage whole; the neighbours sit
  beyond the frame's edges (whether a sliver of each shows is a
  tunable, opening at none). Two arrows at the frame's sides, drawn as
  the site's — flat, the ground's family, no shadow — previous and
  next, each hidden or quiet at its end since the strip does not wrap
  (a tunable, as the switch's); the arrow keys and Home/End when the
  block has focus; a swipe on touch, and a horizontal wheel or
  trackpad scroll, which follow the hand and settle on the nearest
  stage on release. The legend marks the showing stage and a click on
  a stage slides to it; the note beneath is the showing stage's. Paging
  is a movement on the move duration; the settle after a swipe is a
  movement on the state duration, like the slider's snap; under
  reduced motion both cut to the stage. Nothing autoplays.
- **The plugin's figures** _(amended 2026-09-26, plugin)_. One
  stylesheet draws every block's figure; the widths are shares of the
  editor pane, not the site's pixels, and read as the site's order:
  `inset` smallest, `column` the text's width, `wide` past it, `full`
  the pane's whole width, `tall` at most a share of the pane's height
  with the frame centred; a diptych's two and a triptych's three in a
  row at equal widths; a grid in the site's columns; a strip one
  horizontal row that scrolls; `aside` and `row` a small frame on the
  named side with the prose wrapped beside it; `held` the frame on its
  side with its paragraphs beside it (a float, not a hold). A caption
  sits beneath its frame in the muted face, inline markdown rendered.
  The stage blocks keep today's row of images with labels and gain
  one line naming the method (`Slider`, `Side by side`, `Switch`,
  `Filmstrip`, or the block's own name for `side` and `slider`). A
  missing image keeps the dashed "not found" box. Every share is a
  tunable in the plugin's stylesheet (the envelope).
- **The plugin's rules win** _(amended 2026-09-26, plugin)_. Found at
  the Phase 3a pause: Obsidian's own stylesheet outranked the plugin's
  `display: flex`, so every row collapsed to a stack. Every layout
  declaration the plugin relies on is written so that Obsidian's rules
  cannot outrank it, in both views, and a test reads the stylesheet
  and refuses a layout rule that isn't.
- **Both views, one markup** _(amended 2026-09-26, plugin)_. Live
  Preview replaces a block's lines with the figure while the cursor is
  outside it, as today; Reading view renders the same figure through a
  Markdown post-processor over the same block table, so the two never
  disagree about what a block is. A directive typed mid-paragraph stays
  raw in both, as the site rejects it.
- **The pair blocks** _(amended 2026-09-26)_. `side`: the two panes at
  the photograph's ratio and the same size, the label · note of each
  beneath its pane in the caption style, no control, no legend, no
  live note; where two won't fit at a useful size they stack, as the
  compare's side by side does. `slider`: the compare's slider — the
  divider, the handle, the first stage left and the second right, the
  same drag, touch and arrow keys — with a fixed legend of the two
  labels beneath (left · right, not buttons) and the live note; no
  method control. Both read as the compare reads, from the same
  stylesheet rules; neither introduces a look the compare does not
  have.
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
  `switch`, and from 2026-09-26 `filmstrip`); two stages at minimum; every stage in the block's own
  folder (a private file may not be borrowed across pieces; a public
  photograph may, by spec 008's paths). A block with one stage, a stage
  whose file is missing, or a private file placed outside a `compare`
  (from 2026-09-26: outside a `compare`, `side` or `slider`)
  fails the build naming the piece and the file.
- **The `side` and `slider` blocks** _(amended 2026-09-26)_: container
  form only; the compare's stage lines, exactly two; no attributes.
  One stage or three fails the build naming the piece and the count; a
  missing file and a borrowed private file fail as the compare's do.
  Any attribute fails as an unknown attribute does today.
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
  (camera's frame, stages, detail export). _(Amended 2026-09-26.)_
  Before the amendment's first implementation task it is amended
  again, in its own commit: the clause names `side` and `slider`
  (`side` a plain figure block, `slider` an interactive one) and the
  compare's four ways; the images paragraph names the three blocks a
  private file may sit in.
- **The documents, again** _(amended 2026-09-26)_: `AUTHORING.md` and
  the README gain the two blocks and the filmstrip, and the README's
  sentence on the stage's size states the share rule; the plugin's
  README notes that Live Preview shows a `side` and a `slider` as it
  shows a `compare`.
- **The plugin's README** _(amended 2026-09-26, plugin)_ is rewritten
  for Goal 10: its table lists every block with what each view shows,
  nothing "raw by design" but a mid-paragraph directive; the install
  and rebuild steps stay; a line says how to check the plugin — open
  the sampler piece, every block a figure. `AUTHORING.md`'s "Obsidian
  settings that matter" says the same in a sentence. `DECISIONS.md`'s
  two plugin entries are annotated at close-out as superseded by this
  amendment, in his words.

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
  against them;
- _(amended 2026-09-26)_ the stage's two shares, and whether a square
  is sized as a portrait or a landscape; the filmstrip's arrows (their
  place, their shape, whether they hide at the ends), its keys, whether
  it wraps, the neighbours' sliver, and whether a wheel scrolls it; the
  width of the filmstrip and of each pair block per surface, among the
  vocabulary's widths; the `slider` block's fixed legend's shape; where
  a `side` stacks;
- _(amended 2026-09-26, plugin)_ every share in the plugin's
  stylesheet — the widths of `inset`, `wide`, `full` and the side
  frames, the `tall` height cap, the grid's columns, the gaps, the
  caption's face — and whether the method line shows on the stage
  blocks.

**As many rounds as it takes.** A pause may run several looks; each
round is a sub-lettered task, reviewed with the phase, and the phase's
review checks the code against the outcome recorded in this spec, not
against the first draft of it.

**What still needs the ordinary path** — a spec amendment, the planner
re-dispatched on the changed section, and a sign-off:

- a fourth method, or a second new block — _(amended 2026-09-26)_ now
  a fifth method, or a fourth block that takes stages;
- _(amended 2026-09-26, plugin)_ any interaction in the plugin (a
  working slider, a switch), motion, or matching the site's typography
  or ground; the plugin importing the transform.
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
- [ ] ~~With script the block offers slider, side by side and switch; the
      slider has a visible centred handle that drags with mouse, touch
      and arrow keys; with three stages one sweep passes through all
      three with the labels as stops; side by side shows two
      neighbouring stages; switch shows one and advances on click, tap
      and key; the note beneath is the showing stage's — the mechanics
      pinned by page tests, the feel judged at the pause~~ — **superseded
      by the Phase 1 rounds** (T1709a, d, g, h; Decided): the slider
      is two-way on a picked pair, the legend picks the pair in order
      for the slider and side by side alike; the rest of the line
      (the handle, the switch, the note) stands and was attested at
      the Phase 1 pause
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
      at a pause _(raised by the plugin amendment's criteria below)_
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

_Amended 2026-09-26:_

- [ ] In the page's normal view a photograph wider than tall has the
      landscape share of the available width, bounded by the available
      height, and one taller than wide (or square) the portrait share
      of the available height, bounded by the available width — the
      rule pinned by the existing sizes-hint test over its grid of
      ratios and viewports against the stylesheet's rule, and the
      frame's box read in the browser at 1512×982 and 1280×1440 for a
      3:2 and a 2:3 and recorded; the nav line and the title sit at the
      frame-to-prose spacing beneath the frame at both — read and
      recorded; the quiet view's and the loupe's tests pass unchanged;
      the size judged at the pause on both screens
- [ ] `:::side` with two stages renders them beside each other, each
      with its label and note, script or not; with one stage or three
      the build fails naming the piece and the count; a private stage
      of its own folder is allowed and one of another folder fails —
      pinned by transform tests and a built page
- [ ] `:::slider` with two stages renders, without script, the two
      stacked as figures; with script, the handle and the divider wipe
      between the first stage left and the second right with mouse,
      touch and arrow keys, the two labels fixed beneath and the note
      following, and no method control is offered — the mechanics
      pinned by page tests, the feel at the pause
- [ ] The compare offers Filmstrip as a fourth method: one stage in
      the frame, arrows, keys and a swipe or horizontal scroll page
      through every stage in order without wrapping, the legend marks
      the showing stage and a click on it slides there, the note
      follows; the slide reads the move duration and the settle the
      state duration, and reduced motion cuts both — the state pinned
      by unit tables, the wiring by page tests, the feel at the pause
- [ ] A stage shown by several blocks of one page — a `compare`, a
      `side`, a `slider` in any mix — resolves to one URL, so it is
      fetched once — pinned on a built page
- [ ] The constitution names `side`, `slider` and the compare's four
      ways, amended in its own commit before the amendment's first
      implementation task; `AUTHORING.md`, the README and the plugin's
      README describe the two blocks, the filmstrip and the stage's
      share; the plugin shows a `side` and a `slider` as it shows a
      `compare` in Live Preview — checked by the photographer at the
      pause

_Amended 2026-09-26 (plugin):_

- [ ] The plugin's block table names exactly the transform's blocks —
      pinned by a test that compares the two lists, so a block added
      to either side fails
- [ ] Over the sampler piece's body, the plugin's parser finds every
      block, leaf and container, with the images, caption and side the
      transform would read, and leaves a mid-paragraph directive raw —
      pinned by tests over that body and the fog piece's
- [ ] In Live Preview every block of the sampler renders as its figure
      — a single at its width, a diptych and a triptych in a row, a grid
      in columns, a strip in a row, an aside, a row and a held beside
      their prose on the named side, captions beneath, stage blocks in
      a row with labels and the method line — and the cursor inside a
      block returns its text; in Reading view the same figures show —
      checked by the photographer on the laptop and the DualUp
- [ ] Every layout declaration in the plugin's stylesheet is written so
      Obsidian's rules cannot outrank it — pinned by a test over the
      stylesheet; the collapse found at the Phase 3a pause (a computed
      `display: block` on a flex row) is gone — checked in the console
      at the pause
- [ ] A missing image shows the dashed box in both views; a src with a
      folder in it still resolves from the note's folder — pinned
- [ ] The plugin's README table describes every block in both views;
      `AUTHORING.md`'s settings section matches; the plugin builds
      clean — pinned by greps and the build

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
- **The amendment (2026-09-26), after the Phase 3 pause** — the three
  changes the Phase 1 look held for the ordinary path, folded in before
  the real piece. **The stage's share** — his words at the Phase 1
  look and in the amendment's brief: horizontals "sit smaller than the
  compare beneath them with white around and the title far below"; the
  stage should be "viewport-aware on both axes, so a photograph takes a
  set share of the screen whatever its ratio and the screen's
  (landscape large on the 16:10 MacBook, portrait large on the LG
  DualUp), with the target share per orientation as tunables". The
  session's rule, to be seen: a landscape sized by a share of the
  width, a portrait or a square by a share of the height, each bounded
  by the other axis; both shares opening at one (planning's numbers:
  at nine tenths three of the four boxes he knows would shrink — the
  laptop's portrait 781 → 703 tall, the DualUp's landscape 1216 →
  1094 wide and its portrait 1216 → 1115 tall — while at one none
  shrinks and two grow: the laptop's landscape 781 → 1171 wide, the
  DualUp's portrait 1216 → 1239 tall, bound now by the height rather
  than the width; the sign-off's correction); spec
  017's rectangle-turned rule replaced outright, not layered on. **Side by
  side as its own block, and the slider alone for one pair** — from
  the Phase 1 record: "side by side as its own block … the slider
  usable on its own for one pair", for the several compares he writes
  through a piece, "raw to finished first, then raw to stage 1 …",
  with no duplicate images loaded. The session's call: two blocks,
  named by the words he already writes as `mode` values, `side` and
  `slider`, each taking exactly two stages and no attributes, `side`
  static and `slider` the compare's slider without its control — not
  an attribute on `compare`, because he asked for blocks and the
  writing reads better as `:::side` than as a compare told what not
  to offer. **A filmstrip** — from the Phase 1 record: "any number of
  stages with a final filmstrip view that pages or scrolls through
  them (a fourth method)". The session's shape, to be seen: a sliding
  strip of the stages at the frame's size, arrows, keys, swipe and
  horizontal scroll, the legend as its index, no wrap, no thumbnails;
  distinct from the switch in its movement (a slide, not a fade) and
  its direct manipulation. **AC 4** noted as superseded by the Phase 1
  rounds. All three judged at the new phase's pause on the fixtures,
  then again on his piece.
- **T1729a (Phase 3a pause, 2026-09-26).** The filmstrip's arrows are
  drawn in CSS as the handle's "=" is — a chevron of two 1px strokes in
  the accent, centred in the disc — not a font glyph (the mono face has
  none, and a system fallback drew them off-centre). The disc's ring,
  fill and colour stay the handle's.
- **T1729b (Phase 3a pause, 2026-09-26).** A sideways trackpad gesture
  on the filmstrip pages exactly one stage in its direction, on the move
  duration; the rest of the gesture, momentum included, is ignored
  until it has been quiet. (The hand-following scroll stays a tunable,
  off.) A swipe by finger still follows the hand and settles nearest.
- **T1729c (Phase 3a pause, 2026-09-26).** A gesture's gate on the
  filmstrip ignores empty wheel events, opens by itself after 800ms
  whatever the trackpad keeps sending, and a gesture the other way pages
  back at once.
- **T1729d (Phase 3a pause, 2026-09-26).** The filmstrip's arrows'
  ring and chevron are a third lighter than the accent, the same hue;
  the handle stays the accent.
- **T1729e (Phase 3a pause, 2026-09-26).** The filmstrip's arrows stand
  outside the frame in the margin, a small gap from its edges, covering
  none of the photograph; on a phone, where there is no margin, they
  stay inside.
- **The second amendment (2026-09-26, at the Phase 3a pause): the
  plugin, representative.** On the plugin-check piece the photographer
  saw everything stacked and most blocks raw: "Basically it doesn't
  seem to be rendering the blocks as expected." Diagnosed in the
  console: Obsidian's stylesheet outranks the plugin's `display: flex`
  (computed `block` on the compare's row) — worked around in his vault
  with `!important`, to be fixed on the branch. On the scoping: "the
  concession was that 'approximation' would be fine for the authoring
  plugin. By that I meant that things wouldn't be exactly the same, be
  representative. Approximation doesn't mean 'almost completely
  different and unrepresentative in most cases'. The goal for the
  authoring is that I can look at it in Obsidian and get a pretty good
  sense of the layout and flow." Folded into this spec before the real
  piece, over a spec of its own: "spec 019 is now contingent on me
  authoring a full, real piece and a big part of that is getting all
  the pieces in place for authoring and design so we can start to
  tweak and refine things as I actually start to use them." The
  session's shape, to be seen: one block table mirroring the transform
  and pinned equal to it; the same figure markup in Live Preview and
  Reading view; widths as shares of the pane in the site's order;
  `held` as a float beside its paragraphs, no hold; a method line on
  the stage blocks; every share a tunable; interaction, motion and the
  site's typography and ground left out.
