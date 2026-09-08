# Tasks: The galleries overhaul

**Status**: Signed off (2026-09-07) — by the `skeptical-reviewer`; no
blocking findings, four non-blocking second-look notes folded in.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T900–T903) — reviewed as a phase, except
T900 (the real-photograph fixtures and the GPS barrier proven against
them) and T902 (the single-source knobs that the CSS, the srcset math,
Phase 1's values, and the gate all inherit), which carry
`review: per-task`. Phase 1 and Phase 2 are per-phase (Phase 2's review
is the pre-merge sweep). The Phase 0 pause is the visual gate.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`, or `sh scripts/verify.sh tests` for a
pure-rule change) reported, not summarized; the existing suite stays
green through every task. Cadence (product owner, under the model
policy — this spec runs under the budget fallback, so the planner and
the sign-off ran at the implementation tier; the review invocations run at
the reviewer's default tier): the orchestrating session triages each
task and dispatches routine ones to the `sdd-implementer` on a task
bundle assembled with shell (the task line, the plan sections, the
acceptance criteria, the files, the pattern file to copy), telling it
not to read plan.md, spec.md, or tasks.md in full; for a `review:
per-task` task it re-runs the verification command itself and has the
`skeptical-reviewer` review the task from a staged, shell-assembled
bundle — one review and at most one re-review, anything still open
logged and left to the sweep; otherwise the implementer's verbatim
output is the verification and the reviewer checks the phase as a whole.
The sweep runs on the documents plus `git diff main...HEAD`. A fresh
orchestrator session starts each phase; the person is paused for after
each phase and whenever something unexpected bears on spec adherence.
Geometry is measured by the orchestrator with `javascript_tool` against
an emulated viewport (the in-app Browser pane's screenshots are blank
when scrolled; numbers, not pictures).

Task ids: 011 = T9xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T9xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the fixtures, the barrier's proof, the knobs, and the sampler (reviewer after the phase, T900 and T902 on their own; the gate at its end)

- [ ] **T900** (`review: per-task`) — The real photographs, and the GPS
      barrier proven against them. The photographer supplies about ten
      real camera exports into `src/content/gallery-images/` and/or an
      existing published piece's folder (his to add; the orchestrator
      places whatever is provided). No frontmatter, no sidecar, no schema
      change — the registry derives an id, a page, and a wall label for
      each. _Verify: `sh scripts/verify.sh` green — the build indexes the
      new images, `astro check` clean, and `[check-no-gps] … no GPS
      metadata.` in the output; for each supplied export a `/images/<id>/`
      page renders on the dev server with its wall label
      (camera/lens/exposure where the EXIF carries it); a naive
      `node -e "import('exifr').then(m => m.default.parse('<file>')).then(o => console.log(Object.keys(o||{}).filter(k => /gps|latitude|longitude/i.test(k))))"`
      over the supplied files reports at least one with GPS keys; if
      none of the supplied exports carry GPS, the orchestrator adds one
      genuinely GPS-bearing real raster as an extra fixture, so the
      barrier is proven on a real file and the spec's "first time on
      real files" intent is met — T901's synthetic `gps.jpg` stays the
      standing falsifiable anchor either way; the `exif.test.mjs`
      allowlist assertions still green.
      The count of exports added and the naive-GPS result recorded here._

- [ ] **T901** — The GPS barrier as a standing test. `gps-barrier.test.mjs`
      (new; `page-head.test.mjs`'s `run(dir)` child-process helper is the
      pattern): run `scripts/check-no-gps.mjs` as a child process against
      a `mkdtemp` fixture directory — once containing a copy of
      `tests/fixtures/gps.jpg`, asserting a non-zero exit and stderr
      naming the file and a GPS hit, and once containing a clean raster
      (`tests/fixtures/photo.jpg`), asserting exit 0 and the "no GPS
      metadata" line. The barrier already takes an optional `[dir]`
      argument, so no `dist/` is touched. _Verify: `sh scripts/verify.sh`
      green with the two new tests; each mutation-checked and the test
      named that each fails, output recorded here — the barrier's GPS
      regex neutered (the leak case stops failing); the success wording
      changed (the clean case stops matching)._

- [ ] **T902** (`review: per-task`) — The three knobs in one source, and
      the width breakout, inert. `src/lib/gallery-layout.ts`: add
      `GALLERY_WIDTH` (`'var(--content-width)'`) and `GALLERY_GAP`
      (`'calc(var(--baseline) * 0.75)'`) with the plan's comments;
      `galleryFlowStyle` emits `--gallery-width` and `--gallery-gap`
      beside `--gallery-short` / `--gallery-stretch`; `relatedFlowStyle`
      emits neither. `src/styles/global.css`: `.gallery-flow`'s `gap`
      literal → `var(--gallery-gap, calc(var(--baseline) * 0.75))`; the
      `@media (min-width: 720px) { .gallery-flow.gallery-wide { … } }`
      breakout per the plan (`--gw: min(var(--gallery-width, …), calc(100vw - 2 * var(--page-pad)))`,
      `width`, `margin-inline`); the `.gallery-flow > li` packing rule
      and the `<720px` collapse untouched. `galleries/[slug].astro` and
      `places/[slug].astro`: add `gallery-wide` to the flow's class.
      `gallery-layout.test.mjs` (new; `image-set.test.mjs` is the pattern
      for a `.ts` import) per the plan's contract cases. _Verify (implementer):
      `sh scripts/verify.sh` green with the new suite; each contract test
      mutation-checked and named — `GALLERY_SHORT_PX` changed (both the
      emitted-property test and the srcset-ceiling test fail); a literal
      short hardcoded in `galleryFlowStyle` (the emitted-property test
      fails alone); `relatedFlowStyle` given a `--gallery-width` (the
      strip-does-not-widen test fails) — output recorded. Verify
      (orchestrator, re-running `sh scripts/verify.sh` first): on the dev
      server at 1440×900, 1080×1920, 375×812, a gallery page and a place
      page's outing render the `.gallery-flow` at the same width as
      before this task (at 1440 exactly `--content-width`; at 1080/375
      within the scrollbar-width overshoot, `documentElement.scrollWidth ≤
      clientWidth` on all three — no horizontal scrollbar); a sample
      cell's rendered width and its `sizes` unchanged; the image page's
      related strip unchanged (grep confirms it has no `gallery-wide` and
      no `--gallery-width`); the place's `.prose` and the gallery's lead
      at their reading measure, unchanged. Numbers recorded here._

- [ ] **T903** — The sampler (dev-only).
      `src/pages/dev/galleries/[...candidate].astro`
      (`src/pages/dev/page-head/[...candidate].astro` is the pattern):
      `getStaticPaths()` returns `[]` unless `import.meta.env.DEV`; the
      candidate list declared **inside** `getStaticPaths` and passed as a
      prop (the isolated-scope gotcha); the candidates the plan's table
      names (`current` / `wide` / `bleed`). It builds a gallery-like set
      from `getImageRegistry()`'s gallery-root images (the new exports
      included) and renders, per candidate, a `.gallery-flow gallery-wide`
      and a `.gallery-grid gallery-cards`, each at the candidate's
      `--gallery-width` / `--gallery-gap` / `--gallery-short` set inline
      on a wrapper, each labelled with its id and values, in the site's
      real mats and ground. Paths in dev: `/dev/galleries/` (all
      candidates stacked) and `/dev/galleries/<id>/` (one candidate
      full-page). _Verify: `sh scripts/verify.sh` green with
      `[check-no-dev-routes] no dev routes in dist/.` in its output;
      `test ! -e dist/dev && echo absent`; `grep -c "/dev/"
      dist/sitemap-0.xml` → 0; no build-log line naming `dev/galleries`;
      the temporary negative control — the `DEV` guard removed, `npm run
      build` fails at the barrier with the first message naming
      `dist/dev/galleries/…`, its output recorded and the guard restored.
      Then on the dev server: `/dev/galleries/` and each
      `/dev/galleries/<id>/` render the real photographs packed and the
      card grid at the candidate's width, labelled; the count of real
      images the set drew on recorded here (enough to pack several rows)._

<!-- The gate record goes here at the Phase 0 pause: the width, the gap,
and the density the photographer named on each screen (16:10 laptop and
portrait monitor), as the exact values to write into gallery-layout.ts,
and whether the index card grids follow the pages to the wider width. A
mix or a fourth set is his to name; only a request the three knobs
cannot express (a different packing rule, a per-screen width) is a spec
question and goes back to him. The values are not in this plan. -->

## Phase 1 — The chosen values and the docs (reviewer after the phase; the person's pause at its end)

<!-- T904 is the load-bearing visible change (all three knobs, both index
card grids, the geometric checks for ACs 2–5) under per-phase review, not
per-task. That is the right set — T900 and T902 are the contracts later
tasks inherit — but the phase review must treat T904's recorded numbers
as the substance of the review, not a formality (sign-off note 4). -->


- [ ] **T904** — The gate's values. `src/lib/gallery-layout.ts`:
      `GALLERY_WIDTH`, `GALLERY_GAP`, and `GALLERY_SHORT_PX` set to the
      gate record's values, with a comment naming the gate's date and the
      chosen set; the sampler's candidates untouched (`current` now
      previews the shipped values). `src/styles/global.css` and the two
      index pages (`galleries/index.astro`, `places/index.astro`): the
      card grids widened to the gate's width if the gate said they
      follow, left as they are if not — the gate record decides, recorded
      in the task. _Verify: `sh scripts/verify.sh` green; the orchestrator's
      probe at 1440×900 and 1080×1920 — a gallery page and a place page's
      outing render the `.gallery-flow` at the gate's width (wider than
      T902's content width, unless the gate kept `current`); the measured
      `gap` and a landscape cell's rendered short side equal the gate's
      values; a sample cell's `sizes` ceiling tracks the gate's density;
      the place's `.prose`, the gallery's lead, and a piece's body still
      measure their reading measure (equal to T902); at 375×812 the flow
      is one frame per row at the full width; the image page's related
      strip keeps its width and its smaller short side (measured, equal
      to T902); the index card grids match the gate's decision; no
      horizontal scrollbar (`documentElement.scrollWidth ≤ clientWidth`)
      at any of the three viewports; a row holding a panorama and a
      portrait lands them on the same short side (measured) and the
      `.gallery-flow > li` rule is unedited (grep) — the packing rule
      unchanged. Every number recorded here._

- [ ] **T905** — Docs: `README.md`. The galleries description says the
      packed rows on a gallery page and a place page's outings run wider
      than the text column, to a width chosen at a visual gate on the
      photographer's two screens, while all prose keeps its reading
      measure; that `gallery-layout.ts` holds the width, gap, and density
      knobs, density driving both the CSS and the srcset math; that the
      related strip is unchanged; and the structure listing gains
      `src/pages/dev/galleries/` as a dev-only fixture the build refuses
      to emit. _Verify: every claim read against the built pages and the
      gate record by the orchestrator; `npx prettier --check README.md`
      clean (note: Prettier does not enforce README's hand-wrapped prose
      width — check over-long lines by eye); `sh scripts/verify.sh`
      green._

## Phase 2 — Close-out (the docs, the reviewer sweep, then merge)

- [ ] **T906** — `ROADMAP.md`: strike "A galleries overhaul" and, for the
      gallery surfaces this spec covers, "Real photographs as fixtures,
      before more design" (real exports now judge the packing, the width,
      the gap, and the density); add the follow-ups the plan and the gate
      raise (the mats, the warm ground, and the quiet dark left for a
      later spec if the real photographs reveal a problem there — the
      spec's non-goal; the related strip left at its width; the reading
      typography pass unchanged; the external-store and page-weight-budget
      items noted, not triggered, by the added exports' weight). `DECISIONS.md`:
      a spec 011 section — the width/gap/density chosen at a sampler gate
      on both screens, the way spec 010's head sampler worked; the
      wide/fullbleed breakout idiom reused for the gallery width and why
      (viewport-centred, body already clips the `vw` overshoot, one knob
      for all three width forms); width and gap kept in `gallery-layout.ts`
      beside density for one-source bookkeeping though only density (and
      the stretch cap) feeds the srcset — AC3's "srcset ceilings track the
      new width and density" is read as density (and stretch), never
      width, since a wider page must never fetch a larger image, the
      approved spec.md left unedited (the spec 010 precedent for an
      imprecise AC); the GPS barrier given a standing child-process test and
      proven against real exports for the first time; whether the index
      card grids follow the pages (the gate's outcome). Both ride this
      spec branch and merge with the PR, so the sweep's diff against
      `main` contains them. Then the pre-merge whole-spec sweep at the
      reviewer's default tier and its findings resolved; the spec's
      acceptance criteria checked against their records (the sampler's
      absence from `dist/` by T903's and the final build's barrier line;
      the GPS scan green against the real exports); build, tests, check,
      GPS scan, dev-routes scan, and format green with actual output; the
      PR marked ready and merged with a merge commit. _Verify: main green
      after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log (the fifth spec under the model policy)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare against spec 010's totals:
implementer 399,793 over 11 dispatches; reviewer 461,195 all tiers
(333,958 at the default tier over 5 invocations, 127,237 at the top tier
over 2 sign-off passes); planner 139,477 (one dispatch, top tier).
Spec 011 runs under the budget fallback: the planner and the sign-off
run at the implementation tier, the override dropped. -->

| Task / invocation              | Tier                | Tokens             | Outcome / miss reason |
| ------------------------------ | ------------------- | ------------------ | --------------------- |
| Planning: draft (`sdd-planner`)| implementation (fallback) | 148,300 | drafted first pass |
| Sign-off: plan/tasks (`skeptical-reviewer`) | implementation (fallback) | 48,861 | signed off; 4 non-blocking notes folded in |

**Totals, written at the merge.**

## Handoff note

**Nothing is implemented yet.** The next session begins at **T900**
(Phase 0) as the orchestrator under the model policy, running under the
budget fallback (the planner and the sign-off ran at the implementation tier;
review invocations run at the reviewer's default tier, no top-tier
override). **The real photographs are the photographer's to supply** —
T900 cannot complete until about ten real exports are in
`src/content/gallery-images/` and/or a published piece's folder; the
orchestrator places whatever he provides and proves the GPS barrier
against them. The **Phase 0 pause is the visual gate**: the sampler's
URLs (`/dev/galleries/` and `/dev/galleries/<id>/`) and the candidate
sets go to him on both screens, and he names the width, the gap, the
density, and whether the index card grids follow — the values are not in
the plan.

> Read `CLAUDE.md` and `specs/011-galleries-overhaul/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy: triage; dispatch each routine task to the
> `sdd-implementer` on a task bundle assembled with shell (the task line,
> the plan sections, the acceptance criteria, the files, the pattern
> file, any recorded finding or gate value), telling it not to read
> plan.md, spec.md, or tasks.md in full; verify with `sh scripts/verify.sh`
> only — re-run by you for T900 and T902 (`review: per-task`), taken from
> the implementer's verbatim output otherwise; run the geometry checks
> with `javascript_tool` and record numbers; stage, then bundle the diff
> for the `skeptical-reviewer` (T900 and T902 on their own; each phase as
> a whole), one review and at most one re-review per invocation, the rest
> logged; commit, check the box, log the tier and tokens. Involvement
> level is product owner: pause after each phase — the Phase 0 pause is
> the gate, and its report carries the sampler's URLs and the candidate
> sets — and whenever something unexpected bears on spec adherence, and
> start a fresh session for the next phase.

Every pause produces a report in this shape, in this order:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
