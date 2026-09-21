# Spec: The hero stage

**Status**: Approved (2026-09-20) — written and approved in the spec conversation with
the product owner.
**Depends on**: 006 (the image page's stage and its quiet view, the
quiet dark), 007 (the pause's lights — the scroll-driven dimming this
spec borrows, and the pause block this spec leaves alone), 013 (the mat
as 6% of the frame), 015 (the mat as a hero treatment, the paper ground,
and the two deferrals this spec takes up: the stage's darker field and
the mat only where the ground goes dark).

## Summary

The image page's stage is the one presentation on the site where a
single photograph is the whole point. Since spec 015 it is also the one
place a white mat remains outside the quiet view, and on the paper
ground that mat reads faintly — an interim state 015 accepted and
stated. This spec gives the stage the arrival it was waiting for.

A reader who clicks a frame in a piece or a gallery lands on a dark
page: the ground a shade short of the quiet view's dark, the header,
the frame nav and the words beneath the stage dimmed to a faint
presence, and the photograph matted at the stage's size — the pause's
lights, without the pause's pin. Nothing is timed. As the reader begins to scroll, the
ground fades back to the page ground, the chrome comes up, and by the
time the frame has left the screen the page is the light page it has
always been and the words start. Scrolling back up reverses it exactly.

The photographer expects this spec to take some back and forth — trying
settings and tweaking them until it is right — so the spec builds that
in: the depth of the dark, the faintness of the chrome and the length of
the fade are live knobs under the dev server, with a way to see the
values, and the gate is allowed to loop until he names them.

This also closes the mat question spec 015 left open. The rule is now
simply stated: **the mat is worn where the ground is dark** — the stage
on arrival, the quiet view, the pause — and nowhere else. The stage
keeps its mat not as a special case but because its ground is dark when
the mat is seen. The pause mid-piece is untouched: the photographer
finds it unrefined but fixable, is not using it for now, and has not
decided what its fix is; that stays on the roadmap with his description
of what is wrong. The two animation ideas raised in this conversation —
a glow behind a dark frame, a scroll that settles — go to the roadmap
as well, not into this spec.

## Goals

1. **The heroic arrival.** On load, the image page's ground is dark —
   near the quiet view's dark, a shade lighter, so that the quiet view
   stays its own thing; the header, the frame nav, the quiet toggle and the
   label beneath the stage are dimmed to the faint presence the pause
   gives its words; the photograph is matted at the stage's size, the
   one thing at full strength. Nothing moves on its own — the arrival
   is a state the page is in, not a transition it plays.
2. **The scroll gives the page back.** The fade from the dark ground
   to the page ground, and the chrome from faint to full, run on the
   reader's scroll alone — no timer, no pin, no scene length. The fade
   completes about when the stage has left the viewport, so that the
   words are read on the page ground and the white mat is never seen
   sitting on paper for long. Scrolling up reverses it.
3. **The quiet view stays its own thing.** The arrival's dark is a
   shade lighter than the quiet view's, so that entering quiet view
   from the top still goes somewhere: the chrome goes, the frame grows
   to the viewport, and the wall goes the rest of the way down to the
   quiet dark. Leaving quiet view returns to the top, which is the
   arrival. How much lighter is the photographer's to choose by looking;
   he has said he does not yet know.
4. **The mat where the ground is dark, and nowhere else.** The rule,
   stated once and pinned: a white mat sits on the stage, in the quiet
   view and on the pause frame, each on a dark ground; every other
   frame on the site is bare. The compare's letterbox fill and slider
   divider stay white — they are the compare's own device inside its
   box, not a field around the photograph.
5. **Graceful without script, and under reduced motion.** Without
   script the stage sits in a dark field of its own — the arrival's
   dark, ending at the stage's edge, scrolling away with it, the header and
   the frame nav on the page ground (spec 015's recorded lean becomes
   the no-script look). Reduced motion changes nothing here: nothing is
   timed, and spec 007 kept the pause's scroll-driven dim under it.
6. **No flash.** A page that loads already scrolled — back navigation
   restoring a position, a link to a section — shows the light page at
   once, never dark for a frame and then light.
7. **Judged by looking, and tuned live.** The depth of the dark, how
   faint the dimmed chrome is, and how much scroll the fade takes are
   site knobs, not chosen in the plan. Under the dev server they are
   adjustable on the image page itself — the way spec 014's ground
   switch and the sampler's bars let the ground be tried on the real
   pages — with the current values shown so the photographer can name
   what he sees, and the chosen values land as the knobs' defaults. The
   gate is on both his screens, on real photographs, and may take more
   than one round: the spec expects back and forth, and the pause is
   written to be repeated until he says done, not to be passed once.
