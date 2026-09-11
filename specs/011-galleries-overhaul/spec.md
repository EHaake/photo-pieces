# Spec: The galleries overhaul

**Status**: Approved (2026-09-07) — written and approved in the design
conversation by the product owner. Plan and tasks drafted by the
`sdd-planner`; the planner ran at the step-down tier under the model
policy's budget fallback (the top tier's usage was nearly exhausted).
**Depends on**: 004 (the packed gallery rows, the image registry, and
`gallery-layout.ts` — the one source for the packing knobs and the
srcset/sizes math), 009 (place pages pack their outings through the
same rules), 006 (the related strip on the image page shares
`gallery-layout.ts` and must be left where it is).

> **Amendment — places deferred (product owner, 2026-09-10).** At the
> Phase 1 pause the photographer tried the widened place page and found
> that widening the outings opened a design question of its own — how the
> outing's piece label should sit against a bleed-width band, and whether a
> place should read as per-piece bands at all or as one seamless gallery
> with the pieces listed below. That is a place-page redesign, larger than
> this spec's width/gap/density scope, so **the place page is pulled from
> spec 011 and given its own spec** (see `ROADMAP.md`). This supersedes
> Goal 3 and the place clauses of the goals, flows, and acceptance criteria
> below: **spec 011 ships the galleries only.** The place page is reverted
> to its pre-011 rendering — it does not share the galleries' retuned
> width/gap/density (the outings keep their own pre-011 packing, a local
> `placeFlowStyle` in `places/[slug].astro`), so nothing about places
> changes here. Galleries (and the image registry, the GPS barrier, the
> sampler) are unaffected.

## Summary

The photographer noticed this once there were enough galleries to walk
through (raised at the spec 007 close-out, 2026-09-05). A gallery page
is a wall of photographs, but the wall is boxed into the same column
the writing uses: the packed rows sit at the content width
(`--content-width`, 1160px) — wider than the reading measure, but still
a column with generous margins on a wide screen, so the photographs
feel penned in rather than given the page. The spacing between the
frames wants retuning too, and the density — how large each frame reads
— has only ever been judged on flat grey placeholder rectangles, which
is exactly the wrong thing to judge a photograph's size against.

This spec lets the packed rows run wider than the text column, retunes
the gap between frames and the common short side that sets their size,
and — for the first time on this site — makes those judgments against
real photographs rather than placeholders. Since spec 009 the place
pages pack their outings through the very same rules, so the treatment
moves with them: a place's outings widen and retune exactly as a
gallery's do, while the place's own writing stays at its reading
measure. The reading typography of pieces, the mats, the warm ground,
and the quiet view are all left alone.

## Goals

1. **The photographs run wider than the writing.** On a gallery page
   and in a place page's outings, the packed rows are free to run wider
   than the content column they sit in today — out toward, and possibly
   past, the viewport, to a width of their own. How much wider is
   chosen at a visual gate (Goal 5); the spec fixes the mechanism, not
   the number. All prose — a gallery's description, a place's writing,
   every piece's body — keeps its present reading measure.
2. **The spacing and the size are retuned.** The gap between frames and
   the common short side that sets how large a frame reads are both
   retuned, decided at the same gate. `gallery-layout.ts` stays the one
   place these knobs live, driving both the CSS and the srcset/`sizes`
   math from the same numbers so the two cannot drift.
3. **Galleries and places move together.** A place page's outings take
   the same width, gap, and density as a gallery's rows — one packing
   system, visually consistent across both. The place's writing keeps
   its reading measure; only the outings widen.
4. **Judged on real photographs.** About ten real exports go into the
   fixtures first, and every value in Goals 1–3 is chosen against them,
   not against placeholder rectangles. This closes the ROADMAP's "real
   photographs as fixtures, before more design" item for the gallery
   surfaces it touches.
5. **Decided by looking, on both screens.** The width, the gap, and the
   density are chosen at a visual gate on the photographer's two screens
   — a 16:10 laptop and a portrait monitor — from a sampler showing the
   candidates against the real photographs, before the values are
   committed.

## Non-goals

- **The mats, the warm ground, the quiet dark.** Real photographs may
  well make one or more of these worth revisiting; that is a separate
  judgment. If the fixtures reveal a problem there, it is surfaced for
  a later spec, not fixed here.
- **The related strip on the image page.** It lives inside the reading
  column by design (a row of thumbnails beside the writing) and shares
  `gallery-layout.ts`; it keeps its present width and its own smaller
  short side. Widening it is explicitly out of scope.
- **The reading typography pass** — the title's size, the lead's
  measure, the body column of a piece (its own ROADMAP item).
- **The front door** and the `LatestWork` strip (their own workshop).
- **The gallery/category page structure** — which images, what order,
  the editorial packing rule, the category row from spec 010. This
  spec changes how wide and how large the rows render, not what is in
  them or how they are ordered.
- **A migration to an external image store.** Real exports raise the
  repo's weight; that tradeoff is noted in the ROADMAP's "external
  store" and "page-weight budget" items and is not triggered here.

## Key user flows

- **Opening a gallery on the wide monitor.** The photographs fill the
  page rather than sitting in a narrow column with wide empty margins;
  a panorama and a portrait in the same row still land on the same
  short side, as today, just larger and with the row given room.
- **Opening a gallery on the laptop.** The rows run wider than the text
  would, but within a screen that has less room — the width is a value
  that reads well on both screens, chosen at the gate, not a number
  that only works on the large monitor.
