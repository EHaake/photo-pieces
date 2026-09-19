# Spec: The hero mat

**Status**: Approved (2026-09-19) — written and approved in the spec
conversation with the product owner. Supersedes spec 014's gate.
**Depends on**: 003 (the site-applied white matte and the ground warmed
so it would read), 006 (the image page's stage and its quiet view), 013
(the mat as 6% of the frame on every surface, and the four surfaces it
named), 014 (Phase 0 only: the ground's family rule and contrast floor
in `src/lib/ground.ts`, the dev-only site-wide ground switch, the
sampler's candidate bar and readout, and the social image's generator —
all in the repo and green, its gate never answered).

## Summary

Spec 013 asked whether the site wants mats at all and where, and the
answer at its gate was everywhere, at 6% of the frame. Spec 014 then set
out to choose a ground for those mats to sit behind, and at its gate,
looking at the candidates on the real photographs, the photographer
reached a different conclusion about the mats themselves: in the
reading flow of a piece and in the packed rows of a gallery, the frames
look better without them. The mat is a hero treatment. It belongs on
the one presentation where a single photograph is the whole point — the
image page's stage, and the quiet view that grows out of it — and
nowhere else.

This spec makes that change and answers the question it reopens. With
no white mats on most pages, the ground has a different job: to sit
directly under photographs and under prose. The photographer's lean is
paper, the pre-003 white; the spec confirms it by looking, on the pages
as they now are, with the switch spec 014 already built. Everything that
followed the ground — the fills, the hairlines, the social images —
follows it here by the rule 014 landed. The stage keeps its white mat on
whatever ground is chosen; that it will be faint on a paper ground
outside the quiet view is accepted, and the darker field the stage
wants is its own later spec.

## Goals

1. **The mat only where the image is the hero.** The image page's
   stage keeps its mat, at spec 013's rule, and the quiet view keeps it.
   Every other surface loses it: a piece's reading-flow frames (single,
   inset, wide, diptych, triptych, grid, aside, row, and the held
   frame), the packed galleries, the place wall, the related strip, the
   index cover cards, the front page's latest-work band, and the image
   page's compare figure. Fullbleed, tall, and strip were never matted.
   The pause frame is untouched (Non-goals).
2. **Nothing that counted the mat breaks.** The matched heights of a
   pair or triptych, the held frame's fit beside its words, the packed
   rows' equal short sides, the responsive image sizes — every layout
   that included the mat's width gives the same result with none as it
   gave with 6%, since spec 013 built each form so that a zero mat is a
   value of the rule, not a special case. The stage's fit is unchanged.
3. **A ground chosen for pages with no mats on them.** The page ground
   is re-judged with the unmatted pages in front of the photographer,
   from spec 014's switch: paper, the lighter step, and today's warm
   grey as the control, on both screens, and named as an id or as
   numbers. The fills and hairlines follow by 014's fixed steps; the
   text keeps the accessibility floor by 014's readout and test, with
   the muted text deepened by the least step if the chosen tone needs
   it. Keeping today's tone stays a real outcome.
4. **The derived copies move with it.** The Open Graph route's colours
   and the static social image are regenerated on the chosen ground by
   the generator 014 landed, and the test that pins them keeps them.
5. **The record tells the truth.** Spec 013's "every surface" answer,
   spec 003's warming, and spec 014's unanswered gate are annotated,
   not erased; the design brief's flat-mat carve-out narrows to the
   stage; the roadmap gains the two specs this one defers.

## Non-goals

- **The pause block.** The photographer does not like how the pause
  works today, and its rework — mid-piece and as a hero presentation —
  is a spec of its own. The pause frame keeps its mat, its dark ground,
  and its lights exactly as spec 007 left them; this spec does not
  touch its markup, CSS, or script. A piece with a pause therefore
  carries one matted frame until that spec lands. Stated, accepted.
