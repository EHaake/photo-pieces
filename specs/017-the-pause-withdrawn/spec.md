# Spec: The pause withdrawn, and the stage refit

**Status**: Approved (2026-09-22) — written in the spec conversation
with the product owner from the answers settled at spec 016's second
look the same day (`ROADMAP.md`, "The pause and the hero leave the
site"; `DECISIONS.md`, "Spec 016: the hero stage — built, then
withdrawn"). The constitution's block-vocabulary clause was amended
first, in its own commit on `main` (7747217). **Amended the same day,
after sign-off and before implementation**: the stage's geometry — the
box that hugs the frame and the sizing across screen shapes, parked on
the roadmap as the next spec — folded in at the product owner's call
("we're getting too narrow on specs … both of these are relevant here,
so they should be handled together").
**Depends on**: 007 (the pause and the held block, which this spec
separates: one leaves, one stays), 013 and 015 (the mat rule and the
one surface it was left on), 006 (the image page's stage, its frame
nav and its quiet view). Spec 016 is not a dependency: nothing of it
reached `main`. Three of its decisions are carried here as decisions,
not as code — the mat rule as it stated it, the cue, and the held block
unchanged.

## Summary

The photographer has used the pause and the hero built on it, and does
not want them: "more of an obstacle to the enjoyment and reading
experience of a piece than an improvement. The viewer can still click
into the image to view the Quiet View." Spec 016's hero is already
gone — closed unmerged, archived on its branch and tag. This spec takes
the pause out of the site: the block leaves the vocabulary, its
presentation and its script leave the piece page, its fixtures and its
documentation go with it, and a piece that still writes it fails the
build, naming the piece, the way every unknown block does. The held
block, the other half of spec 007, stays exactly as it is.

Two things the hero decided survive it and land here, because they were
never about the arrival. The mat rule spec 016 stated — worn where the
ground is dark — now means one surface: the quiet view. The image page's
stage, on paper, is bare like every other frame on the site, which is
what the photographer asked for at spec 015's gate. And the cue he asked
for at spec 016's first look — the stage shorter by the frame nav's
height, so the previous / next line sits above the fold and says there
is more below — is kept on the paper stage, always, not only under an
arrival that no longer exists.

The pause is withdrawn, not condemned. Its code is `main`'s history up
to this spec; its rework, if the day comes, starts from the archive.

The stage itself is refit in the same spec, from the photographer's
two other findings at the same look. Today the stage is a box the
height of the screen with the photograph centred in it, so on a tall
screen a landscape frame sits small in a field of empty ground with the
title far below the fold, while a portrait frame runs much larger. What
he wants: the photograph centred and as large as its rule allows, sized
evenly across 2:3 and 3:2 and across his two screens, and the title and
text following directly beneath it at the distance a piece keeps
between a frame and its prose — the box hugs the frame; nothing is
pushed off the screen by empty space.

## Goals

1. **The pause leaves the vocabulary.** `pause` is no longer a block a
   piece can write. The transform, the piece page's styles and script,
   the Obsidian plugin's list, the sample pieces, the tests that pinned
   its shape, and every document that describes it drop it — with no
   reserved name, no stub, no hidden alias, the way the constitution
   reserves nothing for `sequence`.
2. **A piece that still writes it fails the build, by name.** Building
   a piece with `::pause` (or the container form) stops with the closed
   vocabulary's error: the piece's file and line, the directive's name,
   and the blocks that exist. Nothing renders in its place and nothing
   is silently dropped. This is the only migration tool: the
   photographer rewrites the frame into another treatment where the
   build tells him to.
3. **The held block is untouched.** Its markup, its styles, its script
   and its tests behave exactly as before — prose passing beside a frame
   that stays, side or bleed, collapsing where no column fits. What the
   piece page's script did for the pause is removed; what it does for
   the held frame is not.
4. **The mat is worn where the ground is dark, and nowhere else.** The
   quiet view keeps its white mat at spec 013's rule; the image page's
   stage in its normal view, on paper, is bare — the photograph's box is
   the frame's box, no residual padding or field. No other surface
   gains or loses anything. The rule is stated in the docs and pinned
   by a test the way spec 015 pinned the presence table.
5. **The stage hugs the frame.** On the image page's normal view the
   stage's box is the photograph plus one fixed spacing above and
   below — the distance a piece keeps between a frame and its prose —
   and the previous / where / next line and the title follow directly.
   No screen-height box, no empty ground the photograph does not fill.
   The cue survives as part of the height rule: a photograph can never
   be so tall that the frame nav line falls below the fold on arrival,
   on either of the photographer's screens, with and without script.
   The quiet view keeps its own height and rules.
6. **Sized evenly across screen shapes.** A 2:3 and a 3:2 photograph
   are the same rectangle turned — one long side, one short side —
   and that rectangle is as large as the screen allows: its long side
   is the smaller of the width the page offers and the height the
   first screen offers below the header, with the nav line and the
   spacing taken out. On the 16:10 laptop the height decides, on the
   DualUp the width, and a landscape frame may run wider than the text
   column where the page has the room, as a piece's wide frame does.
   No pixel size anywhere; the rule is a share of the screen. The
   photographer judges the result on both screens at the phase pause,
   with the alternative (equal area rather than equal sides) named
   there if the equal rectangle reads wrong.
7. **Nothing else of the pause's family moves.** The quiet dark, the
   quiet view's rules, the ground and its fills, the social images, the
   galleries, the place wall, the compare figure (its fill and divider
   white, as spec 015 left them) are unchanged.
8. **The record tells the truth.** Spec 007's documents are annotated
   as half-withdrawn, not rewritten; `README.md`, `AUTHORING.md`, the
   plugin's README, and `design/brief.md` describe the site without the
   pause and with the mat rule and the cue; `DECISIONS.md` and
   `ROADMAP.md` gain this spec's outcome, drafted on the branch and
   applied to `main` after the merge.

## Non-goals

- **The stage's mat, ground and quiet view beyond what Goals 4–6
  say.** The quiet view is untouched in every rule; the compare figure,
  the passage and the words beneath the title keep their own layout
  once the stage above them is shorter — only the title block's top
  spacing changes, to the piece's.
- **A piece's frames.** The fit rules of single, wide, fullbleed, tall
  and the rest are not re-derived; the stage's rule is the stage's.
- **The arrival, in any form.** No dark opening, no dimmed chrome, no
  fade, no tuning bar, no darker field for the stage. All of it is on
  the archive branch for the day it is revisited.
- **A replacement treatment.** Nothing new joins the vocabulary. A
  panorama that was a pause becomes a fullbleed, a wide, or a single —
  choices the vocabulary already offers.
- **The pause's rework.** Spec 007's follow-ups about the pause (a tall
  frame on a short viewport, the half-screen of words after it, the
  header's focus-reveal during a scene, a pause in a sidecar story, the
  lights' element list) are moot on `main` and stay on the roadmap only
  as notes for the archive.
- **Any change to the held block**, including its own follow-ups.
- **The Obsidian plugin beyond dropping the pause** from its block
  list and its README. Installing the plugin in the vault is the
  photographer's step, as always.
- **A migration script.** The build's error is the migration.

## Key user flows

- **Reading a piece.** Every frame sits on the ground as spec 015 left
  it; the held frame passes beside its words as spec 007 built it;
  nothing in a piece pins, dims, or scales. The sample piece that had a
  pause reads on as a piece with a fullbleed panorama in its place.
- **Arriving on an image page.** The page opens on paper, the header at
  full strength, the photograph bare and centred across the page just
  below the header, as large as the rule allows; directly beneath it,
  at a piece's spacing, the previous / where / next line, then the
  title and the words. On the laptop a 3:2 frame and a 2:3 frame show
  the same long side and short side, turned; on the DualUp the same,
  larger. Nothing sits below the fold that empty ground pushed there.
  Where the frame belongs to no set the line is absent and the title
  follows at the same spacing.
- **The quiet view.** A click takes the photograph to the quiet dark in
  its white mat, as large as the screen allows, exactly as today; a
  click back returns to the bare stage on paper.
- **Writing a piece.** The photographer writes with the eleven
  treatments and the held block; the plugin previews those and does not
  know the pause. If a piece in the vault still carries a `::pause`,
  `astro dev` and `astro build` stop on it with the piece's file and
  line and the list of blocks that exist, and he rewrites the frame.
- **Revisiting the pause.** Someone who wants it back reads `main`'s
  history up to this spec's merge for the block, and
  `archive/016-the-hero-stage` for the hero built on it.

## Design requirements

- **The removal is whole.** No `pause` handler, no pause-shaped sizes
  hint, no pause geometry mirrored from the stylesheet, no `--pause-*`
  token, no `data-pause-*` or `data-scene-*` attribute on the document,
  no pause selector in the piece page's script, no pause surface in the
  dev matte sampler, no pause entry in the passage-by-body-kind table,
  and no test that names it except the one that proves it is gone. A
  grep for the word across `src/`, the transform, the tests and the
  plugin finds only that test, this spec's directory, the roadmap and
  decisions record, and the annotations in earlier specs' documents.
- **The error is the closed vocabulary's, not a special case.** The
  transform does not recognise `pause` in order to reject it; it fails
  to recognise it, and the existing error carries the name, the file,
  the line, and the known blocks. A test builds a piece body with a
  `::pause` and asserts the failure names the directive and the
  piece.
- **The held block's rules stand alone.** Any rule spec 007 wrote as
  shared between the two durational blocks ("leave words after a
  pause", the scene, the lights) is either the held block's own,
  restated for it alone, or gone. The held block's tests pass unchanged.
- **The mat rule from the same three tokens.** The quiet view's mat is
  spec 013's, from the same tokens, unchanged. The stage's normal view
  declares no mat and no matte fill; the fit formulas that read the mat
  read zero from the single source spec 013 built, as spec 015 did on
  every other surface. The presence test's table has one matted
  surface. The compare's white fill and divider are the compare's own
  and stay.
- **The box hugs the frame.** The stage on the normal view has no
  minimum height; its box is the frame plus one spacing above and one
  below, the spacing a piece's flow keeps between a frame and prose,
  from that token — not a share of the screen, not a new value. The
  frame is centred across the page. The nav line and the title follow
  in flow at that spacing: the title's own block adds no top padding of
  its own above it, so the distance from the photograph to the nav line
  is the spacing, and from the nav line to the title the spacing again
  (the title alone at the spacing where the frame has no set). Below
  the title, the words keep their layout. In the quiet view the stage
  keeps today's rules entirely.
- **One rectangle, turned.** The frame's long side is
  `min(available width, available height)` where the available width
  is the page's width less its side pads (not capped at the text
  column) and the available height is the first screen below the
  header less the nav line's height and the two spacings, the nav
  line's height stated once as a token its own rule claims so the two
  cannot drift; no script, no measurement, no gate value; the same
  with and without script. That long side and two-thirds of it make
  the reference rectangle — the 3:2 frame's — and every frame fits
  inside that rectangle, turned to suit it, as large as it can while
  touching at least one side: a 3:2 frame is the long side wide, a 2:3
  frame the long side tall, a square frame is the short side on each
  side, a panorama is the long side wide and shallower, a 4:5 frame
  the short side wide. No frame is ever taller than the height rule
  allows or wider than the page. The responsive image's sizes hint
  follows the same rule so the browser fetches the width it will show.
  A test pins the formula to its tokens over a spread of ratios.
- **No layout shift.** The frame's size and place are decided by the
  stylesheet before the first paint, as today.
- **The pause is where the photographer judges it.** The Phase 0 pause
  shows both screens; if the equal rectangle reads wrong — a landscape
  frame too small beside a portrait of the same short side — the
  alternative named for the next look is equal area, and the choice is
  a spec amendment, not a plan decision.
- **The documents.** `README.md`'s block table loses its `pause` row
  and footnote, its "as of spec 007" list and its tree lose the pause's
  files, and its mat sentence reads the quiet view alone. `AUTHORING.md`
  loses the pause section and its "leave words after a pause" rule, and
  says a story is prose — no holds. The plugin's README loses the
  pause from its table. `design/brief.md`'s mat note narrows to the
  quiet view. Spec 007's `spec.md` gains a status line: the pause
  withdrawn at 017, the held block in force. Spec 015's non-goal on the
  pause gains one line saying which spec answered it. `DECISIONS.md`
  gains a "Spec 017" entry in the photographer's words and annotates
  "Spec 007" and "Spec 015"; `ROADMAP.md` strikes "The pause and the
  hero leave the site" and "The stage across screen shapes" as done
  here and annotates "The pause, rethought" and "The mat only where
  the ground goes dark" with the outcome — both drafted on the branch,
  applied to `main` after the merge. `README.md`'s and `AUTHORING.md`'s
  description of the stage (a screen below the header) is corrected to
  the rule above.

## Fixtures and authoring requirements

- **The sample pieces.** `where-the-fog-lets-go`'s pause becomes a
  `fullbleed` of the same panorama, same alt, in the same place in the
  prose (the spec author's choice: the nearest scale to the pause; the
  photographer may pick another). `vocabulary-sampler` and
  `matte-sampler` lose their pause sections outright; the matte sampler
  shows the surfaces that remain.
- **No new photographs, no frontmatter or schema change, no new
  dependency.**
- **The Obsidian plugin** drops `pause` from its block list, and its
  README's table drops it. Nothing else in the plugin changes.

## Acceptance criteria

- [ ] A piece body with `::pause{src alt}` (and one with the container
      form) fails the build with the closed vocabulary's error, naming
      the directive, the piece's file and line, and the known blocks;
      pinned by a test
- [ ] No `pause` handler, token, attribute, selector, sizes hint,
      passage entry, sampler surface, plugin entry, or fixture remains;
      the pause-shape module and its test are gone; a grep for the word
      across `src/`, the transform, the tests and the plugin finds only
      the test above, and `README.md` and `AUTHORING.md` no longer
      describe it
- [ ] The held block is unchanged: its tests pass with no edit to their
      assertions, and its markup, styles and script behave as before
- [ ] The image page's stage in its normal view is bare on paper — no
      mat, no matte fill, no residual padding; the quiet view keeps its
      white mat at spec 013's rule; no other surface changed; the
      presence test's table has one matted surface, the quiet view
- [ ] On the image page's normal view the stage's box is the frame plus
      a piece's frame-to-prose spacing above and below, from that
      token, with no minimum height; the previous / where / next line
      (where the frame has a set) and the title follow in flow at that
      spacing, the title's block adding no top padding of its own, so
      photograph → nav line → title are each one spacing apart;
      measured on the laptop, the DualUp and a phone width
- [ ] A 3:2 and a 2:3 frame on the same screen show the same long side
      and the same short side, turned, and every other ratio fits
      inside that rectangle touching a side (a square at the short
      side, a panorama at the long side); the long side is the smaller of
      the page's width less its side pads and the first screen's height
      below the header less the nav line's height and the two spacings,
      from the tokens, with and without script; on the laptop the
      height decides and on the DualUp the width, with a landscape
      frame wider than the text column there; pinned by a test and
      measured on both screens, the numbers recorded
- [ ] The previous / where / next line sits fully above the fold on
      arrival on both screens for the tallest frame the rule allows
- [ ] The image's sizes hint gives the width the rule shows, so the
      browser fetches no wider a file than it renders, pinned by a test
- [ ] The quiet view's rules and geometry are unchanged, byte-for-byte
      in the stylesheet
- [x] The photographer has seen both frames on both screens at the
      Phase 0 pause and named the rule kept (equal rectangle) or the
      one to try (equal area), recorded in this spec — _2026-09-22:
      equal rectangle kept ("Honestly looks great now … good to
      continue"); equal area not tried_
- [ ] The compare's fill and divider, the quiet dark, the ground and
      fills, the social images, the galleries and the place wall are
      byte-for-byte unchanged in their rules
- [ ] `where-the-fog-lets-go` builds with a fullbleed panorama where its
      pause was; the two samplers build without a pause section
- [ ] The whole test suite green; the build with its barriers green;
      `README.md`, `AUTHORING.md`, the plugin's README, and
      `design/brief.md` updated; spec 007's and spec 015's documents
      annotated; the `DECISIONS.md` and `ROADMAP.md` text drafted on the
      branch

## Decided (in this conversation, 2026-09-22)

- **The pause and the hero leave the site** (product owner, at spec
  016's second look): "I think we should scrap the Pause block and the
  stage using the Pause block for now, though keep it in a branch so we
  can revisit it at a later time, but remove it from the main site for
  now." The hero is archived unmerged; the pause's code is `main`'s
  history.
- **The whole arrival goes** (product owner): the dark opening, the
  dimmed chrome, the fade; the image page opens on paper as before spec
  016. On `main` this is already so — nothing to remove.
- **A piece that still writes `::pause` fails the build, naming the
  piece** — the previous session's reading of the photographer's "yes"
  to an either/or, confirmed here: the alternative, rendering the frame
  as some other treatment, would hide a piece that needs rewriting.
  The spec author's lean on the form: the closed vocabulary's existing
  error, not a pause-specific message, so the transform reserves
  nothing for a withdrawn name — consistent with what the constitution
  says of `sequence`.
- **The held block stays** (product owner).
- **The mat rule stays as spec 016 stated it — worn where the ground
  is dark** (product owner), which with no arrival means the quiet view
  alone and the stage bare on paper, his spec 015 words: "Stage's
  normal view unmatted, as it blends into the Paper ground tone."
- **The cue stays** (product owner, from spec 016's first look): the
  frame nav above the fold on the paper stage, set unconditionally —
  spec 016 built it under the arrival only; here it is the stage's rule.
- **The fog piece's pause becomes a fullbleed** — the spec author's
  choice for the fixture, open to the photographer.
- **The stage's geometry folded in, after sign-off** (product owner,
  2026-09-22): "the stage for the image's page makes it so that it is
  centered completely in the screen which pushes all other text off of
  the screen. This is most noticeable with vertical screens and the
  dualup display … I want it to be such that the image … is centered
  and is as large as needs to be … but that the title and text follows
  as it would in any other piece." And on scope: "Fold both into this
  spec. I think we're getting too narrow on specs and therefore there
  is a lot of unnecessary overhead with planning/tasks/reviews. Both of
  these are relevant here, so they should be handled together." The
  spec author's leans, to be judged at the pause: one rectangle turned
  (equal sides, the galleries' own rule) rather than equal area; the
  long side from the smaller of the page's width and the first screen's
  height; the width not capped at the text column; the spacing a
  piece's own frame-to-prose distance, fixed, not a share; every other
  ratio fitting inside the 3:2 reference rectangle, turned (a square at
  the short side — the sign-off caught the first wording leaving this
  undefined; the alternative, every frame's long side at the long side,
  would make a square larger than either 3:2 frame). The cue survives
  inside the height rule. The pause shows him a panorama beside the
  pair so the fit for other ratios is judged too.
