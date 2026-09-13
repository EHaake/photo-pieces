# Spec: The place page — one wall

**Status**: Approved (2026-09-13) — written and approved in the spec conversation
with the product owner. The first spec under the model policy's
experiment 1 (the session on Fable 5.1).
**Depends on**: 009 (places: the place file, the frame's `at:`, the
registry's outings oldest first and the place's flat frame list the
arrows step through), 011 (the galleries' width, gap, and format-aware
density, `gallery-layout.ts` as their single source, and the dev-only
sampler pattern behind the no-dev-routes barrier), 006 and 008 (an
image's page names the piece it lives in and links back to it, and
its arrows follow the reader from a place).

## Summary

A place page was built in spec 009 as a list of visits: the place's
writing, then one labelled group of frames per piece that has
photographs there — the piece's title and date as a heading, its
frames packed underneath, a hairline before the next visit. That shape
carried the attribution on the page itself, and it read well enough at
the content width.

Spec 011 widened the galleries to a viewport bleed, and the place page
was to follow. Tried on real photographs, it didn't: a short piece
title over a full-width band of frames looked like an indented label
over a wall, under it the caption's rule collided with the footer's,
and centred it didn't sit right either. Rather than settle that in
passing, spec 011 left the place page at its old packing and gave it
this spec.

The photographer's answer is to stop labelling. A place page is one
wall: the writing, then every published photograph at the place as
one continuous packed gallery, in the same order as today — oldest
visit first, each piece's frames in the piece's order — with nothing
between the visits and no list of pieces after them. Attribution
already lives where the reader goes to look closer: each frame's own
page names the piece it belongs to and links back to it. Repeating
that on the place page, whether after each group or stacked at the
foot, is the awkward part, and it goes. With the labels gone the wall
can take the same room a gallery has — the bleed, the gap, and the
format-aware density spec 011 chose on real photographs — decided by
looking on both screens, the way the galleries were.

## Goals

1. **One wall.** Under the writing, a place page shows every published
   frame at the place as one packed gallery — one set of rows, no
   heading, divider, or grouping between one piece's frames and the
   next's. The order is unchanged from spec 009: outings oldest first,
   and within an outing the piece's own order, so the wall still reads
   as the years passing.
2. **Attribution stays on the image page.** The place page names no
   piece anywhere — not over a group, not under the wall. A frame's
   page is where the reader learns which piece it belongs to, and it
   already says so and links there. The head's summary line ("N
   outings · M frames · years") stays: it counts the visits without
   naming them.
3. **The wall takes the galleries' room.** The place's frames run at
   the galleries' width, gap, and density from spec 011 — the same
   packing system, the same single source for the CSS and the srcset
   math — so a place reads as a gallery that grows on its own. The
   writing above it keeps its reading measure; the head keeps spec
   010's tightened proportion.
4. **Decided by looking, on both screens.** Before the values are
   committed, the photographer sees the one-wall page on the real
   photographs, on the laptop and the portrait monitor, in a sampler
   that shows the wall at the galleries' treatment beside today's
   content-width packing — and where the wall should begin below the
   writing. The spec fixes the shape; the gate confirms the width and
   settles the spacing.

## Non-goals

- **Any marker of where one visit ends and the next begins** — no
  heading, hairline, gap, row break, or hover label. This is the
  decision, not an omission; a reader who wants the visit opens a
  frame.
- **Frames with no piece.** Spec 009 kept gallery-root photographs out
  of places because the page grouped by piece and they have none. One
  wall removes that reason, but admitting them needs an ordering rule
  of its own (a pieceless frame has no publish date to take its turn
  by), so it stays out; the ROADMAP notes that the cost has fallen.
- **The places index**, its cards, their counts, and their order (most
  recent visit first).
- **The image page** — the wall label's place link, the passage, the
  "Also in" line, and the place's set: the arrows still step through
  the place's frames in the place's order, "N of M" still counts them.
- **The aspect-ratio treatment** for varied crops (its own ROADMAP
  item): the packing rule is untouched here, as it was in spec 011.
- **The mats, the warm ground, the quiet dark** — the same standing
  non-goal spec 011 carried.
- **Curation inside a place, nested places, more than one place per
  frame, renaming** — spec 009's non-goals, still.
- **The data model.** No frontmatter changes, no schema change, no
  change to how the registry derives a place's frames or their order.

## Key user flows

- **Reading a place on the wide monitor.** The reader arrives at
  `/places/<slug>/`, reads the writing at its measure, and below it
  the photographs open out to the bleed — one wall, as wide and as
  large as a gallery's, oldest at the top. Nothing interrupts the
  wall; nothing follows it but the footer.
- **On the laptop.** The same wall at the format-aware density: frames
  near the size the galleries chose there, rows to the bleed.
- **On a phone.** Below the collapse, one frame per row at the full
  width, the writing above — unchanged from a gallery page.