8. **Nothing else changes.** Pieces, galleries, places, the indexes,
   the quiet view's behaviour, the pause block, the ground tone and its
   family, the mat's colour and width, the stage's size and fit, and
   the social image are as spec 015 left them.

## Non-goals

- **The pause mid-piece.** Kept exactly as spec 007 and 015 left it —
  markup, CSS and script byte-identical, its white mat and its lights.
  What the photographer dislikes, in his words (2026-09-20): "the
  unrefined way the scrolling and text works right now. When you're
  scrolling down and the pause block starts, the text goes away and
  then it fades to dark and then back. It just feels unrefined right
  now but I'm not sure what the solution is yet." He is keeping it
  because it is fixable, and not using it meanwhile. Its rework, and
  spec 007's follow-ups folded into it, stay on the roadmap; this spec's
  close-out annotates that entry with the hero form taken and the
  description above.
- **A hero on a piece.** A piece opens with its title and lead and then
  its prose; its `cover` feeds the cards and the social image only.
  Whether a piece should open on a frame presented this way is a later
  question, not this spec's.
- **Motion of its own.** No timed or automatic animation: the arrival
  does not play, the fade does not run without a scroll. The glow
  behind a dark frame and the scroll that settles are on the roadmap
  ("Motion, considered") and need a design conversation first, since
  both cross spec 007's rule.
- **A dark mode.** The dark is the arrival's and the quiet view's; the
  site stays light-only, as spec 006 decided.
- **The quiet view's redesign.** It stays the fuller state — chrome
  gone, frame at the viewport's size — entered and left as today.
- **The ground tone, the mat's colour, width, floor and ceiling, the
  stage's fit.** Unchanged; spec 014's sampler and switch stay in the
  repo untouched.
- **A darker field on any other surface** — the place wall, a gallery,
  the related strip, the cover cards.
- **The header's focus-reveal rule, the arrow keys, set selection**, and
  every other image-page behaviour not named above.

## Key user flows

### Arriving

From a gallery or a piece, the reader clicks a frame. The image page
opens dark: the arrival's dark edge to edge, the header a faint line of
text at the top, the frame nav faint beneath, and the photograph in its
white mat, exactly the size the stage gives it today. Nothing moves.
The label under the stage, if the screen is tall enough to show it, is
there but faint.

### Reading down

The reader scrolls. Over the first stretch of scroll — about the height
of the stage — the ground lightens to paper and the chrome comes up to
full. By the time the frame has gone off the top of the screen the page
is the page as it was before this spec, and the label, the story, the
record, the compare, the passage, the related frames and the print
follow in their order, on the light ground, at full strength. Scrolling
back up darkens the page again in exact reverse.

### Stepping through a set

The arrow keys and the frame nav's previous and next each load a page,
and each page arrives dark — every frame in a set gets its arrival.

### Arriving mid-page

The reader comes back to an image page they had scrolled, or follows a
link to a section. The page shows the light page at once at that
position; the arrival is where the top of the page is, not a thing
that happens on load.

### Quiet view

At the top, the reader clicks the photograph or the toggle. The chrome
goes, the frame grows to the viewport, and the wall goes the rest of
the way down to the quiet dark — a step deeper than the arrival, so the
quiet view is still its own place. Escape or any click returns to the
top of the page — the arrival. From further down the page, the toggle
still enters quiet view as today.

### Tuning (the photographer, under the dev server)

On an image page under `npm run dev`, the photographer opens the tuning
control, moves the depth of the dark, the faintness of the chrome and
the length of the fade, scrolls up and down to see each, on both
screens, and reads off the values he likes. He reports them at the
pause; if he wants another round after seeing them landed, the same
control is still there.

### Keyboard

A keyboard user tabs into the dimmed header or frame nav on arrival.
The focused element is readable — the site's focus-reveal on the header
already exists; a focused control on the dimmed chrome is shown at a
strength the reader can read, and nothing is hidden from assistive
technology by the dimming, which is visual only.

### Without script

The page loads with the stage in a dark field of its own — the
arrival's dark, from the stage's top edge to its bottom edge, edge to edge of the
viewport — and the header, the frame nav and everything beneath on the
page ground at full strength. The field scrolls away with the stage.
Nothing dims and nothing fades.

## Design requirements

