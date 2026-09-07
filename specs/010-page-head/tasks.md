# Tasks: The page head

**Status**: Signed off (2026-09-07) — drafted by the `sdd-planner`,
signed off by the `skeptical-reviewer` at the top tier on the second
pass; pending the product owner's approval of the conformance summary
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T801–T803) — reviewed as a phase, except
T803, which carries `review: per-task` (the mechanism and the sampler
that Phase 1's values and the gate itself inherit); Phases 1 and 2 are
per-phase (Phase 2's review is the pre-merge sweep). The Phase 0 pause
is the visual gate.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`) reported, not summarized; the existing
252-test suite stays green through every task. Cadence (product owner,
under the model policy): the orchestrating session triages each task
and dispatches routine ones to the `sdd-implementer` (the step-down
tier) on a task bundle assembled with shell, telling it not to read
plan.md, spec.md, or tasks.md in full; for T803 it re-runs the
verification command itself and has the `skeptical-reviewer` review
the task from a staged, shell-assembled bundle — one review and at
most one re-review, anything still open logged and left to the sweep;
otherwise the implementer's verbatim output is the verification and
the reviewer checks the phase as a whole at its default tier; the
sweep runs at the reviewer's default tier on the documents plus
`git diff main...HEAD`; a fresh orchestrator session starts each
phase; the person is paused for after each phase and whenever
something unexpected bears on spec adherence. Geometry is measured by
the orchestrator with `javascript_tool` and the plan's probe against an
emulated viewport (the in-app Browser pane's screenshots are blank when
scrolled; numbers, not pictures); T801 is the orchestrator's own and is
not dispatched.

Task ids: 010 = T8xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T8xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the baseline, the row, the mechanism and the sampler (reviewer after the phase, T803 on its own; the gate at its end)

- [ ] **T801** — The baseline, before any code changes (the
      orchestrator, not dispatched). The plan's probe on the nine pages
      at 1440×900, 1080×1920, and 375×812 — the fog piece, the
      `fog-frames` gallery, `/places/the-headlands/`, `/pieces/`,
      `/galleries/`, `/places/`, `/categories/landscape/`, `/about/`,
      `/contact/` — on the dev server, fonts loaded, `scrollY` 0. Then
      `npm run build` and `dist/{pieces,about,contact,places}/index.html`,
      `dist/galleries/index.html`, `dist/categories/landscape/index.html`
      copied to `${TMPDIR:-/tmp}/photo-pieces-verify/baseline-010/`.
      _Verify: the 27 probe results recorded here as numbers (pattern:
      the T703 record in `specs/009-places/tasks.md`); the fog's at
      1440×900 checked against the spec's (header bottom 74, head
      74–560, first paragraph ≈ 638) and any disagreement recorded, not
      reconciled; the head's content height, which is
      `head.bottom - head.top - pad - pad - 1`, written down as the
      number that replaces the plan's ≈ 327 in the candidates'
      predictions; the six baseline
      files' `sha256sum` recorded with the folder's path._
- [ ] **T802** — The row and the headings. `categories.ts`:
      `categoryRow(current?: Category): { label: string; href: string | null }[]`
      per the plan (All → `/pieces/` first only when `current` is given;
      the current item `href: null`; `CATEGORIES` order; `categoryLabel`
      labels). `categories.test.mjs` (new; `image-set.test.mjs` is the
      pattern) with the plan's cases. `src/components/CategoryRow.astro`
      (`CoverCards.astro` is the pattern for props; **no `<style>`**):
      the pieces index's category-row `<nav>` — its `class` and its
      `aria-label` — moved verbatim, `withBase` on
      each href, a null href rendered `<span aria-current="page">`, the
      `' · '` separators as today. `pieces/index.astro` renders
      `<CategoryRow />` in place of the inline nav; `galleries/index.astro`
      renders `<CategoryRow />` after its `<h1>`; `categories/[category].astro`
      renders `<CategoryRow current={category} />` after its `<h1>` and
      wraps its two `h2.eyebrow` texts in links to `/galleries/` and
      `/pieces/` (the galleries index's `h2.eyebrow > a` is the pattern).
      `global.css`: `.category-row [aria-current='page']` beside `.meta`,
      the plan's declarations. _Verify: vitest — the new group green and
      each test mutation-checked (All always; All never; the current
      left as a link; the order reversed), the test named that each
      mutation fails; build, check green; `dist/pieces/index.html`
      identical to the baseline after normalizing the hashed CSS link
      and collapsing whitespace runs between tags (the raw diff recorded
      if not clean, and whitespace-only); on
      `dist/categories/landscape/index.html` the nav inside `.page-head`
      after the `<h1>` with `<a href="/pieces/">All</a>` first,
      `<span aria-current="page">Landscape</span>`, three links, and the
      two `h2.eyebrow` links to `/galleries/` and `/pieces/`; on
      `dist/galleries/index.html` the nav after the `<h1>` with four
      links, no `All`, no `aria-current` — all grepped on the build and
      recorded verbatim._
- [ ] **T803** (`review: per-task`) — The mechanism, inert, and the
      sampler. `global.css`: `--head-pad-reading` and
      `--head-gap-reading` in `:root` at `.section`'s clamp with the
      plan's comment; `.reading-head { padding-block }` and
      `.reading-head + .section { padding-block-start }` straight after
      the `.page-head` rules — no edit to `.section` or `.page-head`.
      `pieces/[slug].astro`, `galleries/[slug].astro`,
      `places/[slug].astro`: `reading-head` added to the header's class
      list. `src/pages/dev/page-head/[...candidate].astro` per the plan
      (`getStaticPaths` `[]` unless `import.meta.env.DEV`; `CANDIDATES`
      `current` / `a` 3rem,3rem / `b` 2rem,2rem; the stacked index and
      the three full pages; the head copied from the piece page — with
      the piece page's scoped `.piece-column` rule copied into the
      fixture's own `<style>` and wrapping the head's content and the
      body, or the fixture lays out left-aligned — inside a wrapper
      carrying the candidate's tokens inline (the wrapper holds the
      header and the following `.section` as siblings, or the `+` rule
      misses the gap); the banner with its live numbers). `scripts/check-no-dev-routes.mjs`
      (`check-no-gps.mjs` is the pattern), appended to `postbuild`;
      `scripts/verify.sh`'s summary grep gains `\[check-no-dev-routes\]`.
      _Verify (implementer): `sh scripts/verify.sh` green with
      `[check-no-dev-routes] no dev routes in dist/.` in its output;
      `test ! -e dist/dev && echo absent`; a recursive `grep` for
      `page-head sampler` under `dist` empty;
      `grep -c "/dev/" dist/sitemap-0.xml` → 0; no build-log
      line naming `dev/page-head`; the temporary run with the `DEV`
      guard removed — the build fails at the barrier with the first
      message naming `dist/dev/page-head/…` — its output recorded and
      the guard restored. Verify (orchestrator, re-running
      `sh scripts/verify.sh` first): the three reading pages measure
      equal to T801 at the three viewports; `/dev/page-head/current/`
      equal to the fog piece's page at 1440×900, and its head's
      `.piece-column` equal in `left` and `width` to the piece page's
      (the copied rule landed); `/a/` and `/b/` measure
      `pad` 48/48 and 32/32, `gap` 48 and 32, their first-paragraph
      tops recorded against the plan's predictions (≈ 545, ≈ 497, with
      T801's content height), each visibly apart and every one with
      `prose.fourth ≤ 900`; the banner's numbers equal the probe's;
      `/dev/page-head/` shows three labelled heads stacked, one
      paragraph under each. Numbers recorded here._

**The gate record** (written by the orchestrator at the Phase 0 pause,
before Phase 1 starts): the candidate the photographer named — `a`,
`b`, a mix, or a fourth value, as two token values — and whether the
portrait monitor takes it too or stays as it is; the `innerHeight` his
laptop browser reported in the sampler's banner, which is the fold T804
measures against (900 if it goes unrecorded); any remark on the row.
If he names a mix or a fourth value rather than `a` or `b`, say in the
Phase 0 report that T804 checks it against that fold rather than
against the emulated 900 the sampler previewed it under — a miss
there is the criterion doing its job, not a T804 bug (the sign-off
reviewer's note).

## Phase 1 — The values and the docs (reviewer after the phase; the person's pause at its end)

- [ ] **T804** — The chosen values. `global.css`: the two tokens
      overridden inside `@media (orientation: landscape) and (min-width: 720px)`
      — or `(min-width: 720px)` if the gate chose the portrait monitor
      too — at the gate record's values, with a comment naming the
      gate's date and the candidate; the sampler's `CANDIDATES` untouched
      (`current` now shows the shipped value). _Verify: build, check,
      tests green; the orchestrator's probe — the three reading pages at
      1440×900 with `pad` and `gap` at the chosen values, the fog's
      `prose.top` equal to T803's number for that candidate (±2px),
      `lead` and `prose.fourth` within the gate record's fold (his
      browser's `innerHeight`; 900 if it went unrecorded); at 1080×1920
      and 375×812 equal
      to T801 (or, if the gate took portrait, 1080 equal to T803's
      sampler number and 375 equal to T801); the six other pages at the
      three viewports equal to T801 in `pad`, `gap`,
      `headerBottom → head.top`, `head.bottom → nextFirst` — on
      `/galleries/` and `/categories/landscape/` `head.bottom` greater
      by the row's height plus the `h1`'s `margin-bottom` (the row's
      own bottom margin collapses into the accent rule's `margin-top`,
      where the `h1`'s collapses today) — the number recorded rather
      than asserted from the prediction — on the other four `head`
      equal; `dist/{pieces,about,contact,places}/index.html`
      identical to the baseline after normalizing the CSS link (and
      whitespace for `/pieces/`). Every number recorded here._
- [ ] **T805** — Docs: `README.md`'s galleries-and-categories sentences
      (the paragraph that begins "`/galleries/` groups galleries by
      category") say that the galleries index carries the category row
      under its title and that a category page's head carries it with
      "All" back to `/pieces/` and the current category marked, its
      "Galleries" and "Pieces" headings linking to their indexes; the
      reading pages' description mentions that the piece, gallery, and
      place heads share one tightened head (the two tokens, landscape
      only unless the gate said otherwise); the structure listing gains
      `CategoryRow.astro` and `pages/dev/` as dev-only fixtures that the
      build refuses to emit. _Verify: every claim read against the built
      pages and the gate record by the orchestrator; Prettier clean;
      build green._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T806** — `ROADMAP.md`: "A way back from a category" and "The
      header's proportion on a laptop" struck, with the follow-ups the
      plan names (the title, the lead's measure, and the body column to
      the reading typography pass, which the sampler now serves; a
      landscape phone or tablet unmeasured; the row on the front door
      if that workshop comes). `DECISIONS.md`: a spec 010 section
      ("All" to the pieces index and the section headings as each
      kind's way back; one row component with the current marked the
      nav's way; a class and two tokens scoped to landscape ≥ 720px,
      with the portrait monitor's outcome; the sampler kept as a
      dev-only route behind a barrier, and why a barrier rather than
      trust in the `DEV` guard — an empty `getStaticPaths` has regressed
      before, in Astro 5.1.2 (withastro/astro#12891, fixed in #12906);
      the spec's criterion as a floor and the first-paragraph top as the
      number). Both ride this spec
      branch and merge with the PR, as 009's did, so the sweep's diff
      against `main` contains them. Then the pre-merge whole-spec sweep
      at the reviewer's default tier and its findings resolved; the
      spec's acceptance criteria checked against their records (the
      sampler's absence from `dist/` by T803's and the final build's
      barrier line); build, tests, check, GPS scan, dev-routes scan, and
      format green with actual output; the PR marked ready and merged
      with a merge commit. _Verify: main green after the merge._

---

## Tier log (the fourth spec under the model policy)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare against spec 009's totals:
implementer 275,282 over five dispatches; reviewer 599,867 all tiers
(403,955 at the default tier over ten invocations, 195,912 at the top
tier over four sign-off passes). -->

| Task / invocation                        | Tier     | Tokens           | Outcome / miss reason                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)          | top tier | 139,477          | drafted first pass                                                                                                                                                                                                                                                                                                                                                                                        |
| plan/tasks sign-off ×2 (planner-drafted) | top tier | 102,587 + 24,650 | fix and re-review ×1 (B1: the sampler copied the piece head's markup but not the piece page's scoped `.piece-column` rule, so the gate would have judged a left-aligned head that the vertical-only probe could not tell from the real one), then signed off. Packet note for T803: the sampler declares that rule in its own `<style>` and its Verify compares `left` and `width` against the piece page |

<!-- Totals, written at the merge: implementer over its dispatches;
reviewer at its default tier over its invocations; top tier; all
tiers, against 009's; what held and what to carry to the next spec. -->

## Handoff note

**Nothing is implemented.** The next session begins at T801 (Phase 0):
the baseline is the orchestrator's own measurement and build, taken
before any code changes; T802 and T803 are dispatched; T803's
verification is re-run by the orchestrator and reviewed on its own;
the Phase 0 pause is the visual gate, and Phase 1 does not start until
the gate record above is written.

> Read `CLAUDE.md` and `specs/010-page-head/{spec,plan,tasks}.md`, then
> begin at the first unchecked task as the orchestrator under the model
> policy: triage; take T801 yourself with the plan's probe; dispatch
> each routine task to the `sdd-implementer` on a task bundle assembled
> with shell (the task line, the plan sections, the acceptance
> criteria, the files, the pattern file, the signatures, any recorded
> finding), telling it not to read plan.md, spec.md, or tasks.md in
> full; verify with `sh scripts/verify.sh` only — re-run by you for
> T803, taken from the implementer's verbatim output otherwise; run the
> geometry checks with the probe and record numbers; stage, then bundle
> the diff for the `skeptical-reviewer` (T803 on its own; each phase as
> a whole), one review and at most one re-review per invocation, the
> rest logged; commit, check the box, log the tier and tokens.
> Involvement level is product owner: pause after each phase — the
> Phase 0 pause is the gate, and its report carries the sampler's three
> URLs and their numbers — and whenever something unexpected bears on
> spec adherence, and start a fresh session for the next phase.

Every pause produces a report in this shape, in this order:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
