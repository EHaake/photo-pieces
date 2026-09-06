# Tasks: Cross-piece image references

**Status**: Implemented (2026-09-05) — every task checked; T608 closes
at the merge
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized; the existing 205-test suite stays green through every
task. Cadence (product owner, under the model policy): the orchestrating
session triages each task and dispatches routine ones to the
`sdd-implementer` with a packet; it re-runs build and tests itself on
return; the `skeptical-reviewer` reviews each Phase 0 task from a
shell-assembled bundle, and each later phase as a whole; the person is
paused for after each phase and whenever something unexpected bears on
spec adherence.

Task ids: 008 = T6xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T6xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the parser, the transform, the registry, the fixtures (reviewer after each task; the person's gate at its end)

- [x] **T601** — `image-meta.mjs`: `parseReference(src)` (local /
      piece / gallery / invalid with the plan's message), `imageReferences`
      yielding each reference's parsed shape, `pieceFrames(body, folder,
basenames)` returning ids in document order with unreferenced local
      files after, `crossReferences(body)`, and `referenceProblems(borrower, ids, known)` returning the plan's draft-rule messages;
      `pieceOrder` kept until T603 (the registry still calls it), its
      tests migrated to `pieceFrames` with ids. `firstAltFor`,
      `referencesImage`, and `passageFor` unchanged in behaviour. _Verify:
      vitest — the three accepted shapes and every invalid one with its
      message; `pieceFrames` interleaved, a repeat once (a local frame
      referenced twice, and the same id by the long self-shape), unreferenced
      after; `referenceProblems` for a draft target (its message names the
      home piece to publish), an unowned one (its message says the folder
      has no piece yet), an unknown id, and a published one (no problem);
      the scanner-based helpers unchanged on a body that borrows; each new
      test mutation-checked; 205 existing green._
- [x] **T602** — The transform: `parseReference` in place of
      `rejectNestedSrc`; the generator's fixtures target writes
      `tests/pieces/alpha/photo.jpg`, `tests/pieces/beta/photo.jpg`,
      `tests/gallery-images/photo.jpg` (8 × 5); the vocabulary suite gains
      a second virtual piece (`tests/pieces/alpha/index.md`) and tests a
      borrowed `src` in `single`, a `diptych` slot, a `grid` body, `held`,
      `pause`, and the shorthand — each linking to `/images/beta/photo/`
      or `/images/gallery/photo/` with `sizes` and `--ar` equal to the
      local case — the four invalid shapes and the long self-shape
      (`../alpha/photo.jpg` from `alpha`) failing by name, a borrowed
      non-raster (`../beta/photo.tif`, a real fixture file beside the
      jpg) failing as not a photograph this site pages, the stricter
      parser's new failures named (`![alt]()` and `![alt](..)` fail now
      where they rendered unlinked before), and a borrowed private frame
      failing in the one place `rejectPrivateSrc` stands
      alone: the shorthand with an empty alt, `![](../beta/_photo.jpg)`.
      The existing test "a src into a sub-folder or a sibling folder
      fails naming the rule" changes on purpose: the sub-folder still
      fails, the sibling shape is now valid (and, in the old harness,
      "image not found") — named here, not silently rewritten. _Verify:
      vitest green, mutation-checked; build green._
- [x] **T603** — The registry and the image page: `framesByPiece` from
      `pieceFrames`; a piece set on the image's page for every published
      piece whose frames include it (home after the galleries, then
      appearances newest first); related frames filtered to the home
      folder; `image.appearances` from bodies and covers, newest first by
      `publishDate` with ties by id; the draft rule via `referenceProblems`
      throwing with the message, run before any set is built; `pieceOrder`
      deleted; the "Also in" paragraph with `data-pagefind-ignore`; the cover's id
      from `fsPath` through `classifyContentImage` (a private cover
      refused with the cover hint as today; a nested or non-photograph
      cover allowed and no appearance; T603 first confirms `fsPath` is
      populated for a collection's `image()` at build and in dev — the
      plan says why it is — and throws, not skips, if absent);
      `WORDING.alsoIn` and the "Also in" paragraph. _Verify: build green;
      a temporary published piece borrowing a temporary draft piece's
      image fails the build with the message naming both (then both
      deleted, `git status` clean of them); `astro check` clean; the pure parts' tests from T601 green.
      Record: `fsPath` confirmed in dev on a cold store and after the
      store's round trip (every page 200, no server error) and at build;
      the draft-rule proofs re-run on the reviewed code — the body
      borrow and the cover borrow each fail with the plan's draft
      message naming both pieces, and with the draft published the cover
      is an appearance and no set; the private refusal never moved, the
      cover's draft check rides in `referenceProblems`; the shared
      comparator gave every published-pieces list an id tie-break it
      lacked (recorded at T607)._
- [x] **T604** — Fixtures: the sampler's "Borrowed" section (a `::single`
      of `../where-the-fog-lets-go/land-b.jpg`, a shorthand of
      `../../gallery-images/dock-a.jpg`, sample prose saying what they
      are) and its cover `../where-the-fog-lets-go/land-c.jpg`. _Verify:
      build with the barriers green; the built pages read as the plan's
      testing strategy lists (the sampler's frames linked to home pages;
      `land-b`'s page with "From the piece" the fog and "Also in" the
      sampler and the fog's passage; `dock-a`'s with "Also in" and no
      "From the piece"; `land-c`'s listing the sampler; the sampler's set
      on `land-b`'s page with `land-b` in the sampler's order — checked
      in the built HTML and in the browser via the set key); the pieces
      index showing the borrowed cover; this phase's end is the person's
      gate. Record: in the browser, a click on the borrowed ridgeline
      from the sampler stored `piece:vocabulary-sampler` and the image
      page showed the sampler's arrows, "9 of 10", the fog's and the
      gallery's navs hidden; the built pages read as listed; the
      borrowed frames sit last in the sampler's set (placed in its last
      section) and the fog's set stayed 8._

<!-- Follow-up surfaced at T602 (recorded, not owed by this spec): the
transform's "image not found" check runs only in the block loop, so a
mistyped shorthand path — `![x](../bta/photo.jpg)` — still surfaces as
Astro's opaque import error. Borrowed paths make that typo likelier;
a later spec can extend `checkSrcExists` to the shorthand visit. -->

## Phase 1 — The row, the plugin, the docs (reviewer after the phase)

- [x] **T605** — `PieceList.astro`: the row as one anchor; `global.css`: `a.note-row { background-image: none }` (the row keeps its
      own ground), hover the card's colour shift and nothing else. _Verify: in the browser
      the image, the date line, and the description each navigate to the
      piece (a click, then `read_page`); at rest the row's computed
      colours and the title's background (no underline) equal the previous
      markup's, measured before and after; on hover the title's colour
      equals a hovered gallery card title's and `.meta` keeps its own;
      `:focus-visible` draws the ring; the homepage feed and `/pieces/`
      both. Record: measured before and after on `/pieces/` at 1440×900 —
      at rest the row's ground, text, title, date line, description,
      and image border read identically (the title's hidden underline
      gradient gone, its visible state unchanged); hovering the image
      turned the title the accent's hover colour with the date line and
      description unmoved and no underline; clicks on the image, the
      date line, and the description each landed on the piece; Tab
      reached the row and drew the site's ring around it; the homepage
      and a category page carry the same anchors with no inner links._
- [x] **T606** — The Obsidian plugin resolves a `src` containing `/`
      explicitly (join with the note's folder, normalize,
      `getAbstractFileByPath`), with no name-based fallback for such
      paths; a bare name keeps `getFirstLinkpathDest`. _Verify: the plugin's build
      (`npm run build` in `obsidian-plugin/`) succeeds; the product owner sees the sampler's
      two borrowed frames in Live Preview at the gate, and a wrong `../`
      path shows the plugin's "image not found" line rather than a
      same-named file from another folder. Record: `resolveRelative` is a
      pure exported function (name / path / unreachable); the plugin
      built clean (tsc + esbuild) and the orchestrator's twelve-case
      check of the resolver passed, `../..` resolving to a folder that
      the file check turns into "not found"; the vault is not at
      `~/photo-brain/` on this machine, so the rebuilt `main.js` is
      installed by the product owner per the plugin README; at the Phase 1
      gate (2026-09-05) they attested the Live Preview check — the
      sampler's two borrowed frames shown, a typo path "not found"._
- [x] **T607** — Docs: `AUTHORING.md` (the two path shapes, one home, what
      the page shows, the draft rule, covers, in "A piece folder is public
      territory" and "Hard-won syntax rules"), `README.md` (the block
      table's note on image paths; the "images live directly in the piece
      folder" sentence), `DECISIONS.md` (a "Spec 008" section: a path not
      an id; one page one home; the arrows follow the reader; the registry
      owns the draft rule; the row as an anchor), `ROADMAP.md` (the entry struck as done, with follow-ups: renames now
      break references in other pieces too; the passage stays the home's);
      DECISIONS also records that the cover's id comes from Astro's
      internal `fsPath`, read directly and guarded by a throw, and that
      the published-pieces order gained an id tie-break so the registry's
      appearance order and the site's lists agree by construction (T603). _Verify: Prettier
      clean; the AUTHORING examples build when pasted into a temporary
      piece (reverted). Record: the four docs Prettier-stable across two
      runs; the AUTHORING examples built in a temporary piece (75 pages,
      the temp piece named under "Also in" on `land-b`, `dock-a`, and
      `land-c`), reverted, 74 pages again; the README sentence the task
      named lives in AUTHORING, so README's "Images, galleries, and image
      pages" opening was amended instead; the docs say "an accepted
      raster" rather than listing extensions, since `tiff` is accepted
      and `tif` is not._

Phase 1 notes. (a) At the Phase 0 gate the product owner asked that the
image page's "From the piece" / "Also in" / "In the gallery" titles
read as links without a mouse-over; they and the same class's "Read it
in place" and print links now take the accent colour, the hover colour
restored by a scoped `:hover` rule after the phase review predicted, and
the orchestrator measured, that the scoped rule was outranking the
theme's. Recorded here because the plan's image-page section says the
chrome stays untouched. (b) The phase review's two blocking findings
were doc claims: AUTHORING said every other shape fails the build
(remote and root-absolute srcs are left to Astro — now said), and
DECISIONS said the long self-reference would double the frames list (it
would not; `pieceFrames` dedups — the true cost is the local-only title,
alt, and passage lookups, now said). Also folded in: the plugin README
states that borrowing needs the vault root at or above the repo root;
AUTHORING's plugin sentence claims resolution only, not shape checking;
ROADMAP cites a DECISIONS heading, not a number. Checked and left:
`.note-row` has its ground from the shared rule at global.css ~792 (the
review's excerpt stopped short of it); nothing in `src/` consumes
`.note-row h3 a`; the DECISIONS claim that `astro dev` shows a borrowed
draft image was observed (the fog piece toggled to draft: the sampler
page 200 with the borrowed frame, the image page 500, both restored on
revert). (c) The product owner attested the phase in the browser and in
Obsidian on 2026-09-05 ("Checks passed") and released Phase 2.

## Phase 2 — Close-out (reviewer sweep, then merge)

- [x] **T608** — The pre-merge whole-spec sweep at the top tier and its
      findings resolved; the spec's acceptance criteria checked against
      their records; build, tests, check, GPS scan, and format green with
      actual output; the PR marked ready and merged with a merge commit.
      _Verify: main green after the merge. Record: the sweep at the top
      tier found the code sound and every acceptance criterion met, and
      blocked on the record — the boxes and statuses, a comment still
      claiming the long self-shape doubles the frames list — plus notes
      (the scanner reads fenced code, now a ROADMAP follow-up; the
      accent links, now decision 8; plan.md's `galleries.test.mjs` entry, a file spec 008 never touched);
      the re-reviews caught the same claim surviving in plan.md, the statuses running ahead of the merge, and a plan sentence placing the tests beside `validateGalleries`, all fixed. Green on HEAD:
      build 74 pages, Pagefind 6 pages, 34 unreferenced originals pruned,
      631 images scanned with no GPS, astro check 0/0/0, 230 tests,
      Prettier clean. The merge follows this commit._

---

## Tier log (the second spec under the model policy — the first end to end)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare the total against spec 007's
(implementer 309,333 over eight dispatches; reviewer 1,611,013, of
which pre-policy Phase 0 803,056). -->

| Task / invocation         | Tier             | Tokens                   | Outcome / miss reason                                                                                                                                                        |
| ------------------------- | ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| plan/tasks sign-off ×2    | top tier         | 152,642 + 56,418         | fix and re-review ×1 (the long self-shape; the cover's classification; the row as the card; the plugin's rule), then signed off                                              |
| T601 (sdd-implementer) ×2 | opus             | 82,989 + 48,314          | verified first try, then the review's five fixes — verified first try; twenty then nine mutations caught                                                                     |
| T601 review ×2            | reviewer default | 46,209 + 38,067          | fix and re-review ×1 (a borrowed non-raster minting a real id — the plan now refuses it), then signed off                                                                    |
| T602 (sdd-implementer)    | opus             | 89,028                   | verified first try; six mutations caught; the generator learned to write a real TIFF                                                                                         |
| T602 review               | reviewer default | 49,474                   | signed off; four notes folded in by the orchestrator (the own-folder rule for piece refs only; returns after fail; a positive svg assertion; the list from IMAGE_EXTENSIONS) |
| T603 (sdd-implementer) ×2 | opus             | 77,054 + 47,750          | verified first try, then the review's four fixes — verified first try                                                                                                        |
| T603 review ×2            | reviewer default | 64,730 + 57,064          | fix and re-review ×2 (fsPath in dev unconfirmed; the proofs not re-run after the fixes) — both closed by the orchestrator's own runs                                         |
| T604 (sdd-implementer)    | opus             | 33,632                   | verified first try                                                                                                                                                           |
| T604 review               | reviewer default | 28,506                   | signed off pending the browser set-key check, which passed; two prose notes folded in by the orchestrator                                                                    |
| T605 (sdd-implementer)    | opus             | 21,511                   | verified first try; the browser checks run by the orchestrator                                                                                                               |
| T606 (sdd-implementer)    | opus             | 27,693                   | verified first try; the resolver re-checked by the orchestrator                                                                                                              |
| T607 (sdd-implementer)    | opus             | 62,883                   | verified first try; the docs read against the shipped behaviour by the orchestrator                                                                                          |
| Phase 1 review            | reviewer default | 81,566                   | fix and re-review (two doc claims); the hover prediction confirmed by measurement and fixed                                                                                  |
| Phase 1 re-review ×2      | reviewer default | 58,985 + 27,998          | fix and re-review ×1 (the DECISIONS sentence overstated again: the title falls back to the humanized filename), then signed off with two precision notes folded in           |
| T608 sweep                | top tier         | 117,931                  | fix and re-review (the record: boxes, statuses, one comment); the code and every criterion judged met                                                                        |
| T608 re-review ×3         | top tier         | 65,518 + 32,373 + 27,671 | fix and re-review ×2 (the claim surviving in plan.md and statuses ahead of the merge; then a plan sentence placing the tests beside `validateGalleries`), then signed off    |

**Totals.** Implementer (opus): 490,854 tokens over nine dispatches,
every one verified first try, the escape hatch never used, no tier
miss — against spec 007's 309,333 over eight (this spec's tasks were
larger: the parser, the transform, and the registry each carried a
fix round from review). Reviewer at its default tier: 452,599 over
nine invocations (per-task reviews and the Phase 1 review). Top tier:
452,553 (the sign-off 209,060, the sweep 117,931, its re-reviews
125,562). Reviewer all tiers 905,152 — against 007's 1,611,013, of
which the policy-era part was 807,957. The policy held: nothing the
implementer returned needed the orchestrator to redo it, and every
reviewer finding that mattered was a doc or record claim or a CSS
cascade prediction, each closed by a measurement or a run. Third tier
stays off: the tasks with an automated verify and a pattern file
(T605, T606) were the cheapest dispatches here, which is the case
for turning it on once a third spec confirms the shape.

---

## Handoff note

> Read `CLAUDE.md` and `specs/008-cross-piece-references/{spec,plan,tasks}.md`,
> then begin at T601 as the orchestrator under the model policy: triage,
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
