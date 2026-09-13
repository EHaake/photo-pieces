# Spec: The matte, rethought

**Status**: Approved (2026-09-13) — written and approved in the spec
conversation with the product owner. The second spec under the model
policy's experiment 1 (the session on Fable 5.1).
**Depends on**: 003 (the site-applied matte, one token, and the warmed
ground chosen so white mats read against it), 004 and 011 (the packed
galleries and the single source behind their layout and srcset math),
006 (the image page's stage and quiet view), 007 (the held and pause
frames, whose geometry counts the mat), 012 (the place wall on the
galleries' packing).

## Summary

Spec 003 decided that the site mattes the photographs itself — a flat
field of white around each frame, applied by the site rather than baked
into the files — and warmed the page's ground so the white would read.
The mat has been one width ever since: a single value that follows the
viewport, applied identically to every matted frame whatever its
rendered size. A single at the reading width, a cell in a grid, a frame
in a packed gallery, a cover card, and the image page's stage all wear
the same mat.

Looked at on real photographs, that is the wrong rule. A small frame
wears a mat that reads heavy; a large frame wears one that reads thin.
A framer does the opposite — the mat grows with the print — and a wall
of frames at different sizes with the same mat on each reads as the
site not having noticed.

This spec asks two questions, in order, and settles both by looking.
First, whether the site wants mats at all, and where: on everything as
now, on some surfaces only, or nowhere. Second, where a mat stays, a
width that is a share of the frame itself rather than of the viewport.
The two are answered at one gate, on the photographer's two screens, on
the ten real photographs, from a sampler that shows every surface at no
mat, at today's mat, and at candidate shares. One rule the answer is
bound to: the ground was warmed for the mats' sake, so if mats go
everywhere, the ground goes back toward white.

## Goals

1. **A matte decision per surface, not per frame.** The gate decides
   mats on or off for four surfaces: the frames inside a piece's
   reading flow, as one group (single, inset, wide, diptych, triptych,
   grid, aside, row, held, pause); the packed galleries, the place wall,
   and the image page's related strip together; the image page's own
   stage; and the index cover cards. A piece reads consistently: its
   treatments are not decided one by one. Fullbleed, tall, and strip
   stay unmatted whatever the answer — the bleed is their point.
2. **One rule where a mat stays.** The mat's width is a share of the
   frame's own rendered short side, with a floor and a ceiling, flat
   and equal on all four sides — the brief's carve-out unchanged. One
   share, chosen once, for every surface that keeps a mat; the frame's
   size decides the width, not which page it is on and not the
   viewport. Two geometries take the share from the size that governs
   them rather than from each frame (amended 2026-09-13 at sign-off, so
   every fit stays exact): a packed row's frames wear one mat, a share
   of the row's target short side — the density — not of the size a
   row grows to when it fills its width; and a matched-height pair or
   triptych wears one mat, a share of the matched height.
3. **The ground follows the mats.** Mats anywhere: the warm ground of
   spec 003 stays. Mats nowhere: the ground returns toward the white it
   was before spec 003, chosen by looking at the gate with the old value
   as the first candidate, and every derived copy of the ground (the
   Open Graph images) resynced. The quiet dark and the pause's dimming
   are untouched either way.
4. **Everything that counts the mat still holds.** The matched heights
   of a pair or triptych, the held frame's fit beside its words, the
   pause frame's fit in its stage, the packed rows' equal short sides,
   the stage's fit below the header — every layout that includes the
   mat's width in its geometry today gives the same result with a
   proportional mat that it gives with the fixed one, and the responsive
   image sizes stay honest about the pixels the frame actually shows.
5. **Decided by looking, on both screens.** Before any value is
   committed, the photographer sees each of the four surfaces on the
   real photographs, on the laptop and the DualUp, at no mat, at today's
   mat, and at three candidate shares, with a switch between the warm
   ground and the white, in one sampler laid out for the comparison.
   The spec fixes the questions; the gate answers them.

## Non-goals

- **The mat's colour.** It stays pure white. Only presence and width are
  in question.
- **A bottom-weighted or otherwise unequal mat**, a mat edge, a shadow,
  a bevel, a texture — the brief bans them and this spec keeps the ban.
- **A per-image or per-block opt-out.** No directive attribute, no
  sidecar field. The unit of decision is the surface.
- **The aspect-ratio treatment** for varied crops (its own ROADMAP
  item). This spec settles whether gallery frames are matted and how
  wide, which that spec needs to know first; it does not touch the
  packing rule or the frames' shapes.
- **The design language of its own** (ROADMAP): this is one question
  inside that direction, answered on its own, not the direction.
- **The quiet dark, the pause's dimming, the mats' behaviour on the
  dark ground** (they keep their colour during a pause, spec 007's
  decision): unchanged.
- **The Obsidian plugin.** It renders the photograph, not the mat, and
  stays so.
- **The data model.** No frontmatter, schema, or registry change.

## Key user flows

- **Reading a piece.** Frames in the flow wear the mat the gate chose
  for pieces — none, or one that is visibly the same share of each
  frame, so a small inset and a wide single read as the same
  presentation at different sizes. Gutters in a pair or grid still show
  the page between the mats; captions still sit below the mats.
- **A gallery, the place wall, the related strip.** Each packed frame
  wears the gallery decision — none, or a mat that scales with the
  frame, so a row of frames at equal short sides reads as a row of
  equal mats, and a row on the DualUp's larger frames wears wider mats
  than the laptop's, by the same share.
- **The image page.** The stage's frame wears the stage decision. The
  photograph still fills the first viewport below the header, and the
  quiet view still dims the ground around it.
- **The indexes.** Cover cards wear the cards' decision.
- **On a phone.** Below the collapse every surface keeps its decision;
  the floor keeps a proportional mat from vanishing on a small frame
  and the ceiling keeps it from swelling on a large one.
- **If mats go everywhere.** The photographs sit directly on a ground
  that has gone back toward white; nothing on the site refers to a mat
  that isn't there, and the site's own social images show the same
  ground as the pages.
- **The gate.** The photographer opens the sampler on both screens,
  walks the four surfaces, switches each between none, today's mat,
  and the three shares, switches the ground, and names a decision per
  surface, one share, and — if no surface keeps a mat — a white.

## Design requirements

- **The candidates at the gate**: no mat; today's fixed mat, as the
  control; and three shares of the frame's rendered short side (of the
  row's target short side in a packed row, of the matched height in a
  matched-height block), spread
  so the smallest reads thinner than today's mat on a reading-width
  single and the largest reads wider, each with the same floor and
  ceiling. The plan names the three and the floor and ceiling; the gate
  may move them.
