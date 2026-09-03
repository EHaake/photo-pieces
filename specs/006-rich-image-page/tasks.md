# Tasks: The Rich Image Detail Page

**Status**: Approved (photographer, 2026-09-02) — in progress
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized. The existing 149-test suite stays green through every
task — no weakening tests to pass. Review cadence: stop after each
task in Phases 0–1 (the private-raster rule and the registry shape —
everything after depends on them), after each phase from Phase 2 on.
The photographer's visual gate is the end of Phase 2, when the real
page can be compared with the mock-up side by side.

Task ids continue the numbering: 001 = T0xx, 002 = T1xx, 003 = T2xx,
004 = T3xx, 005 = T1xx (carried), 006 = T4xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T4xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Pure rules, schema, fixtures (review after each task)

- [x] **T401** — One reference rule, and private rasters: in
      `image-meta.mjs`, `referencesImage(text, basename)` (shorthand
      and directive-attribute forms, with or without `./`, never a
      near-miss basename) with `firstAltFor` rewritten over it;
      `isPrivateRaster(basename)` and `privateTargetOf(basename)`;
      `classifyContentImage` returns a private classification (target,
      folder, path) for a `_`-prefixed raster before parsing an id;
      `parseImagePath` throws an `ImageIdError` with the private-file
      message for `_`-prefixed basenames (so the transform reports a
      piece referencing `./_land-b.jpg` with file and line);
      `validateGalleries` gets a private-raster branch with its own
      reason. _Verify: vitest — `referencesImage` for all four forms
      and the near-miss (`land-b` vs `land-bb`); classification of
      `_land-b.jpg`, `_land-b.JPG`, and `_x.webp` in a piece folder and
      the gallery root; the id rejection message; a gallery naming
      `<slug>/_land-b` fails with the private reason, not the generic
      unknown-id one; the vocabulary suite's new case (a piece
      referencing a private raster fails, message quoted); each new
      test shown to fail with its rule broken (report once, restore);
      149 tests + new green; build green._
