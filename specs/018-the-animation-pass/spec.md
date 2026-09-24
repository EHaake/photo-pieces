# Spec: The animation pass

**Status**: Approved (2026-09-23), **experimental** — see "The tuning
envelope" below: this spec expects to be tuned at its pauses, and says
what may change there without re-planning. Written in the spec
conversation with the product owner, who chose it from `ROADMAP.md` the same day as the
first step of "A design language of its own": "a considered animation
pass … this 'modernization' endeavor is large and this next step should
be a subset of it, not the entire thing." This is the design
conversation the roadmap's "Motion, considered" asked for; its answers
are recorded in the Decided section and, on the way to `main`, in
`design/brief.md`.
**Depends on**: 003 and 017 (the frames a piece places, and the stage
that hugs its frame), 006 (the image page, its quiet view, its sets and
arrows, its related strip), 011 and 012 (the galleries' packed rows and
the place wall), 014 (the dev-only switch on the real pages and the
barrier that keeps it out of the build), 002 (the layout's client
router, which already cross-fades every page change).

## Summary

The site moves today without ever having decided to. The theme left a
staggered entrance on the front door's hero, a slide on the header, a
fade on every link's underline and every button's hover; spec 006 gave
the quiet view a 220ms cross-fade of the ground while the photograph
jumps to its quiet size; and the layout's client router cross-fades
every page change for whoever's browser supports it. None of it shares
a duration or an easing, nothing is written down, and the photograph —
the one thing on the site worth moving carefully — pops in when it
decodes and cuts from a gallery cell to its own page.

This spec is the first step of the modernization and deliberately a
subset of it. It does four things to the photograph and one thing to
the site. A photograph appears once and never pops: its box waits in
the ground's family, and the photograph fades in when it has decoded,
or — below the fold — when the reader scrolls it into view. A
photograph travels to its page: clicking a frame in a piece, a gallery,
a place wall or a related strip carries that photograph, moving and
scaling, into the stage of its image page, and the way back reverses
it. The quiet view is one movement: the ground darkens and the
photograph grows into its mat together, and the return is the same in
reverse. And the site gains a motion grammar — a few named durations
and easings that every one of these, and every inherited transition,
draws from — with a rule written into the brief: **motion answers the
reader.** Every animation is a response to something the reader did
(arrive, scroll, click, hover, go to another page) or to something that
happened (a photograph finished loading). Nothing loops, nothing
breathes, nothing plays on its own. Spec 007's line — nothing moves
unless the reader scrolls — is widened to that and no further.

Two things the photographer named stay out, on the record. The light
that breathes behind the frame on the dark ground is the one idea the
rule above closes, and it is left for a later conversation rather than
decided against. The scroll that settles — the page easing to rest
rather than stopping dead — is out at his call: "I don't want to mess
with the page scroll behavior at this point. I may change my mind
later." Both stay on the roadmap.

## Goals

