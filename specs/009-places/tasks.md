# Tasks: Places

**Status**: In progress (2026-09-06) — signed off by the
skeptical-reviewer at the top tier and approved by the product owner;
Phase 0 complete and attested, Phase 1 under way
**Implements**: plan.md in this directory
**Foundational phases**: 0 — per-task reviewer cadence; Phases 1 and 2
are per-phase (Phase 2's review is the pre-merge sweep).

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`) reported, not summarized; the existing
230-test suite stays green through every task. Cadence (product owner,
under the model policy as amended 2026-09-06): the orchestrating session
triages each task and dispatches routine ones to the `sdd-implementer`
on a task bundle assembled with shell, telling it not to read plan.md,
spec.md, or tasks.md in full; in Phase 0 it re-runs the verification
command itself and has the `skeptical-reviewer` review each task from a
staged, shell-assembled bundle — one review and at most one re-review
per task, anything still open logged and left to the sweep; in later
phases the implementer's verbatim output is the verification and the
reviewer checks the phase as a whole; the sweep runs at the reviewer's
default tier on the documents plus `git diff main...HEAD`; a fresh
orchestrator session starts each phase; the person is paused for after
each phase and whenever something unexpected bears on spec adherence.

Task ids: 009 = T7xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T7xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the rules, the registry, the pages (reviewer after each task; the person's gate at its end)

- [x] **T701** — The pure rules. `image-meta.mjs`: `placeOf` (a `none`
      default is no default), `placeNameProblem(name)` (not a slug, or
      `none`, with the plan's messages), `placeProblems(refs, placeSlugs)`
      returning the plan's messages, `groupByPlace(framesByPiece, placeOfId, pieceOrder)`
      returning each place's outings and flat frames, `placeSummary` returning the card line. `pieces.ts`: `byOldestPublished` beside
      `byNewestPublished`. `image-set.ts`: `SetKind` gains `'place'`;
      `setKeyFromPath` matches `/places/<slug>/`. _Verify: vitest — the
      `places (T701, spec 009)` group in `image-meta.test.mjs` per the
      plan's list, and a new `image-set.test.mjs` for the key and the path;
      each new test mutation-checked with the test named that each mutation
      fails; 230 existing green; `astro check` green. Record: verified first try, 252 tests (230 + 22), 24 mutations
      each caught; the review signed off with notes for T702 — type
      `ImageSet.kind` as `SetKind` (the two unions agree by luck until
      then), `byOldestPublished` is verified only by the fixtures, and
      `placeSummary`'s year sort and its no-dates branch are defensive and
      untested (outings arrive oldest first; every outing has a date)._
- [x] **T702** — The schemas, the registry, the fixtures.
      `content.config.ts`: the `places` collection (`generateId` = file
      name; title, description?, cover?, draft), `at?` on pieces and on
      sidecars. `images.ts`: read places; refuse an id `placeNameProblem` refuses; the slug
      rule over every piece and sidecar (drafts included), all problems in
      one throw; resolve each published piece-folder frame's place via
      `placeOf` (a draft place resolves to none, with the note; a
      gallery-root `at:` ignored with the warning); `groupByPlace`;
      `SitePlace` (slug, entry, title, url, outings, frames, cover — checked
      against the frames on a publishing place only, default the most
      recent outing's first — latest,
      years, summary); `registry.places` most recent outing first, ties by
      title; `image.place`; `ImageSet.kind` typed as `SetKind`; the place set
      last in `sets`. Fixtures per the plan: the two place files, the fog
      piece's `at:` and its three
      sidecars (`_pano.md` none, `_land-c.md` the-jetty, `_land-b.md`'s
      free text shortened), the jetty piece's `_jetty-dawn.md`. _Verify:
      build green; a temporary route dumping `registry.places` and each
      fixture frame's `place` and `sets` (deleted before commit) shows the
      headlands with one outing of six frames in the plan's order, the
      jetty with two outings oldest first, land-c's sets ending in
      `place:the-jetty` with next = jetty-dawn, pano and the sampler's
      frames with no place; the six temporary runs (unknown slug on a
      piece, unknown `at:`, an empty place that also declares a cover — the
      note and no cover failure, a draft copy of the fog piece, a cover
      that is not a frame on a publishing place, `the-jetty.md` as a draft — its note,
      no page, no card, land-c with no place and no place set) each with
      their actual message or note recorded here and the files restored;
      vitest 230+ green; `astro check` green. This is the spec's largest
      task — the schemas, the registry, the fixtures, the runs — kept
      whole because the fixtures are what make the registry checkable;
      the escape hatch is likelier here than elsewhere._

The T702 record. Verified first try: build 74 pages, check 0 errors,
252 tests, Prettier clean. The dump below is the orchestrator's own run
of the temporary endpoint (`src/pages/dump-places.json.ts`, deleted
after; `dist/dump-places.json` absent on the final run), its content
re-serialized one line per place and per frame (the file itself is
pretty-printed under a `places`/`frames` wrapper; nothing dropped):

```json
{"slug":"the-jetty","outings":[{"piece":"where-the-fog-lets-go","frames":["where-the-fog-lets-go/land-c"]},{"piece":"first-light-at-the-jetty","frames":["first-light-at-the-jetty/jetty-dawn"]}],"frames":["where-the-fog-lets-go/land-c","first-light-at-the-jetty/jetty-dawn"],"cover":"first-light-at-the-jetty/jetty-dawn","latest":"2026-08-30T00:00:00.000Z","summary":"2 outings · 2 frames · 2026"}
{"slug":"the-headlands","outings":[{"piece":"where-the-fog-lets-go","frames":["where-the-fog-lets-go/land-a","where-the-fog-lets-go/land-b","where-the-fog-lets-go/port-b","where-the-fog-lets-go/port-a","where-the-fog-lets-go/port-45","where-the-fog-lets-go/square"]}],"frames":["where-the-fog-lets-go/land-a","where-the-fog-lets-go/land-b","where-the-fog-lets-go/port-b","where-the-fog-lets-go/port-a","where-the-fog-lets-go/port-45","where-the-fog-lets-go/square"],"cover":"where-the-fog-lets-go/land-a","latest":"2026-08-28T00:00:00.000Z","summary":"1 outing · 6 frames · 2026"}
{"where-the-fog-lets-go/land-c":{"place":"the-jetty","sets":["gallery:fog-frames 3/4 prev=where-the-fog-lets-go/land-b next=where-the-fog-lets-go/pano","piece:where-the-fog-lets-go 3/8 prev=where-the-fog-lets-go/land-b next=where-the-fog-lets-go/port-b","place:the-jetty 1/2 prev=undefined next=first-light-at-the-jetty/jetty-dawn"]}}
{"where-the-fog-lets-go/pano":{"place":null,"sets":["gallery:fog-frames 4/4 prev=where-the-fog-lets-go/land-c next=undefined","gallery:editors-picks 6/6 prev=gallery/dock-b next=undefined","piece:where-the-fog-lets-go 6/8 prev=where-the-fog-lets-go/port-a next=where-the-fog-lets-go/port-45"]}}
{"where-the-fog-lets-go/land-b":{"place":"the-headlands","sets":["gallery:fog-frames 2/4 prev=where-the-fog-lets-go/land-a next=where-the-fog-lets-go/land-c","piece:where-the-fog-lets-go 2/8 prev=where-the-fog-lets-go/land-a next=where-the-fog-lets-go/land-c","piece:vocabulary-sampler 9/10 prev=vocabulary-sampler/pano next=gallery/dock-a","place:the-headlands 2/6 prev=where-the-fog-lets-go/land-a next=where-the-fog-lets-go/port-b"]}}
{"vocabulary-sampler/land-b":{"place":null,"sets":["piece:vocabulary-sampler 2/10 prev=vocabulary-sampler/land-a next=vocabulary-sampler/land-c"]}}
{"first-light-at-the-jetty/jetty-dawn":{"place":"the-jetty","sets":["piece:first-light-at-the-jetty 1/1 prev=undefined next=undefined","place:the-jetty 2/2 prev=where-the-fog-lets-go/land-c next=undefined"]}}
{"gallery/dock-a":{"place":null,"sets":["gallery:editors-picks 3/6 prev=market-day-camera-low/land-c next=market-day-camera-low/port-45","piece:vocabulary-sampler 10/10 prev=where-the-fog-lets-go/land-b next=undefined"]}}
```

The runs (the implementer's six, each restored after, its messages
verbatim; runs 6 and 7 re-run by the orchestrator): (1) the fog piece's
`at: the-headland` — `[places] src/content/pieces/where-the-fog-lets-go/index.md: no place named "the-headland" — the places are: the-headlands, the-jetty`, build exit 1; (2) `_jetty-dawn.md` `at: nowhere` — the same message with the sidecar's path; (3) `places/empty.md` with `cover: where-the-fog-lets-go/land-a` — `[places] note: empty has no published frame yet — no page until a photograph names it`, build exit 0, no cover failure; (4) a draft copy of the fog folder naming the headlands — build exit 0, no `[places]` line, the dump unchanged (the implementer's run, prose only — left to the sweep to re-run or accept on the fixture); (5) `the-jetty.md` `cover: where-the-fog-lets-go/land-a` — `[places] src/content/places/the-jetty.md: cover "where-the-fog-lets-go/land-a" is not one of this place's frames`, build exit 1; (6) `the-jetty.md` `draft: true` — `[places] note: the-jetty is a draft — no page, and its frames show no place`, build exit 0, the dump's places `['the-headlands']`, land-c `place: null` with sets `gallery:fog-frames 3/4` and `piece:where-the-fog-lets-go 3/8` only, jetty-dawn `place: null` with `piece:first-light-at-the-jetty 1/1` only; (7, added at review) `_dock-b.md` `at: the-jetty` at the gallery root — `[places] src/content/gallery-images/_dock-b.md: gallery-root photographs are not grouped under a place — the line is ignored`, build exit 0. The review's blocking finding was the record, not the code: the review bundle had summarized the dump in prose, and the record now carries the file's bytes from the orchestrator's re-run. Notes left open: no run puts a typo on a draft piece (the code passes every piece unfiltered); blank `at` values are filtered inside `placeProblems` rather than before the call, one copy of the rule.

- [x] **T703** — The pages and the nav. `CoverCards.astro` from
      `GalleryCards.astro`'s markup and styles, `GalleryCards` a wrapper;
      `src/pages/places/index.astro`; `src/pages/places/[slug].astro` per
      the plan (header, summary line, the writing when present, the
      outings as `.gallery-flow` rows with linked headings and dates,
      `data-pagefind-body` with the outings ignored, the OG cover);
      `NAV_ITEMS` gains Places after Galleries. _Verify: build green;
      `dist/galleries/index.html` and `dist/categories/landscape/index.html`
      identical before and after once `data-astro-cid-[a-z0-9]+` and the
      hashed CSS link are normalized to placeholders, and the page's CSS
      (the linked files, or the inline sheet if Astro inlined it — say
      which) identical under the same normalization (the scoped-style hash
      is per file, so a raw diff cannot be clean — the plan says why; both
      normalized diffs recorded); `/places/` and the two
      place pages read as the plan's fixture paragraph says (titles,
      order, counts, every frame a link to its page, every heading a link
      to its piece); geometry at 1440×900, 1080×1920, 375×812 measured in
      the browser — rows packed, headings clear of rows, the nav's six
      items — with the numbers recorded; Pagefind indexes the place pages
      (count in the postbuild output); `astro check` green._