- **The arrival's dark is a shade lighter than `--color-quiet`**, the
  quiet view's wall, so that the quiet view deepens from it. It is its
  own token, defined once, and its starting value is the plan's to
  propose between the quiet dark and the pause's dimmed ground; the
  gate sets it. The photographer has said he does not know the value
  yet, and the tuning control exists so he can find it.
- **The chrome dims the way the pause dims its words**: toward the
  ground's dark, faintly there, never gone — the header, the quiet
  toggle and the label beneath the stage. The pause's depth for words
  is the starting value; the gate sets it. _Amended at gate round 1
  (2026-09-21): the frame nav is not in the dimmed set — it is the cue
  below._
- **A cue that there is more** (added at gate round 1, 2026-09-21, in
  the photographer's words: "when you enter the stage, it might appear
  to the user that that's it, just the image. It's not clear that there
  is more content underneath. I think we should make the image slightly
  smaller so that footer text underneath the image shows up at least
  partially, which is an indication to the viewer that there is more to
  scroll down to" — the text being "just the left and right links and
  what's in between", the frame nav). With script, the stage is shorter
  than the viewport by enough that the frame nav line — previous, where,
  next — sits fully above the fold at the top on both screens, at full
  strength on the dark wall, not dimmed. The photograph fits the
  shorter stage as it fits today (smaller only where it is height-bound;
  a width-bound landscape frame does not change). Without script and in
  the quiet view the stage keeps its full height.
- **The header stays, dimmed, rather than away.** The pause hides the
  header because the reader is mid-scene; here the reader has just
  arrived and the header is their way back. Lean, confirmed at the
  gate; "away" is the alternative if dimmed reads as broken.
- **The mat is unchanged**: spec 013's rule from the same three tokens,
  white, on the stage and in the quiet view; the pause frame's as spec
  007 left it. The rule "worn where the ground is dark" is stated in the
  docs and pinned by a test the way 015 pinned the presence table.
- **The fade's length is about the stage's height of scroll**, on a
  smooth curve, ground and chrome together, reversible; a site knob
  set at the gate on both screens. The frame itself does not move,
  scale or approach — the stage is not a pause.
- **A dev-only tuning control on the image page**, present under the
  dev server and absent from the build like spec 014's switch and the
  sampler: the depth of the dark, the chrome's faintness and the fade's
  length, each adjustable with its value shown, and a reset to the
  defaults. The chosen values are typed into the knobs' defaults by a
  task after the gate, as 015's ground was. The control is the plan's to
  shape (a query string, a small bar, the sampler's pattern); the spec
  asks only that it be quick to use and impossible to ship.
- **The state is a function of scroll position**, computed before the
  first paint that can show it, so a restored scroll position never
  flashes dark. No layout shifts: the stage's width and place are
  exactly today's, with and without script; its height with script is
  the cue's (above), decided before the first paint like the rest of
  the state, so nothing moves on load or on scroll.
- **Without script, the field is the stage's own background** — the
  arrival's dark, ending at the stage's edge, header and frame nav on the
  page ground — and the mat sits on it. The script extends the dark to
  the page and adds the fade; it does not create the hero.
- **Reduced motion**: unchanged behaviour, as spec 007's pause. Nothing
  here is timed.
- **The quiet view's own rules are untouched**: what it hides, how it
  is entered and left, its margin, its mat.
- **The social image is untouched**: its card is the generator's on the
  paper ground, and the arrival is a page state, not a card.
- **Docs follow.** Where spec 015's documents state the interim — the
  stage's white mat reading faintly on paper, the darker field
  deferred — they are corrected; `DECISIONS.md` gains this spec's entry
  (the mat's rule in its final form, and the pause kept with the
  photographer's words); `design/brief.md`'s palette note records the
  arrival; `AUTHORING.md` needs nothing, since nothing here is authored.

## Fixtures and authoring requirements

- No new fixtures: the ten real exports in `src/content/gallery-images/`
  and the fixture pieces' frames give image pages of both orientations
  to judge on. The gate is on real photographs, on both screens.
- Nothing is authored: the arrival is the page's, not a sidecar field.

## Carried from spec 015's sweep, for the plan

Small items the sweep logged for the next spec; none bears on
behaviour above, and each is the plan's to place: the cover card's
`sizes` hint against its unmatted render; `public/og.jpg`'s dimensions
asserted by nothing; the README's tree missing `DevGround.astro` and the
newer test files. (The sweep's note about spec 015's `spec.md` naming
front-door surfaces that were removed needs nothing: that spec is
frozen and its `plan.md` records it.)

## Acceptance criteria

- [ ] An image page opened at the top shows the arrival's dark edge to
      edge, the header, quiet toggle and label dimmed, the frame nav at
      full strength fully above the fold on both screens, and the
      photograph matted at the stage's size — with no timed motion of
      any kind. _(Amended at gate round 1, 2026-09-21.)_
- [ ] Scrolling down fades the ground to the page ground and the chrome
      to full over about the stage's height of scroll; by the time the
      stage has left the viewport the page is exactly the pre-spec page;
      scrolling back up reverses it.
- [ ] The arrival's dark is its own token, lighter than `--color-quiet`,
      and entering quiet view from the top deepens the wall to the quiet
      dark.
- [ ] Under the dev server the depth, the chrome's faintness and the
      fade's length are adjustable on the image page with their values
      shown and a reset; nothing of the control reaches the build.
- [ ] A page loaded at a restored or linked scroll position shows the
      light page immediately, with no dark frame first.
- [ ] Without script, the stage sits in a dark field ending at its own
      edge, header and frame nav on the page ground, and the field
      scrolls away with the stage.
- [ ] The mat rule is stated once and pinned by a test: worn on the
      stage, in the quiet view and on the pause frame; every other
      frame on the site bare; the compare's fill and divider white.
- [ ] The stage's width, place and fit are unchanged with and without
      script; with script the stage is shorter by the frame nav's
      height so that line sits above the fold at the top on both
      screens, and without script and in quiet view its height is
      unchanged; no layout shift is introduced on load or on scroll.
      _(Amended at gate round 1, 2026-09-21 — was "size, place and
      fit unchanged".)_
- [ ] The pause block's markup, CSS and script are byte-identical
      against `main`.
- [ ] Focus into the dimmed chrome yields a readable control; nothing
      is hidden from assistive technology by the dimming.
- [ ] The depth, the chrome's faintness and the fade's length are site
      knobs, and their values are the ones the photographer chose at the
      gate on both screens, recorded in `plan.md` and `DECISIONS.md`.
- [ ] Every 015 document that states the interim state is corrected;
      the pause's roadmap entry is annotated with the hero form taken
      and the photographer's description; the motion entry stands.
- [ ] `sh scripts/verify.sh` is green.

## Decided (in this conversation, 2026-09-20)

- **One spec for the stage's field, the mat rule and the pause's hero
  form** (product owner): "decisions about one directly affect the
  others, and they are all working together on the same topic." The
  pause's major use is the hero image; he is not convinced it belongs
  mid-piece.
- **The hero is the image page's stage on arrival** (product owner):
  "when the hero image is initially displayed (after clicking on an
  image from a piece or gallery) it displays it in a 'heroic' way, so
  we're taking part of the pause elements (darkened background,
  everything else dimmed) but I want it to be such that when you begin
  scrolling down, the background fades back into the normal ground and
  then the words start."
- **The whole viewport dark on arrival, lightening on scroll** (product
  owner, choosing between the stage's own strip and the whole-page
  dark): "I like the second one for now."
- **The pause mid-piece is kept, untouched** (product owner): "Let's
  keep it for now, since I think it's fixable and I can just not use it
  at the moment." His description of what is wrong is recorded under
  Non-goals for the spec that fixes it.
- **The arrival's dark is lighter than the quiet view's, value open**
  (product owner): "I'm thinking something slightly less dark so that
  the quiet view is its own thing. That being said, I'm not sure what
  exactly it should be yet." The tuning control and the repeatable gate
  follow from his next line: "I have a feeling this spec will require
  some back and forth with testing different settings and tweaking it
  to get it right."
- **The header dimmed rather than away; the fade about the stage's
  height; the no-script look is 015's strip lean; the quiet view
  unchanged; no hero on a piece** — the spec author's leans, accepted
  for now "since it's hard to weigh in on it without seeing it in
  action", each to be confirmed by looking at the gate.
- **The compare's fill and divider stay white** — carried from 015's
  default, unchanged unless the photographer says otherwise.
- **The stage shorter by the frame nav, as the cue that there is more**
  (product owner, gate round 1, 2026-09-21): "it might appear to the
  user that that's it, just the image … make the image slightly smaller
  so that footer text underneath the image shows up at least partially"
  — clarified as the frame nav ("just the left and right links and
  what's in between"), at full strength on the dark wall, the stage box
  shrunk (the photograph smaller only where height-bound), with script
  only. Header dimmed and the body's words undimmed confirmed; depth
  0.75, chrome 1, fade 1; "the line below the header looks good now".
- **The motion ideas go to the roadmap** (product owner): the glow
  behind a dark frame and the scroll that settles, as "Motion,
  considered", committed to `main` in this conversation.