1. **A motion grammar, from tokens.** The site has a small, named set
   of durations and easings — a short one for state changes (a hover,
   an underline, the header's slide), a longer one for a photograph's
   movement (the travel to its page, the growth into the quiet view),
   and one for a photograph's appearance — declared once as tokens
   beside the mat's and the ground's, and read by every transition and
   animation on the site: the four behaviours below and every
   inherited one. No literal duration or curve anywhere else. The
   numbers are judged at the phase pause and written into the tokens
   and this spec; the grammar is recorded in `design/brief.md`.
2. **Motion answers the reader.** Every animation on the site is a
   response to the reader — arriving, scrolling, clicking, hovering,
   going to another page — or to a photograph finishing loading.
   Nothing loops, nothing breathes, nothing plays by itself, nothing
   moves on a timer. The rule is written into the brief as the site's
   own, replacing spec 007's narrower line, and pinned so that a later
   spec cannot add an idle animation without amending it.
3. **A photograph appears once, and never pops.** On every surface that
   shows one — a piece's frames in every treatment, the held frame
   included; a gallery's rows; the place wall; the image page's stage
   and its related strip; the covers on the pieces, galleries and
   places indexes and the front door — the frame's box is reserved
   before the photograph arrives, in a quiet fill of the ground's
   family, and the photograph fades in once it has decoded. A frame
   below the fold appears when it is both decoded and scrolled into
   view, once, as an arrival: a fade alone, or a fade with a small rise
   — the two candidates are built and the photographer picks at the
   pause. A frame in view when the page is ready fades on decode and
   never rises. Prose never animates, cells of one block arrive
   together, and a photograph the browser already holds when the page
   is ready shows at once.
4. **The photograph travels to its page.** Clicking a frame that links
   to its image page carries that photograph from where it sat — the
   cell, the piece's frame, the wall, the strip — into the stage's box
   on the image page in one motion, moving and scaling at the grammar's
   longer duration, while the rest of the page cross-fades beneath it.
   The way back — the browser's back, or the image page's own links to
   the piece, gallery or place the reader came from — reverses it: the
   photograph shrinks back into its cell where the reader left it. The
   arrows between image pages cross-fade the photograph in its box; no
   travel, no slide. Every other page change keeps the cross-fade it
   has today, on the grammar's duration. The photograph is never
   blank between the click and the stage.
5. **The quiet view is one movement.** Clicking the photograph on its
   page darkens the ground and grows the photograph from the stage's
   box into its matted quiet box together, at the grammar's longer
   duration; Esc or a click returns the same way in reverse. Its
   resting states — the bare stage on paper and the matted quiet view
   — are exactly spec 017's; only the way between them changes.
6. **Reduced motion keeps the fades and drops the movement.** Where a
   reader's system asks for reduced motion, every cross-fade the site
   controls keeps its duration — the photograph still does not pop —
   and everything that moves, grows, slides or rises is instant: the
   travel, the quiet growth, the rise, the header's slide, the hero's
   entrance. The one blanket rule that today collapses everything to a
   millisecond is replaced by that distinction.
7. **The inherited motion is decided, not inherited.** The header's
   slide, the link underline, the button and social-link hovers and
   the front door's staggered hero entrance are brought onto the
   tokens with their feel unchanged; whether the hero's entrance stays
   at all is the front door spec's question, not this one's.
8. **Judged on the real pages, on both screens.** A dev-only switch on
   the real pages — the ground switch's pattern — turns each of the
   four behaviours on and off, chooses the arrival's shape and the
   waiting box's fill, and tunes the durations and easings, so the
   photographer decides on the piece, the gallery, the place and the
   image page he actually has, on the laptop and the DualUp, with a
   mouse and a trackpad. Nothing of it ships: the build's barrier
   proves it.
9. **The record tells the truth.** `design/brief.md` gains a Motion
   section; spec 007's non-goal is annotated with the rule that widened
   it; `README.md` and `AUTHORING.md` say what a reader and a writer
   will notice (nothing to author); `DECISIONS.md` and `ROADMAP.md`
   gain this spec's outcome, "Image loading choreography" struck,
   "Motion, considered" and "A design language of its own" annotated,
   the settle and the glow left open in the photographer's words.

## Non-goals

- **The scroll settle.** The page's scroll is the browser's, on every
  input: no easing, no smoothing, no capture of the wheel. The
  photographer's decision, recorded: "I don't want to mess with the
  page scroll behavior at this point. I may change my mind later,
  though, so please record that." The roadmap keeps it.
- **The glow — a light that breathes behind the frame on the dark
  ground.** The rule this spec writes closes it (motion with no reader
  behind it); it is left for a later conversation, not decided
  against. The roadmap keeps it.
- **The rest of the modernization.** The front door, the reading
  typography pass, the slow view, the design language's other passes:
  the entries above stay open. This spec is a subset.
- **Motion for its own sake.** No hover scale or zoom on a photograph,
  no parallax, no staggered reveal of cells within one block, no
  shimmer or skeleton, no spinner, no entrance on any page but the
  front door's inherited one, no animation of prose.
- **Any change to the vocabulary or the frames' geometry.** The eleven
  treatments, the held block, the stage's rule, the galleries' packing
  and the wall are untouched at rest; every resting state on the site
  is byte-identical in its rules. Only the way between states is new.
- **An animation library.** The means are the stylesheet and what the
  browser provides; a new runtime dependency is not on the table
  unless `plan.md` names one and says why, per the constitution.
- **The Obsidian plugin**, the social images, search, the feed.
- **A photograph that is not yet there.** The waiting box is a fill,
  not a blurred or low-resolution preview of the photograph.

## Key user flows

- **Reading a piece.** The page arrives with its first frame's box
  reserved; the photograph fades into it as it decodes, and the prose
  is already there. Scrolling down, each frame appears once as it
  comes into view — a fade, or a fade with a small rise, as the pause
  decides — and then sits still. A diptych's two frames appear
  together. The held frame arrives like any other and then holds.
  Nothing moves that the reader did not scroll to; scrolling back up
  finds every frame where it was, still.
- **Clicking into a photograph.** From a piece, a gallery, the place
  wall or a related strip, the photograph the reader clicked lifts
  from its cell and settles into the stage of its own page while the
  page beneath it becomes the image page; the title, the wall label
  and the words are there when it lands. It never blinks or goes
  blank on the way. Back — the browser's or the page's own link —
  returns the photograph to its cell, and the reader to where they
  were.
- **Stepping through a set.** The arrows and the keys cross-fade one
  photograph into the next in the stage's box, the words changing
  beneath; nothing slides.
- **The quiet view.** A click on the photograph: the ground goes dark
  and the photograph grows into its white mat as one movement. Esc or
  a click: the same movement back to the bare stage on paper.
- **A reader who asked for less motion.** Photographs still fade in
  rather than pop; nothing travels, grows, rises or slides — the image
  page is simply there, the quiet view simply dark.
- **A reader without script, or an older browser.** Every photograph
  is visible; pages change as they do today; a browser without the
  view-transition machinery cuts to the quiet view rather than fading
  the ground, its one visible difference. Nothing is hidden waiting
  for a script that never runs.
- **Writing a piece.** Nothing to author: the frames a writer places
  animate by the site's rules. The plugin does not change.
- **Judging it.** Under the dev server the photographer opens the fog
  piece, a gallery, the headlands and an image page on both screens,
  and from the switch turns each behaviour off and on, tries both
  arrivals and both fills, and moves the durations until they feel
  right — then says so at the pause, and the numbers become the
  tokens.

## Design requirements

- **The grammar.** Durations and easings are tokens declared once in
  the global stylesheet beside the mat's and the ground's tokens, and
  every `transition` and `animation` on the site reads them — the
  four behaviours here, the header, the links, the buttons, the social
  links, the hero, the quiet view's ground. A test scans the built
  stylesheet and every page's styles for a literal duration or curve
  in a transition or animation declaration outside the token block,
  and fails on one. The set is small: on the order of three durations
  and two curves; the plan names them, the pause sets their values.
- **The rule, pinned.** No animation on the site iterates, runs
  infinitely, or starts on a timer; the test above also fails on an
  infinite iteration count or an `autoplay`. The brief's Motion
  section states the rule in the words of Goal 2 and lists what it
  closes (the glow) and what stayed out by choice (the settle).
- **Appearance.** Every photograph's box is reserved by its intrinsic
  dimensions before it loads — as Astro's image pipeline already does
  in a piece, and as every page must, so nothing shifts when a
  photograph arrives, measured as zero layout shift on a piece, a
  gallery, the wall and the image page. The waiting box's fill is a
  step from the ground (the existing surface fill) or the ground
  itself, chosen at the pause from the switch. The fade is on the
  photograph alone, at the grammar's appearance duration. The hidden
  state is set by script, never by the stylesheet alone: without
  script every photograph is visible, pinned by a test that finds no
  frame hidden by default in the built output. A photograph in view
  that has already decoded when the script runs shows at once, with no fade
  and no rise — so returning to a page does not replay its arrivals.
- **Arrival below the fold.** A frame not in view when the page is
  ready appears the first time it enters the viewport, once its
  photograph has decoded — whichever comes last; it then stays (superseded at the Phase 1 pause). Two
  candidate shapes, both built, chosen at the pause and recorded in
  this spec: a fade alone; a fade with a rise well under a line's
  height. A block with several cells (diptych, triptych, grid, strip,
  row) arrives as one, with no stagger. The threshold at which a frame
  counts as in view is a small share of it, so a tall frame does not
  wait until most of it is on screen. A frame in view when the page is
  ready never rises.
- **The travel.** Where a frame links to its image page, the click
  carries the photograph — not the whole cell, not its label — from
  its rendered box to the stage's box, moving and scaling in one
  motion at the movement duration and curve, the page beneath
  cross-fading; the browser's own view-transition machinery, which the
  layout's router already uses, is the expected means, and where a
  browser lacks it the page changes exactly as today. The way back
  reverses it: browser back and the image page's "way back" links to
  the piece, gallery or place the reader came from, with the reader's
  scroll position restored so the photograph lands in its own cell.
  The arrows and arrow keys between image pages cross-fade the
  photograph in place. The header, being chrome, does not travel and
  does not flash. The photograph seen on the previous page stays in
  the stage's box until the image page's own file has decoded, so
  there is never a blank or a blink between the click and the stage.
- **The quiet view.** Entering and leaving are one movement each: the
  ground's darkening and the photograph's growth into its mat share
  the movement duration and curve, and the mat arrives with the growth
  rather than after it. The two resting states are spec 017's,
  byte-identical in their rules; the geometry of the quiet box, the
  mat's share and the stage's rule are untouched. The movement uses
  the browser's compositor (opacity and transform, or the view
  transition machinery), not an animation of the layout.
