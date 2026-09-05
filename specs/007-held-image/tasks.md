# Tasks: The Held Image and the Pause

**Status**: Signed off (skeptical-reviewer, 2026-09-03, sixth pass) —
awaiting the product owner's approval of the spec-conformance summary
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
so the first pause — the spec's "visual gate" — has something to
scroll.

Task ids: 007 = T5xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T5xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: transform, passage, fixtures, CSS, script (reviewer after each task; the person's visual gate at its end)

- [x] **T501** — The transform: `held` (container, body prose, split
      structure, `src` `alt` `side=left|right` and the `bleed` flag,
      `piece-held-prose`) and `pause` (leaf, one image, `piece-pause`
      with a `piece-pause-frame`); the descriptor generalizations —
      `rawAr`, `classes(attrs, ratios)` with `frame-landscape` /
      `frame-portrait`, `attrs.flags`, `rejectBodyImages`,
      `proseClass`, `probeAsker`, `--ar` on the wrapper; `BLOCKS`
      exported (T502's agreement test consumes it); `probeRatios` becomes
      `probeDimensions` (orientation-corrected width and height, the
      ratios derived at the call site, dims as `sizing`'s fourth
      argument) with messages naming the block; `sizing` per shape
      (the pause's from its raw pixel dimensions and ratio); the
      descriptor-model header comment updated to the four-argument
      `sizing` (`needsRatios` and `emitsAr` keep their names —
      deliberately, they still describe what a block asks for); `tests/fixtures/square.jpg` from the generator. Tests
      per plan.md's strategy, each shown to fail with its rule broken.
      _Verify: vitest — the new cases green (`--ar: 1.6` for photo.jpg,
      `frame-landscape` for the square, the pause's `sizes` exactly
      `(min-aspect-ratio: 8/5) calc(152.39vh - 15.23vmin), calc(95.24vw - 9.52vmin)`
      on photo.jpg (literally 8 × 5 pixels; the margin is vmin, so the
      hint is a calc — T504 review), every allowed
      combination and every must-fail case) and mutation-checked; 173 existing tests
      green; build green._
- [x] **T502** — The passage by body kind: `BLOCK_BODIES` exported from
      `image-meta.mjs`, `BLOCKS` exported from the transform, a test that
      the two agree (names, and `body ?? 'none'` per descriptor), `passageFor` taking a caption from
      `caption` and `images+caption` bodies only. _Verify: vitest — the
      agreement test fails when a descriptor's body or the map is
      changed (report once, restore); the existing caption cases stay green untouched (`wide` and
      `diptych` for `caption`, `strip` for `images+caption`) and a `grid`
      case joins them; passage cases for `row`, `aside`, `held`
      (prose before, no caption) and a `pause` leaf, beside the
      existing caption cases; 173+ green; build green._
- [x] **T503** — Fixtures: the sampler's held left, held right with
      bleed, and pause, with sample prose marked as such and, around the
      pause, a paragraph with an inline link and a heading (the lights
      list's check); the fog
      piece's ridgeline `wide` → `held` right with a new body of five
      fixture paragraphs absorbing the wide's caption line — enough to
      outlast the frame at the laptop viewport (the
      diptych and its introducing paragraph stay where they are), and its panorama `strip` → `pause` with
      its alt kept verbatim ("The full sweep of coastline after the
      fog cleared" — it is the image page's title) and a new paragraph
      after it, in addition to the existing "By ten the light…"
      paragraph (not the strip's "Drag sideways" line, which is false
      of a pause). _Verify: build green with the post-build barriers; the
      fog piece's image ids, pages, sidecar title, and galleries
      unchanged; `land-b`'s passage is its preceding paragraph alone
      and `pano`'s the paragraph before the pause (the T405-style dump,
      deleted); 173+ tests
      green (the fog's hold is measured at T504, once the CSS exists)._
- [x] **T504** — The CSS: the tokens (`--hold-margin`, `--pause-scale`,
      `--pause-stretch`); `.piece-held` (grid, breakout, side, bleed,
      sticky figure sized from `--ar` and the hold height, the prose
      column with no trailing air, margins not padding); the
      orientation and phone collapses to a static figure;
      `.piece-pause` (the scene's height, the centred sticky frame,
      the approach); the mats for both; the lights on
      `html[data-pause-active]`, each rule mixing from its element's
      own token; the header rule on `html[data-scene-active]`; reduced
      motion. _Verify: build green; on the sampler in the browser the
      held figure's viewport `top` measured at three real scroll
      offsets stays at `--hold-margin` while the prose passes and
      travels away at the scene's end (not merely `position: sticky`
      in computed style); the figure's max-width follows `--ar`; the fog's held frame
      confirmed to hold at 1440×900 — its five paragraphs outlast the
      frame; both new blocks matted; with `--pause-lights` forced to 0 and
      `data-pause-active` set by hand, every mixed element computes to
      its unmixed colour — compared by parsed colour components against
      a control element carrying the raw token, since `color-mix()` at
      0% serializes in the mix space; the matte comment's block list
      updated; the transform's held `sizes` assumptions (a 58% frame
      column at content width, 670px at 1160px — the exploration's
      grid) measured against the grid as drawn and corrected if wrong,
      in the transform, its test, plan.md's sizing line, and the
      sampler's sentence about the 44-character measure together, with
      the reciprocal keep-in-step note in `global.css` — naming the
      sampler's 44-character sentence too (T501, T503 reviews);
      the sampler's two holds measured too — its prose calls five and
      eight paragraphs the calibration, and the prose changes if the
      measurement disagrees (T503 review). Record: the lights were
      compared by serialized colour, not parsed components — the mix
      at 0% serialized as the token's own oklch string, an exact match
      (T504 review, deviation noted)._
- [x] **T505** — The script on the piece page: pauses' progress into
      `--pause-t` and `--pause-lights`, holds' parked state,
      `data-pause-active` / `data-scene-active`, static frames skipped,
      `will-change: transform` set on a pause's frame only while it is
      active (T504 review), init on `astro:page-load`. _Verify: on the sampler,
      `window.scrollTo` to computed offsets through the pause (before
      the pin, 14%, 28%, 50%, 86%, 100%, after) gives `--pause-lights`
      0 → 0.5 → 1 → 1 → 0.5 → 0 → 0 and the two attributes on and off
      accordingly; a parked hold sets `data-scene-active`; a collapsed
      (static) hold does not; `astro check` clean; build green.
      Record: `astro check` reported two hints, both unused `attrs`
      parameters in the transform (the pause's, from T501, and the
      strip's, pre-existing) — both renamed `_attrs`, check clean; the
      arithmetic was verified with scroll events dispatched by hand
      (the pane is hidden and never ticks a real scroll), so the scroll
      binding itself is exercised by the person at the visual gate
      (T505 review)._
- [x] **T505a** — `shape` extracted to `src/lib/pause-shape.ts` with a
      unit test (`pause-shape.test.mjs`): the ends, the held middle,
      half-way at half a ramp, smooth not linear, monotone on each
      ramp — from the T505 review; the plan's testing strategy records
      it. _Verify: vitest green; a `RAMP` or curve change fails it._
- [ ] **T506** — Geometry pass at three viewports (1440×900, 1080×1920,
      375×812) on the sampler and the fog piece, judged against the
      spec's rules (not the exploration's numbers — the hold margin
      changed): each hold's frame at its resting place and share of
      the height, release when the prose's bottom meets the frame's,
      no hold where no column fits — at 1080×1920 the fog's side-right
      landscape hold with its figure before its prose, named (T504
      review); the pause's arrival distance, park
      at the centre, lights 0 → 1 → 0 with the words — the paragraph,
      its inline link, and the heading beside the sampler's pause —
      following (a link inherits its paragraph's colour), the approach with the
      margin surviving it, the header away and back; the footer's
      links and the page head looked at during a pause, not assumed
      (T504 review); the header's focus-reveal overridden during a
      scene, looked at (T505 review); reduced motion
      emulated (approach off, dim on); the 003 and 006 geometry checks
      re-run. _Verify: the measurements recorded here; any amendment a
      sub-lettered task. This phase's end is the person's visual gate._

## Phase 1 — Plugin and docs (reviewer after the phase)

- [ ] **T507** — Obsidian plugin: `pause: one` in the leaf list, so
      Live Preview renders a pause as its image; `held` stays raw text
      like every container (`main.js` is gitignored — the author's
      local build). _Verify: `npm run build` in `obsidian-plugin/`
      succeeds; the README's block table and AUTHORING's raw-text list
      say so._
- [ ] **T508** — Docs: `AUTHORING.md` (both directives, the shapes, the
      hold's honesty — write enough for the frame or don't hold it —
      the pause's nothing-to-read rule, no hold where no column fits,
      `held` in the Obsidian raw-text list, and in "Hard-won syntax
      rules" that `bleed` is a flag on `held` and an enum on `wide`;
      a story is prose — no holds or pauses in a sidecar; the image
      page's passage quotes a caption from caption-bodied blocks only —
      a `held`, `row`, or `aside` body never appears there, T502
      review; the sampler's site-absolute link after its pause is the
      one exception to the vault-relative practice, written so because
      the rewrite doesn't exist yet, T503 review);
      `README.md`'s block table gains both rows; `DECISIONS.md` records
      the exploration's decisions (words beside, never over or under;
      script-driven pause; frames sized by ratio, not `sizes`; margins
      not padding; orientation rules; the passage by body kind).
      _Verify: Prettier clean; the examples in AUTHORING.md build when
      pasted into a temporary piece (reverted)._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T509** — Delete `src/pages/held-demo.astro` and the exploration
      branch `explore/held-block`; update `ROADMAP.md` (the held image
      shipped with the shapes as they are — it still lists "below" and
      a scroll-driven pause; follow-ups it surfaced; `CLAUDE.md`'s
      closed-vocabulary list was amended at T501, in its own commit;
      the fog-frames gallery's description still says "spec-003 demo
      piece" — the same spec-number leak the sampler lost at T503);
      request the
      pre-merge whole-spec sweep and resolve its findings; build,
      tests, check, GPS scan, and format all green — actual output
      reported; mark the PR ready and merge with a merge commit.
      _Verify: no `/held-demo/` route in the build; the branch is gone
      from the remote; ROADMAP matches the spec; the sweep came back
      clean or its findings were resolved; main green after the
      merge._

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