- **The stage's darker field.** The photographer wants the image page's
  stage to sit in a field much darker than the page, close to the quiet
  view's dark, giving way to the light ground as the reader scrolls
  into the words. That is deferred to a later spec (likely the pause's,
  since both are hero presentations of one frame). Two leans recorded
  for it: the field is the stage's own background and scrolls away with
  it, no script; and it ends at the stage's edge, the header and the
  frame nav staying on the page ground. Until then the stage's white
  mat on a paper ground reads faintly outside the quiet view — an
  accepted interim state.
- **The mat's colour, width rule, floor, and ceiling** where it stays.
  Pure white, 6% of the frame, 4px to 40px, flat and equal: spec 013's
  values, unchanged, on the stage and in the quiet view.
- **The quiet dark and the pause's dimming.** `--color-quiet` stays;
  the pause still dims from the page ground toward it, so it follows the
  chosen ground by construction.
- **The body text's tone and the accent.** Unchanged; only the muted
  text may deepen, by 014's guard.
- **The aspect-ratio treatment for packed galleries** (ROADMAP). This
  spec changes what that entry was waiting on — gallery frames are no
  longer matted — and annotates it; it does not decide it.
- **Removing the mat machinery.** The three mat tokens, the per-form
  rule, and the matte sampler stay in the repo: the stage reads them,
  and a later spec may put a mat back on a surface by turning it on.
- **The data model, the transform, the Obsidian plugin.** Untouched. A
  directive still declares its ratio; the plugin renders the photograph,
  not the mat.

## Key user flows

- **Reading a piece.** Every frame in the flow sits directly on the
  ground, edge to edge with the page around it; gutters in a pair or
  grid show the ground between photographs; captions sit directly below
  their frames. A pause, where a piece has one, is as it was.
- **A gallery, the place wall, the related strip.** Rows of frames at
  equal short sides, unmatted, the ground in the gutters — the same rows
  as today, each cell a little more photograph and no white.
- **The indexes and the front page.** Cover cards and the latest-work
  band show the photographs without mats.
- **The image page.** The photograph fills the first screen below the
  header inside its white mat, the one mat on the site; a click takes it
  to the quiet view, where the same matted frame sits as large as the
  screen allows on the quiet dark. The compare figure below is unmatted.
- **A shared link.** The social image and a piece's Open Graph image
  show the chosen ground.
- **The gate.** The photographer opens the site under the dev server
  with no mats on it, walks a piece, a gallery, a place, the image page,
  the indexes, and About on both screens, switches the ground from the
  sampler's bar between paper, light, and today, reads the contrast
  beside each, and names the ground.

## Design requirements