- **Reduced motion.** Under `prefers-reduced-motion: reduce`, every
  cross-fade the site controls keeps its duration and every movement
  is instant — travel, growth, rise, the header's slide, the hero's
  entrance. The global rule that today collapses every transition and
  animation to one millisecond is removed in favour of that
  distinction, pinned by a test on the stylesheet: under the media
  query no transform or size transition has a duration, and no opacity
  transition has lost one. A page change under reduced motion keeps
  its cross-fade — a fade, within this rule; the planner found Astro 7's
  router has no reduced-motion path of its own on a site without
  per-element transition directives, correcting the draft's claim that
  it cuts.
- **The dev switch.** A dev-only control on the real pages, in the
  ground switch's pattern — inline, guarded by the build-time
  constant, remembered in the browser — with a toggle per behaviour
  (appearance, arrival, travel, quiet), a choice of arrival shape and
  waiting fill, and the durations and curves as fields. It sets the
  tokens on the document, the way the ground switch does, so the
  committed stylesheet is the control. The existing barrier fails the
  build if its marker ships. It stays in the repo after the pause, as
  the ground switch and the page-head sampler did.
- **Performance.** Nothing here adds a request or a byte to a page's
  photographs; the fades and movements run on the compositor; an
  observer, where one is used, does work only when a frame arrives or
  leaves, and disconnects when the page is left (amended at the Phase 1
  pause). Judged smooth on both screens at the pause.
