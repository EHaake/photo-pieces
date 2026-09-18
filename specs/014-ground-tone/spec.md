# Spec: The ground tone, rethought

**Status**: Approved (2026-09-17) — written and approved in the spec conversation with
the product owner. The third spec under the model
policy's experiment 1 (the session on Fable 5.1).
**Depends on**: 003 (the site-applied white matte and the warm ground
chosen so it would read), 006 (the image page's stage and the quiet
view's dark), 007 (the pause's dimming, a share of the way from the
ground to the quiet dark), 013 (the mat as 6% of the frame on every
surface, and the sampler at `/dev/matte/` that judged it, with its
two-way ground switch).

## Summary

Spec 003 warmed the page's ground one step from paper-white so the
site's pure-white mats would read as mats on a wall. Spec 013 then
settled the mats for good: every surface keeps one, at 6% of the
frame. At that gate, looking at the settled mats on the real
photographs, the photographer read the ground as possibly not doing
its job — the mats may not stand out enough, and the warming may not
have gone far enough. The ground now has one fixed job, to sit behind
white mats and the photographs inside them, and it has never been
chosen with that job settled.

This spec chooses the ground's tone by looking. A range of candidates
— lighter and darker than today, and some with a slight colour, cooler
and warmer — sits on a switch beside today's tone, on the same sampler
and the same ten photographs spec 013 judged, on both of the
photographer's screens, and the chosen candidate can be walked through
the real site before it is taken. The mats stay white and stay at 6%;
only the ground and the fills and hairlines that live on it move. The
one guard the answer is bound to: the words stay readable — a
candidate is shown with its text contrast, and the tone that ships
keeps the site's text within the accessibility floor on every surface
the text sits on.

## Goals

