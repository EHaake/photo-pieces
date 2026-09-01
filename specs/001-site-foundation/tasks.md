# Tasks: Site Foundation

**Status**: Draft — pending review
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Resume by finding the first
unchecked task — don't re-verify everything above it unless something
looks off.

Per the constitution: every implementation task ends with an actual
build reported, not summarized.

---

## Phase 0 — Content model foundation

Foundational — review after every task. Mistakes here are cheap to
catch now and expensive once later phases depend on them.

- [x] **T001** — Add the `pieces` collection schema to
      `src/content.config.ts`, matching `plan.md` exactly (`title`,
      `publishDate`, `categories` enum array, `description`, optional
      `cover` image, `draft`). _Verify: `astro build` succeeds with the
      collection registered._
- [x] **T002** — Add one real test piece at
      `src/content/pieces/<slug>/index.md` — plain prose, a plain
      Markdown image (no directive yet), real frontmatter. _Verify: the
      entry appears in `getCollection('pieces')` output._
- [x] **T003** — Install `remark-directive` and `unist-util-visit` as
      real dependencies, and add `remark-pieces-blocks.mjs` at the repo
      root — the transform logic already verified in a spike, cleaned
      up (no `SPIKE-OK` marker), registered in `astro.config.mjs` after
      `remarkDirective`. _Verify: `astro build` still succeeds with the
      plugin active and no directive yet in real content._

## Phase 1 — First real block: full-bleed

Foundational — this is the one open architectural question named in
`plan.md`: how `::fullbleed{...}` becomes a real, optimized image
rather than the spike's placeholder. Touches core architecture per the
collaboration workflow's own triage — a good candidate for Plan Mode
plus the skeptical-reviewer subagent before committing to an approach,
not just proceeding on the first idea that compiles.

- [x] **T004** — Resolve and implement how a `::fullbleed{...}`
      directive produces a real, optimized image — calling
      `astro:assets`'s `getImage()` from within the remark plugin, or
      an alternative if that turns out not to be the right mechanism.
      _Verify: a real photo referenced via the directive renders as an
      actual sized/optimized image in `astro dev`, not a placeholder._
- [x] **T005** — Style the full-bleed treatment to match
      `design/brief.md`'s visual direction (edge-to-edge within the
      prose column). _Verify: visual match, checked in the browser
      against a real piece._

## Phase 2 — The reading page

Mechanical once Phase 0–1 land — review per-phase rather than
per-task.

- [x] **T006** — Add `src/pages/pieces/[slug].astro`, parallel to the
      existing `blog/[slug].astro`, rendering a piece's title, date,
      categories, and body. _Verify: the T002 test piece, updated to
      include a `::fullbleed{...}` block, renders correctly at its own
      URL._
- [x] **T007** — Confirm nothing existing broke — `/blog/`, `/works/`,
      and nav are untouched by this pass. _Verify: `astro build`
      succeeds; manual check of `/blog/` and `/works/` in the browser
      shows no change._

## Phase 3 — Debt made explicit

Added during T004's review: CLAUDE.md's Testing section requires real
unit tests for the remark-directive transform, which plan.md's blanket
testing deferral contradicted. This task records the debt instead of
leaving it silent.

- [x] **T008** — Confirm Vitest as the test framework (CLAUDE.md names
      it as an unconfirmed default — confirm, don't assume), then add
      unit tests for `remark-pieces-blocks.mjs`: each block's happy
      path, every fail-loudly case (unknown directive, container form,
      missing attributes, missing image file), and the mdast-image-
      children output shape Astro's optimizer depends on. _Verify:
      test suite runs green alongside `astro build`._

## Phase 4 — Work that landed outside the original task list

Recorded at the pre-merge review so tasks.md reflects what the branch
actually delivered, per the constitution's spec-discipline rule. These
were decided deliberately (see `DECISIONS.md`) but never entered here.

- [x] **T-obsidian** — `obsidian-plugin/` (Live Preview rendering of
      `::fullbleed` while writing) and `AUTHORING.md` (vault layout and
      Obsidian usage), built mid-flight before this session's tasks
      began. _Verification: manual use in Obsidian by the author; no
      automated tests. Includes crash fix `fccc4d4` (ViewPlugin →
      StateField). Its dev-only dependencies are recorded in
      `plan.md`._
- [x] **T009** — Pre-merge skeptical-review amendments: diptych/
      triptych grid CSS (they shipped implemented but unstyled — a
      green build would have produced stacked, indented images);
      text-directive restoration in the transform (unhandled `:word`
      in prose rendered as an empty `<div>` splitting the paragraph —
      the test named for this case couldn't fail, see the matching
      CLAUDE.md amendment); OG image hex values resynced to the real
      tokens; README/plan/ROADMAP truth-sync. _Verify: full test suite
      and `astro build` green; diptych geometry checked in the
      browser._

---

## Handoff note

> Read CLAUDE.md and specs/001-site-foundation/spec.md, plan.md, and
> tasks.md, then begin implementing starting at the first task. For
> Phase 0 and Phase 1, stop for review after each individual task —
> Phase 1 specifically touches core architecture and is a good
> candidate for Plan Mode plus the skeptical-reviewer subagent before
> implementing, per the collaboration workflow. From Phase 2 onward,
> stop after each phase instead of after each task.