- **The documents.** `design/brief.md` gains a Motion section (the
  rule, the grammar's names and values, what stayed out); spec 007's
  "Timed or automatic motion" non-goal gains one line naming this
  spec's rule; `README.md`'s description of the site's behaviour
  mentions the appearance, the travel and the quiet view's movement,
  and `AUTHORING.md` says a writer has nothing to do; `DECISIONS.md`
  gains a "Spec 018" entry in the photographer's words; `ROADMAP.md`
  strikes "Image loading choreography" and "A considered animation
  pass" as done here, and annotates "Motion, considered" (the glow
  deferred by the rule; the settle out at the photographer's call, to
  be revisited if he changes his mind) and "A design language of its
  own" (first step taken) — drafted on the branch, applied to `main`
  after the merge.

## Fixtures and authoring requirements

- **No new photographs, no frontmatter or schema change, no new
  dependency.** The ten real exports, the sample pieces, the six
  galleries and the two places are the fixtures; the pause is judged
  on them.
- **No change to any piece, sidecar, gallery or place file**, and
  nothing new for a writer to learn. `AUTHORING.md` says so in a line.
- **The Obsidian plugin is untouched.**

## The tuning envelope

This spec is experimental, at the product owner's word: "I don't know
what will work best without seeing them working in person. So, I'd like
to make sure that we can change, add and tweak certain aspects of the
spec during implementation without requiring expensive re-planning
etc, unless deemed absolutely necessary." The workflow's ordinary rule
— a change to what the spec promises is a spec amendment, re-planned
and re-signed — is relaxed here, deliberately and within a stated
boundary, so that a look at the pause can end in "try it this way" as
often as it needs to.