- **Per surface, on or off**, decided here, not at a gate: on for the
  stage and the quiet view; off for everything else the mat touched
  (Goal 1's list). The unit is still the surface — no per-image or
  per-block opt-out, no directive attribute, no sidecar field.
- **Off means the frame is the photograph.** No residual padding, no
  border, no field; the frame's box is the image's box, and whatever
  the mat used to occupy is page. Where a layout's formula included the
  mat, it now includes zero, from the same single source spec 013 built,
  so the rule is not duplicated to express its absence.
- **The stage's mat is spec 013's**, taken from the same three tokens
  as today, so nothing about the one surface that keeps a mat is
  re-derived.
- **The ground gate** uses what 014 built: the sampler's candidate bar
  and free tune, the site-wide switch under the dev server, the contrast
  readout, and the rule that the fills and hairlines follow the ground
  by fixed steps. The candidates the photographer must see: paper
  (`oklch(0.99 0.003 100)`), light, and today as the control; the other
  candidates on the bar may stay. The value taken is recorded as
  numbers, whichever way it was reached. The contrast floor and the
  muted-deepening rule are 014's, unchanged; the tone that ships passes
  the floor on every fill the text sits on, pinned by the existing test.
- **The derived copies** regenerate through `npm run og`; the existing
  test pins the Open Graph colours and the social image to the tokens.
- **The documents.** `README.md`'s block table says which treatments
  are matted (now: none in a piece; the stage). `AUTHORING.md`'s "never
  bake a matte" rule stands, reworded to say the site mats only the
  image page's stage. `design/brief.md`'s flat-matte carve-out narrows
  to the stage and the quiet view and its palette note records the
  ground. `DECISIONS.md` annotates "Mattes: site-applied", "Ground
  tone: warmed so the mattes read", and "Spec 013" with the outcome, and
  gains a "Spec 015" entry with the reasoning in the photographer's
  words. `ROADMAP.md` strikes "The ground tone, rethought" as superseded
  by this spec, annotates the aspect-ratio entry, and gains two entries:
  the pause rethought (mid-piece and hero) and the stage's darker field.
- **Spec 014 is closed, not finished.** Its `tasks.md` records that the
  gate was not answered on its terms and why; its Phase 0 is what this
  spec builds on; nothing else of it is executed.

## Fixtures and authoring requirements

- **No new photographs.** The gate uses the real site under the dev
  server plus the matte sampler's four surfaces, which show the
  unmatted state by construction once the surfaces are off.
- **No frontmatter, schema, transform, or Obsidian plugin change.**

## Acceptance criteria

- [ ] The image page's stage and the quiet view show the white mat at
      spec 013's rule, and no other surface shows a mat: a piece's
      reading-flow frames including the held frame, the packed galleries,
      the place wall, the related strip, the cover cards, the latest-work
      band, and the compare figure are unmatted, with no residual padding
      or field; fullbleed, tall, and strip unchanged
- [ ] The pause frame is unchanged: its mat, its ground, its lights,
      its markup and script byte-for-byte as before
- [ ] The matched-height pair and triptych, the held frame, the packed
      rows, and the responsive image sizes each fit exactly with a zero
      mat, from the single source; the stage's fit is unchanged
- [ ] The page ground is the tone named at the gate, the fills and
      hairlines at 014's fixed steps from it, nothing left at the old
      tone; the text meets 4.5:1 on the ground and every fill, pinned;
      the muted text unchanged unless the record says it deepened and why
- [ ] The quiet dark's value is unchanged; the pause's dimming still runs
      from the page ground toward it
- [ ] The Open Graph route's colours and the static social image match
      the committed ground within the existing test's tolerance, and the
      regenerated social image was shown to the photographer
- [ ] The gate showed the unmatted site with paper, light, and today
      switchable on both screens, with the readout beside each; the switch
      and sampler are absent from the built site, behind the barrier
- [ ] The whole test suite green; the build with its barriers green;
      `README.md`, `AUTHORING.md`, `ROADMAP.md`, `DECISIONS.md`, and
      `design/brief.md` updated; spec 014 closed in its own documents

## Decided (in this conversation, 2026-09-18–19)

- **The mat is a hero treatment** (product owner): the stage and the
  quiet view only; pieces, galleries, the place wall, the related strip,
  the cards, the latest-work band, and the compare figure lose it.
- **The pause is deferred wholesale** (product owner): its mid-piece
  behaviour and its hero use go to a spec of their own; it is untouched
  here. The held frame unmats with the piece (the spec author's lean).
- **The stage's darker field is deferred** (product owner, leaning much
  darker, near the quiet view's dark); the field being the stage's own
  background and ending at the stage's edge are the spec author's leans
  recorded for that spec.
- **The ground is re-judged at a small gate with 014's switch, not
  taken on the earlier look** (product owner, the spec author's lean):
  the site with no mats on it has not been seen on either screen.
- **Spec 014 is superseded** (product owner, the spec author's lean):
  its Phase 0 machinery serves this gate; its own gate is closed
  unanswered.
- **The aspect-ratio follow-up needs a rethink** (product owner, noted
  at approval): its likely answer — frames of different ratios set in
  mats of one ratio so they line up side by side — assumed matted
  gallery frames, and this spec removes them. The entry is annotated
  here and decided later, with that option either revived by putting a
  mat back on galleries or replaced.