1. **A ground chosen for the mats it now has.** The gate picks one
   tone for the page ground from a spread that brackets today's: at
   least two lighter (one being the pre-003 paper-white that was on
   spec 013's switch and not taken), at least two darker, and at least
   two slightly coloured, one cooler and one warmer than today's warm
   grey. Today's tone is on the switch as the control, and keeping it
   is a real outcome.
2. **A tone is one number's family, not five.** A candidate is one
   ground tone; the fills and hairlines that live on the ground — the
   surface, the soft fill, the two line tones — follow it by fixed
   steps, the way spec 003 moved them together. Choosing a ground never
   leaves a card or a rule behind at the old tone.
3. **The words stay readable.** The body text and the muted text keep
   at least the accessibility floor for normal text against the ground
   and against every fill they sit on, at the chosen tone. The sampler
   shows each candidate's contrast beside it, so a candidate that would
   fail is seen as failing before it is liked. If the tone the
   photographer wants fails only for the muted text, the muted text is
   deepened by the least step that restores the floor; the body text
   does not move.
4. **Judged where the ground lives.** The candidates are compared on
   the sampler's four matted surfaces on the real photographs, and the
   chosen candidate can be carried through the whole site under the dev
   server — the pieces, the galleries, a place, the image page and its
   quiet view, About, search — before it is taken, because a coloured
   ground shows most on prose, cards, and chrome, not on the frames.
5. **The derived copies move with it.** Whatever tone is chosen, every
   copy of the ground outside the stylesheet — the Open Graph route's
   background and hairline, the static social image — shows the same
   tone, and the test that pins those copies to the ground keeps them
   there.
6. **Decided by looking, on both screens.** Nothing is committed until
   the photographer has seen the spread on the laptop and the DualUp
   and named a tone — either one of the candidates or a value reached
   from one with the sampler's free tune.

## Non-goals

- **The mat.** Its colour stays pure white and its width stays spec
  013's rule. A tinted mat was rejected at spec 003 as inverting the
  mat-brighter-than-wall logic, and this spec exists to make the white
  mat read; it is not reopened.
- **The body text's tone and the accent.** Both stay. The contrast
  guard is the only thing that may move the muted text, and only
  darker.
- **The quiet dark and the pause's dimming.** The quiet view's ground
  stays the dark it is; the pause dims a share of the way from the page
  ground to that dark, so it follows the chosen tone by construction
  and is not retuned. A darker ground narrows the step into the quiet
  view; the sampler shows it, and the spec accepts it.
- **A dark mode, or any second palette.** The brief's light-only
  decision stands. One ground, chosen once.
- **The design language of its own** (ROADMAP): this is one question
  inside that direction, answered on its own.
- **Colour management.** The two screens render colour differently and
  neither is calibrated; the gate looks on both and picks, as spec 003
  and 013 did. No profile, no per-screen tone.
- **The data model, the transform, the Obsidian plugin.** Untouched.

## Key user flows

- **Reading a piece.** The prose sits on the chosen ground; the mats
  are the brightest thing on the page and read as mats; captions and
  the muted lines under frames are as legible as today.
- **A gallery, the place wall, the related strip.** The packed rows'
  white mats stand off the ground; the gutters between them show the
  ground.
- **The image page.** The stage's mat reads against the ground; the
  quiet view still goes to its dark, from a little nearer or farther
  than today.
- **The indexes, About, search, the header and footer.** Cards and
  fills sit on the ground at their fixed step from it; hairlines still
  read as hairlines; nothing is left at the old tone.
- **A shared link.** The social image and a piece's Open Graph image
  show the same ground as the pages.
- **The gate.** The photographer opens the sampler on both screens,
  steps through the candidates on each of the four surfaces, reads the
  contrast beside each, tunes if a candidate is close but not right,
  walks the site with the candidate on, and names a tone.

## Design requirements

- **The candidates at the gate**: today's tone as the control; the
  pre-003 paper-white; at least one more lighter tone; at least two
  darker tones; at least one cooler and one warmer tone of a lightness
  near today's. The plan names the values. Beside the fixed set, a
  **free tune** — lightness, amount of colour, and hue — so the gate
  can move from a candidate rather than only choose one; the tone taken
  is recorded as numbers, whichever way it was reached.
- **One tone drives the family.** The page ground is the token the
  gate sets; the surface, the soft fill, and the two line tones are
  derived from it by fixed steps, so that a candidate on the switch
  moves all five together, as the sampler's site-wide switch does and
  as the committed stylesheet does after the gate.
- **The contrast readout.** For every candidate, and for the tuned
  value as it changes, the sampler shows the contrast of the body text
  and the muted text against the ground and against the surface and
  soft fills, and marks any pair below the floor for normal text. The
  mat's contrast against the ground is shown too, since that is the
  question. The floor is the standard one for normal text (4.5:1); the
  plan states the formula.
- **The shipped tone passes.** After the gate, a test pins the body
  and muted text at or above the floor against the ground and the
  fills, at the committed values. If the muted text had to deepen for
  it, that is recorded with the tone.
- **Site-wide under the dev server, nothing in the build.** The
  candidate the gate has selected is remembered and applied on every
  page served by the dev server, so the site can be walked with it on.
  None of it reaches the built site: the sampler stays behind the
  no-dev-routes barrier specs 010 to 013 established, and the site-wide
  switch is present only under the dev server.
- **The sampler** is the matte sampler's four surfaces on the real
  exports, with its two-button ground bar grown into the candidate set,
  the free tune, and the readout — or a sampler of the same shape if
  the plan finds extending the existing one worse. The plan's call.
- **The derived copies.** The Open Graph route's background and
  hairline hex values are recomputed from the chosen tokens; the static
  social image is regenerated on the chosen ground; spec 013's ground
  test is extended to cover the hairline as well as the ground. The
  design brief's palette section and `DECISIONS.md`'s "Ground tone"
  entry are annotated with the outcome, not rewritten.
- **If today's tone is kept**, nothing moves but the record: the
  sampler and the switch stay in the repo behind the barrier, the
  contrast test still lands at today's values, and the documents say
  the tone was re-judged and kept.

## Fixtures and authoring requirements

- **No new photographs.** The gate uses spec 013's fixture piece and
  the ten real exports.
- **`README.md`** where it names the ground or the social image;
  **`AUTHORING.md`** is unaffected unless it names the ground.
- **No frontmatter, schema, transform, or Obsidian plugin change.**

## Acceptance criteria

- [ ] The page ground is the tone the gate named, and the surface,
      soft fill, and both line tones sit at their fixed steps from it;
      no fill or hairline on any page is left at the old tone
- [ ] The mat is unchanged: pure white, spec 013's share, floor, and
      ceiling, on every surface it had
- [ ] The body text and the muted text meet at least 4.5:1 against the
      ground, the surface, and the soft fill at the committed values,
      pinned by a test; the body text's tone is unchanged, and the muted
      text is unchanged unless the record says it deepened and why
- [ ] The quiet dark's value is unchanged, and the pause's dimming
      still runs from the page ground toward it
- [ ] The Open Graph route's background and hairline and the static
      social image match the committed ground within the existing
      test's tolerance
- [ ] The sampler showed the required spread, the free tune, and the
      contrast readout at the gate, and a chosen candidate carried
      across every page under the dev server; none of it is in the
      built site
- [ ] If the gate kept today's tone, the stylesheet's colour tokens are
      byte-for-byte unchanged and the documents record the re-judging
- [ ] The whole test suite green; the build with its barriers green;
      `README.md`, `ROADMAP.md`, `DECISIONS.md`, and `design/brief.md`
      updated

## Decided (in this conversation, 2026-09-17)

- **Fixed candidates plus a free tune** (product owner, the spec
  author's lean): the gate can move from a candidate rather than only
  pick one; the value taken is recorded as numbers.
- **The candidate persists site-wide under the dev server** (product
  owner, the spec author's lean), so the real pages are walked with it
  on, not only the sampler.
- **The ground's family follows the tone; text, accent, mat, and the
  quiet dark stay** (product owner, the spec author's lean).
- **Mindful of the text contrast** (product owner): the sampler shows
  each candidate's contrast, the shipped tone must pass the floor for
  normal text on every fill the text sits on, and only the muted text
  may deepen, by the least step, to keep it — the spec author's
  reading of the request, to confirm at approval.
- **The mat's colour stays out** (product owner), as in spec 013.
- **Keeping today's tone is a real outcome** (product owner).
