# Tasks: Cross-piece image references

**Status**: Draft — for the skeptical-reviewer's sign-off
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

- [ ] **T601** — `image-meta.mjs`: `parseReference(src)` (local /
      piece / gallery / invalid with the plan's message), `imageReferences`
      yielding each reference's parsed shape, `pieceFrames(body, folder,
basenames)` returning ids in document order with unreferenced local
      files after, `crossReferences(body)`, and `referenceProblems(borrower,
ids, known, homeOf)` returning the plan's draft-rule messages;
      `pieceOrder` removed once nothing calls it. `firstAltFor`,
      `referencesImage`, and `passageFor` unchanged in behaviour. _Verify:
      vitest — the three accepted shapes and every invalid one with its
      message; `pieceFrames` interleaved, a repeat once, unreferenced
      after; `referenceProblems` for a draft target, an unowned one, an
      unknown id, and a published one (no problem); the scanner-based
      helpers unchanged on a body that borrows; each new test
      mutation-checked; 205 existing green._
- [ ] **T602** — The transform: `parseReference` in place of
      `rejectNestedSrc`; the generator's fixtures target writes
      `tests/pieces/alpha/photo.jpg`, `tests/pieces/beta/photo.jpg`,
      `tests/gallery-images/photo.jpg` (8 × 5); the vocabulary suite gains
      a second virtual piece (`tests/pieces/alpha/index.md`) and tests a
      borrowed `src` in `single`, a `diptych` slot, a `grid` body, `held`,
      `pause`, and the shorthand — each linking to `/images/beta/photo/`
      or `/images/gallery/photo/` with `sizes` and `--ar` equal to the
      local case — and the four invalid shapes plus a borrowed private
      frame failing by name. _Verify: vitest green, mutation-checked;
      build green._
- [ ] **T603** — The registry and the image page: `framesByPiece` from
      `pieceFrames`; a piece set on the image's page for every published
      piece whose frames include it (home after the galleries, then
      appearances newest first); related frames filtered to the home
      folder; `image.appearances` from bodies and covers; the draft rule
      via `referenceProblems` throwing with the message; the cover's id
      from `fsPath` (replacing the basename-only private check; T603
      first confirms `fsPath` is populated for a collection's `image()`
      at build and in dev — if not, stop and return, since the cover's
      folder is unrecoverable from a hashed `src`);
      `WORDING.alsoIn` and the "Also in" paragraph. _Verify: build green;
      a temporary published piece borrowing a temporary draft piece's
      image fails the build with the message naming both (then both
      deleted, `git status` clean of them); `astro check` clean; the pure
      parts' tests from T601 green._
- [ ] **T604** — Fixtures: the sampler's "Borrowed" section (a `::single`
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
      gate._

## Phase 1 — The row, the plugin, the docs (reviewer after the phase)

- [ ] **T605** — `PieceList.astro`: the row as one anchor with the title
      in a span; `global.css`: `a.note-row` without the link background,
      the title's underline on the row's hover and focus. _Verify: in the
      browser the image, the date line, and the description each navigate
      to the piece (a click, then `read_page`); the row's computed colours
      and the title's underline state at rest equal the previous markup's;
      `:focus-visible` draws the ring; the homepage feed and `/pieces/`
      both._
- [ ] **T606** — The Obsidian plugin resolves `src` relative to the note
      explicitly (join, normalize, `getAbstractFileByPath`), falling back
      to `getFirstLinkpathDest`. _Verify: `npm run build` in
      `obsidian-plugin/`; the product owner sees a `../` frame preview in
      Live Preview at the gate._
- [ ] **T607** — Docs: `AUTHORING.md` (the two path shapes, one home, what
      the page shows, the draft rule, covers, in "A piece folder is public
      territory" and "Hard-won syntax rules"), `README.md` (the block
      table's note on image paths; the "images live directly in the piece
      folder" sentence), `DECISIONS.md` (a "Spec 008" section: a path not
      an id; one page one home; the arrows follow the reader; the registry
      owns the draft rule; the row as an anchor), `ROADMAP.md` (the entry
      struck as done, with follow-ups: renames now break references in
      other pieces too; the passage stays the home's). _Verify: Prettier
      clean; the AUTHORING examples build when pasted into a temporary
      piece (reverted)._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T608** — The pre-merge whole-spec sweep at the top tier and its
      findings resolved; the spec's acceptance criteria checked against
      their records; build, tests, check, GPS scan, and format green with
      actual output; the PR marked ready and merged with a merge commit.
      _Verify: main green after the merge._

---

## Tier log (the second spec under the model policy — the first end to end)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare the total against spec 007's
(implementer 309,333 over eight dispatches; reviewer 1,611,013, of
which pre-policy Phase 0 803,056). -->

| Task / invocation | Tier | Tokens | Outcome / miss reason |
| ----------------- | ---- | ------ | --------------------- |

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