- **Looking closer.** A click on any frame opens its page, which says
  which piece it belongs to, links back to the piece, and steps
  through the place's frames with the arrows exactly as it does today.
- **A place with no writing.** The head, then the wall. A place that
  is a title and a cover still works.
- **Ten years later.** Each new piece with frames at the place adds its
  frames to the foot of the wall on publish. Nothing else changes and
  nothing needs editing.
- **The gate.** The photographer opens the sampler on both screens,
  sees the real photographs as one wall under a place's writing at the
  galleries' width, gap, and density beside the same wall at today's
  content-width packing, and with the candidate spacings between the
  writing and the wall, and names what to keep.

## Design requirements

- **The wall** is one packed gallery: the same rows-to-equal-short-
  sides packing as a gallery page, the frames in the place's order,
  every frame a link to its page. One list, not one per piece; no
  heading precedes it and no list of pieces follows it.
- **The width, gap, and density** are the galleries' (spec 011): the
  bleed, the baseline gap, `clamp(280px, 33vmin, 460px)`. The place
  page consumes them from `gallery-layout.ts` — the single source
  behind both the CSS custom properties and the per-cell srcset/`sizes`
  math — rather than carrying values of its own, so the local
  pre-011 copy spec 011's revert left in `places/[slug].astro` is
  retired. The gate may confirm or move the numbers; it cannot split
  the source.
- **The transition from writing to wall** — the space between the
  prose (or the head, where there is no writing) and the first row — is
  a value chosen at the gate, from candidates in the sampler. It is
  the one spacing decision this spec adds.
- **The head and the writing** are unchanged: the reading head from
  spec 010, the title, the description as the lead, the summary line,
  the prose at the reading measure.
- **Below the collapse is preserved.** One frame per row at the full
  width below 720px; the wider desktop treatment applies only above.
- **The sampler** is a fixture page served only under the dev server
  and never built — the guard and the no-dev-routes barrier spec 010
  and 011 established. It renders the real photographs as one wall
  under fixture writing, with the site's real head, mats, and ground,
  at the galleries' treatment and at today's packing, with the
  spacing candidates labelled, laid out for comparison on both
  screens. It draws on the real exports only, as spec 011's did.
- **Everything the wall contained before stays reachable.** Search
  still ignores the wall (the frames are indexed by their own pages);
  the page's Open Graph image is still the cover.

## Fixtures and authoring requirements

- **No new fixtures are required.** The two fixture places and their
  fixture pieces exercise the wall (a place with two outings, one of
  them a single frame). The sampler judges the real exports already in
  `src/content/gallery-images/`.
- **`AUTHORING.md` and `README.md`** describe the place page as one
  wall — every published frame at the place in outing order, with no
  grouping — where they describe it as grouped by piece today.
- **No frontmatter, schema, or Obsidian plugin change.**

## Acceptance criteria

- [ ] `/places/<slug>/` shows the place's writing and then every
      published frame at the place as one packed gallery, in the
      registry's order (outings oldest first, frames in the piece's
      order), each frame a link to its page — and no piece title, date,
      heading, divider, or list of pieces anywhere between the head
      and the footer
- [ ] On a wide viewport the wall runs at the galleries' width, gap,
      and density as chosen at the gate, consumed from
      `gallery-layout.ts` with no place-local copy of the values; the
      place's writing reads at its present measure; below 720px one
      frame per row
- [ ] The space between the writing (or the head, for a place with no
      writing) and the first row is the value chosen at the gate
- [ ] The image page of a frame in a place is unchanged: the wall
      label's place link, and the arrows stepping through the place's
      frames in the place's order when the reader arrives from the
      place page
- [ ] The places index, its cards and their summary lines, and the
      place page's own summary line are unchanged
- [ ] The sampler existed for the gate and is gone from the built
      site, behind the no-dev-routes barrier
- [ ] The whole test suite green; the build with its barriers green;
      `AUTHORING.md`, `README.md`, `ROADMAP.md`, and `DECISIONS.md`
      updated

## Decided (in this conversation, 2026-09-13)

- **One seamless wall, not bands** (product owner). The per-piece
  bands were spec 009's shape; the labels they need have nowhere good
  to sit on a wide band, and a place is better read as a gallery that
  grows.
- **No attribution on the place page at all** (product owner). Neither
  after each group nor listed at the foot — both are awkward, and each
  frame's page already names its piece and links to it.
- **The wall takes the galleries' knobs from the single source**
  (left to the orchestrator; the spec author's lean, judged at the
  gate). One packing system for galleries and places, as spec 011's
  original Goal 3 intended before the place page was pulled.
- **The gate is small** (the spec author's lean). Structure is decided
  here; the sampler exists to confirm the width on a wall that sits
  under prose, and to choose the writing-to-wall spacing, on both
  screens — not to re-judge what spec 011's gate chose.
- **Frames with no piece stay out** (the spec author's lean). Lifting
  it is cheap now but needs an ordering rule; noted in the ROADMAP.