- **A place page.** The writing at the top reads at its measure; below
  it, each outing's frames open at the new gallery width and spacing,
  so the place's photographs get the same room a gallery's do.
- **On a phone.** Below the collapse the behaviour is unchanged — one
  frame per row at the full width; nothing about the wider desktop
  treatment reaches the narrow screen.
- **The gate.** The photographer opens the sampler on both screens,
  sees the real photographs packed at the current values beside the
  candidate widths, gaps, and densities, and names the set to keep.

## Design requirements

- **The gallery width** is a knob of its own, wider than the content
  column the rows sit in today, applied to the packed rows on gallery
  pages and to place-page outings. Its exact value — and whether it is
  a fixed wider width, a viewport-relative width, or a bleed with page
  padding — is chosen at the gate from real candidates. The galleries
  index and the places index (the card grids) are considered at the
  gate too: if the pages run wider while their index cards stay boxed
  at the old width, that reads as an inconsistency, so the sampler
  shows the card grids at the candidate width and the gate decides
  whether they follow. The reading pages' heads (spec 010's
  `reading-head`) and all prose keep the content/reading measure.
- **The gap and the density** are retuned from their present values
  (gap `--baseline * 0.75`; short side `clamp(200px, 26vw, 280px)`),
  the new values chosen at the gate. Whatever changes, `gallery-layout.ts`
  remains the single source: the CSS custom properties it emits and the
  per-cell srcset/`sizes` ceilings it computes are derived from the
  same constants, and a reviewer can point to one number behind both.
- **The packing rule is unchanged.** Rows still pack to equal short
  sides in the photographer's order, still grow proportionally to fill
  the row, still centre a row that cannot fill, still carry the mat in
  the basis so the ratio isn't skewed. This spec moves the width, the
  gap, and the target short side; it does not touch the algorithm.
- **Below the collapse is preserved.** One frame per row at the full
  width below 720px; the related strip keeps its cap and its smaller
  short side. The wider desktop width applies only above the collapse.
- **The sampler** is a fixture page served only under the dev server,
  never built into the site (the same guard spec 010 established for
  `/dev/page-head/` — `getStaticPaths` returns nothing outside DEV, and
  the no-dev-routes barrier covers it). It shows the real photographs
  packed at the current values and at the candidate width/gap/density
  sets, labelled, with the site's real mats and ground, laid out so the
  photographer can compare them on both screens.

## Fixtures and authoring requirements

- **About ten real exports** are added to the fixtures — into
  `src/content/gallery-images/` and/or an existing piece's folder — so
  the gate and the sampler judge real photographs. The photographer
  supplies the files. No writing is required for them beyond what the
  registry needs to render a page.
- **The GPS barrier is a live test here.** Real camera exports commonly
  carry GPS EXIF, where every fixture to date has been synthetic. The
  constitution's constraint stands unchanged — GPS is never read and
  never emitted (`exifr` stays `gps: false`), the allowlist-only
  assertion holds, and the post-build scan of `dist/` must find no GPS
  block. Real GPS-bearing fixtures make that barrier prove itself on
  real files for the first time; the build staying green against them
  is part of this spec's acceptance, not an afterthought.
- **No new frontmatter, no schema change, no template restructure**
  beyond the width/gap/density knobs and the sampler route. The wall
  label, the registry, and the image pages render the real exports with
  what they already read from EXIF and the optional sidecar.

## Acceptance criteria

- [ ] About ten real photographs are present as fixtures; the build,
      the image registry, and the wall label render them; the GPS
      barrier (the allowlist assertion and the `dist/` scan) is green
      against them
- [ ] On a wide viewport the packed rows on a gallery page run wider
      than the content column they used before, to the width chosen at
      the gate; a place page's outings use the same width; a gallery's
      description, a place's writing, and every piece's body still read
      at their present measure
- [ ] The gap between frames and the common short side are the values
      chosen at the gate; `gallery-layout.ts` is still the single source
      for both the CSS custom properties and the srcset/`sizes` math,
      and the srcset ceilings track the new width and density
- [ ] The packing rule is unchanged — equal short sides in order,
      proportional grow, centred short rows, the mat in the basis;
      below 720px one frame per row; the related strip keeps its width
      and its smaller short side
- [ ] Whatever the gate decides for the index card grids
      (galleries and places) is applied consistently with the pages
- [ ] The sampler existed for the gate and is gone from the built site,
      behind the no-dev-routes barrier
- [ ] The whole test suite green; the build with its barriers (GPS
      scan and no-dev-routes included) green; `ROADMAP.md`,
      `DECISIONS.md`, and the README updated

## Decided (in this conversation, 2026-09-07)

Left to the orchestrator by the product owner except where noted; the
values themselves are the gate's, at the phase pause.

- **The width is decided at a sampler, not fixed in the spec** — the
  candidates (content-width, a wider fixed width, a viewport bleed) are
  shown against real photographs and chosen on both screens, the way
  spec 010's page-head sampler worked (product owner, 2026-09-07).
- **All three knobs are in scope** — the outer width, the gap, and the
  density (the common short side), not just width and gap (product
  owner, 2026-09-07).
- **Galleries and places move together** — place-page outings take the
  same width/gap/density as gallery rows; the place's writing stays at
  its reading measure (product owner, 2026-09-07).
- **Judged on real photographs first** — about ten real exports go in
  as fixtures before the tuning, closing the ROADMAP's "real
  photographs as fixtures" item for these surfaces; the photographer
  supplies the files (product owner, 2026-09-07).
