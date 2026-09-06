# Tasks: Places

**Status**: Draft (2026-09-06) — pending the skeptical-reviewer's
sign-off at the top tier
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized; the existing 230-test suite stays green through every
task. Cadence (product owner, under the model policy): the orchestrating
session triages each task and dispatches routine ones to the
`sdd-implementer` with a packet; it re-runs build and tests itself on
return; the `skeptical-reviewer` reviews each Phase 0 task from a
shell-assembled bundle, and each later phase as a whole; the person is
paused for after each phase and whenever something unexpected bears on
spec adherence.

Task ids: 009 = T7xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T7xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the rules, the registry, the pages (reviewer after each task; the person's gate at its end)

- [ ] **T701** — The pure rules. `image-meta.mjs`: `placeOf`, `placeProblems(refs, placeSlugs)` returning the plan's
      messages, `groupByPlace(framesByPiece, placeOfId, pieceOrder)`
      returning each place's outings and flat frames, `placeSummary` returning the card line. `pieces.ts`: `byOldestPublished` beside
      `byNewestPublished`. `image-set.ts`: `SetKind` gains `'place'`;
      `setKeyFromPath` matches `/places/<slug>/`. _Verify: vitest — the
      `places (T701, spec 009)` group in `image-meta.test.mjs` per the
      plan's list, and a new `image-set.test.mjs` for the key and the path;
      each new test mutation-checked with the test named that each mutation
      fails; 230 existing green; `astro check` green._
- [ ] **T702** — The schemas, the registry, the fixtures.
      `content.config.ts`: the `places` collection (`generateId` = file
      name; title, description?, cover?, draft), `place?` on pieces, `at?`
      on sidecars. `images.ts`: read places; refuse a non-slug id; the slug
      rule over every piece and sidecar (drafts included), all problems in
      one throw; resolve each published piece-folder frame's place via
      `placeOf` (a draft place resolves to none, with the note; a
      gallery-root `at:` ignored with the warning); `groupByPlace`;
      `SitePlace` (slug, entry, title, url, outings, frames, cover — checked
      against the frames, default the most recent outing's first — latest,
      years, summary); `registry.places` most recent outing first, ties by
      title; `image.place`; the place set last in `sets`. Fixtures per the
      plan: the two place files, the fog piece's `place:` and its three
      sidecars (`_pano.md` none, `_land-c.md` the-jetty, `_land-b.md`'s
      free text shortened), the jetty piece's `_jetty-dawn.md`. _Verify:
      build green; a temporary route dumping `registry.places` and each
      fixture frame's `place` and `sets` (deleted before commit) shows the
      headlands with one outing of six frames in the plan's order, the
      jetty with two outings oldest first, land-c's sets ending in
      `place:the-jetty` with next = jetty-dawn, pano and the sampler's
      frames with no place; the five temporary runs (unknown slug on a
      piece, unknown `at:`, an empty place, a draft copy of the fog piece,
      a cover that is not a frame) each with their actual message or note
      recorded here and the files removed; vitest 230+ green; `astro check`
      green._
- [ ] **T703** — The pages and the nav. `CoverCards.astro` from
      `GalleryCards.astro`'s markup and styles, `GalleryCards` a wrapper;
      `src/pages/places/index.astro`; `src/pages/places/[slug].astro` per
      the plan (header, summary line, the writing when present, the
      outings as `.gallery-flow` rows with linked headings and dates,
      `data-pagefind-body` with the outings ignored, the OG cover);
      `NAV_ITEMS` gains Places after Galleries. _Verify: build green;
      `dist/galleries/index.html` and `dist/categories/landscape/index.html`
      identical before and after (diff recorded); `/places/` and the two
      place pages read as the plan's fixture paragraph says (titles,
      order, counts, every frame a link to its page, every heading a link
      to its piece); geometry at 1440×900, 1080×1920, 375×812 measured in
      the browser — rows packed, headings clear of rows, the nav's six
      items — with the numbers recorded; Pagefind indexes the place pages
      (count in the postbuild output); `astro check` green._
- [ ] **T704** — The image page. The label's place row as a link to
      the place with the free text after `·`; `neighbours.atPlace`;
      `indexed` counts a place. _Verify: build green; in the browser,
      land-b's label row is a link to `/places/the-headlands/` followed by
      "above the cove, north Pacific coast"; from `/places/the-jetty/`
      clicking land-c shows "At The jetty · 1 of 2" with next = jetty-dawn,
      and from the fog piece the same page shows the piece's line — both
      read from the DOM after navigation; a frame with free text and no
      place (the gallery root's dock-b, if given one temporarily, or
      simply land-b with the fixture's `place:` line removed in a
      temporary run) shows the text alone; vitest green; `astro check`
      green._

## Phase 1 — The docs (reviewer after the phase)

- [ ] **T705** — Docs: `AUTHORING.md` gains a "Places" section
      (declaring a place, `at:` on a frame, the piece default and `at:
none`, what the page shows, that a place grows on its own, gallery-root
      frames excluded), a place template beside the piece and sidecar
      templates, `place:` in the piece template and `at:` in the sidecar
      template, and the sidecar field note that `at` is a slug while `place`
      is prose; `README.md`'s content model, the image-page paragraph, the
      nav sentence, and the structure listing mention places. _Verify:
      every claim read against the built pages by the orchestrator; Prettier
      clean; build green._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T706** — `ROADMAP.md`: the Places entry struck with the
      follow-ups the plan names (images in a place's writing; gallery-root
      frames in a place; renaming a place). `DECISIONS.md`: a spec 009
      section (the frame as the unit with the piece default as shortcut,
      `at`, oldest first, Places in the nav, the cover check's home). Both
      on `main`. Then the pre-merge whole-spec sweep at the top tier and its
      findings resolved; the spec's acceptance criteria checked against
      their records; build, tests, check, GPS scan, and format green with
      actual output; the PR marked ready and merged with a merge commit.
      _Verify: main green after the merge._

---

## Tier log (the third spec under the model policy)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare against spec 008's totals:
implementer 490,854 over nine dispatches; reviewer 905,152 all tiers. -->

| Task / invocation | Tier | Tokens | Outcome / miss reason |
| ----------------- | ---- | ------ | --------------------- |

---

## Handoff note

> Read `CLAUDE.md` and `specs/009-places/{spec,plan,tasks}.md`, then
> begin at T701 as the orchestrator under the model policy: triage,
> dispatch routine tasks to the `sdd-implementer` with a packet (the
> task line, the plan section, the acceptance criteria, the files, the
> pattern file), verify by running build and tests yourself, the
> `skeptical-reviewer` on each Phase 0 task from a shell-assembled
> bundle and on each later phase as a whole, commit, check the box, log
> the tier and tokens. Involvement level is product owner: pause after
> each phase and whenever something unexpected bears on spec adherence.

Every pause produces a report in this shape, in this order:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