**What may change at a pause, without re-planning or a new sign-off.**
Any of the following, decided by the product owner from the dev switch
on the real pages, is recorded by the orchestrating session as one line
in this spec's Decided section and one sub-lettered task in `tasks.md`
(the task: set the value, update the pinned test's expectation, run the
verification), and dispatched as a routine task:

- every number — durations, curves, the rise's distance, the in-view
  threshold, the waiting fill's step, the hero's stagger;
- the arrival's shape (fade alone, fade with a rise) and the waiting
  fill (surface step, bare ground);
- which surfaces get the arrival, and whether the covers on the
  indexes and the front door take the appearance at all;
- whether any one of the four behaviours ships **switched off** — the
  code stays, the token or flag turns it off, and the test pins the
  off state — including the hero's inherited entrance;
- how a multi-cell block arrives (together, or with a stagger the
  photographer asks to see), and whether the arrows cross-fade or
  slide;
- the reduced-motion split for any one behaviour, within Goal 6's
  principle (a fade may stay or go; a movement is always instant).

**As many rounds as it takes.** The phase pause may run several looks;
each round is a sub-lettered task (`T16xxa`, `b`, …), reviewed with the
phase, and the phase's review checks the code against the outcome
recorded in this spec, not against the first draft of it.

**What still needs the ordinary path** — a spec amendment, the planner
re-dispatched on the changed section, and a sign-off:

- a fifth behaviour, or a surface the four do not name (the scroll
  settle, the glow, a hover effect, an entrance on any other page);
- a change to any resting state — the stage's rule, the quiet box, the
  galleries' packing, the wall, a frame's geometry;
- a change to the rule of Goal 2;
- a new dependency, or a change to what a writer authors;
- anything the orchestrating session or the reviewer judges to reach
  beyond this list — "deemed absolutely necessary" is theirs to
  raise and the product owner's to decide.

**What the plan owes this section.** Every tunable above must be a
token or a single flag that the dev switch sets on the document and a
test pins by name, so that a round is one value in one place and the
test's expectation beside it — never a re-implementation. The plan
says where each lives.

## Acceptance criteria

- [ ] Duration and easing tokens exist, declared once; every transition
      and animation on the site reads them; a test finds no literal
      duration or curve in a transition or animation declaration
      outside the token block, and no infinite iteration or timer-
      started animation — pinned
- [ ] `design/brief.md` has a Motion section stating the rule (motion
      answers the reader; nothing loops, breathes or plays by itself),
      the grammar's names and values, and what stayed out (the glow,
      closed by the rule and left open; the settle, out at the
      photographer's call, to be revisited)