- [x] **T402** — Pure rules, part two: `pieceOrder(body, basenames)`,
      `neighbours(list, id)`, `nearest(list, id, limit)`,
      `passageFor(body, basename)`, and `sectionsFor(image)` (the
      spec's section order, shared by the page). _Verify: vitest —
      order is first-reference order then unreferenced by name;
      neighbours at the start, middle, end, and for an id not in the
      list; nearest with the cap at both ends of the list; passage
      from a shorthand reference, from a container block (prose +
      caption), skipping an image-bearing block, the strip block's
      caption is its caption line and not the `![…]` line, null with no
      reference; sections for the empty sidecar (none), story only,
      fields only, everything — each shown to fail with its rule
      broken; build green._
- [x] **T403** — Schema and fixtures: the nine optional sidecar fields
      in `content.config.ts`; `gen-placeholders.mjs` gains the camera's
      frame for the demo hero (`where-the-fog-lets-go/_land-b.jpg`: a
      flat, desaturated **4:3** variant of the 3:2 `land-b`, with GPS);
      `_land-b.md` gains every field and a three-paragraph fixture
      story; `gallery-images/_dock-b.md` gains a story containing a
      diptych of `./dock-a.jpg` and `./dock-b.jpg`. All join spec 005's
      unpublish list. _Verify: `astro check` and build green with the
      fixtures in place; a sidecar field of the wrong type is rejected
      by the schema (temporary, reverted) — an unknown field is
      stripped, not rejected, as in every collection here (found at
      T403: Astro's schemas aren't strict, and Obsidian adds properties
      of its own, so strictness would be the wrong trade); the frame's
      dimensions are 4:3 and its GPS block is present in the source
      file (one-off `exifr` read) so the passthrough tripwire is real.
      Found at T403: the tripwire fired one task early — an imported,
      not-yet-rendered image ships as an untouched original, and the
      pruner only pruned originals with transform siblings. The pruner
      now prunes every unreferenced original (plan.md, Corrections)._

## Phase 1 — Registry (review after each task)

- [x] **T404** — Registry, part one: an explicit private branch in
      discovery (own map, no nested-file warning), private rasters
      attached as `before` on their target by basename across
      extensions and cases; an orphan private raster (no target among
      the folder's discovered files — published, draft, or unowned)
      fails the build naming the file; `record`, `print`, `hasStory`,
      and `label.place` / `label.time` from the sidecar. _Verify:
      build — no `/images/where-the-fog-lets-go/_land-b/` page; a
      temporary `gallery-images/_nothing.jpg` fails the build with its
      path (reverted); a temporary `_land-a.png` beside a temporarily
      `draft: true` piece does not fail (reverted); the post-build GPS
      scan passes; 149+ tests green. (Done — also probed: a second
      frame `_land-b.png` beside `_land-b.jpg` fails naming the
      photograph; the draft case used an isolated temporary piece,
      since drafting a fixture piece trips the gallery rule first.)_
- [x] **T405** — Registry, part two: `sets` (every gallery holding the
      image, newest first, then the piece's `pieceOrder` set; each with
      index, count, prev and next **ids**), `related` (ids of the six
      nearest folder frames in piece order, private rasters excluded,
      empty for gallery-root images), and `passage` (source markdown
      from the owning piece). _Verify: a temporary dump route (deleted)
      shows `land-b`'s sets as [Fog frames 2 of 4, Editor's picks n of
      m, piece order] with the right neighbours, `related` = six of the
      folder's seven other frames in piece order with `_land-b`
      absent, `passage` = the "By half past…" paragraph with the wide
      block's caption; `gallery/dock-b` has sets from its galleries
      only and no related; build green. (Done: `land-b` is in Fog frames
      only, so the multi-gallery case was read off `pano` — Fog frames
      4 of 4 with no next, Editor's picks 6 of 6, the piece 6 of 8.)_

## Phase 2 — The page (review after the phase; visual gate at its end)

- [x] **T406** — Static sections, in spec order: the story via
      `render(sidecar)` in the reading column at text colour; the
      share description from the story's first paragraph; place and
      time rows at the label's head; How it was made; In the piece
      (blockquote, prose and caption through `renderMarkdown`, "Read it
      in place →"); Related frames as a `.gallery-flow` with
      `RELATED_SHORT_PX` / `relatedFlowStyle` / `galleryCell()` from
      `gallery-layout.ts`; The print with the enquiry `mailto:` — each
      rendered only when `sectionsFor` says so; styles ported from the
      mock-up, sample markers and review chrome left behind; wording in
      one `const` block. _Verify: built HTML of `land-b` contains every
      section in order and `dock-b` only the story, label, and gallery
      context, with its diptych linking to `/images/gallery/…/`; a
      no-sidecar image's built page passes a content-equivalence script
      against its 004 build — same stage markup, same label rows in the
      same order, same caption and piece/gallery links, no empty
      section elements; related short sides equal within a row
      (browser measurement); build green. (Done: equivalence checked by
      a script over the two builds — the 004 page from `main` built
      temporarily — with Astro's scoping attributes normalized; the
      only difference outside the new sections is the label's
      `data-pagefind-ignore` markers.)_
- [x] **T407** — Static compare and neighbours: the `compare` figure
      with before above after, real alt texts, visible labels, the
      before frame letterboxed in the photograph's box (no script yet);
      one `frame-nav` per set with the default visible and the others
      `hidden`, `data-set` on each nav and its links, titles
      ellipsised, arrows as text, two columns below 720px; the
      quiet-view button rendered `hidden`; `data-pagefind-body` on the
      article only when the page has a story, a caption, or a place;
      `data-pagefind-ignore` on the exposure rows, the from-lines, the
      navs, and the related strip. _Verify: built HTML has both frames
      with alts, N navs with exactly one visible, the hidden button;
      the 2-column nav measured at 375px; after a build, Pagefind's
      index contains `land-b` and `dock-b` and not a label-only fixture
      page, and a search for a story line finds `land-b`; the compare
      requests webp (no source-format, source-width variant in the
      output); build green._
- [x] **T408** — Page-level script: `data-js` on the compare with the
      overlay, clip at `--split`, the range input by pointer and
      keyboard with a visible focus ring on the figure; quiet view
      (button revealed, `html[data-quiet]`, Escape and ground click
      exit, no history change, kept across image-page swaps, cleared
      on any other page); set selection by route in (the delegated
      click handler in `BaseLayout`'s script writes the set, the page
      script reads it at `astro:page-load`); arrow keys activate the
      visible nav's links, never while an input has focus. _Verify:
      browser geometry — the before frame's clip at 20 and 50; quiet
      view hides the header and fits the frame, exits on Escape, stays
      through an arrow-key step, is gone after navigating to the
      gallery; arriving at `land-b` from `/galleries/fog-frames/`
      shows the Fog frames nav, from `/pieces/where-the-fog-lets-go/`
      the piece nav, from a neighbour link the same set as before,
      from a cold load the default; ArrowRight with the slider focused
      moves the slider and not the page; build green._
- [x] **T409** — Visual gate: the real page beside the mock-up on the
      dev server for the photographer, at desktop and 375px; the 004
      image-page geometry checks re-run (stage height, frame fit).
      _Verify: the photographer's sign-off recorded here; any
      amendment becomes a sub-lettered task (T409a…) rather than a
      silent change. Signed off 2026-09-02 ("Looks great") after
      T409a._
- [x] **T409a** — Quiet view, per the photographer at the gate: a
      click on the photograph enters it (the toggle stays as a second
      way in); the frame fills the viewport with a small margin (the
      reading-width cap lifted, the stage padding shrunk, the mat
      kept); the ground dims to a new `--color-quiet` token; any click
      or Escape leaves; the stage image's `sizes` swaps to `100vw` in
      quiet view so a wide frame stays sharp. _Verify: browser at
      1280×900 — a click on the frame sets `data-quiet`, the frame's
      width or height reaches within the margin of the viewport, the
      computed ground colour is the token, a click on the frame leaves,
      the toggle still enters, Escape leaves, `sizes` swaps both ways;
      at 375px the frame fills the width; build green._

## Phase 3 — Docs and close-out

- [x] **T410** — Docs: `AUTHORING.md` — a full sidecar template with
      every field and an example, the story as the body, the camera's
      frame convention (`_<basename>.<ext>`, one per photograph, never
      referenced from a piece, and the note that `_x.md` and `_x.jpg`
      are two relations under one prefix), the unpublish list;
      `README.md` — the rich page in the images section, the
      `sequence` row still reserved; `DECISIONS.md` — private rasters
      by `_` prefix over a sidecar field, story-first, related as the
      outing only, click-tracked set selection and its failure mode,
      index scoping. _Verify: Prettier clean; the template in
      AUTHORING.md parses (copy it into a temporary sidecar, build,
      revert)._
- [x] **T411** — Delete `src/pages/image-review/`; update `ROADMAP.md`
      (the rich page shipped; follow-ups it surfaced; the processing
      showcase and `sequence` entries say the compare is a page
      section and the block stays reserved); then request the
      pre-merge whole-spec sweep (skeptical reviewer) and resolve its
      findings. _Verify: no `/image-review/` routes in the build;
      ROADMAP no longer lists the rich page as future; the sweep came
      back clean or its findings were resolved; build, tests, check,
      GPS scan, and format all green — actual output reported. (Done:
      sweep verdict sound-with-changes, all findings resolved —
      plan.md, "Pre-merge review amendments".)_

---

## Handoff note

> Read `CLAUDE.md` and `specs/006-rich-image-page/{spec,plan,tasks}.md`,
> then begin at T401. Stop for review after each task in Phases 0–1;
> from Phase 2 on, stop after each phase. The photographer's visual
> gate is T409.