- **The mat where it stays** is a share of the frame's own rendered
  short side, clamped, applied by the site — never by the file — and
  the site keeps a single source for the rule: every surface that keeps
  a mat takes its width from the same place, and every layout that
  counts the mat counts the same value.
- **The ground rule.** If any surface keeps a mat, the ground is
  unchanged. If none does, the ground moves to the white chosen at the
  gate, with the Open Graph route's background and the static social
  image resynced to it, and spec 003's "warmed so the mattes read"
  entry in `DECISIONS.md` annotated rather than deleted.
- **Below the collapse** every surface keeps the decision made above
  it; there is no separate phone answer.
- **The sampler** is a fixture page served only under the dev server
  and never built — behind the no-dev-routes barrier specs 010, 011,
  and 012 established. It shows the four surfaces on the real exports
  (a fixture piece for the reading-flow group, drawing on the same ten
  photographs) with the site's real head, type, and ground, each
  surface switchable between the candidates and the page switchable
  between the two grounds, laid out for comparison on both screens.
- **The wall label, captions, the passage, the arrows, search** — none
  of it moves. A caption sits below whatever mat the frame has, or
  below the frame where there is none.

## Fixtures and authoring requirements

- **One fixture piece for the sampler**, if the vocabulary sampler
  piece cannot serve: it places the real exports in the reading-flow
  treatments the gate compares. No new photographs.
- **`README.md`'s block table** says which treatments are matted;
  **`AUTHORING.md`'s** "never bake a matte" rule stands whatever the
  answer, reworded if the site no longer mattes.
- **No frontmatter, schema, or Obsidian plugin change.**

## Acceptance criteria

- [ ] Each of the four surfaces (a piece's reading-flow frames; the
      galleries, the place wall, and the related strip; the image
      page's stage; the index cover cards) shows the mat decision the
      gate made for it — present or absent — and fullbleed, tall, and
      strip remain unmatted
- [ ] Where a mat is present its width is the share chosen at the gate
      of the frame's rendered short side — of the row's target short
      side for the frames of a packed row, of the matched height for a
      matched-height pair or triptych — within the floor and ceiling
      chosen there, equal on all four sides, taken from one source by
      every surface — so two frames of different rendered sizes on the
      same surface (outside one packed row or one matched block) wear
      visibly different mat widths, and the same frame on the laptop and
      the DualUp wears the same share
- [ ] The matched-height pair and triptych, the held frame, the pause
      frame, the packed rows, and the image page's stage each fit
      exactly as they do today, with the mat's actual width in their
      geometry; the responsive image sizes for packed frames account for
      the mat's actual width
- [ ] If the gate keeps a mat anywhere, the ground and its derived
      copies are unchanged; if it keeps none, the ground is the white
      chosen at the gate and the Open Graph route's background and the
      static social image match it
- [ ] The mats keep their colour during a pause and in the quiet view,
      as today, where they exist
- [ ] Below the collapse every surface shows its decision, the floor
      and ceiling holding
- [ ] The sampler existed for the gate and is gone from the built
      site, behind the no-dev-routes barrier
- [ ] The whole test suite green; the build with its barriers green;
      `README.md`, `AUTHORING.md`, `ROADMAP.md`, and `DECISIONS.md`
      updated

## Decided (in this conversation, 2026-09-13)

- **Nowhere is a real option** (product owner), paired with the ground
  going back toward white, since the warm tone was chosen for the mats.
- **Four surfaces, a piece's frames as one** (product owner, the spec
  author's lean). Per-block decisions would let a piece read
  inconsistently; fullbleed, tall, and strip are outside the question.
- **One share, everywhere a mat stays; flat and equal** (product
  owner, the spec author's lean). The frame's size is the only thing
  that varies the width.
- **The ground is seen at the gate**, with a switch and the pre-003
  white as the first candidate (product owner, the spec author's
  lean), rather than restored blind.
- **Mat colour out of scope** (product owner).
- **One gate** for presence, share, and ground (product owner, the spec
  author's lean): one sampler, both screens, the real photographs.
- **Packed rows and matched-height blocks take the share from the size
  that governs them** (product owner, at sign-off, 2026-09-13). An exact
  per-frame share on those two geometries cannot coexist with the fits
  staying exact: a row's grown size is not a length the styling can
  read, and per-member mats in a matched block can sit at different
  clamp limits. The fits win; the sampler shows both behaviours at the
  gate.
- **The compare slider on the image page follows the stage's decision**
  (product owner, at sign-off, 2026-09-13); the unplaced latest-work
  strip follows the packed rows'.
- **The aspect-ratio treatment waits for this** (product owner, from
  the roadmap conversation): its matted-frames option is a mat doing
  layout work, and needs to know whether gallery frames are matted.