- [ ] On a piece, a gallery, the place wall, the image page and the
      three indexes, every photograph's box is reserved before it
      loads, measured as zero layout shift; the box waits in the fill
      chosen at the pause; the photograph fades in on decode at the
      appearance duration
- [ ] Without script every photograph is visible: no frame in the built
      output is hidden by default — pinned by a test on `dist/`
- [ ] A frame below the fold appears when it is both decoded and
      scrolled into view, in the shape chosen at the pause, and appears
      again each time it comes back on screen after leaving it (amended
      at the Phase 1 pause — see "Amended at the Phase 1 pause"); a frame in view when the page is ready never rises; a
      multi-cell block arrives as one; a photograph in view and already
      decoded when the page is ready shows at once with no animation; measured
      on both screens
- [ ] Clicking a frame in a piece, a gallery, the place wall and a
      related strip carries the photograph into the stage's box in one
      motion at the movement duration, the page cross-fading beneath;
      browser back and the image page's way-back links reverse it with
      the scroll position restored; the arrows and arrow keys cross-fade
      the photograph in place; the photograph is never blank between
      the click and the stage; measured on both screens; where the
      browser lacks the machinery the page changes as today
- [ ] The quiet view's entry and exit are each one movement — the
      ground's darkening and the photograph's growth into its mat
      together, the mat arriving with the growth — at the movement
      duration; the two resting states' rules are byte-identical to
      `main`; measured on both screens
- [ ] Under reduced motion every cross-fade keeps its duration and
      every movement is instant; the one-millisecond blanket rule is
      gone — pinned by a test on the stylesheet and measured in a
      browser with the setting on
- [ ] The header's slide, the link underline, the button and social
      hovers and the hero's entrance read the tokens with their feel
      unchanged
- [ ] The dev switch toggles each behaviour, chooses the arrival's shape
      and the waiting fill, and offers a few named settings to switch
      between for the appearance (amended at the Phase 1 pause) on the
      real pages under `astro dev`; the build's barrier proves none of
      it ships
- [ ] The photographer has judged all four behaviours on both screens
      with a mouse and a trackpad at the phase pause, over as many
      rounds as it took, and named the arrival's shape, the waiting
      fill, the behaviours kept on, and the durations and curves kept,
      each round recorded in this spec's Decided section
- [ ] Every value and choice the tuning envelope names is one token or
      one flag, set from the dev switch and pinned by a test by name,
      so a round is one edit and its test's expectation
- [ ] No page gains a request or a byte of photograph; no animation
      library is added
- [ ] The whole test suite green; the build with its barriers green;
      `README.md`, `AUTHORING.md` and `design/brief.md` updated; spec
      007's document annotated; the `DECISIONS.md` and `ROADMAP.md` text
      drafted on the branch

## Amended at the Phase 1 pause (2026-09-23)

The photographer's walkthrough, in his words: "What I love is how when
you click on an image on a piece, it grows into the hero stage and then
go back (click back on the browser), it shrinks back to it's place in
the piece. This is fantastic and perfect. The image appearance when
scrolling down however, needs some work. For one, while I don't want
the animation to be intrusive, right now it's too fast and subtle, I
barely see it. Additionally, when it fades in, I can see a ghostly
outline that often doesn't match the shape of the actual image that
then appears. … there are too many [settings] in the motion panel and
it's not clear what changes which. I'd like you to simplify this menu
and/or offer specific settings I can switch between rather than
specifying them exactly. For the film strip, I'm fine with them loading
one by one … I also think that images shouldn't just animate when they
first appear. It should happen every time they appear on the screen, so
scrolling down and back up. Again, the animations need to be tweaked
such that they are noticeable but not intrusive."

What changes, outside the tuning envelope and so amended here:

- **A photograph appears each time it comes on screen**, scrolling down
  and back up — Goal 3's "once" and "it then stays" and AC 5's "once …
  then stays" are superseded. It still never pops, and prose still
  never animates. Assumed unless the photographer says otherwise: a
  frame that leaves the screen resets without a visible fade-out; the
  way back from an image page still lands on what the reader saw
  without replaying it (the travel he called perfect); a frame in view
  when the page is ready still fades on decode and never rises.
- **The dev switch offers a few named settings** for the appearance,
  each setting its duration, curve and shape together, so the
  photographer switches between them instead of typing values; the
  four behaviours' on/off and the fill stay; the raw values are out of
  the way (AC 10 amended).
- **The appearance is too quick and too faint** — a tuning question
  answered through the named settings (the envelope's own ground).
- **The ghostly outline** that does not match the photograph as it
  fades in is a finding, not a round: diagnosed and fixed.
- **The travel is kept as built**; strips arriving frame by frame are
  kept.

## Decided (in this conversation, 2026-09-23)

- **The next spec is a considered animation pass, a subset of the
  modernization** (product owner): "I'd like to include in the roadmap
  (and the next spec) a considered animation pass. I'm sure it's in
  the roadmap somewhere that I want to make site feel a bit more
  modern. Part of this modernization will probably be to include some
  carefully considered and implemented animations. I do want to note
  that this 'modernization' endeavor is large and this next step
  should be a subset of it, not the entire thing." Written into
  `ROADMAP.md` first, on `main` (b307212).
- **The rule bends to "motion answers the reader" and no further**
  (product owner, from three options: the rule widened but closed;
  bent once for the glow; spec 007 kept strictly). Every animation is a
  response to the reader or to a photograph loading; nothing loops,
  breathes or plays by itself. The glow stays a later question.
- **Four surfaces are in** (product owner, all four offered): the
  photograph travelling to its page; the image loading choreography;
  the quiet view as one movement; frames arriving on scroll.
- **Reduced motion keeps the fades and drops the movement** (product
  owner, over "everything instant").
- **The scroll settle is out** (product owner, reversing a first
  answer given under a misreading — he had taken the question to be
  about the images, not the page): "I don't want to mess with the page
  scroll behavior at this point. I may change my mind later, though,
  so please record that." Recorded here, in the brief and on the
  roadmap.
- **The arrival's shape is judged at the pause** — the spec author's
  lean, taken when the question went unanswered: a fade alone and a
  fade with a small rise are both built behind the dev switch and the
  photographer picks by eye on both screens; the pick is a line in
  this spec, not a plan decision. Likewise the waiting box's fill
  (the surface step or the bare ground).
- **The spec is experimental, with a tuning envelope** (product owner,
  at the draft's approval): "this spec is experimental and so I don't
  know what will work best without seeing them working in person. So,
  I'd like to make sure that we can change, add and tweak certain
  aspects of the spec during implementation without requiring
  expensive re-planning etc, unless deemed absolutely necessary." The
  envelope above is the spec author's reading of "certain aspects":
  every value, shape, fill, on/off and surface within the four
  behaviours; not a fifth behaviour, a resting state, the rule, a
  dependency or the authoring.
- **A strip's frames arrive one by one, not as one** (implementation,
  2026-09-23, decision review): a strip's band scrolls sideways, and the
  browser does not fetch a frame past its edge, so waiting for the whole
  strip left it blank on the 16:10 screen until the reader scrolled it
  to the end; fetching early would add requests. Each strip frame
  arrives as it enters the band's visible width. Diptychs, triptychs,
  grids and rows still arrive as one. A round at the pause can ask for
  the frames visible in the band to arrive together.
- **The spec author's other leans**, open to the product owner at the
  draft: cells of one block arrive together, never staggered; the
  arrows cross-fade in place rather than slide; the hero's inherited
  entrance is kept on the tokens and left to the front door spec; no
  hover scale on any photograph; the browser's view-transition
  machinery, already in the layout's router, is the expected means for
  the travel, with an older browser changing pages as today; no
  animation library.