The T703 record. Verified first try: build 77 pages, Pagefind 8 (was
6), check 0 errors, 252 tests, Prettier clean; `ls dist/places/` →
`index.html the-headlands the-jetty` and nothing else. The normalized
comparison (linked `/_astro/BaseLayout.….css` identical after cid
normalization; the HTML normalized for cids and the css link) is not
literally clean, and the two deltas are accepted: the nav's new
`<a href="/places/">Places</a>` on both pages (this task's own change,
on every page), and on `/galleries/` alone the two inlined scoped
sheets in swapped order — the card sheet now arrives through a nested
import and Astro emits the deeper import's sheet first; every rule
byte-identical after normalization, and the two selector families
(`.gallery-card*`, `.gallery-group*`) never match one element, so the
order carries nothing (plan.md now says so). The built-page checks read
as the plan's fixture paragraph says (six frames in order on the
headlands with no pano and no land-c; two outings oldest first on the
jetty with dates and the OG image; the jetty card first on the index;
six nav items in order). Geometry, measured in the browser on the dev server (document coordinates, px): 1440×900 — the nav's six items on one row (tops all 20, right edge 1019 of 1440; brand 133–343); the headlands' h2 bottom 960, first row top 1005; rows [2 cells h392 spanning 133–1293], [2 cells h545 at 133–900 beside 1 cell h460 at 918–1293 — equal short sides, portraits beside a landscape, as the gallery packs], [1 cell h412 centred 507–918]; the jetty's second outing carries the 1px hairline, h2 bottoms 860/1524 before row tops 905/1569; the index's two cards side by side 133–507 and 525–900. 1080×1920 — nav one row (tops 20, right edge 828); h2 bottom 837, first row 882; rows [2×h338, 32–1033], [2×h467 beside 1×h395], [1×h404 centred]; hairline on the second outing; cards 32–524 and 542–1033. 375×812 — the header wraps the nav under the brand (brand 20–50, nav one row at top 66 from 16 to 350, header 0–119), document width 375 with no horizontal overflow; one frame per row at 16–359 (heights 234, 234, 507, 506, 425, 343); h2 bottom 1010, first row 1055; the jetty's rows 839 and 1256 under h2 bottoms 794 and 1211, hairline on the second; the index's cards stacked 400–696 and 714–1010. Viewport reset to the pane's size after. A bodiless place, run by the
orchestrator (the-jetty's body stripped, restored after): the page
builds with no `.prose` block and its outings intact. The review signed
off with notes: `render()` runs unconditionally and only `<Content />`
is gated (equivalent); the `.lead` scoped width duplicates the theme's
global rule as the gallery page's does — left to the sweep; the outing
hairline is a `border-top`, not the galleries index's `border-bottom`,
by the plan's word, and it sits 79px above the second heading at
1440 (section top 1395, h2 1474).

- [x] **T704** — The image page. The label's place row as a link to
      the place with the free text after `·`; `neighbours.atPlace`;
      `indexed` counts a place. _Verify: build green; in the browser,
      land-b's label row is a link to `/places/the-headlands/` followed by
      "above the cove, north Pacific coast"; from `/places/the-jetty/`
      clicking land-c shows "At The jetty · 1 of 2" with next = jetty-dawn,
      and from the fog piece the same page shows the piece's line — both
      read from the DOM after navigation; a frame with free text and no
      place (the gallery root's dock-b, if given one temporarily, or
      simply land-b with the fog piece's `at:` line removed in a
      temporary run) shows the text alone; vitest green; `astro check`
      green._

The T704 record. Verified first try: build 77 pages, Pagefind 15 (the
seven newly placed image pages join the index, as the plan's index rule
says), check 0 errors, 252 tests, Prettier clean. Built pages: land-b's
Place row `<a href="/places/the-headlands/">The headlands</a> · above
the cove, north Pacific coast`; jetty-dawn's the link alone; the
sampler's land-b and the gallery root's dock-b with no place link; the
place navs "At The headlands · 2 of 6", "At The jetty · 1 of 2" (next
jetty-dawn), "At The jetty · 2 of 2"; the temporary run without the fog
piece's `at:` showed land-b's free text alone and the registry's
empty-place note. Browser, on the dev server: from `/places/the-jetty/` clicking land-c lands on `/images/where-the-fog-lets-go/land-c/` with `sessionStorage` `image-set` = `place:the-jetty`, the visible frame-nav `data-set="place:the-jetty"` reading "At The jetty · 1 of 2" with next `/images/first-light-at-the-jetty/jetty-dawn/`; the label's place link `href="/places/the-jetty/"` measures `oklch(0.36 0.075 185)` (the accent) with the underline gradient at `0px 1px` at rest and, hovered, `oklch(0.3168 0.066 185)` (the accent-hover) with `100% 1px`; from `/pieces/where-the-fog-lets-go/` the same click stores `piece:where-the-fog-lets-go` and the visible line reads "From Where the fog lets go · 3 of 8". The review signed off with two
notes: the free-text-alone state had no permanent fixture (closed by
T704a below), and `.wall-label dd a` also matches the record's and the
print's lists, whose values are plain strings today.

- [x] **T704a** — Added at T704's review: the fog piece's `_pano.md`
      gains a free-text `place` beside its `at: none`, so the label's
      text-alone state is pinned by a fixture rather than a temporary
      run. _Verify: pano's built page carries `Place` → "The road home,
      from the car window" with no place link — grep'd on the build:
      the row present, `href="/places/the-` absent; build, check, and
      252 tests green._

## Phase 1 — The docs (reviewer after the phase)

- [ ] **T705** — Docs: `AUTHORING.md` gains a "Places" section
      (declaring a place, `at:` on a frame, the piece default and `at:
none`, what the page shows, that a place grows on its own, gallery-root
      frames excluded), a place template beside the piece and sidecar
      templates, `at:` in the piece template and in the sidecar template,
      and the field note that `at` is a slug wherever it is written while
      the sidecar's `place` is prose; `README.md`'s content model, the image-page paragraph, the
      nav sentence, and the structure listing mention places. _Verify:
      every claim read against the built pages by the orchestrator; Prettier
      clean; build green._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T706** — `ROADMAP.md`: the Places entry struck with the
      follow-ups the plan names (images in a place's writing; gallery-root
      frames in a place; renaming a place). `DECISIONS.md`: a spec 009
      section (the frame as the unit with the piece default as shortcut,
      `at` on both files with `none` accepted on either and the autocomplete
      reason, oldest first, Places
      in the nav, the cover check's home). Both ride this spec branch
      and merge with the PR, as spec 008's close-out docs did, so the
      sweep's diff against `main` contains them. Then the pre-merge whole-spec sweep at the top tier and its
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

| Task / invocation                             | Tier             | Tokens                            | Outcome / miss reason                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | ---------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| plan/tasks sign-off ×4 (orchestrator-drafted) | top tier         | 85,833 + 53,976 + 39,525 + 16,578 | fix and re-review ×3 (the cards diff unsatisfiable raw — Astro's per-file scoped-style hash; the draft-place criterion unverified; then the docs' commit target and a leftover testing bullet; then the slug rule contradicting the precedence on a piece's `none`), then signed off. Packet note for T701: the `placeProblems` test must feed a piece value and a sidecar value through the same check, so the piece's `none` is verified, not inferred |
| Planning: draft (`sdd-planner`)               | —                | —                                 | not run for 009: the plan was drafted by the orchestrator in Plan Mode before the planner existed and had been signed off with Phase 0 built on it; the product owner chose to keep it and use the planner from spec 010 on (2026-09-06)                                                                                                                                                                                                                 |
| T701 (sdd-implementer)                        | opus             | 53,735                            | verified first try; 24 mutations caught; the `ImageSet.kind` retype correctly left to T702                                                                                                                                                                                                                                                                                                                                                               |
| T701 review                                   | reviewer default | 41,967                            | signed off; three notes carried to T702's packet                                                                                                                                                                                                                                                                                                                                                                                                         |
| T702 (sdd-implementer)                        | opus             | 69,247                            | verified first try; the dump and six runs reported with the JSON verbatim                                                                                                                                                                                                                                                                                                                                                                                |
| T702 review                                   | reviewer default | 49,709                            | fix and re-review: the review bundle's prose summary of the dump (the orchestrator's, not the implementer's) — fixed by the orchestrator's own re-run recorded verbatim, plus a seventh run for the gallery-root warning                                                                                                                                                                                                                                 |
| T702 re-review                                | reviewer default | 27,585                            | signed off; open to the sweep: run 4's dump is the implementer's prose                                                                                                                                                                                                                                                                                                                                                                                   |
| T703 (sdd-implementer)                        | opus             | 54,756                            | verified first try; the normalized comparison and the built-page greps reported verbatim                                                                                                                                                                                                                                                                                                                                                                 |
| T703 review                                   | reviewer default | 41,612                            | signed off; the two comparison deltas recorded, the sheet-order artifact added to plan.md, a bodiless place run by the orchestrator                                                                                                                                                                                                                                                                                                                      |
| T704 (sdd-implementer)                        | opus             | 47,303                            | verified first try; the built-page evidence and the temporary run verbatim; the browser checks run by the orchestrator                                                                                                                                                                                                                                                                                                                                   |
| T704 review                                   | reviewer default | 29,136                            | signed off; the fixture gap closed as T704a by the orchestrator                                                                                                                                                                                                                                                                                                                                                                                          |

---

## Handoff note

**Phase 0 is complete (2026-09-06)**: T701–T704a checked, each reviewed
and signed off; the person's gate is next. The next session begins at
T705 (Phase 1, the docs; its bundle is the orchestrator's to assemble
fresh), reviewer after the phase; then T706.

> Read `CLAUDE.md` and `specs/009-places/{spec,plan,tasks}.md`, then
> begin at the first unchecked task as the orchestrator under the model
> policy: triage; dispatch each routine task to the `sdd-implementer` on
> a task bundle assembled with shell (the task line, the plan sections,
> the acceptance criteria, the files, the pattern file, the signatures,
> any recorded finding), telling it not to read plan.md, spec.md, or
> tasks.md in full; verify with `sh scripts/verify.sh` only — re-run by
> you in Phase 0, taken from the implementer's verbatim output after;
> stage, then bundle the diff for the `skeptical-reviewer` (each Phase 0
> task; each later phase as a whole), one review and at most one
> re-review per task, the rest logged; commit, check the box, log the
> tier and tokens. Involvement level is product owner: pause after each
> phase and whenever something unexpected bears on spec adherence, and
> start a fresh session for the next phase.

Every pause produces a report in this shape, in this order:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
