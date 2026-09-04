# Tasks: The Held Image and the Pause

**Status**: Draft — pending the skeptical-reviewer's sign-off
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized. The existing 173-test suite stays green through every
task — no weakening tests to pass. Review cadence (product owner):
the skeptical-reviewer after each task in Phase 0, scoped to that
task's diff, the plan section it implements, and the acceptance
criteria it serves; after each phase from Phase 1 on. The person is
paused for after each phase and whenever something unexpected bears on
spec adherence. Phase 0 ends with the fixtures in place and measured,
so the first pause has something to scroll.

Task ids: 007 = T5xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T5xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: transform, CSS, script, fixtures (reviewer after each task)

- [ ] **T501** — The transform: `held` (container, body prose, split
      structure, `src` `alt` `side=left|right` and the `bleed` flag,
      `piece-held-prose`) and `pause` (leaf, one image, `piece-pause`
      with a `piece-pause-frame`); the descriptor generalizations —
      `rawAr`, `classes(attrs, ratios)` with `frame-landscape` /
      `frame-portrait`, `attrs.flags`, `rejectBodyImages`,
      `proseClass`, `--ar` on the wrapper; `sizing` per shape. Tests
      per plan.md's strategy, each shown to fail with its rule broken.
      _Verify: vitest — the new cases green and mutation-checked; 173
      existing tests green; build green._
- [ ] **T502** — The CSS: the tokens (`--hold-margin`, `--pause-scale`,
      `--pause-stretch`); `.piece-held` (grid, breakout, side, bleed,
      sticky figure sized from `--ar` and the hold height, the prose
      column with no trailing air, margins not padding); the
      orientation and phone collapses to a static figure;
      `.piece-pause` (the scene's height, the centred sticky frame,
      the approach); the lights on `html[data-pause-active]` for
      ground, prose, headings, captions, mats; the header rule on
      `html[data-scene-active]`; reduced motion. _Verify: build green;
      a temporary piece with one of each block renders the expected
      classes and computed styles in the browser (sticky, top, the
      figure's max-width from `--ar`), then is removed._
- [ ] **T503** — The script on the piece page: pauses' progress into
      `--pause-t` and `--pause-lights`, holds' parked state,
      `data-pause-active` / `data-scene-active`, static frames skipped,
      init on `astro:page-load`. _Verify: on the temporary piece,
      dispatching scroll events by hand at points through a pause
      gives lights 0 → 1 → 0 and the attributes; a parked hold sets
      `data-scene-active`; a collapsed (static) hold does not; build
      green._
- [ ] **T504** — Fixtures: the sampler's held left, held right with
      bleed, and pause, with sample prose marked as such; the fog
      piece's ridgeline `wide` → `held` right with the two following
      paragraphs as its body, and its panorama `strip` → `pause` with
      the caption line as the paragraph after. _Verify: build green
      with the post-build barriers; the fog piece's images, sidecar,
      and galleries unchanged (same ids, same pages); 173+ tests
      green._
- [ ] **T505** — Geometry pass at three viewports (1440×900, 1080×1920,
      375×812) on the sampler and the fog piece, measured as on the
      exploration: each hold's frame at its resting place and share of
      the height, release when the prose's bottom meets the frame's,
      no hold where no column fits; the pause's arrival distance, park
      at the centre, lights and words 0 → 1 → 0, the approach with the
      margin surviving it, the header away and back; the 003 and 006
      geometry checks re-run. _Verify: the measurements recorded here;
      any amendment a sub-lettered task._

## Phase 1 — Plugin and docs (reviewer after the phase)

- [ ] **T506** — Obsidian plugin: `pause: one` in the leaf list, so
      Live Preview renders a pause as its image; `held` stays raw text
      like every container. _Verify: the plugin builds; the README's
      block table says so._
- [ ] **T507** — Docs: `AUTHORING.md` (both directives, the shapes, the
      hold's honesty — write enough for the frame or don't hold it —
      the pause's nothing-to-read rule, no hold where no column fits);
      `README.md`'s block table gains both rows; `DECISIONS.md` records
      the exploration's decisions (words beside, never over or under;
      script-driven pause; frames sized by ratio, not `sizes`; margins
      not padding; orientation rules). _Verify: Prettier clean; the
      examples in AUTHORING.md build when pasted into a temporary
      piece (reverted)._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T508** — Delete `src/pages/held-demo.astro` and the exploration
      branch `explore/held-block`; update `ROADMAP.md` (the held image
      shipped; follow-ups it surfaced); request the pre-merge
      whole-spec sweep and resolve its findings; build, tests, check,
      GPS scan, and format all green — actual output reported; mark
      the PR ready and merge with a merge commit. _Verify: no
      `/held-demo/` route in the build; the branch is gone from the
      remote; ROADMAP no longer lists the held image as future; the
      sweep came back clean or its findings were resolved; main green
      after the merge._

---

## Handoff note

> Read `CLAUDE.md` and `specs/007-held-image/{spec,plan,tasks}.md`,
> then begin at T501. Involvement level is product owner. For Phase 0,
> have the skeptical-reviewer review after each task, scoped to that
> task's diff, the plan section it implements, and the acceptance
> criteria it serves. From Phase 1 onward, review after each phase
> instead. Pause for the person after each phase, and whenever
> something unexpected bears on spec adherence.

Every pause produces a report in this shape, in this order. The person
may not be technical, and the report exists so they can act, not so
the work is documented:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only. Technical
   detail lives in plan.md and the commit log for anyone who wants it;
   it doesn't lead the report.
